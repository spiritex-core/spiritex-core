'use strict';



module.exports = function ( Server, Service, Logger )
{


    //---------------------------------------------------------------------
    var McpServer = {
        name: Server.Config.server_name,
        version: Server.Config.server_version,
        tools: new Map(),
        initialized: false
    };


    //---------------------------------------------------------------------
    McpServer.RegisterTool =
        function RegisterTool( ToolName, ToolConfig, ToolHandler )
        {
            McpServer.tools.set(
                ToolName,
                {
                    name: ToolName,
                    title: ToolConfig.title || ToolName,
                    description: ToolConfig.description || '',
                    inputSchema: ToolConfig.inputSchema || { type: 'object', properties: {} },
                    outputSchema: ToolConfig.outputSchema || undefined,
                    handler: ToolHandler
                } );
        };


    //---------------------------------------------------------------------
    function handle_initialize( Request )
    {
        // console.log( 'Initialize request:', request );
        McpServer.initialized = true;
        return {
            jsonrpc: '2.0',
            id: Request.id,
            result: {
                protocolVersion: '2025-06-18',
                capabilities: {
                    tools: { listChanged: true },
                    resources: {},
                    prompts: {}
                },
                serverInfo: {
                    name: McpServer.name,
                    version: McpServer.version
                }
            }
        };
    }


    //---------------------------------------------------------------------
    // Handle tools/list request
    function handle_tools_list( Request )
    {
        // console.log( 'Tools list request:', request );

        const tools = Array.from( McpServer.tools.values() ).map( tool => ( {
            name: tool.name,
            title: tool.title,
            description: tool.description,
            inputSchema: tool.inputSchema,
            ...( tool.outputSchema && { outputSchema: tool.outputSchema } )
        } ) );

        return {
            jsonrpc: '2.0',
            id: Request.id,
            result: {
                tools
            }
        };
    }

    //---------------------------------------------------------------------
    // Handle tools/call request
    async function handle_tools_call( Request )
    {
        // console.log( 'Tool call request:', request );
        Logger.debug( `MCP Tool call request: [${Request.params.name}]` );
        const { name, arguments: args = {} } = Request.params;

        if ( !McpServer.tools.has( name ) )
        {
            return {
                jsonrpc: '2.0',
                id: Request.id,
                error: {
                    code: -32601,
                    message: `Tool not found: ${name}`
                }
            };
        }

        try
        {
            const tool = McpServer.tools.get( name );
            const result = await tool.handler( args );

            return {
                jsonrpc: '2.0',
                id: Request.id,
                result: {
                    content: [
                        {
                            type: 'text',
                            text: typeof result === 'string' ? result : JSON.stringify( result, null, 2 )
                        }
                    ],
                    isError: false
                }
            };
        }
        catch ( error )
        {
            Logger.error( 'MCP Tool execution error:', error );
            return {
                jsonrpc: '2.0',
                id: Request.id,
                result: {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`
                        }
                    ],
                    isError: true
                }
            };
        }
    }


    //---------------------------------------------------------------------
    // Handle initialized notification
    function handle_initialized( Request )
    {
        // console.log( 'Initialized notification received' );
        // No response needed for notifications
        return null;
    }


    //---------------------------------------------------------------------
    // Main JSON-RPC request handler
    McpServer.HandleJsonRpcRequest =
        async function HandleJsonRpcRequest( Request )
        {
            Logger.debug( `MCP Request: [${Request.method}]` );

            if ( !Request.jsonrpc || Request.jsonrpc !== '2.0' )
            {
                return {
                    jsonrpc: '2.0',
                    id: Request.id || null,
                    error: {
                        code: -32600,
                        message: 'Invalid Request'
                    }
                };
            }

            try
            {
                switch ( Request.method )
                {
                    case 'initialize':
                        return handle_initialize( Request );

                    case 'initialized':
                        return handle_initialized( Request );

                    case 'tools/list':
                        if ( !McpServer.initialized )
                        {
                            throw new Error( 'Server not initialized' );
                        }
                        return handle_tools_list( Request );

                    case 'tools/call':
                        if ( !McpServer.initialized )
                        {
                            throw new Error( 'Server not initialized' );
                        }
                        return await handle_tools_call( Request );

                    default:
                        return {
                            jsonrpc: '2.0',
                            id: Request.id,
                            error: {
                                code: -32601,
                                message: `Method not found: ${Request.method}`
                            }
                        };
                }
            }
            catch ( error )
            {
                Logger.error( 'MCP request handling error:', error );

                return {
                    jsonrpc: '2.0',
                    id: Request.id || null,
                    error: {
                        code: -32603,
                        message: `Internal error: ${error.message}`
                    }
                };
            }
        };


    //---------------------------------------------------------------------
    return McpServer;
};

