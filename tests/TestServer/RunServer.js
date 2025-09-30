'use strict';

const PATH = require( 'path' );
const ServerModulePath = PATH.join( __dirname, '..', '..', 'src', 'Server', 'Server.js' );

const ServerConfig = require( './ServerConfig' );
const Server = require( ServerModulePath )( ServerConfig );


//---------------------------------------------------------------------
// Graceful server shutdown.
//---------------------------------------------------------------------

async function graceful_shutdown()
{
	if ( Server == null ) { return; }

	console.log( `Shutdown signaled.` );
	setTimeout( () =>
	{
		console.log( 'Shutdown timeout exceeded (5s). Forcing process exit in 1.5s.' );
		setTimeout( () => 
		{
			console.log( `Process is forcing exit ...` );
			process.exit( 1 );
		}, 1500 );
	}, 5000 );

	await Server.ShutdownServer();

	console.log( 'Exiting process in 250ms.' );
	setTimeout( () => 
	{
		console.log( `Process is exiting normally ...` );
		process.exit( 0 );
	}, 250 );
	return;
}
process.on( 'SIGINT', async function () { await graceful_shutdown(); } );
process.on( 'SIGTERM', graceful_shutdown );


//---------------------------------------------------------------------
// Start server.
//---------------------------------------------------------------------

( async function ()
{
	await Server.StartupServer();
}() );
