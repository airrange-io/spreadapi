import { NextResponse, after } from 'next/server';
import redis from '@/lib/redis';
import { calculateDirect, logCalls } from '../../api/v1/services/[id]/execute/calculateDirect.js';
import { validateServiceToken } from '@/utils/tokenAuth';
import { normalizeInputKeys } from '@/lib/inputNormalizer';

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

// ── Helper: Load service definition from Redis ──
async function loadServiceDefinition(serviceId) {
  const isPublished = await redis.exists(`service:${serviceId}:published`);
  if (isPublished === 0) return null;

  const serviceData = await redis.hGetAll(`service:${serviceId}:published`);
  if (!serviceData || Object.keys(serviceData).length === 0) return null;

  // Parse stored JSON fields
  let inputs = [];
  let outputs = [];
  let aiUsageExamples = [];
  let aiTags = [];
  try { inputs = JSON.parse(serviceData.inputs || '[]').map(i => ({ ...i, mandatory: i.mandatory !== false })); } catch (e) {}
  try { outputs = JSON.parse(serviceData.outputs || '[]'); } catch (e) {}
  try { aiUsageExamples = JSON.parse(serviceData.aiUsageExamples || '[]'); } catch (e) {}
  try { aiTags = JSON.parse(serviceData.aiTags || '[]'); } catch (e) {}

  return {
    serviceId,
    name: serviceData.title || serviceData.serviceName || 'Unnamed Service',
    description: serviceData.description || '',
    aiDescription: serviceData.aiDescription || '',
    aiUsageGuidance: serviceData.aiUsageGuidance || '',
    aiUsageExamples,
    aiTags,
    category: serviceData.category || 'general',
    needsToken: serviceData.needsToken === 'true',
    inputs,
    outputs,
  };
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

  // Build parameter details with full metadata
  const parameterDetails = inputs.map(input => {
    const param = {
      name: input.name,
      title: input.title || input.name,
      type: input.type || 'string',
      required: input.mandatory !== false,
    };
    if (input.description) param.description = input.description;
    if (input.default !== undefined && input.default !== null) param.default = input.default;
    if (input.min !== undefined) param.min = input.min;
    if (input.max !== undefined) param.max = input.max;
    if (input.allowedValues?.length > 0) param.allowedValues = input.allowedValues;
    if (input.format === 'percentage') param.format = 'percentage';
    // Include current spreadsheet value as suggested default
    if (input.value !== undefined && input.value !== null) param.currentValue = input.value;
    return param;
  });

  // Build output details
  const outputDetails = outputs.map(output => {
    const out = {
      name: output.name,
      title: output.title || output.name,
      type: output.type || 'number',
    };
    if (output.description) out.description = output.description;
    if (output.formatString) out.formatString = output.formatString;
    return out;
  });

  // Build example input values from current spreadsheet values or smart defaults
  const exampleInputs = {};
  inputs.forEach(input => {
    if (input.value !== undefined && input.value !== null) {
      exampleInputs[input.name] = input.value;
    } else if (input.default !== undefined && input.default !== null) {
      exampleInputs[input.name] = input.default;
    } else if (input.allowedValues?.length > 0) {
      exampleInputs[input.name] = input.allowedValues[0];
    } else if (input.type === 'number') {
      exampleInputs[input.name] = input.min || 0;
    } else if (input.type === 'boolean') {
      exampleInputs[input.name] = false;
    } else {
      exampleInputs[input.name] = `your_${input.name}`;
    }
  });

  // Build comprehensive instructions
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
    responseFormat: {
      success: {
        service: { id: '...', name: '...', description: '...' },
        inputs: [{ name: '...', title: '...', value: '...' }],
        outputs: [{ name: '...', title: '...', value: '...', formatString: '...' }],
        metadata: { executionTime: '...ms', cached: 'true|false' },
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

// ── Build comprehensive instructions ──
function buildInstructions(serviceDef, parameterDetails) {
  const instructions = [];

  // ── How to use this API ──
  instructions.push('This is a REST API. Make HTTP GET or POST requests to the endpoint URL.');
  instructions.push('The endpoint supports two actions: "calculate" (single calculation) and "batch" (multiple scenarios for comparison).');

  // ── Auth ──
  if (serviceDef.needsToken) {
    instructions.push('AUTHENTICATION REQUIRED: Include your token as ?token=YOUR_TOKEN in GET requests, or as "token" field in POST body, or as Bearer token in Authorization header.');
  } else {
    instructions.push('This is a public service — no authentication required.');
  }

  // ── CRITICAL: Percentage conversion ──
  const percentageParams = parameterDetails.filter(p => p.format === 'percentage');
  if (percentageParams.length > 0) {
    const names = percentageParams.map(p => `"${p.name}"`).join(', ');
    instructions.push(
      `CRITICAL — PERCENTAGE CONVERSION: Parameters [${names}] expect DECIMAL values. ` +
      `You MUST convert percentages to decimals: 5% → 0.05, 6% → 0.06, 7.5% → 0.075, 42% → 0.42. ` +
      `NEVER pass the whole number (e.g. 5 instead of 0.05 means 500%, causing wildly incorrect results). ` +
      `If a user says "5% interest rate", send 0.05. This is the #1 source of errors.`
    );
  }

  // ── Boolean conversion ──
  const booleanParams = parameterDetails.filter(p => p.type === 'boolean');
  if (booleanParams.length > 0) {
    const names = booleanParams.map(p => `"${p.name}"`).join(', ');
    instructions.push(
      `BOOLEAN PARAMETERS [${names}]: Accept multiple user formats and normalize to true/false. ` +
      `"yes"/"y"/"ja"/"oui"/"si"/"1" → true. "no"/"n"/"nein"/"non"/"0" → false. ` +
      `Always pass the actual boolean value, not a string.`
    );
  }

  // ── Enum parameters ──
  const enumParams = parameterDetails.filter(p => p.allowedValues?.length > 0);
  enumParams.forEach(p => {
    instructions.push(`ALLOWED VALUES for "${p.name}": [${p.allowedValues.join(', ')}]. Other values will be rejected.`);
  });

  // ── Range constraints ──
  const rangeParams = parameterDetails.filter(p => (p.min !== undefined || p.max !== undefined) && !p.format);
  rangeParams.forEach(p => {
    const parts = [];
    if (p.min !== undefined) parts.push(`min: ${p.min}`);
    if (p.max !== undefined) parts.push(`max: ${p.max}`);
    instructions.push(`VALUE RANGE for "${p.name}": ${parts.join(', ')}.`);
  });

  // ── Output formatting ──
  instructions.push(
    'OUTPUT FORMATTING: Each output includes a "formatString" field (Excel-style format like "€#,##0.00" or "0.00%"). ' +
    'ALWAYS use it to format numbers for display. Example: value 265.53 with formatString "€#,##0.00" → display as "€265.53". ' +
    'For percentage formats like "0.00%", multiply the decimal value by 100 (0.0725 → "7.25%"). ' +
    'Use the "title" field as the label, not the internal parameter name.'
  );

  // ── Parameter naming ──
  instructions.push(
    'PARAMETER NAMING: Use the "name" field as the key in API requests (e.g. "interest_rate"). ' +
    'The "title" field (e.g. "Interest Rate") is the human-readable label for display only. ' +
    'Parameter names are case-insensitive.'
  );

  // ── Workflow guidance ──
  instructions.push(
    'FAST PATH: When you have all required input values, call the calculate action immediately. ' +
    'Do NOT ask the user for confirmation — just calculate and show results.'
  );
  instructions.push(
    'BATCH COMPARISON: When comparing scenarios (e.g. "what if 5% vs 6% vs 7%?"), use the "batch" action ' +
    'with 2-20 scenarios in a single request. Each scenario needs a "label" and "inputs" object.'
  );

  // ── How to call ──
  instructions.push(
    'HOW TO CALL: Make HTTP requests to the endpoint. ' +
    'If your web_fetch tool blocks constructed URLs, use curl instead: ' +
    'curl -s "ENDPOINT?action=calculate&param=value" or ' +
    'curl -s -X POST ENDPOINT -H "Content-Type: application/json" -d \'{"action":"calculate","inputs":{...}}\''
  );

  // ── Error recovery ──
  instructions.push(
    'ERROR RECOVERY: If a calculation fails, read the error message carefully — it includes the parameter name, ' +
    'what went wrong, and allowed values. Fix the issue and retry automatically. ' +
    'Common errors: missing required parameter, value out of range, wrong type, invalid enum value. ' +
    'If results seem absurd (astronomical numbers), you likely sent a percentage as a whole number — divide by 100 and retry.'
  );

  // ── AI-specific guidance from service creator ──
  if (serviceDef.aiDescription) {
    instructions.push(`SERVICE-SPECIFIC NOTE: ${serviceDef.aiDescription}`);
  }
  if (serviceDef.aiUsageGuidance) {
    instructions.push(`USAGE GUIDANCE: ${serviceDef.aiUsageGuidance}`);
  }

  return instructions;
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
      // Include details for self-correction
      let errorMsg = result.error;
      if (result.details?.errors?.length) {
        const details = result.details.errors.map(e => {
          let detail = `${e.parameter}: ${e.error}`;
          if (e.allowedValues) detail += `. Allowed values: ${e.allowedValues.join(', ')}`;
          if (e.min !== undefined) detail += `. Min: ${e.min}`;
          if (e.max !== undefined) detail += `. Max: ${e.max}`;
          return detail;
        }).join('; ');
        errorMsg += `: ${details}`;
      } else if (result.message) {
        errorMsg += `: ${result.message}`;
      }
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400, headers: CORS_HEADERS });
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
