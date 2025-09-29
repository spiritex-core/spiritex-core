//---------------------------------------------------------------------
var Transport =
{

	//---------------------------------------------------------------------
	invocation_context:
		function invocation_context( ServiceName, CommandName, Parameters )
		{
			var context = {
				ServiceName: ServiceName,
				CommandName: CommandName,
				Parameters: Parameters,
			};
			return context;
		},


	//---------------------------------------------------------------------
	authorize_context:
		async function authorize_context( InvocationContext )
		{
			// There is no secondary channel for the InProcess transport.
			return InvocationContext;
		},


	//---------------------------------------------------------------------
	invoke_endpoint:
		async function invoke_endpoint( InvocationContext )
		{
			if ( !ClientOptions.Server ) { throw new Error( `No server defined in client options.` ); }
			var api_response = await ClientOptions.Server.Transports.InProcess.InvokeEndpoint(
				InvocationContext.ServiceName,
				InvocationContext.CommandName,
				InvocationContext.Parameters,
				_Connection.session_token );
			return api_response;
		},

};
