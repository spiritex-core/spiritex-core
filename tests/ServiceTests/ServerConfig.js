'use strict';

const PATH = require( 'path' );

const SECOND_MS = ( 1 * 1000 );
const MINUTE_MS = ( 60 * SECOND_MS );
const HOUR_MS = ( 60 * MINUTE_MS );
const DAY_MS = ( 24 * HOUR_MS );
const WEEK_MS = ( 7 * DAY_MS );
const MONTH_MS = ( 30 * DAY_MS );
const YEAR_MS = ( 365 * DAY_MS );


module.exports = {

	//---------------------------------------------------------------------
	// General
	//---------------------------------------------------------------------

	server_name: 'TestServer',
	server_version: '0.0.1',
	server_address: 'localhost', // public address


	//---------------------------------------------------------------------
	// Folders
	//---------------------------------------------------------------------

	// host_folder: PATH.resolve( __dirname, '~Host' ),
	// logger_folder: PATH.resolve( __dirname, '~Logger' ),
	// sdk_folder: PATH.resolve( __dirname, '~Sdk' ),
	// data_folder: PATH.resolve( __dirname, '~Data' ),
	// services_folder: PATH.resolve( __dirname, 'Services' ),
	// transports_folder: PATH.resolve( __dirname, 'Transports' ),


	//---------------------------------------------------------------------
	// Network
	//---------------------------------------------------------------------

	Network: {
		network_name: 'local',
		network_key: 'used-to-encrypt-network-secrets',
	},


	//---------------------------------------------------------------------
	// Client
	//---------------------------------------------------------------------

	Client: {
		//---------------------------------------------------------------------
		Options: {
			log_requests: true,			// Log all requests to the console.
			log_responses: true,			// Log all responses to the console.
			trace_authentication: true,		// Trace the authentication process.
			throw_handled_errors: false,	// Throw errors that are already handled by the client.
			Callbacks: {
				OnApiResult: null,				// async function ( ApiResult ) { },
				OnError: null,					// async function ( Message ) { },
				OnAuthorizationUpdated: null,	// async function ( AuthorizationToken ) { },
				Authenticate: null,				// async function ( ThisClient ) { },
			},
		},
		//---------------------------------------------------------------------
		Urls: {
			Diagnostic: 'http://localhost:4200',
			Sdk: 'http://localhost:4200',
			Member: 'http://localhost:4200',
			Echo: 'http://localhost:4200',
			Calc: 'http://localhost:4200',
		},
		//---------------------------------------------------------------------
		Credentials: {
			user_name: 'admin',
			user_email: 'admin@local',
			password: 'password',
			// apikey: 'apikey-abc123',
			// passkey: 'some-passkey',
		},
	},


	//---------------------------------------------------------------------
	// Logger
	//---------------------------------------------------------------------

	Logger: {
		// Log Levels: silly, trace, debug, info, warn, error, fatal, or OFF
		message_log_level: 'OFF',
		data_log_level: 'OFF',
		service_name_width: 15,
		attach_to_express: false,
		log_direct_to_console: true,
		print_timestamp: true,
		print_log_level: true,
		//---------------------------------------------------------------------
		// Gelf
		// gelf_host: 'logs-infosolve.ddns.net',
		// gelf_port: 12201,
		//---------------------------------------------------------------------
		// Log file
		// LogFile: {
		// 	type: "file",
		// 	filename: "server.log",
		// 	numBackups: 7,
		// 	maxLogSize: 10485760, // 10MB
		// 	// compress: true // Compress rotated files with .gz
		// },
		LogFile: {
			type: "dateFile",
			filename: "server.log",
			pattern: ".yyyy-MM-dd",
			numBackups: 7,
			// compress: true // Compress rotated files with .gz
		},

	},


	//---------------------------------------------------------------------
	// Transports
	//---------------------------------------------------------------------

	Transports:
	{

		//---------------------------------------------------------------------
		InProcess: {
			enabled: true,
			implementation: '$/InProcess',
		},

		//---------------------------------------------------------------------
		Http: {
			enabled: true,
			implementation: '$/Http',
			server_protocol: 'http',
			listen_address: '0.0.0.0',
			listen_port: 4200,
			server_timeout: ( 60 * 1000 ),
			trust_proxy: true,
			// max_request_size: '100mb',
			// cors_origin: [
			// 	// '*',
			// 	// 'http://localhost:*',
			// 	// 'http://127.0.0.1:*',

			// 	'http://localhost',
			// 	'http://localhost:3000',
			// 	'http://localhost:5500',
			// 	'http://localhost:8080',

			// 	'http://127.0.0.1',
			// 	'http://127.0.0.1:3000',
			// 	'http://127.0.0.1:5500',
			// 	'http://127.0.0.1:8080',

			// 	'*.spiritex.dev',
			// ],

			Websocket: {
				endpoint_path: 'websocket',
			},

			McpPlugin: {
				endpoint_path: 'mcp',
			},
		},

		//---------------------------------------------------------------------
		// Amqp: {
		// 	enabled: true,
		// 	implementation: '$/Amqp',
		// 	server_address: 'amqp-server',
		// 	server_port: 5672,
		// 	credentials: {
		// 		username: 'username',
		// 		password: 'password',
		// 	},
		// 	connect_options:
		// 	{
		// 		connectRetries: 30,
		// 		connectRetryInterval: 1000,
		// 	},
		// 	command_queue_options:
		// 	{
		// 		exclusive: false,
		// 		durable: false,
		// 		autoDelete: true,
		// 	},
		// 	reply_queue_options:
		// 	{
		// 		exclusive: true,
		// 		durable: false,
		// 		autoDelete: true,
		// 	},
		// },

	},


	//---------------------------------------------------------------------
	// Services
	//---------------------------------------------------------------------

	Services: {


		//---------------------------------------------------------------------
		// Diagnostic Service
		//---------------------------------------------------------------------

		Diagnostic: {
			enabled: true,
			implementation: '$/Diagnostic',
		},


		//---------------------------------------------------------------------
		// Sdk Service
		//---------------------------------------------------------------------

		Sdk: {
			enabled: true,
			implementation: '$/Sdk',

			generate_server_schema: true,
			generate_client_sdks: true,
		},


		//---------------------------------------------------------------------
		// Member Service
		//---------------------------------------------------------------------

		Member: {
			enabled: true,
			implementation: '$/Member',

			use_mock_clerk_api: true,

			admin_user_groups: 'network|service|user|super|admin|hero',
			default_user_groups: 'user',

			//---------------------------------------------------------------------
			Session: {
				duration_ms: 7 * DAY_MS,
				// duration_ms: 5 * MINUTE_MS,
				abandon_ms: 1 * DAY_MS,
			},

			//---------------------------------------------------------------------
			Token: {
				// duration_ms: 1 * HOUR_MS,
				duration_ms: 10 * MINUTE_MS,
				// duration_ms: 1 * MINUTE_MS,
				// duration_ms: 3 * SECOND_MS,
				abandon_ms: 1 * DAY_MS,
			},

			//---------------------------------------------------------------------
			SqlManager: {
				Member: {
					SequelizeOptions: {
						logging: false,
						//---------------------------------------------------------------------
						dialect: 'sqlite',
						storage: ':memory:',
					},
					SequelizeSyncOptions: {},
				},
			},

			//---------------------------------------------------------------------
			Authenticator: {
				// Always: {},
				Json: {
					Users: [
						{
							user_id: 'admin@local',
							email_address: 'admin@local',
							first_name: 'Admin',
							last_name: 'User',
							secret: 'password',
						},
						{
							user_id: 'super@local',
							email_address: 'super@local',
							first_name: 'Super',
							last_name: 'User',
							secret: 'password',
						},
						{
							user_id: 'user1@local',
							email_address: 'user1@local',
							first_name: 'User',
							last_name: 'One',
							secret: 'password',
						},
						{
							user_id: 'user2@local',
							email_address: 'user2@local',
							first_name: 'User',
							last_name: 'Two',
							secret: 'password',
						},
						{
							user_id: 'user3@local',
							email_address: 'user3@local',
							first_name: 'User',
							last_name: 'Three',
							secret: 'password',
						},
					],
				},
			},

		},


	},


};
