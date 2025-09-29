'use strict';


//---------------------------------------------------------------------
const SERVER_NAME = "";
const SERVER_VERSION = "";
const API_TYPE = "";
const NETWORK_URLS = null;


//---------------------------------------------------------------------
if ( typeof module !== 'undefined' ) 
{
	module.exports = NewServiceClient;
}
if ( typeof window !== 'undefined' ) 
{
	if ( typeof window.SpiritEx === 'undefined' ) { window.SpiritEx = {}; }
	window.SpiritEx.NewServiceClient = NewServiceClient;
}


//---------------------------------------------------------------------
function NewServiceClient( NetworkUrls, NetworkCredentials, ClientOptions = null )
{
	if ( !NetworkUrls && NETWORK_URLS ) { NetworkUrls = NETWORK_URLS; }
	if ( !ClientOptions ) 
	{
		ClientOptions = {
			log_requests: false,			// Log all requests to the console.
			log_responses: false,			// Log all responses to the console.
			trace_authentication: false,	// Trace the authentication process.
			throw_handled_errors: false,	// Throw errors that are already handled by the client.
			Callbacks: {},
		};
	}
	var ClientCallbacks = ClientOptions.Callbacks;
	if ( !ClientCallbacks ) 
	{
		ClientCallbacks = {
			OnApiResult: null,				// async function ( ApiResult ) { },
			OnError: null,					// async function ( Message ) { },
			OnAuthorizationUpdated: null,	// async function ( AuthorizationToken ) { },
			Authenticate: null,				// async function ( ThisClient ) { },
		};
	}


	//---------------------------------------------------------------------
	class TransportError extends Error
	{
		constructor( Response )
		{
			super( `TransportError: [${Response.status}] ${Response.statusText}` );
			this.name = 'TransportError';
			this.Response = Response;
			return;
		}
	}


	//---------------------------------------------------------------------
	class ApiError extends Error
	{
		constructor( ApiResponse )
		{
			super( ApiResponse.error );
			this.name = 'ApiError';
			this.ApiResponse = ApiResponse;
			return;
		}
	}


	//---------------------------------------------------------------------
	var _Connection =
	{
		session_token: null,
	};
	if ( NetworkCredentials && NetworkCredentials.session_token ) { _Connection.session_token = NetworkCredentials.session_token; }


	//---------------------------------------------------------------------
	async function on_session_changed( Session )
	{
		if ( ClientOptions.trace_authentication ) { console.log( `--- ServiceClient: Obtained a new session. [${Session.session_id}]` ); }
		return;
	}


	//---------------------------------------------------------------------
	async function on_token_changed( Token )
	{
		_Connection.session_token = Token;
		var token_text = `${Token.substring( 0, 19 )} ... ${_Connection.session_token.substring( Token.length - 20 )}`;
		if ( ClientOptions.trace_authentication ) { console.log( `--- ServiceClient: Obtained a new network token: [${token_text}]` ); }
		if ( ClientCallbacks.OnAuthorizationUpdated ) { ClientCallbacks.OnAuthorizationUpdated( _Connection.session_token ); }
		return;
	}


	//---------------------------------------------------------------------
	async function renew_session()
	{
		try
		{
			var session = null;
			if ( ClientCallbacks.Authenticate ) 
			{
				if ( ClientOptions.trace_authentication ) { console.log( `--- ServiceClient: Renewing session. Authenticating via client callback.` ); }
				session = await ClientCallbacks.Authenticate();
			}
			if ( !session && NetworkCredentials && NetworkCredentials.apikey && NetworkCredentials.passkey )
			{
				if ( ClientOptions.trace_authentication ) { console.log( `--- ServiceClient: Renewing session. Authenticating via apikey.` ); }
				session = await ServiceClient.Member.NewSession( 'apikey', NetworkCredentials.apikey, NetworkCredentials.passkey );
			}
			if ( !session && NetworkCredentials && NetworkCredentials.user_email && NetworkCredentials.password )
			{
				if ( ClientOptions.trace_authentication ) { console.log( `--- ServiceClient: Renewing session. Authenticating via email.` ); }
				session = await ServiceClient.Member.NewSession( 'email', NetworkCredentials.user_email, NetworkCredentials.password );
			}
			if ( !session && NetworkCredentials && NetworkCredentials.session_token )
			{
				if ( ClientOptions.trace_authentication ) { console.log( `--- ServiceClient: Renewing token.` ); }
				session = await ServiceClient.Member.NewNetworkToken();
			}
			if ( !session ) { throw new Error( 'Failed to renew session.' ); }
			if ( session.error ) { throw new Error( `Session Error: ${session.error}` ); }

			return true;
		}
		catch ( error )
		{
			if ( ClientOptions.trace_authentication ) { console.error( `--- ServiceClient: Error getting new network session: ${error.message}` ); }
			return false;
		}
	}


	//---------------------------------------------------------------------
	async function call_api( InvocationContext )
	{
		try
		{

			// Call the Service.
			var api_response = null;
			var attempt = 0;
			while ( true )
			{
				if ( attempt >= 3 ) 
				{
					if ( ClientOptions.trace_authentication ) { console.error( '--- ServiceClient: Third retry failed. Giving up.' ); }
					api_response = {
						ok: false,
						error: 'Third retry failed. Giving up.',
					};
					break;
				}

				// Log requests.
				var log_header = '';
				if ( ClientOptions.log_requests )
				{
					var parameters = JSON.parse( JSON.stringify( InvocationContext.Parameters ) );
					if ( parameters.Secret ) { parameters.Secret = '*****'; }
					console.log( `${log_header} -->> ${InvocationContext.ServiceName} [${InvocationContext.CommandName}]`, parameters );
				}

				// Authorize context to pickup a session/token refresh.
				InvocationContext = await Transport.authorize_context( InvocationContext );

				// Request the response.
				attempt++;
				api_response = await Transport.invoke_endpoint( InvocationContext );
				if ( ClientCallbacks.OnApiResult ) { await ClientCallbacks.OnApiResult( api_response ); }

				// Check to renew session or token.
				if ( api_response.ok )
				{
					if ( api_response.return_authorization )
					{
						await on_token_changed( api_response.return_authorization );
					}
				}
				else
				{
					// Check for 'Unauthenticated' errors.
					if ( api_response.error === 'Unauthenticated' )
					{
						if ( ClientOptions.trace_authentication ) { console.log( `--- ServiceClient: Unauthenticated. Getting a new network session. (retry ${attempt}).` ); }
						if ( !await renew_session() ) { throw new Error( 'Failed to renew session.' ); }
						continue; // Try again
					}
				}

				break;
			}

			// Log responses.
			if ( ClientOptions.log_responses )
			{
				console.log( `${log_header} <<-- ${InvocationContext.ServiceName} [${InvocationContext.CommandName}]`, api_response );
			}

			// Handle API Errors.
			if ( api_response.error )
			{
				// throw new Error( api_response.error );
				throw new ApiError( api_response );
			}

			// Return the result.
			return api_response.result;

		}
		catch ( error )
		{
			var throw_error = null;

			// Process the error.
			var error_handled = false;
			if ( error instanceof TransportError )
			{
				throw_error = new Error( `In command [${InvocationContext.CommandName}], Transport Error: ${error.message}` );
			}
			else if ( error instanceof ApiError )
			{
				throw_error = new Error( `In command [${InvocationContext.CommandName}], Api Error: ${error.message}` );
			}
			else
			{
				var message = `In command [${InvocationContext.CommandName}]; ${error.message}`;
				if ( error.cause && error.cause.code ) { message += ` [${error.cause.code}]`; }
				if ( ClientCallbacks.OnError ) 
				{
					var result = await ClientCallbacks.OnError( message );
					if ( result ) { error_handled = true; }
				}
				throw_error = new Error( message );
			}

			// Throw the error.
			if ( error_handled ) 
			{
				if ( ClientOptions.throw_handled_errors )
				{
					// Was handled, but we are configured to throw it anyway.
					throw throw_error;
				}
			}
			else
			{
				// Unhandled errors are always thrown.
				throw throw_error;
			}
		}
		return;
	}


	//---------------------------------------------------------------------
	// Transport Implementation
	//---------------------------------------------------------------------

	var Transport = {};


	//---------------------------------------------------------------------
	// Service Client
	//---------------------------------------------------------------------

	var ServiceClient = {};

	ServiceClient.SessionInfo = function ()
	{
		return JSON.parse( JSON.stringify( _Connection ) );
	};


	//---------------------------------------------------------------------
	// Service Commands
	//---------------------------------------------------------------------

	ServiceClient.Commands = {};


	//---------------------------------------------------------------------
	return ServiceClient;
}
