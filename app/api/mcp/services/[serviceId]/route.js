/**
 * Single-Service MCP Endpoint
 *
 * This endpoint exposes a single SpreadAPI service as a dedicated MCP server.
 * Each service gets its own MCP endpoint with a clear, focused purpose.
 *
 * URL Pattern: /api/mcp/services/{serviceId}
 * Authentication: Service tokens (existing system)
 * Protocol: MCP 2024-11-05 (JSON-RPC 2.0 over HTTP)
 *
 * Supported Transports:
 * - Claude Desktop: HTTP with Authorization header
 * - ChatGPT: HTTP with Authorization header or OAuth
 *
 * Key Benefits:
 * - No discovery needed (AI knows exactly what this service does)
 * - Single token type (service tokens, no MCP tokens)
 * - Clear purpose (service name/description = MCP server identity)
 * - Faster execution (1 call instead of 3-4)
 */

import { NextResponse } from 'next/server';
import redis from '../../../../../lib/redis';
import { validateServiceToken } from '../../../../../utils/tokenAuth';
import { calculateDirect } from '../../../v1/services/[id]/execute/calculateDirect';
import {
  generateMcpInitialize,
  generateMcpTools,
  formatCalculationResults,
  buildToolCallResult
} from '../../../../../lib/mcp-service-wrapper';

// MCP Protocol constants
const MCP_VERSION = '2024-11-05';

// JSON-RPC error codes
const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;

/**
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

/**
 * Main MCP handler
 */
export async function POST(request, { params }) {
  const timeStart = Date.now();

  try {
    // Extract serviceId from URL params
    const { serviceId } = params;

    if (!serviceId) {
      return jsonRpcError(null, INVALID_REQUEST, 'Service ID is required');
    }

    // Load service metadata first
    const service = await loadService(serviceId);

    if (!service) {
      return jsonRpcError(null, INVALID_REQUEST, `Service ${serviceId} not found or not published`);
    }

    // For private services, validate token (service token or OAuth token)
    if (!service.public) {
      // Check if this is an OAuth token (from ChatGPT)
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

      if (token && token.startsWith('oat_')) {
        // OAuth token - validate it maps to this service
        const oauthValidation = await validateOAuthTokenForService(token, serviceId);

        if (!oauthValidation.valid) {
          return jsonRpcError(
            null,
            INVALID_REQUEST,
            oauthValidation.error || 'Invalid OAuth token',
            {
              hint: 'OAuth token is invalid, expired, or not authorized for this service.',
              serviceId,
              serviceName: service.name
            }
          );
        }
      } else {
        // Regular service token
        const tokenValidation = await validateServiceToken(request, serviceId);

        if (!tokenValidation.valid) {
          return jsonRpcError(
            null,
            INVALID_REQUEST,
            tokenValidation.error || 'Invalid service token',
            {
              hint: 'Private services require a valid service token. Get a token from the service API section.',
              serviceId,
              serviceName: service.name
            }
          );
        }
      }
    }

    // Parse JSON-RPC request
    let jsonRpcRequest;
    try {
      jsonRpcRequest = await request.json();
    } catch (parseError) {
      return jsonRpcError(null, PARSE_ERROR, 'Invalid JSON');
    }

    const { method, params: methodParams, id: requestId } = jsonRpcRequest;

    // Handle MCP protocol methods
    switch (method) {
      case 'initialize':
        return handleInitialize(service, requestId, timeStart);

      case 'tools/list':
        return handleToolsList(service, requestId, timeStart);

      case 'tools/call':
        return handleToolsCall(service, methodParams, requestId, timeStart, serviceId);

      default:
        return jsonRpcError(requestId, METHOD_NOT_FOUND, `Method '${method}' not found`);
    }

  } catch (error) {
    console.error('[Single-Service MCP] Error:', error);
    return jsonRpcError(null, INTERNAL_ERROR, 'Internal server error', {
      message: error.message
    });
  }
}

/**
 * Validate OAuth token for single-service MCP
 * Returns the underlying service token if valid
 */
async function validateOAuthTokenForService(oauthToken, serviceId) {
  try {
    // Get OAuth token metadata
    const tokenData = await redis.hGetAll(`oauth:token:${oauthToken}`);

    if (!tokenData || !tokenData.service_id) {
      return { valid: false, error: 'Invalid or expired OAuth token' };
    }

    // Check service match
    if (tokenData.service_id !== serviceId) {
      return {
        valid: false,
        error: `OAuth token is authorized for service ${tokenData.service_id}, not ${serviceId}`
      };
    }

    // If there's an underlying service token, validate it
    if (tokenData.service_token) {
      const mockRequest = {
        headers: {
          get: (name) => name === 'authorization' ? `Bearer ${tokenData.service_token}` : null
        }
      };

      const validation = await validateServiceToken(mockRequest, serviceId);

      if (!validation.valid) {
        return { valid: false, error: 'Underlying service token is invalid or revoked' };
      }
    }

    return {
      valid: true,
      serviceId: tokenData.service_id,
      isPublic: !tokenData.service_token
    };
  } catch (error) {
    console.error('[OAuth] Token validation error:', error);
    return { valid: false, error: 'Failed to validate OAuth token' };
  }
}

/**
 * Load service metadata from Redis
 */
async function loadService(serviceId) {
  try {
    // Check if service exists and is published
    const exists = await redis.exists(`service:${serviceId}:published`);

    if (!exists) {
      return null;
    }

    // Load service data
    const serviceData = await redis.hGetAll(`service:${serviceId}:published`);

    if (!serviceData || Object.keys(serviceData).length === 0) {
      return null;
    }

    // Parse JSON fields
    const service = {
      id: serviceId,
      name: serviceData.name || serviceId,
      description: serviceData.description || 'SpreadAPI calculation service',
      public: serviceData.public === 'true',
      inputs: serviceData.inputs ? JSON.parse(serviceData.inputs) : [],
      outputs: serviceData.outputs ? JSON.parse(serviceData.outputs) : [],
      areas: serviceData.areas ? JSON.parse(serviceData.areas) : [],
      aiDescription: serviceData.aiDescription || null,
      aiUsageGuidance: serviceData.aiUsageGuidance || null,
      aiUsageExamples: serviceData.aiUsageExamples ? JSON.parse(serviceData.aiUsageExamples) : []
    };

    return service;

  } catch (error) {
    console.error('[Single-Service MCP] Error loading service:', error);
    return null;
  }
}

/**
 * Handle MCP initialize request
 */
function handleInitialize(service, requestId, timeStart) {
  const response = generateMcpInitialize(service);

  return jsonRpcSuccess(requestId, response, timeStart);
}

/**
 * Handle MCP tools/list request
 */
function handleToolsList(service, requestId, timeStart) {
  const tools = generateMcpTools(service);

  return jsonRpcSuccess(requestId, { tools }, timeStart);
}

/**
 * Handle MCP tools/call request
 */
async function handleToolsCall(service, methodParams, requestId, timeStart, serviceId) {
  try {
    const { name: toolName, arguments: toolArgs } = methodParams;

    if (!toolName) {
      return jsonRpcError(requestId, INVALID_PARAMS, 'Tool name is required');
    }

    switch (toolName) {
      case 'calculate':
        return await executeCalculation(service, toolArgs, requestId, timeStart, serviceId);

      case 'read_area':
        return await executeAreaRead(service, toolArgs, requestId, timeStart);

      default:
        return jsonRpcError(requestId, INVALID_PARAMS, `Unknown tool: ${toolName}`);
    }

  } catch (error) {
    console.error('[Single-Service MCP] Tool call error:', error);
    return jsonRpcError(requestId, INTERNAL_ERROR, 'Tool execution failed', {
      message: error.message
    });
  }
}

/**
 * Execute calculation tool
 */
async function executeCalculation(service, inputs, requestId, timeStart, serviceId) {
  try {
    // Call calculateDirect (existing calculation engine)
    const result = await calculateDirect(serviceId, inputs, null, {});

    if (result.error) {
      return jsonRpcSuccess(requestId, buildToolCallResult({
        message: result.error
      }, true), timeStart);
    }

    // Format outputs with formatString
    const formattedOutputs = formatCalculationResults(result.outputs, service.outputs);

    // Build MCP tool call result
    const toolResult = buildToolCallResult({
      outputs: formattedOutputs,
      serviceName: service.name,
      executionTime: result.metadata?.executionTime
    });

    return jsonRpcSuccess(requestId, toolResult, timeStart);

  } catch (error) {
    console.error('[Single-Service MCP] Calculation error:', error);
    return jsonRpcSuccess(requestId, buildToolCallResult({
      message: `Calculation failed: ${error.message}`
    }, true), timeStart);
  }
}

/**
 * Execute area read tool (if service has areas)
 */
async function executeAreaRead(service, params, requestId, timeStart) {
  const { area: areaName } = params;

  if (!areaName) {
    return jsonRpcError(requestId, INVALID_PARAMS, 'Area name is required');
  }

  const area = service.areas?.find(a => a.name === areaName);

  if (!area) {
    return jsonRpcError(requestId, INVALID_PARAMS, `Area '${areaName}' not found in service`);
  }

  // TODO: Implement area reading (similar to bridge/areaExecutors.js)
  // For now, return not implemented
  return jsonRpcError(requestId, INTERNAL_ERROR, 'Area reading not yet implemented in single-service MCP');
}

/**
 * Build JSON-RPC success response
 */
function jsonRpcSuccess(id, result, timeStart) {
  const response = {
    jsonrpc: '2.0',
    id,
    result,
    _meta: {
      executionTime: `${Date.now() - timeStart}ms`,
      protocol: MCP_VERSION
    }
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * Build JSON-RPC error response
 */
function jsonRpcError(id, code, message, data = null) {
  const response = {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data ? { data } : {})
    }
  };

  return NextResponse.json(response, {
    status: 200, // JSON-RPC always returns 200, error is in the body
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
