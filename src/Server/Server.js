'use strict';

const PATH = require( 'path' );
const FS = require( 'fs' );
const FS_EXTRA = require( 'fs-extra' );

const ServiceManager = require( './ServiceManager' );
// const PACKAGE = require( '../../package.json' );


module.exports = function ( ServerConfig )
{
	if ( !ServerConfig ) { throw new Error( `Missing required argument [ServerConfig].` ); }
	if ( !ServerConfig.server_name ) { throw new Error( `Missing required argument [ServerConfig.server_name].` ); }
	if ( !ServerConfig.server_version ) { throw new Error( `Missing required argument [ServerConfig.server_version].` ); }
	ServerConfig = JSON.parse( JSON.stringify( ServerConfig ) );

	//---------------------------------------------------------------------
	// The global Server object.
	//---------------------------------------------------------------------

	var Server = {
		// server_name: PACKAGE.name,
		// server_version: PACKAGE.version,
		Utilities: require( './Utilities' ),
		Config: ServerConfig,
		Folders: {
			// HostPath: null,			// The application's host path
			LoggerPath: null,		// The output path for log files
			SdkPath: null,			// The output path for sdk files
			// DataPath: null,			// The output path for data files
			ServicesPath: null,		// The application's services path
			TransportsPath: null,	// The application's transports path
		},
		Timestamps: {
			initialized_at: null,
			started_at: null,
		},
		LogManager: null,			// Log Factory
		Logger: null,				// Default server logger
		CommandHandler: null,		// Command Dispatcher
		Schema: {},					// Service Schema
		Services: {},				// Service Instances
		Transports: {},				// Transport Instances
		ServiceClient: null,		// Mapping of Service Clients
		StartupServer: null,		// Startup function
		ShutdownServer: null,		// Shutdown function
	};


	//---------------------------------------------------------------------
	// Set Folders
	//---------------------------------------------------------------------

	// if ( Server.Config.host_folder )
	// {
	// 	Server.Folders.HostPath = PATH.resolve( Server.Config.host_folder );
	// }
	// FS_EXTRA.ensureDirSync( Server.Folders.HostPath );
	// process.chdir( Server.Folders.HostPath );

	function resolve_folder( folder_path )
	{
		if ( !folder_path ) { return null; }
		folder_path = PATH.resolve( folder_path );
		if ( !FS.existsSync( folder_path ) )
		{
			FS_EXTRA.ensureDirSync( folder_path );
		}
		return folder_path;
	}
	Server.Folders.LoggerPath = resolve_folder( Server.Config.logger_folder );
	Server.Folders.SdkPath = resolve_folder( Server.Config.sdk_folder );
	// Server.Folders.DataPath = resolve_folder( Server.Config.data_folder );
	Server.Folders.ServicesPath = resolve_folder( Server.Config.services_folder );
	Server.Folders.TransportsPath = resolve_folder( Server.Config.transports_folder );


	//---------------------------------------------------------------------
	// Start Logger Service
	//---------------------------------------------------------------------

	Server.LogManager = require( './Logger' )( Server );
	Server.LogManager.Startup();
	Server.Logger = Server.LogManager.NewLogger( { service: 'Core' } );
	Server.Logger.info( `Loading [${Server.Config.server_name}, v${Server.Config.server_version}].` );
	// Server.Logger.info( `HostPath       : [${Server.Folders.HostPath}].` );
	Server.Logger.info( `LoggerPath     : [${Server.Folders.LoggerPath}].` );
	Server.Logger.info( `SdkPath        : [${Server.Folders.SdkPath}].` );
	// Server.Logger.info( `DataPath       : [${Server.Folders.DataPath}].` );
	Server.Logger.info( `ServicesPath   : [${Server.Folders.ServicesPath}].` );
	Server.Logger.info( `TransportsPath : [${Server.Folders.TransportsPath}].` );


	//---------------------------------------------------------------------
	// Install the main command handler.
	//---------------------------------------------------------------------

	Server.CommandHandler = require( './CommandHandler' )( Server );


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
	// Load All Services and Schema
	//---------------------------------------------------------------------

	if ( Server.Config.Services )
	{
		for ( var service_name in Server.Config.Services )
		{
			var service_config = Server.Config.Services[ service_name ];
			if ( !service_config ) { continue; }
			if ( !service_config.enabled ) { continue; }

			var service_folder = null;
			if ( !service_config.implementation )
			{
				Server.Logger.warn( `Missing the implementation file for the [${service_name}] service.` );
				continue;
			}
			else if ( service_config.implementation.startsWith( '$/' ) || service_config.implementation.startsWith( '$\\' ) )
			{
				service_folder = service_config.implementation.substring( 2 );
				service_folder = PATH.join( __dirname, '..', 'Services', service_folder );
			}
			else if ( Server.Folders.ServicesPath )
			{
				service_folder = PATH.join( Server.Folders.ServicesPath, service_config.implementation );
			}
			else
			{
				Server.Logger.warn( `Missing configuration for ServicesPath. Unable to find the [${service_name}] implementation file [${service_config.implementation}].` );
				continue;
			}
			Server.Logger.debug( `Loading the [${service_name}] service from folder [${service_config.implementation}].` );
			Server.Logger.trace( `Loading service folder [${service_folder}].` );

			// Load the Service.
			var service_filename = PATH.join( service_folder, `${service_name}Service.js` );
			if ( !FS.existsSync( service_filename ) )
			{
				Server.Logger.warn( `Missing the implementation file for the [${service_name}] service: [${service_filename}].` );
				continue;
			}
			var service = require( service_filename )( Server );
			Server.Services[ service_name ] = service;
			Server.Schema[ service_name ] = service._.Schema;
		}
	}


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
	// Load All Transports
	//---------------------------------------------------------------------

	if ( Server.Config.Transports )
	{
		for ( var transport_name in Server.Config.Transports )
		{
			var transport_config = Server.Config.Transports[ transport_name ];
			if ( !transport_config ) { continue; }
			if ( !transport_config.enabled ) { continue; }

			var transport_folder = null;
			if ( !transport_config.implementation )
			{
				Server.Logger.warn( `Missing the implementation file for the [${transport_name}] transport.` );
				continue;
			}
			else if ( transport_config.implementation.startsWith( '$/' ) || transport_config.implementation.startsWith( '$\\' ) )
			{
				transport_folder = transport_config.implementation.substring( 2 );
				transport_folder = PATH.join( __dirname, '..', 'Transports', transport_folder );
			}
			else if ( Server.Folders.TransportsPath )
			{
				transport_folder = PATH.join( Server.Folders.TransportsPath, transport_config.implementation );
			}
			else
			{
				Server.Logger.warn( `Missing configuration for TransportsPath. Unable to find the [${transport_name}] implementation file [${transport_config.implementation}].` );
				continue;
			}
			Server.Logger.debug( `Loading the [${transport_name}] transport from folder [${transport_config.implementation}].` );

			// Load the Transport.
			var transport_filename = PATH.join( transport_folder, `${transport_name}Transport.js` );
			if ( !FS.existsSync( transport_filename ) )
			{
				Server.Logger.warn( `Missing the implementation file for the [${transport_name}] transport: [${transport_filename}].` );
				continue;
			}
			var transport = require( transport_filename )( Server );
			Server.Transports[ transport_name ] = transport;

		}
	}


	//=====================================================================
	//=====================================================================
	//
	//  ███████ ███████ ██████  ██    ██ ███████ ██████  
	//  ██      ██      ██   ██ ██    ██ ██      ██   ██ 
	//  ███████ █████   ██████  ██    ██ █████   ██████  
	//       ██ ██      ██   ██  ██  ██  ██      ██   ██ 
	//  ███████ ███████ ██   ██   ████   ███████ ██   ██ 
	//
	//=====================================================================
	//=====================================================================


	//---------------------------------------------------------------------
	// Initialize the server.
	//---------------------------------------------------------------------

	Server.InitializeServer = async function () 
	{
		Server.Logger.info( `Initializing server.` );
		await ServiceManager.InitializeServices( Server );
		Server.Logger.info( `Server is initialized.` );
		Server.Timestamps.initialized_at = ( new Date() ).toISOString();
		return true;
	};


	//---------------------------------------------------------------------
	// Start the server.
	//---------------------------------------------------------------------

	Server.StartupServer = async function () 
	{
		if ( !Server.Timestamps.initialized_at ) { throw new Error( `Server has not been initialized. Call InitializeServer() before StartupServer().` ); }

		if ( Server.Timestamps.started_at ) 
		{
			console.log.warn( `Server has already been started. Restarting the server.` );
			await Server.ShutdownServer();
		}

		Server.Logger.info( `Starting server.` );

		// Startup the services.
		await ServiceManager.StartupServices( Server );

		// Startup the transports.
		await ServiceManager.StartupTransports( Server );
		if ( Server.Transports.InProcess )
		{
			Server.Transports.InProcess.MountAllEndpoints();
		}
		if ( Server.Transports.Http )
		{
			Server.Transports.Http.MountAllEndpoints();
		}

		// Initialize our client.
		if ( Server.ServiceClient && Server.ServiceClient.Member )
		{
			var get_session_result = await Server.ServiceClient.Member.GetMySession();
		}

		Server.Logger.info( `Server is running.` );
		Server.Timestamps.started_at = ( new Date() ).toISOString();
		return true;
	};


	//---------------------------------------------------------------------
	// Shutdown the server.
	//---------------------------------------------------------------------

	Server.ShutdownServer = async function () 
	{
		Server.Logger.info( `Stopping server.` );

		// Shutdown the services.
		await ServiceManager.ShutdownServices( Server );

		// Shutdown the transports.
		await ServiceManager.ShutdownTransports( Server );

		Server.Logger.info( `Server is stopped.` );
		return true;
	};


	//---------------------------------------------------------------------
	// Return the server.
	//---------------------------------------------------------------------

	return Server;
};
