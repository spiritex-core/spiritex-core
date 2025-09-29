'use strict';

const ASSERT = require( 'assert' );


module.exports = function ( Clients, Sessions )
{
	//---------------------------------------------------------------------
	describe( `My Member Commands`, function ()
	{


		//---------------------------------------------------------------------
		before( 'Startup',
			async function ()
			{
				return;
			} );


		//---------------------------------------------------------------------
		after( 'Shutdown',
			async function ()
			{
				return;
			} );


		//---------------------------------------------------------------------
		it( `should get my session`,
			async function ()
			{
				var session = await Clients.Admin.Member.GetMySession();
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should create an apikey`,
			async function ()
			{
				var apikey = await Clients.User1.Member.CreateMyApiKey( 'Test Key.', 1000 );
				ASSERT.ok( apikey );
				ASSERT.ok( apikey.apikey_id );
				ASSERT.ok( apikey.apikey );
				ASSERT.ok( apikey.passkey );
				await Clients.Admin.Member.DestroyApiKey( apikey.apikey_id );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should list apikeys`,
			async function ()
			{
				var apikey = await Clients.User1.Member.CreateMyApiKey( 'Test Key.', 1000 );
				var apikeys = await Clients.User1.Member.ListMyApiKeys();
				ASSERT.ok( apikeys );
				ASSERT.ok( apikeys.length );
				ASSERT.ok( apikeys.find( a => a.apikey_id === apikey.apikey_id ) );
				await Clients.Admin.Member.DestroyApiKey( apikey.apikey_id );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should get an apikey`,
			async function ()
			{
				var apikey = await Clients.User1.Member.CreateMyApiKey( 'Test Key.', 1000 );
				var apikey2 = await Clients.User1.Member.GetMyApiKey( apikey.apikey_id );
				ASSERT.ok( apikey2 );
				ASSERT.strictEqual( apikey.apikey_id, apikey2.apikey_id );
				ASSERT.strictEqual( apikey.apikey, apikey2.apikey );
				await Clients.Admin.Member.DestroyApiKey( apikey.apikey_id );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should lock an apikey`,
			async function ()
			{
				var apikey = await Clients.User1.Member.CreateMyApiKey( 'Test Key.', 1000 );
				var result = await Clients.User1.Member.LockMyApiKey( apikey.apikey_id );
				ASSERT.ok( result );
				var apikey2 = await Clients.User1.Member.GetMyApiKey( apikey.apikey_id );
				ASSERT.ok( apikey2 );
				ASSERT.ok( apikey2.locked_at );
				await Clients.Admin.Member.DestroyApiKey( apikey.apikey_id );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should unlock an apikey`,
			async function ()
			{
				var apikey = await Clients.User1.Member.CreateMyApiKey( 'Test Key.', 1000 );
				var result = await Clients.User1.Member.LockMyApiKey( apikey.apikey_id );
				result = await Clients.User1.Member.UnlockMyApiKey( apikey.apikey_id );
				var apikey2 = await Clients.User1.Member.GetMyApiKey( apikey.apikey_id );
				ASSERT.ok( apikey2 );
				ASSERT.ok( apikey2.locked_at === null );
				await Clients.Admin.Member.DestroyApiKey( apikey.apikey_id );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should authenticate with an apikey`,
			async function ()
			{
				var apikey = await Clients.User1.Member.CreateMyApiKey( 'Test Key.', 10000 );
				var session = await Clients.User1.Member.NewSession( 'apikey', apikey.apikey, apikey.passkey );
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );
				var session2 = await Clients.User1.Member.GetMySession();
				ASSERT.ok( session2 );
				ASSERT.deepStrictEqual( session2.User, session.User );
				await Clients.Admin.Member.DestroyApiKey( apikey.apikey_id );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should not allow a locked apikey to authenticate`,
			async function ()
			{
				var apikey = await Clients.User1.Member.CreateMyApiKey( 'Test Key.', 10000 );
				var result = await Clients.User1.Member.LockMyApiKey( apikey.apikey_id );
				ASSERT.ok( result );
				try
				{
					var session = await Clients.User1.Member.NewSession( 'apikey', apikey.apikey, apikey.passkey );
					ASSERT.fail( 'should not allow an expired apikey to authenticate' );
				}
				catch ( error )
				{
					ASSERT.ok( error.message.endsWith( 'The ApiKey is locked.' ) );
				}
				await Clients.Admin.Member.DestroyApiKey( apikey.apikey_id );
				return;
			} );



		//---------------------------------------------------------------------
		it( `should not allow an expired apikey to authenticate`,
			async function ()
			{
				var apikey = await Clients.User1.Member.CreateMyApiKey( 'Test Key.', 1 );
				try
				{
					var session = await Clients.User1.Member.NewSession( 'apikey', apikey.apikey, apikey.passkey );
					ASSERT.fail( 'should not allow an expired apikey to authenticate' );
				}
				catch ( error )
				{
					ASSERT.ok( error.message.endsWith( 'The ApiKey has expired.' ) );
				}
				await Clients.Admin.Member.DestroyApiKey( apikey.apikey_id );
				return;
			} );


		//---------------------------------------------------------------------
		return;
	} );


	return;
};
