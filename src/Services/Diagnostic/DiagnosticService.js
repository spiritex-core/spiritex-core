'use strict';

module.exports = function ( Server )
{
	var StartTime = new Date();

	//---------------------------------------------------------------------
	var Schema = require( './DiagnosticSchema' )( Server );
	var Service = Server.Utilities.NewService( Server, 'Diagnostic', Schema );


	//---------------------------------------------------------------------
	Service.ServerInfo =
		async function ( SessionUser, Parameters )
		{
			const timestamp = new Date();
			const package_json = require( '../../../package.json' );
			const memory_usage = process.memoryUsage();
			var server_info = {
				network_name: Server.Config.Network.network_name,
				network_time: timestamp.toISOString(),
				server_name: Server.Config.server_name,
				server_address: Server.Config.server_address,
				server_version: Server.Config.server_version,
				server_time: timestamp.toLocaleString(),
				server_start: StartTime.toLocaleString(),
				// server_address: Server.Config.Transports.Http.server_address,
				server_memory: memory_usage.heapUsed, // heapUsed - Heap memory actually used by JavaScript objects
				total_memory: memory_usage.heapTotal, // heapTotal - Total heap allocated by V8
				package_name: package_json.name,
				package_version: package_json.version,
			};
			return server_info;
		};


	//---------------------------------------------------------------------
	Service.ServerError =
		async function ( SessionUser, Parameters )
		{
			var message = 'Here is your error. I hope you find it useful.';
			throw new Error( message );
		};


	//---------------------------------------------------------------------
	return Service;
}

