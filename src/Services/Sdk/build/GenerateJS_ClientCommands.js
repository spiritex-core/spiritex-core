'use strict';


module.exports = function GenerateJS_ClientCommands( Server, Schema )
{
	//---------------------------------------------------------------------
	// Generate the client code that will be merged with the Base Client template.
	//---------------------------------------------------------------------

	const S = Schema;
	// const G = require( '../../../Server/Generator' )();
	const G = Server.Utilities.NewGenerator();

	G.Clear();
	G.Indent();
	for ( var service_name in S )
	{
		var service_schema = S[ service_name ];

		G.NewLine();
		G.NewLine();
		G.WriteLine( `//---------------------------------------------------------------------` );
		G.WriteLine( `//---------------------------------------------------------------------` );
		G.WriteLine( `//` );
		G.WriteLine( `//\t\t${service_name} Service` );
		G.WriteLine( `//` );
		G.WriteLine( `//---------------------------------------------------------------------` );
		G.WriteLine( `//---------------------------------------------------------------------` );
		G.NewLine();
		G.NewLine();
		G.WriteLine( `ServiceClient.${service_name} = {` );
		G.IndentThis( function ()
		{
			for ( var command_name in service_schema )
			{
				// Skip special keys like $Objects
				if ( command_name.startsWith( '$' ) ) continue;
				var command_schema = service_schema[ command_name ];

				var command_arguments = Object.keys( command_schema.Arguments.properties );
				G.NewLine();

				// Add JSDoc comment block
				G.WriteLine( `//---------------------------------------------------------------------` );
				G.WriteLine( `/**` );
				if ( command_schema.description )
				{
					G.WriteLine( ` * ${command_schema.description}` );
				}

				// Add parameter documentation
				for ( var argument_name in command_schema.Arguments.properties )
				{
					var arg_desc = command_schema.Arguments.properties[ argument_name ].description || '';
					G.WriteLine( ` * @param {${command_schema.Arguments.properties[ argument_name ].type || 'any'}} ${argument_name} ${arg_desc}` );
				}

				// Add detailed return documentation if available
				if ( command_schema.Returns )
				{
					var return_desc = command_schema.Returns.description || '';

					// Generate detailed return type based on properties
					if ( command_schema.Returns.type === 'object' && command_schema.Returns.properties )
					{
						var return_props = [];
						for ( var prop_name in command_schema.Returns.properties )
						{
							var prop_type = command_schema.Returns.properties[ prop_name ].type || 'any';
							return_props.push( `${prop_name}: ${prop_type}` );
						}
						G.WriteLine( ` * @returns {Promise<{${return_props.join( ', ' )}}>} ${return_desc}` );
					}
					// Handle array returns
					else if ( command_schema.Returns.type === 'array' && command_schema.Returns.items )
					{
						if ( command_schema.Returns.items.type === 'object' && command_schema.Returns.items.properties )
						{
							var item_props = [];
							for ( var prop_name in command_schema.Returns.items.properties )
							{
								var prop_type = command_schema.Returns.items.properties[ prop_name ].type || 'any';
								item_props.push( `${prop_name}: ${prop_type}` );
							}
							G.WriteLine( ` * @returns {Promise<Array<{${item_props.join( ', ' )}}>>} ${return_desc}` );
						} else
						{
							G.WriteLine( ` * @returns {Promise<Array<${command_schema.Returns.items.type || 'any'}>>} ${return_desc}` );
						}
					}
					// Simple types
					else
					{
						G.WriteLine( ` * @returns {Promise<${command_schema.Returns.type || 'any'}>} ${return_desc}` );
					}
				}
				else
				{
					G.WriteLine( ` * @returns {Promise<any>}` );
				}

				G.WriteLine( ` */` );

				G.WriteLine( `${command_name}: async function ( ${command_arguments.join( ', ' )} )` );
				G.WriteLine( `{` );
				G.IndentThis( function ()
				{
					G.WriteLine( `var parameters = {` );
					G.IndentThis( function ()
					{
						for ( var argument_name in command_schema.Arguments.properties )
						{
							var argument_desc = command_schema.Arguments.properties[ argument_name ].description || '-';
							G.WriteLine( `${argument_name}: ${argument_name},  // ${argument_desc}` );
						}
					} ); // IndentThis
					G.WriteLine( `};` );
					G.WriteLine( `return await call_api( Transport.invocation_context( '${service_name}', '${command_name}', parameters ) );` );
				} ); // IndentThis
				G.WriteLine( `},` );

			}
		} ); // IndentThis
		G.WriteLine( `};` );
	}

	return G.GetBuffer();
};
