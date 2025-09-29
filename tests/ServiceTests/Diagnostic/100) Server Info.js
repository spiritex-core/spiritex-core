'use strict';

const ASSERT = require( 'assert' );


module.exports = function ( Clients, Sessions )
{
	//---------------------------------------------------------------------
	describe( `Server Info`, function ()
	{


		//---------------------------------------------------------------------
		it( `should get server info`,
			async function ()
			{
				var server_info = await Clients.Admin.Diagnostic.ServerInfo();
				ASSERT.ok( server_info );
				ASSERT.ok( server_info.network_name );
				ASSERT.ok( server_info.network_time );
				ASSERT.ok( server_info.package_name );
				ASSERT.ok( server_info.package_version );
				ASSERT.ok( server_info.server_memory );
				ASSERT.ok( server_info.server_name );
				ASSERT.ok( server_info.server_start );
				ASSERT.ok( server_info.server_time );
				return;
			} );


		//---------------------------------------------------------------------
		return;
	} );


	return;
};
