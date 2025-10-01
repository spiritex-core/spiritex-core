# @spiritex/spiritex-core

* Version: 0.5.0
* Dated: 2025-10-01


# Table of Contents

- [**Overview**](#000-Overview)
	- [About SpiritEx Core](#010-About-SpiritEx-Core)
	- [Concepts](#020-Concepts)
- [**Configuration**](#100-Configuration)
	- [Server Configuration](#110-Server-Configuration)
- [**Services**](#200-Services)
	- [About SpiritEx Services](#201-About-SpiritEx-Services)
	- [The Diagnostic Service](#210-The-Diagnostic-Service)
	- [The Sdk Service](#220-The-Sdk-Service)
	- [The Member Service](#230-The-Member-Service)
	- [Member Authenticators](#231-Member-Authenticators)
	- [Application Services](#250-Application-Services)
	- [Service Schema](#260-Service-Schema)
	- [Service Implementation](#270-Service-Implementation)
- [**Transports**](#300-Transports)
	- [About SpiritEx Transports](#301-About-SpiritEx-Transports)
- [**Clients**](#400-Clients)
	- [Client Sdk](#410-Client-Sdk)
- [**Utilities**](#600-Utilities)
	- [Logger](#610-Logger)
	- [SqlManager](#620-SqlManager)
	- [Generator](#630-Generator)
	- [CommandLine](#640-CommandLine)
- [**Deployment**](#700-Deployment)
	- [Docker](#710-Docker)
- [**Samples**](#800-Samples)
	- [Minimal Example](#810-Minimal-Example)


<a id="000-Overview"></a>
# Overview

<a id="010-About-SpiritEx-Core"></a>
## About SpiritEx Core


<img src="./docs/images/SpiritEx-logo-512x512.png" alt="SpiritEx Logo" width="60px" align="left">

SpiritEx `Core` is a comprehensive Node.js server library that provides the
 foundational functionality needed for building distributed service-oriented
 applications.

<img src="./docs/images/SpiritEx-Core-Overview-1.png" alt="SpiritEx Overview">

**Core Architecture**

- Modular Service Architecture: Services are organized in folders with separate schema and implementation files.
- Multi-Transport Support: InProcess, HTTP, and AMQP transports
- Built-in Standard Services: Member (authentication), Diagnostic (server info), SDK (client generation)

**Key Features**

- User Management: Complete authentication system with JWT tokens, API keys, and session management
- Dynamic SDK Generation: Automatically generates client SDKs and documentation from service schemas
- Comprehensive Logging: Structured logging with log4js
- MCP Plugin Support: Model Context Protocol integration for AI tooling
- Peer-to-Peer Networking: Services can be distributed across multiple server instances

**Dependencies & Tech Stack**

- NodeJS: Server development platform.
- Express.js: HTTP server framework
- Sequelize: ORM with MySQL2 and SQLite3 support
- AMQP: Message queue transport via amqplib
- Security: bcrypt for password hashing, JWT for tokens
- Testing: Mocha test framework

**Service Structure**

Services follow a standardized pattern:
- ServiceSchema.js: Defines API interface using JSON Schema
- ServiceService.js: Implements business logic
- Three user types: Network, Service, User with different access levels

**Transport Layer**

- HTTP: REST API with CORS support and MCP plugin
- AMQP: Message queue-based communication
- InProcess: Direct function calls for same-process services


<a id="020-Concepts"></a>
## Concepts



**Schema**

Schema is a description of data objects and functions defined by a service.
Every SpiritEx service must have a schema definition for it.
Service schemas are used by SpiritEx Core to:
- Name and parameterize transport endpoints (e.g. callable urls).
- Define database table structures. Service data objects can be mapped to database tables.
- Generate MCP Tools. Each service function becomes a tool in the MCP service.
- Generate Client SDKs. Dynamic generation of programming libraries to work with the server.
- Generate server documentation. SDK documentation constructed from service schema metadata.

**Network**

A network is group of SpiritEx Core servers that are configured to work together.
All servera in a network share the same the services, schema, and network urls.
The network urls list each service on the network and the url to locate it.
A network is a single logical server that can be scaled by adding more servers.

**Network Architecture**

Through configuration, SpiritEx `Core` can be configured to run as a standalone
 server or as a client of another SpiritEx server.
A SpiritEx server can be run with only certain services enabled and rely upon
 other servers for the disabled services.
A group of SpiritEx servers that are configured to work together constitute
 a `Network` and represents a single logical server.
Services can be scaled individually by running multiple server instances
 behind load balancers and proxies.

**Peer Networking**

SpiritEx `Core` provides a peer-to-peer network for server-to-server communication.
During startup, SpiritEx `Core` will generate a `ServiceClient` module that is
 designed to be used as a client for all Services running on the network.
Application services can call other services in the network, regardless of
 which server instance those services are running on.

**Server Configuration**

SpiritEx servers are driven by a single json configuration object, split into
 logical sections, that controls the server's behavior.

This configuration object is used to customize the following `Core` features:
- Server startup and shutdown.
- Service registration and discovery.
- User authentication and authorization.
- Logging and monitoring.
- Database access and management.

**Service Definitions**

Service APIs are described by a json schema that defines a service's data objects,
 its commands, command paramters, and command return values.
SpiritEx `Core` provides schema extensions to support an underlying database table.
This schema drives the behavior of the following `Core` features:
- Transport endpoint naming and parameters.
- Database table structures.
- MCP Tool Generation
- Client SDK generation.
- Server documentation.


<a id="100-Configuration"></a>
# Configuration

<a id="110-Server-Configuration"></a>
## Server Configuration


Server configuration is provided by a configuration object that can be read from a JSON file or created in code.
It is typical practice to have different configuration files for each server instance or environment.
For example, you might have a configuration files for testing, staging, and production.

The Server Configuration object has these basic sections:
- General: Contains the server name, version, and other general information.
- Logger: Controls the logger output.
- Network: Controls the network settings. The network describes a set of servers and their hosted services. 
	- Credentials: Contains the network credentials. Used by applications when making service calls within the network.
	- Urls: Contains the urls for each service. These urls can point to the local server instance or to another server in the network. This is used by the Client SDK when making service calls.
- Transports: Enable, disable, and configure the three transports: InProcess, Http, and Amqp.
- Services: Enable, disable, and configure the services hosted by the server.


<a id="200-Services"></a>
# Services

<a id="201-About-SpiritEx-Services"></a>
## About SpiritEx Services


**Service Schema**

Service structure is defined by json schema.
It describes data objects used by the service in addition to service commands.

**User Types**

There are three main user types in the network:
- Network: This is the highest level of access. It can access all services in the network.
- Service: Used by services, it allows services to call each other.
- User: Used by applications, it allows applications to call services on behalf of users.

All three of these user types require a user account such as those managed by the `Member Service`.
This allows services to track who is calling which endpoints.
Services can also further segeregate certian users by emplying the `metadata` field of the user account.


<a id="210-The-Diagnostic-Service"></a>
## The Diagnostic Service


The `Diagnostic Service` is publicly available and provides server information.
It can be used to verify that the server is running and obtain platform information.

***Methods***

| Method | Description |
| :--- | :--- |
| **ServerInfo**() | Gets server info. |
| **ServerError**() | Throws a server error. |


<a id="220-The-Sdk-Service"></a>
## The Sdk Service


The `Sdk Service` is also publicly available and provides access to the server's Client SDKs and documentation.
It can be used to obtain the Client SDK for a specific service and user type.
It can also be used to obtain schema and documentation for network services.

***Methods***

| Method | Description |
| :--- | :--- |
| **NetworkUrls**() | Gets the server addresses for all services on the network. |
| **Schema**( UserType ) | Gets the schema for all services hosted by this server. |
| **Client**( Transport, Platform, UserType ) | Downloads the SDK Client as a single source file for the target transport and platform. |
| **Documentation**( Transport, Platform, UserType, UseLinks ) | Downloads the SDK documentation as a single markdown file. |


<a id="230-The-Member-Service"></a>
## The Member Service


The `Member Service` is responsible for user management, authentication, and authorization.
It runs on top of an `Identity Provider` service (such as Clerk) which associates a user's email address with a password.

***Available Identity Providers***
- **Local** : Uses the local database to manage users and credentials.
- **Clerk** : Uses Clerk [https://clerk.com/] to manage users and authentication.
- **ClerkMock** : Uses a mock identity provider for testing purposes (always authenticates).

It is used to manage members and their access to the server.
It is also used by users to authenticate with the server.
This service can be disabled or overwritten by a custom implementation.

***Methods***

| Method | Description |
| :--- | :--- |
| **NewSession**( Strategy, Identifier, Secret ) | Authenticate with the network and retrieve a new network session and token. The new token is also returned in the Authorization header of the response |
| **NewNetworkToken**() | Generate a new network token for an existing session. The new token is also returned in the Authorization header of the response. |
| **GetMySession**() | Gets this session. |
| **ListMyApiKeys**() | Lists the ApiKeys owned by the current user. |
| **CreateMyApiKey**( Description, ExpirationMS ) | Creates an ApiKey for the current user. |
| **DestroyMyApiKey**( ApiKeyID ) | Destroys an ApiKey. |
| **GetMyApiKey**( ApiKeyID ) | Retrieves an ApiKey. |
| **LockMyApiKey**( ApiKeyID ) | Locks an ApiKey on the network. |
| **UnlockMyApiKey**( ApiKeyID ) | Unlocks an ApiKey on the network. |

Many more `Member` commands exist to manage sessions, api keys, etc.


<a id="231-Member-Authenticators"></a>
## Member Authenticators


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



<a id="250-Application-Services"></a>
## Application Services


Applications using `Core` can define and host new application services.
All services are remotable with any of the defined transports.
Application services are defined in a folder and provide files that define the service via a schema and
 an implementation file that codes the details of the service commands.

The distinction between schema and implementation is important because they are loaded
 at different points within the Server's intialization.

**Service Folder Structure**

The server configuration file contains an entry for `services_folder` which specifies the root folder
 where the application's service files will be found.
This root folder will have a subfolder named for each application service.

```
Services/					<--- services_folder
	|_ Calc/				<--- Calc Service
		|_ CalcSchema.js
		|_ CalcService.js
		|_ other-files.js
	|_ Echo/				<--- Echo Service
	...
```


<a id="260-Service-Schema"></a>
## Service Schema


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


<a id="270-Service-Implementation"></a>
## Service Implementation

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


<a id="300-Transports"></a>
# Transports

<a id="301-About-SpiritEx-Transports"></a>
## About SpiritEx Transports



<a id="400-Clients"></a>
# Clients

<a id="410-Client-Sdk"></a>
## Client Sdk


The server can generate a client SDK and documentation for each service.
The SDK is generated from the service schema and can be used to access the service from a client application.
The documentation is generated from the service schema and can be used to understand the service's interface.

The resulting Client SDK and documentation will contain all services defined in the server.
This includes services that are disabled in the service's configuration.
In these cases, the Client SDK will rely on the `Client.Urls` configuration to access the correct service implementation.

The Client SDK is self-contained and can be used to access services from any application.
The Client SDK can also be used by Javascript applications running in a browser.
Part od the Server's initialization is to generate a complete set of Client SDKs for all services defined in the network.
It then loads the Client SDK and exposes it to applications via the `Server.ServiceClient` object.
This allows applications to access any service in the network without having to know the specific server that hosts the service.

When the Client SDK is generated, it is generated for each of the three main user types: Network, Service, and User.


<a id="600-Utilities"></a>
# Utilities

<a id="610-Logger"></a>
## Logger



<a id="620-SqlManager"></a>
## SqlManager



<a id="630-Generator"></a>
## Generator



<a id="640-CommandLine"></a>
## CommandLine



<a id="700-Deployment"></a>
# Deployment

<a id="710-Docker"></a>
## Docker



<a id="800-Samples"></a>
# Samples

<a id="810-Minimal-Example"></a>
## Minimal Example


```shell
npm install --save @spiritex/spiritex-core
```

```js
const ServerFactory = require( '@spiritex/spiritex-core'  );
const ServerConfig = require( './Config.js' );
const Server = ServerFactory( ServerConfig );

await Server.InitializeServer();
await Server.StartupServer();

...

await Server.ShutdownServer();
```


