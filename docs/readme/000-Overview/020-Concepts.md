

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
