//---------------------------------------------------------------------
var Transport =
{

	//---------------------------------------------------------------------
	invocation_context:
		function invocation_context( ServiceName, CommandName, Parameters )
		{
			var context = {
				Method: 'post',
				ServiceName: ServiceName,
				CommandName: CommandName,
				Parameters: Parameters,
			};

			if ( !NetworkUrls ) { throw new Error( `The required parameter [NetworkUrls] is not defined.` ); }

			var service_url = NetworkUrls[ context.ServiceName ];
			if ( !service_url ) { throw new Error( `No URL defined for service [${ServiceName}].` ); }

			context.request_url = `${service_url}/${context.ServiceName}/${context.CommandName}`;
			context.request_init = {
				method: context.Method,
				headers: { 'Content-Type': 'application/json', },
			};

			// Package parameters.
			if ( [ 'get', 'head' ].includes( context.Method ) )
			{
				if ( context.Parameters )
				{
					for ( var parameter_name in context.Parameters )
					{
						if ( typeof context.Parameters[ parameter_name ] === 'undefined' ) 
						{
							context.Parameters[ parameter_name ] = null;
						}
						else if ( typeof context.Parameters[ parameter_name ] === 'object' ) 
						{
							context.Parameters[ parameter_name ] = JSON.stringify( context.Parameters[ parameter_name ] );
						}
					}
				}
				context.request_url += `?${new URLSearchParams( context.Parameters ).toString()}`;
			}
			else if ( [ 'put', 'post', 'delete' ].includes( context.Method ) )
			{
				context.request_init.body = JSON.stringify( context.Parameters );
			}

			return context;
			/*
				context = {
					Method: 'post',
					ServiceName: 'Member',
					CommandName: 'NewSession',
					Parameters: { ... },
					request_url: 'http://localhost:3000/Member/NewSession',
					request_init: { ... },
				};
			*/
		},


	//---------------------------------------------------------------------
	authorize_context:
		async function authorize_context( InvocationContext )
		{
			if ( _Connection.session_token )
			{
				// Use a secondary channel to transmit the authorization.
				InvocationContext.request_init.headers.Authorization = _Connection.session_token;
			}
			return InvocationContext;
		},


	//---------------------------------------------------------------------
	invoke_endpoint:
		async function invoke_endpoint( InvocationContext )
		{
			var fetch_response = await fetch( InvocationContext.request_url, InvocationContext.request_init );
			if ( !fetch_response ) { throw new Error( `Received an empty response from fetch.` ); }

			// Check for network errors.
			if ( !fetch_response.ok )
			{
				if ( ClientOptions.trace_authentication ) { console.error( `--- ServiceClient: Request failed. [status ${fetch_response.status}: ${fetch_response.statusText}]` ); }
				throw new TransportError( fetch_response );
			}

			// Decode and return the response.
			var api_response = await fetch_response.json();
			return api_response;
		},

};
