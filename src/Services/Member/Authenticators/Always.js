'use strict';

const JSON_WEB_TOKEN = require( 'jsonwebtoken' );
const JWT_OPTIONS = { algorithm: 'HS256' };

module.exports = function ( Server, Service, Logger )
{

	//---------------------------------------------------------------------
	var Plugin = {};


	//---------------------------------------------------------------------
	Plugin.Signin =
		async function ( Identifier, Secret )
		{
			var session_id = `always-session-${Identifier}`; // Make up a session id.
			var authorization_token = { // Simple token.
				timestamp: Date.now(),
				identifier: Identifier,
				session_id: session_id,
			};
			// No validation, always succeeds.
			Logger.trace( `Always Authenticate > Signin for [${Identifier}]: ok!` );
			return {
				session_id: session_id,
				authorization_token:
					JSON_WEB_TOKEN.sign(
						authorization_token,
						Server.Config.Network.network_key,
						JWT_OPTIONS ),
			};
		};


	//---------------------------------------------------------------------
	Plugin.GetSession =
		async function ( SessionID, AuthorizationToken )
		{
			// Validate the parameters.
			if ( !SessionID ) { throw new Error( `Missing session id.` ); }
			if ( !AuthorizationToken ) { throw new Error( `Missing authorization.` ); }
			// Validate the token.
			var authorization_token = JSON_WEB_TOKEN.decode( AuthorizationToken, Server.Config.Network.network_key );
			if ( !authorization_token.timestamp ) { throw new Error( `Invalid authorization.` ); }
			if ( !authorization_token.identifier ) { throw new Error( `Invalid authorization.` ); }
			if ( !authorization_token.session_id ) { throw new Error( `Invalid authorization.` ); }
			// Validate the request.
			if ( SessionID !== authorization_token.session_id ) { throw new Error( `Invalid authorization.` ); }
			// Return the session.
			var result = {
				session_id: SessionID,
				User: {
					user_id: 'auth-user-' + authorization_token.identifier,
					email_address: authorization_token.identifier,
					first_name: authorization_token.identifier.split( '@' )[ 0 ],
					last_name: authorization_token.identifier.split( '@' )[ 1 ],
				},
			};
			Logger.trace( `Always Authenticate > GetSession for [${SessionID}]: ok!` );
			return result;
		};


	//---------------------------------------------------------------------
	return Plugin;
};
