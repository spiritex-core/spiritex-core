'use strict';


module.exports = {


	//=====================================================================
	//=====================================================================
	//
	//  ███████ ███████ ██████  ██    ██ ██  ██████ ███████ ███████ 
	//  ██      ██      ██   ██ ██    ██ ██ ██      ██      ██      
	//  ███████ █████   ██████  ██    ██ ██ ██      █████   ███████ 
	//       ██ ██      ██   ██  ██  ██  ██ ██      ██           ██ 
	//  ███████ ███████ ██   ██   ████   ██  ██████ ███████ ███████ 
	//
	//=====================================================================
	//=====================================================================


	//---------------------------------------------------------------------
	InitializeServices: async function ( Server )
	{
		for ( var service_name in Server.Services )
		{
			var service = Server.Services[ service_name ];
			if ( Server.Config.Services[ service_name ].enabled
				&& service._ && service._.Initialize )
			{
				Server.Logger.debug( `Initializing the [${service_name}] service.` );
				await service._.Initialize();
			}
		}
		return;
	},


	//---------------------------------------------------------------------
	StartupServices: async function ( Server )
	{
		for ( var service_name in Server.Services )
		{
			var service = Server.Services[ service_name ];
			if ( Server.Config.Services[ service_name ].enabled
				&& service._ && service._.Startup )
			{
				Server.Logger.debug( `Starting the [${service_name}] service.` );
				await service._.Startup();
			}
		}
		return;
	},


	//---------------------------------------------------------------------
	ShutdownServices: async function ( Server )
	{
		for ( var service_name in Server.Services )
		{
			var service = Server.Services[ service_name ];
			if ( Server.Config.Services[ service_name ].enabled
				&& service._ && service._.Shutdown )
			{
				Server.Logger.debug( `Stopping the [${service_name}] service.` );
				await service._.Shutdown();
			}
		}
		return;
	},


	//=====================================================================
	//=====================================================================
	//
	//  ████████ ██████   █████  ███    ██ ███████ ██████   ██████  ██████  ████████ ███████ 
	//     ██    ██   ██ ██   ██ ████   ██ ██      ██   ██ ██    ██ ██   ██    ██    ██      
	//     ██    ██████  ███████ ██ ██  ██ ███████ ██████  ██    ██ ██████     ██    ███████ 
	//     ██    ██   ██ ██   ██ ██  ██ ██      ██ ██      ██    ██ ██   ██    ██         ██ 
	//     ██    ██   ██ ██   ██ ██   ████ ███████ ██       ██████  ██   ██    ██    ███████ 
	//
	//=====================================================================
	//=====================================================================


	//---------------------------------------------------------------------
	StartupTransports: async function ( Server )
	{
		for ( var transport_name in Server.Transports )
		{
			var transport = Server.Transports[ transport_name ];
			if ( Server.Config.Transports[ transport_name ].enabled
				&& transport._Control && transport._Control.Startup )
			{
				Server.Logger.debug( `Starting the [${transport_name}] transport.` );
				await transport._Control.Startup();
			}
		}
		return;
	},


	//---------------------------------------------------------------------
	ShutdownTransports: async function ( Server )
	{
		for ( var transport_name in Server.Transports )
		{
			var transport = Server.Transports[ transport_name ];
			if ( Server.Config.Transports[ transport_name ].enabled
				&& transport._Control && transport._Control.Shutdown )
			{
				Server.Logger.debug( `Stopping the [${transport_name}] transport.` );
				await transport._Control.Shutdown();
			}
		}
		return;
	},


};
