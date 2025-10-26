import { NextResponse } from 'next/server';
import redis from '../../../../../lib/redis';
import { getApiDefinition } from '../../../../../utils/helperApi';
import { calculateDirect } from '../../../../../app/api/v1/services/[id]/execute/calculateDirect.js';
import { executeEnhancedCalc } from '../../../../../lib/mcp/executeEnhancedCalc.js';
import { executeAreaRead } from '../../../../../lib/mcp/areaExecutors.js';
import { saveState, loadState, listStates } from '../../../../../lib/mcpState.js';
import { formatValueWithExcelFormat } from '../../../../../utils/formatting.js';
import { getSingleServiceInstructions } from '../../../../../lib/mcp-ai-instructions.js';

// Vercel timeout configuration
export const maxDuration = 30;

/**
 * MCP (Model Context Protocol) Server - Service-Specific Endpoint
 *
 * Each service gets its own MCP endpoint at /api/mcp/service/{serviceId}
 * This provides immediate access to service metadata without discovery calls.
 *
 * Authentication:
 * - OAuth tokens (oat_...) with scope spapi:service:{serviceId}:execute
 *   Generated via OAuth flow for ChatGPT and Claude Desktop
 * - Service tokens (direct API tokens for the specific service)
 *   Can be used directly without OAuth for testing/development
 *
 * Protocol: HTTP with streaming responses and session management
 */

// MCP Protocol constants
const MCP_VERSION = '2024-11-05';
const SERVER_NAME = 'spreadapi-mcp';
const SERVER_VERSION = '1.0.0';
const SESSION_TTL = 600; // 10 minutes

// JSON-RPC error codes
const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;
const AUTH_ERROR = -32001;

/**
 * Generate a new session ID
 */
function generateSessionId() {
  return `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new session in Redis
 */
async function createSession(userId, serviceId) {
  const sessionId = generateSessionId();
  const now = Date.now();

  await redis.hSet(`mcp:session:${sessionId}`, {
    userId: userId,
    serviceId: serviceId,
    created: now.toString(),
    lastActivity: now.toString()
  });

  await redis.expire(`mcp:session:${sessionId}`, SESSION_TTL);
  return sessionId;
}

/**
 * Get session from Redis
 */
async function getSession(sessionId) {
  if (!sessionId) return null;

  try {
    const session = await redis.hGetAll(`mcp:session:${sessionId}`);
    if (!session || Object.keys(session).length === 0) {
      return null;
    }

    return {
      userId: session.userId,
      serviceId: session.serviceId,
      created: parseInt(session.created),
      lastActivity: parseInt(session.lastActivity)
    };
  } catch (error) {
    console.error('[MCP Session] Error getting session:', error);
    return null;
  }
}

/**
 * Update session activity and refresh TTL
 */
async function touchSession(sessionId) {
  if (!sessionId) return;

  try {
    await redis.hSet(`mcp:session:${sessionId}`, 'lastActivity', Date.now().toString());
    await redis.expire(`mcp:session:${sessionId}`, SESSION_TTL);
  } catch (error) {
    console.error('[MCP Session] Error touching session:', error);
  }
}

/**
 * Validate OAuth access token for this service
 */
async function validateOAuthToken(token, serviceId) {
  try {
    const metadata = await redis.hGetAll(`oauth:token:${token}`);

    if (!metadata || Object.keys(metadata).length === 0) {
      return {
        valid: false,
        error: 'Token not found or expired'
      };
    }

    // Check scope includes this service
    const scope = metadata.scope || '';
    const requiredScope = `spapi:service:${serviceId}:execute`;

    if (!scope.includes(requiredScope)) {
      console.log(`[MCP Auth] OAuth token missing required scope: ${requiredScope}`);
      return {
        valid: false,
        error: `Insufficient scope. Required: ${requiredScope}`
      };
    }

    return {
      valid: true,
      userId: metadata.user_id,
      tokenName: `OAuth: ${metadata.client_id}`,
      isOAuth: true,
      scope: scope
    };
  } catch (error) {
    console.error('[MCP Auth] OAuth token validation error:', error);
    return {
      valid: false,
      error: 'Invalid or expired OAuth token'
    };
  }
}

/**
 * Validate service token (direct API token)
 */
async function validateServiceToken(token, serviceId) {
  try {
    // Get service data to check if token is valid
    const serviceData = await redis.hGetAll(`service:${serviceId}:published`);

    if (!serviceData || Object.keys(serviceData).length === 0) {
      return {
        valid: false,
        error: 'Service not found or not published'
      };
    }

    const needsToken = serviceData.needsToken === 'true';
    const tokens = serviceData.tokens ? serviceData.tokens.split(',') : [];

    if (needsToken && !tokens.includes(token)) {
      return {
        valid: false,
        error: 'Invalid service token'
      };
    }

    return {
      valid: true,
      userId: serviceData.tenantId,
      tokenName: 'Service Token',
      isServiceToken: true
    };
  } catch (error) {
    console.error('[MCP Auth] Service token validation error:', error);
    return {
      valid: false,
      error: 'Token validation failed'
    };
  }
}

/**
 * Unified authentication middleware for service endpoint
 */
async function authenticateRequest(request, serviceId) {
  const authHeader = request.headers.get('authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Check if service requires authentication
  const serviceData = await redis.hGetAll(`service:${serviceId}:published`);

  if (!serviceData || Object.keys(serviceData).length === 0) {
    return {
      valid: false,
      error: 'Service not found or not published',
      status: 404
    };
  }

  const needsToken = serviceData.needsToken === 'true';

  // If service doesn't need token, allow access
  if (!needsToken) {
    return {
      valid: true,
      userId: serviceData.tenantId,
      tokenName: 'Public Service',
      isPublic: true
    };
  }

  // Service needs authentication
  if (!token) {
    return {
      valid: false,
      error: 'Authentication required',
      status: 401,
      needsAuth: true
    };
  }

  // Validate based on token type
  let validation;

  if (token.startsWith('oat_')) {
    // OAuth token (ChatGPT and Claude Desktop)
    validation = await validateOAuthToken(token, serviceId);
  } else {
    // Assume it's a service token (direct API token)
    validation = await validateServiceToken(token, serviceId);
  }

  if (!validation.valid) {
    return {
      valid: false,
      error: validation.error,
      status: 401,
      needsAuth: true
    };
  }

  return {
    valid: true,
    userId: validation.userId,
    tokenName: validation.tokenName,
    isOAuth: validation.isOAuth,
    isServiceToken: validation.isServiceToken,
    scope: validation.scope
  };
}

/**
 * Build tools for this specific service
 */
async function buildServiceTools(serviceId, apiDefinition) {
  const tools = [];

  // Tool 1: Calculate (primary tool)
  const calcTool = {
    name: 'spreadapi_calc',
    description: `🎯 PRIMARY CALCULATION TOOL

SERVICE: ${apiDefinition.serviceName || serviceId}
PURPOSE: ${apiDefinition.description || 'Perform calculations'}

WHEN TO USE:
- User asks for a calculation
- User provides numeric values or scenarios
- This is your main tool for calculations!

${apiDefinition.aiDescription ? `⚠️  IMPORTANT: ${apiDefinition.aiDescription}\n\n` : ''}${apiDefinition.aiUsageGuidance ? `💡 GUIDANCE: ${apiDefinition.aiUsageGuidance}\n\n` : ''}⚠️  CRITICAL - PERCENTAGE VALUES:
ALWAYS convert percentages to decimals (divide by 100):
• "5%" → 0.05 (NOT 5)
• "42%" → 0.42 (NOT 42)

🔑 PARAMETER NAMES vs TITLES:
• Use NAMES (e.g., "interest_rate") when calling the API
• Use TITLES (e.g., "Interest Rate") when displaying to users
• The schema shows: name → description (title for context)

📊 PRESENTING RESULTS:
Outputs include formatString - ALWAYS use it when available!
Example: {"value": 265.53, "formatString": "€#,##0.00", "title": "Monthly Payment"}
→ Present as: "Monthly Payment: €265.53"`,
    inputSchema: {
      type: 'object',
      properties: {
        inputs: {
          type: 'object',
          description: 'Input values for the calculation. Use parameter names as keys. ' +
            (apiDefinition.inputs ? `Required: ${apiDefinition.inputs.map(i => `"${i.name}"`).join(', ')}` : 'See service details'),
          additionalProperties: true,
          ...(apiDefinition.inputs && apiDefinition.inputs.length > 0 && {
            properties: apiDefinition.inputs.reduce((acc, input) => {
              acc[input.name] = {
                description: input.title || input.name,
                type: input.type === 'number' ? 'number' : input.type === 'boolean' ? 'boolean' : 'string'
              };
              return acc;
            }, {})
          })
        }
      },
      required: ['inputs']
    }
  };
  tools.push(calcTool);

  // Tool 2: Batch calculations
  const batchTool = {
    name: 'spreadapi_batch',
    description: `⚡ BATCH COMPARISON TOOL - Compare multiple scenarios

SERVICE: ${apiDefinition.serviceName || serviceId}
PURPOSE: Run multiple calculations in parallel for comparison

WHEN TO USE:
- User wants to compare 3+ scenarios (e.g., "compare these 5 options")
- What-if analysis ("what if I change X to A, B, or C?")
- User provides a list of alternatives to evaluate

WHEN NOT TO USE:
- Single calculation → Use spreadapi_calc instead
- Only 2 scenarios → Just call spreadapi_calc twice (faster)

EXAMPLE:
User: "Compare loan with 5%, 6%, and 7% interest"
→ Call spreadapi_batch with 3 scenarios, each with different interest_rate

MUCH FASTER than calling spreadapi_calc 3 times separately!`,
    inputSchema: {
      type: 'object',
      properties: {
        scenarios: {
          type: 'array',
          description: 'Array of scenarios to calculate. Each scenario needs a label and inputs.',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: 'Descriptive label (e.g., "5% interest", "Option A")' },
              inputs: { type: 'object', description: 'Input values for this scenario' }
            },
            required: ['inputs']
          },
          minItems: 2
        }
      },
      required: ['scenarios']
    }
  };
  tools.push(batchTool);

  // Tool 3: Get service details
  const detailsTool = {
    name: 'spreadapi_get_details',
    description: `📋 DISCOVERY TOOL - Get parameter details for ${apiDefinition.serviceName || serviceId}

SERVICE: ${apiDefinition.serviceName || serviceId}
PURPOSE: ${apiDefinition.description || 'Discover what this service can calculate'}

WHEN TO USE:
- You need to know what parameters are required
- User asks "what can you calculate?" or "what inputs do you need?"
- Calculation failed and you need to understand why
- First time using this service

WHEN NOT TO USE:
- User already provided all values → Skip this, calculate directly!
- You're just exploring → This is a calculation service, not a documentation browser

RETURNS:
Complete service information including:
- inputs: All parameters with types, defaults, constraints
- outputs: What you'll get back
- aiDescription: Special instructions (ALWAYS READ THIS!)
- aiUsageGuidance: How to use this service correctly`,
    inputSchema: {
      type: 'object',
      properties: {}
    }
  };
  tools.push(detailsTool);

  // Tool 4: State management - Save state (always available)
  tools.push({
    name: 'spreadapi_save_state',
    description: `💾 SAVE STATE - Store calculation results for later comparison

WHEN TO USE:
- User says "save this", "remember this", "bookmark this"
- User wants to compare results with future calculations
- Building up multiple alternatives over time
- User asks "can we compare this with what we did earlier?"

WORKFLOW EXAMPLE:
1. User: "Calculate loan payment at 5% interest"
2. You: Call spreadapi_calc, get result
3. You: Save with spreadapi_save_state(stateName="5% interest", inputs={...})
4. Later user: "Now try 6% and compare with the 5% option"
5. You: Calculate 6%, then load "5% interest" state to show comparison

States persist across sessions - use descriptive names like "baseline", "optimistic", "Option A"!`,
    inputSchema: {
      type: 'object',
      properties: {
        stateName: { type: 'string', description: 'Descriptive name for this state (e.g., "baseline", "high_rate", "Option A")' },
        inputs: { type: 'object', description: 'Input values used for this calculation' }
      },
      required: ['stateName', 'inputs']
    }
  });

  // Tool 5: State management - Load state (always available)
  tools.push({
    name: 'spreadapi_load_state',
    description: `📂 LOAD STATE - Retrieve previously saved calculation state

WHEN TO USE:
- User asks to "compare with earlier" or "show me the previous calculation"
- User references a saved scenario by name
- You need to recall inputs from a prior calculation
- Building temporal comparisons

TIP: Call spreadapi_list_saved_states first if you don't know what's saved`,
    inputSchema: {
      type: 'object',
      properties: {
        stateName: { type: 'string', description: 'Name of the state to load (exact match required)' }
      },
      required: ['stateName']
    }
  });

  // Tool 6: State management - List saved states (always available)
  tools.push({
    name: 'spreadapi_list_saved_states',
    description: `📋 LIST SAVED STATES - Show all available saved states

WHEN TO USE:
- User asks "what did we save?" or "show me my saved scenarios"
- Before loading a state (to see what's available)
- User asks to "compare with earlier" but doesn't specify which one

RETURNS:
List of state names with their saved input values

AUTO-USE: If user references "earlier calculation" but you don't know the name, call this first!`,
    inputSchema: {
      type: 'object',
      properties: {}
    }
  });

  // Tool 7: Read area (only if service has editable areas)
  if (apiDefinition.editableAreas && apiDefinition.editableAreas.length > 0) {
    tools.push({
      name: 'spreadapi_read_area',
      description: `📖 READ EDITABLE AREA - Access data tables from spreadsheet

WHAT ARE EDITABLE AREAS:
Named data ranges (like Excel tables) that contain reference data.
Examples: Product catalogs, price lists, configuration tables, lookup data.

WHEN TO USE:
- User asks "what products are available?" or "show me the options"
- You need to see what data is in the spreadsheet before calculating
- Building data-driven calculations that reference the table
- User wants to know "what's in the spreadsheet?"

AVAILABLE AREAS:
${apiDefinition.editableAreas.map(a => `• ${a.name}: ${a.description || 'Data table'}`).join('\n')}

WORKFLOW:
1. Read area to see available data
2. Use data in calculations with spreadapi_calc
3. Reference specific values from the area

TIP: Call this early if you need to know what data is available!`,
      inputSchema: {
        type: 'object',
        properties: {
          areaName: {
            type: 'string',
            description: `Area name. Available: ${apiDefinition.editableAreas.map(a => a.name).join(', ')}`
          }
        },
        required: ['areaName']
      }
    });
  }

  return tools;
}

/**
 * Handle initialize request
 */
async function handleInitialize(serviceId, apiDefinition, rpcParams, rpcId) {
  // Echo the client's protocol version if we support it
  const clientVersion = rpcParams?.protocolVersion || '2024-11-05';
  const supportedVersions = ['2024-11-05', '2025-03-26', '2025-06-18'];
  const agreedVersion = supportedVersions.includes(clientVersion) ? clientVersion : MCP_VERSION;

  const response = {
    protocolVersion: agreedVersion,  // Echo client's version
    capabilities: {
      tools: {
        listChanged: false  // Service-specific endpoint has fixed tools
      }
    },
    serverInfo: {
      name: apiDefinition.serviceName || serviceId,
      version: SERVER_VERSION,
      // Add service description for better context
      ...(apiDefinition.description && { description: apiDefinition.description }),
      // Add instructions for AI agent onboarding
      instructions: `═══════════════════════════════════════════════════════════════
🎯 SERVICE: ${apiDefinition.serviceName || serviceId}
═══════════════════════════════════════════════════════════════

${apiDefinition.fullDescription || apiDefinition.description || 'Spreadsheet-based calculation service'}

${apiDefinition.aiDescription ? `\n⚠️  IMPORTANT: ${apiDefinition.aiDescription}\n` : ''}${apiDefinition.aiUsageGuidance ? `💡 GUIDANCE: ${apiDefinition.aiUsageGuidance}\n` : ''}
───────────────────────────────────────────────────────────────
📖 HOW TO USE THIS SERVICE:
───────────────────────────────────────────────────────────────

1️⃣  SINGLE CALCULATION (most common):
   User: "Calculate my result with X=10, Y=20"
   → Call spreadapi_calc with inputs

2️⃣  COMPARE SCENARIOS (3+ options):
   User: "Compare options A, B, and C"
   → Call spreadapi_batch once with all scenarios

3️⃣  DISCOVER PARAMETERS:
   First time using OR calculation failed?
   → Call spreadapi_get_details to see required inputs

4️⃣  SAVE & COMPARE:
   User: "Save this for later" or "Compare with earlier"
   → spreadapi_save_state → spreadapi_list_saved_states → spreadapi_load_state

5️⃣  WORK WITH DATA:
   ${apiDefinition.editableAreas?.length ? `Service has editable areas: ${apiDefinition.editableAreas.map(a => a.name).join(', ')}\n   → Use spreadapi_read_area to access data tables` : 'No editable areas available'}

───────────────────────────────────────────────────────────────
⚠️  CRITICAL RULES:
───────────────────────────────────────────────────────────────
• Percentages MUST be decimals (5% = 0.05, NOT 5)
• ALWAYS use formatString from outputs for proper display
• Read tool descriptions for detailed guidance on each tool`
    }
  };

  // Build description with AI guidance
  let desc = `${apiDefinition.serviceName || 'Spreadsheet Service'}: ${apiDefinition.fullDescription || apiDefinition.description || 'Calculation service'}\n\n`;

  if (apiDefinition.aiDescription) {
    desc += `⚠️  IMPORTANT: ${apiDefinition.aiDescription}\n\n`;
  }
  if (apiDefinition.aiUsageGuidance) {
    desc += `💡 GUIDANCE: ${apiDefinition.aiUsageGuidance}\n\n`;
  }

  response.serverInfo.description = desc;
  response.serverInfo.instructions = getSingleServiceInstructions(serviceId, apiDefinition.serviceName || serviceId);

  return {
    jsonrpc: '2.0',
    result: response,
    id: rpcId
  };
}

/**
 * Handle tools/list request
 */
async function handleToolsList(serviceId, apiDefinition, rpcId) {
  const tools = await buildServiceTools(serviceId, apiDefinition);

  return {
    jsonrpc: '2.0',
    result: { tools },
    id: rpcId
  };
}

/**
 * Handle tools/call request
 */
async function handleToolCall(serviceId, apiDefinition, params, rpcId, userId) {
  const { name: toolName, arguments: toolArgs } = params;

  try {
    let result;

    switch (toolName) {
      case 'spreadapi_calc': {
        // Single calculation - use optimized path when no area updates
        if (!toolArgs.areaUpdates || toolArgs.areaUpdates.length === 0) {
          // No area updates - use the standard, battle-tested calculateDirect
          const calcResult = await calculateDirect(
            serviceId,
            toolArgs.inputs || {},
            null, // token handled by MCP auth layer
            {}   // no special options
          );

          // Format for MCP protocol
          if (calcResult.error) {
            result = {
              error: calcResult.error,
              message: calcResult.message || calcResult.error
            };
          } else {
            result = calcResult;
          }
        } else {
          // Area updates present - use enhanced calc
          result = await executeEnhancedCalc(
            serviceId,
            toolArgs.inputs,
            toolArgs.areaUpdates,
            {},
            null
          );
        }
        break;
      }

      case 'spreadapi_batch': {
        // Batch calculations - use optimized calculateDirect for better performance
        const scenarios = toolArgs.scenarios || [];
        console.log(`[MCP Batch] Processing ${scenarios.length} scenarios for service ${serviceId}`);

        // DEBUG: Log all scenario inputs
        scenarios.forEach((scenario, index) => {
          console.log(`[MCP Batch Debug] Scenario ${index + 1} (${scenario.label || 'unlabeled'}):`, {
            inputs: JSON.stringify(scenario.inputs || {}),
            inputKeys: Object.keys(scenario.inputs || {}).sort()
          });
        });

        const results = await Promise.all(
          scenarios.map(async (scenario, index) => {
            try {
              // Batch calculations typically don't have area updates
              // Use calculateDirect for better performance and reliability
              const calcResult = await calculateDirect(
                serviceId,
                scenario.inputs || {},
                null, // token handled by MCP auth layer
                {}   // no special options
              );

              // Return compact response (outputs only, not full metadata)
              return {
                label: scenario.label || `Scenario ${index + 1}`,
                inputs: scenario.inputs,
                outputs: calcResult.outputs || {},
                ...(calcResult.error && { error: calcResult.error })
              };
            } catch (error) {
              console.error(`[MCP Batch] Error in scenario ${index}:`, error);
              return {
                label: scenario.label || `Scenario ${index + 1}`,
                error: error.message || 'Calculation failed'
              };
            }
          })
        );

        console.log(`[MCP Batch] Completed ${results.length} scenarios, ${results.filter(r => !r.error).length} successful`);
        result = { scenarios: results };
        break;
      }

      case 'spreadapi_get_details': {
        // Return service details
        result = {
          serviceId,
          serviceName: apiDefinition.serviceName,
          description: apiDefinition.description,
          fullDescription: apiDefinition.fullDescription,
          aiDescription: apiDefinition.aiDescription,
          aiUsageGuidance: apiDefinition.aiUsageGuidance,
          aiUsageExamples: apiDefinition.aiUsageExamples,
          inputs: apiDefinition.inputs,
          outputs: apiDefinition.outputs,
          editableAreas: apiDefinition.editableAreas
        };
        break;
      }

      case 'spreadapi_read_area': {
        // Read editable area
        const areaName = toolArgs.areaName;
        result = await executeAreaRead(serviceId, areaName, apiDefinition);
        break;
      }

      case 'spreadapi_save_state': {
        // Save state
        result = await saveState(userId, serviceId, toolArgs.stateName, toolArgs.inputs);
        break;
      }

      case 'spreadapi_load_state': {
        // Load state
        result = await loadState(userId, serviceId, toolArgs.stateName);
        break;
      }

      case 'spreadapi_list_saved_states': {
        // List all saved states
        result = await listStates(userId, serviceId);
        break;
      }

      default:
        return {
          jsonrpc: '2.0',
          error: {
            code: METHOD_NOT_FOUND,
            message: `Unknown tool: ${toolName}`
          },
          id: rpcId
        };
    }

    return {
      jsonrpc: '2.0',
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      },
      id: rpcId
    };
  } catch (error) {
    console.error(`[MCP Tool Error] ${toolName}:`, error);
    return {
      jsonrpc: '2.0',
      error: {
        code: INTERNAL_ERROR,
        message: error.message || 'Tool execution failed'
      },
      id: rpcId
    };
  }
}

/**
 * Main POST handler
 */
export async function POST(request, { params }) {
  const { serviceId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spreadapi.io';

  try {
    // Authenticate request
    const auth = await authenticateRequest(request, serviceId);

    if (!auth.valid) {
      // Build required scope for WWW-Authenticate header
      const requiredScope = `spapi:service:${serviceId}:execute`;

      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: {
            code: AUTH_ERROR,
            message: auth.error || 'Authentication failed'
          },
          id: null
        },
        {
          status: auth.status || 401,
          headers: {
            'Content-Type': 'application/json',
            // Standard WWW-Authenticate header with required scope
            'WWW-Authenticate': `Bearer, scope="${requiredScope}"`,
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Session management (for ChatGPT)
    let sessionId = request.headers.get('Mcp-Session-Id');
    let session = null;

    if (sessionId) {
      session = await getSession(sessionId);
      if (session) {
        if (session.userId !== auth.userId || session.serviceId !== serviceId) {
          session = null;
          sessionId = null;
        } else {
          await touchSession(sessionId);
        }
      } else {
        sessionId = null;
      }
    }

    if (!sessionId) {
      sessionId = await createSession(auth.userId, serviceId);
      console.log(`[MCP Session] Created session ${sessionId} for service ${serviceId}`);
    }

    // Parse JSON-RPC request
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: {
            code: PARSE_ERROR,
            message: 'Parse error'
          },
          id: null
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Mcp-Session-Id': sessionId,
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    const { method, params: rpcParams, id: rpcId } = body;

    // Load service metadata
    const apiDefinition = await getApiDefinition(serviceId, null);

    if (apiDefinition.error) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: {
            code: INTERNAL_ERROR,
            message: apiDefinition.message || 'Service not available'
          },
          id: rpcId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Mcp-Session-Id': sessionId,
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Route to handler
    let response;
    switch (method) {
      case 'initialize':
        response = await handleInitialize(serviceId, apiDefinition, rpcParams, rpcId);
        break;
      case 'tools/list':
        response = await handleToolsList(serviceId, apiDefinition, rpcId);
        break;
      case 'tools/call':
        response = await handleToolCall(serviceId, apiDefinition, rpcParams, rpcId, auth.userId);
        break;
      default:
        response = {
          jsonrpc: '2.0',
          error: {
            code: METHOD_NOT_FOUND,
            message: `Unknown method: ${method}`
          },
          id: rpcId
        };
    }

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Mcp-Session-Id': sessionId,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id'
      }
    });

  } catch (error) {
    console.error('[MCP Service Error]:', error);
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
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id',
      'Access-Control-Max-Age': '86400'
    }
  });
}
