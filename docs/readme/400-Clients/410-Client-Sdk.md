
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
