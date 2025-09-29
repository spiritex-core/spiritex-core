
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
