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

			//---------------------------------------------------------------------
			DiagnosticServerInfo: {
				type: 'object',
				description: 'The user object.',
				properties: {
					network_name: { type: 'string', description: 'The name of the network.' },
					network_time: { type: 'string', description: 'The current time on the network.' },
					server_name: { type: 'string', description: 'The name of the server.' },
					server_address: { type: 'string', description: 'The address of the server.' },
					server_version: { type: 'string', description: 'The version of the server.' },
					server_time: { type: 'string', description: 'The current time on the server.' },
					server_start: { type: 'string', description: 'The time the server started.' },
					server_memory: { type: 'number', description: 'The current memory usage of the server.' },
					total_memory: { type: 'number', description: 'The total memory available to the server.' },
					package_name: { type: 'string', description: 'The name of the server package.' },
					package_version: { type: 'string', description: 'The version of the server package.' },
				},
			},

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


		ServerInfo: {
			description: 'Gets server info.',
			groups: [],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {},
				required: [],
			},
			Returns: {
				type: 'object',
				$Object: 'DiagnosticServerInfo',
			},
		},

		ServerError: {
			description: 'Throws a server error.',
			groups: [],
			// http: { verb: 'get' },
			Arguments: {
				type: 'object',
				properties: {},
				required: [],
			},
			Returns: {
				type: 'object',
				properties: {}
			},
		},

	};
};
