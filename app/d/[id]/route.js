import { NextResponse, after } from 'next/server';
import { calculateDirect, logCalls } from '../../api/v1/services/[id]/execute/calculateDirect.js';
import { validateServiceToken } from '@/utils/tokenAuth';
import { normalizeInputKeys } from '@/lib/inputNormalizer';
import { getPublishExpiry, EXPIRED_PUBLISH_BODY } from '@/lib/publishExpiry';
import { formatCalcError } from '@/lib/calcError';
import {
  loadServiceDefinition,
  buildParameterDetails,
  buildOutputDetails,
  buildExampleInputs,
  buildInstructions,
} from '@/lib/serviceBriefing';

export const maxDuration = 30;

// CORS headers for AI agent access
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ── OPTIONS: CORS preflight ──
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ── Helper: Extract token from request ──
function extractToken(request, searchParams) {
  // 1. Query parameter
  const queryToken = searchParams?.get('token');
  if (queryToken) return queryToken;

  // 2. Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

// ── Helper: Validate token for the service ──
async function authenticateRequest(token, serviceId, needsToken) {
  if (!needsToken) return { valid: true, isPublic: true };
  if (!token) return { valid: false, error: 'This service requires authentication. Add ?token=YOUR_TOKEN to the URL.' };

  try {
    const mockRequest = {
      headers: { get: (name) => name === 'authorization' ? `Bearer ${token}` : null },
      url: `http://localhost?token=${token}`
    };
    const validation = await validateServiceToken(mockRequest, serviceId);
    return validation;
  } catch (error) {
    return { valid: false, error: 'Token validation failed' };
  }
}

// ── Build discovery response ──
function buildDiscoveryResponse(serviceDef, endpoint, token) {
  const { serviceId, name, description, aiDescription, aiUsageGuidance, aiUsageExamples, aiTags, category, needsToken, inputs, outputs } = serviceDef;

  // Build parameter details, output details, example inputs and instructions.
  // Shared with the MCP tools/list builder via lib/serviceBriefing — one source
  // of truth so the REST discovery and the MCP surface never drift.
  const parameterDetails = buildParameterDetails(inputs);
  const outputDetails = buildOutputDetails(outputs);
  const exampleInputs = buildExampleInputs(inputs);
  const instructions = buildInstructions(serviceDef, parameterDetails);

  // Build actions with examples
  const actions = {};

  // Calculate action
  const calcPostExample = { action: 'calculate', inputs: exampleInputs };
  if (needsToken) calcPostExample.token = token || 'YOUR_TOKEN';

  const getParams = Object.entries(exampleInputs).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  const tokenParam = needsToken ? `&token=${token || 'YOUR_TOKEN'}` : '';

  actions.calculate = {
    description: 'Execute a single calculation with input values. Returns computed outputs.',
    POST: calcPostExample,
    GET: `?action=calculate&${getParams}${tokenParam}`,
  };

  // Batch action
  actions.batch = {
    description: 'Run multiple calculations for scenario comparison (2-20 scenarios). Returns all results for side-by-side comparison.',
    POST: {
      action: 'batch',
      scenarios: [
        { label: 'Scenario A', inputs: exampleInputs },
        { label: 'Scenario B', inputs: { ...exampleInputs, [inputs[0]?.name || 'param']: 'other_value' } },
      ],
      ...(needsToken ? { token: token || 'YOUR_TOKEN' } : {}),
    },
  };

  // Build quickStart URLs
  const quickStart = [
    `${endpoint}?action=calculate&${getParams}${tokenParam}`,
  ];

  // Same service, exposed as a native MCP server (derive origin from endpoint,
  // which is `${origin}/d/${serviceId}`).
  const mcpUrl = `${endpoint.replace(`/d/${serviceId}`, '')}/api/mcp/service/${serviceId}`;

  // Build the response
  const response = {
    api: 'SpreadAPI',
    version: '1.0',
    endpoint,
    service: {
      name,
      description: aiDescription || description,
      ...(aiUsageGuidance ? { guidance: aiUsageGuidance } : {}),
      ...(category && category !== 'general' ? { category } : {}),
      ...(aiTags?.length > 0 ? { tags: aiTags } : {}),
    },
    instructions,
    quickStart,
    parameters: {
      note: 'Parameter names are case-insensitive. Use the "name" field (not "title") as the key in your requests.',
      inputs: parameterDetails,
      outputs: outputDetails,
    },
    actions,
    mcp: {
      url: mcpUrl,
      transport: 'streamable-http',
      capabilities: ['tools'],
      auth: needsToken
        ? { type: 'oauth2', description: 'Authorize via the connector OAuth flow, or pass ?token=YOUR_TOKEN for direct REST calls.' }
        : { type: 'none' },
      note: 'The same service is also available as a native MCP server at this URL, for clients that support MCP.',
    },
    responseFormat: {
      success: {
        service: { id: '...', name: '...', description: '...' },
        inputs: [{ name: '...', title: '...', value: '...' }],
        outputs: [{ name: '...', title: '...', value: '...', formatString: '...' }],
        metadata: { executionTime: 123, cached: false },
      },
      error: { success: false, error: 'Description of what went wrong' },
    },
  };

  // Add usage examples if available
  if (aiUsageExamples?.length > 0) {
    response.usageExamples = aiUsageExamples;
  }

  return response;
}

// ── Handle action execution ──
async function handleAction(serviceDef, body, token) {
  const { serviceId, needsToken } = serviceDef;
  const action = body?.action;

  // Authenticate
  const auth = await authenticateRequest(token || body?.token, serviceId, needsToken);
  if (!auth.valid) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401, headers: CORS_HEADERS });
  }

  switch (action) {
    case 'calculate':
      return handleCalculate(serviceDef, body, token);
    case 'batch':
      return handleBatch(serviceDef, body, token);
    default:
      return NextResponse.json(
        { success: false, error: `Unknown action: "${action}". Available actions: calculate, batch` },
        { status: 400, headers: CORS_HEADERS }
      );
  }
}

// ── Calculate action ──
async function handleCalculate(serviceDef, body, token) {
  const { serviceId } = serviceDef;
  const inputs = body.inputs || {};

  try {
    const normalizedInputs = normalizeInputKeys(inputs);
    const effectiveToken = token || body.token || null;
    const result = await calculateDirect(serviceId, normalizedInputs, effectiveToken, {});

    // Log call after response (Vercel keeps function alive with after())
    after(() => logCalls(serviceId, effectiveToken));

    if (result.error) {
      // Shared formatter: AI-actionable message (param key + what's wrong + allowed values)
      return NextResponse.json({ success: false, error: formatCalcError(result) }, { status: 400, headers: CORS_HEADERS });
    }

    return NextResponse.json({
      success: true,
      service: result.service,
      inputs: result.inputs,
      outputs: result.outputs,
      metadata: {
        executionTime: result.metadata?.executionTime,
        cached: result.metadata?.cached || false,
      },
    }, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Calculation failed' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// ── Batch action ──
async function handleBatch(serviceDef, body, token) {
  const { serviceId } = serviceDef;
  const scenarios = body.scenarios || [];

  if (!Array.isArray(scenarios) || scenarios.length < 2) {
    return NextResponse.json(
      { success: false, error: 'Batch requires at least 2 scenarios. Each scenario needs: { label: "...", inputs: {...} }' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (scenarios.length > 20) {
    return NextResponse.json(
      { success: false, error: 'Maximum 20 scenarios per batch request.' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const results = [];
  const effectiveToken = token || body.token || null;

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    try {
      const normalizedInputs = normalizeInputKeys(scenario.inputs || {});
      const result = await calculateDirect(serviceId, normalizedInputs, effectiveToken, {});

      if (result.error) {
        results.push({
          label: scenario.label || `Scenario ${i + 1}`,
          success: false,
          error: result.error,
          inputs: scenario.inputs,
        });
      } else {
        results.push({
          label: scenario.label || `Scenario ${i + 1}`,
          success: true,
          inputs: result.inputs,
          outputs: result.outputs,
        });
      }
    } catch (error) {
      results.push({
        label: scenario.label || `Scenario ${i + 1}`,
        success: false,
        error: error.message,
        inputs: scenario.inputs,
      });
    }
  }

  // Log each scenario as a separate call for billing accuracy
  after(() => {
    const logPromises = results.map(() => logCalls(serviceId, effectiveToken));
    return Promise.all(logPromises);
  });

  return NextResponse.json({
    success: true,
    scenarios: results,
    metadata: { scenarioCount: results.length },
  }, { headers: CORS_HEADERS });
}

// ── GET: Discovery or action-via-GET ──
export async function GET(request, { params }) {
  try {
    const { id: serviceId } = await params;
    const { searchParams } = new URL(request.url);

    // Load service
    const serviceDef = await loadServiceDefinition(serviceId);
    if (!serviceDef) {
      const expiry = await getPublishExpiry(serviceId);
      if (expiry?.isExpired) {
        return NextResponse.json(
          EXPIRED_PUBLISH_BODY,
          { status: 402, headers: CORS_HEADERS }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Service not found or not published' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const token = extractToken(request, searchParams);

    // If ?action= is present, treat as an action call
    const action = searchParams.get('action');
    if (action) {
      // Convert GET params to a POST-like body
      const body = { action };
      for (const [key, value] of searchParams.entries()) {
        if (key === 'action' || key === 'token') continue;
        // Parse value types
        if (value === 'true') body[key] = true;
        else if (value === 'false') body[key] = false;
        else {
          const num = Number(value);
          if (!isNaN(num) && value !== '') body[key] = num;
          else body[key] = value;
        }
      }

      // For calculate via GET, wrap non-special params in inputs
      if (action === 'calculate') {
        const inputs = {};
        for (const [key, value] of Object.entries(body)) {
          if (key !== 'action') inputs[key] = value;
        }
        body.inputs = inputs;
      }

      return handleAction(serviceDef, body, token);
    }

    // Authenticate for discovery too (if token required)
    const auth = await authenticateRequest(token, serviceId, serviceDef.needsToken);
    if (!auth.valid) {
      // Return minimal info + auth error
      return NextResponse.json({
        api: 'SpreadAPI',
        service: { name: serviceDef.name },
        error: auth.error,
        instructions: ['This service requires authentication. Add ?token=YOUR_TOKEN to the URL.'],
      }, { status: 401, headers: CORS_HEADERS });
    }

    // Build endpoint URL
    const origin = request.headers.get('x-forwarded-host')
      ? `https://${request.headers.get('x-forwarded-host')}`
      : new URL(request.url).origin;
    const endpoint = `${origin}/d/${serviceId}`;

    const discovery = buildDiscoveryResponse(serviceDef, endpoint, token);

    return NextResponse.json(discovery, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('[/d] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// ── POST: Action dispatch ──
export async function POST(request, { params }) {
  try {
    const { id: serviceId } = await params;

    // Load service
    const serviceDef = await loadServiceDefinition(serviceId);
    if (!serviceDef) {
      const expiry = await getPublishExpiry(serviceId);
      if (expiry?.isExpired) {
        return NextResponse.json(
          EXPIRED_PUBLISH_BODY,
          { status: 402, headers: CORS_HEADERS }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Service not found or not published' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const token = extractToken(request);
    const body = await request.json();

    return handleAction(serviceDef, body, token);
  } catch (error) {
    console.error('[/d] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
