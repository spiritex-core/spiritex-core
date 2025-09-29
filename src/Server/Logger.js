'use strict';


const PATH = require( 'path' );


module.exports = function ( Server )
{
	const LOG4JS = require( 'log4js' );

	var console_logger = null;
	var gelf_logger = null;


	var LogManager = {


		//---------------------------------------------------------------------
		// AttachToExpressApp
		//---------------------------------------------------------------------

		AttachToExpressApp:
			function ( ExpressApp )
			{
				if ( console_logger )
				{
					ExpressApp.use( LOG4JS.connectLogger( console_logger, { level: Server.Config.Logger.message_log_level } ) );
				}
				if ( gelf_logger )
				{
					ExpressApp.use( LOG4JS.connectLogger( gelf_logger, { level: Server.Config.Logger.message_log_level } ) );
				}
				return;
			},


		//---------------------------------------------------------------------
		// Startup - required before Loggers can be created.
		//---------------------------------------------------------------------
		Startup:
			function ()
			{
				var config = {
					appenders: {},
					categories: {
						default: {
							appenders: [],
							level: Server.Config.Logger.message_log_level,
						},
					},
				};

				if ( Server.Config.Logger.message_log_level )
				{
					// Console logging.
					config.appenders.console = {
						type: 'console',
						layout: {
							type: 'pattern',
							pattern: '%d | %5p | %m',
						},
					};
					config.categories.default.appenders.push( 'console' );

					// File logging.
					if ( Server.Config.Logger.LogFile && Server.Folders.LoggerPath )
					{
						var appender = JSON.parse( JSON.stringify( Server.Config.Logger.LogFile ) );
						if ( appender.filename )
						{
							appender.filename = PATH.join( Server.Folders.LoggerPath, appender.filename );
						}
						config.appenders.logfile = appender;
						config.categories.default.appenders.push( 'logfile' );
					}

					// Gelf logging.
					if ( Server.Config.Logger.gelf_host && Server.Config.Logger.gelf_port )
					{
						config.appenders.gelf = {
							type: '@log4js-node/gelf',
							host: Server.Config.Logger.gelf_host,
							port: Server.Config.Logger.gelf_port,
							// facility: Facility,
							customFields: {
								_application: Server.Config.server_name,
								_network: Server.Config.network_name,
							},
						};
						config.categories.gelf = {
							appenders: [ 'gelf' ],
							level: Server.Config.Logger.message_log_level
						};
					}

				}

				LOG4JS.configure( config );

				console_logger = LOG4JS.getLogger( 'default' );
				console_logger.level = Server.Config.Logger.message_log_level;

				if ( Server.Config.Logger.gelf_host && Server.Config.Logger.gelf_port )
				{
					gelf_logger = LOG4JS.getLogger( 'gelf' );
					gelf_logger.level = Server.Config.Logger.message_log_level;
				}

				return;
			},


		//---------------------------------------------------------------------
		// Shutdown
		//---------------------------------------------------------------------

		Shutdown:
			async function ()
			{
				await new Promise( ( resolve, reject ) =>
				{
					try
					{
						LOG4JS.shutdown( resolve );
					}
					catch ( error )
					{
						reject( error );
					}
				} );
				return;
			},

		//---------------------------------------------------------------------
		// NewLogger
		//---------------------------------------------------------------------

		NewLogger:
			function NewLogger( Attributes )
			{

				//---------------------------------------------------------------------
				var Logger = {


					//---------------------------------------------------------------------
					GelfAttributes: null,


					//---------------------------------------------------------------------
					// Main log function
					log: function ( LogLevel, Message, ...Args ) 
					{
						try
						{
							if ( console_logger )
							{
								if ( Attributes.service )
								{
									var service_name = Attributes.service;
									if ( service_name.length < Server.Config.Logger.service_name_width )
									{ service_name = service_name.padEnd( Server.Config.Logger.service_name_width ); }
									if ( service_name.length > Server.Config.Logger.service_name_width )
									{ service_name = service_name.substring( 0, Server.Config.Logger.service_name_width ); }
									Message = `${service_name} | ${Message}`;
								}
								console_logger[ LogLevel ]( Message, ...Args );
							}
							if ( gelf_logger )
							{
								if ( this.GelfAttributes )
								{
									// gelf_logger.log( this.GelfAttributes, LogLevel, Message, ...Args );
									this.GelfAttributes._severity = LogLevel;
									gelf_logger[ LogLevel ]( this.GelfAttributes, Message, ...Args );
									delete this.GelfAttributes._severity;
								}
								else
								{
									// gelf_logger.log( LogLevel, Message, ...Args );
									gelf_logger[ LogLevel ]( Message, ...Args );
								}
							}
						}
						catch ( error ) 
						{
							console.error( `Logger Error: ${error.message}`, error );
						}
						return;
					},


					//---------------------------------------------------------------------
					// Level specific log functions
					silly: function ( Message, ...Args ) { this.log( 'silly', Message, ...Args ); },
					trace: function ( Message, ...Args ) { this.log( 'trace', Message, ...Args ); },
					debug: function ( Message, ...Args ) { this.log( 'debug', Message, ...Args ); },
					info: function ( Message, ...Args ) { this.log( 'info', Message, ...Args ); },
					warn: function ( Message, ...Args ) { this.log( 'warn', Message, ...Args ); },
					error: function ( Message, ...Args ) { this.log( 'error', Message, ...Args ); },
					fatal: function ( Message, ...Args ) { this.log( 'fatal', Message, ...Args ); },

				};


				//---------------------------------------------------------------------
				// Initialize the logger attributes.
				if ( Attributes )
				{
					Logger.GelfAttributes = {
						GELF: true,
						// _network: CTX.Config.network_name,
						// _application: 'spiritex-market-api',
					};
					var keys = Object.keys( Attributes );
					for ( var index = 0; index < keys.length; index++ )
					{
						var key = keys[ index ];
						Logger.GelfAttributes[ `_${key}` ] = Attributes[ key ];
					}
				}

				//---------------------------------------------------------------------
				return Logger;
			},


	};

	return LogManager;
};

