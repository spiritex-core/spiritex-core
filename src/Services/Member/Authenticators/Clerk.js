'use strict';


module.exports = function ( Server, Service, Logger )
{
	const ClerkConfig = Server.Config.Services.Member.Authenticator.Clerk;


	//---------------------------------------------------------------------
	var Plugin = {};


	//---------------------------------------------------------------------
	Plugin.Signin =
		async function ( Identifier, Secret )
		{
			var fetch_result = await fetch( `${ClerkConfig.clerk_domain}/v1/client/sign_ins?_is_native=true`, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded", },
				body: new URLSearchParams( {
					strategy: "password",
					identifier: Identifier,
					password: Secret,
				} ).toString(),
			} );
			if ( !fetch_result.ok ) { throw new Error( `Failed to call Clerk API 'Signin': [status=${fetch_result.status}] ${fetch_result.statusText}` ); }
			var clerk_result = await fetch_result.json();
			clerk_result.authorization_token = fetch_result.headers.get( "Authorization" );

			var result = {
				session_id: clerk_result.response.created_session_id,
				authorization_token: clerk_result.authorization_token,
			};

			Logger.trace( `Clerk Authenticate > Signin for [${Identifier}]: session id = [${result.session_id}]` );
			return result;
		};


	//---------------------------------------------------------------------
	Plugin.GetSession =
		async function ( SessionID, AuthorizationToken )
		{
			var fetch_result = await fetch( `${ClerkConfig.clerk_domain}/v1/client/sessions/${SessionID}?_is_native=true`, {
				method: "GET",
				headers: { Authorization: AuthorizationToken },
			} );
			if ( !fetch_result.ok ) { throw new Error( `Failed to call Clerk API 'Session': [${fetch_result.status}] ${fetch_result.statusText}` ); }
			var clerk_result = await fetch_result.json();
			if ( clerk_result.errors ) 
			{
				var message = `Session failed.`;
				for ( var index = 0; index < clerk_result.errors.length; index++ ) { message += '\n' + clerk_result.errors[ index ].message; }
				throw new Error( message );
			}
			var clerk_session = clerk_result.response;
			if ( !clerk_session ) { throw new Error( `Unable to find clerk session with session id [${session_info.clerk_session_id}].` ); }
			var clerk_user = clerk_session.user;
			if ( !clerk_user ) { throw new Error( `Unable to find clerk user with session id [${session_info.clerk_session_id}].` ); }

			// Get the email address.
			var email_address = clerk_user.email_addresses.find( item => item.id === clerk_user.primary_email_address_id );
			email_address = email_address.email_address;
			email_address = email_address.toLowerCase();
			if ( !email_address ) { throw new Error( `Missing required parameter [email_address].` ); }

			var result = {
				session_id: clerk_session.id,
				User: {
					user_id: clerk_user.id,
					email_address: email_address,
					first_name: clerk_user.first_name,
					last_name: clerk_user.last_name,
				},
			};

			Logger.trace( `Clerk Authenticate > GetSession for [${SessionID}], clerk.user_id = [${clerk_user.id}]` );
			return result;
		};


	//---------------------------------------------------------------------
	return Plugin;
};
