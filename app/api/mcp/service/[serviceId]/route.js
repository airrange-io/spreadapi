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

  // Build the properties object for schema (needed by calcTool and batchTool)
  const inputProperties = (apiDefinition.inputs && apiDefinition.inputs.length > 0)
    ? apiDefinition.inputs.reduce((acc, input) => {
        acc[input.name] = {
          description: input.title || input.name,
          type: input.type === 'number' ? 'number' : input.type === 'boolean' ? 'boolean' : 'string'
        };
        return acc;
      }, {})
    : {};

  // WORKAROUND for ChatGPT's nested schema bug: Create a stringified parameter reference
  const parameterSchemaString = (apiDefinition.inputs && apiDefinition.inputs.length > 0)
    ? '\n\n📋 PARAMETER SCHEMA (for ChatGPT compatibility):\n```json\n' +
      JSON.stringify(
        apiDefinition.inputs.reduce((acc, input) => {
          acc[input.name] = {
            type: input.type === 'number' ? 'number' : input.type === 'boolean' ? 'boolean' : 'string',
            description: input.title || input.name,
            ...(input.min !== undefined && { min: input.min }),
            ...(input.max !== undefined && { max: input.max }),
            ...(input.mandatory !== false && { required: true })
          };
          return acc;
        }, {}),
        null,
        2
      ) + '\n```'
    : '';

  // Tool 1: Calculate (primary tool)
  const calcTool = {
    name: 'spreadapi_calc',
    description: `🎯 PRIMARY CALCULATION TOOL - ${apiDefinition.serviceName || serviceId}

═══════════════════════════════════════════════════════════════════
📌 WHAT THIS TOOL DOES
═══════════════════════════════════════════════════════════════════
${apiDefinition.description || 'Performs calculations based on input parameters'}

Execute a single calculation with provided input values and receive calculated outputs.

${apiDefinition.aiDescription ? `\n⚠️  SERVICE-SPECIFIC IMPORTANT NOTE:\n${apiDefinition.aiDescription}\n` : ''}${apiDefinition.aiUsageGuidance ? `\n💡 HOW TO USE THIS SERVICE:\n${apiDefinition.aiUsageGuidance}\n` : ''}
═══════════════════════════════════════════════════════════════════
⚠️  CRITICAL BEHAVIORS (Read server instructions above for details)
═══════════════════════════════════════════════════════════════════

🔢 PERCENTAGE VALUES - AUTOMATIC CONVERSION:
   The system has smart auto-conversion for percentage values:
   • User says "5%" → You can send: 5, "5%", or 0.05 (all work!)
   • System internally uses decimal format (0.05 = 5%)
   • BEST PRACTICE: Always convert to decimal yourself (5% → 0.05)
   • Fallback: If you send 5, system will auto-detect and convert

   ⚠️  WHY THIS MATTERS: Sending wrong format causes ABSURD results!
   Example: 6 instead of 0.06 = 600% interest = wildly wrong numbers

🔑 PARAMETER NAMING - USE CANONICAL NAMES:
   • API accepts: NAMES (e.g., "interest_rate", "monthly_deposit")
   • Display to users: TITLES (e.g., "Interest Rate", "Monthly Deposit")
   • Schema below shows: parameter_name with "Title" as description
   • ALWAYS use parameter names in your tool calls!

📊 RESULT FORMATTING - USE formatString:
   Outputs include formatString property - ALWAYS use it!
   Example: {"value": 265.53, "formatString": "€#,##0.00", "title": "Monthly Payment"}
   → Display as: "Monthly Payment: €265.53"
   → NOT as: "Monthly Payment: 265.53" (missing currency format!)

📖 CROSS-REFERENCE: See server instructions above for:
   • Complete percentage conversion rules
   • Boolean value handling
   • Proactive behavior patterns
   • Auto-error-recovery strategies

${parameterSchemaString}`,
    inputSchema: {
      type: 'object',
      properties: {
        inputs: {
          type: 'object',
          description: 'Input values for the calculation. Use parameter names as keys. ' +
            (apiDefinition.inputs ? `Required: ${apiDefinition.inputs.map(i => `"${i.name}"`).join(', ')}` : 'See service details'),
          additionalProperties: true,
          properties: inputProperties
        }
      },
      required: ['inputs']
    }
  };
  tools.push(calcTool);

  // Tool 2: Batch calculations
  const batchTool = {
    name: 'spreadapi_batch',
    description: `⚡ BATCH COMPARISON TOOL - ${apiDefinition.serviceName || serviceId}

═══════════════════════════════════════════════════════════════════
📌 WHAT THIS TOOL DOES
═══════════════════════════════════════════════════════════════════
Run multiple calculations sequentially to compare different scenarios.

Executes 2+ calculations with different input values and returns all results
for comparison. Perfect for "what-if" analysis and side-by-side comparisons.

═══════════════════════════════════════════════════════════════════
✅ WHEN TO USE THIS TOOL
═══════════════════════════════════════════════════════════════════
• User wants to compare 3+ scenarios
  Example: "compare these 5 loan options"

• What-if analysis with multiple variables
  Example: "what if I change interest to 5%, 6%, or 7%?"

• User provides a list of alternatives to evaluate
  Example: "try with $10k, $15k, and $20k deposits"

═══════════════════════════════════════════════════════════════════
❌ WHEN NOT TO USE THIS TOOL
═══════════════════════════════════════════════════════════════════
• Single calculation → Use spreadapi_calc instead
• Only 2 scenarios → Just call spreadapi_calc twice (clearer)
• Need intermediate results → Call spreadapi_calc multiple times

═══════════════════════════════════════════════════════════════════
💡 EXAMPLE USAGE
═══════════════════════════════════════════════════════════════════
User: "Compare compound interest with 5%, 6%, and 7% rates"

Your call:
{
  "scenarios": [
    {
      "label": "5% interest",
      "inputs": {
        "starting_amount": 10000,
        "interest_rate": 0.05,    ← Note: 5% = 0.05 (decimal!)
        "monthly_deposit": 100,
        "months_of_payment": 120
      }
    },
    {
      "label": "6% interest",
      "inputs": {
        "starting_amount": 10000,
        "interest_rate": 0.06,    ← Note: 6% = 0.06 (decimal!)
        "monthly_deposit": 100,
        "months_of_payment": 120
      }
    },
    {
      "label": "7% interest",
      "inputs": {
        "starting_amount": 10000,
        "interest_rate": 0.07,    ← Note: 7% = 0.07 (decimal!)
        "monthly_deposit": 100,
        "months_of_payment": 120
      }
    }
  ]
}

Result: Three calculations returned for easy comparison!

⚠️  REMEMBER: All percentage rules from spreadapi_calc apply here too!
    Convert percentages to decimals: 5% → 0.05, 6% → 0.06, etc.

📖 CROSS-REFERENCE: See spreadapi_calc description for:
    • Percentage conversion rules
    • Parameter naming guidelines
    • Result formatting instructions

${parameterSchemaString}`,
    inputSchema: {
      type: 'object',
      properties: {
        scenarios: {
          type: 'array',
          description: 'Array of scenarios to calculate. Each scenario needs a label and inputs using parameter NAMES as keys.',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: 'Descriptive label (e.g., "5% interest", "Option A")' },
              inputs: {
                type: 'object',
                description: 'Input values for this scenario. Use parameter names as keys. ' +
                  (apiDefinition.inputs ? `Required: ${apiDefinition.inputs.map(i => `"${i.name}"`).join(', ')}` : 'See service details'),
                additionalProperties: true,
                properties: inputProperties
              }
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

  // DIAGNOSTIC TOOL: Return what we built
  tools.push({
    name: 'spreadapi_diagnostic',
    description: 'DIAGNOSTIC: Returns the actual batch schema we built server-side (for debugging)',
    inputSchema: {
      type: 'object',
      properties: {
        check: { type: 'string', description: 'Just type "schema"' }
      }
    }
  });

  // Tool 3: Get service details
  const detailsTool = {
    name: 'spreadapi_get_details',
    description: `📋 DISCOVERY TOOL - ${apiDefinition.serviceName || serviceId}

═══════════════════════════════════════════════════════════════════
📌 WHAT THIS TOOL DOES
═══════════════════════════════════════════════════════════════════
${apiDefinition.description || 'Discover detailed information about this calculation service'}

Retrieve complete service metadata including parameter definitions, constraints,
special instructions, and usage guidance.

═══════════════════════════════════════════════════════════════════
✅ WHEN TO USE THIS TOOL
═══════════════════════════════════════════════════════════════════
• You need to know what parameters are required
  Example: User asks "what inputs do you need?"

• Calculation failed and you need to understand why
  Example: Error says "missing required parameter"

• User asks exploratory questions
  Example: "what can you calculate?" or "what are the options?"

• First time encountering this service
  Example: You've never seen this service's parameters before

• User references parameters you don't recognize
  Example: User says "adjust the XYZ value" but you don't know what XYZ is

═══════════════════════════════════════════════════════════════════
❌ WHEN NOT TO USE THIS TOOL
═══════════════════════════════════════════════════════════════════
• User already provided all values → Skip this, calculate directly!
  Example: User says "calculate with X=10, Y=5" → Just call spreadapi_calc

• You're just exploring → This is a calculation service, not documentation
  Example: Don't call this randomly "to see what's there"

⚠️  FOLLOW "FAST PATH" FROM INSTRUCTIONS: If user provides values, calculate immediately!

═══════════════════════════════════════════════════════════════════
📊 WHAT YOU'LL RECEIVE
═══════════════════════════════════════════════════════════════════
Complete service information:

• inputs: Array of parameter definitions
  - name: canonical parameter name (use this in API calls!)
  - title: friendly display name (show this to users!)
  - type: number, string, boolean, enum
  - min/max: value constraints
  - mandatory: whether required
  - defaultValue: default if not provided
  - format: special formatting (percentage, currency, etc.)

• outputs: Array of output field definitions
  - name: output field name
  - title: friendly display name
  - type: output data type
  - formatString: Excel-style format (ALWAYS use this!)

• aiDescription: Service-specific important notes
  ⚠️  ALWAYS READ THIS - contains critical service-specific rules!

• aiUsageGuidance: How to use this service correctly
  💡 Includes special behaviors, edge cases, and best practices

📖 CROSS-REFERENCE: After calling this tool, refer to:
    • Server instructions for universal rules (percentages, booleans, etc.)
    • aiDescription for service-specific rules
    • aiUsageGuidance for usage best practices`,
    inputSchema: {
      type: 'object',
      properties: {}
    }
  };
  tools.push(detailsTool);

  // Tool 4: State management - Save state (always available)
  tools.push({
    name: 'spreadapi_save_state',
    description: `💾 SAVE STATE - Store calculation for later comparison

═══════════════════════════════════════════════════════════════════
📌 WHAT THIS TOOL DOES
═══════════════════════════════════════════════════════════════════
Save calculation input values with a descriptive name for future retrieval.

Allows building up a collection of scenarios over time and comparing them later.
States persist across sessions (hours/days).

═══════════════════════════════════════════════════════════════════
✅ WHEN TO USE THIS TOOL
═══════════════════════════════════════════════════════════════════
• User explicitly requests saving
  Example: "save this", "remember this", "bookmark this calculation"

• User wants to compare with future calculations
  Example: "save this so we can compare later"

• Building up multiple alternatives incrementally
  Example: "let's try different rates and save each one"

• User references past calculations
  Example: "compare this with what we did earlier"

═══════════════════════════════════════════════════════════════════
💡 WORKFLOW EXAMPLE
═══════════════════════════════════════════════════════════════════
1. User: "Calculate loan payment at 5% interest"
2. You: Call spreadapi_calc, get result
3. You: Call spreadapi_save_state(stateName="5% option", inputs={...})
4. Later... User: "Now try 6% and compare"
5. You: Calculate 6%, load "5% option", show comparison

═══════════════════════════════════════════════════════════════════
📝 NAMING BEST PRACTICES
═══════════════════════════════════════════════════════════════════
Use descriptive, meaningful names:
✅ GOOD: "5% interest", "baseline", "optimistic scenario", "Option A"
❌ BAD: "state1", "test", "calc" (not descriptive!)

💡 TIP: States persist across sessions - name them clearly!`,
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
    description: `📂 LOAD STATE - Retrieve previously saved calculation

═══════════════════════════════════════════════════════════════════
📌 WHAT THIS TOOL DOES
═══════════════════════════════════════════════════════════════════
Retrieve input values from a previously saved calculation state.

Returns the exact inputs that were saved, allowing you to:
• Recall what parameters were used
• Re-run the calculation
• Compare with new calculations

═══════════════════════════════════════════════════════════════════
✅ WHEN TO USE THIS TOOL
═══════════════════════════════════════════════════════════════════
• User asks for comparison with earlier calculation
  Example: "compare with earlier" or "show me the previous one"

• User references a saved scenario by name
  Example: "load the baseline scenario"

• Need to recall inputs from prior calculation
  Example: "what were the inputs for the 5% option?"

• Building temporal comparisons
  Example: "how does this compare to last week's calculation?"

═══════════════════════════════════════════════════════════════════
💡 USAGE TIP
═══════════════════════════════════════════════════════════════════
If you don't know what states are saved:
1. Call spreadapi_list_saved_states first
2. See available state names
3. Load the one you need

State names must match exactly (case-sensitive)!`,
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
    description: `📋 LIST SAVED STATES - Show all available saved calculations

═══════════════════════════════════════════════════════════════════
📌 WHAT THIS TOOL DOES
═══════════════════════════════════════════════════════════════════
Retrieve a list of all saved calculation states for this service.

Returns state names and their saved input values, allowing you to:
• See what's been saved
• Choose which state to load
• Present options to user

═══════════════════════════════════════════════════════════════════
✅ WHEN TO USE THIS TOOL
═══════════════════════════════════════════════════════════════════
• User asks what's been saved
  Example: "what did we save?" or "show me my saved scenarios"

• Before loading a state (to see options)
  Example: User says "compare with earlier" without specifying which

• User wants to review saved alternatives
  Example: "show me all the options we've tried"

• Discovering available saved states
  Example: You don't know what states exist

═══════════════════════════════════════════════════════════════════
📊 WHAT YOU'LL RECEIVE
═══════════════════════════════════════════════════════════════════
Array of saved states:
[
  {
    "stateName": "5% interest",
    "inputs": { "interest_rate": 0.05, ... },
    "savedAt": "2025-10-27T10:30:00Z"
  },
  {
    "stateName": "baseline",
    "inputs": { "interest_rate": 0.04, ... },
    "savedAt": "2025-10-27T09:15:00Z"
  }
]

💡 Use state names to load specific calculations with spreadapi_load_state

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

  // Log what we're sending (for debugging in Vercel logs if needed)
  if (process.env.NODE_ENV === 'development') {
    const batchTool = tools.find(t => t.name === 'spreadapi_batch');
    if (batchTool?.inputSchema?.properties?.scenarios?.items?.properties?.inputs?.properties) {
      console.log('[MCP tools/list] Batch tool HAS nested input properties:',
        Object.keys(batchTool.inputSchema.properties.scenarios.items.properties.inputs.properties));
    } else {
      console.log('[MCP tools/list] WARNING: Batch tool missing nested input properties!');
    }
  }

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

        // IMPORTANT: Run sequentially to avoid workbook cache race conditions
        // The workbook cache returns the same instance, so parallel access causes corruption
        // Sequential execution is still fast because we avoid HTTP overhead and reuse the cached workbook
        const results = [];
        for (let index = 0; index < scenarios.length; index++) {
          const scenario = scenarios[index];
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
            results.push({
              label: scenario.label || `Scenario ${index + 1}`,
              inputs: scenario.inputs,
              outputs: calcResult.outputs || {},
              ...(calcResult.error && { error: calcResult.error })
            });
          } catch (error) {
            console.error(`[MCP Batch] Error in scenario ${index}:`, error);
            results.push({
              label: scenario.label || `Scenario ${index + 1}`,
              error: error.message || 'Calculation failed'
            });
          }
        }

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

      case 'spreadapi_diagnostic': {
        // DIAGNOSTIC: Return the actual schema we built
        const tools = await buildServiceTools(serviceId, apiDefinition);
        const batchTool = tools.find(t => t.name === 'spreadapi_batch');

        result = {
          diagnostic: true,
          timestamp: new Date().toISOString(),
          hasApiInputs: !!apiDefinition.inputs,
          inputCount: apiDefinition.inputs?.length || 0,
          inputNames: apiDefinition.inputs?.map(i => i.name) || [],
          batchSchemaDescription: batchTool?.inputSchema?.properties?.scenarios?.items?.properties?.inputs?.description,
          batchSchemaHasProperties: !!batchTool?.inputSchema?.properties?.scenarios?.items?.properties?.inputs?.properties,
          batchSchemaHasAdditionalProperties: batchTool?.inputSchema?.properties?.scenarios?.items?.properties?.inputs?.additionalProperties,
          batchSchemaProperties: batchTool?.inputSchema?.properties?.scenarios?.items?.properties?.inputs?.properties,
          fullBatchSchema: batchTool?.inputSchema
        };
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
 * GET handler - ChatGPT's MCP client makes GET requests during connection setup
 *
 * User Agent: openai-mcp/1.0.0
 * This appears to be part of ChatGPT's endpoint verification/health check flow.
 * We return helpful information about the MCP endpoint instead of 405 error.
 */
export async function GET(request, { params }) {
  const { serviceId } = await params;

  try {
    // Try to get service name for better response
    let serviceName = 'SpreadAPI Service';
    try {
      const apiDefinition = await getApiDefinition(serviceId);
      serviceName = apiDefinition.name || serviceName;
    } catch (e) {
      // If service lookup fails, continue with generic name
    }

    return NextResponse.json({
      protocol: 'Model Context Protocol (MCP)',
      version: MCP_VERSION,
      endpoint: `/api/mcp/service/${serviceId}`,
      service: serviceName,
      serviceId,
      methods: ['POST'],
      hint: 'This is an MCP endpoint. Use POST requests with JSON-RPC 2.0 format.',
      availableRPCMethods: [
        'initialize',
        'initialized',
        'tools/list',
        'tools/call'
      ],
      documentation: 'https://modelcontextprotocol.io/',
      note: 'ChatGPT MCP client (openai-mcp/1.0.0) makes GET requests during connection setup. This is expected behavior.'
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-MCP-Version': MCP_VERSION,
        'X-Server-Name': SERVER_NAME,
        'X-Server-Version': SERVER_VERSION
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to process GET request',
      message: error.message,
      hint: 'Use POST requests for MCP protocol communication'
    }, { status: 500 });
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
