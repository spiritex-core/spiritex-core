'use strict';

const AMQP = require( 'amqplib' );

const SERVICE_NAME = 'Amqp';


module.exports = function ( Server )
{
	var Logger = Server.LogManager.NewLogger( { service: SERVICE_NAME } );


	//---------------------------------------------------------------------
	var Service = {
		_Control: {
			service_name: SERVICE_NAME,
			Startup:
				async function ()
				{
					Logger.debug( `Starting ${SERVICE_NAME} transport ...` );
					await amqp_server_startup();
					Logger.debug( `${SERVICE_NAME} transport started.` );
					return;
				},
			Shutdown:
				async function ()
				{
					Logger.debug( `Shutting down ${SERVICE_NAME} transport ...` );
					await amqp_server_shutdown();
					Logger.debug( `${SERVICE_NAME} transport stopped.` );
					return;
				},
			Connection: null,
			Channel: null,
			ReplyQueue: null,
			PendingReplies: new Map(),
		},
	};


	//---------------------------------------------------------------------
	async function amqp_server_startup()
	{
		try
		{
			// Calculate the server URL
			var server_credentials = '';
			if ( Server.Config.Transports.Amqp.credentials )
			{
				if ( Server.Config.Transports.Amqp.credentials.username )
				{
					server_credentials += Server.Config.Transports.Amqp.credentials.username;
				}
				if ( Server.Config.Transports.Amqp.credentials.password )
				{
					server_credentials += `:` + Server.Config.Transports.Amqp.credentials.password;
				}
				if ( server_credentials ) { server_credentials += '@'; }
			}
			var server_address = Server.Config.Transports.Amqp.server_address;
			if ( Server.Config.Transports.Amqp.server_port )
			{
				server_address += `:${Server.Config.Transports.Amqp.server_port}`;
			}
			var server_url = `amqp://${server_credentials}${server_address}`;

			// Connect to AMQP server
			Logger.debug( `Connecting to AMQP server at [${server_address}] ...` );
			Service._Control.Connection = await AMQP.connect( server_url, Server.Config.Transports.Amqp.connect_options );

			// Create channel
			Service._Control.Channel = await Service._Control.Connection.createChannel();

			// Set up reply queue for RPC responses
			var reply_queue_result = await Service._Control.Channel.assertQueue(
				'',
				Server.Config.Transports.Amqp.reply_queue_options
			);
			Service._Control.ReplyQueue = reply_queue_result.queue;

			// Consume reply messages
			await Service._Control.Channel.consume(
				Service._Control.ReplyQueue,
				handle_reply_message,
				{ noAck: true }
			);

			Logger.info( `AMQP transport connected and listening for replies on [${Service._Control.ReplyQueue}]` );
		}
		catch ( error )
		{
			Logger.error( `Failed to start AMQP transport: ${error.message}`, error );
			throw error;
		}
		return;
	}


	//---------------------------------------------------------------------
	async function amqp_server_shutdown()
	{
		try
		{
			if ( Service._Control.Channel )
			{
				await Service._Control.Channel.close();
				Service._Control.Channel = null;
			}
			if ( Service._Control.Connection )
			{
				await Service._Control.Connection.close();
				Service._Control.Connection = null;
			}
			Service._Control.PendingReplies.clear();
		}
		catch ( error )
		{
			Logger.error( `Error during AMQP shutdown: ${error.message}`, error );
		}
		return;
	}


	//---------------------------------------------------------------------
	function handle_reply_message( message )
	{
		if ( !message ) { return; }

		var correlation_id = message.properties.correlationId;
		if ( !correlation_id ) { return; }

		var pending_reply = Service._Control.PendingReplies.get( correlation_id );
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
			Service._Control.PendingReplies.delete( correlation_id );
		}
	}


	//---------------------------------------------------------------------
	Service.NewCommandHandler =
		function NewCommandHandler( ServiceName, CommandName )
		{
			var service_schema = Server.Schema[ ServiceName ];
			var command_schema = service_schema[ CommandName ];

			var callback = async function ( message )
			{
				if ( !message ) { return; }

				try
				{
					var request_data = JSON.parse( message.content.toString() );

					var command = {
						ServiceName: ServiceName,
						ServiceSchema: service_schema,
						CommandName: CommandName,
						CommandSchema: command_schema,
						Arguments: request_data.Arguments || {},
					};

					var api_context = {
						source_address: 'amqp',
						authorization: request_data.Authorization,
						return_authorization: null,
					};

					var api_result = await Server.CommandHandler.ProcessCommand( command, api_context );

					if ( api_context.return_authorization )
					{
						api_result.return_authorization = api_context.return_authorization;
					}

					// Send reply if replyTo is specified
					if ( message.properties.replyTo && message.properties.correlationId )
					{
						var reply_content = Buffer.from( JSON.stringify( api_result ) );
						await Service._Control.Channel.sendToQueue(
							message.properties.replyTo,
							reply_content,
							{ correlationId: message.properties.correlationId }
						);
					}

					// Acknowledge the message
					Service._Control.Channel.ack( message );
				}
				catch ( error )
				{
					Logger.error( `Error processing AMQP command [${ServiceName}.${CommandName}]: ${error.message}`, error );

					// Send error reply if replyTo is specified
					if ( message.properties.replyTo && message.properties.correlationId )
					{
						var error_result = {
							ok: false,
							error: error.message,
							network: Server.Config.network_name,
							timestamp: new Date().toISOString(),
							service: ServiceName,
							command: CommandName,
						};
						var reply_content = Buffer.from( JSON.stringify( error_result ) );
						await Service._Control.Channel.sendToQueue(
							message.properties.replyTo,
							reply_content,
							{ correlationId: message.properties.correlationId }
						);
					}

					// Acknowledge the message even on error to prevent redelivery
					Service._Control.Channel.ack( message );
				}
			};

			return callback;
		};


	//---------------------------------------------------------------------
	Service.MountAllEndpoints =
		async function MountAllEndpoints()
		{
			for ( var service_name in Server.Schema )
			{
				Logger.debug( `Installing AMQP endpoints for the [${service_name}] service.` );
				var service_schema = Server.Schema[ service_name ];
				for ( var command_name in service_schema )
				{
					// Create queue for this command
					var queue_name = `${service_name}.${command_name}`;
					await Service._Control.Channel.assertQueue(
						queue_name,
						Server.Config.Transports.Amqp.command_queue_options
					);

					// Set up consumer for this command
					var command_handler = Service.NewCommandHandler( service_name, command_name );
					await Service._Control.Channel.consume(
						queue_name,
						command_handler,
						{ noAck: false }
					);

					Logger.debug( `AMQP endpoint [${queue_name}] is ready.` );
				}
			}
			return;
		};


	//---------------------------------------------------------------------
	Service.InvokeEndpoint =
		async function InvokeEndpoint( ServiceName, CommandName, Arguments, Authorization )
		{
			return new Promise( ( resolve, reject ) =>
			{
				try
				{
					// Generate unique correlation ID
					var correlation_id = `${Date.now()}-${Math.random().toString( 36 ).substring( 2, 11 )}`;

					// Store the promise resolver
					Service._Control.PendingReplies.set( correlation_id, { resolve, reject } );

					// Prepare the message
					var request_data = {
						Arguments: Arguments,
						Authorization: Authorization,
					};
					var message_content = Buffer.from( JSON.stringify( request_data ) );

					// Send the message
					var queue_name = `${ServiceName}.${CommandName}`;
					Service._Control.Channel.sendToQueue(
						queue_name,
						message_content,
						{
							replyTo: Service._Control.ReplyQueue,
							correlationId: correlation_id,
						}
					);

					// Set timeout for the request
					setTimeout( () =>
					{
						if ( Service._Control.PendingReplies.has( correlation_id ) )
						{
							Service._Control.PendingReplies.delete( correlation_id );
							reject( new Error( `AMQP request timeout for [${ServiceName}.${CommandName}]` ) );
						}
					}, 30000 ); // 30 second timeout
				}
				catch ( error )
				{
					reject( error );
				}
			} );
		};


	//---------------------------------------------------------------------
	return Service;
};

