'use strict';

const ASSERT = require( 'assert' );
const PATH = require( 'path' );

const ServerConfigPath = PATH.join( __dirname, 'TestServer', 'ServerConfig.js' );
const ServerConfig = require( ServerConfigPath );

const ServerModulePath = PATH.join( __dirname, '..', 'src', 'Server', 'Server.js' );
const Server = require( ServerModulePath )( ServerConfig );

//---------------------------------------------------------------------
describe( `000) RunServer Tests`, function ()
{

	//---------------------------------------------------------------------
	before( 'Startup',
		async function ()
		{
			await Server.StartupServer();
			return;
		} );


	//---------------------------------------------------------------------
	after( 'Shutdown',
		async function ()
		{
			// await new Promise( resolve => setTimeout( resolve, 1000 ) ); // Wait for sequelize transactions to complete!
			await Server.ShutdownServer();
			return;
		} );


	//---------------------------------------------------------------------
	it( `run server for 10 minutes`,
		async function ()
		{
			ASSERT.ok( Server );
			var minutes = 10;
			console.log( `Running for ${minutes} minutes.` );
			for ( var minute = 1; minute <= minutes; minute++ )
			{
				await Server.Utilities.Sleep( 1000 * 60 );
				console.log( `Minute ${minute} of ${minutes}.` );
			}
			return;
		} );


	//---------------------------------------------------------------------
	return;
} );
