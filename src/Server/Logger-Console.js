'use strict';

module.exports =
	function NewLogger( Server, Facility )
	{


		//---------------------------------------------------------------------
		const LOG_LEVELS = [ 'silly', 'trace', 'debug', 'info', 'warn', 'error', 'fatal' ];


		//---------------------------------------------------------------------
		var Logger = {


			//---------------------------------------------------------------------
			// Core log function
			_log: function ( LogLevel, Message )
			{
				function _log4real()
				{
					if ( [ 'warn', 'error', 'fatal' ].includes( LogLevel ) )
					{
						console.error( Message );
					}
					else
					{
						console.log( Message );
					}
					return;
				}
				if ( Server.Config.Logger.log_direct_to_console ) 
				{
					_log4real();
				}
				else
				{
					setImmediate( _log4real );
				}
				return;
			},


			//---------------------------------------------------------------------
			// Main log function
			log: function ( LogLevel, Message, ...Args ) 
			{
				const log_level_index = LOG_LEVELS.indexOf( LogLevel );
				const reqd_log_level_index = LOG_LEVELS.indexOf( Server.Config.Logger.message_log_level );

				if ( log_level_index < reqd_log_level_index ) { return; }
				var message_text = '';
				if ( Server.Config.Logger.print_timestamp )
				{
					message_text += ( new Date() ).toISOString();
					message_text += ' | ';
				}
				if ( Facility )
				{
					message_text += Facility;
					message_text += ' | ';
				}
				if ( Server.Config.Logger.print_log_level )
				{
					message_text += LogLevel.padEnd( 6, ' ' );
					message_text += ' | ';
				}
				message_text += Message;

				function shrink_text( Text, MaxLength )
				{
					if ( Text.length <= MaxLength ) { return Text; }
					var text_part_size = ( MaxLength - 40 ) / 2;
					Text = Text.substring( 0, text_part_size )
						+ ` ... (+ ${Text.length - ( 2 * text_part_size )} more bytes) ... `
						+ Text.substring( Text.length - text_part_size );
					if ( Text.length > MaxLength ) { Text = Text.substring( 0, MaxLength ); }
					return Text;
				}

				if ( Args && Args.length )
				{
					for ( var index = 0; index < Args.length; index++ )
					{
						var data = Args[ index ];
						if ( typeof data !== 'undefined' )
						{
							switch ( Server.Config.Logger.data_log_level )
							{
								case 'silly':
								case 'trace':
								case 'warn':
								case 'error':
									message_text += '\n' + JSON.stringify( data, null, '    ' );
									break;
								case 'debug':
									var data_text = JSON.stringify( data );
									message_text += ' | ' + data_text;
									break;
								case 'info':
									var data_text = JSON.stringify( data );
									data_text = shrink_text( data_text, 200 );
									message_text += ' | ' + data_text;
									break;
							}
						}
					}
				}

				if ( this._log ) { this._log( LogLevel, message_text ); }
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
		return Logger;
	};


