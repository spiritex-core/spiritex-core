
The `Diagnostic Service` is publicly available and provides server information.
It can be used to verify that the server is running and obtain platform information.

***Methods***
- **ServerInfo**() : Gets server info.
- **ServerError**() : Throws a server error.


### Sdk Service

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
