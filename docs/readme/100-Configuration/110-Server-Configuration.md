
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
