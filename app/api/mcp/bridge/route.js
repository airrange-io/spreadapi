import { NextResponse } from 'next/server';
import redis from '../../../../lib/redis';
import { mcpAuthMiddleware } from '../../../../lib/mcp-auth';
import { getError } from '../../../../utils/helper';
import { getApiDefinition } from '../../../../utils/helperApi';
import { executeAreaRead } from './areaExecutors.js';
import { executeEnhancedCalc } from './executeEnhancedCalc.js';
import { calculateDirect } from '../../v1/services/[id]/execute/calculateDirect.js';
import { saveState, loadState, listStates } from '../../../../lib/mcpState.js';

/**
 * MCP (Model Context Protocol) Server - Bridge Endpoint
 * JSON-RPC 2.0 endpoint for stdio bridge clients (e.g., Claude Desktop)
 * 
 * This implementation uses a generic tool approach to reduce tool proliferation:
 * - spreadapi_calc: Generic calculation tool that accepts serviceId parameter (with optional areaUpdates)
 * - spreadapi_read_area: Generic area reading tool that accepts serviceId parameter
 * - spreadapi_list_services: Enhanced service discovery with area information
 * - spreadapi_get_service_details: Detailed service information including areas
 * 
 * Backward compatibility is maintained for service-specific tools (spreadapi_calc_{serviceId}, etc.)
 * by setting includeServiceSpecificTools: true in the tools/list request.
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

// Simple in-memory cache for tool descriptions (TTL: 5 minutes)
const toolDescriptionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Build service list description for tool descriptions
 */
async function buildServiceListDescription(auth) {
  try {
    // Check cache first
    const cacheKey = `${auth.userId}:${JSON.stringify(auth.serviceIds || [])}`;
    const cached = toolDescriptionCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }
    
    // Get user's services (with null safety)
    const userServiceIndex = await redis.hGetAll(`user:${auth.userId}:services`) || {};
    const userServiceIds = Object.keys(userServiceIndex);
    
    // Get allowed service IDs from auth
    const allowedServiceIds = auth.serviceIds || [];
    const hasServiceRestrictions = allowedServiceIds.length > 0;
    
    const serviceDescriptions = [];
    const servicesWithAreas = [];
    const structuredServices = [];  // Add structured data for safe access

    // Use Redis multi for batch operations (reduces round trips)
    const multi = redis.multi();

    // Queue all operations
    for (const serviceId of userServiceIds) {
      multi.exists(`service:${serviceId}:published`);
      multi.hGetAll(`service:${serviceId}:published`);
    }

    // Execute all at once
    // Note: node-redis returns [[error, result], [error, result], ...]
    const results = await multi.exec();

    // Process results (2 results per service: exists + hGetAll)
    for (let i = 0; i < userServiceIds.length; i++) {
      const serviceId = userServiceIds[i];
      const baseIndex = i * 2;

      // Check for errors in the multi execution
      if (!results[baseIndex] || results[baseIndex][0]) {
        console.error(`[MCP] Error checking published status for ${serviceId}:`, results[baseIndex]?.[0]);
        continue;
      }
      if (!results[baseIndex + 1] || results[baseIndex + 1][0]) {
        console.error(`[MCP] Error fetching data for ${serviceId}:`, results[baseIndex + 1]?.[0]);
        continue;
      }

      // Access [1] to get actual result from [error, result] tuple
      const isPublished = results[baseIndex][1] === 1;
      const publishedData = results[baseIndex + 1][1];

      if (!isPublished) continue;

      // Check if this service is allowed for this token
      if (hasServiceRestrictions && !allowedServiceIds.includes(serviceId)) {
        continue;
      }

      if (!publishedData || !publishedData.urlData) continue;
      
      const title = publishedData.title || serviceId;
      const description = publishedData.description || publishedData.aiDescription || '';
      const shortDesc = description.substring(0, 120) + (description.length > 120 ? '...' : '');
      
      // Check if has calculation capability
      const hasCalc = publishedData.inputs && publishedData.outputs;
      
      // Check if has areas
      let areas = [];
      if (publishedData.areas) {
        try {
          areas = JSON.parse(publishedData.areas);
        } catch (e) {
          console.warn(`[MCP] Invalid areas JSON for service ${serviceId}:`, e.message);
        }
      }

      if (hasCalc) {
        serviceDescriptions.push(`• ${title} (${serviceId}) - ${shortDesc}`);

        // Store structured data for safe access (avoid string parsing)
        structuredServices.push({
          id: serviceId,
          name: title,
          description: shortDesc,
          fullDescription: description,
          hasAreas: areas.length > 0,
          areaCount: areas.length
        });
      }

      if (areas.length > 0) {
        const areaNames = areas.map(a => a.name).join(', ');
        servicesWithAreas.push(`• ${title} (${serviceId}) - Areas: ${areaNames}`);
      }
    }

    const result = {
      calcServices: serviceDescriptions,
      areaServices: servicesWithAreas,
      structuredServices: structuredServices,  // Add structured data
      totalCount: serviceDescriptions.length + servicesWithAreas.length
    };
    
    // Cache the result
    toolDescriptionCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Error building service descriptions:', error);
    return {
      calcServices: [],
      areaServices: [],
      totalCount: 0
    };
  }
}

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
 * Execute a service calculation using V1 API
 */
async function executeService(serviceId, inputs) {
  try {
    // Use V1 API direct calculation (no HTTP overhead)
    const data = await calculateDirect(serviceId, inputs, null, {});

    // Check for errors from calculateDirect
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Format response for MCP
    let resultText = '';
    
    // Format outputs
    if (data.outputs || data.result) {
      const outputs = data.outputs || data.result;
      resultText = 'Calculation Results:\n';
      
      // Handle array format (from V1 API response)
      if (Array.isArray(outputs)) {
        outputs.forEach(output => {
          resultText += `${output.alias || output.name}: ${output.value}\n`;
        });
      } else {
        // Handle object format (legacy)
        for (const [key, value] of Object.entries(outputs)) {
          resultText += `${key}: ${value}\n`;
        }
      }
    }
    
    // Add metadata if available
    if (data.metadata && data.metadata.executionTime) {
      resultText += `\nCalculation time: ${data.metadata.executionTime}ms`;
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
        const response = {
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
        };

        // Provide service list directly in handshake
        try {
          // Build service list for immediate display
          const serviceInfo = await buildServiceListDescription(auth);
          const serviceCount = serviceInfo.calcServices.length;

          if (serviceCount === 0) {
            response.serverInfo.description = `This MCP connection is configured but has no published services available.`;
            response.serverInfo.instructions = `Publish services in SpreadAPI to make them available.`;
          } else if (serviceCount === 1) {
            // Single service: customize name and description using structured data
            const service = serviceInfo.structuredServices[0];
            const serviceLine = serviceInfo.calcServices[0];

            response.serverInfo.name = service.name;
            response.serverInfo.description = `This MCP connection provides access to:\n\n${serviceLine}\n\nUse spreadapi_get_service_details to learn about inputs and outputs.`;
            response.serverInfo.instructions = `Call spreadapi_get_service_details with the service ID to understand what parameters are needed before executing calculations.`;
          } else {
            // Multiple services: list them all
            let description = `This MCP connection provides access to ${serviceCount} SpreadAPI calculation services:\n\n`;
            serviceInfo.calcServices.forEach((svc, index) => {
              description += `${index + 1}. ${svc}\n`;
            });

            response.serverInfo.description = description;
            response.serverInfo.instructions = `Use spreadapi_get_service_details(serviceId) to learn about specific service capabilities before executing calculations.`;
          }
        } catch (error) {
          console.error('Error loading service list:', error);
          // Fallback to simple description
          response.serverInfo.description = `This MCP connection provides access to SpreadAPI calculation services.`;
          response.serverInfo.instructions = `Call spreadapi_list_services() to see available services, then use spreadapi_get_service_details(serviceId) to learn about specific capabilities.`;
        }

        return {
          jsonrpc: '2.0',
          result: response,
          id
        };
      }
      
      case 'tools/list': {
        // Build service descriptions for this user/token
        const serviceInfo = await buildServiceListDescription(auth);

        // Build dynamic tool descriptions with service list
        let calcDescription = 'Execute calculations with optional area updates.';
        if (serviceInfo.calcServices.length > 0) {
          calcDescription += '\n\nYour available calculation services:\n' + serviceInfo.calcServices.join('\n');
        }

        let areaDescription = 'Read data from an editable area in any SpreadAPI service.';
        if (serviceInfo.areaServices.length > 0) {
          areaDescription += '\n\nYour services with editable areas:\n' + serviceInfo.areaServices.join('\n');
        }

        const getDetailsDescription = 'Get detailed information about a specific SpreadAPI service including its inputs, outputs, areas, and usage examples';
        const listServicesDescription = 'List all published SpreadAPI services with their descriptions, metadata, and available areas';

        // Always include generic tools
        const tools = [
          {
            name: 'spreadapi_list_services',
            description: listServicesDescription,
            inputSchema: {
              type: 'object',
              properties: {
                includeMetadata: {
                  type: 'boolean',
                  description: 'Include detailed metadata like inputs/outputs (default: false)',
                  default: false
                },
                includeAreas: {
                  type: 'boolean',
                  description: 'Include information about editable areas (default: true)',
                  default: true
                }
              },
              additionalProperties: false
            }
          },
          {
            name: 'spreadapi_get_service_details',
            description: getDetailsDescription,
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
          },
          {
            name: 'spreadapi_calc',
            description: calcDescription,
            inputSchema: {
              type: 'object',
              properties: {
                serviceId: {
                  type: 'string',
                  description: 'The ID of the service to execute',
                  enum: serviceInfo.calcServices.length > 0 
                    ? serviceInfo.calcServices.map(s => s.match(/\(([^)]+)\)/)?.[1]).filter(Boolean)
                    : undefined
                },
                inputs: {
                  type: 'object',
                  description: 'Input parameters for the service (key-value pairs)',
                  additionalProperties: true
                },
                areaUpdates: {
                  type: 'array',
                  description: 'Optional area updates to apply before calculation',
                  items: {
                    type: 'object',
                    properties: {
                      areaName: {
                        type: 'string',
                        description: 'The area to update'
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
                  description: 'Control what data is returned after calculation',
                  properties: {
                    includeOutputs: { 
                      type: 'boolean', 
                      description: 'Return calculation outputs (default: true)',
                      default: true 
                    },
                    includeAreaValues: { 
                      type: 'boolean', 
                      description: 'Return updated area values',
                      default: false 
                    },
                    includeAreaFormulas: { 
                      type: 'boolean', 
                      description: 'Return area formulas',
                      default: false 
                    },
                    includeAreaFormatting: { 
                      type: 'boolean', 
                      description: 'Return area formatting',
                      default: false 
                    }
                  }
                }
              },
              required: ['serviceId'],
              additionalProperties: false
            }
          },
          {
            name: 'spreadapi_read_area',
            description: areaDescription,
            inputSchema: {
              type: 'object',
              properties: {
                serviceId: {
                  type: 'string',
                  description: 'The ID of the service containing the area',
                  enum: serviceInfo.areaServices.length > 0 
                    ? serviceInfo.areaServices.map(s => s.match(/\(([^)]+)\)/)?.[1]).filter(Boolean)
                    : undefined
                },
                areaName: {
                  type: 'string',
                  description: 'The name of the area to read'
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
              required: ['serviceId', 'areaName'],
              additionalProperties: false
            }
          },
          {
            name: 'spreadapi_batch',
            description: 'Execute multiple calculations at once for comparison. Perfect for scenarios like comparing different loan terms, investment strategies, or budget variations.',
            inputSchema: {
              type: 'object',
              properties: {
                calculations: {
                  type: 'array',
                  description: 'Array of calculations to perform',
                  items: {
                    type: 'object',
                    properties: {
                      serviceId: {
                        type: 'string',
                        description: 'The service to use for this calculation'
                      },
                      inputs: {
                        type: 'object',
                        description: 'Input parameters for this calculation'
                      },
                      label: {
                        type: 'string',
                        description: 'Label for this scenario (e.g., "15-year loan", "Conservative estimate")'
                      }
                    },
                    required: ['serviceId', 'inputs']
                  },
                  minItems: 1,
                  maxItems: 10
                },
                compareOutputs: {
                  type: 'array',
                  description: 'Which outputs to include in comparison table',
                  items: { type: 'string' }
                }
              },
              required: ['calculations']
            }
          },
          {
            name: 'spreadapi_save_state',
            description: 'Save calculation results for later reference. WHEN TO USE: When the user says "remember this", "save this scenario", "let\'s compare this later", or when you want to preserve calculation results for multi-turn workflows. Examples: "Calculate my mortgage and save it", "Remember this as my baseline scenario".',
            inputSchema: {
              type: 'object',
              properties: {
                serviceId: {
                  type: 'string',
                  description: 'The service that was used for calculation'
                },
                inputs: {
                  type: 'object',
                  description: 'The input parameters that were used'
                },
                outputs: {
                  type: 'object',
                  description: 'The calculation results to save'
                },
                label: {
                  type: 'string',
                  description: 'Human-readable label for this saved state (e.g., "30-year mortgage option", "aggressive investment scenario")'
                },
                ttl: {
                  type: 'number',
                  description: 'Time-to-live in seconds. Defaults to 3600 (1 hour) for temporary states, use 86400 for 24-hour saved scenarios',
                  default: 3600
                }
              },
              required: ['serviceId', 'inputs', 'outputs', 'label'],
              additionalProperties: false
            }
          },
          {
            name: 'spreadapi_load_state',
            description: 'Retrieve previously saved calculation results. WHEN TO USE: When the user refers to a previous calculation like "the mortgage we calculated earlier", "compare with the scenario I saved", or "show me that calculation again". This retrieves both inputs and outputs.',
            inputSchema: {
              type: 'object',
              properties: {
                stateId: {
                  type: 'string',
                  description: 'The state ID returned from spreadapi_save_state'
                }
              },
              required: ['stateId'],
              additionalProperties: false
            }
          },
          {
            name: 'spreadapi_list_saved_states',
            description: 'List all saved calculation states for the current user. WHEN TO USE: When the user asks "what scenarios have I saved?", "show me my saved calculations", or when you need to help the user recall previous work. Returns a list with state IDs, labels, and metadata.',
            inputSchema: {
              type: 'object',
              properties: {
                serviceId: {
                  type: 'string',
                  description: 'Optional: filter by specific service. If omitted, shows all saved states across all services'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of states to return (default: 10, max: 50)',
                  default: 10
                }
              },
              additionalProperties: false
            }
          }
        ];

        // For backward compatibility: include service-specific tools if requested
        const includeServiceSpecificTools = params.includeServiceSpecificTools || false;
        
        if (includeServiceSpecificTools) {
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
                // Build area descriptions with AI context
                let areaDescriptions = areas.map(area => {
                  let desc = `${area.name}`;
                  if (area.alias) desc += ` (${area.alias})`;
                  if (area.description) desc += `: ${area.description}`;
                  if (area.aiContext?.purpose) desc += ` | Purpose: ${area.aiContext.purpose}`;
                  return desc;
                }).join('; ');
                
                // Add read area tool
                tools.push({
                    name: `spreadapi_read_area_${serviceId}`,
                    description: `Read data from editable areas in ${publishedData.title || serviceId}. Areas: ${areaDescriptions}`,
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
              }
              
            } catch (error) {
              console.error(`Error processing service ${serviceId}:`, error);
            }
          }
        }
        
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
        
        // Handle generic calc tool
        if (name === 'spreadapi_calc') {
          const { serviceId, inputs = {}, areaUpdates, returnOptions } = args;
          
          if (!serviceId) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INVALID_PARAMS,
                message: 'serviceId is required'
              },
              id
            };
          }
          
          // Check if this token has access to the service
          // Marketplace model: tokens must explicitly grant access to specific services
          const allowedServiceIds = auth.serviceIds || [];
          
          // Token must have explicit service access - no wildcards
          if (allowedServiceIds.length === 0) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INVALID_PARAMS,
                message: 'This token has no service access configured'
              },
              id
            };
          }
          
          // Check if this specific service is allowed
          if (!allowedServiceIds.includes(serviceId)) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INVALID_PARAMS,
                message: 'This token does not have access to this service'
              },
              id
            };
          }
          
          // Verify the service exists and is published
          const serviceExists = await redis.exists(`service:${serviceId}:published`);
          if (!serviceExists) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INVALID_PARAMS,
                message: 'Service not found or not published'
              },
              id
            };
          }
          
          // Execute the service with optional area updates
          const result = areaUpdates || (returnOptions && (returnOptions.includeAreaValues || 
                                                           returnOptions.includeAreaFormulas || 
                                                           returnOptions.includeAreaFormatting))
            ? await executeEnhancedCalc(serviceId, inputs, areaUpdates, returnOptions, auth)
            : await executeService(serviceId, inputs);
          
          return {
            jsonrpc: '2.0',
            result,
            id
          };
        }
        
        // Handle generic area read tool
        if (name === 'spreadapi_read_area') {
          const { serviceId, areaName, includeFormulas, includeFormatting } = args;
          
          if (!serviceId || !areaName) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INVALID_PARAMS,
                message: 'serviceId and areaName are required'
              },
              id
            };
          }
          
          // Check access permissions - marketplace model
          const allowedServiceIds = auth.serviceIds || [];
          
          // Token must have explicit service access
          if (allowedServiceIds.length === 0) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INVALID_PARAMS,
                message: 'This token has no service access configured'
              },
              id
            };
          }
          
          // Check if this specific service is allowed
          if (!allowedServiceIds.includes(serviceId)) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INVALID_PARAMS,
                message: 'This token does not have access to this service'
              },
              id
            };
          }
          
          // Verify service exists
          const serviceExists = await redis.exists(`service:${serviceId}:published`);
          if (!serviceExists) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INVALID_PARAMS,
                message: 'Service not found or not published'
              },
              id
            };
          }
          
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
        
        // Handle batch calculations
        if (name === 'spreadapi_batch') {
          try {
            const { calculations, compareOutputs } = args;
            
            if (!calculations || !Array.isArray(calculations) || calculations.length === 0) {
              throw new Error('Calculations array is required');
            }
            
            // Execute all calculations
            const results = [];
            for (const calc of calculations) {
              const { serviceId, inputs, label } = calc;
              
              // Check permissions for each service
              const userServiceIndex = await redis.hGetAll(`user:${auth.userId}:services`);
              if (!userServiceIndex[serviceId]) {
                results.push({
                  label: label || `Calculation ${results.length + 1}`,
                  error: 'Service not found'
                });
                continue;
              }
              
              const allowedServiceIds = auth.serviceIds || [];
              if (allowedServiceIds.length > 0 && !allowedServiceIds.includes(serviceId)) {
                results.push({
                  label: label || `Calculation ${results.length + 1}`,
                  error: 'Access denied'
                });
                continue;
              }
              
              try {
                const result = await executeService(serviceId, inputs);
                const outputText = result.content[0].text;
                
                // Parse outputs from the text response
                const outputs = {};
                const lines = outputText.split('\n');
                lines.forEach(line => {
                  const match = line.match(/^(.+?):\s*(.+)$/);
                  if (match) {
                    outputs[match[1]] = match[2];
                  }
                });
                
                results.push({
                  label: label || `Calculation ${results.length + 1}`,
                  serviceId,
                  inputs,
                  outputs,
                  success: true
                });
              } catch (error) {
                results.push({
                  label: label || `Calculation ${results.length + 1}`,
                  error: error.message
                });
              }
            }
            
            // Format comparison response
            let responseText = '▶ Batch Calculation Results\n\n';
            
            // Show individual results
            results.forEach((result) => {
              responseText += `### ${result.label}\n`;
              if (result.error) {
                responseText += `❌ Error: ${result.error}\n\n`;
              } else {
                Object.entries(result.outputs).forEach(([key, value]) => {
                  responseText += `${key}: ${value}\n`;
                });
                responseText += '\n';
              }
            });
            
            // Create comparison table if we have successful results
            const successfulResults = results.filter(r => r.success);
            if (successfulResults.length > 1) {
              responseText += '### Comparison Table\n\n';
              
              // Get all unique output keys
              const allOutputKeys = new Set();
              successfulResults.forEach(r => {
                Object.keys(r.outputs).forEach(key => allOutputKeys.add(key));
              });
              
              // Filter by compareOutputs if specified
              const outputsToCompare = compareOutputs && compareOutputs.length > 0
                ? Array.from(allOutputKeys).filter(key => compareOutputs.includes(key))
                : Array.from(allOutputKeys);
              
              // Build comparison table
              responseText += '| Scenario |';
              outputsToCompare.forEach(key => {
                responseText += ` ${key} |`;
              });
              responseText += '\n|' + '-|'.repeat(outputsToCompare.length + 1) + '\n';
              
              successfulResults.forEach(result => {
                responseText += `| ${result.label} |`;
                outputsToCompare.forEach(key => {
                  responseText += ` ${result.outputs[key] || 'N/A'} |`;
                });
                responseText += '\n';
              });
            }
            
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
                message: `Batch calculation failed: ${error.message}`
              },
              id
            };
          }
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
            
            // Prewarm the service asynchronously
            import('../../../../lib/prewarmService.js').then(({ prewarmService }) => {
              prewarmService(serviceId).catch(() => {
                console.log(`[MCP] Prewarm for ${serviceId} initiated`);
              });
            }).catch(() => {});
            
            // Format the response
            let responseText = `Service: ${publishedData.title || serviceId}\n`;
            responseText += `ID: ${serviceId}\n`;
            if (publishedData.description || publishedData.aiDescription) {
              responseText += `Description: ${publishedData.description || publishedData.aiDescription}\n`;
            }
            responseText += '\n';

            // Add usage guidance if available
            if (publishedData.aiUsageGuidance) {
              responseText += `WHEN TO USE:\n${publishedData.aiUsageGuidance}\n\n`;
            }

            // Check for areas
            let areas = [];
            if (publishedData.areas) {
              try {
                areas = JSON.parse(publishedData.areas);
              } catch (e) {
                console.error('Error parsing areas:', e);
              }
            }
            
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

                // Add AI examples if available
                if (input.aiExamples && input.aiExamples.length > 0) {
                  responseText += `\n  Examples: ${input.aiExamples.join(', ')}`;
                }

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

                // Add presentation hint if available
                if (output.aiPresentationHint) {
                  responseText += `\n  Present as: ${output.aiPresentationHint}`;
                }

                responseText += '\n';
              });
            }
            
            if (areas.length > 0) {
              responseText += '\nEDITABLE AREAS:\n';
              areas.forEach(area => {
                responseText += `• ${area.name}`;
                if (area.alias) responseText += ` (alias: ${area.alias})`;
                responseText += ` - ${area.mode}\n`;
                responseText += `  Address: ${area.address}\n`;
                if (area.description) responseText += `  Description: ${area.description}\n`;
                if (area.aiContext?.purpose) responseText += `  Purpose: ${area.aiContext.purpose}\n`;
                if (area.aiContext?.expectedBehavior) responseText += `  Expected Behavior: ${area.aiContext.expectedBehavior}\n`;
                responseText += `  Permissions:\n`;
                if (area.permissions.canReadValues) responseText += `    - Read values\n`;
                if (area.permissions.canReadFormulas) responseText += `    - Read formulas\n`;
                if (area.permissions.canReadFormatting) responseText += `    - Read formatting\n`;
                if (area.permissions.canWriteValues) responseText += `    - Write values\n`;
                if (area.permissions.canWriteFormulas) responseText += `    - Write formulas\n`;
                if (area.permissions.canWriteFormatting) responseText += `    - Write formatting\n`;
              });
            }
            
            responseText += `\nRequires Token: ${publishedData.needsToken === 'true' ? 'Yes' : 'No'}`;
            responseText += `\nCaching Enabled: ${publishedData.useCaching === 'true' ? 'Yes' : 'No'}`;
            
            // Add usage examples if available
            if (apiDefinition.aiUsageExamples && apiDefinition.aiUsageExamples.length > 0) {
              responseText += '\n\nUSAGE EXAMPLES:\n';
              apiDefinition.aiUsageExamples.forEach((example, idx) => {
                responseText += `${idx + 1}. ${example}\n`;
              });
            }
            
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
            const includeAreas = args.includeAreas !== false; // Default to true
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
                description: publishedData.description || publishedData.aiDescription || '',
                created: publishedData.created,
                modified: publishedData.modified,
                calls: publishedData.calls || '0',
                hasCalculation: false,
                hasAreas: false
              };
              
              // Check for inputs/outputs
              if (publishedData.inputs && publishedData.outputs) {
                try {
                  const inputs = JSON.parse(publishedData.inputs);
                  const outputs = JSON.parse(publishedData.outputs);
                  if ((inputs.length > 0 || outputs.length > 0)) {
                    serviceInfo.hasCalculation = true;
                    if (includeMetadata) {
                      serviceInfo.inputCount = inputs.length;
                      serviceInfo.outputCount = outputs.length;
                    }
                  }
                } catch (e) {
                  // Skip on parse error
                }
              }
              
              // Parse areas if requested
              if (includeAreas && publishedData.areas) {
                try {
                  const areas = JSON.parse(publishedData.areas);
                  if (areas.length > 0) {
                    serviceInfo.hasAreas = true;
                    serviceInfo.areas = areas.map(area => ({
                      name: area.name,
                      alias: area.alias,
                      address: area.address,
                      mode: area.mode,
                      permissions: area.permissions
                    }));
                  }
                } catch (e) {
                  console.error('Error parsing areas:', e);
                }
              }
              
              if (includeMetadata && publishedData.urlData) {
                serviceInfo.hasApiUrl = true;
                serviceInfo.needsToken = publishedData.needsToken === 'true';
                serviceInfo.useCaching = publishedData.useCaching === 'true';
              }
              
              services.push(serviceInfo);
            }
            
            // Format output
            let responseText = `Found ${services.length} published services:\n\n`;
            
            for (const service of services) {
              responseText += `▶ ${service.title} (ID: ${service.id})\n`;
              if (service.description) {
                responseText += `   ${service.description}\n`;
              }
              responseText += `   Type: `;
              const types = [];
              if (service.hasCalculation) types.push('Calculation');
              if (service.hasAreas) types.push('Interactive Areas');
              responseText += types.length > 0 ? types.join(' + ') : 'Unknown';
              responseText += `\n`;
              
              if (includeMetadata) {
                if (service.hasCalculation) {
                  responseText += `   Inputs: ${service.inputCount}, Outputs: ${service.outputCount}\n`;
                }
                if (service.needsToken !== undefined) {
                  responseText += `   Token Required: ${service.needsToken ? 'Yes' : 'No'}\n`;
                }
              }
              
              if (includeAreas && service.areas) {
                responseText += `   Areas:\n`;
                for (const area of service.areas) {
                  responseText += `   - ${area.name}`;
                  if (area.alias) responseText += ` (alias: ${area.alias})`;
                  responseText += `: ${area.mode}`;
                  responseText += ` [${area.address}]\n`;
                }
              }
              
              responseText += `   Calls: ${service.calls}\n\n`;
            }
            
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
                message: `Failed to list services: ${error.message}`
              },
              id
            };
          }
        }

        // Handle state management tools
        if (name === 'spreadapi_save_state') {
          try {
            const { serviceId, inputs, outputs, label, ttl } = args;

            if (!serviceId || !inputs || !outputs || !label) {
              throw new Error('serviceId, inputs, outputs, and label are required');
            }

            // Save state to Redis
            const result = await saveState(
              auth.userId,
              serviceId,
              inputs,
              outputs,
              label,
              ttl
            );

            return {
              jsonrpc: '2.0',
              result: {
                content: [{
                  type: 'text',
                  text: `✅ Saved state: "${label}"\n\nState ID: ${result.stateId}\nExpires: ${result.expiresAt}\n\nYou can retrieve this later using spreadapi_load_state with the state ID.`
                }],
                metadata: result
              },
              id
            };

          } catch (error) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INTERNAL_ERROR,
                message: `Failed to save state: ${error.message}`
              },
              id
            };
          }
        }

        if (name === 'spreadapi_load_state') {
          try {
            const { stateId } = args;

            if (!stateId) {
              throw new Error('stateId is required');
            }

            // Load state from Redis
            const state = await loadState(auth.userId, stateId);

            // Format response
            let responseText = `📋 Loaded state: "${state.label}"\n\n`;
            responseText += `Service: ${state.serviceId}\n`;
            responseText += `Created: ${new Date(state.created).toISOString()}\n\n`;

            responseText += `INPUTS:\n`;
            for (const [key, value] of Object.entries(state.inputs)) {
              responseText += `  ${key}: ${value}\n`;
            }

            responseText += `\nOUTPUTS:\n`;
            for (const [key, value] of Object.entries(state.outputs)) {
              responseText += `  ${key}: ${value}\n`;
            }

            return {
              jsonrpc: '2.0',
              result: {
                content: [{
                  type: 'text',
                  text: responseText
                }],
                metadata: state
              },
              id
            };

          } catch (error) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INTERNAL_ERROR,
                message: `Failed to load state: ${error.message}`
              },
              id
            };
          }
        }

        if (name === 'spreadapi_list_saved_states') {
          try {
            const { serviceId, limit } = args;

            // List states from Redis
            const states = await listStates(auth.userId, serviceId, limit);

            if (states.length === 0) {
              return {
                jsonrpc: '2.0',
                result: {
                  content: [{
                    type: 'text',
                    text: serviceId
                      ? `No saved states found for service "${serviceId}".`
                      : 'No saved states found. Use spreadapi_save_state to save calculation results.'
                  }]
                },
                id
              };
            }

            // Format response
            let responseText = `📚 Saved States (${states.length}):\n\n`;

            states.forEach((state, index) => {
              const createdDate = new Date(state.created).toLocaleString();
              responseText += `${index + 1}. "${state.label}"\n`;
              responseText += `   State ID: ${state.stateId}\n`;
              responseText += `   Service: ${state.serviceId}\n`;
              responseText += `   Created: ${createdDate}\n\n`;
            });

            responseText += `Use spreadapi_load_state(stateId) to retrieve any of these states.`;

            return {
              jsonrpc: '2.0',
              result: {
                content: [{
                  type: 'text',
                  text: responseText
                }],
                metadata: { states }
              },
              id
            };

          } catch (error) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INTERNAL_ERROR,
                message: `Failed to list states: ${error.message}`
              },
              id
            };
          }
        }

        // Handle backward compatibility: service-specific area read tool
        if (name.startsWith('spreadapi_read_area_')) {
          const serviceId = name.replace('spreadapi_read_area_', '');
          const { areaName, includeFormulas, includeFormatting } = args;
          
          // Check access permissions - marketplace model
          const allowedServiceIds = auth.serviceIds || [];
          
          // Token must have explicit service access
          if (allowedServiceIds.length === 0) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INVALID_PARAMS,
                message: 'This token has no service access configured'
              },
              id
            };
          }
          
          // Check if this specific service is allowed
          if (!allowedServiceIds.includes(serviceId)) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INVALID_PARAMS,
                message: 'This token does not have access to this service'
              },
              id
            };
          }
          
          // Verify service exists
          const serviceExists = await redis.exists(`service:${serviceId}:published`);
          if (!serviceExists) {
            return {
              jsonrpc: '2.0',
              error: {
                code: INVALID_PARAMS,
                message: 'Service not found or not published'
              },
              id
            };
          }
          
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
        
        // Handle backward compatibility: service-specific calculation tools
        if (name.startsWith('spreadapi_calc_')) {
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
        
        // If we get here, it's an unknown tool
        return {
          jsonrpc: '2.0',
          error: {
            code: INVALID_PARAMS,
            message: 'Invalid params: unknown tool name'
          },
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

export async function OPTIONS() {
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