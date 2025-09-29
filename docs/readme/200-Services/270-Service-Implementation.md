The service implementation file will be named after the service (e.g. `EchoService.js`).
This file is read during the server startup and is used to create the service object.

The service implementation file is provided with an instance of the `Server` object.
This allows the service implementation to access the server's configuration and other services.

```js
'use strict';
// Services/Echo/EchoService.js
// Implementation file for the Echo service.

const SERVICE_NAME = 'Echo';

module.exports = function ( Server )
{
	var Logger = Server.LogManager.NewLogger( { service: SERVICE_NAME } );

	//---------------------------------------------------------------------
	var Service = {
		_Control: {
			service_name: SERVICE_NAME,
			service_enabled: Server.Config.Services[ SERVICE_NAME ].enabled,
			Startup:
				async function ()
				{
					Logger.debug( `Starting ${SERVICE_NAME} service ...` );
					Logger.debug( `${SERVICE_NAME} service started.` );
					return;
				},
			Shutdown:
				async function ()
				{
					Logger.debug( `Shutting down ${SERVICE_NAME} service ...` );
					Logger.debug( `${SERVICE_NAME} service stopped.` );
					return;
				},
		},
	};

	//---------------------------------------------------------------------
	Service.EchoText =
		async function ( Text, ApiContext )
		{
			Logger.debug( `Echoing the text: [${Text}].` );
			return Text;
		};

	//---------------------------------------------------------------------
	Service.ReverseText =
		async function ( Text, ApiContext )
		{
			Logger.debug( `Reversing the text: [${Text}].` );
			var text = Text.split( '' ).reverse().join( '' );
			return text;
		};

	//---------------------------------------------------------------------
	return Service;
}
```
