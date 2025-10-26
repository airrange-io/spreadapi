# Migration Plan: Multi-Service → Single-Service MCP

**Status:** Planning Phase
**Created:** 2025-10-26
**Goal:** Simplify MCP token model while preserving all functionality

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Target State Design](#target-state-design)
4. [What Changes vs What Stays](#what-changes-vs-what-stays)
5. [Migration Strategy](#migration-strategy)
6. [Step-by-Step Implementation](#step-by-step-implementation)
7. [Code Changes Required](#code-changes-required)
8. [Testing Strategy](#testing-strategy)
9. [Rollback Plan](#rollback-plan)
10. [Timeline & Phases](#timeline--phases)

---

## Executive Summary

### Problem with Multi-Service Model

**Too Complex for AI:**
```
Token → tools/list → get_service_details (×N) → Choose service → Calculate
```

**AI confusion:**
- "Which service should I use?"
- "Do I need to discover services?"
- Generic token - no clear purpose

### Single-Service Solution

**Direct and Clear:**
```
Token → Calculate (all info already available)
```

**AI clarity:**
- Token is FOR a specific calculator
- No discovery needed
- Immediate understanding of purpose

### Critical Requirements

✅ **MUST preserve:**
- OAuth flow for ChatGPT (token-based, PKCE, etc.)
- All 8 MCP tools (especially state management)
- Backward compatibility during transition
- Claude Desktop vs ChatGPT differences
- Multi-token support in ChatGPT OAuth

✅ **MUST improve:**
- Token clarity and purpose
- AI guidance specificity
- Time to first calculation
- User experience (marketplace)

---

## Current State Analysis

### 1. Token Data Model (Multi-Service)

**Redis:** `mcp:token:{token}`

```javascript
{
  name: "Production Access",
  description: "For customer X",
  userId: "user_abc123",
  created: "2025-10-26T00:00:00Z",
  lastUsed: "2025-10-26T12:34:56Z",
  requests: 1523,
  isActive: "true",
  serviceIds: JSON.stringify([
    "mortgage-calc",
    "tax-calc",
    "roi-calc"
  ])  // ← Array of multiple services
}
```

### 2. OAuth Token Model (Multi-Service)

**Redis:** `oauth:token:{oat_token}`

```javascript
{
  mcp_tokens: JSON.stringify([
    "spapi_live_abc...",
    "spapi_live_xyz..."
  ]),
  client_id: "chatgpt-uuid",
  user_id: "user_abc123",
  scope: "mcp:read mcp:write",
  service_ids: JSON.stringify([1, 2, 3, 4, 5, 6]), // Combined from all MCP tokens
  authorized_at: "timestamp"
}
```

### 3. Tool Discovery Flow (Current)

**Claude Desktop startup:**
```
1. MCP package starts with SPREADAPI_TOKEN
2. Calls: tools/list
3. Bridge validates token → gets serviceIds: [A, B, C]
4. Bridge builds tools for services A, B, C
5. Returns: spreadapi_calc, spreadapi_batch, etc. with all services listed
6. AI sees: "You have access to 3 services..."
```

**ChatGPT startup:**
```
1. OAuth flow (user pastes multiple tokens)
2. Token exchange → OAuth token maps to multiple MCP tokens
3. Calls: initialize, tools/list
4. Bridge validates OAuth token → gets combined serviceIds
5. Same multi-service tool list as Claude
```

### 4. Current Tools (8 Generic)

✅ **Keep all of these:**
- `spreadapi_calc(serviceId, inputs, ...)`
- `spreadapi_get_service_details(serviceId)`
- `spreadapi_list_services(...)`
- `spreadapi_read_area(serviceId, areaName, ...)`
- `spreadapi_batch(calculations[], ...)`
- `spreadapi_save_state(serviceId, inputs, outputs, label, ttl)`
- `spreadapi_load_state(stateId)`
- `spreadapi_list_saved_states(serviceId?, limit)`

**Problem:** All tools require `serviceId` parameter → AI must choose

### 5. Current AI Guidance

**Generic multi-service instructions:**
```
🎯 YOUR ROLE: Helpful calculation assistant

Available services:
• Mortgage Calculator (mortgage-calc)
• Tax Calculator (tax-calc)
• ROI Calculator (roi-calc)

Choose the appropriate service for the user's request...
```

**Problem:** AI must figure out which service to use

---

## Target State Design

### 1. Token Data Model (Single-Service)

**Redis:** `mcp:token:{token}`

```javascript
{
  // Token metadata (same as before)
  name: "Mortgage Calculator",
  description: "Calculate monthly payments and amortization",
  userId: "user_abc123",
  created: "2025-10-26T00:00:00Z",
  lastUsed: "2025-10-26T12:34:56Z",
  requests: 1523,
  isActive: "true",

  // NEW: Single service (not array)
  serviceId: "mortgage-calc",  // ← Single service, not array

  // NEW: Embedded service metadata (for zero-discovery)
  serviceName: "Mortgage Payment Calculator",
  serviceDescription: "Calculate monthly mortgage payments, total interest, and amortization schedules",
  serviceCategory: "finance",

  // NEW: Embedded inputs/outputs (AI knows immediately)
  inputs: JSON.stringify([...]),   // Full input schema
  outputs: JSON.stringify([...]),  // Full output schema
  areas: JSON.stringify([...]),    // Editable areas if any

  // NEW: AI guidance (specialized for this service)
  aiDescription: "Use when user asks about mortgages, home loans, or monthly payments",
  aiUsageGuidance: "Always convert percentage to decimal (5% → 0.05). Ask for loan amount, interest rate, and term.",
  aiUsageExamples: JSON.stringify([
    "Calculate 5% interest on $100,000 for 30 years",
    "What's my monthly payment for a $250k mortgage?"
  ]),
  aiTags: JSON.stringify(["finance", "mortgage", "loan", "real-estate"])
}
```

**Key Changes:**
- ✅ `serviceId` (singular) instead of `serviceIds` (array)
- ✅ Service metadata embedded in token
- ✅ AI guidance embedded in token
- ✅ Zero external calls needed - everything in token

### 2. OAuth Token Model (Single-Service)

**No changes needed!** OAuth can still combine multiple single-service MCP tokens:

```javascript
// User pastes 3 single-service tokens:
Token A: { serviceId: "mortgage-calc", ... }
Token B: { serviceId: "tax-calc", ... }
Token C: { serviceId: "roi-calc", ... }

// OAuth token stores all 3:
{
  mcp_tokens: JSON.stringify([
    "spapi_live_abc...",  // mortgage
    "spapi_live_xyz...",  // tax
    "spapi_live_def..."   // roi
  ]),
  service_ids: JSON.stringify([
    "mortgage-calc",
    "tax-calc",
    "roi-calc"
  ])  // Still combined
}
```

**Important:** OAuth flow **unchanged** - still accepts multiple tokens!

### 3. Tool Discovery Flow (New)

**Claude Desktop startup (Single-Service):**
```
1. MCP package starts with SPREADAPI_TOKEN
2. Calls: initialize
3. Bridge validates token → gets embedded service metadata
4. Bridge builds tools ONLY for this ONE service
5. Returns: Tools specialized for "Mortgage Calculator"
6. AI sees: "This is a mortgage calculator. Here's how to use it..."
```

**No tools/list needed!** Everything in initialize response.

**ChatGPT startup (Single-Service, Multiple Tokens):**
```
1. OAuth flow (user pastes 3 single-service tokens)
2. Token exchange → OAuth token maps to 3 MCP tokens
3. Calls: initialize, tools/list
4. Bridge validates each MCP token → gets 3 service metadata
5. Returns: Tools for all 3 services (but clearly separated)
6. AI sees: "You have 3 specialized calculators: Mortgage, Tax, ROI"
```

**Key difference:** Each service is clearly identified with full metadata

### 4. New Tools (Simplified)

**Primary calculation tool (no serviceId needed for single-service tokens):**

```javascript
// For Claude Desktop (single token)
{
  name: "calculate_mortgage",  // Specific name!
  description: "Calculate monthly mortgage payments...",
  inputSchema: {
    // Direct parameters - NO serviceId!
    interest_rate: { type: "number", ... },
    principal: { type: "number", ... },
    years: { type: "number", ... }
  }
}
```

**For ChatGPT (multi-token = multiple calculators):**

```javascript
// Keep generic wrapper
{
  name: "spreadapi_calc",
  description: "Calculate using one of your specialized calculators...",
  inputSchema: {
    serviceId: {
      enum: ["mortgage-calc", "tax-calc", "roi-calc"],
      description: "Which calculator:\n• mortgage-calc: Mortgage Calculator\n• tax-calc: Tax Calculator\n• roi-calc: ROI Calculator"
    },
    inputs: { ... }
  }
}
```

**State management tools (keep as-is):**
- ✅ `spreadapi_save_state` - Works across all services
- ✅ `spreadapi_load_state` - Works across all services
- ✅ `spreadapi_list_saved_states` - Can filter by service

**Area tools (specialized for single-service):**

```javascript
// Claude Desktop (single service with areas)
{
  name: "read_price_list",  // Specific!
  description: "Read the product price list area",
  inputSchema: {
    // NO serviceId or areaName needed!
    includeFormulas: { ... },
    includeFormatting: { ... }
  }
}
```

### 5. New AI Guidance (Specialized)

**For single-service token:**

```
🎯 YOU ARE: A Mortgage Calculator Assistant

This MCP provides ONE specialized calculator: Mortgage Payment Calculator

PURPOSE:
Calculate monthly mortgage payments, total interest, and amortization schedules for home loans.

WHEN TO USE:
• User asks about mortgages, home buying, or monthly payments
• User wants to compare different loan terms
• User needs amortization schedules

HOW TO CALCULATE:
1. If user provides values → Call calculate_mortgage immediately
2. If missing values → Ask for: loan amount, interest rate, term

⚠️  CRITICAL - PERCENTAGE VALUES:
Interest rate MUST be decimal: 5% = 0.05 (NOT 5)

📊 OUTPUTS:
• Monthly Payment - formatString: "$#,##0.00"
• Total Interest - formatString: "$#,##0.00"
• Total Paid - formatString: "$#,##0.00"

💡 EXAMPLES:
• "Calculate 5% interest on $100,000 for 30 years"
• "What's my monthly payment on a $250k mortgage at 4.5%?"

🚀 BE DIRECT:
Skip asking "Would you like me to calculate?" - just do it!
```

**Much clearer!** AI knows exactly what this MCP does.

---

## What Changes vs What Stays

### ✅ STAYS THE SAME (No Changes)

#### 1. OAuth Flow (ChatGPT)
- ✅ Authorization endpoint (`/api/oauth/authorize`)
- ✅ Token exchange endpoint (`/api/oauth/token`)
- ✅ PKCE validation
- ✅ Multi-token support (paste multiple tokens)
- ✅ OAuth discovery endpoints
- ✅ Token-based flow (no login)
- ✅ 12-hour OAuth token expiry
- ✅ Service ID aggregation

**No OAuth code changes needed!**

#### 2. Service Execution Logic
- ✅ `calculateDirect()` function
- ✅ Service API endpoints (`/api/v1/services/{id}/execute`)
- ✅ Result caching (Redis)
- ✅ Rate limiting
- ✅ Analytics tracking
- ✅ Format string preservation
- ✅ Area execution logic

**No execution code changes needed!**

#### 3. MCP Bridge Endpoint
- ✅ JSON-RPC 2.0 handler
- ✅ Authentication middleware (`mcpAuthMiddleware`)
- ✅ Session management (ChatGPT)
- ✅ Error handling
- ✅ Tool execution logic

**Bridge structure stays - only tool building changes!**

#### 4. State Management Tools
- ✅ `spreadapi_save_state` - Works the same
- ✅ `spreadapi_load_state` - Works the same
- ✅ `spreadapi_list_saved_states` - Works the same
- ✅ Redis state storage keys

**State management completely unchanged!**

#### 5. NPM Package (Claude Desktop)
- ✅ stdio-to-HTTP bridge
- ✅ Environment variables (`SPREADAPI_TOKEN`)
- ✅ MCP SDK integration
- ✅ Request/response handling

**Package code unchanged!**

### 🔄 CHANGES (Updates Needed)

#### 1. Token Data Model
- 🔄 `serviceIds` (array) → `serviceId` (string)
- ➕ Add embedded service metadata
- ➕ Add embedded AI guidance
- ➕ Add embedded inputs/outputs

#### 2. Token Creation UI
- 🔄 Change from multi-select to single-select
- 🔄 Update validation (require serviceId)
- ➕ Add preview of embedded metadata
- ➕ Add token naming suggestions

#### 3. Token Validation Logic
- 🔄 `validateToken()` returns `serviceId` (singular)
- 🔄 Permission check: one service instead of array
- ➕ Return embedded metadata

#### 4. Tool Building (Bridge)
- 🔄 Build specialized tools for single service
- 🔄 Build generic tools for OAuth multi-token
- 🔄 AI guidance: specialized vs multi-service
- ➕ Tool naming: specific names for single service

#### 5. AI Instructions
- 🔄 Single-service specialized guidance
- 🔄 Multi-service guidance (OAuth only)
- ➕ Purpose-specific descriptions

---

## Migration Strategy

### Phase 1: Dual-Mode Support (Backward Compatible)

**Support BOTH models simultaneously:**

```javascript
// Token validation
async function validateToken(token) {
  const metadata = await redis.hGetAll(`mcp:token:${token}`);

  // Detect which model
  const isSingleService = metadata.serviceId && !metadata.serviceIds;
  const isMultiService = metadata.serviceIds && !metadata.serviceId;

  if (isSingleService) {
    return {
      valid: true,
      userId: metadata.userId,
      serviceId: metadata.serviceId,  // Singular
      mode: 'single-service',
      // Include embedded metadata
      serviceName: metadata.serviceName,
      inputs: JSON.parse(metadata.inputs || '[]'),
      outputs: JSON.parse(metadata.outputs || '[]'),
      aiDescription: metadata.aiDescription,
      // ...
    };
  } else if (isMultiService) {
    return {
      valid: true,
      userId: metadata.userId,
      serviceIds: JSON.parse(metadata.serviceIds),  // Array
      mode: 'multi-service'
    };
  }
}
```

**Tool building adapts:**

```javascript
// In bridge handler
if (auth.mode === 'single-service') {
  // Build specialized tools for ONE service
  tools = buildSingleServiceTools(auth);
} else {
  // Build generic tools for MULTIPLE services (legacy)
  tools = buildMultiServiceTools(auth);
}
```

### Phase 2: Migration Tools

**Provide migration utilities:**

```javascript
// Admin tool: Convert multi → single
async function splitMultiServiceToken(multiToken) {
  const metadata = await redis.hGetAll(`mcp:token:${multiToken}`);
  const serviceIds = JSON.parse(metadata.serviceIds);

  const newTokens = [];

  for (const serviceId of serviceIds) {
    const serviceData = await redis.hGetAll(`service:${serviceId}:published`);

    const newToken = await createSingleServiceToken({
      userId: metadata.userId,
      serviceId: serviceId,
      name: `${serviceData.title} (migrated)`,
      // Embed service metadata
      serviceName: serviceData.title,
      inputs: serviceData.inputs,
      outputs: serviceData.outputs,
      aiDescription: serviceData.aiDescription,
      // ...
    });

    newTokens.push(newToken);
  }

  return newTokens;
}
```

### Phase 3: Gradual Rollout

**Timeline:**

1. **Week 1-2:** Implement dual-mode support
2. **Week 3:** Deploy to production (backward compatible)
3. **Week 4:** Update token creation UI (allow both modes)
4. **Week 5-6:** Migrate existing tokens (optional, user-driven)
5. **Week 7-8:** Encourage single-service adoption
6. **Week 9+:** Monitor usage, iterate on UX

### Phase 4: Deprecation (Future)

**Eventually (6+ months):**
- Mark multi-service tokens as "legacy"
- Show migration prompts in UI
- Stop creating new multi-service tokens
- Keep backward compatibility indefinitely (or until usage < 1%)

---

## Step-by-Step Implementation

### Step 1: Update Token Data Model

**File:** `lib/mcp-auth.js`

**Changes:**

```javascript
// NEW: Create single-service token
export async function createSingleServiceToken({
  userId,
  serviceId,  // ← Single service
  name,
  description
}) {
  const token = generateToken();

  // Fetch service metadata to embed
  const serviceData = await redis.hGetAll(`service:${serviceId}:published`);

  if (!serviceData || Object.keys(serviceData).length === 0) {
    throw new Error(`Service ${serviceId} not found or not published`);
  }

  // Store token with embedded metadata
  await redis.hSet(`mcp:token:${token}`, {
    token,
    name: name || serviceData.title,
    description: description || serviceData.description,
    userId,
    created: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    requests: '0',
    isActive: 'true',

    // Single service
    serviceId: serviceId,

    // Embedded service metadata
    serviceName: serviceData.title,
    serviceDescription: serviceData.description,
    serviceCategory: serviceData.category || '',

    // Embedded schemas
    inputs: serviceData.inputs || '[]',
    outputs: serviceData.outputs || '[]',
    areas: serviceData.areas || '[]',

    // Embedded AI guidance
    aiDescription: serviceData.aiDescription || '',
    aiUsageGuidance: serviceData.aiUsageGuidance || '',
    aiUsageExamples: serviceData.aiUsageExamples || '[]',
    aiTags: serviceData.aiTags || '[]',

    // Service settings
    useCaching: serviceData.useCaching || 'true',
    needsToken: serviceData.needsToken || 'false'
  });

  // Add to user's token index
  await redis.sAdd(`mcp:user:${userId}:tokens`, token);

  return {
    token,
    serviceId,
    serviceName: serviceData.title,
    created: new Date().toISOString()
  };
}

// UPDATE: Validate token (support both modes)
export async function validateToken(token) {
  if (!token || !token.startsWith('spapi_live_')) {
    return { valid: false, error: 'Invalid token format' };
  }

  const metadata = await redis.hGetAll(`mcp:token:${token}`);

  if (!metadata || Object.keys(metadata).length === 0) {
    return { valid: false, error: 'Token not found' };
  }

  if (metadata.isActive !== 'true') {
    return { valid: false, error: 'Token is inactive' };
  }

  // Update last used
  await redis.hSet(`mcp:token:${token}`, {
    lastUsed: new Date().toISOString()
  });
  await redis.hIncrBy(`mcp:token:${token}`, 'requests', 1);

  // Detect mode
  const isSingleService = metadata.serviceId && !metadata.serviceIds;

  if (isSingleService) {
    // Single-service mode (NEW)
    return {
      valid: true,
      userId: metadata.userId,
      mode: 'single-service',

      // Service identification
      serviceId: metadata.serviceId,
      serviceName: metadata.serviceName,
      serviceDescription: metadata.serviceDescription,

      // Embedded schemas
      inputs: JSON.parse(metadata.inputs || '[]'),
      outputs: JSON.parse(metadata.outputs || '[]'),
      areas: JSON.parse(metadata.areas || '[]'),

      // AI guidance
      aiDescription: metadata.aiDescription || '',
      aiUsageGuidance: metadata.aiUsageGuidance || '',
      aiUsageExamples: JSON.parse(metadata.aiUsageExamples || '[]'),
      aiTags: JSON.parse(metadata.aiTags || '[]'),

      // Settings
      useCaching: metadata.useCaching === 'true',
      needsToken: metadata.needsToken === 'true'
    };
  } else {
    // Multi-service mode (LEGACY)
    const serviceIds = metadata.serviceIds
      ? JSON.parse(metadata.serviceIds)
      : [];

    return {
      valid: true,
      userId: metadata.userId,
      mode: 'multi-service',
      serviceIds: serviceIds
    };
  }
}
```

### Step 2: Update Bridge Tool Building

**File:** `app/api/mcp/bridge/route.js`

**Changes:**

```javascript
// Handle tools/list
server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  const auth = await mcpAuthMiddleware(request);

  if (!auth.valid) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      'Authentication failed'
    );
  }

  // Build tools based on mode
  let tools;

  if (auth.mode === 'single-service') {
    tools = await buildSingleServiceTools(auth);
  } else if (auth.mode === 'multi-service') {
    tools = await buildMultiServiceTools(auth);
  } else {
    throw new McpError(
      ErrorCode.InternalError,
      'Unknown token mode'
    );
  }

  return { tools };
});

// NEW: Build tools for single-service token
async function buildSingleServiceTools(auth) {
  const { serviceId, serviceName, inputs, outputs, areas } = auth;

  const tools = [];

  // Primary calculation tool (service-specific name)
  const toolName = `calculate_${serviceId.replace(/-/g, '_')}`;

  tools.push({
    name: toolName,
    description: buildSingleServiceCalculationDescription(auth),
    inputSchema: {
      type: 'object',
      properties: buildInputProperties(inputs),
      required: inputs.filter(i => i.mandatory).map(i => i.name)
    }
  });

  // Area tools (if service has areas)
  if (areas && areas.length > 0) {
    for (const area of areas) {
      tools.push({
        name: `read_${area.name.toLowerCase()}`,
        description: `Read the ${area.name} area from ${serviceName}`,
        inputSchema: {
          type: 'object',
          properties: {
            includeFormulas: { type: 'boolean', default: false },
            includeFormatting: { type: 'boolean', default: false }
          }
        }
      });
    }
  }

  // State management tools (generic - work across all services)
  tools.push({
    name: 'save_calculation',
    description: `Save a ${serviceName} calculation for later comparison`,
    inputSchema: {
      type: 'object',
      properties: {
        inputs: { type: 'object', description: 'The inputs you used' },
        outputs: { type: 'object', description: 'The results you got' },
        label: { type: 'string', description: 'Descriptive name for this scenario' },
        ttl: { type: 'number', default: 3600 }
      },
      required: ['inputs', 'outputs', 'label']
    }
  });

  tools.push({
    name: 'load_saved_calculation',
    description: 'Load a previously saved calculation',
    inputSchema: {
      type: 'object',
      properties: {
        stateId: { type: 'string', description: 'The ID from save_calculation' }
      },
      required: ['stateId']
    }
  });

  tools.push({
    name: 'list_saved_calculations',
    description: `List your saved ${serviceName} calculations`,
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', default: 10, maximum: 50 }
      }
    }
  });

  return tools;
}

// NEW: Build description for single-service calculation tool
function buildSingleServiceCalculationDescription(auth) {
  const { serviceName, aiDescription, aiUsageGuidance, aiUsageExamples, inputs, outputs } = auth;

  let description = `🎯 ${serviceName.toUpperCase()}\n\n`;

  if (aiDescription) {
    description += `PURPOSE:\n${aiDescription}\n\n`;
  }

  if (aiUsageGuidance) {
    description += `⚠️  IMPORTANT:\n${aiUsageGuidance}\n\n`;
  }

  // Add percentage warning if any input is percentage
  const hasPercentage = inputs.some(i =>
    i.format === 'percentage' || i.formatString?.includes('%')
  );

  if (hasPercentage) {
    description += `⚠️  CRITICAL - PERCENTAGE VALUES:\n`;
    description += `ALWAYS convert percentages to decimals (divide by 100):\n`;
    description += `• "5%" → 0.05 (NOT 5)\n`;
    description += `• "42%" → 0.42 (NOT 42)\n\n`;
  }

  // List inputs
  description += `📥 INPUTS:\n`;
  inputs.forEach(input => {
    const req = input.mandatory ? '[REQUIRED]' : '[OPTIONAL]';
    description += `• ${input.title || input.name} ${req}\n`;
    if (input.description) {
      description += `  ${input.description}\n`;
    }
  });
  description += `\n`;

  // List outputs with format strings
  description += `📊 OUTPUTS:\n`;
  outputs.forEach(output => {
    description += `• ${output.title || output.name}`;
    if (output.formatString) {
      description += ` - formatString: "${output.formatString}" (ALWAYS use this for presentation!)`;
    }
    description += `\n`;
  });
  description += `\n`;

  // Examples
  if (aiUsageExamples && aiUsageExamples.length > 0) {
    description += `💡 EXAMPLES:\n`;
    aiUsageExamples.forEach(example => {
      description += `• ${example}\n`;
    });
    description += `\n`;
  }

  description += `🚀 BE DIRECT:\n`;
  description += `When user provides values → Calculate immediately (don't ask permission)\n`;

  return description;
}

// Helper: Build input properties from schema
function buildInputProperties(inputs) {
  const properties = {};

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
      prop.description += ' (Enter as decimal: 0.05 for 5%)';
    }
    if (input.type === 'boolean') {
      prop.description += ' (true/false, yes/no accepted)';
    }

    properties[input.name] = prop;
  });

  return properties;
}

// KEEP: Multi-service tool building (for legacy tokens and OAuth)
async function buildMultiServiceTools(auth) {
  // Existing implementation - NO CHANGES
  // This is what we currently have for multi-service tokens
  // Keep it for backward compatibility and OAuth multi-token scenarios

  const services = await fetchServicesForIds(auth.serviceIds);

  return [
    {
      name: 'spreadapi_calc',
      description: buildMultiServiceDescription(services),
      inputSchema: {
        type: 'object',
        properties: {
          serviceId: {
            type: 'string',
            enum: auth.serviceIds,
            description: buildServiceListDescription(services)
          },
          inputs: { type: 'object' },
          // ... rest same as current
        }
      }
    },
    // ... other generic tools same as current
  ];
}
```

### Step 3: Update Initialize Handler

**File:** `app/api/mcp/bridge/route.js`

**Changes:**

```javascript
// Handle initialize
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  const auth = await mcpAuthMiddleware(request);

  if (!auth.valid) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      'Authentication required'
    );
  }

  // Build instructions based on mode
  let instructions;

  if (auth.mode === 'single-service') {
    instructions = buildSingleServiceInstructions(auth);
  } else {
    instructions = buildMultiServiceInstructions(auth);
  }

  return {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: { listChanged: true },
      resources: { subscribe: false }
    },
    serverInfo: {
      name: 'spreadapi-mcp',
      version: '1.2.0',  // Version bump for single-service support
      description: auth.mode === 'single-service'
        ? `${auth.serviceName} - Powered by SpreadAPI`
        : 'SpreadAPI - Spreadsheet calculations as MCP tools',
      instructions: instructions
    }
  };
});

// NEW: Build instructions for single-service
function buildSingleServiceInstructions(auth) {
  const { serviceName, aiDescription, aiUsageGuidance } = auth;

  return `🎯 YOU ARE: ${serviceName} Assistant

This MCP provides ONE specialized calculator: ${serviceName}

${aiDescription ? `PURPOSE:\n${aiDescription}\n\n` : ''}

${aiUsageGuidance ? `GUIDANCE:\n${aiUsageGuidance}\n\n` : ''}

🚀 WORKFLOW:
1. If user provides all values → Calculate immediately
2. If missing values → Ask for required inputs
3. Present results using formatString for proper formatting

⚠️  CRITICAL:
• Convert percentages to decimals (5% → 0.05)
• Use formatString from outputs for presentation
• Don't ask permission - just calculate when you have values

💡 This is a STATELESS calculator:
• Each calculation is independent
• Use save_calculation to remember scenarios
• Use load_saved_calculation to compare options`;
}
```

### Step 4: Update Tool Execution Handler

**File:** `app/api/mcp/bridge/route.js`

**Changes:**

```javascript
// Handle tools/call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const auth = await mcpAuthMiddleware(request);

  if (!auth.valid) {
    throw new McpError(ErrorCode.InvalidRequest, 'Authentication failed');
  }

  // Route based on tool name and mode

  // Single-service calculation tools
  if (name.startsWith('calculate_')) {
    return await executeSingleServiceCalculation(auth, args);
  }

  // Single-service area tools
  if (name.startsWith('read_') && auth.mode === 'single-service') {
    const areaName = name.replace('read_', '');
    return await executeSingleServiceAreaRead(auth, areaName, args);
  }

  // State management tools (work for both modes)
  if (name === 'save_calculation') {
    return await executeSaveState(auth, args);
  }
  if (name === 'load_saved_calculation') {
    return await executeLoadState(auth, args);
  }
  if (name === 'list_saved_calculations') {
    return await executeListStates(auth, args);
  }

  // Multi-service generic tools (legacy/OAuth)
  if (name === 'spreadapi_calc') {
    return await executeGenericCalculation(auth, args);
  }
  if (name === 'spreadapi_read_area') {
    return await executeGenericAreaRead(auth, args);
  }
  // ... other generic tools

  throw new McpError(
    ErrorCode.MethodNotFound,
    `Unknown tool: ${name}`
  );
});

// NEW: Execute single-service calculation (no serviceId needed)
async function executeSingleServiceCalculation(auth, args) {
  const { serviceId, serviceName } = auth;

  // Args are direct inputs (no serviceId parameter)
  const result = await calculateDirect(serviceId, args);

  if (result.error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Calculation failed: ${result.message}`
    );
  }

  // Format response
  let text = `✅ ${serviceName} - Calculation Complete\n\n`;
  text += `📊 Results:\n`;

  result.outputs.forEach(output => {
    const value = formatOutput(output.value, output.formatString);
    text += `  • ${output.title || output.name}: ${value}\n`;
  });

  text += `\n⚡ Completed in ${result.metadata.executionTime}ms`;

  return {
    content: [{
      type: 'text',
      text: text
    }]
  };
}

// NEW: Execute single-service area read (no serviceId/areaName params)
async function executeSingleServiceAreaRead(auth, areaName, args) {
  const { serviceId, areas } = auth;

  // Find area in embedded metadata
  const area = areas.find(a => a.name.toLowerCase() === areaName.toLowerCase());

  if (!area) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Area "${areaName}" not found`
    );
  }

  // Execute area read
  const result = await readArea(serviceId, area.name, args);

  return {
    content: [{
      type: 'text',
      text: formatAreaData(result)
    }]
  };
}

// NEW: Save state (adapted for single-service)
async function executeSaveState(auth, args) {
  const { serviceId, serviceName } = auth;
  const { inputs, outputs, label, ttl = 3600 } = args;

  const stateId = `state_${crypto.randomBytes(16).toString('hex')}`;

  await redis.hSet(`mcp:state:${stateId}`, {
    userId: auth.userId,
    serviceId: serviceId,
    serviceName: serviceName,
    inputs: JSON.stringify(inputs),
    outputs: JSON.stringify(outputs),
    label: label,
    created: new Date().toISOString()
  });

  await redis.expire(`mcp:state:${stateId}`, ttl);

  // Add to user's state index
  await redis.sAdd(`mcp:user:${auth.userId}:states`, stateId);

  return {
    content: [{
      type: 'text',
      text: `✅ Saved calculation: "${label}"\n\nState ID: ${stateId}\nExpires: ${new Date(Date.now() + ttl * 1000).toISOString()}\n\n💡 Load this later with: load_saved_calculation({ stateId: "${stateId}" })`
    }]
  };
}

// Load and list states - similar updates
```

### Step 5: Update OAuth Authorization

**File:** `/app/api/oauth/authorize/route.js`

**Changes:**

```javascript
export async function POST(request) {
  // ... existing validation ...

  const { mcp_tokens, client_id, redirect_uri, code_challenge } = body;

  // Validate all MCP tokens and collect service IDs
  const validatedTokens = [];
  const allServiceIds = new Set();
  let userId = null;

  for (const token of mcp_tokens) {
    const validation = await validateToken(token);

    if (!validation.valid) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    // Handle both single-service and multi-service tokens
    if (validation.mode === 'single-service') {
      // Single service token
      allServiceIds.add(validation.serviceId);
      validatedTokens.push({
        token: token,
        userId: validation.userId,
        mode: 'single-service',
        serviceId: validation.serviceId
      });
    } else if (validation.mode === 'multi-service') {
      // Multi-service token (legacy)
      validation.serviceIds.forEach(id => allServiceIds.add(id));
      validatedTokens.push({
        token: token,
        userId: validation.userId,
        mode: 'multi-service',
        serviceIds: validation.serviceIds
      });
    }

    if (!userId) {
      userId = validation.userId;
    }
  }

  // Convert Set to Array
  const serviceIds = Array.from(allServiceIds);

  console.log('[OAuth] Validated tokens:', {
    token_count: validatedTokens.length,
    service_count: serviceIds.length,
    single_service_tokens: validatedTokens.filter(t => t.mode === 'single-service').length,
    multi_service_tokens: validatedTokens.filter(t => t.mode === 'multi-service').length
  });

  // ... rest stays the same ...
}
```

**No other OAuth changes needed!** It already handles multiple tokens and combines serviceIds.

### Step 6: Update Token Creation UI

**File:** `app/api/mcp/create-token/route.js`

**Changes:**

```javascript
export async function POST(request) {
  const body = await request.json();
  const { name, description, serviceId } = body;  // ← Single serviceId

  // Get user from session
  const userId = await getUserFromSession(request);

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Validate inputs
  if (!serviceId) {
    return NextResponse.json(
      { error: 'serviceId is required' },
      { status: 400 }
    );
  }

  // Create single-service token
  const result = await createSingleServiceToken({
    userId,
    serviceId,
    name,
    description
  });

  return NextResponse.json({
    success: true,
    token: result.token,
    serviceId: result.serviceId,
    serviceName: result.serviceName,
    created: result.created
  });
}
```

**Frontend UI Update:**

```tsx
// app/app/profile/page.tsx or wherever token creation UI is

function TokenCreationForm() {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [tokenName, setTokenName] = useState('');

  // Fetch user's services
  const { data: services } = useQuery(['userServices'], fetchUserServices);

  async function handleCreateToken() {
    const response = await fetch('/api/mcp/create-token', {
      method: 'POST',
      body: JSON.stringify({
        serviceId: selectedServiceId,  // Single service
        name: tokenName || `${selectedService.name} Token`,
        description: `Access to ${selectedService.name}`
      })
    });

    const result = await response.json();

    // Show success with token
    showTokenModal(result.token);
  }

  return (
    <div>
      <h2>Create MCP Token</h2>

      {/* Single service selector */}
      <select
        value={selectedServiceId}
        onChange={(e) => {
          setSelectedServiceId(e.target.value);
          const service = services.find(s => s.id === e.target.value);
          setTokenName(`${service.name} Token`);
        }}
      >
        <option value="">Select a service...</option>
        {services.map(service => (
          <option key={service.id} value={service.id}>
            {service.name} - {service.description}
          </option>
        ))}
      </select>

      {/* Token name (auto-filled) */}
      <input
        type="text"
        value={tokenName}
        onChange={(e) => setTokenName(e.target.value)}
        placeholder="Token name"
      />

      {/* Preview */}
      {selectedServiceId && (
        <div className="preview">
          <h3>Token Preview</h3>
          <p>Service: {selectedService.name}</p>
          <p>Description: {selectedService.description}</p>
          <p>AI will know this is for: {selectedService.aiDescription}</p>
        </div>
      )}

      <button onClick={handleCreateToken}>
        Create Token
      </button>
    </div>
  );
}
```

### Step 7: Update AI Instructions

**File:** `lib/mcp-ai-instructions.js`

**Add new function:**

```javascript
/**
 * Instructions for single-service tokens
 * AI receives full context about ONE specific service
 *
 * @param {object} auth - Auth object with embedded service metadata
 * @returns {string} AI instructions
 */
export function getSingleServiceInstructions(auth) {
  const { serviceName, aiDescription, aiUsageGuidance, aiUsageExamples, inputs } = auth;

  let instructions = `🎯 YOU ARE: ${serviceName} Assistant\n\n`;

  instructions += `This MCP provides ONE specialized calculator: ${serviceName}\n\n`;

  if (aiDescription) {
    instructions += `PURPOSE:\n${aiDescription}\n\n`;
  }

  if (aiUsageGuidance) {
    instructions += `GUIDANCE:\n${aiUsageGuidance}\n\n`;
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

  instructions += `🚀 WORKFLOW:\n`;
  instructions += `1. If user provides all values → Calculate immediately\n`;
  instructions += `2. If missing values → Ask for required inputs\n`;
  instructions += `3. Present results using formatString for proper formatting\n\n`;

  if (aiUsageExamples && aiUsageExamples.length > 0) {
    instructions += `💡 EXAMPLES:\n`;
    aiUsageExamples.forEach(example => {
      instructions += `• ${example}\n`;
    });
    instructions += `\n`;
  }

  instructions += `🚀 BE DIRECT:\n`;
  instructions += `• Don't ask permission - just calculate when you have values\n`;
  instructions += `• Use formatString for proper number formatting\n`;
  instructions += `• Save calculations with save_calculation for comparison\n\n`;

  instructions += `💡 This is a STATELESS calculator:\n`;
  instructions += `• Each calculation is independent\n`;
  instructions += `• No memory between calculations\n`;
  instructions += `• Use save_calculation to remember scenarios for comparison\n`;

  return instructions;
}
```

---

## Testing Strategy

### Phase 1: Unit Tests

**Test token validation:**

```javascript
describe('validateToken - single-service', () => {
  it('should validate single-service token', async () => {
    const token = await createSingleServiceToken({
      userId: 'test-user',
      serviceId: 'mortgage-calc',
      name: 'Test Token'
    });

    const validation = await validateToken(token.token);

    expect(validation.valid).toBe(true);
    expect(validation.mode).toBe('single-service');
    expect(validation.serviceId).toBe('mortgage-calc');
    expect(validation.serviceName).toBeDefined();
    expect(validation.inputs).toBeInstanceOf(Array);
  });

  it('should still validate multi-service token (backward compat)', async () => {
    const token = await createMultiServiceToken({
      userId: 'test-user',
      serviceIds: ['mortgage-calc', 'tax-calc'],
      name: 'Legacy Token'
    });

    const validation = await validateToken(token.token);

    expect(validation.valid).toBe(true);
    expect(validation.mode).toBe('multi-service');
    expect(validation.serviceIds).toEqual(['mortgage-calc', 'tax-calc']);
  });
});
```

**Test tool building:**

```javascript
describe('buildSingleServiceTools', () => {
  it('should build service-specific calculation tool', async () => {
    const auth = {
      mode: 'single-service',
      serviceId: 'mortgage-calc',
      serviceName: 'Mortgage Calculator',
      inputs: [
        { name: 'principal', type: 'number', mandatory: true },
        { name: 'interest_rate', type: 'number', mandatory: true, format: 'percentage' }
      ],
      outputs: [
        { name: 'monthly_payment', formatString: '$#,##0.00' }
      ],
      areas: []
    };

    const tools = await buildSingleServiceTools(auth);

    expect(tools).toHaveLength(4); // calc + 3 state management
    expect(tools[0].name).toBe('calculate_mortgage_calc');
    expect(tools[0].inputSchema.properties).toHaveProperty('principal');
    expect(tools[0].inputSchema.properties).not.toHaveProperty('serviceId');
  });
});
```

### Phase 2: Integration Tests

**Test Claude Desktop flow:**

```bash
# Create test token
curl -X POST http://localhost:3000/api/mcp/create-token \
  -H "Cookie: session=..." \
  -d '{"serviceId":"mortgage-calc","name":"Test Token"}'

# Response: { "token": "spapi_live_abc123..." }

# Test MCP initialize
curl -X POST http://localhost:3000/api/mcp/bridge \
  -H "Authorization: Bearer spapi_live_abc123..." \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {}
    },
    "id": 1
  }'

# Should return single-service instructions

# Test tools/list
curl -X POST http://localhost:3000/api/mcp/bridge \
  -H "Authorization: Bearer spapi_live_abc123..." \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }'

# Should return calculate_mortgage_calc tool

# Test calculation
curl -X POST http://localhost:3000/api/mcp/bridge \
  -H "Authorization: Bearer spapi_live_abc123..." \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "calculate_mortgage_calc",
      "arguments": {
        "principal": 100000,
        "interest_rate": 0.05,
        "years": 30
      }
    },
    "id": 3
  }'

# Should return calculation result
```

**Test ChatGPT OAuth flow:**

```bash
# Test with multiple single-service tokens
curl -X POST http://localhost:3000/api/oauth/authorize \
  -d '{
    "mcp_tokens": [
      "spapi_live_abc...",  // mortgage-calc
      "spapi_live_xyz...",  // tax-calc
      "spapi_live_def..."   // roi-calc
    ],
    "client_id": "test-client",
    "redirect_uri": "https://chatgpt.com/oauth/callback",
    "code_challenge": "...",
    "code_challenge_method": "S256"
  }'

# Should combine all 3 services
# OAuth token should have access to mortgage-calc, tax-calc, roi-calc
```

### Phase 3: End-to-End Tests

**Claude Desktop (Single-Service):**

1. Create single-service token for "Mortgage Calculator"
2. Configure Claude Desktop with token
3. Restart Claude Desktop
4. Verify: "This is a Mortgage Calculator" in system prompt
5. Ask: "Calculate 5% on $100k for 30 years"
6. Verify: Immediate calculation (no discovery needed)
7. Verify: formatString applied correctly

**ChatGPT (Multi Single-Service Tokens):**

1. Create 3 single-service tokens (Mortgage, Tax, ROI)
2. Go to ChatGPT → Add MCP server
3. OAuth flow: Paste all 3 tokens
4. Authorize
5. Verify: "Connected ✓"
6. Ask: "Calculate mortgage payment"
7. Verify: AI knows to use mortgage calculator
8. Ask: "Calculate my taxes"
9. Verify: AI switches to tax calculator

**Backward Compatibility:**

1. Keep one multi-service token (legacy)
2. Configure Claude Desktop with legacy token
3. Verify: Still works with generic tools
4. Verify: tools/list shows all services
5. Verify: spreadapi_calc requires serviceId

---

## Rollback Plan

### If Issues Arise

**Immediate Rollback (< 1 hour):**

1. Revert code changes
2. Deploy previous version
3. All tokens still work (multi-service)

**Partial Rollback (Keep both modes):**

1. Disable single-service token creation in UI
2. Keep validation logic (backward compatible)
3. Monitor multi-service usage
4. Fix issues with single-service
5. Re-enable when ready

**Data Rollback:**

```javascript
// Convert single-service → multi-service
async function rollbackToken(singleServiceToken) {
  const metadata = await redis.hGetAll(`mcp:token:${singleServiceToken}`);

  // Change serviceId → serviceIds
  await redis.hSet(`mcp:token:${singleServiceToken}`, {
    serviceIds: JSON.stringify([metadata.serviceId])
  });

  // Remove single-service fields
  await redis.hDel(`mcp:token:${singleServiceToken}`, [
    'serviceId',
    'serviceName',
    'inputs',
    'outputs',
    'aiDescription',
    // ... all embedded fields
  ]);
}
```

---

## Timeline & Phases

### Week 1-2: Implementation

- [ ] Update token data model (`lib/mcp-auth.js`)
- [ ] Update validation logic (dual-mode support)
- [ ] Update tool building (`buildSingleServiceTools`)
- [ ] Update initialize handler
- [ ] Update tool execution handler
- [ ] Write unit tests
- [ ] Write integration tests

### Week 3: Deploy (Backward Compatible)

- [ ] Deploy to staging
- [ ] Test with both token types
- [ ] Test OAuth flow
- [ ] Deploy to production
- [ ] Monitor errors
- [ ] Verify backward compatibility

### Week 4: UI Updates

- [ ] Update token creation UI (single-select)
- [ ] Add migration tool (multi → single)
- [ ] Update documentation
- [ ] Create user guides

### Week 5-6: Migration

- [ ] Announce single-service tokens
- [ ] Provide migration tool for users
- [ ] Monitor adoption
- [ ] Collect feedback
- [ ] Iterate on UX

### Week 7-8: Optimization

- [ ] Optimize tool descriptions
- [ ] Refine AI guidance
- [ ] Performance tuning
- [ ] Analytics dashboard

### Future: Deprecation (6+ months)

- [ ] Mark multi-service as "legacy"
- [ ] Show migration prompts
- [ ] Stop creating new multi-service tokens
- [ ] Keep backward compatibility

---

## Success Metrics

### Technical Metrics

- ✅ Zero OAuth flow regressions
- ✅ All 8 tools still work
- ✅ Backward compatibility maintained
- ✅ Response time < 100ms (same as before)
- ✅ Error rate < 0.1%

### User Experience Metrics

- ✅ Time to first calculation: < 5 seconds (vs 20+ seconds multi-service)
- ✅ Discovery calls: 0 (vs 2-3 for multi-service)
- ✅ AI confusion rate: < 5% (vs 20%+ with multi-service)
- ✅ User satisfaction: > 90%

### Business Metrics

- ✅ Token creation: Easier and faster
- ✅ Marketplace clarity: Each token has clear purpose
- ✅ Pricing model: Simpler (per-calculator pricing)
- ✅ Creator satisfaction: Higher (focused offerings)

---

## Conclusion

This migration plan provides a **safe, backward-compatible path** from multi-service to single-service MCP tokens while:

✅ **Preserving OAuth flow** (no changes to ChatGPT integration)
✅ **Preserving all tools** (especially state management)
✅ **Preserving Claude/ChatGPT differences** (both continue working)
✅ **Supporting both models** during transition (no breaking changes)
✅ **Improving AI experience** (specialized, focused guidance)

**Next Steps:**
1. Review this plan
2. Approve implementation
3. Start with Phase 1 (dual-mode support)
4. Test thoroughly
5. Deploy gradually

---

**Document Version:** 1.0
**Created:** 2025-10-26
**Status:** Planning - Ready for Review
**Review Required:** Yes
**Breaking Changes:** None (backward compatible)
