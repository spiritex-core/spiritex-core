'use strict';

const FS = require( 'fs' );
const PATH = require( 'path' );


module.exports = function GenerateMD_SpirtiEx_API( Server, Schema, UserType, Options )
{
	var S = Schema;
	// var G = require( '../../../Server/Generator' )();
	const G = Server.Utilities.NewGenerator();

	Options = Options || {};

	//---------------------------------------------------------------------
	// Add document header.
	//---------------------------------------------------------------------

	if ( Options.UseLinks ) { G.WriteLine( `<a id="SpiritEx-API-Documentation"></a>` ); }
	G.WriteLine( `# SpiritEx API Documentation` );
	G.NewLine();
	// G.WriteLine( `> ***CONFIDENTIAL DOCUMENT***` );
	G.WriteLine( `>` );
	G.WriteLine( `* API Type: ${UserType}` );
	G.WriteLine( `* Version: ${Server.package_version}` );
	G.WriteLine( `* Dated: ${new Date().toISOString().substring( 0, 10 )}` );
	G.NewLine();
	G.WriteLine( `
The SpiritEx API is organized into a set of services, each containing a set of commands.
This document provides details about the available SpiritEx services and commands.
Services define commands that can be called by the SpiritEx client.
Services also define object types that are used as arguments to and return values from its commands.
` );
	G.WriteLine( `
## Document Structure
This document is structured to provide a comprehensive overview of the API,
while also providing detailed information for each service and command.
` );
	if ( Options.UseLinks )
	{
		G.WriteLine( `
* [Object Definitions](#Object-Definitions)
* [Command Index](#Command-Index)
* [Command Details](#Command-Details)
` );
	}
	else
	{
		G.WriteLine( `
* Object Definitions
* Command Index
* Command Details
` );
	}
	G.WriteLine( `
## API Usage
The SpiritEx API can be called directly using the provided Http client \`HttpClient.js\`.
The Http client is available for both NodeJS and Browser use.
In both environments, the client handles authentication, session management, and API response processing.
Similar to the API itself, the client is organized into services, each containing a set of commands.
The examples below will demonstrate how to call the various SpiritEx commands using the Http client.
` );

	G.NewLine();


	//---------------------------------------------------------------------
	// Add object definitions.
	//---------------------------------------------------------------------

	G.WriteLine( `_____________________________________________________________________` );
	G.NewLine();
	G.WriteLine( `_____________________________________________________________________` );
	G.NewLine();
	if ( Options.UseLinks ) { G.WriteLine( `<a id="Object-Definitions"></a>` ); }
	G.WriteLine( `# Object Definitions` );
	G.NewLine();

	for ( let service_name in S )
	{
		// console.log( `Generating Objects for Service ${service_name}` );
		let service_schema = S[ service_name ];
		if ( service_schema.$Objects )
		{
			for ( let object_name in service_schema.$Objects )
			{
				let object_schema = service_schema.$Objects[ object_name ];
				if ( Options.UseLinks ) { G.WriteLine( `<a id="${object_name}-Object"></a>` ); }
				G.WriteLine( `## ${object_name} Object` );
				if ( Options.UseLinks )
				{
					G.WriteLine( `> <small>Defined in [${service_name} Service](#${service_name}-Service)</small>` );
				}
				else
				{
					G.WriteLine( `> <small>Defined in ${service_name} Service</small>` );
				}
				G.NewLine();
				G.WriteLine( `| Property | Type | Description |` );
				G.WriteLine( `|----------|------|-------------|` );

				for ( let prop_name in object_schema.properties )
				{
					let prop = object_schema.properties[ prop_name ];
					let type = prop.type || 'any';
					if ( prop.$Object )
					{
						type += ` (${prop.$Object})`;
					}
					let description = prop.description || '';

					G.WriteLine( `| ${prop_name} | ${type} | ${description} |` );
				}
				G.NewLine();
			}
		}
	}

	G.NewLine();


	//---------------------------------------------------------------------
	// Add command index.
	//---------------------------------------------------------------------

	G.WriteLine( `_____________________________________________________________________` );
	G.NewLine();
	G.WriteLine( `_____________________________________________________________________` );
	G.NewLine();
	if ( Options.UseLinks ) { G.WriteLine( `<a id="Command-Index"></a>` ); }
	G.WriteLine( `# Command Index` );
	G.NewLine();

	for ( let service_name in S )
	{
		// console.log( `Generating Index for Service ${service_name}` );
		G.WriteLine( `## ${service_name} Service` );

		G.WriteLine( `| Command | Description |` );
		G.WriteLine( `|---------|-------------|` );

		let service_schema = S[ service_name ];
		for ( let command_name in service_schema )
		{
			if ( command_name.startsWith( '$' ) ) continue;
			var command_schema = service_schema[ command_name ];

			// Get the Command arguments.
			let command_arguments = `(`;
			if ( command_schema.Arguments
				&& command_schema.Arguments.properties
				&& Object.keys( command_schema.Arguments.properties ).length )
			{
				let params = [];
				for ( let arg_name in command_schema.Arguments.properties )
				{
					params.push( arg_name );
				}
				command_arguments += ' ' + params.join( ', ' ) + ' ';
			}
			command_arguments += `)`;

			// Add the link.
			var text = null;
			if ( Options.UseLinks )
			{
				text = `| [**${command_name}**${command_arguments}](#${service_name}-${command_name})`;
			}
			else
			{
				text = `| **${command_name}**${command_arguments}`;
			}
			text += ` | ${command_schema.description} |`;

			G.WriteLine( text );
		}
	}

	G.NewLine();

	//---------------------------------------------------------------------
	// Generate documentation for each service
	//---------------------------------------------------------------------

	G.WriteLine( `_____________________________________________________________________` );
	G.NewLine();
	G.WriteLine( `_____________________________________________________________________` );
	G.NewLine();
	if ( Options.UseLinks ) { G.WriteLine( `<a id="Command-Details"></a>` ); }
	G.WriteLine( `# Command Details` );
	G.NewLine();

	for ( let service_name in S )
	{
		// console.log( `Generating Commands for Service ${service_name}` );
		let service_schema = S[ service_name ];

		if ( Options.UseLinks ) { G.WriteLine( `<a id="${service_name}-Service"></a>` ); }
		G.WriteLine( `## ${service_name} Service` );
		G.NewLine();

		// Process each command in the service
		var document_links = `> <small> links : [Top](#SpiritEx-API-Documentation)`;
		document_links += ` | [Object Definitions](#Object-Definitions)`;
		document_links += ` | [Command Index](#Command-Index)`;
		document_links += ` | [Command Details](#Command-Details)`;
		document_links += ` | [${service_name} Service](#${service_name}-Service)`;
		document_links += `</small>`;
		for ( let command_name in service_schema )
		{
			//---------------------------------------------------------------------

			// Skip special keys like $Objects
			if ( command_name.startsWith( '$' ) ) continue;

			let command_schema = service_schema[ command_name ];

			if ( Options.UseLinks ) { G.WriteLine( `<a id="${service_name}-${command_name}"></a>` ); }
			G.WriteLine( `### ${service_name}.${command_name} Function` );
			if ( Options.UseLinks ) { G.WriteLine( document_links ); }
			G.NewLine();

			// Add description
			if ( command_schema.description )
			{
				G.WriteLine( `**Description:** ${command_schema.description}` );
				G.NewLine();
			}

			// Add required groups if any
			if ( command_schema.groups && command_schema.groups.length > 0 )
			{
				G.WriteLine( `**User Types:** ${command_schema.groups.join( ', ' )}` );
				G.NewLine();
			}

			// Add arguments section
			G.WriteLine( `#### Arguments` );
			G.NewLine();

			if ( Object.keys( command_schema.Arguments.properties ).length === 0 )
			{
				G.WriteLine( `*No arguments required*` );
				G.NewLine();
			} else
			{
				G.WriteLine( `| Name | Type | Required | Description |` );
				G.WriteLine( `|------|------|----------|-------------|` );

				// List required arguments
				let required = [];
				if ( command_schema.Arguments.required )
				{
					required = command_schema.Arguments.required;
				}

				// Add each argument
				for ( let arg_name in command_schema.Arguments.properties )
				{
					let arg = command_schema.Arguments.properties[ arg_name ];
					let type = 'any';
					if ( arg.type )
					{
						type = arg.type;
						if ( ( arg.type === 'object' ) && arg.$Object )
						{
							if ( Options.UseLinks )
							{
								type = ` [\`${arg.$Object}\`](#${arg.$Object}-Object)`;
							}
							else
							{
								type = ` (${arg.$Object})`;
							}
						}
					}
					let is_required = required.includes( arg_name ) ? 'Yes' : 'No';
					let description = arg.description || '';

					G.WriteLine( `| ${arg_name} | ${type} | ${is_required} | ${description} |` );
				}
				G.NewLine();
			}

			// Add returns section
			G.WriteLine( `#### Returns` );
			G.NewLine();

			if ( command_schema.Returns )
			{
				let returns = command_schema.Returns;

				if ( returns.type === 'object' )
				{
					if ( returns.$Object )
					{
						G.WriteLine( `Returns an object of type \`${returns.$Object}\`` );
						G.NewLine();
					} else if ( returns.properties )
					{
						G.WriteLine( `| Property | Type | Description |` );
						G.WriteLine( `|----------|------|-------------|` );

						for ( let prop_name in returns.properties )
						{
							let prop = returns.properties[ prop_name ];
							let type = 'any';
							if ( prop.type )
							{
								type = prop.type;
								if ( ( prop.type === 'object' ) && prop.$Object )
								{
									if ( Options.UseLinks )
									{
										type = ` [\`${prop.$Object}\`](#${prop.$Object}-Object)`;
									}
									else
									{
										type = ` (${prop.$Object})`;
									}
								}
							}
							let description = prop.description || '';

							G.WriteLine( `| ${prop_name} | ${type} | ${description} |` );
						}
						G.NewLine();
					}
				} else if ( returns.type === 'array' )
				{
					G.WriteNew( `Returns an array of ` );

					if ( returns.items && returns.items.$Object )
					{
						G.WriteAppend( `\`${returns.items.$Object}\` objects` );
					} else if ( returns.items && returns.items.type )
					{
						G.WriteAppend( `\`${returns.items.type}\` items` );
					} else
					{
						G.WriteAppend( `items` );
					}
					G.NewLine();
					G.NewLine();
				} else
				{
					G.WriteLine( `Returns a value of type \`${returns.type || 'any'}\`` );
					G.NewLine();
				}
			} else
			{
				G.WriteLine( `*No return value specified*` );
				G.NewLine();
			}

			// Add example usage
			G.WriteLine( `#### Example Usage` );
			G.NewLine();
			G.WriteLine( "```javascript" );

			// Create parameter list
			let params = [];
			for ( let arg_name in command_schema.Arguments.properties )
			{
				params.push( arg_name );
			}

			G.WriteLine( `var result = await Client.${service_name}.${command_name}(${params.join( ', ' )});` );
			G.WriteLine( "```" );
			G.NewLine();

			// Add separator between commands
			G.WriteLine( `---` );
			G.NewLine();

		}
	}
	return G;
}

