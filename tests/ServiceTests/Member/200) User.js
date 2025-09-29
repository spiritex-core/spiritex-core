'use strict';

const ASSERT = require( 'assert' );


module.exports = function ( Clients )
{
	//---------------------------------------------------------------------
	describe( `User Commands`, function ()
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
		it( `should list users`,
			async function ()
			{
				var users = await Clients.Admin.Member.ListUsers();
				ASSERT.ok( users );
				ASSERT.ok( users.length );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should get this user`,
			async function ()
			{
				var session = await Clients.Admin.Member.GetMySession();
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );

				var user = await Clients.Admin.Member.GetUser( session.User.user_id );
				ASSERT.ok( user );
				ASSERT.deepEqual( user, session.User );

				return;
			} );


		//---------------------------------------------------------------------
		it( `should rename this user`,
			async function ()
			{
				var session = await Clients.Admin.Member.GetMySession();
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );

				var user = await Clients.Admin.Member.GetUser( session.User.user_id );
				ASSERT.ok( user );
				ASSERT.deepEqual( user, session.User );

				// Rename the user.
				const new_user_name = 'New User Name';
				var result = await Clients.Admin.Member.RenameUser( session.User.user_id, new_user_name );
				ASSERT.ok( result );

				// Verify the rename.
				user = await Clients.Admin.Member.GetUser( session.User.user_id );
				ASSERT.ok( user );
				ASSERT.strictEqual( user.user_name, new_user_name );

				// Rename it back.
				result = await Clients.Admin.Member.RenameUser( session.User.user_id, session.User.user_name );
				ASSERT.ok( result );

				// Verify the rename.
				user = await Clients.Admin.Member.GetUser( session.User.user_id );
				ASSERT.ok( user );
				ASSERT.strictEqual( user.user_name, session.User.user_name );

				return;
			} );


		//---------------------------------------------------------------------
		it( `should set groups for this user`,
			async function ()
			{
				var session = await Clients.Admin.Member.GetMySession();
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );

				var groups = session.User.groups;
				var new_groups = groups;
				if ( new_groups ) { new_groups += '|'; }
				new_groups += 'test';

				var result = await Clients.Admin.Member.SetUserGroups( session.User.user_id, new_groups );
				ASSERT.ok( result );

				// Verify the groups.
				var user = await Clients.Admin.Member.GetUser( session.User.user_id );
				ASSERT.ok( user );
				ASSERT.strictEqual( user.groups, new_groups );

				// Reset the groups.
				result = await Clients.Admin.Member.SetUserGroups( session.User.user_id, groups );
				ASSERT.ok( result );

				// Verify the groups.
				user = await Clients.Admin.Member.GetUser( session.User.user_id );
				ASSERT.ok( user );
				ASSERT.strictEqual( user.groups, groups );

				return;
			} );


		//---------------------------------------------------------------------
		it( `should set metadata for this user`,
			async function ()
			{
				var session = await Clients.Admin.Member.GetMySession();
				ASSERT.ok( session );
				ASSERT.ok( session.session_token );
				ASSERT.ok( session.User );
				ASSERT.ok( session.Session );

				var user = await Clients.Admin.Member.GetUser( session.User.user_id );

				// Add metadata to the user.
				const new_metadata = { foo: 'bar' };
				var result = await Clients.Admin.Member.SetUserMetadata( session.User.user_id, new_metadata );
				ASSERT.ok( result );

				// Verify the metadata.
				user = await Clients.Admin.Member.GetUser( session.User.user_id );
				ASSERT.ok( user );
				ASSERT.ok( user.metadata );
				ASSERT.deepEqual( user.metadata, new_metadata );

				// Reset the metadata.
				result = await Clients.Admin.Member.SetUserMetadata( session.User.user_id, session.User.metadata );
				ASSERT.ok( result );

				// Verify the metadata.
				user = await Clients.Admin.Member.GetUser( session.User.user_id );
				ASSERT.ok( user );
				ASSERT.strictEqual( user.metadata, session.User.metadata );

				return;
			} );


		// //---------------------------------------------------------------------
		// it( `should set metadata for this user`,
		// 	async function ()
		// 	{
		// 		var session = await Clients.Admin.Member.GetMySession();
		// 		ASSERT.ok( session );
		// 		ASSERT.ok( session.session_token );
		// 		ASSERT.ok( session.User );
		// 		ASSERT.ok( session.Session );

		// 		var user = await Clients.Admin.Member.GetUser( session.User.user_id );
		// 		ASSERT.ok( user );
		// 		ASSERT.deepEqual( user, session.User );

		// 		// Add metadata to the user.
		// 		const new_metadata = { foo: 'bar' };
		// 		var result = await Clients.Admin.Member.SetUserMetadata( session.User.user_id, new_metadata );
		// 		ASSERT.ok( result );

		// 		// Verify the metadata.
		// 		user = await Clients.Admin.Member.GetUser( session.User.user_id );
		// 		ASSERT.ok( user );
		// 		ASSERT.ok( user.metadata );
		// 		ASSERT.deepEqual( user.metadata, new_metadata );

		// 		// Reset the metadata.
		// 		result = await Clients.Admin.Member.SetUserMetadata( session.User.user_id, session.User.metadata );
		// 		ASSERT.ok( result );

		// 		// Verify the metadata.
		// 		user = await Clients.Admin.Member.GetUser( session.User.user_id );
		// 		ASSERT.ok( user );
		// 		ASSERT.strictEqual( user.metadata, session.User.metadata );

		// 		return;
		// 	} );


		//---------------------------------------------------------------------
		return;
	} );


	return;
};