# SpiritEx Http Client


## Usage

Include this source file into your codebase.
It will automatically register itself as a module if possible, or as a global variable if not.

Initialize the client by calling the `NewServiceClient` function and passing in the network service urls and credentials.

The return object contains all services and commands available on the network.
Each service contains all the commands available for that service.
Each command is a function that takes the command parameters as arguments and returns a promise.
The promise resolves to the API response.


### Example

```bash
npm install --save @spiritex/spiritex-client
```

```javascript
// For NodeJS:
const NewServiceClient = require( '@spiritex/spiritex-client' );
const Client = NewServiceClient( NetworkUrls, NetworkCredentials, ClientOptions );
var server_info = await Client.Diagnostic.ServerInfo();
```

```javascript
// For Browser:
// Include source file: 
const Client = window.SpiritEx.NewServiceClient( NetworkUrls, NetworkCredentials, ClientOptions );
var server_info = await Client.Diagnostic.ServerInfo();
```


## Network Urls

`NetworkUrls` is an object describing the urls for each service on the network:
```js
var NetworkUrls =
{
	Member: 'https://member-api.spiritex.live',
	Market: 'https://market-api.spiritex.live',
	Directory: 'https://directory-api.spiritex.live',
	...
};
```


## Network Credentials

The `NetworkCredentials` is an object containing the credentials to use for authentication:
```js
var NetworkCredentials =
{
	user_email: 'user@example.com',
	password: 'password',
	apikey: 'apikey',
	passkey: 'passkey',
};
```
`NetworkCredentials` requires that at least one of the `apikey/passkey` or `user_email/password` credentials are provided.
If both are present, then the `apikey/passkey` will be used as the preferred method to authenticate.

To establish a `user_email/password`, you must signup to the SpiritEx network from its main website.
Once established on the network, you can create and manage `apikey/passkey` pairs from the SpiritEx website.


## Client Options

`ClientOptions` is an object containing the following properties:
```js
var ClientOptions =
{
	log_requests: false, // Log all requests to the console.
	log_responses: false, // Log all responses to the console.
	trace_authentication: false, // Trace the authentication process.
	throw_handled_errors: false, // Throw errors that are already handled by the client.
	Callbacks: {
		OnApiResult: async function ( ApiResult ) { },  // Called after every API call.
		OnError: async function ( Message ) { }, // Called when an error occurs.
		OnAuthorizationUpdated: async function ( AuthorizationToken ) { }, // Called when the authorization token is updated.
		Authenticate: async function ( ThisClient ) { }, // Called when the client needs to authenticate. Required if not using NetworkCredentials.
	},
};
```


## SpiritEx API

The SpiritEx API is organized into services containing commands that can be called by the client.
The client mirrors this structure and provides access to the API commands through a set of service objects.
Each service contains all the commands available for that service.
Each command is a function that takes the command parameters as arguments and returns a promise.
This promise resolves to the API response.

### Example

```javascript
// Get diagnostic information about the server.
var server_info = await Client.Diagnostic.ServerInfo();
// Get session info for the current user.
var session = await Client.Member.GetMySession();
// Create a market account.
var account = await Client.Market.OpenAccount( 'My Account' );
// Use the account to make a trade.
var order = await Client.Market.CreateOrder( 'buy', offering.offering_id, account.account_id, session.user_id, 1, 100, '*' );
```

Refer to the SpiritEx-API document for detailed information on each command and its parameters.


## Authentication

The client handles all the details of authentication and session management.
The application initializes the client with the credentials needed to authenticate.
There are two ways to provide the credentials:
1. Using the `NetworkCredentials` object.
2. Using the `ClientOptions.Callbacks.Authenticate` function.
The client performs this authentication transparently when calling any service command.

After creating a new client, the first call to any service command will trigger the authentication process.
Subsequent calls will reuse the existing authentication until it expires or becomes invalid.
In that case, the client will automatically renew the authentication as needed.

You can call the `GetMySession` command to refresh the authentication and get the current session information.

```javascript
var session = await Client.Member.GetMySession();
```

### Authentication using NetworkCredentials

The client will automatically authenticate using the `NetworkCredentials` if provided.
When an `apikey/passkey` pair is present within `NetworkCredentials`, the client will use those credentials to authenticate.
Otherwise, the client will use the `user_email/password` pair to authenticate.


### Authentication using ClientOptions.Callbacks.Authenticate

If `NetworkCredentials` is not provided, the `ClientOptions.Callbacks.Authenticate` function will be called to authenticate.
The `Authenticate` function should return a promise that resolves to the API response from the `Member.NewSession` command.
The function is free to use employ any strategy to obtain credentials and authenticate with the network.

```js
var ClientOptions = {
	Callbacks: {
		Authenticate: async function ( ThisClient ) 
		{
			// Get user_email and password from somewhere. (e.g. prompt user, from storage, etc.)
			return await ThisClient.Member.NewSession( 'email', user_email, password );
			// Or maybe use apikey/passkey.
			return await ThisClient.Member.NewSession( 'apikey', apikey, passkey );
		},
	},
};
```

