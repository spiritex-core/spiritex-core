
### The Always Authenticator

This authenticator approves all requests.
It is useful during development and testing.

***Configuration***

```js
{
	Services: {
		Member: {
			Authenticator: {
				Always: {} // No configuration options.
			}
		}
	}
}
```


### The Json Authenticator

This authenticator approves requests against a pre-configured set of users.
It is useful during development and testing.

***Configuration***

```js
{
	Services: {
		Member: {
			Authenticator: {
				Json: {
					Users: {
						"admin@local": {
							first_name: 'Admin',
							last_name: 'User',
							secret: 'password',
						},
						"super@local": {
							first_name: 'Super',
							last_name: 'User',
							secret: 'password',
						},
					},
				}
			}
		}
	}
}
```


### The Clerk Authenticator

This authenticator forwards requests the Clerk service (https://clerk.com).

***Configuration***

```js
{
	Services: {
		Member: {
			Authenticator: {
				Clerk: {
					api_key: '', // ???
					publishable_key: 'pk_...',
					secret_key: 'sk_...',
					frontend_url: 'http://localhost:5500/public',
					clerk_domain: 'https://{domain}.clerk.accounts.dev',
					clerk_api_path: '/v1/client',
					// clerk_api_path: '/v1',
					jwt_public_key: `-----BEGIN PUBLIC KEY-----
					...
					-----END PUBLIC KEY-----`,
				},
			}
		}
	}
}
```


### Custom Authenticators

Custom authenticators can be created by implementing an `Authenticator` object and setting it as the `Member.Authenticator`.

An `Authenticator` implements the `Signin` and `GetSession` methods:

```js
// Simple-Authenticator.js :
module.exports = {

	//---------------------------------------------------------------------
	// Validates Secret for the given Identifier (email, phone, etc.)
	// Returns a SessionId and AuthorizationToken.
	Signin:	async function ( Identifier, Secret )
	{
		var session_id = `session-${Identifier}`; // Make up a session id.
		// Add some validation irl ...
		return {
			response: {
				status: "ok",
				created_session_id: session_id,
			},
			authorization_token: { // Simple plain text token (should use JWT irl).
				timestamp: Date.now(),
				identifier: Identifier,
				session_id: session_id,
			},
		};
	},

	//---------------------------------------------------------------------
	// Validates AuthorizationToken.
	// Does a session lookup and returns the associated user object.
	GetSession: async function ( AuthenticatorSessionID, AuthorizationToken )
	{
		// Validate parameters.
		if ( !AuthenticatorSessionID ) { throw new Error( `Missing session id.` ); }
		if ( !AuthorizationToken ) { throw new Error( `Missing authorization.` ); }
		if ( !AuthorizationToken.timestamp ) { throw new Error( `Invalid authorization.` ); }
		if ( !AuthorizationToken.identifier ) { throw new Error( `Invalid authorization.` ); }
		// Validate request.
		if ( AuthorizationToken.session_id !== AuthenticatorSessionID ) { throw new Error( `Invalid authorization.` ); }

	},

};
```

*** Simple Authenticator Example ***

```js
const JSON_WEB_TOKEN = require( 'jsonwebtoken' );
const JWT_OPTIONS = { algorithm: 'HS256' };

const Server = ServerFactory( { ... server configuration ... } );

Server.Services.Member.Authenticator = {
	
	//---------------------------------------------------------------------
	Signin:	async function ( Identifier, Secret )
		{
			var result = {
				response: {
					status: "ok",
					created_session_id: `always-${Identifier}`,
				},
			};
			result.authorization_token = JSON_WEB_TOKEN.sign( Identifier, Server.Config.Network.network_key, JWT_OPTIONS );
			Logger.trace( `Always Authenticate > Signin for [${Identifier}]: ${result.response.status}` );
			return result;
		};


	//---------------------------------------------------------------------
	Plugin.GetSession =
		async function ( AuthenticatorSessionID, AuthorizationToken )
		{
			var identifier = JSON_WEB_TOKEN.decode( AuthorizationToken, Server.Config.Network.network_key );
			if ( AuthenticatorSessionID !== `always-${identifier}` ) { throw new Error( `Invalid Authenticator Session ID.` ); }
			var result = {
				response: {
					status: "ok",
					id: AuthenticatorSessionID,
					user: {
						id: `always-${identifier}`,
						first_name: identifier.split( '@' )[ 0 ],
						last_name: identifier.split( '@' )[ 1 ],
						primary_email_address_id: `always-${identifier}`,
						email_addresses: [
							{ id: `always-${identifier}`, email_address: identifier, },
						],
					},
				},
			};
			Logger.trace( `Always Authenticate > GetSession for [${AuthenticatorSessionID}]: ${result.response.status}` );
			return result;
		};

}

await Server.StartupServer();

```

