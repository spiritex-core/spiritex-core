'use strict';

const PATH = require( 'path' );

const SECOND_MS = ( 1 * 1000 );
const MINUTE_MS = ( 60 * SECOND_MS );
const HOUR_MS = ( 60 * MINUTE_MS );
const DAY_MS = ( 24 * HOUR_MS );
const WEEK_MS = ( 7 * DAY_MS );
const MONTH_MS = ( 30 * DAY_MS );
const YEAR_MS = ( 365 * DAY_MS );


module.exports = {

	//---------------------------------------------------------------------
	// General
	//---------------------------------------------------------------------

	server_name: 'UnitTests',
	server_version: '0.0.1',
	server_address: 'localhost', // public address


	//---------------------------------------------------------------------
	// Network
	//---------------------------------------------------------------------

	Network: {
		network_name: 'local',
		network_key: 'used-to-encrypt-network-secrets',
	},


	//---------------------------------------------------------------------
	// Logger
	//---------------------------------------------------------------------

	Logger: {
		// Log Levels: silly, trace, debug, info, warn, error, fatal, or OFF
		message_log_level: 'OFF',
		data_log_level: 'OFF',
		service_name_width: 15,
		attach_to_express: false,
		log_direct_to_console: true,
		print_timestamp: true,
		print_log_level: true,
	},


	//---------------------------------------------------------------------
	// Transports
	//---------------------------------------------------------------------

	Transports: {},


	//---------------------------------------------------------------------
	// Services
	//---------------------------------------------------------------------

	Services: {},


};
