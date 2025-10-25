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
// Use date-based versioning per MCP spec: 2024-11-05, 2025-03-26, 2025-06-18
const MCP_VERSION = '2024-11-05';  // Latest stable MCP spec version
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
    let userServiceIds = Object.keys(userServiceIndex);

    // Get allowed service IDs from auth
    const allowedServiceIds = auth.serviceIds || [];

    // SECURITY: MCP tokens should ALWAYS be restricted to their bound services
    // NEVER allow access to all services - filter to allowed services only
    // If allowedServiceIds is empty, the token has no access (not all access!)
    userServiceIds = userServiceIds.filter(id => allowedServiceIds.includes(id));
    
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
    // Note: Redis multi.exec() returns flat array of results (not error tuples)
    const results = await multi.exec();

    // Process results (2 results per service: exists + hGetAll)
    for (let i = 0; i < userServiceIds.length; i++) {
      const serviceId = userServiceIds[i];
      const baseIndex = i * 2;

      // Redis multi.exec() returns flat array: [result1, result2, ...]
      // NOT [[error, result], ...] - that's the old node-redis v3 format
      const existsResult = results[baseIndex];
      const publishedData = results[baseIndex + 1];
      const isPublished = existsResult === 1;

      if (!isPublished) {
        continue;
      }

      // Note: Service restriction filtering already done above when building userServiceIds
      // This ensures we only query allowed services

      if (!publishedData || !publishedData.urlData) {
        continue;
      }
      
      const title = publishedData.title || serviceId;
      const description = publishedData.description || publishedData.aiDescription || '';
      const shortDesc = description.substring(0, 120) + (description.length > 120 ? '...' : '');

      // Parse AI-specific guidance from Redis
      const aiDescription = publishedData.aiDescription || null;
      const aiUsageGuidance = publishedData.aiUsageGuidance || null;
      let aiUsageExamples = [];
      let aiTags = [];

      try {
        if (publishedData.aiUsageExamples) {
          aiUsageExamples = JSON.parse(publishedData.aiUsageExamples);
        }
      } catch (e) {
        // Silent fail - AI examples are optional
      }

      try {
        if (publishedData.aiTags) {
          aiTags = JSON.parse(publishedData.aiTags);
        }
      } catch (e) {
        // Silent fail - AI tags are optional
      }

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

        // Store structured data with AI hints for tool descriptions
        structuredServices.push({
          id: serviceId,
          name: title,
          description: shortDesc,
          fullDescription: description,
          aiDescription: aiDescription,
          aiUsageGuidance: aiUsageGuidance,
          aiUsageExamples: aiUsageExamples,
          aiTags: aiTags,
          category: publishedData.category || 'general',
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
      const paramName = input.name;

      // Use human-friendly title instead of technical parameter name
      const friendlyName = input.title || input.name;

      // Build user-friendly description starting with the friendly name
      let description = friendlyName;
      if (input.description) {
        description += ': ' + input.description;
      }

      // Handle enum values (allowedValues) - provide numbered options
      if (input.allowedValues && Array.isArray(input.allowedValues) && input.allowedValues.length > 0) {
        const options = input.allowedValues
          .map((val, idx) => `${idx + 1}. ${val}`)
          .join(', ');
        description += `. Options: ${options} (you can use the number or value)`;
      }

      // Handle boolean type - suggest localized values
      else if (input.type === 'boolean') {
        description += ' (true/false, yes/no, ja/nein, 1/0 accepted)';
      }

      // Handle percentage format
      else if (input.format === 'percentage' || input.formatString?.includes('%')) {
        description += ' (Enter as decimal: 0.42 for 42%, or as percentage: 42%)';
      }

      // Handle numeric ranges - always mention constraints
      else if (input.type === 'number' && (input.min !== undefined || input.max !== undefined)) {
        if (input.min !== undefined && input.max !== undefined) {
          description += `. Must be between ${input.min} and ${input.max}`;
        } else if (input.min !== undefined) {
          description += `. Minimum: ${input.min}`;
        } else if (input.max !== undefined) {
          description += `. Maximum: ${input.max}`;
        }
      }

      const schema = {
        type: input.type === 'number' ? 'number' :
              input.type === 'boolean' ? 'boolean' : 'string',
        description: description
      };

      // Add enum constraint for allowed values (JSON Schema validation)
      if (input.allowedValues && Array.isArray(input.allowedValues) && input.allowedValues.length > 0) {
        schema.enum = input.allowedValues;
      }

      // Add numeric constraints (JSON Schema validation)
      if (input.type === 'number') {
        if (input.min !== undefined) schema.minimum = input.min;
        if (input.max !== undefined) schema.maximum = input.max;
      }

      properties[paramName] = schema;

      // Only add to required if mandatory (defaults will be applied silently)
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

  // Add helpful context about what this calculation does
  const inputCount = apiDefinition.inputs?.length || 0;
  const outputCount = apiDefinition.outputs?.length || 0;
  description += `\n\n📊 This is a stateless spreadsheet calculation with ${inputCount} input parameter${inputCount !== 1 ? 's' : ''} and ${outputCount} output${outputCount !== 1 ? 's' : ''}. Provide all required inputs to get instant results (typically <100ms).`;

  // Add usage example if available
  if (apiDefinition.aiUsageExamples && apiDefinition.aiUsageExamples.length > 0) {
    description += `\n\n💡 Example: ${apiDefinition.aiUsageExamples[0]}`;
  }
  
  const tool = {
    name: `spreadapi_calc_${serviceId}`,
    description: description.substring(0, 800), // Limit description length (increased for teaching context)
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
 * Preprocess inputs to handle numbered options and localized values
 */
function preprocessInputs(inputs, apiDefinition) {
  const processed = {};

  for (const [key, value] of Object.entries(inputs)) {
    const inputDef = apiDefinition.inputs?.find(i => i.name === key);

    if (!inputDef) {
      // Unknown parameter, pass through
      processed[key] = value;
      continue;
    }

    // Handle numbered option selection (e.g., "1" -> "Angestellt")
    if (inputDef.allowedValues && Array.isArray(inputDef.allowedValues) && inputDef.allowedValues.length > 0) {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 1 && numValue <= inputDef.allowedValues.length) {
        processed[key] = inputDef.allowedValues[numValue - 1];
        continue;
      }
    }

    // Handle localized boolean values (ja/nein, wahr/falsch)
    if (inputDef.type === 'boolean' && typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'ja' || lower === 'j' || lower === 'wahr') {
        processed[key] = true;
        continue;
      }
      if (lower === 'nein' || lower === 'falsch') {
        processed[key] = false;
        continue;
      }
    }

    // Pass through as-is (validation happens in calculateDirect)
    processed[key] = value;
  }

  return processed;
}

/**
 * Format a value using Excel-style format string
 * Supports common formats like €#,##0.00, $#,##0.00, 0.00%, etc.
 */
function formatValueWithExcelFormat(value, formatString) {
  if (value === null || value === undefined || formatString === null || formatString === undefined) {
    return value;
  }

  try {
    // Handle percentage format (0.00%, 0%, etc.)
    if (formatString.includes('%')) {
      const percentValue = (value * 100).toFixed(2);
      return `${percentValue}%`;
    }

    // Extract currency symbol (€, $, etc.)
    const currencyMatch = formatString.match(/^([€$£¥₹₽])/);
    const currencySymbol = currencyMatch ? currencyMatch[1] : '';

    // Extract decimal places from format string
    const decimalMatch = formatString.match(/\.([0#]+)/);
    const decimalPlaces = decimalMatch ? decimalMatch[1].length : 0;

    // Format number with thousands separators and decimal places
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(value);

    // Combine currency symbol with formatted number
    if (currencySymbol) {
      return `${currencySymbol}${formattedNumber}`;
    }

    return formattedNumber;
  } catch (error) {
    // If formatting fails, return raw value
    console.warn(`Failed to format value ${value} with format ${formatString}:`, error);
    return value;
  }
}

/**
 * Execute a service calculation using V1 API
 */
async function executeService(serviceId, inputs) {
  try {
    // Get API definition for input preprocessing
    const apiData = await getApiDefinition(serviceId, null);
    const apiDefinition = apiData.apiJson || apiData;

    // Preprocess inputs (handle numbered options, localized values)
    const processedInputs = preprocessInputs(inputs, apiDefinition);

    // Use V1 API direct calculation (no HTTP overhead)
    const data = await calculateDirect(serviceId, processedInputs, null, {});

    // Check for errors from calculateDirect
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Format response for MCP
    let resultText = '';

    // Format outputs with helpful context
    if (data.outputs || data.result) {
      const outputs = data.outputs || data.result;
      const serviceName = apiDefinition.title || serviceId;

      resultText = `✅ ${serviceName} - Calculation Complete\n\n`;
      resultText += '📊 Results:\n';

      // Handle array format (from V1 API response)
      if (Array.isArray(outputs)) {
        outputs.forEach(output => {
          // Use friendly title or fallback to name
          const outputLabel = output.title || output.name;

          // Format value using formatString if available
          let displayValue;
          if (output.formatString) {
            // Apply Excel-style formatting for presentation
            displayValue = formatValueWithExcelFormat(output.value, output.formatString);
          } else {
            // No format string - show raw value
            displayValue = output.value;
          }

          resultText += `  • ${outputLabel}: ${displayValue}\n`;
        });
      } else {
        // Handle object format (legacy)
        for (const [key, value] of Object.entries(outputs)) {
          resultText += `  • ${key}: ${value}\n`;
        }
      }

      resultText += '\n💡 These are the final calculated outputs from the spreadsheet.';
      resultText += ' To recalculate with different inputs, call this tool again (stateless, very fast).';
    }

    // Add metadata if available
    if (data.metadata && data.metadata.executionTime) {
      resultText += `\n\n⚡ Completed in ${data.metadata.executionTime}ms`;
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
        // CRITICAL: Echo back the client's requested protocol version
        // Per MCP spec, if we don't support it we can offer older, but client may reject
        // ChatGPT won't call tools/list if version doesn't match!
        const clientVersion = params?.protocolVersion || MCP_VERSION;
        const supportedVersions = ['2024-11-05', '2025-03-26', '2025-06-18'];
        const agreedVersion = supportedVersions.includes(clientVersion) ? clientVersion : MCP_VERSION;

        const response = {
          protocolVersion: agreedVersion,  // Echo client's version if supported
          capabilities: {
            tools: {
              listChanged: true  // Signal that tools list is available and can change
            },
            resources: {
              subscribe: false,
              listChanged: false
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

            response.serverInfo.name = service.name;

            let desc = `${service.name}: ${service.fullDescription || 'Spreadsheet calculation service'}\n\n`;

            // Add AI-specific guidance prominently
            if (service.aiDescription) {
              desc += `⚠️  IMPORTANT: ${service.aiDescription}\n\n`;
            }
            if (service.aiUsageGuidance) {
              desc += `💡 GUIDANCE: ${service.aiUsageGuidance}\n\n`;
            }

            desc += `To use: Call spreadapi_get_service_details to see parameters, then spreadapi_calc to execute.`;

            response.serverInfo.description = desc;
            response.serverInfo.instructions = `🚀 WORKFLOW:

OPTION A - User provides all values (FAST PATH - preferred):
→ Call spreadapi_calc("${service.id}", inputs) immediately
   Example: User says "Calculate X with Y and Z"
   → You have all values, just call it now!

OPTION B - Need parameter info (DISCOVERY PATH):
1. Call spreadapi_get_service_details("${service.id}")
2. Show user what parameters are needed
3. Call spreadapi_calc("${service.id}", inputs)

🎯 PREFER OPTION A whenever possible (faster, better UX)

⚠️  CRITICAL - PERCENTAGE VALUES:
ALWAYS convert percentages to decimals (divide by 100):
• "5%" → 0.05 (NOT 5)
• "42%" → 0.42 (NOT 42)
• "0.5%" → 0.005 (NOT 0.5)
Entering "5" instead of "0.05" causes wildly incorrect results!

📊 PRESENTING RESULTS:
Outputs include formatString - ALWAYS use it!
Example: {"value": 265.53, "formatString": "€#,##0.00", "title": "Alt"}
→ Present as: "Alt: €265.53" (not "265.53")

🚀 BE PROACTIVE:
❌ DON'T ask "Would you like me to retrieve details?"
✅ DO: Just retrieve and use them
❌ DON'T ask "Would you like me to calculate?"
✅ DO: Calculate immediately
Only ask permission for saving data or irreversible actions.

🔄 AUTO-RECOVERY:
If calculation fails → Auto-call get_service_details and retry
If result seems absurd (>$1M for typical inputs, scientific notation) → Check percentage format, retry with correction`;
          } else {
            // Multiple services: list them all with AI hints
            let description = `SpreadAPI: Instant Spreadsheet Calculations\n\nYou have access to ${serviceCount} calculation services:\n\n`;

            serviceInfo.structuredServices.forEach((svc, index) => {
              description += `${index + 1}. **${svc.name}** (${svc.id})`;

              // Show AI-specific guidance RIGHT HERE - this is critical!
              if (svc.aiDescription) {
                description += `\n   ⚠️  ${svc.aiDescription}`;
              }
              if (svc.aiUsageGuidance) {
                description += `\n   💡 ${svc.aiUsageGuidance}`;
              }

              description += `\n\n`;
            });

            response.serverInfo.description = description;
            response.serverInfo.instructions = `🎯 YOUR ROLE: Helpful calculation assistant, NOT a technical tool lister

When user asks "what can you do?":
❌ DON'T list technical tools or paths
✅ DO say: "I can help you calculate! What would you like to calculate?"
Focus on USER PROBLEMS, not technical capabilities.

🚀 WORKFLOW (follow this order):

OPTION A - User provides all values (FAST PATH - preferred):
→ Directly call: spreadapi_calc(serviceId, inputs)
   Example: "Calculate compound interest for $10k at 5% for 10 years"
   → You have enough info, call spreadapi_calc immediately!

OPTION B - Need parameter info (DISCOVERY PATH):
1. Call: spreadapi_get_service_details(serviceId)
2. Show user what parameters are needed
3. Call: spreadapi_calc(serviceId, inputs)

🎯 PREFER OPTION A whenever possible (faster, better UX)

⚠️  CRITICAL - PERCENTAGE VALUES:
ALWAYS convert percentages to decimals (divide by 100):
• "5%" → 0.05 (NOT 5)
• "42%" → 0.42 (NOT 42)
• "0.5%" → 0.005 (NOT 0.5)
Entering "5" instead of "0.05" causes wildly incorrect results!

📊 PRESENTING RESULTS:
Outputs include formatString - ALWAYS use it when available!
• formatString "€#,##0.00" → €265.53
• formatString "$#,##0.00" → $31,998.32
• Use title field for labels, not name
Present as: "Title: Formatted Value" (e.g., "Total: $31,998.32")

🚀 BE PROACTIVE - Stop Asking Permission!
❌ DON'T ask: "Would you like me to retrieve details?"
✅ DO: Just retrieve and use them
❌ DON'T ask: "Would you like me to calculate?"
✅ DO: Calculate immediately
Only ask permission for saving data or irreversible actions.

🔄 AUTO-RECOVERY:
• Calculation fails → Auto-call get_service_details and retry
• Result seems absurd (>$1M for typical inputs, scientific notation) → Check percentage format, auto-retry with correction

❌ DON'T:
- Call spreadapi_list_services (services already listed above)
- Ask for parameters you can infer
- Just say "that's unrealistic" - FIX IT!

✅ DO:
- Calculate immediately when you have values
- Pay attention to service warnings (⚠️) above
- Follow service guidance (💡) for conditional parameters
- Auto-correct errors and explain what you fixed`;
          }
        } catch (error) {
          console.error('Error loading service list:', error);
          // Fallback to comprehensive description
          response.serverInfo.description = `SpreadAPI: Spreadsheet Calculations as API Services

This server provides access to Excel/Google Sheets spreadsheets that have been published as calculation APIs. Think of them as powerful, stateless calculators where you provide inputs and get calculated outputs instantly.

🎯 Use Cases:
• Financial calculations (taxes, insurance, loans, pricing)
• Scientific formulas and engineering calculations
• Business logic and data transformations
• Complex multi-step computations

📊 How It Works:
1. Each service is a spreadsheet with defined input and output parameters
2. You provide values for the inputs (required + optional)
3. The spreadsheet calculates and returns the outputs in milliseconds
4. All validation (types, ranges, enums) is handled automatically

⚡ Key Characteristics:
• STATELESS: Each calculation is independent - always provide all parameters
• FAST: Optimized calculations typically complete in <100ms
• BATCH-CAPABLE: You can request multiple parameter combinations at once
• NO MEMORY: Services don't remember previous calculations`;

          response.serverInfo.instructions = `🚀 Getting Started:
1. Call spreadapi_list_services() to discover available calculators
2. Use spreadapi_get_service_details(serviceId) to understand parameters
3. Execute the service tool (spreadapi_calc_[serviceId]) with input values

💡 Tips for Best Results:
• Always provide ALL required parameters in each call (stateless)
• Optional parameters have smart defaults applied automatically
• Enum parameters accept numbered choices (1, 2, 3) or values
• Percentages can be entered as decimals (0.42) or percentages (42%)
• Boolean values accept multiple formats (true/false, yes/no, ja/nein)
• For what-if scenarios, make multiple calls with different inputs (very fast!)
• Check parameter constraints (min/max, allowed values) in the schema`;
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

        // Build dynamic tool descriptions with perfect AI guidance
        let calcDescription = `🎯 PRIMARY TOOL - Use this for ALL calculations

WHEN TO USE:
- User asks for a calculation (e.g., "calculate...", "compute...", "what if...")
- User provides numeric values or scenarios
- User wants to compare options (use spreadapi_batch for 3+ comparisons)

HOW TO USE:
1. FAST PATH (preferred): If you know the parameters → Call immediately
   Example: User: "Calculate 5% interest on $1000 for 12 months"
   → You have: serviceId + inputs → Just call spreadapi_calc right now!

2. DISCOVERY PATH: If unsure about parameters → Call spreadapi_get_service_details first

⚠️  CRITICAL - PERCENTAGE VALUES:
ALWAYS convert percentages to decimals (divide by 100):
• "5%" → 0.05 (NOT 5)
• "42%" → 0.42 (NOT 42)
• "0.5%" → 0.005 (NOT 0.5)
Entering "5" instead of "0.05" causes wildly incorrect results!

📊 PRESENTING RESULTS:
Outputs include formatString - ALWAYS use it when available!
• Example output: {"value": 265.53, "formatString": "€#,##0.00", "title": "Alt"}
• Present as: "Alt: €265.53" (NOT "265.53" or "Alt: 265.53")
• Use title field for labels, not name
• If formatString missing, present raw value

🔄 AUTO-ERROR RECOVERY:
If calculation fails:
1. Auto-call spreadapi_get_service_details(serviceId)
2. Identify the issue (missing param, wrong type, etc.)
3. Retry with corrections
4. Explain what you fixed

If result seems absurd (>$1M for typical inputs, scientific notation):
1. Check if percentage values were converted (5% → 0.05)
2. Auto-retry with corrected values
3. Explain: "I noticed the result was unrealistic. The issue was..."

❌ DON'T just say "that's unrealistic" and stop
✅ DO: Fix it automatically and explain the correction`;

        // Add service-specific AI hints dynamically
        if (serviceInfo.structuredServices && serviceInfo.structuredServices.length > 0) {
          calcDescription += `\n\nIMPORTANT NOTES:`;

          serviceInfo.structuredServices.forEach((svc) => {
            calcDescription += `\n\n**${svc.name}** (${svc.id}):`;

            if (svc.aiDescription) {
              calcDescription += `\n⚠️  ${svc.aiDescription}`;
            }

            if (svc.aiUsageGuidance) {
              calcDescription += `\n💡 ${svc.aiUsageGuidance}`;
            }

            if (svc.aiUsageExamples && svc.aiUsageExamples.length > 0) {
              calcDescription += `\n📝 Examples:`;
              svc.aiUsageExamples.slice(0, 2).forEach(ex => {
                calcDescription += `\n   • ${ex}`;
              });
            }
          });
        } else if (serviceInfo.calcServices.length > 0) {
          calcDescription += '\n\nAvailable services:\n' + serviceInfo.calcServices.join('\n');
        }

        calcDescription += `\n\nRETURN FORMAT:
- outputs: Array of results with names and values
- serviceName: Human-readable name
- inputs: Echo of what you sent
- metadata: Execution time, caching info`;

        const getDetailsDescription = `📋 DISCOVERY TOOL - Learn about service parameters

WHEN TO USE:
- You're about to call spreadapi_calc but don't know required parameters
- User asks "what parameters do you need?" or "what can you calculate?"
- You need to show available enum/choice options

WHEN NOT TO USE:
- User already provided all values → Skip this, call spreadapi_calc directly
- You just want to list services → They're shown in spreadapi_calc description
- Simple calculation with obvious parameters → Infer and calculate

RETURNS:
- inputs: Array with types, constraints, defaults, examples, percentage format hints
- outputs: What the calculation returns (with formatString for presentation)
- aiDescription: Special instructions for this service (READ THIS!)
- aiUsageExamples: Example requests and how to handle them

📊 IMPORTANT: Check outputs for formatString - use it to present results correctly!`;

        const listServicesDescription = `📑 OPTIONAL - List all services with metadata

⚠️  USUALLY SKIP THIS! Services are already listed in spreadapi_calc tool description.

ONLY use if:
- User explicitly asks "what services do you have?" or "list all calculators"
- You need detailed metadata (creation dates, call counts, categories)
- You need to discover services with editable areas

🚀 BE PROACTIVE:
❌ DON'T ask "Would you like me to list services?"
✅ DO: Just use the services shown in spreadapi_calc description`;

        let areaDescription = '🔍 ADVANCED - Read editable spreadsheet areas (tables/lists)\n\nCOMPLEX FEATURE - Only use if service has editable areas.';
        if (serviceInfo.areaServices.length > 0) {
          areaDescription += '\n\nYour services with editable areas:\n' + serviceInfo.areaServices.join('\n');
        }

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
                  description: 'Which service to execute. REQUIRED. Use IDs from the service list above.',
                  enum: serviceInfo.calcServices.length > 0
                    ? serviceInfo.calcServices.map(s => s.match(/\(([^)]+)\)/)?.[1]).filter(Boolean)
                    : undefined
                },
                inputs: {
                  type: 'object',
                  description: `Input parameters as key-value pairs.

⚠️  CRITICAL: Call spreadapi_get_service_details(serviceId) first if you don't know parameters!

Parameter formats:
• Percentages: Use decimals (0.05 for 5%, 0.42 for 42%)
• Booleans: true/false, yes/no, ja/nein all work
• Enums: Use exact values or numeric choices (1, 2, 3)
• Optional params: Omit them (defaults apply automatically)

Example: { "interest_rate": 0.05, "principal": 10000, "years": 30 }`,
                  additionalProperties: true
                },
                areaUpdates: {
                  type: 'array',
                  description: `ADVANCED: Update editable spreadsheet areas before calculating.

Only use if:
- Service has areas (check spreadapi_get_service_details)
- User wants to modify table data
- Calculation depends on editable dataset

Skip this for simple calculations with just input parameters.`,
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
            description: `Execute multiple calculations at once for comparison. Perfect for scenarios like comparing different loan terms, investment strategies, or budget variations.

🚀 BE PROACTIVE: When user says "compare X and Y", just run the batch immediately - don't ask permission.

⚠️  PERCENTAGE WARNING: Apply same percentage conversion (5% → 0.05) to ALL scenarios in batch.

📊 PRESENTATION: Use formatString from outputs to present comparison table with proper formatting.`,
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
            description: `Save calculation results to enable scenario comparison and decision-making. PURPOSE: Since calculations are stateless (no memory), this tool bridges that gap - save multiple scenarios to compare later. WORKFLOW: Calculate → Save with descriptive label → Calculate alternative → Save → Compare → Make decision. WHEN TO USE: When user says "remember this", "save this scenario", "let's compare options", or when doing what-if analysis. Examples: "Calculate my 30-year mortgage and save it as baseline", "Save this as aggressive investment option".

🚀 BE PROACTIVE:
❌ DON'T ask "Would you like me to save this?"
✅ DO: Just save it with a descriptive label when user says "remember" or is comparing options

📊 SAVE WITH FORMATSTRING: Outputs include formatString - they're preserved in saved state.`,
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
                  description: 'Descriptive label that helps user recall this scenario later (e.g., "30-year fixed mortgage", "conservative portfolio", "current salary scenario"). IMPORTANT: Use clear, distinctive labels since users compare multiple scenarios - avoid vague names like "option 1"'
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
            description: `Retrieve saved calculation to compare or reuse. PURPOSE: Load previous scenarios for side-by-side comparison or to build upon. Returns both original inputs AND calculated outputs. WHEN TO USE: When user says "compare with the baseline", "show me the 30-year option", "what were the numbers for scenario X?", or when preparing a comparison table. TIP: Load multiple saved states to create comparison summaries.

🚀 BE PROACTIVE:
❌ DON'T ask "Would you like me to load the baseline scenario?"
✅ DO: Just load it and show the comparison

📊 USE FORMATSTRING: When presenting loaded results, use formatString from outputs for proper formatting.`,
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
            description: 'Discover what scenarios the user has already calculated and saved. PURPOSE: Help user recall their previous work and see all saved options at a glance. WHEN TO USE: User asks "what scenarios did we calculate?", "show my saved options", "what were we comparing?", or proactively before suggesting new calculations to avoid duplicates. Returns state IDs (for loading), descriptive labels (user-friendly), service names, and timestamps.',
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
              message: 'Invalid params: tool name is required',
              data: {
                hint: 'The "name" parameter must be a string. Use tools/list to see available tools.',
                receivedType: typeof name,
                documentation: 'https://spreadapi.io/docs/mcp/tools'
              }
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
                message: 'Missing required parameter: serviceId',
                data: {
                  hint: 'The "serviceId" parameter is required for spreadapi_calc tool. Use tools/list to see available services.',
                  requiredParams: ['serviceId'],
                  optionalParams: ['inputs', 'areaUpdates', 'returnOptions'],
                  documentation: 'https://spreadapi.io/docs/mcp/tools'
                }
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
                message: 'Access denied: This token has no service access configured',
                data: {
                  hint: 'Create a new token with specific services selected at https://spreadapi.io/app/profile',
                  requestedService: serviceId,
                  allowedServices: [],
                  documentation: 'https://spreadapi.io/docs/mcp/tokens'
                }
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
                message: `Access denied: Service "${serviceId}" is not accessible with this token`,
                data: {
                  requestedService: serviceId,
                  allowedServices: allowedServiceIds,
                  hint: `This token has access to: ${allowedServiceIds.join(', ')}. Use tools/list to see available services.`,
                  documentation: 'https://spreadapi.io/docs/mcp/tokens'
                }
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
                message: `Service "${serviceId}" not found or not published`,
                data: {
                  requestedService: serviceId,
                  hint: 'The service may have been deleted, unpublished, or the ID is incorrect. Use tools/list to see available services.',
                  allowedServices: allowedServiceIds
                }
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
                message: 'Missing required parameters: serviceId and areaName',
                data: {
                  hint: 'Both "serviceId" and "areaName" are required for spreadapi_read_area tool.',
                  requiredParams: ['serviceId', 'areaName'],
                  optionalParams: ['includeFormulas', 'includeFormatting'],
                  providedParams: { serviceId: !!serviceId, areaName: !!areaName },
                  documentation: 'https://spreadapi.io/docs/mcp/tools'
                }
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
                message: 'Access denied: This token has no service access configured',
                data: {
                  hint: 'Create a new token with specific services selected at https://spreadapi.io/app/profile',
                  requestedService: serviceId,
                  allowedServices: [],
                  documentation: 'https://spreadapi.io/docs/mcp/tokens'
                }
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
                message: `Access denied: Service "${serviceId}" is not accessible with this token`,
                data: {
                  requestedService: serviceId,
                  allowedServices: allowedServiceIds,
                  hint: `This token has access to: ${allowedServiceIds.join(', ')}. Use tools/list to see available services.`,
                  documentation: 'https://spreadapi.io/docs/mcp/tokens'
                }
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
                message: `Service "${serviceId}" not found or not published`,
                data: {
                  requestedService: serviceId,
                  hint: 'The service may have been deleted, unpublished, or the ID is incorrect. Use tools/list to see available services.',
                  allowedServices: allowedServiceIds
                }
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
                // Get API definition for input preprocessing
                const apiData = await getApiDefinition(serviceId, null);
                const apiDefinition = apiData.apiJson || apiData;

                // Preprocess inputs (handle numbered options, localized values)
                const processedInputs = preprocessInputs(inputs, apiDefinition);

                // Use V1 API direct calculation
                const data = await calculateDirect(serviceId, processedInputs, null, {});

                // Check for errors
                if (data.error) {
                  throw new Error(data.error);
                }

                // Store raw outputs array (with formatString preserved!)
                const outputs = data.outputs || data.result || [];

                results.push({
                  label: label || `Calculation ${results.length + 1}`,
                  serviceId,
                  inputs,
                  outputs: Array.isArray(outputs) ? outputs : Object.entries(outputs).map(([k, v]) => ({ name: k, value: v })),
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
                // Use formatString for proper presentation
                if (Array.isArray(result.outputs)) {
                  result.outputs.forEach(output => {
                    const label = output.title || output.name;
                    const displayValue = output.formatString
                      ? formatValueWithExcelFormat(output.value, output.formatString)
                      : output.value;
                    responseText += `${label}: ${displayValue}\n`;
                  });
                } else {
                  // Legacy object format
                  Object.entries(result.outputs).forEach(([key, value]) => {
                    responseText += `${key}: ${value}\n`;
                  });
                }
                responseText += '\n';
              }
            });
            
            // Create comparison table if we have successful results
            const successfulResults = results.filter(r => r.success);
            if (successfulResults.length > 1) {
              responseText += '### Comparison Table\n\n';

              // Build output map: outputName -> { title, formatString }
              const outputMap = new Map();
              successfulResults.forEach(r => {
                if (Array.isArray(r.outputs)) {
                  r.outputs.forEach(output => {
                    if (!outputMap.has(output.name)) {
                      outputMap.set(output.name, {
                        title: output.title || output.name,
                        formatString: output.formatString
                      });
                    }
                  });
                }
              });

              // Get output keys to compare
              const outputsToCompare = compareOutputs && compareOutputs.length > 0
                ? Array.from(outputMap.keys()).filter(key => compareOutputs.includes(key))
                : Array.from(outputMap.keys());

              // Build comparison table header
              responseText += '| Scenario |';
              outputsToCompare.forEach(key => {
                const meta = outputMap.get(key);
                responseText += ` ${meta.title} |`;
              });
              responseText += '\n|' + '-|'.repeat(outputsToCompare.length + 1) + '\n';

              // Build comparison table rows
              successfulResults.forEach(result => {
                responseText += `| ${result.label} |`;
                outputsToCompare.forEach(key => {
                  // Find the output by name
                  const output = Array.isArray(result.outputs)
                    ? result.outputs.find(o => o.name === key)
                    : null;

                  if (output) {
                    const displayValue = output.formatString
                      ? formatValueWithExcelFormat(output.value, output.formatString)
                      : output.value;
                    responseText += ` ${displayValue} |`;
                  } else {
                    responseText += ` N/A |`;
                  }
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
                responseText += ` - ${input.type}`;
                if (input.mandatory !== false) responseText += ' [REQUIRED]';
                if (input.format === 'percentage') {
                  responseText += ' [PERCENTAGE: Enter as decimal, e.g., 0.05 for 5%]';
                }
                if (input.description) responseText += `\n  ${input.description}`;

                // Add allowed values (enum validation)
                if (input.allowedValues && input.allowedValues.length > 0) {
                  const caseSensitive = input.allowedValuesCaseSensitive === true;
                  responseText += `\n  Allowed values${caseSensitive ? ' (case-sensitive)' : ''}: ${input.allowedValues.join(', ')}`;

                  // Show source range if values were extracted from worksheet
                  if (input.allowedValuesRange) {
                    responseText += `\n  (Values loaded from: ${input.allowedValuesRange} - republish service to update)`;
                  }
                }

                // Add default value
                if (input.defaultValue !== undefined && input.defaultValue !== null) {
                  responseText += `\n  Default: ${input.defaultValue}`;
                }

                // Add AI examples if available
                if (input.aiExamples && input.aiExamples.length > 0) {
                  responseText += `\n  Examples: ${input.aiExamples.join(', ')}`;
                }

                // Add min/max range
                if (input.min !== undefined || input.max !== undefined) {
                  responseText += `\n  Range: ${input.min !== undefined ? input.min : '*'} to ${input.max !== undefined ? input.max : '*'}`;
                }

                responseText += '\n';
              });
            }
            
            if (apiDefinition.outputs && apiDefinition.outputs.length > 0) {
              responseText += '\nOUTPUTS:\n';
              apiDefinition.outputs.forEach(output => {
                responseText += `• ${output.name} - ${output.type}`;
                if (output.description) responseText += `: ${output.description}`;

                // Add format information
                if (output.format) {
                  if (output.format === 'percentage') {
                    responseText += ` [PERCENTAGE FORMAT: Value is decimal, display as percentage]`;
                  } else if (output.format === 'currency') {
                    responseText += ` [CURRENCY FORMAT]`;
                  } else if (output.format === 'date') {
                    responseText += ` [DATE FORMAT]`;
                  } else {
                    responseText += ` [FORMAT: ${output.format}]`;
                  }
                }

                // Add formatString information (CRITICAL for presentation)
                if (output.formatString) {
                  responseText += `\n  📊 formatString: "${output.formatString}" - ALWAYS use this for presentation!`;
                  responseText += `\n      Example: value=265.53 → display as formatted with this pattern`;
                } else if (output.formatter && output.format !== 'percentage') {
                  responseText += `\n  Formatter: ${output.formatter}`;
                }

                // Add presentation hint if available
                if (output.aiPresentationHint) {
                  responseText += `\n  Present as: ${output.aiPresentationHint}`;
                }

                responseText += '\n';
              });

              // Add general formatString guidance at the end
              responseText += '\n⚠️  IMPORTANT: When presenting results, check each output for formatString field!';
              responseText += '\n    If present, use it to format the value (e.g., "€#,##0.00" → €265.53)';
              responseText += '\n    Use the title field (not name) as the label for user-friendly display.';
            }
            
            if (areas.length > 0) {
              responseText += '\nEDITABLE AREAS:\n';
              areas.forEach(area => {
                responseText += `• ${area.name}`;
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
              responseText += `▶ ${service.title}\n`;
              if (service.description) {
                responseText += `   ${service.description}\n`;
              }

              // Add action-oriented prompts
              if (service.hasCalculation) {
                responseText += `   💡 To run this calculation, use: spreadapi_calc_${service.id}\n`;
              }

              if (includeMetadata) {
                if (service.hasCalculation) {
                  responseText += `   Parameters: ${service.inputCount} inputs, ${service.outputCount} outputs\n`;
                }
                if (service.needsToken !== undefined) {
                  responseText += `   Authentication: ${service.needsToken ? 'Required' : 'Optional'}\n`;
                }
              }

              if (includeAreas && service.areas) {
                responseText += `   Interactive areas available:\n`;
                for (const area of service.areas) {
                  responseText += `     • ${area.name} (${area.mode}) [${area.address}]\n`;
                }
              }

              responseText += `   Usage: ${service.calls} calls\n\n`;
            }

            // Add helpful closing message
            if (services.length > 0) {
              responseText += `\n💡 Tip: To run a service calculation, call the tool shown above (e.g., spreadapi_calc_${services[0].id}). I'll guide you through the required parameters.`;
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

            responseText += `📥 INPUTS:\n`;
            for (const [key, value] of Object.entries(state.inputs)) {
              responseText += `  • ${key}: ${value}\n`;
            }

            responseText += `\n📊 OUTPUTS:\n`;
            // Handle both array and object formats
            if (Array.isArray(state.outputs)) {
              state.outputs.forEach(output => {
                const label = output.title || output.name || 'value';

                // Use formatString for proper presentation
                let displayValue;
                if (output.formatString) {
                  displayValue = formatValueWithExcelFormat(output.value, output.formatString);
                } else {
                  displayValue = output.value;
                }

                responseText += `  • ${label}: ${displayValue}\n`;
              });
            } else {
              for (const [key, value] of Object.entries(state.outputs)) {
                responseText += `  • ${key}: ${value}\n`;
              }
            }

            responseText += `\n💡 To recalculate with different inputs, use spreadapi_calc_${state.serviceId}`;
            responseText += `\n💾 To save a new variation, run the calculation and use spreadapi_save_state`;


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
                message: 'Access denied: This token has no service access configured',
                data: {
                  hint: 'Create a new token with specific services selected at https://spreadapi.io/app/profile',
                  requestedService: serviceId,
                  allowedServices: [],
                  documentation: 'https://spreadapi.io/docs/mcp/tokens'
                }
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
                message: `Access denied: Service "${serviceId}" is not accessible with this token`,
                data: {
                  requestedService: serviceId,
                  allowedServices: allowedServiceIds,
                  hint: `This token has access to: ${allowedServiceIds.join(', ')}. Use tools/list to see available services.`,
                  documentation: 'https://spreadapi.io/docs/mcp/tokens'
                }
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
                message: `Service "${serviceId}" not found or not published`,
                data: {
                  requestedService: serviceId,
                  hint: 'The service may have been deleted, unpublished, or the ID is incorrect. Use tools/list to see available services.',
                  allowedServices: allowedServiceIds
                }
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
            message: `Unknown tool: "${name}"`,
            data: {
              requestedTool: name,
              hint: 'Use tools/list to see all available tools. Common tools: spreadapi_calc, spreadapi_read_area, or service-specific tools.',
              availableGenericTools: ['spreadapi_calc', 'spreadapi_read_area'],
              documentation: 'https://spreadapi.io/docs/mcp/tools'
            }
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