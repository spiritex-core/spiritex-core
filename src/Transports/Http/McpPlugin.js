'use strict';

const EXPRESS = require( 'express' );

const VANILLA_MCP_SERVER_FACTORY = require( './VanillaMcpServer' );


module.exports = function ( Server, Service, Logger )
{
	if ( !Server.Config.Transports.Http.McpPlugin ) { return null; }
	if ( !Server.Config.Transports.Http.McpPlugin.endpoint_path ) { return null; }


	var Plugin = {
		mcp_server: null,
		Startup: null,
		Shutdown: null,
		GetMcpServer: null,
		MountAllEndpoints: null,
		NewRequestHandler: null,
	};


	//---------------------------------------------------------------------
	Plugin.Startup =
		async function Startup()
		{
			Plugin.mcp_server = Plugin.GetMcpServer();
			if ( Plugin.mcp_server )
			{
				Logger.trace( 'Mcp server startup complete.' );
			}
			return;
		};


	//---------------------------------------------------------------------
	Plugin.Shutdown =
		async function Shutdown()
		{
			if ( Plugin.mcp_server )
			{
				// await Plugin.mcp_server.close();
				Plugin.mcp_server = null;
				Logger.trace( 'Mcp server shutdown complete.' );
			}
			return;
		};


	//---------------------------------------------------------------------
	function new_tool_handler( service_name, command_name, command_schema )
	{
		return async function invoke_tool( invocation_arguments )
		{
			var param_names = Object.keys( command_schema.Arguments.properties || {} );
			var ordered_args = param_names.map( name => invocation_arguments[ name ] );
			var api_result = await Server.ServiceClient[ service_name ][ command_name ]( ...ordered_args );
			return {
				content: [
					// { type: 'text', text: JSON.stringify( api_result ) },
					{ type: 'json', text: api_result },
				],
			};
		};
	}


	//---------------------------------------------------------------------
	Plugin.GetMcpServer =
		function GetMcpServer()
		{
			// Create an MCP server
			var mcp_server = new VANILLA_MCP_SERVER_FACTORY( Server, Service, Logger );

			// Iterate through all services in the schema
			for ( const service_name in Server.Schema )
			{
				const service_schema = Server.Schema[ service_name ];

				// Process each command in the service (skip special keys)
				for ( const command_name in service_schema )
				{
					if ( command_name.startsWith( '$' ) ) continue;

					const command_schema = service_schema[ command_name ];
					/*
						// Example command schema:
						ServerInfo: {
							description: 'Gets server info.',
							groups: [],
							Arguments: {
								type: 'object',
								properties: {},
								required: [],
							},
							Returns: {
								type: 'object',
								$Object: 'DiagnosticServerInfo',
							},
						},
					*/

					var requires_authentication = ( Array.isArray( command_schema.groups ) && ( command_schema.groups.length > 0 ) );

					var input_schema = { type: "object", properties: {}, };
					if ( command_schema.Arguments ) 
					{
						input_schema = JSON.parse( JSON.stringify( command_schema.Arguments ) );
					}
					// input_schema.additionalProperties = false;

					// Register the command
					mcp_server.RegisterTool(
						`${service_name}-${command_name}`,
						{
							title: `${service_name} ${command_name} Tool`,
							description: command_schema.description || '',
							inputSchema: input_schema,
						},
						new_tool_handler( service_name, command_name, command_schema )
					);

				}
			}


			Logger.debug( `MCP Server created [${Server.Config.server_name}].` );
			return mcp_server;
		};


	//---------------------------------------------------------------------
	Plugin.MountAllEndpoints =
		function MountAllEndpoints()
		{
			Service._Control.ExpressApp[ 'post' ](
				`/${Server.Config.Transports.Http.McpPlugin.endpoint_path}`,
				EXPRESS.json( { type: '*/*' } ),
				Plugin.NewRequestHandler() );
			Logger.debug( `MCP Plugin enabled at [/${Server.Config.Transports.Http.McpPlugin.endpoint_path}].` );
			return;
		};


	//---------------------------------------------------------------------
	Plugin.NewRequestHandler =
		function NewRequestHandler()
		{
			var callback = async function ( Request, Response )
			{
				try
				{
					// Logger.debug( 'MCP raw request body:', JSON.stringify( Request.body, null, 2 ) );

					const rpc_response = await Plugin.mcp_server.HandleJsonRpcRequest( Request.body );

					// Handle notifications (no response)
					if ( rpc_response === null )
					{
						Response.status( 204 ).end();
						return;
					}

					// Logger.debug( 'MCP Sending response:', JSON.stringify( response, null, 2 ) );
					Response.json( rpc_response );
				}
				catch ( error )
				{
					Logger.error( 'MCP/HTTP handler error:', error );
					Response.status( 500 ).json( {
						jsonrpc: '2.0',
						id: null,
						error: {
							code: -32603,
							message: 'Internal server error'
						}
					} );
				}
			};
			return callback;
		};


	//---------------------------------------------------------------------
	return Plugin;
};
