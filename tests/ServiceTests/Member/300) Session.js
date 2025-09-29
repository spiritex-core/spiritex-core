'use strict';

const ASSERT = require( 'assert' );


module.exports = function ( Clients )
{
	//---------------------------------------------------------------------
	describe( `Session Commands`, function ()
	{


		//---------------------------------------------------------------------
		it( `should list sessions`,
			async function ()
			{
				var session = await Clients.Admin.Member.GetMySession();
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );

				var sessions = await Clients.Admin.Member.ListSessions(
					{
						user_id: session.User.user_id,
					} );
				ASSERT.ok( sessions );
				ASSERT.ok( sessions.length );
				ASSERT.ok( sessions.find( s => s.session_id === session.Session.session_id ) );

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

				var this_session = await Clients.Admin.Member.GetSession( session.Session.session_id );
				ASSERT.ok( this_session );
				ASSERT.deepEqual( this_session, session.Session );

				return;
			} );


		//---------------------------------------------------------------------
		it( `should set metadata for this session`,
			async function ()
			{
				var session = await Clients.Admin.Member.GetMySession();
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );

				// Add metadata to the session.
				const new_metadata = { foo: 'bar' };
				var result = await Clients.Admin.Member.SetSessionMetadata( session.Session.session_id, new_metadata );
				ASSERT.ok( result );

				// Verify the metadata.
				var this_session = await Clients.Admin.Member.GetSession( session.Session.session_id );
				ASSERT.ok( this_session );
				ASSERT.ok( this_session.metadata );
				ASSERT.deepEqual( this_session.metadata, new_metadata );

				// Reset the metadata.
				result = await Clients.Admin.Member.SetSessionMetadata( session.Session.session_id, session.Session.metadata );
				ASSERT.ok( result );

				// Verify the metadata.
				this_session = await Clients.Admin.Member.GetSession( session.Session.session_id );
				ASSERT.ok( this_session );
				ASSERT.strictEqual( this_session.metadata, session.Session.metadata );

				return;
			} );


		//---------------------------------------------------------------------
		it( `should lock all other sessions`,
			async function ()
			{
				var session = await Clients.Admin.Member.GetMySession();
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );

				var sessions = await Clients.Admin.Member.ListSessions(
					{
						user_id: session.User.user_id,
						locked_at: null,
					} );
				ASSERT.ok( sessions );
				ASSERT.ok( sessions.length );
				ASSERT.ok( sessions.find( s => s.session_id === session.Session.session_id ) );

				for ( var index = 0; index < sessions.length; index++ )
				{
					var other_session = sessions[ index ];
					if ( other_session.session_id === session.Session.session_id ) { continue; }

					var result = await Clients.Admin.Member.LockSession( other_session.session_id );
					ASSERT.ok( result );

					var locked_session = await Clients.Admin.Member.GetSession( other_session.session_id );
					ASSERT.ok( locked_session );
					ASSERT.ok( locked_session.locked_at );
				}

				return;
			} );


		//---------------------------------------------------------------------
		it( `should unlock all other sessions`,
			async function ()
			{
				var session = await Clients.Admin.Member.GetMySession();
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );

				var sessions = await Clients.Admin.Member.ListSessions(
					{
						user_id: session.User.user_id,
					} );
				ASSERT.ok( sessions );
				ASSERT.ok( sessions.length );
				ASSERT.ok( sessions.find( s => s.session_id === session.Session.session_id ) );

				for ( var index = 0; index < sessions.length; index++ )
				{
					var other_session = sessions[ index ];
					if ( other_session.session_id === session.Session.session_id ) { continue; }

					var result = await Clients.Admin.Member.UnlockSession( other_session.session_id );
					ASSERT.ok( result );

					var unlocked_session = await Clients.Admin.Member.GetSession( other_session.session_id );
					ASSERT.ok( unlocked_session );
					ASSERT.ok( !unlocked_session.locked_at );
				}

				return;
			} );


		//---------------------------------------------------------------------
		it( `should close all other sessions`,
			async function ()
			{
				var session = await Clients.Admin.Member.GetMySession();
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );

				var sessions = await Clients.Admin.Member.ListSessions(
					{
						user_id: session.User.user_id,
						closed_at: null,
					} );
				ASSERT.ok( sessions );
				ASSERT.ok( sessions.length );
				ASSERT.ok( sessions.find( s => s.session_id === session.Session.session_id ) );

				for ( var index = 0; index < sessions.length; index++ )
				{
					var other_session = sessions[ index ];
					if ( other_session.session_id === session.Session.session_id ) { continue; }

					var result = await Clients.Admin.Member.CloseSession( other_session.session_id );
					ASSERT.ok( result );

					var locked_session = await Clients.Admin.Member.GetSession( other_session.session_id );
					ASSERT.ok( locked_session );
					ASSERT.ok( locked_session.closed_at );
				}

				return;
			} );


		//---------------------------------------------------------------------
		it( `should reap sessions`,
			async function ()
			{
				var result = await Clients.Admin.Member.ReapSessions();

				return;
			} );


		//---------------------------------------------------------------------
		return;
	} );


	return;
};