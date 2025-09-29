'use strict';

const FS = require( 'fs' );
const FS_EXTRA = require( 'fs-extra' );
const PATH = require( 'path' );
const TMP = require( 'tmp' );

const BUILD_FOLDER = PATH.join( __dirname, 'build' );
const PARTIALS_FOLDER = PATH.join( BUILD_FOLDER, 'partials' );

// const SERVICE_NAME = 'Sdk';

module.exports = function ( Server )
{
	var Schema = require( './SdkSchema' )( Server );
	var Service = Server.Utilities.NewService( Server, 'Sdk', Schema );


	//---------------------------------------------------------------------
	Service._.Initialize =
		async function ()
		{
			Service._.Logger.debug( `Initializing [${Service._.service_name}] service ...` );
			await Service.InitializeServiceClient();
			if ( Server.Folders.SdkPath )
			{
				var sdk_path = Server.Folders.SdkPath; // PATH.join( Server.Folders.SdkPath, 'sdk' );
				FS_EXTRA.ensureDirSync( sdk_path );
				if ( Service._.Config.generate_server_schema )
				{
					var schema_filename = PATH.join( sdk_path, 'ServerSchema.json' );
					Service._.Logger.debug( `Generating the Server Schema JSON file [${schema_filename}].` );
					var schema_json = JSON.stringify( Server.Schema, null, 4 );
					if ( FS.existsSync( schema_filename ) ) { FS.unlinkSync( schema_filename ); }
					FS.writeFileSync( schema_filename, schema_json );
				}
				if ( Service._.Config.generate_client_sdks )
				{
					var user_types = [ 'network', 'service', 'user' ];
					for ( var index = 0; index < user_types.length; index++ )
					{
						var user_type = user_types[ index ];
						var foldername = PATH.join( sdk_path, user_type );
						FS_EXTRA.ensureDirSync( foldername );
						FS_EXTRA.emptyDirSync( foldername );
						Service._.Logger.debug( `Generating the ${user_type} Sdk Client for Http.` );
						var filename = PATH.join( foldername, 'SpiritEx-Http-Client.js' );
						var content = await Service.Client( 'http', 'js', user_type );
						FS.writeFileSync( filename, content );
						Service._.Logger.debug( `Generating the ${user_type} Sdk Client for Amqp.` );
						filename = PATH.join( foldername, 'SpiritEx-Amqp-Client.js' );
						content = await Service.Client( 'amqp', 'js', user_type );
						FS.writeFileSync( filename, content );
						Service._.Logger.debug( `Generating the ${user_type} Sdk Http Client documentation.` );
						filename = PATH.join( foldername, 'SpiritEx-Http-Client.md' );
						content = await Service.Documentation( 'http', 'js', user_type, true );
						FS.writeFileSync( filename, content );
					}
				}
			}
			Service._.Logger.debug( `[${Service._.service_name}] service initialized.` );
			return;
		};


	//---------------------------------------------------------------------
	Service.InitializeServiceClient =
		async function ()
		{
			Service._.Logger.debug( `Loading the InProcessClient.` );
			var inprocess_client_source = await Server.Services.Sdk.InProcessClient();
			var inprocess_client_file = TMP.fileSync();
			FS.writeFileSync( inprocess_client_file.name, inprocess_client_source );
			var in_process_client_factory = require( inprocess_client_file.name );
			var in_process_options = JSON.parse( JSON.stringify( Server.Config.Client.Options ) );
			in_process_options.Server = Server;
			var in_process_client = in_process_client_factory( null, Server.Config.Client.Credentials, in_process_options );
			inprocess_client_file.removeCallback();

			Service._.Logger.debug( `Loading the HttpClient.` );
			var http_client_source = await Server.Services.Sdk.Client( 'http', 'js', 'network' );
			var http_client_file = TMP.fileSync();
			FS.writeFileSync( http_client_file.name, http_client_source );
			var http_client_factory = require( http_client_file.name );
			var http_client_options = JSON.parse( JSON.stringify( Server.Config.Client.Options ) );
			var http_client = http_client_factory( Server.Config.Client.Urls, Server.Config.Client.Credentials, http_client_options );
			http_client_file.removeCallback();

			Server.ServiceClient = {};
			for ( var service_name in Server.Schema )
			{
				if ( Server.Services[ service_name ] && Server.Services[ service_name ]._.Config.enabled )
				{
					Service._.Logger.debug( `Mounting service [${service_name}] using InProcessClient.` );
					// var in_process_client = in_process_client_factory( null, Server.Config.Client.Credentials, { Server: Server, trace_authentication: true } );
					Server.ServiceClient[ service_name ] = in_process_client[ service_name ];
					// Service._.Logger.debug( `[${service_name}] service is available via InProcess.` );
				}
				else if ( Server.Config.Client.Urls[ service_name ] )
				{
					Service._.Logger.debug( `Mounting service [${service_name}] using HttpClient.` );
					// var http_client = http_client_factory( Server.Config.Client.Urls, Server.Config.Client.Credentials, { trace_authentication: true } );
					Server.ServiceClient[ service_name ] = http_client[ service_name ];
					// Service._.Logger.debug( `[${service_name}] service is available via Http.` );
				}
				else
				{
					Service._.Logger.warn( `No client available for service [${service_name}].` );
				}
			}

			return;
		};


	//=====================================================================
	//=====================================================================
	//
	//    ███    ██ ███████ ████████ ██     ██  ██████  ██████  ██   ██     ██    ██ ██████  ██      ███████ 
	//    ████   ██ ██         ██    ██     ██ ██    ██ ██   ██ ██  ██      ██    ██ ██   ██ ██      ██      
	//    ██ ██  ██ █████      ██    ██  █  ██ ██    ██ ██████  █████       ██    ██ ██████  ██      ███████ 
	//    ██  ██ ██ ██         ██    ██ ███ ██ ██    ██ ██   ██ ██  ██      ██    ██ ██   ██ ██           ██ 
	//    ██   ████ ███████    ██     ███ ███   ██████  ██   ██ ██   ██      ██████  ██   ██ ███████ ███████ 
	//                                                       
	//=====================================================================
	//=====================================================================


	//---------------------------------------------------------------------
	Service.NetworkUrls =
		async function ( ApiContext )
		{
			return Server.Config.Client.Urls;
		};


	//=====================================================================
	//=====================================================================
	//
	//    ███████  ██████ ██   ██ ███████ ███    ███  █████  
	//    ██      ██      ██   ██ ██      ████  ████ ██   ██ 
	//    ███████ ██      ███████ █████   ██ ████ ██ ███████ 
	//         ██ ██      ██   ██ ██      ██  ██  ██ ██   ██ 
	//    ███████  ██████ ██   ██ ███████ ██      ██ ██   ██ 
	//                                                       
	//=====================================================================
	//=====================================================================


	//---------------------------------------------------------------------
	function get_schema_for_user_type( UserType )
	{
		var schema = {};
		for ( var service_name in Server.Schema )
		{
			for ( var command_name in Server.Schema[ service_name ] )
			{
				if ( command_name.startsWith( '$' ) ) { continue; }
				var command_groups = Server.Schema[ service_name ][ command_name ].groups;
				var pass = false;
				if ( !command_groups ) 
				{
					// No restriction, anonymous access.
					pass = true;
				}
				else if ( command_groups.length === 0 ) 
				{
					// No restriction, anonymous access.
					pass = true;
				}
				else if ( UserType === 'network' ) 
				{
					// Network access is full access.
					pass = true;
				}
				else if ( UserType === 'service' ) 
				{
					pass = command_groups.includes( 'service' )
						|| command_groups.includes( 'user' );
				}
				else if ( UserType === 'user' ) 
				{
					pass = command_groups.includes( 'user' );
				}
				else 
				{
					// Application defined user type.
					pass = command_groups.includes( UserType );
				}

				if ( pass )
				{
					if ( !schema[ service_name ] ) 
					{
						schema[ service_name ] = {
							$Objects: Server.Schema[ service_name ].$Objects
						};
					}
					schema[ service_name ][ command_name ] = Server.Schema[ service_name ][ command_name ];
				}
			}
		}
		return schema;
	}


	//---------------------------------------------------------------------
	Service.Schema =
		async function ( UserType, ApiContext )
		{
			UserType = UserType || '';
			var schema = get_schema_for_user_type( UserType );
			return schema;
		};


	//=====================================================================
	//=====================================================================
	//
	//     ██████ ██      ██ ███████ ███    ██ ████████ 
	//    ██      ██      ██ ██      ████   ██    ██    
	//    ██      ██      ██ █████   ██ ██  ██    ██    
	//    ██      ██      ██ ██      ██  ██ ██    ██    
	//     ██████ ███████ ██ ███████ ██   ████    ██    
	//                                                  
	//=====================================================================
	//=====================================================================


	//---------------------------------------------------------------------
	function assemble_js_transport_client( Schema, TransportName, UserType )
	{
		// Load the base template.
		var client_js = FS.readFileSync( PATH.join( PARTIALS_FOLDER, `_BaseTransportClient.js` ), 'utf8' );
		client_js = client_js.replace( `const SERVER_NAME = "";`, `const SERVER_NAME = "${Server.Config.server_name}";` );
		client_js = client_js.replace( `const SERVER_VERSION = "";`, `const SERVER_VERSION = "${Server.Config.server_version}";` );
		client_js = client_js.replace( `const API_TYPE = "";`, `const API_TYPE = "${UserType}";` );
		client_js = client_js.replace( `const NETWORK_URLS = null;`, `const NETWORK_URLS = ${JSON.stringify( Server.Config.Client.Urls )};` );

		// Add the transport specific implementation.
		var transport_js = FS.readFileSync( PATH.join( PARTIALS_FOLDER, `_${TransportName}TransportClient.js` ), 'utf8' );
		client_js = client_js.replace( `var Transport = {};`, transport_js );

		// Add the service commands.
		const client_commands_js = require( PATH.join( BUILD_FOLDER, `GenerateJS_ClientCommands.js` ) )( Server, Schema );
		client_js = client_js.replace( `ServiceClient.Commands = {};`, client_commands_js );

		return client_js;
	}


	//---------------------------------------------------------------------
	Service.InProcessClient =
		async function ()
		{
			return Service.InProcessClientSync();
		};
	Service.InProcessClientSync =
		function ()
		{
			var schema = get_schema_for_user_type( 'network' );
			var client_js = assemble_js_transport_client( schema, 'InProcess', 'network' );
			return client_js;
		};


	//---------------------------------------------------------------------
	Service.Client =
		async function ( Transport, Platform, UserType, ApiContext )
		{
			Transport = Transport || 'http';
			Platform = Platform || 'js';
			UserType = UserType || '';

			// require( './GenerateClientSdk' )( Server, user_type );

			var schema = get_schema_for_user_type( UserType );

			var client_js = "";
			Platform = Platform.toLowerCase();
			Transport = Transport.toLowerCase();

			switch ( Platform )
			{
				default:
				case 'js':
					switch ( Transport )
					{
						default:
						case 'http':
							client_js = assemble_js_transport_client( schema, 'Http', UserType );
							break;
						case 'amqp':
							client_js = assemble_js_transport_client( schema, 'Amqp', UserType );
							break;
					}
					break;
			}

			return client_js;
		};


	//=====================================================================
	//=====================================================================
	//
	//    ██████   ██████   ██████ ██    ██ ███    ███ ███████ ███    ██ ████████  █████  ████████ ██  ██████  ███    ██ 
	//    ██   ██ ██    ██ ██      ██    ██ ████  ████ ██      ████   ██    ██    ██   ██    ██    ██ ██    ██ ████   ██ 
	//    ██   ██ ██    ██ ██      ██    ██ ██ ████ ██ █████   ██ ██  ██    ██    ███████    ██    ██ ██    ██ ██ ██  ██ 
	//    ██   ██ ██    ██ ██      ██    ██ ██  ██  ██ ██      ██  ██ ██    ██    ██   ██    ██    ██ ██    ██ ██  ██ ██ 
	//    ██████   ██████   ██████  ██████  ██      ██ ███████ ██   ████    ██    ██   ██    ██    ██  ██████  ██   ████ 
	//                                                                                                                   
	//=====================================================================
	//=====================================================================


	//---------------------------------------------------------------------
	Service.Documentation =
		async function ( Transport, Platform, UserType, UseLinks, ApiContext )
		{
			Transport = Transport || 'http';
			Platform = Platform || 'js';
			UserType = UserType || '';

			var schema = get_schema_for_user_type( UserType );
			var GenerateMD_SpirtiEx_API = require( PATH.join( BUILD_FOLDER, 'GenerateMD_SpiritEx-API.js' ) );
			var md_generator = GenerateMD_SpirtiEx_API( Server, schema, UserType, { UseLinks: UseLinks } );
			var md_content = md_generator._buffer;

			return md_content;
		};


	//---------------------------------------------------------------------
	return Service;
}

