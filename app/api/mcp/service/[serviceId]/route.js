import { NextResponse } from 'next/server';
import redis from '../../../../../lib/redis';
import { getApiDefinition } from '../../../../../utils/helperApi';
import { calculateDirect } from '../../../../../app/api/v1/services/[id]/execute/calculateDirect.js';
import { executeEnhancedCalc } from '../../../../../lib/mcp/executeEnhancedCalc.js';
import { executeAreaRead } from '../../../../../lib/mcp/areaExecutors.js';
import { formatValueWithExcelFormat } from '../../../../../utils/formatting.js';
import { normalizeInputKeys } from '../../../../../lib/inputNormalizer.js';
import { getPublishExpiry, EXPIRED_PUBLISH_BODY } from '../../../../../lib/publishExpiry.js';
import { validateServiceTokenString } from '../../../../../utils/tokenAuth.js';
import {
  loadServiceDefinition,
  buildParameterDetails,
  buildOutputDetails,
  buildExampleInputs,
  buildInstructions,
} from '../../../../../lib/serviceBriefing.js';
import { formatCalcError } from '../../../../../lib/calcError.js';

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
    const expiry = await getPublishExpiry(serviceId);
    if (expiry?.isExpired) {
      return {
        valid: false,
        error: EXPIRED_PUBLISH_BODY.message,
        code: 'PUBLISH_EXPIRED',
        status: 402
      };
    }
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
    // Assume it's a service token (direct API token) — validated against the
    // shared hashed-token store (same as REST v1 and /d/).
    validation = await validateServiceTokenString(token, serviceId);
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

  // Load the service briefing — the SINGLE source of truth shared with the /d
  // discovery endpoint (lib/serviceBriefing). The MCP `apiDefinition` does not
  // expose inputs/outputs at the top level, so we load the published definition
  // directly here. This is what makes ChatGPT actually see the parameters.
  const briefing = (await loadServiceDefinition(serviceId)) || {
    serviceId, name: serviceId, description: '', aiDescription: '',
    aiUsageGuidance: '', inputs: [], outputs: [], needsToken: false,
  };
  const serviceName = briefing.name || serviceId;
  const parameterDetails = buildParameterDetails(briefing.inputs);
  const exampleInputs = buildExampleInputs(briefing.inputs);
  const requiredNames = parameterDetails.filter(p => p.required).map(p => p.name);

  // Full JSON-Schema per parameter so ChatGPT knows TYPE, ALLOWED VALUES and
  // RANGES — not just the names.
  const inputProperties = parameterDetails.reduce((acc, p) => {
    const prop = {
      type: p.type === 'number' ? 'number' : p.type === 'boolean' ? 'boolean' : 'string',
      description: p.description || p.title || p.name,
    };
    if (p.allowedValues?.length > 0) prop.enum = p.allowedValues;
    if (p.min !== undefined) prop.minimum = p.min;
    if (p.max !== undefined) prop.maximum = p.max;
    if (p.default !== undefined) prop.default = p.default;
    acc[p.name] = prop;
    return acc;
  }, {});

  // Tool impact hints — OpenAI Apps SDK requires these on every tool.
  // All v1 tools only read/compute on a single bounded service.
  const READ_ONLY = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };

  // Declared result shape (matches the structuredContent we return) so the model
  // can reason over outputs and reuse them in follow-up calls.
  const CALC_OUTPUT_SCHEMA = {
    type: 'object',
    properties: {
      outputs: {
        type: 'array',
        description: 'Computed outputs, in order. Each item has name, title, value and (when present) formatString.',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            title: { type: 'string' },
            value: { description: 'Computed value — a number, string, boolean, or a 2D array for cell-range outputs.' },
            formatString: { type: 'string', description: 'Excel-style display format (e.g. "€#,##0.00"), when present.' }
          },
          required: ['name', 'value']
        }
      },
      inputs: { type: 'array', description: 'Echo of the resolved inputs used for the calculation.' }
    },
    required: ['outputs']
  };
  const BATCH_OUTPUT_SCHEMA = {
    type: 'object',
    properties: {
      scenarios: {
        type: 'array',
        description: 'One entry per scenario, in request order.',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            outputs: CALC_OUTPUT_SCHEMA.properties.outputs,
            error: { type: 'string', description: 'Present only if this scenario failed.' }
          },
          required: ['label']
        }
      }
    },
    required: ['scenarios']
  };

  // Tool-specific examples built from the service's OWN parameters (never
  // hard-coded foreign params) so they can't contradict the schema.
  const exampleJson = JSON.stringify(exampleInputs);
  const calcExample = Object.keys(exampleInputs).length > 0
    ? `EXAMPLE:\nspreadapi_calc({ "inputs": ${exampleJson} })`
    : '';
  const batchExample = Object.keys(exampleInputs).length > 0
    ? `EXAMPLE:\nspreadapi_batch({ "scenarios": [ { "label": "Option A", "inputs": ${exampleJson} }, { "label": "Option B", "inputs": ${exampleJson} } ] })`
    : '';

  // Tool 1: Calculate (primary tool)
  const calcTool = {
    name: 'spreadapi_calc',
    description: `Use this when the user wants a single calculated result from "${serviceName}"${briefing.description ? ` — ${briefing.description}` : ''}. Provide the input values (the schema lists types, allowed values and ranges) and receive the computed outputs.

${calcExample}`,
    inputSchema: {
      type: 'object',
      properties: {
        inputs: {
          type: 'object',
          description: 'Input values for the calculation. Use parameter names as keys. ' +
            (requiredNames.length > 0 ? `Required: ${requiredNames.map(n => `"${n}"`).join(', ')}.` : 'Use the parameter names as keys.'),
          additionalProperties: true,
          properties: inputProperties,
          ...(requiredNames.length > 0 ? { required: requiredNames } : {})
        }
      },
      required: ['inputs']
    },
    outputSchema: CALC_OUTPUT_SCHEMA,
    annotations: READ_ONLY
  };
  tools.push(calcTool);

  // Tool 2: Batch calculations
  const batchTool = {
    name: 'spreadapi_batch',
    description: `Use this when the user wants to compare 2–20 scenarios of "${serviceName}" in one call (what-if analysis). Each scenario is an object with a "label" and an "inputs" object using the same parameters as spreadapi_calc. Returns all results for side-by-side comparison. For a single calculation, use spreadapi_calc.

${batchExample}`,
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
                  (requiredNames.length > 0 ? `Required: ${requiredNames.map(n => `"${n}"`).join(', ')}.` : 'Use the parameter names as keys.'),
                additionalProperties: true,
                properties: inputProperties,
                ...(requiredNames.length > 0 ? { required: requiredNames } : {})
              }
            },
            required: ['inputs']
          },
          minItems: 2
        }
      },
      required: ['scenarios']
    },
    outputSchema: BATCH_OUTPUT_SCHEMA,
    annotations: READ_ONLY
  };

  tools.push(batchTool);

  // DIAGNOSTIC TOOL — dev only, never exposed to end users in production
  if (process.env.NODE_ENV === 'development') {
    tools.push({
      name: 'spreadapi_diagnostic',
      description: 'DIAGNOSTIC: Returns the actual batch schema we built server-side (for debugging)',
      inputSchema: {
        type: 'object',
        properties: {
          check: { type: 'string', description: 'Just type "schema"' }
        }
      },
      annotations: READ_ONLY
    });
  }

  // Tool 3: Get service details
  const GET_DETAILS_OUTPUT_SCHEMA = {
    type: 'object',
    description: 'Full service definition: parameters, outputs, examples and usage rules.',
    properties: {
      serviceName: { type: 'string' },
      description: { type: 'string' },
      aiUsageGuidance: { type: 'string' },
      inputs: {
        type: 'array',
        description: 'Input parameter definitions.',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            title: { type: 'string' },
            type: { type: 'string' },
            required: { type: 'boolean' },
            description: { type: 'string' },
            allowedValues: { type: 'array' }
          }
        }
      },
      outputs: {
        type: 'array',
        description: 'Output field definitions.',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            title: { type: 'string' },
            type: { type: 'string' },
            formatString: { type: 'string' }
          }
        }
      },
      exampleInputs: { type: 'object', description: 'A ready-to-use example inputs object.' },
      instructions: { type: 'array', items: { type: 'string' } }
    }
  };
  const detailsTool = {
    name: 'spreadapi_get_details',
    description: `Use this when you don't yet know the parameters of "${serviceName}", a calculation failed, or the user asks what inputs/options exist. Returns the full parameter and output definitions (names, types, allowed values, ranges, defaults, formats) plus any service-specific rules. Skip it if the user already gave you all values — just call spreadapi_calc.`,
    inputSchema: {
      type: 'object',
      properties: {}
    },
    outputSchema: GET_DETAILS_OUTPUT_SCHEMA,
    annotations: READ_ONLY
  };
  tools.push(detailsTool);

  // Read area (only if service has editable areas)
  if (apiDefinition.editableAreas && apiDefinition.editableAreas.length > 0) {
    tools.push({
      name: 'spreadapi_read_area',
      description: `Use this when you need to see reference data tables in the spreadsheet (price lists, catalogs, lookup/config data) before calculating, or the user asks "what's in the spreadsheet?". Available areas: ${apiDefinition.editableAreas.map(a => `${a.name} (${a.description || 'data table'})`).join(', ')}.`,
      inputSchema: {
        type: 'object',
        properties: {
          areaName: {
            type: 'string',
            description: `Area name. Available: ${apiDefinition.editableAreas.map(a => a.name).join(', ')}`
          }
        },
        required: ['areaName']
      },
      annotations: READ_ONLY
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

  // Build a concise, self-contained server briefing from the shared source of
  // truth. Per OpenAI Apps SDK guidance: keep it short (first ~512 chars
  // self-contained), cross-tool guidance — don't repeat every tool description.
  const briefing = (await loadServiceDefinition(serviceId)) || {
    name: serviceId, description: '', aiDescription: '', aiUsageGuidance: '',
    inputs: [], outputs: [], needsToken: false, serviceId,
  };
  const initServiceName = briefing.name || serviceId;
  const initParams = buildParameterDetails(briefing.inputs);
  const initOutputs = buildOutputDetails(briefing.outputs);
  const initRules = buildInstructions(briefing, initParams, { transport: 'mcp' });
  const initOutputsLine = initOutputs.length > 0
    ? '\n\nOUTPUTS: ' + initOutputs.map(o => `${o.name} (${o.title})${o.formatString ? ` [${o.formatString}]` : ''}`).join(', ')
    : '';
  // Header shows the plain description only. aiDescription is carried in the RULES
  // (SERVICE-SPECIFIC NOTE, deduped in buildInstructions) so it never appears twice.
  const initHeader = briefing.description
    ? `${initServiceName} — ${briefing.description}`
    : initServiceName;

  const response = {
    protocolVersion: agreedVersion,  // Echo client's version
    capabilities: {
      tools: {
        listChanged: false  // Service-specific endpoint has fixed tools
      }
    },
    serverInfo: {
      name: initServiceName,
      version: SERVER_VERSION,
      ...(briefing.description ? { description: briefing.description } : {}),
      instructions: `${initHeader}
Tools: spreadapi_calc (one calculation) · spreadapi_batch (compare 2–20 scenarios) · spreadapi_get_details (parameters & rules).

RULES:
${initRules.map(r => `• ${r}`).join('\n')}${initOutputsLine}`
    }
  };

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
async function handleToolCall(serviceId, apiDefinition, params, rpcId, userId, presentedToken) {
  const { name: toolName, arguments: toolArgs } = params;

  try {
    let result;
    let isError = false;          // set true on a failed calculation (MCP isError)
    let structuredContent;        // tight, validated result object (matches outputSchema)

    switch (toolName) {
      case 'spreadapi_calc': {
        // Normalize input keys to lowercase for consistent lookups
        const normalizedInputs = normalizeInputKeys(toolArgs.inputs);

        // Single calculation - use optimized path when no area updates
        if (!toolArgs.areaUpdates || toolArgs.areaUpdates.length === 0) {
          // No area updates - use the standard, battle-tested calculateDirect
          const calcResult = await calculateDirect(
            serviceId,
            normalizedInputs,
            presentedToken, // satisfies getApiDefinition's needsToken gate
            { isWebAppAuthenticated: true } // MCP auth layer already validated
          );

          // Format for MCP protocol
          if (calcResult.error) {
            // Expand validation details into an AI-actionable message (parameter
            // KEY + what's wrong + allowed values) and flag the call as failed.
            isError = true;
            result = { error: formatCalcError(calcResult) };
          } else {
            result = calcResult;
            structuredContent = { outputs: calcResult.outputs, inputs: calcResult.inputs };
          }
        } else {
          // Area updates present - use enhanced calc
          result = await executeEnhancedCalc(
            serviceId,
            normalizedInputs,
            toolArgs.areaUpdates,
            {},
            presentedToken // satisfies getApiDefinition's needsToken gate (auth done upstream)
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
            // Normalize input keys to lowercase for consistent lookups
            const normalizedScenarioInputs = normalizeInputKeys(scenario.inputs);

            // Batch calculations typically don't have area updates
            // Use calculateDirect for better performance and reliability
            const calcResult = await calculateDirect(
              serviceId,
              normalizedScenarioInputs,
              presentedToken, // satisfies getApiDefinition's needsToken gate
              { isWebAppAuthenticated: true } // MCP auth layer already validated
            );

            // Return compact response (outputs only, not full metadata).
            // Per-scenario errors use the same AI-actionable formatter as single
            // calls, so the model can self-correct a failing scenario in a batch.
            results.push({
              label: scenario.label || `Scenario ${index + 1}`,
              inputs: scenario.inputs,
              outputs: calcResult.outputs || {},
              ...(calcResult.error && { error: formatCalcError(calcResult) })
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
        structuredContent = { scenarios: results };
        break;
      }

      case 'spreadapi_get_details': {
        // Return service details from the shared briefing (same source as /d and
        // tools/list) so inputs/outputs/constraints are actually populated.
        const detailsBriefing = await loadServiceDefinition(serviceId);
        const detailsParams = buildParameterDetails(detailsBriefing?.inputs || []);
        result = {
          serviceId,
          serviceName: detailsBriefing?.name || serviceId,
          description: detailsBriefing?.description || '',
          aiDescription: detailsBriefing?.aiDescription || '',
          aiUsageGuidance: detailsBriefing?.aiUsageGuidance || '',
          aiUsageExamples: detailsBriefing?.aiUsageExamples || [],
          inputs: detailsParams,
          outputs: buildOutputDetails(detailsBriefing?.outputs || []),
          exampleInputs: buildExampleInputs(detailsBriefing?.inputs || []),
          instructions: buildInstructions(detailsBriefing || { needsToken: false, outputs: [] }, detailsParams, { transport: 'mcp' }),
          editableAreas: apiDefinition.editableAreas
        };
        structuredContent = result;
        break;
      }

      case 'spreadapi_read_area': {
        // Read editable area
        const areaName = toolArgs.areaName;
        result = await executeAreaRead(serviceId, areaName, apiDefinition, presentedToken);
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
        ],
        // Structured, schema-validated result the model can reason over directly.
        ...(structuredContent ? { structuredContent } : {}),
        // Signal failed calculations so the AI knows to read the error and retry.
        ...(isError ? { isError: true } : {})
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

    // The MCP auth layer (authenticateRequest, above) already validated the
    // caller. Pass the presented token to getApiDefinition so its needsToken gate
    // is satisfied for PROTECTED services — otherwise metadata load fails with
    // "Service not available" for every tools/list & tools/call even though the
    // caller IS authenticated (this broke ChatGPT with a 424 on refresh_actions).
    const _authHeader = request.headers.get('authorization');
    const presentedToken = _authHeader?.startsWith('Bearer ')
      ? _authHeader.slice(7)
      : (new URL(request.url).searchParams.get('token') || null);

    // Load service metadata
    const apiDefinition = await getApiDefinition(serviceId, presentedToken);

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
        response = await handleToolCall(serviceId, apiDefinition, rpcParams, rpcId, auth.userId, presentedToken);
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
