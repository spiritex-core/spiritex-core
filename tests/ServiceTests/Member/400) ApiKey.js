'use strict';

const ASSERT = require( 'assert' );


module.exports = function ( Clients, Sessions )
{
	//---------------------------------------------------------------------
	describe( `ApiKey Commands`, function ()
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
		it( `should create an apikey`,
			async function ()
			{
				var apikey = await Clients.Admin.Member.CreateApiKey( Sessions.User1.User.user_id );
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
				var apikey = await Clients.Admin.Member.CreateApiKey( Sessions.User1.User.user_id );
				var apikeys = await Clients.Admin.Member.ListApiKeys( Sessions.User1.User.user_id );
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
				var apikey = await Clients.Admin.Member.CreateApiKey( Sessions.User1.User.user_id );
				var apikey2 = await Clients.Admin.Member.GetApiKey( apikey.apikey_id );
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
				var apikey = await Clients.Admin.Member.CreateApiKey( Sessions.User1.User.user_id );
				var result = await Clients.Admin.Member.LockApiKey( apikey.apikey_id );
				ASSERT.ok( result );
				var apikey2 = await Clients.Admin.Member.GetApiKey( apikey.apikey_id );
				ASSERT.ok( apikey2 );
				ASSERT.ok( apikey2.locked_at );
				await Clients.Admin.Member.DestroyApiKey( apikey.apikey_id );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should unlock an apikey`,
			async function ()
			{
				var apikey = await Clients.Admin.Member.CreateApiKey( Sessions.User1.User.user_id );
				var result = await Clients.Admin.Member.LockApiKey( apikey.apikey_id );
				result = await Clients.Admin.Member.UnlockApiKey( apikey.apikey_id );
				var apikey2 = await Clients.Admin.Member.GetApiKey( apikey.apikey_id );
				ASSERT.ok( apikey2 );
				ASSERT.ok( apikey2.locked_at === null );
				await Clients.Admin.Member.DestroyApiKey( apikey.apikey_id );
				return;
			} );


		//---------------------------------------------------------------------
		return;
	} );


	return;
};
