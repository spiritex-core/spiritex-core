'use strict';

const JSON_WEB_TOKEN = require( 'jsonwebtoken' );
const JWT_OPTIONS = { algorithm: 'HS256' };

const Utilities = require( './Utilities' );


module.exports = function ( Server )
{
	var Logger = Server.LogManager.NewLogger( { service: 'Command' } );

	var Service = {};


	//---------------------------------------------------------------------
	Service.ProcessCommand =
		async function ProcessCommand( Command, ApiContext )
		{
			if ( !Command ) { throw new Error( `Missing the required parameter [Command].` ); }
			if ( !ApiContext ) { throw new Error( `Missing the required parameter [ApiContext].` ); }

			var start_time = new Date();
			var api_result = {
				network: Server.Config.network_name,
				timestamp: start_time.toISOString(),
				processing_ms: 0,
				source_address: ApiContext.source_address,
				service: Command.ServiceName,
				command: Command.CommandName,
				authenticated: false,
				token_status: null,
				user_status: null,
				session_status: null,
			};
			// Logger.debug( `Processing [${Command.ServiceName}.${Command.CommandName}] ...` );

			//---------------------------------------------------------------------
			function return_api_result( result, return_authorization )
			{
				api_result.ok = true;
				api_result.result = result;
				api_result.processing_ms = ( new Date() ) - start_time;
				if ( return_authorization ) { api_result.return_authorization = return_authorization; }
				Logger.info( `Completed [${Command.ServiceName}.${Command.CommandName}] in ${api_result.processing_ms} ms. Status: [OK]` );
				return api_result;
			}
			function return_api_fail( error )
			{
				api_result.ok = false;
				api_result.error = error;
				api_result.processing_ms = ( new Date() ) - start_time;
				Logger.info( `Completed [${Command.ServiceName}.${Command.CommandName}] in ${api_result.processing_ms} ms. Status: [${api_result.error}]` );
				return api_result;
			}

			//---------------------------------------------------------------------
			// Get the authentication.
			//---------------------------------------------------------------------

			// var authentication =
			// {
			// 	session_token: null,
			// 	User: null,
			// 	Session: null,
			// };
			try
			{
				// Authenticate requester.
				var authorization_info = null;
				if ( ApiContext.authorization )
				{
					var timestamp_ms = ( new Date() ).getTime();
					authorization_info = JSON_WEB_TOKEN.decode( ApiContext.authorization, Server.Config.Network.network_key, JWT_OPTIONS );
					if ( !authorization_info ) 
					{
						api_result.token_status = 'invalid';
						return return_api_fail( 'Malformed network token, unable to decode.' );
					}
					if ( !authorization_info.Payload || !authorization_info.Payload.User || !authorization_info.Payload.Session )
					{
						api_result.token_status = 'invalid';
						return return_api_fail( 'Invalid network token, payload is incomplete.' );
					}
					ApiContext.User = authorization_info.Payload.User;
					ApiContext.Session = authorization_info.Payload.Session;
				}

				// Check for privileged access.
				if ( Command.CommandSchema.groups && Command.CommandSchema.groups.length ) 
				{

					// Check Authentication.
					if ( !ApiContext.User ) { return return_api_fail( 'Unauthenticated' ); }
					// - Validate user status.
					api_result.user_status = 'ok';
					if ( ApiContext.User.locked_at ) 
					{
						api_result.user_status = 'locked';
					}
					// - Validate session status.
					api_result.session_status = 'ok';
					if ( ApiContext.Session.closed_at ) 
					{
						api_result.session_status = 'closed';
					}
					var session_expires_at_ms = ( new Date( ApiContext.Session.expires_at ) ).getTime();
					var session_abandon_at_ms = ( new Date( ApiContext.Session.abandon_at ) ).getTime();
					if ( timestamp_ms >= session_expires_at_ms ) 
					{
						api_result.session_status = 'expired';
					}
					if ( timestamp_ms >= session_abandon_at_ms )
					{
						api_result.session_status = 'abandoned';
					}
					if ( ApiContext.Session.locked_at ) 
					{
						api_result.session_status = 'locked';
					}
					// - Validate token status.
					api_result.token_status = 'ok';
					var timestamp_seconds = Math.floor( timestamp_ms / 1000 );
					if ( timestamp_seconds >= authorization_info.exp ) 
					{
						api_result.token_status = 'expired';
					}
					if ( timestamp_seconds >= authorization_info.aat ) 
					{
						api_result.token_status = 'abandoned';
					}

					// Return 'Unauthenticated' if any of the statuses are not 'ok'.
					if ( ( api_result.token_status !== 'ok' )
						|| ( api_result.user_status !== 'ok' )
						|| ( api_result.session_status !== 'ok' ) )
					{
						return return_api_fail( 'Unauthenticated' );
					}
					api_result.authenticated = true;

					// Check Authorization.
					if ( Command.CommandSchema.groups.includes( 'network' )
						|| Command.CommandSchema.groups.includes( 'service' )
						|| Command.CommandSchema.groups.includes( 'user' ) ) 
					{
						var user_groups = ApiContext.User.groups.split( '|' );

						// Authorize User Type
						if ( Command.CommandSchema.groups.includes( 'user' ) )
						{
							if ( !user_groups.includes( 'network' )
								&& !user_groups.includes( 'service' )
								&& !user_groups.includes( 'user' ) )
							{
								return return_api_fail( 'Unauthorized, insufficient user access (requires at least [user]).' );
							}
						}
						else if ( Command.CommandSchema.groups.includes( 'service' ) )
						{
							if ( !user_groups.includes( 'network' )
								&& !user_groups.includes( 'service' ) )
							{
								return return_api_fail( 'Unauthorized, insufficient user access (requires at least [service]).' );
							}
						}
						else if ( Command.CommandSchema.groups.includes( 'network' ) )
						{
							if ( !user_groups.includes( 'network' ) )
							{
								return return_api_fail( 'Unauthorized, insufficient user access (requires at least [network]).' );
							}
						}

						// Authorize User Role
						if ( Command.CommandSchema.groups.includes( 'super' ) && !user_groups.includes( 'super' ) )
						{
							return return_api_fail( 'Unauthorized, missing user role (requires [super]).' );
						}
						if ( Command.CommandSchema.groups.includes( 'admin' ) && !user_groups.includes( 'admin' ) )
						{
							return return_api_fail( 'Unauthorized, missing user role (requires [admin]).' );
						}
						if ( Command.CommandSchema.groups.includes( 'hero' ) && !user_groups.includes( 'hero' ) )
						{
							return return_api_fail( 'Unauthorized, missing user role (requires [hero]).' );
						}

					}
				}

			}
			catch ( error )
			{
				var message = `Authentication error: ${error.message}`;
				Logger.error( message, error );
				return return_api_fail( message );
			}

			//---------------------------------------------------------------------
			// Prepare for the invocation.
			//---------------------------------------------------------------------

			try
			{
				// Get Command Arguments.
				var invocation_arguments = {};
				for ( var argument_name in Command.CommandSchema.Arguments.properties )
				{
					var value = null;
					var value_type = typeof Command.Arguments[ argument_name ];
					if ( value_type !== 'undefined' ) 
					{
						value = Command.Arguments[ argument_name ];
					}
					var argument_type = Command.CommandSchema.Arguments.properties[ argument_name ].type;
					if ( argument_type === 'object' ) 
					{
						if ( typeof value !== 'object' )
						{
							value = JSON.parse( value );
						}
					}
					invocation_arguments[ argument_name ] = value;
				}
			}
			catch ( error )
			{
				var message = `Preprocessing error: ${error.message}`;
				Logger.error( message, error );
				return return_api_fail( message );
			}


			//---------------------------------------------------------------------
			// Invoke Command.
			try
			{
				// var api_context = {
				// 	Request: request,
				// 	Response: response,
				// 	User: authentication.User,
				// 	Session: authentication.Session,
				// 	session_token: authentication.session_token,
				// };
				// ApiContext.session_token = authentication.session_token;
				// ApiContext.User = authentication.User;
				// ApiContext.Session = authentication.Session;

				var service = Server.Services[ Command.ServiceName ];
				if ( !service ) { return return_api_fail( `Service not found [${Command.ServiceName}].` ); }
				var command = service[ Command.CommandName ];
				if ( !command ) { return return_api_fail( `Command [${Command.CommandName}] not found in service [${Command.ServiceName}].` ); }
				var result = await command( ...Object.values( invocation_arguments ), ApiContext );
				if ( invocation_arguments.password ) { invocation_arguments.password = '**********'; }
				if ( invocation_arguments.Password ) { invocation_arguments.Password = '**********'; }
				if ( invocation_arguments.secret ) { invocation_arguments.secret = '**********'; }
				if ( invocation_arguments.Secret ) { invocation_arguments.Secret = '**********'; }
				return return_api_result( result, ApiContext.return_authorization );
			}
			catch ( error )
			{
				try
				{
					if ( Server.ServiceClient
						&& Server.ServiceClient.Notify
						&& Server.ServiceClient.Notify.Notify
					) 
					{
						Server.ServiceClient.Notify.Notify( { event_type: 'Network.Error', event_data: { message: error.message } } );
					}
				}
				catch ( ignored_error ) { /* ignore */ }
				Logger.error( error.message, error );
				return return_api_fail( error.message );
			}


			return; // unreachable
		};


	return Service;
}

