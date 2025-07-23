import { NextResponse } from 'next/server';
import redis from '../../../../lib/redis';
import { mcpAuthMiddleware } from '../../../../lib/mcp-auth';
import { getError } from '../../../../utils/helper';
import { getApiDefinition } from '../../../../utils/helperApi';
import { executeAreaRead, executeAreaUpdate } from './areaExecutors.js';

/**
 * MCP (Model Context Protocol) Server v1
 * JSON-RPC 2.0 endpoint for AI assistants
 */

// MCP Protocol constants
const MCP_VERSION = '1.0.0';
const SERVER_NAME = 'spreadapi-mcp';
const SERVER_VERSION = '1.0.0';

// JSON-RPC error codes
const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;

/**
 * Transform service to MCP tool format
 */
function serviceToMcpTool(serviceId, publishedData, apiDefinition) {
  // Build input schema from parameters
  const properties = {};
  const required = [];
  
  if (apiDefinition.inputs && Array.isArray(apiDefinition.inputs)) {
    apiDefinition.inputs.forEach(input => {
      const paramName = input.alias || input.name;
      
      // Build description with format hint
      let description = input.description || `Parameter: ${input.name}`;
      if (input.format === 'percentage') {
        description += ' (Enter as decimal, e.g., 0.05 for 5%)';
      }
      
      const schema = {
        type: input.type === 'number' ? 'number' : 'string',
        description: description
      };
      
      // Add constraints
      if (input.min !== undefined) schema.minimum = input.min;
      if (input.max !== undefined) schema.maximum = input.max;
      
      properties[paramName] = schema;
      
      // Add to required if mandatory
      if (input.mandatory !== false) {
        required.push(paramName);
      }
    });
  }
  
  // Build tool description - prefer regular description, fallback to AI description
  let description = publishedData.description || 
                   publishedData.aiDescription || 
                   apiDefinition.description ||
                   apiDefinition.aiDescription || 
                   `Service ${serviceId}`;
  
  // If we have a title/name in published data, prepend it
  const serviceName = publishedData.title || publishedData.name;
  if (serviceName && !description.startsWith(serviceName)) {
    description = `${serviceName}: ${description}`;
  }
  
  const tool = {
    name: `spreadapi_calc_${serviceId}`,
    description: description.substring(0, 500), // Limit description length
    inputSchema: {
      type: 'object',
      properties,
      required,
      additionalProperties: false
    }
  };
  
  // Add extended metadata if available
  if (apiDefinition.aiTags || apiDefinition.aiUsageExamples || apiDefinition.category) {
    tool['x-spreadapi-metadata'] = {};
    
    if (apiDefinition.category) {
      tool['x-spreadapi-metadata'].category = apiDefinition.category;
    }
    
    if (apiDefinition.aiTags && Array.isArray(apiDefinition.aiTags)) {
      tool['x-spreadapi-metadata'].tags = apiDefinition.aiTags;
    }
    
    if (apiDefinition.aiUsageExamples && Array.isArray(apiDefinition.aiUsageExamples)) {
      tool['x-spreadapi-metadata'].examples = apiDefinition.aiUsageExamples;
    }
    
    // Add output descriptions if available
    if (apiDefinition.outputs && Array.isArray(apiDefinition.outputs)) {
      const outputDescriptions = apiDefinition.outputs
        .filter(output => output.description)
        .map(output => `${output.name}: ${output.description}`);
      
      if (outputDescriptions.length > 0) {
        tool['x-spreadapi-metadata'].outputDescription = outputDescriptions.join('; ');
      }
    }
  }
  
  return tool;
}

/**
 * Execute a service calculation
 */
async function executeService(serviceId, inputs) {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('api', serviceId);
    
    // Add input parameters
    Object.entries(inputs).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    // Use internal API endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/getresults?${params.toString()}`);
    const data = await response.json();
    
    if (!response.ok) {
      // Check if this is a missing parameters error with documentation
      if (response.status === 400 && data.parameters) {
        // Format helpful response with parameter documentation
        let helpText = `Service: ${data.service.name}\n${data.service.description}\n\n`;
        
        if (data.parameters.required.length > 0) {
          helpText += 'Required parameters:\n';
          data.parameters.required.forEach(p => {
            helpText += `- ${p.name} (${p.type}): ${p.description}`;
            if (p.min !== undefined || p.max !== undefined) {
              helpText += ` [${p.min || ''}-${p.max || ''}]`;
            }
            helpText += '\n';
          });
        }
        
        if (data.parameters.optional.length > 0) {
          helpText += '\nOptional parameters:\n';
          data.parameters.optional.forEach(p => {
            helpText += `- ${p.name} (${p.type}): ${p.description}`;
            if (p.min !== undefined || p.max !== undefined) {
              helpText += ` [${p.min || ''}-${p.max || ''}]`;
            }
            helpText += '\n';
          });
        }
        
        if (data.outputs.length > 0) {
          helpText += '\nOutputs:\n';
          data.outputs.forEach(o => {
            helpText += `- ${o.name}: ${o.description}\n`;
          });
        }
        
        return {
          content: [{
            type: 'text',
            text: helpText
          }]
        };
      }
      
      throw new Error(data.error || `Calculation failed with status ${response.status}`);
    }
    
    // Format response for MCP
    let resultText = '';
    
    // Format outputs
    if (data.outputs || data.result) {
      const outputs = data.outputs || data.result;
      resultText = 'Calculation Results:\n';
      
      // Handle array format (from API response)
      if (Array.isArray(outputs)) {
        outputs.forEach(output => {
          if (output.type === 'output') {
            resultText += `${output.alias || output.name}: ${output.value}\n`;
          }
        });
      } else {
        // Handle object format (legacy)
        for (const [key, value] of Object.entries(outputs)) {
          resultText += `${key}: ${value}\n`;
        }
      }
    }
    
    // Add metadata if available
    if (data.info) {
      resultText += `\nCalculation time: ${data.info.timeCalculation}ms`;
    }
    
    return {
      content: [{
        type: 'text',
        text: resultText
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text', 
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}

/**
 * Handle JSON-RPC request
 */
async function handleJsonRpc(request, auth) {
  let body;
  
  try {
    body = await request.json();
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        code: PARSE_ERROR,
        message: 'Parse error'
      },
      id: null
    };
  }
  
  const { jsonrpc, method, params = {}, id } = body;
  
  // Validate JSON-RPC version
  if (jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      error: {
        code: INVALID_REQUEST,
        message: 'Invalid Request: Must be JSON-RPC 2.0'
      },
      id: id || null
    };
  }
  
  // Handle methods
  try {
    switch (method) {
      case 'initialize': {
        return {
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
              name: SERVER_NAME,
              version: SERVER_VERSION
            }
          },
          id
        };
      }
      
      case 'tools/list': {
        // Always include built-in tools
        const tools = [
          {
            name: 'spreadapi_list_services',
            description: 'List all published SpreadAPI services with their descriptions and metadata',
            inputSchema: {
              type: 'object',
              properties: {
                includeMetadata: {
                  type: 'boolean',
                  description: 'Include detailed metadata like inputs/outputs (default: false)',
                  default: false
                }
              },
              additionalProperties: false
            }
          },
          {
            name: 'spreadapi_get_service_details',
            description: 'Get detailed information about a specific SpreadAPI service including its inputs, outputs, and usage examples',
            inputSchema: {
              type: 'object',
              properties: {
                serviceId: {
                  type: 'string',
                  description: 'The service ID to get details for'
                }
              },
              required: ['serviceId'],
              additionalProperties: false
            }
          }
        ];
        
        // Get user's services first (for proper isolation)
        const userServiceIndex = await redis.hGetAll(`user:${auth.userId}:services`);
        const userServiceIds = Object.keys(userServiceIndex);
        
        // Get allowed service IDs from auth
        const allowedServiceIds = auth.serviceIds || [];
        const hasServiceRestrictions = allowedServiceIds.length > 0;
        
        // Only check published status for user's services
        for (const serviceId of userServiceIds) {
          // Skip if this service isn't published
          const isPublished = await redis.exists(`service:${serviceId}:published`);
          if (!isPublished) continue;
          
          // Check if this service is allowed for this token
          if (hasServiceRestrictions && !allowedServiceIds.includes(serviceId)) {
            continue; // Skip services not in the allowed list
          }
          
          try {
            // Get published service data
            const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
            
            // Skip if no urlData (means not published)
            if (!publishedData.urlData) continue;
            
            // API definition must be in Redis (no backwards compatibility)
            if (!publishedData.inputs || !publishedData.outputs) {
              console.error(`Service ${serviceId} missing inputs/outputs in published data`);
              continue;
            }
            
            let apiDefinition;
            try {
              apiDefinition = {
                inputs: JSON.parse(publishedData.inputs),
                outputs: JSON.parse(publishedData.outputs),
                title: publishedData.title,
                aiDescription: publishedData.aiDescription,
                aiUsageExamples: publishedData.aiUsageExamples ? JSON.parse(publishedData.aiUsageExamples) : [],
                aiTags: publishedData.aiTags ? JSON.parse(publishedData.aiTags) : [],
                category: publishedData.category
              };
            } catch (parseError) {
              console.error(`Error parsing API definition for ${serviceId}:`, parseError);
              continue;
            }
            
            // Parse areas if available
            let areas = [];
            if (publishedData.areas) {
              try {
                areas = JSON.parse(publishedData.areas);
              } catch (e) {
                console.error('Error parsing areas:', e);
              }
            }
            
            // Skip if no inputs/outputs AND no areas defined
            const hasInputsOutputs = apiDefinition.inputs && apiDefinition.outputs && 
                                   (apiDefinition.inputs.length > 0 || apiDefinition.outputs.length > 0);
            const hasAreas = areas.length > 0;
            
            if (!hasInputsOutputs && !hasAreas) continue;
            
            // Add metadata from published data
            if (publishedData.title) {
              publishedData.name = publishedData.title;
            }
            
            // Transform to MCP tool only if we have inputs/outputs
            if (hasInputsOutputs) {
              const tool = serviceToMcpTool(serviceId, publishedData, apiDefinition);
              tools.push(tool);
            }
            
            // Add area-specific tools if service has areas defined
            if (hasAreas) {
              // Add read area tool
              tools.push({
                  name: `spreadapi_read_area_${serviceId}`,
                  description: `Read data from editable areas in ${publishedData.title || serviceId}`,
                  inputSchema: {
                    type: 'object',
                    properties: {
                      areaName: {
                        type: 'string',
                        description: 'The name of the area to read',
                        enum: areas.map(a => a.name)
                      },
                      includeFormulas: {
                        type: 'boolean',
                        description: 'Include cell formulas in the response',
                        default: false
                      },
                      includeFormatting: {
                        type: 'boolean',
                        description: 'Include cell formatting in the response',
                        default: false
                      }
                    },
                    required: ['areaName']
                  }
                });
                
                // Add write area tool if any areas allow writing
                const writableAreas = areas.filter(a => a.mode !== 'readonly');
                if (writableAreas.length > 0) {
                  tools.push({
                    name: `spreadapi_update_area_${serviceId}`,
                    description: `Update values and formulas in editable areas of ${publishedData.title || serviceId}`,
                    inputSchema: {
                      type: 'object',
                      properties: {
                        updates: {
                          type: 'array',
                          description: 'Array of area updates to apply',
                          items: {
                            type: 'object',
                            properties: {
                              areaName: {
                                type: 'string',
                                description: 'The area to update',
                                enum: writableAreas.map(a => a.name)
                              },
                              changes: {
                                type: 'array',
                                description: 'Cell changes to apply',
                                items: {
                                  type: 'object',
                                  properties: {
                                    row: { type: 'number', description: 'Row index within area (0-based)' },
                                    col: { type: 'number', description: 'Column index within area (0-based)' },
                                    value: { description: 'New cell value' },
                                    formula: { type: 'string', description: 'New cell formula' }
                                  }
                                }
                              }
                            },
                            required: ['areaName', 'changes']
                          }
                        },
                        returnOptions: {
                          type: 'object',
                          description: 'Control what data is returned after updates',
                          properties: {
                            includeValues: { 
                              type: 'boolean', 
                              description: 'Return calculated cell values',
                              default: true 
                            },
                            includeFormulas: { 
                              type: 'boolean', 
                              description: 'Return cell formulas',
                              default: false 
                            },
                            includeFormatting: { 
                              type: 'boolean', 
                              description: 'Return cell formatting',
                              default: false 
                            },
                            includeRelatedOutputs: { 
                              type: 'boolean', 
                              description: 'Return any defined output parameters that may have changed',
                              default: false 
                            }
                          }
                        }
                      },
                      required: ['updates']
                    }
                  });
                }
            }
            
          } catch (error) {
            console.error(`Error processing service ${serviceId}:`, error);
          }
        }
        
        // Sort tools by name
        tools.sort((a, b) => a.name.localeCompare(b.name));
        
        return {
          jsonrpc: '2.0',
          result: { tools },
          id
        };
      }
      
      case 'tools/call': {
        const { name, arguments: args = {} } = params;
        
        if (!name || typeof name !== 'string') {
          return {
            jsonrpc: '2.0',
            error: {
              code: INVALID_PARAMS,
              message: 'Invalid params: tool name is required'
            },
            id
          };
        }
        
        // Handle built-in tools
        if (name === 'spreadapi_get_service_details') {
          try {
            const { serviceId } = args;
            
            if (!serviceId) {
              throw new Error('serviceId is required');
            }
            
            // First check if this service belongs to the user
            const userServiceIndex = await redis.hGetAll(`user:${auth.userId}:services`);
            if (!userServiceIndex[serviceId]) {
              throw new Error('Service not found');
            }
            
            // Then check if this service is allowed for this token
            const allowedServiceIds = auth.serviceIds || [];
            const hasServiceRestrictions = allowedServiceIds.length > 0;
            
            if (hasServiceRestrictions && !allowedServiceIds.includes(serviceId)) {
              throw new Error('Access denied to this service');
            }
            
            // Use the cached getApiDefinition function
            const apiData = await getApiDefinition(serviceId, null);
            
            if (apiData.error) {
              throw new Error(apiData.error);
            }
            
            const apiDefinition = apiData.apiJson || apiData;
            
            // Get additional metadata from Redis
            const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
            
            // Format the response
            let responseText = `Service: ${publishedData.title || serviceId}\n`;
            responseText += `ID: ${serviceId}\n\n`;
            
            if (apiDefinition.inputs && apiDefinition.inputs.length > 0) {
              responseText += 'INPUTS:\n';
              apiDefinition.inputs.forEach(input => {
                responseText += `• ${input.name}`;
                if (input.alias) responseText += ` (alias: ${input.alias})`;
                responseText += ` - ${input.type}`;
                if (input.mandatory) responseText += ' [REQUIRED]';
                if (input.format === 'percentage') {
                  responseText += ' [PERCENTAGE: Enter as decimal, e.g., 0.05 for 5%]';
                }
                if (input.description) responseText += `\n  ${input.description}`;
                if (input.min !== undefined || input.max !== undefined) {
                  responseText += `\n  Range: ${input.min || '*'} to ${input.max || '*'}`;
                }
                responseText += '\n';
              });
            }
            
            if (apiDefinition.outputs && apiDefinition.outputs.length > 0) {
              responseText += '\nOUTPUTS:\n';
              apiDefinition.outputs.forEach(output => {
                responseText += `• ${output.name} - ${output.type}`;
                if (output.description) responseText += `: ${output.description}`;
                responseText += '\n';
              });
            }
            
            responseText += `\nRequires Token: ${publishedData.needsToken === 'true' ? 'Yes' : 'No'}`;
            responseText += `\nCaching Enabled: ${publishedData.useCaching === 'true' ? 'Yes' : 'No'}`;
            
            return {
              jsonrpc: '2.0',
              result: {
                content: [{
                  type: 'text',
                  text: responseText
                }]
              },
              id
            };
            
          } catch (error) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INTERNAL_ERROR,
                message: `Failed to get service details: ${error.message}`
              },
              id
            };
          }
        }
        
        if (name === 'spreadapi_list_services') {
          try {
            const includeMetadata = args.includeMetadata || false;
            const services = [];
            
            // Get user's services first (for proper isolation)
            const userServiceIndex = await redis.hGetAll(`user:${auth.userId}:services`);
            const userServiceIds = Object.keys(userServiceIndex);
            
            // Get allowed service IDs from auth
            const allowedServiceIds = auth.serviceIds || [];
            const hasServiceRestrictions = allowedServiceIds.length > 0;
            
            // Only check published status for user's services
            for (const serviceId of userServiceIds) {
              // Skip if this service isn't published
              const isPublished = await redis.exists(`service:${serviceId}:published`);
              if (!isPublished) continue;
              
              // Check if this service is allowed for this token
              if (hasServiceRestrictions && !allowedServiceIds.includes(serviceId)) {
                continue; // Skip services not in the allowed list
              }
              
              const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
              
              const serviceInfo = {
                id: serviceId,
                title: publishedData.title || serviceId,
                created: publishedData.created,
                modified: publishedData.modified,
                calls: publishedData.calls || '0'
              };
              
              if (includeMetadata && publishedData.urlData) {
                // Optionally fetch more details
                serviceInfo.hasApiUrl = true;
                serviceInfo.needsToken = publishedData.needsToken === 'true';
              }
              
              services.push(serviceInfo);
            }
            
            return {
              jsonrpc: '2.0',
              result: {
                content: [{
                  type: 'text',
                  text: `Found ${services.length} published services:\n\n${
                    services.map(s => 
                      `• ${s.title} (ID: ${s.id})\n  Created: ${s.created || 'N/A'}\n  Calls: ${s.calls}`
                    ).join('\n\n')
                  }`
                }]
              },
              id
            };
          } catch (error) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INTERNAL_ERROR,
                message: `Failed to list services: ${error.message}`
              },
              id
            };
          }
        }
        
        // Handle area read tool
        if (name.startsWith('spreadapi_read_area_')) {
          const serviceId = name.replace('spreadapi_read_area_', '');
          const { areaName, includeFormulas, includeFormatting } = args;
          
          const result = await executeAreaRead(serviceId, areaName, {
            includeFormulas,
            includeFormatting
          }, auth);
          
          return {
            jsonrpc: '2.0',
            result,
            id
          };
        }
        
        // Handle area update tool
        if (name.startsWith('spreadapi_update_area_')) {
          const serviceId = name.replace('spreadapi_update_area_', '');
          const { updates, returnOptions = {} } = args;
          
          const result = await executeAreaUpdate(serviceId, updates, auth, returnOptions);
          
          return {
            jsonrpc: '2.0',
            result,
            id
          };
        }
        
        // Handle spreadsheet calculation tools
        if (!name.startsWith('spreadapi_calc_')) {
          return {
            jsonrpc: '2.0',
            error: {
              code: INVALID_PARAMS,
              message: 'Invalid params: unknown tool name'
            },
            id
          };
        }
        
        // Extract service ID
        const serviceId = name.replace('spreadapi_calc_', '');
        
        // First check if this service belongs to the user
        const userServiceIndex = await redis.hGetAll(`user:${auth.userId}:services`);
        if (!userServiceIndex[serviceId]) {
          return {
            jsonrpc: '2.0',
            error: {
              code: INVALID_PARAMS,
              message: 'Service not found'
            },
            id
          };
        }
        
        // Then check if this service is allowed for this token
        const allowedServiceIds = auth.serviceIds || [];
        const hasServiceRestrictions = allowedServiceIds.length > 0;
        
        if (hasServiceRestrictions && !allowedServiceIds.includes(serviceId)) {
          return {
            jsonrpc: '2.0',
            error: {
              code: INVALID_PARAMS,
              message: 'Access denied to this service'
            },
            id
          };
        }
        
        // Execute the service
        const result = await executeService(serviceId, args);
        
        return {
          jsonrpc: '2.0',
          result,
          id
        };
      }
      
      case 'resources/list': {
        // Optional: List services as resources
        const resources = [];
        
        return {
          jsonrpc: '2.0',
          result: { resources },
          id
        };
      }
      
      default: {
        return {
          jsonrpc: '2.0',
          error: {
            code: METHOD_NOT_FOUND,
            message: `Method not found: ${method}`
          },
          id
        };
      }
    }
  } catch (error) {
    console.error('MCP method error:', error);
    return {
      jsonrpc: '2.0',
      error: {
        code: INTERNAL_ERROR,
        message: `Internal error: ${error.message}`
      },
      id
    };
  }
}

export async function POST(request) {
  try {
    // Validate token
    const auth = await mcpAuthMiddleware(request);
    
    if (!auth.valid) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: {
            code: -32001,
            message: `Authentication failed: ${auth.error}`
          },
          id: null
        },
        { 
          status: auth.status || 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }
    
    // Handle JSON-RPC request
    const response = await handleJsonRpc(request, auth);
    
    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
  } catch (error) {
    console.error('MCP server error:', error);
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: INTERNAL_ERROR,
          message: 'Internal server error'
        },
        id: null
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}