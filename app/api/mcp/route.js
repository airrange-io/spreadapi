import { NextResponse } from 'next/server';
import redis from '../../../lib/redis';
import { getApiDefinition } from '../../../utils/helperApi';

/**
 * MCP (Model Context Protocol) Server Implementation
 * Allows MCP clients to discover and execute spreadapi services
 */

// MCP Protocol Version
const MCP_VERSION = '0.1.0';

// Helper to format service as MCP tool
function serviceToMcpTool(service, serviceDetails) {
  const inputSchema = {
    type: 'object',
    properties: {},
    required: []
  };

  // Build input schema from service parameters
  if (serviceDetails.inputs && Array.isArray(serviceDetails.inputs)) {
    serviceDetails.inputs.forEach(input => {
      const paramName = input.alias || input.name;
      inputSchema.properties[paramName] = {
        type: input.type === 'number' ? 'number' : 'string',
        description: input.description || `Parameter: ${input.name}`,
        ...(input.min !== undefined && { minimum: input.min }),
        ...(input.max !== undefined && { maximum: input.max })
      };
      
      if (input.mandatory !== false) {
        inputSchema.required.push(paramName);
      }
    });
  }

  return {
    name: `spreadapi_${service.id}`,
    description: service.description || service.name,
    inputSchema
  };
}

// Helper to execute a service
async function executeService(serviceId, inputs, token = null) {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('api', serviceId);
    
    if (token) {
      params.append('token', token);
    }

    // Add input parameters
    Object.entries(inputs).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    // Execute via internal API call
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/getresults?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(data.outputs || data.result, null, 2)
      }],
      isError: false
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error executing service: ${error.message}`
      }],
      isError: true
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { jsonrpc, method, params = {}, id } = body;

    // Validate JSON-RPC request
    if (jsonrpc !== '2.0') {
      return NextResponse.json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request: Unsupported JSON-RPC version'
        },
        id
      });
    }

    // Handle different MCP methods
    switch (method) {
      case 'initialize': {
        // MCP initialization
        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            protocolVersion: MCP_VERSION,
            capabilities: {
              tools: {},
              resources: {
                subscribe: false
              }
            },
            serverInfo: {
              name: 'spreadapi-mcp-server',
              version: '1.0.0'
            }
          },
          id
        });
      }

      case 'tools/list': {
        // List all available services as MCP tools
        try {
          // Get all services from Redis
          const serviceKeys = await redis.keys('service:*');
          const tools = [];

          // Filter and process service keys
          for (const key of serviceKeys) {
            // Skip special keys like service:*:analytics, service:*:published, etc.
            if (key.includes(':analytics') || 
                key.includes(':published') || 
                key.includes(':tokens') ||
                key.includes(':cache')) {
              continue;
            }

            const serviceId = key.replace('service:', '');
            
            try {
              // Get service details
              const service = await redis.hGetAll(key);
              
              // Skip if no name (might be invalid service)
              if (!service.name) continue;

              // Check if service is published
              const isPublished = await redis.exists(`service:${serviceId}:published`);
              if (!isPublished) continue;

              // Get published API definition
              const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
              const apiDefinition = publishedData.api ? JSON.parse(publishedData.api) : null;

              if (apiDefinition) {
                const tool = serviceToMcpTool(
                  {
                    id: serviceId,
                    name: service.name,
                    description: apiDefinition.description || service.description
                  },
                  apiDefinition
                );
                tools.push(tool);
              }
            } catch (error) {
              console.error(`Error processing service ${serviceId}:`, error);
            }
          }

          return NextResponse.json({
            jsonrpc: '2.0',
            result: { tools },
            id
          });
        } catch (error) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: `Internal error: ${error.message}`
            },
            id
          });
        }
      }

      case 'tools/call': {
        // Execute a service
        const { name, arguments: args = {} } = params;

        if (!name || !name.startsWith('spreadapi_')) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: {
              code: -32602,
              message: 'Invalid params: Unknown tool name'
            },
            id
          });
        }

        // Extract service ID
        const serviceId = name.replace('spreadapi_', '');
        
        // Extract token if provided in arguments
        const { _token, ...inputs } = args;

        // Execute the service
        const result = await executeService(serviceId, inputs, _token);

        return NextResponse.json({
          jsonrpc: '2.0',
          result,
          id
        });
      }

      case 'resources/list': {
        // List available resources (services metadata)
        try {
          const resources = [];
          const serviceKeys = await redis.keys('service:*');

          for (const key of serviceKeys) {
            if (key.includes(':analytics') || 
                key.includes(':published') || 
                key.includes(':tokens') ||
                key.includes(':cache')) {
              continue;
            }

            const serviceId = key.replace('service:', '');
            const service = await redis.hGetAll(key);
            
            if (service.name) {
              resources.push({
                uri: `spreadapi://service/${serviceId}`,
                name: service.name,
                description: service.description || 'Spreadsheet calculation service',
                mimeType: 'application/json'
              });
            }
          }

          return NextResponse.json({
            jsonrpc: '2.0',
            result: { resources },
            id
          });
        } catch (error) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: `Internal error: ${error.message}`
            },
            id
          });
        }
      }

      case 'resources/read': {
        // Read resource details
        const { uri } = params;
        
        if (!uri || !uri.startsWith('spreadapi://service/')) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: {
              code: -32602,
              message: 'Invalid params: Invalid resource URI'
            },
            id
          });
        }

        const serviceId = uri.replace('spreadapi://service/', '');
        
        try {
          const service = await redis.hGetAll(`service:${serviceId}`);
          const isPublished = await redis.exists(`service:${serviceId}:published`);
          
          let apiDefinition = null;
          if (isPublished) {
            const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
            apiDefinition = publishedData.api ? JSON.parse(publishedData.api) : null;
          }

          const content = {
            service: {
              id: serviceId,
              name: service.name,
              description: service.description,
              created: service.created,
              published: isPublished
            },
            api: apiDefinition
          };

          return NextResponse.json({
            jsonrpc: '2.0',
            result: {
              contents: [{
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(content, null, 2)
              }]
            },
            id
          });
        } catch (error) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: `Internal error: ${error.message}`
            },
            id
          });
        }
      }

      default: {
        return NextResponse.json({
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          },
          id
        });
      }
    }
  } catch (error) {
    console.error('MCP server error:', error);
    return NextResponse.json({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error'
      },
      id: null
    });
  }
}

// OPTIONS for CORS if needed
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}