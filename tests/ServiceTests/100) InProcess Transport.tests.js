'use strict';

const FS = require( 'fs' );
const PATH = require( 'path' );
const ASSERT = require( 'assert' );
const TMP = require( 'tmp' );

var ServerFactory = require( '../../src/Server/Server' );
var Server = null;


//---------------------------------------------------------------------
describe( `100) Service Tests over InProcess Transport`, function ()
{


	var Clients = {};
	var Sessions = {};


	//---------------------------------------------------------------------
	before( 'Startup',
		async function ()
		{
			const ServerConfig = require( './ServerConfig' );
			// ServerConfig.Logger.message_log_level = 'trace';
			Server = ServerFactory( ServerConfig );
			await Server.InitializeServer();
			await Server.StartupServer();
			return;
		} );


	//---------------------------------------------------------------------
	after( 'Shutdown',
		async function ()
		{
			// await new Promise( resolve => setTimeout( resolve, 1000 ) ); // Wait for transactions to complete!
			await Server.ShutdownServer();
			Server = null;
			return;
		} );


	//---------------------------------------------------------------------
	describe( `Test Environment Initialization`, function ()
	{

		//---------------------------------------------------------------------
		it( `should initialize clients`, async function ()
		{

			// Dynamically load the in-process client.
			var inprocess_client_source = Server.Services.Sdk.InProcessClientSync();
			var inprocess_client_file = TMP.fileSync();
			ASSERT.ok( inprocess_client_source );
			ASSERT.ok( inprocess_client_file );
			FS.writeFileSync( inprocess_client_file.name, inprocess_client_source );
			var client_factory = require( inprocess_client_file.name );
			inprocess_client_file.removeCallback();
			ASSERT.ok( client_factory );

			// Get a client for each system user.
			var client_options = Server.Config.Client.Options;
			client_options.Server = Server;
			var network_urls = null;
			var storage_users = Server.Config.Services.Member.Authenticator.Json.Users;
			for ( var index = 0; index < storage_users.length; index++ )
			{
				var user = storage_users[ index ];
				var credentials = {
					user_email: user.email_address,
					password: user.secret,
				};
				Clients[ user.user_id ] = client_factory( network_urls, credentials, client_options );
			}

			// Some sugar.
			Clients.Admin = Clients[ 'admin@local' ];
			Clients.Super = Clients[ 'super@local' ];
			Clients.User1 = Clients[ 'user1@local' ];
			Clients.User2 = Clients[ 'user2@local' ];
			Clients.User3 = Clients[ 'user3@local' ];

			return;
		} );

		//---------------------------------------------------------------------
		it( `should initialize sessions`, async function ()
		{
			Sessions.Admin = await Clients.Admin.Member.GetMySession();
			Sessions.Super = await Clients.Super.Member.GetMySession();
			Sessions.User1 = await Clients.User1.Member.GetMySession();
			Sessions.User2 = await Clients.User2.Member.GetMySession();
			Sessions.User3 = await Clients.User3.Member.GetMySession();
			return;
		} );

	} );


	//---------------------------------------------------------------------
	describe( `Diagnostic Service`, function ()
	{
		require( './Diagnostic/100) Server Info.js' )( Clients, Sessions );
	} );


	//---------------------------------------------------------------------
	describe( `Member Service`, function ()
	{
		require( './Member/100) Auth.js' )( Clients, Sessions );
		require( './Member/200) User.js' )( Clients, Sessions );
		require( './Member/300) Session.js' )( Clients, Sessions );
		require( './Member/400) ApiKey.js' )( Clients, Sessions );
		require( './Member/500) My Member.js' )( Clients, Sessions );
	} );


	//---------------------------------------------------------------------
	return;
} );
