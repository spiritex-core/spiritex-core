'use strict';

const CRYPTO = require( 'crypto' );
const MONIKER = require( 'moniker' );
const NAME_CHOOSER = MONIKER.generator(
	[
		MONIKER.adjective,
		MONIKER.noun,
	],
	{
		glue: ' ',
	} );

const GENERATOR_MODULE = require( './Generator' );
// const COMMAND_LINE_MODULE = require( './CommandLine' );
const SQL_MANAGER_MODULE = require( './SqlManager' );
// const SEQUELIZE_UTILS_MODULE = require( './SequelizeUtils' );


module.exports = {


	//---------------------------------------------------------------------
	Sleep: function Sleep( SleepMilliseconds = 1 ) 
	{
		return new Promise( resolve => setTimeout( resolve, SleepMilliseconds ) );
	},


	//---------------------------------------------------------------------
	ZuluTimestamp: function ZuluTimestamp( AdjustMilliseconds = 0 )
	{
		// return ( new Date() ).toISOString();
		return new Date( Date.now() + AdjustMilliseconds ).toISOString();
	},


	//---------------------------------------------------------------------
	ReplaceAll: function ReplaceAll( Text, Search, Replacement )
	{
		return Text.split( Search ).join( Replacement );
	},


	//---------------------------------------------------------------------
	UniqueID: function UniqueID( Prefix = '', Size = 12 )
	{
		let alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890';
		let alphabet_1st = 'abcdefghijklmnopqrstuvwxyz';
		let result = '';
		for ( let index = 0; index < Size; index++ )
		{
			// ALERT: CRYPTO.randomInt requires Node v14.10.0, v12.19.0
			if ( index === 0 )
			{
				// Make sure the 1st character of the ID is non-numeric.
				result += alphabet_1st[ CRYPTO.randomInt( 0, alphabet_1st.length - 1 ) ];
			}
			else
			{
				// Use the entire alphabet for the rest of the ID.
				result += alphabet[ CRYPTO.randomInt( 0, alphabet.length - 1 ) ];
			}
		}
		if ( Prefix && Prefix.length )
		{
			result = Prefix + '-' + result;
		}
		return result;
	},


	//---------------------------------------------------------------------
	UniqueName: function UniqueName()
	{
		var name = NAME_CHOOSER.choose();
		var parts = name.split( ' ' );
		for ( let index = 0; index < parts.length; index++ )
		{
			var part = parts[ index ];
			part = part.substring( 0, 1 ).toUpperCase() + part.substring( 1 );
			parts[ index ] = part;
		}
		name = parts.join( ' ' );
		return name;
	},


	//---------------------------------------------------------------------
	// Slugify
	//---------------------------------------------------------------------

	Slugify: function Slugify( text, options )
	{
		var fill_char = ( options && options.fill_char ) ? options.fill_char : '-';
		var collapse = options ? !!options.collapse : false;
		var trim = options ? !!options.trim : false;
		var lowercase = options ? !!options.lowercase : false;

		// Replace illegal characters with the fill character.
		// text = text.replace( /[^a-zA-Z0-9]+/g, delimiter );
		text = text.replace( /[^a-zA-Z0-9]/g, fill_char );

		// Collapse multiple fill characaters into a single fill character.
		if ( collapse ) 
		{
			// text = text.replace( /-+/g, delimiter );
			var regex = new RegExp( `${fill_char}+`, 'g' );
			text = text.replace( regex, fill_char );
		}

		// Trim the fill characters from the beginning and end of the text.
		if ( trim ) 
		{
			// text = text.replace( /^-+|-+$/g, '' );
			var regex = new RegExp( `^${fill_char}+|${fill_char}+$`, 'g' );
			text = text.replace( regex, '' );
		}

		if ( lowercase ) 
		{
			text = text.toLowerCase();
		}

		return text;
	},

	//---------------------------------------------------------------------
	// MillisecondsToHuman
	//---------------------------------------------------------------------

	MillisecondsToHuman: function MillisecondsToHuman( milliseconds )
	{
		var seconds = Math.floor( milliseconds / 1000 );
		var minutes = Math.floor( seconds / 60 );
		var hours = Math.floor( minutes / 60 );
		var days = Math.floor( hours / 24 );
		var weeks = Math.floor( days / 7 );
		var months = Math.floor( days / 30 );
		var years = Math.floor( days / 365 );

		if ( years > 0 ) { return `${years}y ${months % 12}mo`; }
		if ( months > 0 ) { return `${months}mo ${weeks % 4}w`; }
		if ( weeks > 0 ) { return `${weeks}w ${days % 7}d`; }
		if ( days > 0 ) { return `${days}d ${hours % 24}h`; }
		if ( hours > 0 ) { return `${hours}h ${minutes % 60}m`; }
		if ( minutes > 0 ) { return `${minutes}m ${seconds % 60}s`; }
		if ( seconds >= 1 ) { return `${seconds}s`; }
		return `<1s`;
	},

	//---------------------------------------------------------------------
	// RequestIp
	//---------------------------------------------------------------------

	RequestIp: function RequestIp( Request )
	{
		if ( !Request ) { return ''; }
		if ( !Request.ip ) { return ''; }
		var ip_address = Request.ip;
		if ( ip_address.substr( 0, 7 ) === '::ffff:' )
		{
			ip_address = ip_address.substr( 7 );
		}
		if ( ip_address === '::1' )
		{
			ip_address = '127.0.0.1';
		}
		if ( ip_address.includes( ':' ) )
		{
			ip_address = ip_address.split( ':' ).pop();
		}
		if ( ip_address === '1' )
		{
			ip_address = '127.0.0.1';
		}
		return ip_address;
	},

	//---------------------------------------------------------------------
	// TokenizePayload
	//---------------------------------------------------------------------

	TokenizePayload: function TokenizePayload( Payload, Type, DurationMS, AbandonMS = 0, UserID = "", SessionID = "" )
	{
		var created_at_ms = ( new Date() ).getTime();
		var expires_at_ms = created_at_ms + DurationMS;
		var abandon_at_ms = expires_at_ms + AbandonMS;
		var token = {
			jti: this.UniqueID( Type, 16 ),
			sub: UserID,
			sid: SessionID,
			iat: Math.floor( created_at_ms / 1000 ),
			exp: Math.floor( expires_at_ms / 1000 ),
			aat: Math.floor( abandon_at_ms / 1000 ),
			created_at: new Date( created_at_ms ),
			expires_at: new Date( expires_at_ms ),
			abandon_at: new Date( abandon_at_ms ),
			Payload: Payload,
		};
		return token;
	},


	//---------------------------------------------------------------------
	// PublicIP
	//---------------------------------------------------------------------

	PublicIP: async function PublicIP()
	{
		try
		{
			var response = await fetch( 'https://api.ipify.org?format=json' );
			if ( !response.ok ) { throw new Error( `Failed to get public IP address: [${response.status}] ${response.statusText}` ); }
			var data = await response.json();
			return data.ip;
		}
		catch ( error )
		{
			return 'error';
		}
	},


	//---------------------------------------------------------------------
	// NewService
	//---------------------------------------------------------------------

	NewService: function NewService( Server, ServiceName, Schema )
	{
		if ( !Server ) { throw new Error( `Server is required.` ); }
		if ( !Server.Config ) { throw new Error( `Server configuration is missing.` ); }
		if ( !Server.Config.Services ) { throw new Error( `Invalid server configuration, missing [Server.Config.Services].` ); }
		if ( !Server.Config.Services[ ServiceName ] ) { throw new Error( `Configuration not found for service [${ServiceName}].` ); }
		var Service = {
			_: {
				service_name: ServiceName,
				Config: Server.Config.Services[ ServiceName ],
				Logger: Server.LogManager.NewLogger( { service: ServiceName } ),
				Schema: Schema,
				Initialize:
					async function ()
					{
						Service._.Logger.debug( `[${ServiceName}] service initialized.` );
						return;
					},
				Startup:
					async function ()
					{
						Service._.Logger.debug( `[${ServiceName}] service started.` );
						return;
					},
				Shutdown:
					async function ()
					{
						Service._.Logger.debug( `[${ServiceName}] service stopped.` );
						return;
					},
			},
		};
		return Service;
	},


	//---------------------------------------------------------------------
	// NewGenerator
	//---------------------------------------------------------------------

	NewGenerator: function NewGenerator()
	{
		return GENERATOR_MODULE();
	},


	//---------------------------------------------------------------------
	// NewSqlManager
	//---------------------------------------------------------------------

	NewSqlManager: function NewSqlManager( Server, Service, Logger = null )
	{
		return SQL_MANAGER_MODULE( Server, Service, Logger );
	},


	//---------------------------------------------------------------------
	// ParseCommandLine
	//---------------------------------------------------------------------

	// ParseCommandLine: function ParseCommandLine( CommandLineArgs = null )
	// {
	// 	if ( CommandLineArgs === null ) { CommandLineArgs = process.argv.slice( 2 ).join( ' ' ); }
	// 	return COMMAND_LINE_MODULE.ParseCommandLine( CommandLineArgs );
	// },


	//---------------------------------------------------------------------
	// SequelizeUtils
	//---------------------------------------------------------------------

	// SequelizeUtils: SEQUELIZE_UTILS_MODULE,


};


