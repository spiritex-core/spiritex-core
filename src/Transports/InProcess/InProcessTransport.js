'use strict';


const SERVICE_NAME = 'InProcess';


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
					Logger.debug( `${SERVICE_NAME} transport started.` );
					return;
				},
			Shutdown:
				async function ()
				{
					Logger.debug( `Shutting down ${SERVICE_NAME} transport ...` );
					Logger.debug( `${SERVICE_NAME} transport stopped.` );
					return;
				},
			Endpoints: null,
		},
	};


	//---------------------------------------------------------------------
	Service.NewCommandHandler =
		function NewCommandHandler( ServiceName, CommandName )
		{
			var ServiceSchema = Server.Schema[ ServiceName ];
			if ( !ServiceSchema ) { throw new Error( `Service not found [${ServiceName}].` ); }
			var CommandSchema = ServiceSchema[ CommandName ];
			if ( !CommandSchema ) { throw new Error( `Command not found [${CommandName}].` ); }

			var callback = async function ( Arguments, Authorization )
			{
				var command =
				{
					ServiceName: ServiceName,
					ServiceSchema: ServiceSchema,
					CommandName: CommandName,
					CommandSchema: CommandSchema,
					Arguments: Arguments,
				};

				var api_context = {
					source_address: 'in-process',
					authorization: Authorization,
					return_authorization: null,
				};

				var api_result = await Server.CommandHandler.ProcessCommand( command, api_context );

				if ( api_context.return_authorization )
				{
					api_result.return_authorization = api_context.return_authorization;
				}

				return api_result;
			};

			return callback;
		};


	//---------------------------------------------------------------------
	Service.MountAllEndpoints =
		function MountAllEndpoints()
		{
			Service._Control.Endpoints = {};
			for ( var service_name in Server.Schema )
			{
				Logger.debug( `Installing endpoints for the [${service_name}] service.` );
				Service._Control.Endpoints[ service_name ] = {};
				var service_schema = Server.Schema[ service_name ];
				for ( var command_name in service_schema )
				{
					Service._Control.Endpoints[ service_name ][ command_name ] = Service.NewCommandHandler( service_name, command_name );
				}
			}
			return;
		};


	//---------------------------------------------------------------------
	Service.InvokeEndpoint =
		async function InvokeEndpoint( ServiceName, CommandName, Arguments, Authorization )
		{
			var service = Service._Control.Endpoints[ ServiceName ];
			if ( !service ) { throw new Error( `Service not found [${ServiceName}].` ); }
			var endpoint = Service._Control.Endpoints[ ServiceName ][ CommandName ];
			if ( !endpoint ) { throw new Error( `Endpoint not found [${ServiceName}].[${CommandName}].` ); }
			var result = await endpoint( Arguments, Authorization );
			return result;
		};


	//---------------------------------------------------------------------
	return Service;
}

