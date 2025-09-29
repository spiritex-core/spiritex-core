'use strict';

const ASSERT = require( 'assert' );


module.exports = function ( Clients )
{
	//---------------------------------------------------------------------
	describe( `Auth Commands`, function ()
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
		it( `should get this session`,
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
		it( `should get a new network token`,
			async function ()
			{
				var session = await Clients.Admin.Member.NewNetworkToken();
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should restrict access on user type`,
			async function ()
			{
				var session = await Clients.Admin.Member.GetMySession();
				ASSERT.ok( session );

				try
				{
					var session2 = await Clients.User2.Member.LookupSession( session.session_token );
					ASSERT.ok( false );
				}
				catch ( error )
				{
					ASSERT.strictEqual( error.message, 'In command [LookupSession], Api Error: Unauthorized, insufficient user access (requires at least [network]).' );
				}

				return;
			} );


		//---------------------------------------------------------------------
		return;
	} );


	return;
};
