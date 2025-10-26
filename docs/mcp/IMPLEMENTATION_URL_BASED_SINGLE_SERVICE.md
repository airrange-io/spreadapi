# Implementation Plan: URL-Based Single-Service MCP

**Goal:** Simplify MCP integration with URL-based service identification and service token authentication

**Status:** Planning Phase
**Created:** 2025-10-26
**Priority:** High - Significantly improves UX

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Existing Functionality Audit](#existing-functionality-audit)
4. [New Architecture Design](#new-architecture-design)
5. [Implementation Strategy](#implementation-strategy)
6. [Step-by-Step Implementation](#step-by-step-implementation)
7. [ChatGPT OAuth Flow (Simplified)](#chatgpt-oauth-flow-simplified)
8. [Claude Desktop Integration](#claude-desktop-integration)
9. [Migration & Backward Compatibility](#migration--backward-compatibility)
10. [Testing Strategy](#testing-strategy)
11. [Rollout Timeline](#rollout-timeline)
12. [What to Remove & When](#what-to-remove--when)

---

## Executive Summary

### Current Model Problems

**Multi-service with MCP tokens:**
- User must create MCP tokens
- AI doesn't know what MCP does until discovery calls
- 4+ round trips to first calculation
- Complex OAuth (multiple tokens, combined services)

### New Model Solution

**URL-based single-service with service tokens:**
```
URL: https://spreadapi.io/api/mcp/service/mortgage-calc
Token: [Optional - only if service needsToken: true]
```

**Benefits:**
- ✅ URL identifies service (no discovery)
- ✅ All metadata in initialize + tools/list
- ✅ Reuse existing service token security
- ✅ Much simpler OAuth (one service, one token)
- ✅ Zero MCP token creation needed
- ✅ 3 calls to first calculation (vs 4+)

### Rollout Strategy

**Recommendation: Implement both ChatGPT and Claude Desktop simultaneously**

**Why simultaneous:**
- New endpoints don't break old ones
- Can run parallel during transition
- Users migrate at their own pace
- Same backend code serves both

**ChatGPT gets URL-based first** (main focus):
- Most complex OAuth flow to simplify
- User enters URL directly in ChatGPT UI
- Biggest UX improvement

**Claude Desktop follows immediately:**
- Simple config update
- Uses same new endpoints
- Benefits from ChatGPT testing

---

## Architecture Overview

### New URL Structure

```
Old (Multi-Service):
https://spreadapi.io/api/mcp
  → Token determines which services
  → AI must discover services
  → AI must call get_service_details

New (Single-Service):
https://spreadapi.io/api/mcp/service/mortgage-calc
  → URL identifies service
  → Service metadata loaded immediately
  → AI has everything from tools/list
```

### Service Token Authentication

**Reuse existing service security model:**

```javascript
// Public service (no token needed)
service:mortgage-calc:published {
  needsToken: "false",
  // ... metadata
}

// Private service (token required)
service:tax-calc:published {
  needsToken: "true",
  // ... metadata
}
```

### Information Flow (New)

```
Step 1: initialize
  → Load service:mortgage-calc:published from Redis
  → Return: Full service description, AI guidance, examples
  → AI knows: "This is a Mortgage Calculator, here's what it does"

Step 2: tools/list
  → Build tool schema from service.inputs
  → Return: calculate tool with exact parameters
  → AI knows: "I need principal, interest_rate, years"

Step 3: tools/call
  → Calculate!
  → Return: Results with formatString applied
```

**Total: 3 calls (vs 4+ in old model)**

---

## Existing Functionality Audit

### Current Tools (8 Generic Tools)

| Tool | Keep? | Reason | New Name | Notes |
|------|-------|--------|----------|-------|
| `spreadapi_calc` | ✅ Transform | Primary calculation | `calculate` | No serviceId param needed |
| `spreadapi_get_service_details` | ❌ Remove | No discovery needed | N/A | Metadata in tools/list |
| `spreadapi_list_services` | ❌ Remove | Single service per URL | N/A | URL = service |
| `spreadapi_read_area` | ✅ Keep | Read editable areas | `read_{area_name}` | One tool per area |
| `spreadapi_batch` | ✅ Keep | Compare scenarios | `batch_calculate` | Still useful |
| `spreadapi_save_state` | ✅ Keep | State management | `save_calculation` | Works across services |
| `spreadapi_load_state` | ✅ Keep | State management | `load_calculation` | Works across services |
| `spreadapi_list_saved_states` | ✅ Keep | State management | `list_calculations` | Works across services |

**Result: Keep 6 tools, remove 2 discovery tools**

### Current Endpoints

| Endpoint | Keep? | Purpose | Status |
|----------|-------|---------|--------|
| `/api/mcp` | ✅ Keep | ChatGPT multi-service (legacy) | Backward compat |
| `/api/mcp/bridge` | ✅ Keep | Claude Desktop multi-service (legacy) | Backward compat |
| `/api/oauth/authorize` | 🔄 Update | ChatGPT OAuth | Simplify for single-service |
| `/api/oauth/token` | 🔄 Update | OAuth token exchange | Support service tokens |
| `/packages/spreadapi-mcp` | ✅ Keep | NPM bridge package | Update for URL-based |

**Add new:**
- `/api/mcp/service/[serviceId]` - New single-service endpoint (both ChatGPT & Claude)

### Current Data Structures

**Keep these:**
- ✅ `service:{id}:published` - Service metadata (source of truth)
- ✅ `mcp:state:{stateId}` - Saved calculations
- ✅ `mcp:user:{userId}:states` - User's saved states
- ✅ OAuth authorization codes
- ✅ OAuth tokens

**Can remove later:**
- 🕒 `mcp:token:{token}` - MCP tokens (after full migration)
- 🕒 `mcp:user:{userId}:tokens` - User's MCP tokens (after full migration)
- 🕒 `mcp:session:{sessionId}` - Sessions (simplified in new model)

---

## New Architecture Design

### 1. New Endpoint Structure

```
/Users/stephanmethner/AR/repos/spreadapi/
│
├── app/api/mcp/
│   ├── route.js                    # KEEP: Legacy multi-service (ChatGPT)
│   ├── bridge/
│   │   └── route.js                # KEEP: Legacy multi-service (Claude Desktop)
│   │
│   └── service/
│       └── [serviceId]/
│           └── route.js            # NEW: Single-service endpoint (both ChatGPT & Claude)
│
├── packages/spreadapi-mcp/
│   └── index.js                    # UPDATE: Support URL-based mode
│
└── app/api/oauth/
    ├── authorize/route.js          # UPDATE: Simplified for single-service
    └── token/route.js              # UPDATE: Service token support
```

### 2. Service-Specific MCP Endpoint

**File:** `/app/api/mcp/service/[serviceId]/route.js`

**Responsibilities:**
1. Load service metadata from Redis (once)
2. Handle initialize → return full service description
3. Handle tools/list → return tools with exact schemas
4. Handle tools/call → execute calculations/area reads/state management
5. Validate service token (if needsToken: true)

**Key difference from old bridge:**
- No token validation (uses service token instead)
- No service discovery (serviceId in URL)
- All metadata loaded at startup
- Simpler, focused on ONE service

### 3. Service Token Authentication

**Two modes:**

**Public Service (needsToken: false):**
```javascript
// No authentication required
// Works like public API endpoint
GET https://spreadapi.io/api/mcp/service/mortgage-calc
→ Anyone can use
```

**Private Service (needsToken: true):**
```javascript
// Service token required
POST /api/mcp/service/tax-calc
Authorization: Bearer service_abc123...

// Or via OAuth flow (ChatGPT)
// User enters service token during authorization
```

### 4. New Tool Structure

**For service with no areas:**

```javascript
{
  "tools": [
    {
      "name": "calculate",
      "description": "Calculate mortgage payment...",
      "inputSchema": {
        "type": "object",
        "properties": {
          "principal": { ... },      // From service.inputs[0]
          "interest_rate": { ... },  // From service.inputs[1]
          "years": { ... }           // From service.inputs[2]
        },
        "required": ["principal", "interest_rate", "years"]
      }
    },
    {
      "name": "batch_calculate",
      "description": "Compare multiple scenarios...",
      "inputSchema": { ... }
    },
    {
      "name": "save_calculation",
      "description": "Save calculation for later...",
      "inputSchema": { ... }
    },
    {
      "name": "load_calculation",
      "description": "Load saved calculation...",
      "inputSchema": { ... }
    },
    {
      "name": "list_calculations",
      "description": "List your saved calculations...",
      "inputSchema": { ... }
    }
  ]
}
```

**For service with editable areas:**

```javascript
{
  "tools": [
    {
      "name": "calculate",
      // ... same as above
    },
    {
      "name": "read_price_list",  // Specific area name
      "description": "Read product pricing data",
      "inputSchema": {
        "type": "object",
        "properties": {
          "includeFormulas": { "type": "boolean", "default": false },
          "includeFormatting": { "type": "boolean", "default": false }
        }
      }
    },
    {
      "name": "update_price_list",  // If area is writable
      "description": "Update product prices",
      "inputSchema": {
        "type": "object",
        "properties": {
          "changes": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "row": { "type": "number" },
                "col": { "type": "number" },
                "value": { }
              }
            }
          }
        }
      }
    },
    // ... state management tools
  ]
}
```

---

## Implementation Strategy

### Phase 1: Build New Endpoints (Parallel to Old)

**No breaking changes** - both systems run simultaneously

**Week 1-2:**
- Create `/api/mcp/service/[serviceId]/route.js`
- Implement service metadata loading
- Implement initialize handler
- Implement tools/list handler
- Implement tools/call handler (calculate, areas, state)

**Week 2-3:**
- Update OAuth authorize endpoint (support service tokens)
- Update OAuth token endpoint (service token validation)
- Update NPM bridge package (support URL-based mode)

**Week 3-4:**
- Testing (ChatGPT & Claude Desktop)
- Documentation updates
- User guides

### Phase 2: Rollout (Both Platforms Simultaneously)

**Week 4-5:**
- Deploy to staging
- Test with real services
- Deploy to production
- Announce new URL-based model

**Week 5-6:**
- Monitor usage
- Collect feedback
- Iterate on UX

### Phase 3: Migration Encouragement

**Month 2-3:**
- Show migration prompts in UI
- Highlight benefits (simpler, faster)
- Provide comparison examples

### Phase 4: Deprecation (Future - 6+ months)

**Month 6+:**
- Mark old endpoints as "legacy"
- Stop creating new MCP tokens in UI
- Keep backward compatibility indefinitely
- Remove old code when usage < 1%

---

## Step-by-Step Implementation

### Step 1: Create Service-Specific MCP Endpoint

**File:** `/app/api/mcp/service/[serviceId]/route.js`

```javascript
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { calculateDirect } from '@/app/api/v1/services/[id]/execute/calculateDirect';
import { readArea, updateArea } from '@/app/api/mcp/bridge/areaExecutors';

/**
 * Single-Service MCP Endpoint
 *
 * URL: /api/mcp/service/{serviceId}
 *
 * Provides MCP protocol for ONE specific service.
 * Service metadata loaded immediately - no discovery needed.
 * Authentication via service tokens (if service.needsToken: true)
 */

export async function POST(request, { params }) {
  const { serviceId } = await params;

  try {
    // Load service metadata ONCE
    const serviceData = await loadServiceMetadata(serviceId);

    if (!serviceData) {
      return jsonRpcError(-32001, 'Service not found or not published', null);
    }

    // Parse JSON-RPC request
    const body = await request.json();
    const { method, params: rpcParams, id: rpcId } = body;

    // Validate service token (if required)
    if (serviceData.needsToken) {
      const authResult = await validateServiceToken(request, serviceData);
      if (!authResult.valid) {
        return jsonRpcError(-32001, 'Authentication required', rpcId);
      }
    }

    // Route to appropriate handler
    switch (method) {
      case 'initialize':
        return handleInitialize(serviceData, rpcId);

      case 'tools/list':
        return handleToolsList(serviceData, rpcId);

      case 'tools/call':
        return handleToolCall(serviceData, rpcParams, rpcId);

      default:
        return jsonRpcError(-32601, `Method not found: ${method}`, rpcId);
    }
  } catch (error) {
    console.error('[MCP Service] Error:', error);
    return jsonRpcError(-32603, 'Internal error', null);
  }
}

/**
 * Load service metadata from Redis
 */
async function loadServiceMetadata(serviceId) {
  const data = await redis.hGetAll(`service:${serviceId}:published`);

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  // Parse JSON fields
  return {
    id: serviceId,
    title: data.title,
    description: data.description,
    category: data.category || '',

    // Schemas
    inputs: JSON.parse(data.inputs || '[]'),
    outputs: JSON.parse(data.outputs || '[]'),
    areas: JSON.parse(data.areas || '[]'),

    // AI guidance
    aiDescription: data.aiDescription || '',
    aiUsageGuidance: data.aiUsageGuidance || '',
    aiUsageExamples: JSON.parse(data.aiUsageExamples || '[]'),
    aiTags: JSON.parse(data.aiTags || '[]'),

    // Settings
    needsToken: data.needsToken === 'true',
    useCaching: data.useCaching === 'true',

    // Stats
    created: data.created,
    calls: parseInt(data.calls || '0')
  };
}

/**
 * Validate service token (if service requires it)
 */
async function validateServiceToken(request, serviceData) {
  // If service is public, no token needed
  if (!serviceData.needsToken) {
    return { valid: true };
  }

  // Check for service token in Authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing authorization header' };
  }

  const token = authHeader.substring(7);

  // Validate service token exists
  const tokenData = await redis.hGetAll(`service:${serviceData.id}:token:${token}`);

  if (!tokenData || Object.keys(tokenData).length === 0) {
    return { valid: false, error: 'Invalid service token' };
  }

  if (tokenData.isActive !== 'true') {
    return { valid: false, error: 'Service token is inactive' };
  }

  // Update usage stats
  await redis.hSet(`service:${serviceData.id}:token:${token}`, {
    lastUsed: new Date().toISOString()
  });
  await redis.hIncrBy(`service:${serviceData.id}:token:${token}`, 'requests', 1);

  return { valid: true, userId: tokenData.userId };
}

/**
 * Handle initialize request
 */
function handleInitialize(serviceData, rpcId) {
  const instructions = buildServiceInstructions(serviceData);

  return NextResponse.json({
    jsonrpc: '2.0',
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: { listChanged: false }  // Tools are static for this service
      },
      serverInfo: {
        name: serviceData.title,
        version: '1.0.0',
        description: serviceData.description,
        instructions: instructions
      }
    },
    id: rpcId
  });
}

/**
 * Build comprehensive AI instructions
 */
function buildServiceInstructions(serviceData) {
  const { title, aiDescription, aiUsageGuidance, aiUsageExamples, inputs, outputs } = serviceData;

  let instructions = `🎯 ${title.toUpperCase()}\n\n`;

  // Purpose
  if (aiDescription) {
    instructions += `PURPOSE:\n${aiDescription}\n\n`;
  } else {
    instructions += `PURPOSE:\n${serviceData.description}\n\n`;
  }

  // Usage guidance
  if (aiUsageGuidance) {
    instructions += `⚠️  IMPORTANT:\n${aiUsageGuidance}\n\n`;
  }

  // Check for percentage inputs
  const hasPercentage = inputs.some(i =>
    i.format === 'percentage' || i.formatString?.includes('%')
  );

  if (hasPercentage) {
    instructions += `⚠️  CRITICAL - PERCENTAGE VALUES:\n`;
    instructions += `ALWAYS convert percentages to decimals (divide by 100):\n`;
    instructions += `• "5%" → 0.05 (NOT 5)\n`;
    instructions += `• "42%" → 0.42 (NOT 42)\n\n`;
  }

  // Inputs summary
  instructions += `📥 INPUTS NEEDED:\n`;
  inputs.forEach(input => {
    const req = input.mandatory ? '[REQUIRED]' : '[OPTIONAL]';
    instructions += `• ${input.title || input.name} ${req}`;
    if (input.description) {
      instructions += ` - ${input.description}`;
    }
    if (input.min !== undefined || input.max !== undefined) {
      instructions += ` (${input.min} to ${input.max})`;
    }
    instructions += `\n`;
  });
  instructions += `\n`;

  // Outputs summary
  instructions += `📊 OUTPUTS PROVIDED:\n`;
  outputs.forEach(output => {
    instructions += `• ${output.title || output.name}`;
    if (output.formatString) {
      instructions += ` - formatString: "${output.formatString}"`;
    }
    instructions += `\n`;
  });
  instructions += `\n`;

  // Examples
  if (aiUsageExamples && aiUsageExamples.length > 0) {
    instructions += `💡 EXAMPLES:\n`;
    aiUsageExamples.forEach(example => {
      instructions += `• ${example}\n`;
    });
    instructions += `\n`;
  }

  // Workflow
  instructions += `🚀 WORKFLOW:\n`;
  instructions += `1. When user provides values → Call calculate immediately\n`;
  instructions += `2. Present results using formatString for proper formatting\n`;
  instructions += `3. For comparing scenarios → Use batch_calculate\n`;
  instructions += `4. For saving scenarios → Use save_calculation\n\n`;

  instructions += `⚡ BE DIRECT:\n`;
  instructions += `• Don't ask permission - just calculate when you have values\n`;
  instructions += `• This is STATELESS - each calculation is independent\n`;
  instructions += `• Use save_calculation to remember scenarios for comparison\n`;

  return instructions;
}

/**
 * Handle tools/list request
 */
function handleToolsList(serviceData, rpcId) {
  const tools = buildServiceTools(serviceData);

  return NextResponse.json({
    jsonrpc: '2.0',
    result: { tools },
    id: rpcId
  });
}

/**
 * Build tools for this service
 */
function buildServiceTools(serviceData) {
  const tools = [];
  const { inputs, outputs, areas } = serviceData;

  // 1. Primary calculation tool
  tools.push({
    name: 'calculate',
    description: buildCalculateDescription(serviceData),
    inputSchema: buildInputSchema(inputs)
  });

  // 2. Batch calculation tool
  tools.push({
    name: 'batch_calculate',
    description: buildBatchDescription(serviceData),
    inputSchema: {
      type: 'object',
      properties: {
        scenarios: {
          type: 'array',
          description: 'Array of scenarios to calculate',
          items: {
            type: 'object',
            properties: {
              label: {
                type: 'string',
                description: 'Descriptive name for this scenario'
              },
              inputs: {
                type: 'object',
                description: 'Input parameters for this scenario'
              }
            },
            required: ['label', 'inputs']
          },
          minItems: 2,
          maxItems: 10
        },
        compareOutputs: {
          type: 'array',
          description: 'Which outputs to include in comparison table',
          items: { type: 'string' }
        }
      },
      required: ['scenarios']
    }
  });

  // 3. Area tools (if service has editable areas)
  if (areas && areas.length > 0) {
    areas.forEach(area => {
      // Read area tool
      tools.push({
        name: `read_${area.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        description: buildAreaReadDescription(area, serviceData.title),
        inputSchema: {
          type: 'object',
          properties: {
            includeFormulas: {
              type: 'boolean',
              description: 'Include cell formulas',
              default: false
            },
            includeFormatting: {
              type: 'boolean',
              description: 'Include cell formatting',
              default: false
            }
          }
        }
      });

      // Update area tool (if writable)
      if (area.permissions?.canWriteValues) {
        tools.push({
          name: `update_${area.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          description: buildAreaUpdateDescription(area, serviceData.title),
          inputSchema: {
            type: 'object',
            properties: {
              changes: {
                type: 'array',
                description: 'Cell changes to apply',
                items: {
                  type: 'object',
                  properties: {
                    row: { type: 'number', description: 'Row index (0-based)' },
                    col: { type: 'number', description: 'Column index (0-based)' },
                    value: { description: 'New cell value' }
                  },
                  required: ['row', 'col', 'value']
                }
              }
            },
            required: ['changes']
          }
        });
      }
    });
  }

  // 4. State management tools
  tools.push({
    name: 'save_calculation',
    description: `Save a ${serviceData.title} calculation for later comparison or reuse`,
    inputSchema: {
      type: 'object',
      properties: {
        inputs: {
          type: 'object',
          description: 'The input parameters you used'
        },
        outputs: {
          type: 'object',
          description: 'The calculation results'
        },
        label: {
          type: 'string',
          description: 'Descriptive name for this calculation (e.g., "30-year fixed", "aggressive scenario")'
        },
        ttl: {
          type: 'number',
          description: 'Time-to-live in seconds (default: 3600 = 1 hour, use 86400 for 24 hours)',
          default: 3600
        }
      },
      required: ['inputs', 'outputs', 'label']
    }
  });

  tools.push({
    name: 'load_calculation',
    description: 'Load a previously saved calculation to compare or reuse',
    inputSchema: {
      type: 'object',
      properties: {
        stateId: {
          type: 'string',
          description: 'The state ID returned from save_calculation'
        }
      },
      required: ['stateId']
    }
  });

  tools.push({
    name: 'list_calculations',
    description: `List your saved ${serviceData.title} calculations`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of calculations to return',
          default: 10,
          maximum: 50
        }
      }
    }
  });

  return tools;
}

/**
 * Build calculate tool description
 */
function buildCalculateDescription(serviceData) {
  const { title, outputs } = serviceData;

  let desc = `Calculate ${title}\n\n`;

  // Output summary
  desc += `📊 Returns:\n`;
  outputs.forEach(output => {
    desc += `• ${output.title || output.name}`;
    if (output.formatString) {
      desc += ` (formatted as: "${output.formatString}")`;
    }
    desc += `\n`;
  });

  desc += `\n⚡ Fast: Typically completes in <100ms\n`;
  desc += `\n🔄 Stateless: Each calculation is independent - provide all inputs`;

  return desc;
}

/**
 * Build batch calculate description
 */
function buildBatchDescription(serviceData) {
  return `Compare multiple ${serviceData.title} scenarios side-by-side\n\nPerfect for "what-if" analysis - calculate 2-10 scenarios at once and get a comparison table.\n\nExample: Compare 15-year vs 30-year mortgage, or conservative vs aggressive investment strategies.`;
}

/**
 * Build area read description
 */
function buildAreaReadDescription(area, serviceTitle) {
  let desc = `Read ${area.name} data from ${serviceTitle}\n\n`;

  if (area.aiContext?.purpose) {
    desc += `Purpose: ${area.aiContext.purpose}\n`;
  }

  desc += `\nArea: ${area.address}\n`;
  desc += `Mode: ${area.mode}\n`;

  if (area.description) {
    desc += `\n${area.description}`;
  }

  return desc;
}

/**
 * Build area update description
 */
function buildAreaUpdateDescription(area, serviceTitle) {
  let desc = `Update ${area.name} data in ${serviceTitle}\n\n`;

  if (area.aiContext?.expectedBehavior) {
    desc += `${area.aiContext.expectedBehavior}\n\n`;
  }

  desc += `After updating, the area data will be saved and used in subsequent calculations.`;

  return desc;
}

/**
 * Build input schema from service inputs
 */
function buildInputSchema(inputs) {
  const properties = {};
  const required = [];

  inputs.forEach(input => {
    const prop = {
      type: input.type,
      description: input.description || input.title || input.name
    };

    // Add constraints
    if (input.min !== undefined) prop.minimum = input.min;
    if (input.max !== undefined) prop.maximum = input.max;
    if (input.allowedValues) prop.enum = input.allowedValues;
    if (input.defaultValue !== undefined) prop.default = input.defaultValue;

    // Add format hints
    if (input.format === 'percentage') {
      prop.description += ' (Enter as decimal: 0.05 for 5%, 0.42 for 42%)';
    } else if (input.type === 'boolean') {
      prop.description += ' (true/false, yes/no, 1/0 accepted)';
    }

    properties[input.name] = prop;

    if (input.mandatory) {
      required.push(input.name);
    }
  });

  return {
    type: 'object',
    properties,
    required
  };
}

/**
 * Handle tools/call request
 */
async function handleToolCall(serviceData, params, rpcId) {
  const { name, arguments: args } = params;

  try {
    // Route to appropriate executor
    if (name === 'calculate') {
      return await executeCalculate(serviceData, args, rpcId);
    }

    if (name === 'batch_calculate') {
      return await executeBatchCalculate(serviceData, args, rpcId);
    }

    if (name.startsWith('read_')) {
      return await executeAreaRead(serviceData, name, args, rpcId);
    }

    if (name.startsWith('update_')) {
      return await executeAreaUpdate(serviceData, name, args, rpcId);
    }

    if (name === 'save_calculation') {
      return await executeSaveCalculation(serviceData, args, rpcId);
    }

    if (name === 'load_calculation') {
      return await executeLoadCalculation(serviceData, args, rpcId);
    }

    if (name === 'list_calculations') {
      return await executeListCalculations(serviceData, args, rpcId);
    }

    return jsonRpcError(-32601, `Unknown tool: ${name}`, rpcId);
  } catch (error) {
    console.error('[MCP Service] Tool call error:', error);
    return jsonRpcError(-32603, `Tool execution failed: ${error.message}`, rpcId);
  }
}

/**
 * Execute calculate tool
 */
async function executeCalculate(serviceData, args, rpcId) {
  // Call existing calculation logic
  const result = await calculateDirect(serviceData.id, args, null, {
    nocache: false
  });

  if (result.error) {
    return jsonRpcError(-32603, result.message || result.error, rpcId);
  }

  // Format response
  let text = `✅ ${serviceData.title} - Calculation Complete\n\n`;
  text += `📊 Results:\n`;

  result.outputs.forEach(output => {
    const value = formatOutputValue(output.value, output.formatString);
    text += `  • ${output.title || output.name}: ${value}\n`;
  });

  text += `\n⚡ Completed in ${result.metadata?.executionTime || 0}ms`;

  if (result.metadata?.cached) {
    text += ` (cached)`;
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    result: {
      content: [{
        type: 'text',
        text: text
      }]
    },
    id: rpcId
  });
}

/**
 * Execute batch calculate
 */
async function executeBatchCalculate(serviceData, args, rpcId) {
  const { scenarios, compareOutputs } = args;

  const results = [];

  // Execute each scenario
  for (const scenario of scenarios) {
    const result = await calculateDirect(serviceData.id, scenario.inputs);

    if (result.error) {
      return jsonRpcError(-32603, `Scenario "${scenario.label}" failed: ${result.message}`, rpcId);
    }

    results.push({
      label: scenario.label,
      inputs: scenario.inputs,
      outputs: result.outputs
    });
  }

  // Build comparison response
  let text = `▶ Batch Calculation Results - ${serviceData.title}\n\n`;

  // Individual results
  results.forEach(result => {
    text += `### ${result.label}\n`;
    result.outputs.forEach(output => {
      const value = formatOutputValue(output.value, output.formatString);
      text += `${output.title || output.name}: ${value}\n`;
    });
    text += `\n`;
  });

  // Comparison table
  if (compareOutputs && compareOutputs.length > 0) {
    text += `### Comparison Table\n\n`;
    text += `| Scenario | ${compareOutputs.join(' | ')} |\n`;
    text += `|----------|${compareOutputs.map(() => '----------').join('|')}|\n`;

    results.forEach(result => {
      text += `| ${result.label} |`;
      compareOutputs.forEach(outputName => {
        const output = result.outputs.find(o => o.name === outputName);
        if (output) {
          const value = formatOutputValue(output.value, output.formatString);
          text += ` ${value} |`;
        } else {
          text += ` N/A |`;
        }
      });
      text += `\n`;
    });
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    result: {
      content: [{
        type: 'text',
        text: text
      }]
    },
    id: rpcId
  });
}

/**
 * Execute area read
 */
async function executeAreaRead(serviceData, toolName, args, rpcId) {
  // Extract area name from tool name
  const areaName = toolName.replace('read_', '').replace(/_/g, ' ');

  // Find area in service metadata
  const area = serviceData.areas.find(a =>
    a.name.toLowerCase() === areaName.toLowerCase()
  );

  if (!area) {
    return jsonRpcError(-32602, `Area "${areaName}" not found`, rpcId);
  }

  // Execute area read
  const result = await readArea(serviceData.id, area.name, args);

  if (result.error) {
    return jsonRpcError(-32603, result.error, rpcId);
  }

  // Format response
  let text = `📋 ${area.name} - ${serviceData.title}\n\n`;
  text += `Address: ${area.address}\n`;
  text += `Mode: ${area.mode}\n`;

  if (area.description) {
    text += `\n${area.description}\n`;
  }

  text += `\nData:\n`;
  text += formatAreaData(result.data, args.includeFormulas, args.includeFormatting);

  return NextResponse.json({
    jsonrpc: '2.0',
    result: {
      content: [{
        type: 'text',
        text: text
      }]
    },
    id: rpcId
  });
}

/**
 * Execute area update
 */
async function executeAreaUpdate(serviceData, toolName, args, rpcId) {
  // Extract area name from tool name
  const areaName = toolName.replace('update_', '').replace(/_/g, ' ');

  // Find area in service metadata
  const area = serviceData.areas.find(a =>
    a.name.toLowerCase() === areaName.toLowerCase()
  );

  if (!area) {
    return jsonRpcError(-32602, `Area "${areaName}" not found`, rpcId);
  }

  // Check permissions
  if (!area.permissions?.canWriteValues) {
    return jsonRpcError(-32602, `Area "${area.name}" is read-only`, rpcId);
  }

  // Execute area update
  const result = await updateArea(serviceData.id, area.name, args.changes);

  if (result.error) {
    return jsonRpcError(-32603, result.error, rpcId);
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    result: {
      content: [{
        type: 'text',
        text: `✅ Updated ${area.name}\n\n${args.changes.length} cell(s) updated successfully.\n\n💡 The changes have been saved and will be used in subsequent calculations.`
      }]
    },
    id: rpcId
  });
}

/**
 * Execute save calculation
 */
async function executeSaveCalculation(serviceData, args, rpcId) {
  const { inputs, outputs, label, ttl = 3600 } = args;

  const stateId = `state_${crypto.randomBytes(16).toString('hex')}`;

  await redis.hSet(`mcp:state:${stateId}`, {
    serviceId: serviceData.id,
    serviceName: serviceData.title,
    inputs: JSON.stringify(inputs),
    outputs: JSON.stringify(outputs),
    label: label,
    created: new Date().toISOString()
  });

  await redis.expire(`mcp:state:${stateId}`, ttl);

  // Note: No userId tracking in URL-based model (stateless)

  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

  return NextResponse.json({
    jsonrpc: '2.0',
    result: {
      content: [{
        type: 'text',
        text: `✅ Saved calculation: "${label}"\n\nState ID: ${stateId}\nExpires: ${expiresAt}\n\n💡 Load this later with:\nload_calculation({ stateId: "${stateId}" })`
      }]
    },
    id: rpcId
  });
}

/**
 * Execute load calculation
 */
async function executeLoadCalculation(serviceData, args, rpcId) {
  const { stateId } = args;

  const stateData = await redis.hGetAll(`mcp:state:${stateId}`);

  if (!stateData || Object.keys(stateData).length === 0) {
    return jsonRpcError(-32602, 'Calculation not found or expired', rpcId);
  }

  const inputs = JSON.parse(stateData.inputs);
  const outputs = JSON.parse(stateData.outputs);

  let text = `📋 Loaded calculation: "${stateData.label}"\n\n`;
  text += `Service: ${stateData.serviceName}\n`;
  text += `Created: ${stateData.created}\n\n`;

  text += `📥 INPUTS:\n`;
  Object.entries(inputs).forEach(([key, value]) => {
    text += `  • ${key}: ${value}\n`;
  });

  text += `\n📊 OUTPUTS:\n`;
  Object.entries(outputs).forEach(([key, value]) => {
    text += `  • ${key}: ${value}\n`;
  });

  text += `\n💡 To recalculate with different inputs, use calculate()\n`;
  text += `💾 To save a new variation, use save_calculation()`;

  return NextResponse.json({
    jsonrpc: '2.0',
    result: {
      content: [{
        type: 'text',
        text: text
      }]
    },
    id: rpcId
  });
}

/**
 * Execute list calculations
 */
async function executeListCalculations(serviceData, args, rpcId) {
  const { limit = 10 } = args;

  // Scan for states matching this service
  // Note: This is simplified - in production, you'd want better indexing
  const pattern = 'mcp:state:*';
  const states = [];

  // This is a simplified implementation
  // In production, you'd want to use a Set to track user states
  // For now, we'll note this limitation

  let text = `📋 Saved Calculations - ${serviceData.title}\n\n`;
  text += `⚠️  Note: State persistence requires authentication\n`;
  text += `For now, states are temporary (1-24 hours based on TTL)\n\n`;
  text += `💡 Save calculations during your session with save_calculation()`;

  return NextResponse.json({
    jsonrpc: '2.0',
    result: {
      content: [{
        type: 'text',
        text: text
      }]
    },
    id: rpcId
  });
}

/**
 * Format output value with formatString
 */
function formatOutputValue(value, formatString) {
  if (!formatString) return value;

  // Simple formatting (could be enhanced)
  if (formatString.includes('$')) {
    return `$${parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  if (formatString.includes('€')) {
    return `€${parseFloat(value).toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  if (formatString.includes('%')) {
    return `${(parseFloat(value) * 100).toFixed(2)}%`;
  }

  return value;
}

/**
 * Format area data
 */
function formatAreaData(data, includeFormulas, includeFormatting) {
  // Simple table formatting
  let text = '';

  if (Array.isArray(data)) {
    data.forEach((row, rowIndex) => {
      text += `Row ${rowIndex + 1}: `;
      if (Array.isArray(row)) {
        text += row.join(', ');
      }
      text += `\n`;
    });
  }

  return text;
}

/**
 * JSON-RPC error response
 */
function jsonRpcError(code, message, id) {
  return NextResponse.json({
    jsonrpc: '2.0',
    error: {
      code,
      message
    },
    id
  });
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request) {
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
```

This is a massive file! Let me continue with the other steps in a follow-up message, or would you like me to create a separate continuation document?