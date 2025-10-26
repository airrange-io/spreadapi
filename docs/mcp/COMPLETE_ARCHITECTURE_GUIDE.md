# SpreadAPI - Complete Service API & MCP Architecture Guide

**Version:** 1.0
**Last Updated:** 2025-10-26
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Authentication Systems](#authentication-systems)
4. [Service API Architecture](#service-api-architecture)
5. [MCP Integration - Claude Desktop](#mcp-integration---claude-desktop)
6. [MCP Integration - ChatGPT](#mcp-integration---chatgpt)
7. [Tools and Capabilities](#tools-and-capabilities)
8. [Data Flow Diagrams](#data-flow-diagrams)
9. [Technical Reference](#technical-reference)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Executive Summary

**SpreadAPI** is a Next.js-based platform that converts Excel/Google Sheets spreadsheets into production-ready APIs and makes them accessible to AI assistants via the Model Context Protocol (MCP).

### Key Components

- **Service API**: REST API (v1) for executing spreadsheet calculations
- **MCP Bridge for Claude Desktop**: stdio-to-HTTP bridge NPM package
- **MCP HTTP Server for ChatGPT**: OAuth 2.1-based connector
- **Token-based Authentication**: Unified security model across platforms

### Current Status

✅ **Production Ready** - Both Claude Desktop and ChatGPT integrations fully functional
✅ **Token System** - MCP tokens support multi-service permissions
✅ **Marketplace Model** - Token-level service restrictions for multi-creator ecosystem
✅ **AI-Optimized** - Extensive AI guidance system for proper service usage

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    SpreadAPI Platform                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Core Service API (v1)                   │    │
│  │  /api/v1/services/{id}/execute                  │    │
│  │  - Spreadsheet calculation engine               │    │
│  │  - Input validation & transformation            │    │
│  │  - Result caching (Redis)                       │    │
│  │  - Rate limiting                                │    │
│  │  - Analytics tracking                           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         MCP Integration Layer                   │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │ Claude Desktop (stdio transport)     │     │    │
│  │  │  - NPM package: spreadapi-mcp        │     │    │
│  │  │  - Bridge: /api/mcp/bridge           │     │    │
│  │  │  - Auth: MCP tokens (spapi_live_)    │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │ ChatGPT (HTTP transport)             │     │    │
│  │  │  - Endpoint: /api/mcp                │     │    │
│  │  │  - Auth: OAuth 2.1 + PKCE            │     │    │
│  │  │  - Session: Redis-based              │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Authentication Systems                  │    │
│  │  - MCP Tokens (spapi_live_...)                 │    │
│  │  - OAuth Tokens (oat_...)                      │    │
│  │  - Service-level permissions                   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Platform Flow

```
Creators → Publish Services → Generate MCP Tokens → Share/Sell Tokens
    ↓
Customers → Receive Tokens → Configure AI Assistant → Access Services
    ↓
AI Assistant → Use MCP Tools → Execute Calculations → Present Results
```

---

## Authentication Systems

### 1. MCP Token System

**Purpose:** Primary authentication method for both Claude Desktop and ChatGPT (via OAuth wrapper)

**Token Format:**
```
spapi_live_{64_hex_characters}
```

**Example:**
```
spapi_live_a1b2c3d4e5f6...
```

#### Token Structure (Redis)

**Key:** `mcp:token:{token}`
**TTL:** None (permanent until revoked)

```javascript
{
  name: "Production API Access",
  description: "For customer X",
  userId: "user_abc123",
  created: "2025-10-26T00:00:00Z",
  lastUsed: "2025-10-26T12:34:56Z",
  requests: 1523,
  isActive: "true",
  serviceIds: JSON.stringify(["service1", "service2", "service3"])
}
```

#### Key Features

✅ **Service Restrictions**: Each token can be limited to specific services
✅ **Empty serviceIds = No access** (marketplace security model)
✅ **Usage Tracking**: Automatic request counting and last-used timestamps
✅ **Instant Revocation**: Mark as inactive → next request fails immediately

#### API Reference

**File:** `lib/mcp-auth.js`

```javascript
// Generate new token
generateToken() → "spapi_live_..."

// Create and store token
createToken(userId, name, description, serviceIds)
  → { token, name, description, created, serviceIds }

// Validate token
validateToken(token)
  → { valid: true, userId, serviceIds: [...] }

// Get user's tokens
getUserTokens(userId)
  → [{ id, token, name, description, created, lastUsed, requests, serviceIds }]

// Revoke token
revokeToken(userId, token)
  → { success: true }
```

#### User's Token Index

**Key:** `mcp:user:{userId}:tokens`
**Type:** Set
**Content:** Token IDs

```javascript
["spapi_live_abc123...", "spapi_live_xyz789..."]
```

---

### 2. OAuth Token System (ChatGPT)

**Purpose:** Wrap MCP tokens in OAuth 2.1 flow for ChatGPT compatibility

**Token Format:**
```
oat_{64_hex_characters}
```

**Example:**
```
oat_x9y8z7w6v5u4...
```

#### OAuth Flow Overview

```
User provides MCP tokens
  → OAuth authorize
  → Authorization code
  → Token exchange
  → OAuth access token
```

#### OAuth Token Maps to MCP Tokens

**Key:** `oauth:token:{oat_token}`
**TTL:** 43200 seconds (12 hours)

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
  authorized_at: "1730000000000"
}
```

#### Security Model

🔒 **Automatic Invalidation**:
- If ANY underlying MCP token is revoked → OAuth token becomes invalid
- Validation chain: OAuth token → MCP tokens → Service access

🔒 **Permission Inheritance**:
- OAuth token combines permissions from ALL provided MCP tokens
- Example: Token A (services 1,2,3) + Token B (services 4,5) = Access to 1,2,3,4,5

🔒 **PKCE Protection**:
- SHA-256 code challenge/verifier
- Prevents authorization code interception

---

## Service API Architecture

### Core Endpoint

**URL Pattern:**
```
POST /api/v1/services/{serviceId}/execute
GET  /api/v1/services/{serviceId}/execute?param1=value1&param2=value2
```

### Request Format (POST)

```json
{
  "inputs": {
    "interest_rate": 0.05,
    "principal": 100000,
    "years": 30
  },
  "token": "spapi_live_...",  // Optional
  "nocdn": false,              // Optional - bypass CDN cache
  "nocache": false             // Optional - bypass all caches
}
```

### Response Format

```json
{
  "serviceId": "mortgage-calc",
  "serviceName": "Mortgage Calculator",
  "serviceDescription": "Calculate mortgage payments and amortization",
  "inputs": [
    {
      "name": "interest_rate",
      "value": 0.05,
      "type": "number"
    }
  ],
  "outputs": [
    {
      "name": "monthly_payment",
      "title": "Monthly Payment",
      "value": 536.82,
      "formatString": "$#,##0.00",
      "type": "number"
    }
  ],
  "metadata": {
    "executionTime": 45,
    "cached": false,
    "timestamp": "2025-10-26T12:00:00Z",
    "version": "v1"
  }
}
```

### Service Publishing Model

**Redis Key:** `service:{serviceId}:published`
**TTL:** None (permanent)

```javascript
{
  // Basic metadata
  title: "Mortgage Calculator",
  description: "Calculate mortgage payments and amortization schedules",
  category: "finance",

  // API definition (JSON stringified)
  inputs: JSON.stringify([
    {
      name: "interest_rate",
      type: "number",
      format: "percentage",
      mandatory: true,
      description: "Annual interest rate",
      min: 0,
      max: 1
    }
  ]),
  outputs: JSON.stringify([
    {
      name: "monthly_payment",
      title: "Monthly Payment",
      type: "number",
      formatString: "$#,##0.00",
      description: "Monthly payment amount"
    }
  ]),

  // Editable areas (advanced feature)
  areas: JSON.stringify([
    {
      name: "PriceList",
      address: "A1:C10",
      mode: "table",
      permissions: {
        canReadValues: true,
        canWriteValues: true
      }
    }
  ]),

  // AI guidance
  aiDescription: "Use when user asks about mortgages, home loans, or monthly payments",
  aiUsageGuidance: "Always convert percentage to decimal (5% → 0.05)",
  aiUsageExamples: JSON.stringify([
    "Calculate 5% interest on $100,000 for 30 years",
    "What's my monthly payment for a $250k mortgage?"
  ]),
  aiTags: JSON.stringify(["finance", "mortgage", "loan", "real-estate"]),

  // Service settings
  urlData: "...",
  needsToken: "false",
  useCaching: "true",
  created: "2025-01-15T10:00:00Z",
  modified: "2025-10-20T14:30:00Z",
  calls: "15234"
}
```

### Calculation Engine

**File:** `app/api/v1/services/[id]/execute/calculateDirect.js`

**Features:**
- ✅ Direct execution (no HTTP overhead)
- ✅ Result caching (Redis-based, hash-keyed by inputs)
- ✅ Format preservation (Excel number formats)
- ✅ Error handling (detailed validation errors)
- ✅ Analytics tracking (response time distribution)

**Cache Strategy:**

```javascript
// Cache key format
const cacheKey = `result:${serviceId}:${hashInputs(inputs)}`;

// Hash function
function hashInputs(inputs) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(inputs))
    .digest('hex')
    .substring(0, 16);
}

// TTL: Service-specific (default 24h)
await redis.set(cacheKey, JSON.stringify(result), { EX: 86400 });
```

---

## MCP Integration - Claude Desktop

### Bridge Package

**NPM Package:** `spreadapi-mcp`
**Version:** 1.1.0
**Transport:** stdio (JSON-RPC 2.0)
**Location:** `/packages/spreadapi-mcp/`

### Installation

```bash
npm install -g spreadapi-mcp
```

### Claude Desktop Configuration

**File:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

```json
{
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_TOKEN": "spapi_live_YOUR_TOKEN_HERE",
        "SPREADAPI_URL": "https://spreadapi.io/api/mcp/bridge"
      }
    }
  }
}
```

### Bridge Architecture

```
┌──────────────────┐
│ Claude Desktop   │
│ (stdio client)   │
└────────┬─────────┘
         │ JSON-RPC over stdio
         │ (stdin/stdout)
         ▼
┌──────────────────────────┐
│ spreadapi-mcp package    │
│ - Translates stdio ↔ HTTP│
│ - Adds Authorization     │
└────────┬─────────────────┘
         │ HTTP POST
         │ Authorization: Bearer spapi_live_...
         ▼
┌──────────────────────────┐
│ /api/mcp/bridge          │
│ (Next.js route)          │
│ - JSON-RPC handler       │
│ - Tool execution         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Service execution logic  │
│ - calculateDirect()      │
│ - Result formatting      │
└──────────────────────────┘
```

### Bridge Package Code

**File:** `/packages/spreadapi-mcp/index.js`

```javascript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const SPREADAPI_URL = process.env.SPREADAPI_URL || 'https://spreadapi.io/api/mcp/bridge';
const SPREADAPI_TOKEN = process.env.SPREADAPI_TOKEN;

// Create MCP server
const server = new Server({
  name: 'spreadapi-mcp',
  version: '1.1.0'
}, {
  capabilities: {
    tools: {},
    resources: { subscribe: false }
  }
});

// Handle tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const result = await callSpreadAPI('tools/list');
  return result;
});

// Handle tools/call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await callSpreadAPI('tools/call', { name, arguments: args });
  return result;
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Bridge Endpoint

**File:** `/app/api/mcp/bridge/route.js`
**Size:** ~2,262 lines
**Protocol:** JSON-RPC 2.0
**MCP Version:** 2024-11-05 (with backward compatibility)

**Key Responsibilities:**
1. Authenticate requests via `mcpAuthMiddleware`
2. Build dynamic tool list based on user's services
3. Execute tool calls (calculations, area reads, etc.)
4. Provide AI guidance in tool descriptions
5. Handle errors with detailed feedback

---

## MCP Integration - ChatGPT

### OAuth Flow (Simplified Token-Based)

**New Model (as of 2025-10-25):**

```
ChatGPT
  → OAuth authorize page
  → User pastes MCP tokens
  → Code generated
  → Token exchange
  → OAuth token (wraps MCP tokens)
```

### User Experience

**Total Time:** ~60 seconds

1. User opens ChatGPT settings → Add MCP server
2. Enter URL: `https://spreadapi.io`
3. ChatGPT redirects to OAuth authorize page
4. **User pastes MCP tokens** (1-5 tokens from different creators)
5. Click "Authorize"
6. Redirect back to ChatGPT
7. ✅ Connected

**Key Difference from Old Model:**
- ❌ No Hanko login required
- ❌ No service selection checkboxes
- ✅ Just paste tokens (same UX as Claude Desktop!)
- ✅ Multi-token support for marketplace model

### OAuth Endpoints

#### 1. Authorization Endpoint

**File:** `/app/api/oauth/authorize/route.js`

**Request:**
```http
POST /api/oauth/authorize
Content-Type: application/json

{
  "mcp_tokens": ["spapi_live_abc...", "spapi_live_xyz..."],
  "client_id": "chatgpt-uuid",
  "redirect_uri": "https://chatgpt.com/oauth/callback",
  "scope": "mcp:read mcp:write",
  "code_challenge": "base64url_sha256_challenge",
  "code_challenge_method": "S256"
}
```

**Process:**
1. Validate all MCP tokens
2. Collect allowed serviceIds from each token
3. Combine into single permission set
4. Generate authorization code
5. Store MCP tokens temporarily (10 min TTL)
6. Return code

**Response:**
```json
{
  "code": "oac_randomcode123..."
}
```

#### 2. Token Exchange Endpoint

**File:** `/app/api/oauth/token/route.js`

**Request:**
```http
POST /api/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=oac_randomcode123...
&client_id=chatgpt-uuid
&redirect_uri=https://chatgpt.com/oauth/callback
&code_verifier=random_string
```

**Process:**
1. Validate authorization code
2. Verify PKCE (code_verifier matches code_challenge via SHA-256)
3. Retrieve MCP tokens from Redis
4. Generate OAuth access token
5. Store mapping: OAuth token → MCP tokens + serviceIds
6. Delete authorization code (one-time use)
7. Return access token

**Response:**
```json
{
  "access_token": "oat_randomhash123...",
  "token_type": "Bearer",
  "expires_in": 43200,
  "scope": "mcp:read mcp:write"
}
```

### MCP HTTP Endpoint

**File:** `/app/api/mcp/route.js`

**Transport:** Streamable HTTP (MCP spec 2025-03-26)
**Session Management:** Redis-based (10 min TTL)
**Authentication:** OAuth Bearer tokens

**Session Flow:**

```javascript
// Create/get session
let sessionId = request.headers.get('Mcp-Session-Id');

if (!sessionId) {
  sessionId = generateSessionId(); // mcp-{timestamp}-{random}
  await redis.hSet(`mcp:session:${sessionId}`, {
    userId: auth.userId,
    created: Date.now().toString(),
    lastActivity: Date.now().toString()
  });
  await redis.expire(`mcp:session:${sessionId}`, 600); // 10 min TTL
}
```

**Request/Response:**

Same JSON-RPC protocol as bridge endpoint, but:
- Returns `Mcp-Session-Id` header
- Manages session state in Redis
- Validates OAuth tokens instead of MCP tokens

**Delegates to bridge handler:**

```javascript
// Reuse bridge logic
const bridgeResponse = await bridgePOST(mockRequest, {});
const jsonRpcResponse = await bridgeResponse.json();

return NextResponse.json(jsonRpcResponse, {
  headers: {
    'Mcp-Session-Id': sessionId,
    'Access-Control-Allow-Origin': '*'
  }
});
```

---

## Tools and Capabilities

### MCP Tools Overview

SpreadAPI provides **8 generic tools** that work across all services:

| Tool | Purpose | Parameters |
|------|---------|------------|
| `spreadapi_calc` | Execute service calculation | `serviceId`, `inputs`, `areaUpdates?`, `returnOptions?` |
| `spreadapi_read_area` | Read editable spreadsheet area | `serviceId`, `areaName`, `includeFormulas?`, `includeFormatting?` |
| `spreadapi_list_services` | Discover available services | `includeMetadata?`, `includeAreas?` |
| `spreadapi_get_service_details` | Get service parameters | `serviceId` |
| `spreadapi_batch` | Compare multiple scenarios | `calculations[]`, `compareOutputs[]` |
| `spreadapi_save_state` | Save calculation for later | `serviceId`, `inputs`, `outputs`, `label`, `ttl?` |
| `spreadapi_load_state` | Load saved calculation | `stateId` |
| `spreadapi_list_saved_states` | List user's saved states | `serviceId?`, `limit?` |

### 1. spreadapi_calc

**Purpose:** Execute a service calculation

**Parameters:**
```javascript
{
  serviceId: "mortgage-calc",        // Required
  inputs: {                          // Required
    interest_rate: 0.05,
    principal: 100000,
    years: 30
  },
  areaUpdates: [                     // Optional - update editable areas
    {
      areaName: "PriceList",
      changes: [
        { row: 0, col: 1, value: 99.99 }
      ]
    }
  ],
  returnOptions: {                   // Optional - control output
    includeOutputs: true,
    includeAreaValues: false,
    includeAreaFormulas: false
  }
}
```

**Response:**
```javascript
{
  content: [{
    type: "text",
    text: `✅ Mortgage Calculator - Calculation Complete

📊 Results:
  • Monthly Payment: $536.82
  • Total Interest: $93,255.78
  • Total Paid: $193,255.78

💡 These are the final calculated outputs from the spreadsheet.
To recalculate with different inputs, call this tool again.

⚡ Completed in 45ms`
  }]
}
```

### 2. spreadapi_batch

**Purpose:** Compare multiple calculation scenarios

**Parameters:**
```javascript
{
  calculations: [
    {
      serviceId: "mortgage-calc",
      inputs: { rate: 0.03, years: 15, principal: 200000 },
      label: "15-year fixed at 3%"
    },
    {
      serviceId: "mortgage-calc",
      inputs: { rate: 0.035, years: 30, principal: 200000 },
      label: "30-year fixed at 3.5%"
    },
    {
      serviceId: "mortgage-calc",
      inputs: { rate: 0.04, years: 30, principal: 200000 },
      label: "30-year fixed at 4%"
    }
  ],
  compareOutputs: ["monthly_payment", "total_interest"]
}
```

**Response:**
```
▶ Batch Calculation Results

### 15-year fixed at 3%
Monthly Payment: $1,381.16
Total Interest: $48,609.20

### 30-year fixed at 3.5%
Monthly Payment: $898.09
Total Interest: $123,312.18

### 30-year fixed at 4%
Monthly Payment: $954.83
Total Interest: $143,739.01

### Comparison Table

| Scenario | Monthly Payment | Total Interest |
|----------|-----------------|----------------|
| 15-year fixed at 3% | $1,381.16 | $48,609.20 |
| 30-year fixed at 3.5% | $898.09 | $123,312.18 |
| 30-year fixed at 4% | $954.83 | $143,739.01 |
```

### 3. spreadapi_save_state / load_state

**Purpose:** Save calculations for later comparison

**Save State:**
```javascript
{
  serviceId: "retirement-calc",
  inputs: { age: 30, current_savings: 50000, monthly_contribution: 1000 },
  outputs: [{ name: "at_65", value: 1200000 }],
  label: "Conservative scenario",
  ttl: 86400  // 24 hours
}
```

**Response:**
```
✅ Saved state: "Conservative scenario"

State ID: state_abc123xyz...
Expires: 2025-10-27T12:00:00Z

You can retrieve this later using spreadapi_load_state with the state ID.
```

**Load State:**
```javascript
{
  stateId: "state_abc123xyz..."
}
```

**Response:**
```
📋 Loaded state: "Conservative scenario"

Service: retirement-calc
Created: 2025-10-26T12:00:00Z

📥 INPUTS:
  • age: 30
  • current_savings: 50000
  • monthly_contribution: 1000

📊 OUTPUTS:
  • Balance at 65: $1,200,000

💡 To recalculate with different inputs, use spreadapi_calc_retirement-calc
💾 To save a new variation, run the calculation and use spreadapi_save_state
```

### 4. spreadapi_read_area

**Purpose:** Read editable spreadsheet areas (advanced feature)

**Parameters:**
```javascript
{
  serviceId: "price-calculator",
  areaName: "ProductPrices",
  includeFormulas: false,
  includeFormatting: false
}
```

**Response:**
```
📋 Area: ProductPrices (A1:C10)

Mode: table
Permissions: Read values, Write values

Data (10 rows × 3 columns):
Row 1: Product A, $99.99, In Stock
Row 2: Product B, $149.99, Out of Stock
Row 3: Product C, $79.99, In Stock
...
```

### AI Guidance System

**File:** `lib/mcp-ai-instructions.js`

**Purpose:** Provide instructions to AI assistants on how to use SpreadAPI tools effectively

**Instruction Types:**

1. **Single Service** (`getSingleServiceInstructions`)
   - Used when token has access to exactly 1 service
   - Simplified workflow (no need to choose service)

2. **Multi Service** (`getMultiServiceInstructions`)
   - Used when token has access to multiple services
   - Emphasizes service discovery and selection

3. **Fallback** (`getFallbackInstructions`)
   - Used when service list cannot be loaded
   - General guidance about the platform

**Key Guidance Points:**

✅ **FAST PATH preferred:** Calculate immediately when values are provided
✅ **Auto-recovery:** If error → call get_service_details → retry
⚠️ **Percentage warning:** Always convert to decimals (5% → 0.05)
📊 **Format strings:** Always use formatString for presentation
🚀 **Proactive:** Don't ask permission, just do it

**Example Tool Description (with AI guidance):**

```javascript
{
  name: "spreadapi_calc",
  description: `🎯 PRIMARY TOOL - Use this for ALL calculations

WHEN TO USE:
- User asks for a calculation (e.g., "calculate...", "compute...")
- User provides numeric values or scenarios

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
• Example output: {"value": 265.53, "formatString": "€#,##0.00", "title": "Total"}
• Present as: "Total: €265.53" (NOT "265.53" or "Total: 265.53")
• Use title field for labels, not name

🔄 AUTO-ERROR RECOVERY:
If calculation fails:
1. Auto-call spreadapi_get_service_details(serviceId)
2. Identify the issue (missing param, wrong type, etc.)
3. Retry with corrections
4. Explain what you fixed

If result seems absurd (>$1M for typical inputs, scientific notation):
1. Check if percentage values were converted (5% → 0.05)
2. Auto-retry with corrected values
3. Explain: "I noticed the result was unrealistic. The issue was..."`,
  inputSchema: { ... }
}
```

---

## Data Flow Diagrams

### Claude Desktop Flow

```
┌──────────────┐
│ User prompt: │
│ "Calculate   │
│  mortgage"   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│ Claude Desktop                   │
│ → Calls: tools/list              │
└──────┬───────────────────────────┘
       │ stdio JSON-RPC
       │ { jsonrpc: "2.0", method: "tools/list", id: 1 }
       ▼
┌──────────────────────────────────┐
│ spreadapi-mcp bridge (NPM)       │
│ → HTTP POST /api/mcp/bridge      │
│   Authorization: Bearer spapi_... │
└──────┬───────────────────────────┘
       │ HTTP
       ▼
┌──────────────────────────────────┐
│ mcpAuthMiddleware                │
│ → validateToken(spapi_live_...)  │
│ → Check serviceIds               │
└──────┬───────────────────────────┘
       │ { valid: true, userId, serviceIds: [...] }
       ▼
┌──────────────────────────────────┐
│ MCP Bridge Handler               │
│ → buildServiceListDescription()  │
│ → Filter by serviceIds           │
│ → Build tool definitions         │
└──────┬───────────────────────────┘
       │ { tools: [...] }
       ▼
┌──────────────────────────────────┐
│ spreadapi-mcp bridge             │
│ → Return to Claude Desktop       │
└──────┬───────────────────────────┘
       │ stdio JSON-RPC
       ▼
┌──────────────────────────────────┐
│ Claude Desktop                   │
│ → Shows: spreadapi_calc tool     │
│ → User confirms parameters       │
└──────┬───────────────────────────┘
       │
       │ User confirms
       ▼
┌──────────────────────────────────┐
│ Claude: tools/call               │
│ spreadapi_calc("mortgage", {...})│
└──────┬───────────────────────────┘
       │ stdio JSON-RPC
       ▼
┌──────────────────────────────────┐
│ spreadapi-mcp bridge             │
│ → HTTP POST /api/mcp/bridge      │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ MCP Bridge Handler               │
│ → executeService(serviceId, inputs) │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ calculateDirect()                │
│ → Check cache (Redis)            │
│ → Execute spreadsheet logic      │
│ → Format results with formatString│
└──────┬───────────────────────────┘
       │ { outputs: [...], metadata: {...} }
       ▼
┌──────────────────────────────────┐
│ MCP Bridge                       │
│ → Format as JSON-RPC response    │
└──────┬───────────────────────────┘
       │ stdio JSON-RPC
       ▼
┌──────────────────────────────────┐
│ Claude Desktop                   │
│ → Parse outputs                  │
│ → Apply formatString             │
│ → Present to user:               │
│   "Your monthly payment: $536.82"│
└──────────────────────────────────┘
```

### ChatGPT OAuth + MCP Flow

```
┌──────────────────────────────────┐
│ User: Add MCP server             │
│ URL: https://spreadapi.io        │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ ChatGPT: OAuth Discovery         │
│ GET /.well-known/oauth-...       │
└──────┬───────────────────────────┘
       │
       │ { authorization_endpoint, token_endpoint, ... }
       ▼
┌──────────────────────────────────┐
│ ChatGPT: Generate PKCE           │
│ → code_verifier (random)         │
│ → code_challenge = SHA256(verifier) │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ OAuth Authorize Redirect         │
│ /oauth/authorize                 │
│   ?client_id=uuid                │
│   &redirect_uri=chatgpt.com/...  │
│   &code_challenge=...            │
│   &code_challenge_method=S256    │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ User sees token input form       │
│ Pastes MCP tokens:               │
│ [spapi_live_abc...]              │
│ [spapi_live_xyz...]              │
│ Click "Authorize"                │
└──────┬───────────────────────────┘
       │ POST /api/oauth/authorize
       │ { mcp_tokens: [...], code_challenge, ... }
       ▼
┌──────────────────────────────────┐
│ Backend: Validate tokens         │
│ → validateToken() for each       │
│ → Combine serviceIds             │
│ → Generate auth code (oac_...)   │
│ → Store in Redis:                │
│   oauth:code:{code} (10 min TTL) │
│   oauth:mcp_tokens:{code}        │
└──────┬───────────────────────────┘
       │ { code: "oac_abc123..." }
       ▼
┌──────────────────────────────────┐
│ Redirect to ChatGPT              │
│ chatgpt.com/callback?code=...    │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ ChatGPT: Token Exchange          │
│ POST /api/oauth/token            │
│ {                                │
│   code: "oac_abc123...",         │
│   code_verifier: "...",          │
│   client_id, redirect_uri        │
│ }                                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Backend: Verify PKCE             │
│ → SHA256(code_verifier) =?       │
│   code_challenge                 │
│ → Get MCP tokens from Redis      │
│ → Generate OAuth token (oat_...) │
│ → Map: oauth:token:{oat_...}     │
│   { mcp_tokens: [...],           │
│     service_ids: [combined] }    │
│ → Delete auth code (one-time)    │
└──────┬───────────────────────────┘
       │ { access_token: "oat_...", expires_in: 43200 }
       ▼
┌──────────────────────────────────┐
│ ChatGPT: Connected ✓             │
│ Stores: Bearer oat_...           │
└──────┬───────────────────────────┘
       │
       │ User: "Calculate mortgage"
       ▼
┌──────────────────────────────────┐
│ ChatGPT: POST /api/mcp           │
│ Authorization: Bearer oat_...    │
│ Mcp-Session-Id: (optional)       │
│ { jsonrpc: "2.0",                │
│   method: "tools/list", id: 1 }  │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ MCP HTTP Endpoint                │
│ → Manage session (Redis)         │
│ → Call mcpAuthMiddleware         │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ mcpAuthMiddleware                │
│ → Detect token type: oat_...     │
│ → validateOAuthToken()           │
│ → Get oauth:token:{oat_...}      │
│ → Extract mcp_tokens array       │
│ → Validate EACH MCP token        │
│ → If ANY invalid → FAIL          │
│ → Return combined serviceIds     │
└──────┬───────────────────────────┘
       │ { valid: true, userId, serviceIds: [...] }
       ▼
┌──────────────────────────────────┐
│ MCP Route → Bridge Handler       │
│ (Same as Claude Desktop from here)│
│ → buildServiceListDescription()  │
│ → Filter tools by serviceIds     │
│ → Return tools                   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ ChatGPT: Execute tool            │
│ → spreadapi_calc(...)            │
│ → Present result to user         │
└──────────────────────────────────┘
```

---

## Technical Reference

### Redis Keys Reference

| Pattern | Purpose | TTL | Value Type | Example |
|---------|---------|-----|------------|---------|
| `mcp:token:{token}` | MCP token metadata | None | Hash | `{ userId, name, serviceIds, isActive, requests }` |
| `mcp:user:{userId}:tokens` | User's token set | None | Set | `["spapi_live_abc...", "spapi_live_xyz..."]` |
| `mcp:session:{sessionId}` | ChatGPT MCP session | 600s | Hash | `{ userId, created, lastActivity }` |
| `oauth:code:{code}` | Authorization code | 600s | Hash | `{ userId, clientId, codeChallenge, serviceIds }` |
| `oauth:mcp_tokens:{code}` | Temp MCP token storage | 600s | String (JSON) | `["spapi_live_abc...", ...]` |
| `oauth:token:{oat_token}` | OAuth token metadata | 43200s | Hash | `{ mcp_tokens, client_id, service_ids }` |
| `service:{id}:published` | Published service data | None | Hash | `{ title, inputs, outputs, areas, aiDescription }` |
| `result:{id}:{hash}` | Cached calculation result | 86400s | String (JSON) | `{ outputs, metadata, timestamp }` |
| `user:{userId}:services` | User's service index | None | Hash | `{ serviceId: timestamp, ... }` |

### API Endpoints Reference

#### Service API (v1)

```
POST   /api/v1/services/{id}/execute
GET    /api/v1/services/{id}/execute?param1=value1
GET    /api/v1/services/{id}/definition
GET    /api/v1/services/{id}/openapi
POST   /api/v1/services/{id}/validate
POST   /api/v1/services/{id}/batch
GET    /api/v1/services
GET    /api/v1/openapi
```

#### MCP Endpoints

```
POST   /api/mcp                    # ChatGPT HTTP transport
POST   /api/mcp/bridge             # Claude Desktop bridge
POST   /api/mcp/create-token       # Create MCP token
POST   /api/mcp/update-token       # Update token metadata
GET    /api/mcp/tokens             # List user's tokens
GET    /api/mcp/tokens/{tokenId}   # Get token details
DELETE /api/mcp/tokens/{tokenId}   # Revoke token
```

#### OAuth Endpoints

```
GET    /.well-known/oauth-authorization-server
POST   /api/oauth/authorize
POST   /api/oauth/token
OPTIONS /api/oauth/authorize
OPTIONS /api/oauth/token
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Application
NEXT_PUBLIC_APP_URL=https://spreadapi.io
NODE_ENV=production

# MCP Bridge (for users)
SPREADAPI_TOKEN=spapi_live_...     # User's MCP token
SPREADAPI_URL=https://spreadapi.io/api/mcp/bridge
```

### File Structure Reference

```
/Users/stephanmethner/AR/repos/spreadapi/
│
├── packages/
│   └── spreadapi-mcp/             # NPM package for Claude Desktop
│       ├── index.js               # stdio-to-HTTP bridge
│       └── package.json           # v1.1.0
│
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   └── services/
│   │   │       └── [id]/
│   │   │           └── execute/
│   │   │               ├── route.js          # Main execution endpoint
│   │   │               └── calculateDirect.js # Direct calculation logic
│   │   │
│   │   ├── mcp/
│   │   │   ├── route.js           # ChatGPT HTTP transport
│   │   │   ├── bridge/
│   │   │   │   ├── route.js       # Bridge handler (2262 lines)
│   │   │   │   ├── areaExecutors.js
│   │   │   │   └── executeEnhancedCalc.js
│   │   │   ├── create-token/
│   │   │   │   └── route.js
│   │   │   └── tokens/
│   │   │       ├── route.js
│   │   │       └── [tokenId]/route.js
│   │   │
│   │   ├── oauth/
│   │   │   ├── authorize/
│   │   │   │   └── route.js       # OAuth authorization backend
│   │   │   └── token/
│   │   │       └── route.js       # OAuth token exchange
│   │   │
│   │   └── .well-known/
│   │       └── oauth-authorization-server/
│   │           └── route.js       # OAuth discovery
│   │
│   └── oauth/
│       └── authorize/
│           └── page.tsx           # OAuth authorization UI
│
├── lib/
│   ├── mcp-auth.js                # Token validation (MCP + OAuth)
│   ├── mcp-ai-instructions.js     # AI guidance system
│   ├── oauth-codes.js             # Authorization code management
│   ├── mcpState.js                # State save/load functionality
│   └── redis.js                   # Redis connection
│
└── docs/
    └── mcp/
        ├── COMPLETE_ARCHITECTURE_GUIDE.md  # This file
        ├── SIMPLIFIED_OAUTH_FLOW.md
        ├── CHATGPT_SETUP_GUIDE.md
        └── CHATGPT_OAUTH_IMPLEMENTATION.md
```

---

## Best Practices

### For Service Creators

#### 1. Provide AI Guidance

**Always include AI metadata when publishing services:**

```javascript
{
  aiDescription: "Calculate German income tax (Lohnsteuer) for employees",
  aiUsageGuidance: "Use when user asks about German salary, tax, or net income. Always ask for gross salary and tax class.",
  aiUsageExamples: [
    "What's my net salary at €60,000 in Germany?",
    "Calculate tax on €45,000 gross income in tax class 1"
  ],
  aiTags: ["finance", "tax", "germany", "salary", "income"]
}
```

#### 2. Mark Percentage Parameters

**Always mark percentage inputs correctly:**

```javascript
{
  name: "interest_rate",
  type: "number",
  format: "percentage",  // ← This tells AI to convert!
  description: "Annual interest rate (e.g., 5% = 0.05)",
  min: 0,
  max: 1
}
```

#### 3. Provide Output Formatting

**Always include formatString for proper display:**

```javascript
{
  name: "monthly_payment",
  title: "Monthly Payment",     // ← User-friendly label
  type: "number",
  formatString: "$#,##0.00",    // ← Excel format for $1,234.56
  description: "Monthly payment amount"
}
```

#### 4. Use Clear Parameter Names

**Good:**
```javascript
{ name: "gross_income", title: "Gross Annual Income" }
{ name: "tax_rate", title: "Tax Rate" }
{ name: "years", title: "Loan Term (Years)" }
```

**Bad:**
```javascript
{ name: "val1", title: "Value 1" }  // Too vague
{ name: "x", title: "X" }           // Unclear
```

#### 5. Provide Meaningful Defaults

```javascript
{
  name: "compounding_frequency",
  type: "number",
  defaultValue: 12,  // Monthly compounding
  description: "Number of times interest compounds per year"
}
```

### For Token Consumers

#### 1. Claude Desktop Setup

**Single token configuration:**

```json
{
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_TOKEN": "spapi_live_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

**Multiple services via single token:**
- Get one token with access to multiple services
- Configure once, access all authorized services

#### 2. ChatGPT Setup

**Multi-token support:**

When authorizing ChatGPT connection, paste all tokens:

```
Token 1: spapi_live_abc... (Mortgage Calculators)
Token 2: spapi_live_xyz... (Tax Calculators)
Token 3: spapi_live_def... (Investment Tools)
```

Result: Access to all services from all tokens!

#### 3. Security Best Practices

🔒 **Treat tokens like passwords:**
- Don't share publicly
- Don't commit to git repositories
- Use environment variables

🔒 **Rotate periodically:**
- Generate new tokens every 90 days
- Revoke old tokens after migration

🔒 **Use service restrictions:**
- Only grant access to needed services
- Create separate tokens for different use cases

### For Developers

#### 1. Cache Awareness

**Understanding the cache layers:**

```javascript
// Layer 1: Redis result cache (24h TTL)
const cacheKey = `result:${serviceId}:${hashInputs(inputs)}`;

// Layer 2: HTTP/CDN cache (5 min)
headers['Cache-Control'] = 'public, max-age=300';

// Bypass for testing
POST /api/v1/services/{id}/execute
{ inputs: {...}, nocache: true }  // Skip all caches
```

**Clear cache when:**
- Republishing service with logic changes
- Debugging unexpected results
- Testing new input combinations

#### 2. Error Handling

**Always check for errors:**

```javascript
const result = await calculateDirect(serviceId, inputs);

if (result.error) {
  console.error('Calculation failed:', {
    error: result.error,
    message: result.message,
    details: result.details,
    parameters: result.parameters
  });
}
```

**Common error types:**
- `VALIDATION_ERROR` - Invalid input types/values
- `SERVICE_NOT_FOUND` - Service doesn't exist or unpublished
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `CALCULATION_ERROR` - Spreadsheet execution failed

#### 3. Performance Optimization

**Use batch API for comparisons:**

```javascript
// Good - Single request
spreadapi_batch({
  calculations: [scenario1, scenario2, scenario3]
})

// Bad - Multiple requests
await spreadapi_calc(scenario1)
await spreadapi_calc(scenario2)
await spreadapi_calc(scenario3)
```

**Use state management for iterative analysis:**

```javascript
// Calculate base scenario
const result1 = await spreadapi_calc({...});

// Save it
await spreadapi_save_state({
  serviceId: "...",
  inputs: {...},
  outputs: result1.outputs,
  label: "Base case"
});

// Calculate alternative
const result2 = await spreadapi_calc({...});

// Compare later
const saved = await spreadapi_load_state({ stateId: "..." });
```

#### 4. AI Integration Tips

**Leverage AI guidance in your apps:**

```javascript
import { getSingleServiceInstructions } from '@/lib/mcp-ai-instructions';

// Get AI-optimized instructions
const instructions = getSingleServiceInstructions('mortgage-calc');

// Use in your AI prompts
const systemPrompt = `
You are a financial calculator assistant.
${instructions}
`;
```

---

## Troubleshooting

### Common Issues

#### 1. "Token not found or inactive"

**Symptoms:**
- MCP tools not showing up
- 401 Unauthorized errors
- "Invalid token format" messages

**Causes:**
- Token was revoked
- Token expired (OAuth tokens: 12h)
- Typo in token
- Token not found in Redis

**Solutions:**
1. Verify token is active in dashboard
2. Check token format: `spapi_live_...` or `oat_...`
3. For OAuth: Re-authorize ChatGPT connection
4. For MCP: Check Claude Desktop config file

#### 2. "Service not found or not published"

**Symptoms:**
- Service appears in list but can't execute
- 404 errors when calling service
- Tool works for some services but not others

**Causes:**
- Service was unpublished
- Service deleted
- Redis cache out of sync

**Solutions:**
1. Check service status in dashboard
2. Verify service is published
3. Check token's serviceIds includes this service
4. Re-publish service if needed

#### 3. "Access denied to this service"

**Symptoms:**
- Can see service in list
- Error when trying to execute
- "Service not accessible with this token"

**Causes:**
- Token doesn't have permission for this service
- serviceIds array doesn't include this service

**Solutions:**
1. Check token's serviceIds in dashboard
2. Create new token with correct services
3. For OAuth: Re-authorize with token that has access

#### 4. Percentage calculation errors

**Symptoms:**
- Results are 100x too large
- Scientific notation in outputs
- Unrealistic values

**Causes:**
- Entered "5" instead of "0.05" for 5%
- AI didn't convert percentage to decimal

**Solutions:**
1. Always convert: 5% → 0.05
2. Check input parameter has `format: "percentage"`
3. Review aiUsageGuidance for percentage warnings
4. Re-calculate with corrected values

#### 5. ChatGPT OAuth connection fails

**Symptoms:**
- Redirect loop
- "Invalid client_id" error
- "PKCE verification failed"

**Causes:**
- MCP tokens invalid or revoked
- PKCE challenge/verifier mismatch
- Authorization code expired (10 min)

**Solutions:**
1. Verify MCP tokens are active
2. Try re-authorizing with fresh tokens
3. Check browser console for errors
4. Contact support if persists

#### 6. Claude Desktop not showing tools

**Symptoms:**
- MCP server connected but no tools
- "No tools available" message
- Empty tools list

**Causes:**
- Token has empty serviceIds (no access)
- No published services
- Network/connection issues

**Solutions:**
1. Check token's serviceIds in dashboard
2. Verify at least one service is published
3. Check SPREADAPI_TOKEN in config
4. Restart Claude Desktop
5. Check logs: `~/Library/Logs/Claude/mcp*.log`

### Debug Mode

**Enable detailed logging:**

```bash
# In Claude Desktop config
{
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_TOKEN": "spapi_live_...",
        "DEBUG": "true"  # Enable debug logging
      }
    }
  }
}
```

**Check logs:**

```bash
# macOS
tail -f ~/Library/Logs/Claude/mcp*.log

# View server logs (Vercel)
vercel logs
```

### Testing Checklist

- [ ] Token validation works (valid token accepted)
- [ ] Token validation fails correctly (invalid token rejected)
- [ ] Service-level permissions enforced
- [ ] Tools list shows only authorized services
- [ ] Percentage inputs convert correctly
- [ ] Format strings applied to outputs
- [ ] Error messages are clear and actionable
- [ ] Cache invalidation works (nocache flag)
- [ ] Batch calculations work
- [ ] State save/load works
- [ ] OAuth flow completes (ChatGPT)
- [ ] PKCE validation works
- [ ] Token revocation propagates immediately

---

## Appendix

### A. JSON-RPC Examples

#### Initialize Request
```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "claude-desktop",
      "version": "1.0.0"
    }
  },
  "id": 1
}
```

#### Initialize Response
```json
{
  "jsonrpc": "2.0",
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": { "listChanged": true },
      "resources": { "subscribe": false }
    },
    "serverInfo": {
      "name": "spreadapi-mcp",
      "version": "1.0.0",
      "description": "Spreadsheet calculations as MCP tools"
    }
  },
  "id": 1
}
```

#### Tools List Request
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "params": {},
  "id": 2
}
```

#### Tools List Response
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {
        "name": "spreadapi_calc",
        "description": "Execute service calculation...",
        "inputSchema": {
          "type": "object",
          "properties": {
            "serviceId": {
              "type": "string",
              "description": "Service to execute"
            },
            "inputs": {
              "type": "object",
              "description": "Input parameters"
            }
          },
          "required": ["serviceId"]
        }
      }
    ]
  },
  "id": 2
}
```

#### Tool Call Request
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "spreadapi_calc",
    "arguments": {
      "serviceId": "mortgage-calc",
      "inputs": {
        "interest_rate": 0.05,
        "principal": 100000,
        "years": 30
      }
    }
  },
  "id": 3
}
```

#### Tool Call Response
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Mortgage Calculator - Calculation Complete\n\n📊 Results:\n  • Monthly Payment: $536.82\n  • Total Interest: $93,255.78\n\n⚡ Completed in 45ms"
      }
    ]
  },
  "id": 3
}
```

### B. OAuth PKCE Example

**Step 1: Generate PKCE**
```javascript
// Client-side (ChatGPT)
const code_verifier = crypto.randomBytes(32).toString('base64url');
// Example: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"

const code_challenge = crypto
  .createHash('sha256')
  .update(code_verifier)
  .digest('base64url');
// Example: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
```

**Step 2: Authorization Request**
```http
GET /oauth/authorize?
  client_id=chatgpt-uuid&
  redirect_uri=https://chatgpt.com/oauth/callback&
  response_type=code&
  scope=mcp:read+mcp:write&
  state=random_csrf_token&
  code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&
  code_challenge_method=S256
```

**Step 3: Token Exchange**
```http
POST /api/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=oac_abc123...&
client_id=chatgpt-uuid&
redirect_uri=https://chatgpt.com/oauth/callback&
code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

**Step 4: Backend Verification**
```javascript
// Server-side
const stored_challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
const received_verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

const computed_challenge = crypto
  .createHash('sha256')
  .update(received_verifier)
  .digest('base64url');

if (computed_challenge === stored_challenge) {
  // ✅ PKCE verified!
  // Issue access token
}
```

### C. Service Definition Example

```javascript
{
  // Basic metadata
  serviceId: "mortgage-calculator",
  title: "Mortgage Payment Calculator",
  description: "Calculate monthly mortgage payments, total interest, and amortization schedules",
  category: "finance",

  // Input parameters
  inputs: [
    {
      name: "principal",
      title: "Loan Amount",
      type: "number",
      mandatory: true,
      description: "Total amount to borrow",
      min: 1000,
      max: 10000000,
      defaultValue: null,
      formatString: "$#,##0.00"
    },
    {
      name: "interest_rate",
      title: "Annual Interest Rate",
      type: "number",
      format: "percentage",
      mandatory: true,
      description: "Annual interest rate (e.g., 5% = 0.05)",
      min: 0,
      max: 1
    },
    {
      name: "years",
      title: "Loan Term",
      type: "number",
      mandatory: true,
      description: "Loan term in years",
      min: 1,
      max: 50,
      allowedValues: [15, 20, 30]
    },
    {
      name: "extra_payment",
      title: "Extra Monthly Payment",
      type: "number",
      mandatory: false,
      description: "Additional payment per month",
      defaultValue: 0,
      min: 0
    }
  ],

  // Output parameters
  outputs: [
    {
      name: "monthly_payment",
      title: "Monthly Payment",
      type: "number",
      formatString: "$#,##0.00",
      description: "Regular monthly payment amount"
    },
    {
      name: "total_interest",
      title: "Total Interest",
      type: "number",
      formatString: "$#,##0.00",
      description: "Total interest paid over loan term"
    },
    {
      name: "total_paid",
      title: "Total Amount Paid",
      type: "number",
      formatString: "$#,##0.00",
      description: "Total amount paid (principal + interest)"
    },
    {
      name: "payoff_date",
      title: "Payoff Date",
      type: "string",
      description: "Expected payoff date"
    }
  ],

  // AI guidance
  aiDescription: "Calculate mortgage payments for home loans. Use when user asks about mortgages, home buying, refinancing, or monthly payment amounts.",
  aiUsageGuidance: "Always convert interest rate to decimal (5% → 0.05). Ask for loan amount, interest rate, and term. Extra payments are optional.",
  aiUsageExamples: [
    "What's my monthly payment on a $300k mortgage at 4.5% for 30 years?",
    "Calculate mortgage for $250,000 at 3.5% interest over 15 years",
    "How much interest will I pay on a $400k home loan?"
  ],
  aiTags: ["finance", "mortgage", "loan", "real-estate", "home-buying"],

  // Settings
  useCaching: true,
  needsToken: false
}
```

---

## Conclusion

SpreadAPI's MCP implementation provides a robust, production-ready integration that:

✅ **Works with both major AI platforms** (Claude Desktop + ChatGPT)
✅ **Uses unified authentication** (MCP tokens as source of truth)
✅ **Supports marketplace model** (token-level service restrictions)
✅ **Provides excellent developer experience** (AI guidance, auto-recovery, format preservation)
✅ **Scales efficiently** (multi-layer caching, Redis sessions, stateless design)

The architecture is clean, maintainable, and well-documented. The simplified OAuth flow (token-based, no login required) makes ChatGPT integration as simple as Claude Desktop while maintaining security through PKCE and service-level permissions.

**Status: ✅ Production Ready - Both MCP integrations working fine**

---

**Document Information**

- **Version:** 1.0
- **Created:** 2025-10-26
- **Last Updated:** 2025-10-26
- **Author:** Senior Developer Review
- **Status:** Complete - All major areas audited and documented
- **Related Docs:**
  - [Simplified OAuth Flow](./SIMPLIFIED_OAUTH_FLOW.md)
  - [ChatGPT Setup Guide](./CHATGPT_SETUP_GUIDE.md)
  - [ChatGPT OAuth Implementation](./CHATGPT_OAUTH_IMPLEMENTATION.md)

---

For questions or support:
- GitHub Issues: https://github.com/anthropics/spreadapi/issues
- Documentation: https://spreadapi.io/docs
- Email: support@spreadapi.io
