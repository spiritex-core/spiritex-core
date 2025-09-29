'use strict';

const JSON_WEB_TOKEN = require( 'jsonwebtoken' );
const JWT_OPTIONS = { algorithm: 'HS256' };

module.exports = function ( Server, Service, Logger )
{
	const AuthConfig = Server.Config.Services.Member.Authenticator.Json;


	//---------------------------------------------------------------------
	var Plugin = {};


	//---------------------------------------------------------------------
	Plugin.Signin =
		async function ( Identifier, Secret )
		{
			var user = await AuthConfig.Users.find( u => u.email_address === Identifier );
			if ( !user ) { throw new Error( "Authentication failed (1)." ); };
			if ( user.secret !== Secret ) { throw new Error( "Authentication failed (2)." ); };

			var session_id = `json-session-${Identifier}`;
			var authorization_token = { // Simple token.
				timestamp: Date.now(),
				identifier: Identifier,
				session_id: session_id,
			};

			Logger.trace( `Json Authenticate > Signin for [${Identifier}], Session ID: ${session_id}` );
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
			var user = AuthConfig.Users.find( u => u.email_address === authorization_token.identifier );
			if ( !user ) { throw new Error( "Invalid authorization." ); };
			user = JSON.parse(JSON.stringify(user));
			delete user.secret;
			// Return the session.
			var result = {
				session_id: SessionID,
				User: user,
			};
			Logger.trace( `Json Authenticate > GetSession for [${SessionID}], User: ${user.email_address}` );
			return result;
		};


	//---------------------------------------------------------------------
	return Plugin;
};
