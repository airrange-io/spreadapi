/**
 * Shared service "briefing" builders.
 *
 * Single source of truth for turning a published SpreadAPI service into an
 * AI-readable briefing (parameters, constraints, outputs, instructions).
 *
 * Used by BOTH:
 *   - the REST discovery endpoint  /d/[id]            (the "AI Connect" URL)
 *   - the MCP tools/list builder    /api/mcp/service/[serviceId]
 *
 * Keeping this in one place prevents the two surfaces from drifting — which is
 * exactly how the MCP tool schema previously ended up empty.
 */

import redis from '@/lib/redis';
import { getIsSingleCellFromAddress } from '@/utils/helper';

/**
 * Load a published service definition from Redis with all JSON fields parsed.
 * Returns null if the service is not published.
 */
export async function loadServiceDefinition(serviceId) {
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

/**
 * Build parameter (input) details with full metadata for AI consumption.
 */
export function buildParameterDetails(inputs = []) {
  return inputs.map(input => {
    const param = {
      name: input.name,
      title: input.title || input.name,
      type: input.type || 'string',
      required: input.mandatory !== false,
    };
    if (input.description) param.description = input.description;
    // Services store the declared default under either `default` or `defaultValue`.
    const declaredDefault = input.default ?? input.defaultValue;
    if (declaredDefault !== undefined && declaredDefault !== null) param.default = declaredDefault;
    if (input.min !== undefined) param.min = input.min;
    if (input.max !== undefined) param.max = input.max;
    if (input.allowedValues?.length > 0) param.allowedValues = input.allowedValues;
    if (input.format === 'percentage') param.format = 'percentage';
    // Include current spreadsheet value as suggested default
    if (input.value !== undefined && input.value !== null) param.currentValue = input.value;
    return param;
  });
}

/**
 * Build output details. Range outputs are described as arrays/tables with shape.
 */
export function buildOutputDetails(outputs = []) {
  return outputs.map(output => {
    const out = {
      name: output.name,
      title: output.title || output.name,
      type: output.type || 'number',
    };
    if (output.description) out.description = output.description;
    if (output.formatString) out.formatString = output.formatString;

    // Range outputs return an array/table of cell values, not a single scalar.
    // The declared `type` can be wrong for these (it describes a cell, not the
    // shape), so derive the real shape from the address and override the type
    // accordingly — an AI must know it's getting an array, not a string.
    if (output.address && !getIsSingleCellFromAddress(output.address)) {
      out.type = 'array';
      if (output.rowCount && output.colCount) {
        out.shape = { rows: output.rowCount, cols: output.colCount };
        if (output.rowCount > 1 && output.colCount > 1) out.type = 'table';
      }
      out.note =
        'This output is a cell range — it returns an array of cell values' +
        (out.shape ? ` (${out.shape.rows}×${out.shape.cols})` : '') +
        ', not a single value. Each cell may be a number, string, or boolean.';
    }

    // Real example value captured at publish time — the single most useful hint
    // for an AI: a concrete sample of what this output actually returns.
    if (output.value !== undefined && output.value !== null && output.value !== '') {
      out.example = output.value;
    }
    return out;
  });
}

/**
 * Build a concrete example inputs object from current spreadsheet values or
 * smart defaults — the most useful single hint for an AI to make a first call.
 */
export function buildExampleInputs(inputs = []) {
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
  return exampleInputs;
}

/**
 * Build comprehensive, AI-oriented instructions for a service.
 * @param {object} serviceDef - from loadServiceDefinition
 * @param {Array}  parameterDetails - from buildParameterDetails
 */
export function buildInstructions(serviceDef, parameterDetails, opts = {}) {
  // transport: 'rest' (default, for /d) or 'mcp'. In MCP the model calls tools
  // directly, so REST-specific guidance (HTTP/curl/?token=/"this is also an MCP
  // server") is omitted — it would be wrong or misleading.
  const forMcp = opts.transport === 'mcp';
  const instructions = [];

  // ── How to use this API (REST only) ──
  if (!forMcp) {
    instructions.push('This is a REST API. Make HTTP GET or POST requests to the endpoint URL.');
    instructions.push('The endpoint supports two actions: "calculate" (single calculation) and "batch" (multiple scenarios for comparison).');

    // ── Auth (REST only — MCP auth is handled by the connector/OAuth) ──
    if (serviceDef.needsToken) {
      instructions.push('AUTHENTICATION REQUIRED: Include your token as ?token=YOUR_TOKEN in GET requests, or as "token" field in POST body, or as Bearer token in Authorization header.');
    } else {
      instructions.push('This is a public service — no authentication required.');
    }
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

  // ── Output formatting (only when at least one output actually carries a format) ──
  if (serviceDef.outputs?.some(o => o.formatString)) {
    instructions.push(
      'OUTPUT FORMATTING: Outputs may include a "formatString" field (Excel-style format like "€#,##0.00" or "0.00%"). ' +
      'When present, use it to format numbers for display. Example: value 265.53 with formatString "€#,##0.00" → display as "€265.53". ' +
      'For percentage formats like "0.00%", multiply the decimal value by 100 (0.0725 → "7.25%"). ' +
      'Use the "title" field as the label, not the internal parameter name.'
    );
  }

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

  // ── How to call (REST only) ──
  if (!forMcp) {
    instructions.push(
      'HOW TO CALL: Make HTTP requests to the endpoint. ' +
      'If your web_fetch tool blocks constructed URLs, use curl instead: ' +
      'curl -s "ENDPOINT?action=calculate&param=value" or ' +
      'curl -s -X POST ENDPOINT -H "Content-Type: application/json" -d \'{"action":"calculate","inputs":{...}}\''
    );
  }

  // ── Error recovery ──
  instructions.push(
    'ERROR RECOVERY: If a calculation fails, read the error message carefully — it includes the parameter name, ' +
    'what went wrong, and allowed values. Fix the issue and retry automatically. ' +
    'Common errors: missing required parameter, value out of range, wrong type, invalid enum value. ' +
    'If results seem absurd (astronomical numbers), you likely sent a percentage as a whole number — divide by 100 and retry.'
  );

  // ── MCP upgrade path (REST only — pointless when already on MCP) ──
  if (!forMcp) {
    instructions.push(
      'MCP AVAILABLE: This service is also exposed as a native MCP server (see the top-level "mcp" field). ' +
      'If the user would benefit from persistent, native tool access rather than one-off REST calls, ' +
      'proactively offer to set it up and give them the mcp.url to add as a custom connector.'
    );
  }

  // ── AI-specific guidance from service creator ──
  if (serviceDef.aiDescription) {
    instructions.push(`SERVICE-SPECIFIC NOTE: ${serviceDef.aiDescription}`);
  }
  if (serviceDef.aiUsageGuidance) {
    instructions.push(`USAGE GUIDANCE: ${serviceDef.aiUsageGuidance}`);
  }

  return instructions;
}
