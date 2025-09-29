//---------------------------------------------------------------------
// Environment Detection and AMQP Library Loading
//---------------------------------------------------------------------

var AMQP_LIB = null;
var IS_NODE_ENV = false;
var IS_BROWSER_ENV = false;

// Detect environment and load appropriate AMQP library
if ( typeof module !== 'undefined' && module.exports )
{
	// Node.js environment
	IS_NODE_ENV = true;
	try
	{
		AMQP_LIB = require( 'amqplib' );
	}
	catch ( error )
	{
		console.warn( 'AMQP Transport: amqplib not available in Node.js environment' );
	}
}
else if ( typeof window !== 'undefined' )
{
	// Browser environment
	IS_BROWSER_ENV = true;
	// For browser, we'll use WebSocket-based AMQP or fallback to HTTP
	if ( typeof window.WebSocket !== 'undefined' )
	{
		// For browser environment, fallback to HTTP transport
		// Note: True AMQP over WebSocket would require additional setup
		console.warn( 'AMQP Transport: Browser environment detected. Consider using HTTP transport for better browser compatibility.' );

		// Provide a fallback that throws an informative error
		AMQP_LIB = {
			connect: async function ( /* url */ )
			{
				throw new Error( 'AMQP Transport: Direct AMQP connections are not supported in browser environments. Please use HTTP transport or configure AMQP over WebSocket with appropriate server setup.' );
			}
		};
	}
}

//---------------------------------------------------------------------
// AMQP Connection Management
//---------------------------------------------------------------------

var _AmqpConnection = {
	connection: null,
	channel: null,
	reply_queue: null,
	pending_replies: new Map(),
	connection_url: null,
	is_connected: false,
};

async function ensure_amqp_connection()
{
	if ( _AmqpConnection.is_connected && _AmqpConnection.connection && _AmqpConnection.channel )
	{
		return true;
	}

	if ( !AMQP_LIB )
	{
		throw new Error( 'AMQP library not available in this environment' );
	}

	try
	{
		var service_url = NetworkUrls[ context.ServiceName ];
		if ( !context.service_url ) { throw new Error( `No URL defined for service [${ServiceName}].` ); }

		// _AmqpConnection.connection_url = service_url;
		_AmqpConnection.connection = await AMQP_LIB.connect( service_url );
		_AmqpConnection.channel = await _AmqpConnection.connection.createChannel();

		// Set up reply queue
		var reply_queue_result = await _AmqpConnection.channel.assertQueue( '', {
			exclusive: true,
			durable: false,
			autoDelete: true,
		} );
		_AmqpConnection.reply_queue = reply_queue_result.queue;

		// Set up reply consumer
		await _AmqpConnection.channel.consume(
			_AmqpConnection.reply_queue,
			handle_reply_message,
			{ noAck: true }
		);

		_AmqpConnection.is_connected = true;
		return true;
	}
	catch ( error )
	{
		console.error( 'Failed to establish AMQP connection:', error.message );
		throw error;
	}
}

function handle_reply_message( message )
{
	if ( !message ) { return; }

	var correlation_id = message.properties.correlationId;
	if ( !correlation_id ) { return; }

	var pending_reply = _AmqpConnection.pending_replies.get( correlation_id );
	if ( !pending_reply ) { return; }

	try
	{
		var response = JSON.parse( message.content.toString() );
		pending_reply.resolve( response );
	}
	catch ( error )
	{
		pending_reply.reject( error );
	}
	finally
	{
		_AmqpConnection.pending_replies.delete( correlation_id );
	}
}

//---------------------------------------------------------------------
var Transport =
{

	//---------------------------------------------------------------------
	invocation_context:
		function invocation_context( ServiceName, CommandName, Parameters )
		{
			var context = {
				ServiceName: ServiceName,
				CommandName: CommandName,
				Parameters: Parameters,
			};

			context.queue_name = `${ServiceName}.${CommandName}`;
			context.request_data = {
				Arguments: Parameters,
				Authorization: null, // Will be set in authorize_context
			};

			return context;
			/*
				context = {
					ServiceName: 'Member',
					CommandName: 'NewSession',
					Parameters: { ... },
					queue_name: 'Member.NewSession',
					request_data: { Arguments: { ... }, Authorization: null },
				};
			*/
		},


	//---------------------------------------------------------------------
	authorize_context:
		async function authorize_context( InvocationContext )
		{
			if ( _Connection.session_token )
			{
				// Add authorization to the request data
				InvocationContext.request_data.Authorization = _Connection.session_token;
			}
			return InvocationContext;
		},


	//---------------------------------------------------------------------
	invoke_endpoint:
		async function invoke_endpoint( InvocationContext )
		{
			// Ensure AMQP connection is established
			await ensure_amqp_connection();

			return new Promise( async ( resolve, reject ) =>
			{
				try
				{
					// Generate unique correlation ID
					var correlation_id = `${Date.now()}-${Math.random().toString( 36 ).substring( 2, 11 )}`;

					// Store the promise resolver
					_AmqpConnection.pending_replies.set( correlation_id, { resolve, reject } );

					// Prepare the message content
					var message_content;
					if ( IS_NODE_ENV )
					{
						// Node.js environment - use Buffer
						message_content = Buffer.from( JSON.stringify( InvocationContext.request_data ) );
					}
					else
					{
						// Browser environment - use string or Uint8Array
						message_content = JSON.stringify( InvocationContext.request_data );
					}

					// Send the message
					await _AmqpConnection.channel.sendToQueue(
						InvocationContext.queue_name,
						message_content,
						{
							replyTo: _AmqpConnection.reply_queue,
							correlationId: correlation_id,
						}
					);

					// Set timeout for the request
					setTimeout( () =>
					{
						if ( _AmqpConnection.pending_replies.has( correlation_id ) )
						{
							_AmqpConnection.pending_replies.delete( correlation_id );
							reject( new Error( `AMQP request timeout for [${InvocationContext.ServiceName}.${InvocationContext.CommandName}]` ) );
						}
					}, 30000 ); // 30 second timeout
				}
				catch ( error )
				{
					// Clean up pending reply on error
					if ( correlation_id && _AmqpConnection.pending_replies.has( correlation_id ) )
					{
						_AmqpConnection.pending_replies.delete( correlation_id );
					}
					reject( error );
				}
			} );
		},

};

//---------------------------------------------------------------------
// Connection Cleanup
//---------------------------------------------------------------------

async function cleanup_amqp_connection()
{
	try
	{
		if ( _AmqpConnection.channel )
		{
			await _AmqpConnection.channel.close();
			_AmqpConnection.channel = null;
		}
		if ( _AmqpConnection.connection )
		{
			await _AmqpConnection.connection.close();
			_AmqpConnection.connection = null;
		}
		_AmqpConnection.pending_replies.clear();
		_AmqpConnection.is_connected = false;
	}
	catch ( error )
	{
		console.error( 'Error during AMQP cleanup:', error.message );
	}
}

// Cleanup on page unload (browser) or process exit (Node.js)
if ( IS_BROWSER_ENV && typeof window !== 'undefined' )
{
	window.addEventListener( 'beforeunload', cleanup_amqp_connection );
}
else if ( IS_NODE_ENV && typeof process !== 'undefined' )
{
	process.on( 'exit', cleanup_amqp_connection );
	process.on( 'SIGINT', cleanup_amqp_connection );
	process.on( 'SIGTERM', cleanup_amqp_connection );
}
