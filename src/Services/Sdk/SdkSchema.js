'use strict';


module.exports = function ( Server )
{
	return {


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//   ██████  ██████       ██ ███████  ██████ ████████ ███████ 
		//  ██    ██ ██   ██      ██ ██      ██         ██    ██      
		//  ██    ██ ██████       ██ █████   ██         ██    ███████ 
		//  ██    ██ ██   ██ ██   ██ ██      ██         ██         ██ 
		//   ██████  ██████   █████  ███████  ██████    ██    ███████ 
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		$Objects: {

			// //---------------------------------------------------------------------
			// DiagnosticServerInfo: {
			// 	type: 'object',
			// 	description: 'The user object.',
			// 	properties: {
			// 		network_name: { type: 'string', description: 'The name of the network.' },
			// 		network_time: { type: 'string', description: 'The current time on the network.' },
			// 		server_name: { type: 'string', description: 'The name of the server.' },
			// 		server_time: { type: 'string', description: 'The current time on the server.' },
			// 		server_start: { type: 'string', description: 'The time the server started.' },
			// 		server_hostname: { type: 'string', description: 'The hostname of the server.' },
			// 		server_memory: { type: 'number', description: 'The current memory usage of the server.' },
			// 		total_memory: { type: 'number', description: 'The total memory available to the server.' },
			// 		package_name: { type: 'string', description: 'The name of the server package.' },
			// 		package_version: { type: 'string', description: 'The version of the server package.' },
			// 	},
			// },

		},


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//
		//   ██████  ██████  ███    ███ ███    ███  █████  ███    ██ ██████  ███████ 
		//  ██      ██    ██ ████  ████ ████  ████ ██   ██ ████   ██ ██   ██ ██      
		//  ██      ██    ██ ██ ████ ██ ██ ████ ██ ███████ ██ ██  ██ ██   ██ ███████ 
		//  ██      ██    ██ ██  ██  ██ ██  ██  ██ ██   ██ ██  ██ ██ ██   ██      ██ 
		//   ██████  ██████  ██      ██ ██      ██ ██   ██ ██   ████ ██████  ███████ 
		//
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		NetworkUrls: {
			description: 'Gets the (json) server addresses for all services on the network.',
			groups: [],
			Arguments: {
				type: 'object',
				properties: {},
				required: [],
			},
			Returns: {
				type: 'object',
				description: 'All services and server addresses available on this network.'
			},
		},

		Schema: {
			description: 'Gets the (json) schema for all services hosted by this server.',
			groups: [],
			Arguments: {
				type: 'object',
				properties: {
					UserType: { type: 'string', description: 'The type of user the client is (default: "" anonymous).' },
				},
				required: [],
			},
			Returns: {
				type: 'object',
				description: 'The json schema for all services hosted by this server.'
			},
		},

		Client: {
			description: 'Downloads the SDK Client as a single source file for the target transport and platform.',
			groups: [],
			Arguments: {
				type: 'object',
				properties: {
					Transport: { type: 'string', description: 'The transport the client will be using (default: "http").' },
					Platform: { type: 'string', description: 'The platform the client is running on (default: "js").' },
					UserType: { type: 'string', description: 'The type of user the client is (default: "" anonymous).' },
				},
				required: [],
			},
			Returns: {
				type: 'string',
				description: 'The content of the client sdk for the specified platform and user type as a single source file.'
			},
		},

		Documentation: {
			description: 'Downloads the SDK documentation as a single markdown file.',
			groups: [],
			Arguments: {
				type: 'object',
				properties: {
					Transport: { type: 'string', description: 'The transport the client will be using (default: "http").' },
					Platform: { type: 'string', description: 'The platform the client is running on (default: "js").' },
					UserType: { type: 'string', description: 'The type of user the client is (default: "" anonymous).' },
					UseLinks: { type: 'boolean', description: 'Use reference links throughout the document (default: false).' },
				},
				required: [],
			},
			Returns: {
				type: 'string',
				description: 'The content of the sdk documentation as a single source file.'
			},
		},

	};
};
