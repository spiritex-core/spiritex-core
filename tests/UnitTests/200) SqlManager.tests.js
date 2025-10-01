'use strict';

const ASSERT = require( 'assert' );
const PATH = require( 'path' );
const FS = require( 'fs' );

var ServerFactory = require( '../../src/Server/Server' );
var Server = null;

const TEST_DB_NAME = 'testdb';
const TEST_TABLE_NAME = 'test-table';


//---------------------------------------------------------------------
describe( `200) SqlManager Unit Tests`, function ()
{

	//---------------------------------------------------------------------
	before( 'Startup',
		async function ()
		{
			const ServerConfig = require( './ServerConfig' );
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
	describe( `sqlite3 (in-memory)`, function ()
	{
		var options = {
			SequelizeOptions: {
				logging: false,
				dialect: 'sqlite',
				storage: ':memory:',
			},
			SequelizeSyncOptions: { force: true },
		};
		driver_tests( options );
		return;
	} );


	//---------------------------------------------------------------------
	describe( `sqlite3 (local file)`, function ()
	{
		var data_filename = PATH.join( __dirname, `${TEST_DB_NAME}.sqlite3` );
		var options = {
			SequelizeOptions: {
				logging: false,
				dialect: 'sqlite',
				storage: data_filename,
			},
			SequelizeSyncOptions: { force: true },
		};
		driver_tests( options );
		after( 'Cleanup', async function () { FS.unlinkSync( data_filename ); } );
		return;
	} );


	//---------------------------------------------------------------------
	describe( `mysql`, function ()
	{
		var options = {
			SequelizeOptions: {
				logging: false,
				dialect: 'mysql',
				dialectOptions: {
					host: 'localhost',
					port: 3306,
					database: TEST_DB_NAME,
					user: 'root',
				},
			},
			SequelizeSyncOptions: { force: true },
		};
		driver_tests( options );
		return;
	} );


	//=====================================================================
	//=====================================================================
	//
	//    ██████  ██████  ██ ██    ██ ███████ ██████      ████████ ███████ ███████ ████████ ███████ 
	//    ██   ██ ██   ██ ██ ██    ██ ██      ██   ██        ██    ██      ██         ██    ██      
	//    ██   ██ ██████  ██ ██    ██ █████   ██████         ██    █████   ███████    ██    ███████ 
	//    ██   ██ ██   ██ ██  ██  ██  ██      ██   ██        ██    ██           ██    ██         ██ 
	//    ██████  ██   ██ ██   ████   ███████ ██   ██        ██    ███████ ███████    ██    ███████ 
	//                                                                                              
	//=====================================================================
	//=====================================================================


	//---------------------------------------------------------------------
	function driver_tests( DatabaseOptions )
	{

		var SqlManager = null;

		//---------------------------------------------------------------------
		it( `Should create a SqlManager.`,
			async function ()
			{
				ASSERT.ok( Server );
				SqlManager = await Server.Utilities.NewSqlManager( Server.Logger );
				ASSERT.ok( SqlManager );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should register a database.`,
			async function ()
			{
				ASSERT.ok( Server );
				ASSERT.ok( DatabaseOptions );
				ASSERT.ok( DatabaseOptions.SequelizeOptions );
				ASSERT.ok( DatabaseOptions.SequelizeSyncOptions );
				ASSERT.ok( SqlManager );

				// Create the database.
				SqlManager._.RegisterDatabase( TEST_DB_NAME, DatabaseOptions );
				var database = SqlManager[ TEST_DB_NAME ];
				ASSERT.ok( database );

				// Create the table.
				database._.RegisterTable(
					TEST_TABLE_NAME,
					{
						schema_type: 'json',
						properties: {
							item_id: { type: 'integer' },
							item_name: { type: 'string' },
							description: { type: [ 'string', 'null' ] },
							metadata: { type: 'object', nullable: true },
						},
						required: [ 'item_id' ],
						Table: {
							Indexes: [ { fields: [ 'item_id' ], unique: true } ],
							Options: {
								timestamps: true,
								createdAt: 'created_at',
								updatedAt: 'updated_at',
								deletedAt: 'deleted_at',
								paranoid: true,
							},
						},
					} );

				return;
			} );


		//---------------------------------------------------------------------
		it( `Should startup the SqlManager.`,
			async function ()
			{
				ASSERT.ok( SqlManager );
				await SqlManager._.Startup();
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should perform basic operations.`,
			async function ()
			{
				ASSERT.ok( SqlManager );

				var database = SqlManager[ TEST_DB_NAME ];
				ASSERT.ok( database );

				var table = database[ TEST_TABLE_NAME ];
				ASSERT.ok( table );

				// Do some stuff.
				var row = null;

				// Create a row.
				row = await table.create( { item_id: 1, item_name: 'Test 1', metadata: { test: 'hello world' } } );
				ASSERT.ok( row );
				ASSERT.ok( row.dataValues );
				ASSERT.ok( row.created_at );
				ASSERT.ok( row.updated_at );
				ASSERT.ok( typeof row.deleted_at === 'undefined' );

				// Test the sequelize utils.
				var table_schema = database._.Tables[ TEST_TABLE_NAME ]._.TableSchema;
				row = SqlManager._.CloneItem( row, table_schema );
				ASSERT.ok( row );
				ASSERT.strictEqual( row.item_id, 1 );
				ASSERT.strictEqual( row.item_name, 'Test 1' );
				ASSERT.strictEqual( row.description, null );
				ASSERT.ok( row.metadata );
				ASSERT.strictEqual( row.metadata.test, 'hello world' );

				// Create another row.
				row = await table.create( { item_id: 2, item_name: 'Test 2' } );
				row = SqlManager._.CloneItem( row, table_schema );
				ASSERT.ok( row );
				ASSERT.strictEqual( row.item_id, 2 );
				ASSERT.strictEqual( row.item_name, 'Test 2' );
				ASSERT.strictEqual( row.description, null );
				ASSERT.strictEqual( row.metadata, null );

				// Create a third row.
				row = await table.create( { item_id: 3, item_name: 'Test 3' } );

				// Count the rows.
				var count = await table.count();
				ASSERT.strictEqual( count, 3 );

				// Count the rows again.
				var rows = await table.findAll();
				ASSERT.ok( rows );
				ASSERT.strictEqual( rows.length, 3 );

				// Test the assert utils.
				SqlManager._.ASSERT_FindAll(
					await table.findAll(),
					3 );

				// Do an update.
				SqlManager._.ASSERT_Update(
					await table.update( { item_name: 'Too' }, { where: { item_id: 2 } } ),
					1 );
				row = await table.findOne( { where: { item_id: 2 } } );
				ASSERT.ok( row );
				ASSERT.ok( row.created_at !== row.updated_at ); // Test timestamps.
				ASSERT.strictEqual( row.item_name, 'Too' );

				return;
			} );


		//---------------------------------------------------------------------
		it( `Should commit a transaction.`,
			async function ()
			{
				ASSERT.ok( SqlManager );

				var database = SqlManager[ TEST_DB_NAME ];
				ASSERT.ok( database );

				var table = database[ TEST_TABLE_NAME ];
				ASSERT.ok( table );

				// Transaction success.
				await database._.WithTransaction(
					async ( Transaction ) => 
					{
						if ( database._.Config.SequelizeOptions.transactionType )
						{
							ASSERT.strictEqual( Transaction.options.type, database._.Config.SequelizeOptions.transactionType );
						}
						SqlManager._.ASSERT_Update(
							await table.update( { item_name: 'One' }, { where: { item_id: 1 }, transaction: Transaction } ),
							1 );
						SqlManager._.ASSERT_Update(
							await table.update( { item_name: 'Two' }, { where: { item_id: 2 }, transaction: Transaction } ),
							1 );
						SqlManager._.ASSERT_Update(
							await table.update( { item_name: 'Three' }, { where: { item_id: 3 }, transaction: Transaction } ),
							1 );
						// SqlManager._.ASSERT_Update(
						// 	await table.update( { item_name: 'One' }, { where: { item_id: 1 } } ),
						// 	1 );
						// SqlManager._.ASSERT_Update(
						// 	await table.update( { item_name: 'Two' }, { where: { item_id: 2 } } ),
						// 	1 );
						// SqlManager._.ASSERT_Update(
						// 	await table.update( { item_name: 'Three' }, { where: { item_id: 3 } } ),
						// 	1 );
					} );
				var row = await table.findOne( { where: { item_id: 1 } } );
				ASSERT.ok( row.item_name === 'One' );
				row = await table.findOne( { where: { item_id: 2 } } );
				ASSERT.ok( row.item_name === 'Two' );
				row = await table.findOne( { where: { item_id: 3 } } );
				ASSERT.ok( row.item_name === 'Three' );

				return;
			} );


		//---------------------------------------------------------------------
		it( `Should rollback a failed transaction.`,
			async function ()
			{
				ASSERT.ok( SqlManager );

				var database = SqlManager[ TEST_DB_NAME ];
				ASSERT.ok( database );

				var table = database[ TEST_TABLE_NAME ];
				ASSERT.ok( table );

				// Transaction failure.
				try
				{
					await database._.WithTransaction(
						async ( Transaction ) => 
						{
							if ( database._.Config.SequelizeOptions.transactionType )
							{
								ASSERT.strictEqual( Transaction.options.type, database._.Config.SequelizeOptions.transactionType );
							}
							SqlManager._.ASSERT_Update(
								await table.update( { item_name: 'A' }, { where: { item_id: 1 }, transaction: Transaction } ),
								1 );
							SqlManager._.ASSERT_Update(
								await table.update( { item_name: 'B' }, { where: { item_id: 2 }, transaction: Transaction } ),
								1 );
							SqlManager._.ASSERT_Update(
								await table.update( { item_name: 'C' }, { where: { item_id: 3 }, transaction: Transaction } ),
								1 );
							// SqlManager._.ASSERT_Update(
							// 	await table.update( { item_name: 'A' }, { where: { item_id: 1 } } ),
							// 	1 );
							// SqlManager._.ASSERT_Update(
							// 	await table.update( { item_name: 'B' }, { where: { item_id: 2 } } ),
							// 	1 );
							// SqlManager._.ASSERT_Update(
							// 	await table.update( { item_name: 'C' }, { where: { item_id: 3 } } ),
							// 	1 );
							throw new Error( 'Test error.' );
						} );
				}
				catch ( error ) 
				{
					if ( error.message !== 'Test error.' ) { throw error; }
				}
				var row = await table.findOne( { where: { item_id: 1 } } );
				ASSERT.ok( row.item_name === 'One' );
				row = await table.findOne( { where: { item_id: 2 } } );
				ASSERT.ok( row.item_name === 'Two' );
				row = await table.findOne( { where: { item_id: 3 } } );
				ASSERT.ok( row.item_name === 'Three' );

				return;
			} );


		//---------------------------------------------------------------------
		it( `Should mix transactional and non-transactional operations within the same transaction.`,
			async function ()
			{
				ASSERT.ok( SqlManager );

				var database = SqlManager[ TEST_DB_NAME ];
				ASSERT.ok( database );

				var table = database[ TEST_TABLE_NAME ];
				ASSERT.ok( table );

				if ( ( database._.Config.SequelizeOptions.dialect === 'sqlite' )
					&& ( database._.Config.SequelizeOptions.storage === ':memory:' ) )
				{
					console.log( `WARN: Skipping test because sqlite in-memory database does not support mixed transactions.` );
					return;
				}

				// Transaction is not explicitly required.
				try
				{
					await database._.WithTransaction(
						async ( Transaction ) => 
						{
							if ( database._.Config.SequelizeOptions.transactionType )
							{
								ASSERT.strictEqual( Transaction.options.type, database._.Config.SequelizeOptions.transactionType );
							}
							SqlManager._.ASSERT_Update(
								await table.update( { item_name: 'A' }, { where: { item_id: 1 } } ),
								1 );
							SqlManager._.ASSERT_Update(
								await table.update( { item_name: 'B' }, { where: { item_id: 2 } } ),
								1 );
							SqlManager._.ASSERT_Update(
								await table.update( { item_name: 'C' }, { where: { item_id: 3 }, transaction: Transaction } ),
								1 );
							throw new Error( 'Test error.' );
						} );
				}
				catch ( error ) 
				{
					if ( error.message !== 'Test error.' ) { throw error; }
				}
				var row = await table.findOne( { where: { item_id: 1 } } );
				ASSERT.ok( row.item_name === 'A' );
				row = await table.findOne( { where: { item_id: 2 } } );
				ASSERT.ok( row.item_name === 'B' );
				row = await table.findOne( { where: { item_id: 3 } } );
				ASSERT.ok( row.item_name === 'Three' );

				return;
			} );


		//---------------------------------------------------------------------
		it( `Should shutdown the SqlManager.`,
			async function ()
			{
				ASSERT.ok( SqlManager );
				await SqlManager._.Shutdown();
				SqlManager = null;
				return;
			} );


		//---------------------------------------------------------------------
		return;
	} // End driver_tests().


	//---------------------------------------------------------------------
	return;
} );
