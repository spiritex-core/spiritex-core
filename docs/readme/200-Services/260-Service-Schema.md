
The service schema will be named after the service (e.g. `EchoSchema.js`).
Each service can use json schema to define custom objects that are used by the service.
The service schema also defines the service's interface so that transports can make its endpoints available to applications.

When the schema is loaded, is provided with an instance of the `Server` object.
This allows the schema to access the server's configuration and other services.

The service schema provides the structure to provide service entry points for each transport.
The service schema is also used to generate client documentation and SDKs for services (see the Sdk service).

```js
'use strict';
// Services/Echo/EchoSchema.js
// Definition file for the Echo service.

module.exports = function ( Server )
{
	return {

		$Objects: {}, // This service has no objects defined

		//---------------------------------------------------------------------
		// Echos the given text. Echo.EchoText( 'Hello' ) --> 'Hello'
		EchoText: {
			description: 'Echoes the given text.',
			groups: [],
			Arguments: { // <-- Json schema describing the command arguments
				type: 'object',
				properties: {
					Text: { type: 'string', description: 'The text to echo.' },
				},
				required: [ 'Text' ],
			},
			Returns: { // <-- Json schema describing the return value
				type: 'string',
				description: 'The echoed text.',
			},
		},

		//---------------------------------------------------------------------
		// Reverses the given text. Echo.ReverseText( 'Hello' ) --> 'olleH'
		ReverseText: {
			description: 'Reverses the given text.',
			groups: [],
			Arguments: {
				type: 'object',
				properties: {
					Text: { type: 'string', description: 'The text to be reversed.' },
				},
				required: [ 'Text' ],
			},
			Returns: {
				type: 'string',
				description: 'The reversed text.',
			},
		},

	};
};
```
