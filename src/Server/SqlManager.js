'use strict';

const ASSERT = require( 'assert' );
const SEQUELIZE = require( 'sequelize' );
const ISOLATION_LEVELS = SEQUELIZE.Transaction.ISOLATION_LEVELS;

module.exports = function ( Logger = null )
{
	// if ( !Logger ) 
	// {
	// 	Logger = {};
	// 	Logger.log = console.log;
	// 	Logger.trace = console.log;
	// 	Logger.debug = console.log;
	// 	Logger.info = console.log;
	// 	Logger.warn = console.error;
	// 	Logger.error = console.error;
	// 	Logger.fatal = console.error;
	// }

	//---------------------------------------------------------------------
	var SqlManager = {
		_: {


			//---------------------------------------------------------------------
			DataTypes: SEQUELIZE.DataTypes,
			Op: SEQUELIZE.Op,


			//---------------------------------------------------------------------
			CloneItem:
				function CloneItem( Item, TableSchema )
				{
					if ( Item === null ) { return null; }
					if ( TableSchema === null ) { throw new Error( `Missing required argument [Schema].` ); }
					if ( !TableSchema.properties ) { throw new Error( `Missing required property [Schema.properties].` ); }

					var new_item = {};
					for ( var property_name in TableSchema.properties )
					{
						var property_value = Item[ property_name ];
						if ( typeof property_value === 'undefined' ) { property_value = null; }
						new_item[ property_name ] = property_value;
					}
					return new_item;
				},

			//---------------------------------------------------------------------
			ASSERT_FindAll:
				function ASSERT_FindAll( sequelize_result, expected_count )
				{
					ASSERT.ok( sequelize_result );
					ASSERT.ok( Array.isArray( sequelize_result ) );
					if ( typeof expected_count === 'undefined' ) { return; }
					ASSERT( typeof expected_count === 'number' );
					ASSERT.equal( sequelize_result.length, expected_count, `ASSERT_FindAll` );
					return;
				},

			//---------------------------------------------------------------------
			ASSERT_Update:
				function ASSERT_Update( sequelize_result, expected_count )
				{
					ASSERT.ok( sequelize_result );
					ASSERT.ok( Array.isArray( sequelize_result ) );
					ASSERT.equal( sequelize_result.length, 1 );
					if ( typeof expected_count === 'undefined' ) { return; }
					ASSERT( typeof expected_count === 'number' );
					ASSERT.equal( sequelize_result[ 0 ], expected_count, `ASSERT_Update` );
					return;
				},

			//---------------------------------------------------------------------
			ASSERT_Destroy:
				function ASSERT_Destroy( sequelize_result, expected_count )
				{
					ASSERT.ok( sequelize_result );
					if ( typeof expected_count === 'undefined' ) { return; }
					ASSERT( typeof expected_count === 'number' );
					ASSERT.equal( sequelize_result, expected_count, `ASSERT_Destroy` );
					return;
				},

			//---------------------------------------------------------------------
			ASSERT_Increment:
				function ASSERT_Increment( sequelize_result, expected_count )
				{
					ASSERT.ok( sequelize_result );
					ASSERT.ok( Array.isArray( sequelize_result ) );
					ASSERT.equal( sequelize_result.length, 1 );
					ASSERT.ok( Array.isArray( sequelize_result[ 0 ] ) );
					ASSERT.equal( sequelize_result[ 0 ].length, 2 );
					if ( typeof expected_count === 'undefined' ) { return; }
					ASSERT( typeof expected_count === 'number' );
					ASSERT.equal( sequelize_result[ 0 ][ 1 ], expected_count, `ASSERT_Increment` );
					return;
				},

			//---------------------------------------------------------------------
			// Utilities: {},


			//---------------------------------------------------------------------
			Startup:
				async function ()
				{
					for ( var database_name in SqlManager )
					{
						if ( database_name == '_' ) { continue; }
						var database = SqlManager[ database_name ];

						if ( !database._.Config.SequelizeOptions ) { throw new Error( `Missing required database configuration [SequelizeOptions].` ); }
						if ( database._.Config.SequelizeOptions.transactionType )
						{
							if ( Logger ) { Logger.warn( `Setting the Sequelize option [transactionType] is not supported. All transactions will use the database's default transaction type and isolation level SERIALIZABLE.` ); }
							delete database._.Config.SequelizeOptions.transactionType;
						}

						// Initialize Sequelize for each Database.
						database._.Sequelize = new SEQUELIZE.Sequelize( database._.Config.SequelizeOptions );
						for ( var table_name in database._.Tables )
						{
							// Register the table with Sequelize
							var table = database._.Tables[ table_name ];
							var native_table_name = table._.TableOptions.table_name || table_name;
							database._.Sequelize.define(
								native_table_name,
								table._.SequelizeFields,
								{
									...table._.TableOptions,
									sequelize: database._.Sequelize,
									indexes: table._.SequelizeIndexes,
								}
							);
						}

						// Connect and sync the database structure.
						var sync_options = database._.Config.SequelizeSyncOptions || {};
						await database._.Sequelize.sync( sync_options );

						// Promote the tables to the database object.
						for ( var table_name in database._.Tables )
						{
							var table = database._.Tables[ table_name ];
							var native_table_name = table._.TableOptions.table_name || table_name;
							database[ table_name ] = database._.Sequelize.models[ native_table_name ];
						}

						database._.initialized = true;
					}
					return;
				},


			//---------------------------------------------------------------------
			Shutdown:
				async function ()
				{
					for ( var database_name in SqlManager )
					{
						if ( database_name == '_' ) { continue; }
						var database = SqlManager[ database_name ];
						for ( var table_name in database._.Tables )
						{
							delete database[ table_name ];
						}
						if ( database._.Sequelize ) 
						{
							await database._.Sequelize.close();
							database._.Sequelize = null;
						}
						database._.initialized = false;
					}
					return;
				},


			//---------------------------------------------------------------------
			RegisterDatabase:
				function ( DatabaseName, Config, TableSchemas )
				{
					if ( !Config ) { throw new Error( `Missing required argument [Config].` ); }
					if ( !Config.SequelizeOptions ) { throw new Error( `Missing required database configuration [SequelizeOptions].` ); }
					if ( !Config.SequelizeSyncOptions ) { throw new Error( `Missing required database configuration [SequelizeSyncOptions].` ); }

					SqlManager[ DatabaseName ] = {
						_: {
							Utils: SqlManager._.Utils,
							Config: Config,
							Sequelize: null,
							Tables: {},
							RegisterTable: null,
						},
					};
					var database = SqlManager[ DatabaseName ];

					//---------------------------------------------------------------------
					database._.RegisterTable =
						function ( TableName, TableSchema )
						{
							if ( !Config ) { throw new Error( `Missing required argument [Config].` ); }
							if ( !TableSchema ) { throw new Error( `Missing required argument [TableSchema].` ); }
							if ( !TableSchema.properties ) { throw new Error( `Missing required property [TableSchema.properties].` ); }

							// Create the table entry.
							database._.Tables[ TableName ] = {
								_: {
									Utils: SqlManager._.Utils,
									TableSchema: TableSchema,
									SequelizeFields: {},
									SequelizeIndexes: [],
									TableOptions: {},
									RegisterField: null,
									WithTransaction: null,
									initialized: false,
								},
							};
							var table = database._.Tables[ TableName ];

							//---------------------------------------------------------------------
							table._.RegisterSequelizeField =
								function ( FieldName, FieldSequelizeSchema )
								{
									table._.SequelizeFields[ FieldName ] = FieldSequelizeSchema;
									var field = table._.SequelizeFields[ FieldName ];
									return;
								};

							//---------------------------------------------------------------------
							table._.RegisterJsonField =
								function ( FieldName, FieldJsonSchema )
								{
									table._.SequelizeFields[ FieldName ] = field_jsonschema2sequelize( FieldJsonSchema );
									var field = table._.SequelizeFields[ FieldName ];
									return;
								};

							//---------------------------------------------------------------------
							table._.RegisterIndex =
								function ( IndexSchema )
								{
									table._.SequelizeIndexes.push( IndexSchema );
									return;
								};

							var schema_type = 'sequelize';
							if ( TableSchema.schema_type ) { schema_type = TableSchema.schema_type; }

							// Register the fields defined in the table schema.
							if ( TableSchema.properties )
							{
								for ( var field_name in TableSchema.properties )
								{
									// Add the field.
									// table._.RegisterField( field_name, TableSchema.properties[ field_name ] );
									switch ( schema_type )
									{
										case 'json': table._.RegisterJsonField( field_name, TableSchema.properties[ field_name ] ); break;
										case 'sequelize': table._.RegisterSequelizeField( field_name, TableSchema.properties[ field_name ] ); break;
										default: throw new Error( `Unknown schema type [${schema_type}].` );
									}
									// Check if field is required.
									if ( TableSchema.required && Array.isArray( TableSchema.required ) )
									{
										if ( TableSchema.required.includes( field_name ) )
										{
											var field = table._.SequelizeFields[ field_name ];
											// Force disallow null values when the field is required.
											field.allowNull = false;
										}
									}
								}

								// Register the indexes defined in the table schema.
								if ( TableSchema.Table && TableSchema.Table.Indexes )
								{
									for ( var index = 0; index < TableSchema.Table.Indexes.length; index++ )
									{
										table._.RegisterIndex( TableSchema.Table.Indexes[ index ] );
									}
								}

								// Copy the table options.
								if ( TableSchema.Table && TableSchema.Table.Options )
								{
									table._.TableOptions = JSON.parse( JSON.stringify( TableSchema.Table.Options ) );
								}

								return table;
							}

							return;
						};

					//---------------------------------------------------------------------
					database._.WithTransaction =
						async function WithTransaction( Callback )
						{
							if ( !Callback ) { throw new Error( `Missing required argument [Callback].` ); }
							var result = await database._.Sequelize.transaction(
								{
									isolationLevel: ISOLATION_LEVELS.SERIALIZABLE,
								},
								async function transaction( Transaction )
								{
									return await Callback( Transaction );
								} );
							return result;
						};

					//---------------------------------------------------------------------
					if ( TableSchemas )
					{
						for ( var table_name in TableSchemas )
						{
							database._.RegisterTable( table_name, TableSchemas[ table_name ] );
						}
					}

					return;
				},


		},
	};


	//---------------------------------------------------------------------
	function field_jsonschema2sequelize( FieldSchema )
	{
		// Map JSON Schema types to Sequelize data types
		var type = null;
		var is_nullable = false;
		if ( Array.isArray( FieldSchema.type ) )
		{
			// For nullable fields, type can be an array like ["string", "null"]
			// Extract the main data type ignoring "null"
			type = FieldSchema.type.find( t => t !== 'null' );
			if ( FieldSchema.type.includes( 'null' ) ) { is_nullable = true; }
		}
		else if ( typeof FieldSchema.type === 'string' )
		{
			type = FieldSchema.type;
		}
		else
		{
			throw new Error( `Unsupported field type: [${FieldSchema.type}]` );
		}
		if ( FieldSchema.nullable ) { is_nullable = true; }

		var sequelize_field = null;
		switch ( type )
		{
			case 'string':
				if ( FieldSchema.format === 'date-time' )
				{
					sequelize_field = { type: SEQUELIZE.DataTypes.DATE, allowNull: is_nullable };
				}
				else if ( FieldSchema.format === 'uuid' )
				{
					sequelize_field = { type: SEQUELIZE.DataTypes.DATE, allowNull: is_nullable };
				}
				else if ( FieldSchema.maxLength )
				{
					sequelize_field = { type: SEQUELIZE.DataTypes.STRING( FieldSchema.maxLength ), allowNull: is_nullable };
				}
				else
				{
					sequelize_field = { type: SEQUELIZE.DataTypes.STRING, allowNull: is_nullable };
				}
				break;
			case 'integer':
				sequelize_field = { type: SEQUELIZE.DataTypes.INTEGER, allowNull: is_nullable };
				break;
			case 'number':
				sequelize_field = { type: SEQUELIZE.DataTypes.FLOAT, allowNull: is_nullable };
				break;
			case 'boolean':
				sequelize_field = { type: SEQUELIZE.DataTypes.BOOLEAN, allowNull: is_nullable };
				break;
			case 'object':
				sequelize_field = { type: SEQUELIZE.DataTypes.JSON, allowNull: is_nullable };
				break;
			case 'array':
				sequelize_field = { type: SEQUELIZE.DataTypes.ARRAY( DataTypes.JSON ), allowNull: is_nullable };
				break;
			case 'null':
				// If only null type, map to STRING but allow nulls
				sequelize_field = { type: SEQUELIZE.DataTypes.STRING, allowNull: true };
				break;
			default:
				if ( Logger ) { Logger.warn( `Unsupported field type [${type}], defaulting to a nullable string.` ); }
				sequelize_field = { type: SEQUELIZE.DataTypes.STRING, allowNull: is_nullable };
		}

		return sequelize_field;
	}


	//---------------------------------------------------------------------
	return SqlManager;
};


