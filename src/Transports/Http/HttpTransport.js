'use strict';

const EXPRESS = require( 'express' );
const CORS = require( 'cors' );
const HTTP = require( 'http' );
const HTTPS = require( 'https' );

const MCP_PLUGIN = require( './McpPlugin.js' );

const SERVICE_NAME = 'Http';


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
					await http_server_startup();
					Logger.debug( `${SERVICE_NAME} transport started.` );
					return;
				},
			Shutdown:
				async function ()
				{
					Logger.debug( `Shutting down ${SERVICE_NAME} transport ...` );
					await http_server_shutdown();
					Logger.debug( `${SERVICE_NAME} transport stopped.` );
					return;
				},
			ExpressApp: EXPRESS(),
			HttpServer: null,
			listen_address: null,
			public_address: null,
			McpPlugin: null,
		},
	};


	//---------------------------------------------------------------------
	async function http_server_startup()
	{
		// Initialize CORS.
		if ( Server.Config.Transports.Http.cors_origin )
		{
			var cors_options = {};
			cors_options = {
				// origin: '*',
				origin: Server.Config.Transports.Http.cors_origin,
				methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
				allowedHeaders: [ 'Content-Type', 'authorization' ],
				exposedHeaders: [ 'authorization' ],
				// preflightContinue: false,
				credentials: true,           //access-control-allow-credentials:true
				optionsSuccessStatus: 200,   // some legacy browsers (IE11, various SmartTVs) choke on 204
			};
			Logger.debug( `Using CORS Origins:`, JSON.stringify( Server.Config.Transports.Http.cors_origin ) );
			// Logger.debug( `CORS enabled.` );
		}
		else
		{
			Logger.debug( `Using Unrestricted CORS Origins.` );
		}
		Service._Control.ExpressApp.use( CORS( cors_options ) );

		// Trust the proxy.
		if ( Server.Config.Transports.Http.trust_proxy )
		{
			Service._Control.ExpressApp.set( 'trust proxy', true );
			Logger.debug( `Trust proxy enabled.` );
		}
		else
		{
			Logger.debug( `Trust proxy disabled.` );
		}

		// Set maximum request size.
		let max_request_size = Server.Config.Transports.Http.max_request_size || '10mb';
		Service._Control.ExpressApp.use( EXPRESS.json( { limit: max_request_size } ) );
		Service._Control.ExpressApp.use( EXPRESS.urlencoded( { limit: max_request_size, extended: true } ) );
		Logger.debug( `Maximum request size set to [${max_request_size}].` );

		// Create the server.
		Logger.debug( `Starting ${Server.Config.Transports.Http.server_protocol} server ...` );
		if ( Server.Config.Transports.Http.server_protocol === 'http' )
		{
			Service._Control.HttpServer = HTTP.createServer( Service._Control.ExpressApp );
		}
		else if ( Server.Config.Transports.Http.server_protocol === 'https' )
		{
			Service._Control.HttpServer = HTTPS.createServer( Service._Control.ExpressApp );
		}
		else
		{
			throw new Error( `Invalid server protocol: [${Server.Config.Transports.Http.server_protocol}]` );
		}

		// Set the server timeouts.
		Service._Control.HttpServer.timeout = Server.Config.Transports.Http.server_timeout;
		Service._Control.HttpServer.keepAliveTimeout = Server.Config.Transports.Http.server_timeout;

		// Start listening.
		var result = await Service._Control.HttpServer.listen(
			Server.Config.Transports.Http.listen_port,
			Server.Config.Transports.Http.listen_address );

		// Attach the logger to the express app.
		if ( Server.Config.Logger.attach_to_express )
		{
			Server.LogManager.AttachToExpressApp( Service._Control.ExpressApp );
		}

		Service._Control.listen_address = `${Server.Config.Transports.Http.server_protocol}://${Server.Config.server_address}:${Server.Config.Transports.Http.listen_port}`;
		Service._Control.public_address = `${Server.Config.Transports.Http.server_protocol}://${await Server.Utilities.PublicIP()}:${Server.Config.Transports.Http.listen_port}`;

		// MCP
		Service._Control.McpPlugin = MCP_PLUGIN( Server, Service, Logger );
		if ( Service._Control.McpPlugin )
		{
			await Service._Control.McpPlugin.Startup();
		}

		Logger.info( `Http server is listening at [${Service._Control.listen_address}]` );
		Logger.info( `Public facing address is [${Service._Control.public_address}]` );
		return;
	}


	//---------------------------------------------------------------------
	async function http_server_shutdown()
	{
		if ( Service._Control.McpPlugin )
		{
			await Service._Control.McpPlugin.Shutdown();
		}
		// Shutdown the Server.
		if ( Service._Control.HttpServer )
		{
			Logger.debug( `Shutting down http server.` );
			await Service._Control.HttpServer.close();
		}
		return;
	};


	//---------------------------------------------------------------------
	Service.NewCommandHandler =
		function NewCommandHandler( ServiceName, CommandName )
		{
			var ServiceSchema = Server.Schema[ ServiceName ];
			if ( !ServiceSchema ) { throw new Error( `Service not found [${ServiceName}].` ); }
			var CommandSchema = ServiceSchema[ CommandName ];
			if ( !CommandSchema ) { throw new Error( `Command not found [${CommandName}].` ); }

			var callback = async function ( request, response )
			{
				var command =
				{
					ServiceName: ServiceName,
					ServiceSchema: ServiceSchema,
					CommandName: CommandName,
					CommandSchema: CommandSchema,
					Arguments: {},
				};

				// Get the command arguments.
				command.Arguments = request.body || {};
				// if ( [ 'put', 'post', 'delete' ].includes( CommandSchema.http.verb ) && request.body )
				// {
				// 	command.Arguments = request.body;
				// }
				// else if ( [ 'get', 'head', 'options' ].includes( CommandSchema.http.verb ) && request.query )
				// {
				// 	command.Arguments = request.query;
				// }

				var api_context = {
					source_address: Server.Utilities.RequestIp( request ),
					authorization: request.headers.authorization,
					return_authorization: null,
				};
				if ( api_context.authorization && api_context.authorization.toLowerCase().startsWith( 'bearer ' ) ) 
				{
					api_context.authorization = api_context.authorization.substring( 7 );
				}

				var api_result = await Server.CommandHandler.ProcessCommand( command, api_context );

				if ( api_context.return_authorization )
				{
					response.setHeader( 'authorization', api_context.return_authorization );
				}

				return response.status( 200 ).json( api_result );
			};

			return callback;
		};


	//---------------------------------------------------------------------
	Service.MountAllEndpoints =
		function MountAllEndpoints()
		{
			// Services
			for ( var service_name in Server.Schema )
			{
				Logger.debug( `Installing endpoints for the [${service_name}] service.` );
				var service_schema = Server.Schema[ service_name ];
				for ( var command_name in service_schema )
				{
					var command_schema = service_schema[ command_name ];
					Service._Control.ExpressApp[ 'post' ]( `/${service_name}/${command_name}`, EXPRESS.json( { type: '*/*' } ), Service.NewCommandHandler( service_name, command_name ) );
					// if ( command_schema.http )
					// {
					// 	if ( !command_schema.http.verb ) { throw new Error( `No HTTP verb defined for command [${service_name}].[${command_name}].` ); }
					// 	if ( command_schema.http.raw )
					// 	{
					// 		Service.MountRawEndpoint( command_schema.http.verb, `/${service_name}/${command_name}`, Server.Services[ service_name ][ command_name ] );
					// 	}
					// 	else
					// 	{
					// 		Service.MountCommandEndpoint( command_schema.http.verb, service_name, command_name );
					// 	}
					// }
				}
			}

			// McpPlugin
			if ( Service._Control.McpPlugin )
			{
				Service._Control.McpPlugin.MountAllEndpoints();
			}

			return;
		};


	//---------------------------------------------------------------------
	Service.MountRawEndpoint =
		function MountRawEndpoint( Method, EndpointUrl, EndpointHandler )
		{
			Service._Control.ExpressApp[ Method ]( EndpointUrl, EXPRESS.raw( { type: '*/*' } ), EndpointHandler );
			return;
		};


	//---------------------------------------------------------------------
	Service.MountCommandEndpoint =
		function MountCommandEndpoint( Method, ServiceName, CommandName )
		{
			Service._Control.ExpressApp[ Method ]( `/${ServiceName}/${CommandName}`, EXPRESS.json( { type: '*/*' } ), Service.NewCommandHandler( ServiceName, CommandName ) );
			return;
		};


	//---------------------------------------------------------------------
	return Service;
};
