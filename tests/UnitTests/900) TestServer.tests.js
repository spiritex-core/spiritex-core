'use strict';

const ASSERT = require( 'assert' );
const PATH = require( 'path' );

var ServerFactory = require( '../../src/Server/Server' );
var Server = null;


//---------------------------------------------------------------------
describe( `900) TestServer Unit Tests`, function ()
{

	//---------------------------------------------------------------------
	before( 'Startup',
		async function ()
		{
			const ServerConfig = require( '../TestServer/ServerConfig' );
			ServerConfig.Logger.message_log_level = 'OFF';
			ServerConfig.Logger.data_log_level = 'OFF';
			Server = ServerFactory( ServerConfig );
			await Server.InitializeServer();
			await Server.StartupServer();
			return;
		} );


	//---------------------------------------------------------------------
	after( 'Shutdown',
		async function ()
		{
			// await new Promise( resolve => setTimeout( resolve, 1000 ) ); // Wait for sequelize transactions to complete!
			await Server.ShutdownServer();
			Server = null;
			return;
		} );


	//---------------------------------------------------------------------
	describe( `Diagnostic Service Tests`, function ()
	{

		//---------------------------------------------------------------------
		it( `should get server info`,
			async function ()
			{
				var server_info = await Server.ServiceClient.Diagnostic.ServerInfo();
				ASSERT.ok( server_info );
				ASSERT.ok( server_info.network_name );
				ASSERT.ok( server_info.network_time );
				ASSERT.ok( server_info.server_name );
				ASSERT.ok( server_info.server_address );
				ASSERT.ok( server_info.server_version );
				ASSERT.ok( server_info.server_time );
				ASSERT.ok( server_info.server_start );
				ASSERT.ok( server_info.server_memory );
				ASSERT.ok( server_info.total_memory );
				ASSERT.ok( server_info.package_name );
				ASSERT.ok( server_info.package_version );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should generate an error`,
			async function ()
			{
				var this_error = null;
				try
				{
					await Server.ServiceClient.Diagnostic.ServerError();
				}
				catch ( error )
				{
					this_error = error;
				}
				ASSERT.ok( this_error );
				ASSERT.ok( this_error.message === 'In command [ServerError], Api Error: Here is your error. I hope you find it useful.' );
				return;
			} );


		//---------------------------------------------------------------------
		return;
	} );


	//---------------------------------------------------------------------
	describe( `Echo Service Tests`, function ()
	{

		//---------------------------------------------------------------------
		it( `should echo text`,
			async function ()
			{
				var text = 'Hello World!';
				var echo_text = await Server.ServiceClient.Echo.EchoText( text );
				ASSERT.ok( echo_text );
				ASSERT.ok( echo_text == text );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should reverse text`,
			async function ()
			{
				var text = 'Hello World!';
				var echo_text = await Server.ServiceClient.Echo.ReverseText( text );
				ASSERT.ok( echo_text );
				ASSERT.ok( echo_text == text.split( '' ).reverse().join( '' ) );
				return;
			} );


		//---------------------------------------------------------------------
		return;
	} );


	//---------------------------------------------------------------------
	describe( `Calc Service Tests`, function ()
	{

		//---------------------------------------------------------------------
		it( `should calc sum`,
			async function ()
			{
				var result = await Server.ServiceClient.Calc.Sum( 3, 4 );
				ASSERT.strictEqual( result, ( 3 + 4 ) );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should calc difference`,
			async function ()
			{
				var result = await Server.ServiceClient.Calc.Difference( 3, 4 );
				ASSERT.strictEqual( result, ( 3 - 4 ) );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should calc product`,
			async function ()
			{
				var result = await Server.ServiceClient.Calc.Product( 3, 4 );
				ASSERT.strictEqual( result, ( 3 * 4 ) );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should calc quotient`,
			async function ()
			{
				var result = await Server.ServiceClient.Calc.Quotient( 3, 4 );
				ASSERT.strictEqual( result, ( 3 / 4 ) );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should calc array sum`,
			async function ()
			{
				var result = await Server.ServiceClient.Calc.ArraySum( [ 3, 4, 5 ] );
				ASSERT.strictEqual( result, ( 3 + 4 + 5 ) );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should calc array average`,
			async function ()
			{
				var result = await Server.ServiceClient.Calc.ArrayAverage( [ 3, 4, 5 ] );
				ASSERT.strictEqual( result, ( 3 + 4 + 5 ) / 3 );
				return;
			} );


		//---------------------------------------------------------------------
		return;
	} );


	//---------------------------------------------------------------------
	return;
} );
