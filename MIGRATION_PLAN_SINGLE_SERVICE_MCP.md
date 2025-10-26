# Migration Plan: Multi-Service to Single-Service MCP

**Date:** 2025-10-26
**Status:** Planning Phase
**Author:** Claude (Senior MCP Developer)
**Complexity:** Major Architectural Change
**Estimated Effort:** 2-3 days

---

## 📋 Executive Summary

### Current State (Multi-Service Generic MCP)
- One MCP endpoint serves multiple services
- Custom MCP token system (separate from service tokens)
- Complex discovery process (list services → get details → execute)
- High cognitive load for AI assistants
- Redundant authentication layer

### Target State (Single-Service MCP)
- One MCP endpoint per service
- Uses existing service token authentication
- Direct execution (no discovery needed)
- Low cognitive load for AI assistants
- MCP as thin protocol wrapper

### Key Benefits
✅ **Simpler for AI** - One service = one clear purpose
✅ **Simpler for Users** - One token type (service tokens)
✅ **Simpler for Developers** - Remove entire MCP token system
✅ **Better Marketing** - Share specific calculator, not generic marketplace
✅ **Easier Integration** - Like sharing API endpoint

---

## 🏗️ Current Architecture (To Be Replaced)

### File Structure
```
app/api/mcp/
├── route.js                         # HTTP transport (ChatGPT)
├── bridge/route.js                  # Core handler (2000+ lines)
├── bridge/areaExecutors.js
├── bridge/executeEnhancedCalc.js
├── create-token/route.js            # MCP token creation ❌ REMOVE
├── update-token/route.js            # MCP token update ❌ REMOVE
├── tokens/route.js                  # List MCP tokens ❌ REMOVE
└── tokens/[tokenId]/route.js        # Delete MCP token ❌ REMOVE

app/oauth/
├── authorize/page.tsx               # OAuth UI (multi-token paste)
└── register/route.js                # Dynamic client registration

lib/
├── mcp-auth.js                      # MCP + OAuth auth ⚠️ SIMPLIFY
├── mcp-ai-instructions.js
└── mcpState.js

UI:
├── MCP Settings page                # ❌ REMOVE (redundant)
└── Service API Tokens section       # ✅ ENHANCE (add MCP info)
```

### Authentication Flow
```
1. User creates MCP token
2. User binds services to MCP token
3. Token stored: mcp:token:{token} { serviceIds: [...] }
4. Claude/ChatGPT uses MCP token
5. Backend validates MCP token
6. Backend checks service permissions
7. Backend calls service API

Result: TWO token systems for same services
```

### MCP Tools Exposed
```
- spreadapi_list_services       # Discovery (not needed in single-service)
- spreadapi_get_service_details # Discovery (not needed in single-service)
- spreadapi_calc                # Generic execution
- spreadapi_read_area           # Area operations
- spreadapi_batch               # Batch calculations
- spreadapi_save_state          # State management
- spreadapi_load_state          # State management
- spreadapi_list_states         # State management
```

---

## 🎯 New Architecture (Single-Service MCP)

### URL Pattern
```
Old (Generic):
https://spreadapi.io/api/mcp
└─ Serves all services via one endpoint

New (Single-Service):
https://spreadapi.io/api/mcp/services/{serviceId}
└─ Each service has dedicated MCP endpoint
```

### Authentication
```
Use existing service token system:
- Query param: ?token={serviceToken}
- Or header: Authorization: Bearer {serviceToken}

No MCP tokens needed!
```

### File Structure (Simplified)
```
app/api/mcp/
├── services/[serviceId]/route.js    # ✨ NEW: Single-service endpoint
│   ├─ POST handler (MCP protocol)
│   └─ OPTIONS handler (CORS)
│
└── [REMOVED]
    ├── route.js (generic HTTP transport)
    ├── bridge/route.js (2000+ line monolith)
    ├── create-token/ (MCP token management)
    ├── update-token/
    └── tokens/

app/oauth/
├── services/[serviceId]/authorize/page.tsx  # ✨ NEW: Per-service OAuth
└── services/[serviceId]/register/route.js   # ✨ NEW: Per-service registration

lib/
├── mcp-service-wrapper.js           # ✨ NEW: Service → MCP adapter
├── mcp-ai-instructions.js           # ✅ KEEP: Reuse for single service
└── mcpState.js                      # ✅ KEEP: Optional state management

UI:
├── Service Detail page
│   └── API Tokens section
│       ├─ Service tokens (existing)
│       └─ ✨ NEW: MCP Integration section
│           ├─ Claude Desktop config (copy-paste)
│           └─ ChatGPT action URL
```

### MCP Tools Exposed (Per Service)
```
- calculate                     # Service-specific, clear name
- [Optional] save_state         # If user wants scenario comparison
- [Optional] load_state
- [Optional] list_states

NO discovery tools needed!
```

---

## ❌ What to Remove

### 1. MCP Token Management Endpoints
**Files to delete:**
```bash
app/api/mcp/create-token/route.js
app/api/mcp/update-token/route.js
app/api/mcp/tokens/route.js
app/api/mcp/tokens/[tokenId]/route.js
```

**Redis keys to stop creating:**
```
mcp:token:{token}               # MCP token data
mcp:user:{userId}:tokens        # User's MCP tokens set
```

**Reason:** Using service tokens instead

---

### 2. Generic MCP Endpoints
**Files to delete:**
```bash
app/api/mcp/route.js            # Generic HTTP transport
app/api/mcp/bridge/route.js     # 2000+ line monolith
```

**Reason:** Replaced by single-service endpoints

---

### 3. MCP-Specific Auth Code
**File to modify:**
```bash
lib/mcp-auth.js
```

**Remove:**
- `generateToken()` function (MCP token generation)
- `createToken()` function (MCP token creation)
- `validateToken()` function (MCP token validation)
- `getUserTokens()` function (List MCP tokens)
- `updateToken()` function (Update MCP token)
- `deleteToken()` function (Delete MCP token)

**Keep:**
- `validateOAuthToken()` (if keeping OAuth for ChatGPT)
- Service token validation (existing system)

---

### 4. Discovery Tools Code
**In bridge/route.js, remove:**
- `spreadapi_list_services` tool definition + handler
- `spreadapi_get_service_details` tool definition + handler
- `buildServiceListDescription()` function (partial - simplify)

**Reason:** No discovery needed in single-service MCP

---

### 5. Generic Tool Names
**Replace:**
```javascript
// OLD (generic)
tools: [
  { name: 'spreadapi_calc', ... },
  { name: 'spreadapi_read_area', ... },
  { name: 'spreadapi_batch', ... }
]

// NEW (service-specific)
tools: [
  { name: 'calculate', ... },           // Main calculation
  { name: 'read_area', ... },           // If service has areas
  { name: 'batch_calculate', ... }      // If batch supported
]
```

---

### 6. Multi-Service OAuth UI
**File to modify/remove:**
```bash
app/oauth/authorize/page.tsx
```

**Current:** Accepts multiple MCP tokens
**New:** Per-service OAuth (one service token)

---

### 7. MCP Settings Page (UI)
**File to delete:**
```bash
app/(dashboard)/settings/mcp/page.tsx   # Or wherever MCP settings live
```

**Reason:** Redundant - MCP info moved to service detail pages

---

### 8. Navigation Menu Entry
**Remove menu item:** "MCP Settings" or "MCP Integration"
**Keep:** "Services" → Service Detail → API section (with MCP info)

---

## ✨ What to Create

### 1. Single-Service MCP Endpoint
**New file:** `app/api/mcp/services/[serviceId]/route.js`

**Responsibilities:**
- Load service metadata from Redis
- Validate service token (existing system)
- Generate MCP protocol response
- Expose service-specific tool(s)
- Handle tool execution
- Return formatted results

**Key features:**
- Service name → MCP server name
- Service description → MCP description
- Service inputs → Tool inputSchema
- Service outputs → Response format
- Service-specific AI instructions

**Pseudocode:**
```javascript
export async function POST(request, { params }) {
  const { serviceId } = params;

  // 1. Validate service token (existing system)
  const token = extractToken(request);
  const validation = await validateServiceToken(serviceId, token);
  if (!validation.valid) return unauthorized();

  // 2. Load service metadata
  const service = await loadService(serviceId);
  if (!service || !service.published) return notFound();

  // 3. Parse JSON-RPC request
  const { method, params } = await request.json();

  // 4. Handle MCP methods
  switch (method) {
    case 'initialize':
      return mcpInitialize(service);

    case 'tools/list':
      return mcpToolsList(service);

    case 'tools/call':
      return mcpToolsCall(service, params);
  }
}
```

---

### 2. Service Wrapper Library
**New file:** `lib/mcp-service-wrapper.js`

**Purpose:** Convert service metadata → MCP protocol

**Functions:**
```javascript
/**
 * Generate MCP initialize response from service
 */
export function generateMcpInitialize(service) {
  return {
    protocolVersion: '2024-11-05',
    capabilities: { tools: { listChanged: true } },
    serverInfo: {
      name: service.name,
      description: service.description,
      instructions: generateInstructions(service)
    }
  };
}

/**
 * Generate MCP tools list from service
 */
export function generateMcpTools(service) {
  const tools = [];

  // Main calculation tool
  tools.push({
    name: 'calculate',
    description: generateToolDescription(service),
    inputSchema: convertInputsToSchema(service.inputs)
  });

  // Area tools (if service has areas)
  if (service.areas && service.areas.length > 0) {
    tools.push({
      name: 'read_area',
      description: 'Read data from editable spreadsheet area',
      inputSchema: { ... }
    });
  }

  return tools;
}

/**
 * Convert service inputs to JSON Schema
 */
export function convertInputsToSchema(inputs) {
  const properties = {};
  const required = [];

  for (const input of inputs) {
    properties[input.name] = {
      type: input.type,
      description: input.description,
      ...(input.enum ? { enum: input.enum } : {}),
      ...(input.min !== undefined ? { minimum: input.min } : {}),
      ...(input.max !== undefined ? { maximum: input.max } : {})
    };

    if (input.required) {
      required.push(input.name);
    }
  }

  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false
  };
}
```

---

### 3. Per-Service OAuth (ChatGPT)
**New files:**
```bash
app/oauth/services/[serviceId]/authorize/page.tsx
app/oauth/services/[serviceId]/register/route.js
app/api/oauth/services/[serviceId]/token/route.js
app/.well-known/services/[serviceId]/oauth-authorization-server/route.js
```

**OR - Simpler Option:**
Keep generic OAuth but:
- User pastes service token (not MCP token)
- OAuth validates service token
- OAuth returns wrapped token
- MCP endpoint unwraps to get service token

**Recommendation:** Start without OAuth, add later if needed
**Reason:** Simpler rollout, OAuth is nice-to-have

---

### 4. Service Detail Page - MCP Section
**File to modify:** `app/(dashboard)/services/[id]/page.tsx` (or similar)

**New section: "MCP Integration"**

**Content:**
```tsx
<Section title="MCP Integration">
  <p>Connect this service to AI assistants via Model Context Protocol</p>

  <Tabs>
    <Tab label="Claude Desktop">
      <CodeBlock language="json" copyable>
        {JSON.stringify({
          mcpServers: {
            [serviceName]: {
              url: `https://spreadapi.io/api/mcp/services/${serviceId}`,
              headers: {
                Authorization: `Bearer ${serviceToken}`
              }
            }
          }
        }, null, 2)}
      </CodeBlock>

      <Instructions>
        1. Open Claude Desktop settings
        2. Go to Developer → Edit Config
        3. Add this configuration
        4. Restart Claude Desktop
      </Instructions>
    </Tab>

    <Tab label="ChatGPT">
      <Input
        label="MCP Endpoint URL"
        value={`https://spreadapi.io/api/mcp/services/${serviceId}`}
        copyable
      />

      <Instructions>
        1. Open ChatGPT → Settings → Personalization
        2. Click "Add action"
        3. Enter the URL above
        4. Configure authentication:
           - Type: API Key
           - Header: Authorization
           - Value: Bearer {serviceToken}
        5. Save
      </Instructions>
    </Tab>
  </Tabs>
</Section>
```

---

### 5. Service-Specific AI Instructions
**Use existing:** `lib/mcp-ai-instructions.js`

**But generate service-specific instructions:**
```javascript
export function generateServiceInstructions(service) {
  return `🎯 ${service.name}

${service.description}

When user asks about ${service.category || 'calculations'}:
→ Call the 'calculate' tool with required parameters

${generateParameterGuidance(service.inputs)}

${service.aiDescription ? `⚠️  IMPORTANT: ${service.aiDescription}` : ''}

${service.aiUsageGuidance ? `💡 GUIDANCE: ${service.aiUsageGuidance}` : ''}`;
}
```

---

### 6. Well-Known Endpoint (Per Service)
**New file:** `app/.well-known/services/[serviceId]/mcp.json/route.js`

**Purpose:** Service discovery for MCP clients

**Response:**
```json
{
  "schemaVersion": "1.0",
  "name": "German Tax Calculator",
  "description": "Calculate German income taxes",
  "icon": "https://spreadapi.io/icons/tax-calc.png",
  "mcp": {
    "version": "2024-11-05",
    "endpoint": "https://spreadapi.io/api/mcp/services/abc123",
    "transport": "http"
  }
}
```

---

## 🔄 Migration Steps (Detailed)

### Phase 1: Preparation (4-6 hours)
**Goal:** Create new system alongside old system

**Steps:**

1. **Create new endpoint structure**
   ```bash
   mkdir -p app/api/mcp/services/[serviceId]
   touch app/api/mcp/services/[serviceId]/route.js
   ```

2. **Create service wrapper library**
   ```bash
   touch lib/mcp-service-wrapper.js
   ```

3. **Copy existing utilities**
   - Copy `formatValueWithExcelFormat` (already in utils/formatting.js)
   - Copy state management functions (already in lib/mcpState.js)
   - Keep `lib/mcp-ai-instructions.js` (adapt for single service)

4. **Test with ONE service**
   - Pick a simple published service
   - Implement single-service MCP endpoint
   - Test with Claude Desktop
   - Verify tool execution

**Completion Criteria:**
✅ New endpoint structure created
✅ Service wrapper library functional
✅ One service working via new MCP endpoint
✅ Old system still functional (parallel operation)

---

### Phase 2: Implementation (8-12 hours)
**Goal:** Build complete single-service MCP system

**Steps:**

1. **Implement core endpoint** (`app/api/mcp/services/[serviceId]/route.js`)
   - [ ] Load service metadata from Redis
   - [ ] Validate service token (reuse existing validation)
   - [ ] Handle initialize method
   - [ ] Handle tools/list method
   - [ ] Handle tools/call method (calculate tool)
   - [ ] Format outputs with formatString
   - [ ] Error handling with helpful messages

2. **Implement service wrapper** (`lib/mcp-service-wrapper.js`)
   - [ ] `generateMcpInitialize(service)` function
   - [ ] `generateMcpTools(service)` function
   - [ ] `convertInputsToSchema(inputs)` function
   - [ ] `generateToolDescription(service)` function
   - [ ] `generateServiceInstructions(service)` function

3. **Add optional features**
   - [ ] Area read tool (if service has areas)
   - [ ] Batch calculation tool
   - [ ] State management tools (save/load/list)

4. **Add UI integration**
   - [ ] Modify service detail page
   - [ ] Add "MCP Integration" section
   - [ ] Claude Desktop config generator
   - [ ] ChatGPT action URL display
   - [ ] Copy-paste functionality

5. **Testing**
   - [ ] Test with 5+ different services
   - [ ] Test public services (no token)
   - [ ] Test private services (with token)
   - [ ] Test services with areas
   - [ ] Test services with enums/booleans
   - [ ] Test percentage inputs
   - [ ] Test formatString outputs

**Completion Criteria:**
✅ All services accessible via new endpoints
✅ Claude Desktop integration working
✅ UI shows MCP integration info
✅ All tests passing
✅ Old system still functional (parallel operation)

---

### Phase 3: Migration (2-4 hours)
**Goal:** Switch users from old to new system

**Steps:**

1. **Communicate with users**
   - [ ] Email announcement: "MCP Integration Simplified!"
   - [ ] In-app banner: "New: Direct MCP URLs per service"
   - [ ] Document migration path

2. **Provide migration guide**
   ```
   OLD Claude Desktop Config:
   {
     "mcpServers": {
       "spreadapi": {
         "url": "https://spreadapi.io/api/mcp/bridge",
         "headers": {
           "Authorization": "Bearer spapi_live_OLD_TOKEN"
         }
       }
     }
   }

   NEW Claude Desktop Config:
   {
     "mcpServers": {
       "german-tax-calc": {
         "url": "https://spreadapi.io/api/mcp/services/SERVICE_ID",
         "headers": {
           "Authorization": "Bearer service_token_123"
         }
       },
       "loan-calculator": {
         "url": "https://spreadapi.io/api/mcp/services/SERVICE_ID_2",
         "headers": {
           "Authorization": "Bearer service_token_456"
         }
       }
     }
   }
   ```

3. **Deprecation timeline**
   - Day 1: Announce new system
   - Week 1: Both systems running (parallel)
   - Week 2: Warning on old MCP settings page
   - Week 4: Old endpoints return deprecation notice
   - Week 6: Old endpoints removed

4. **Monitor migration**
   - [ ] Track old endpoint usage (declining)
   - [ ] Track new endpoint usage (growing)
   - [ ] Monitor error rates
   - [ ] Collect user feedback

**Completion Criteria:**
✅ Users notified of migration
✅ Migration guide published
✅ Both systems operational
✅ Migration timeline communicated

---

### Phase 4: Cleanup (2-3 hours)
**Goal:** Remove old MCP system

**Steps:**

1. **Wait for migration period** (suggested: 4-6 weeks)

2. **Remove old endpoints**
   ```bash
   rm -rf app/api/mcp/route.js
   rm -rf app/api/mcp/bridge/
   rm -rf app/api/mcp/create-token/
   rm -rf app/api/mcp/update-token/
   rm -rf app/api/mcp/tokens/
   ```

3. **Remove MCP token management**
   ```bash
   # Remove UI pages
   rm -rf app/(dashboard)/settings/mcp/

   # Clean up lib/mcp-auth.js
   # Remove MCP token functions, keep OAuth if needed
   ```

4. **Remove navigation menu entry**
   - Delete "MCP Settings" menu item
   - Update navigation config

5. **Clean up Redis** (optional, keys expire naturally)
   ```bash
   # These will expire on their own, but can manually delete:
   # redis-cli KEYS "mcp:token:*" | xargs redis-cli DEL
   # redis-cli KEYS "mcp:user:*:tokens" | xargs redis-cli DEL
   ```

6. **Update documentation**
   - [ ] Update API docs
   - [ ] Update MCP integration guide
   - [ ] Update README
   - [ ] Archive old docs with "DEPRECATED" notice

**Completion Criteria:**
✅ Old endpoints removed
✅ Old UI removed
✅ Codebase cleaned
✅ Documentation updated
✅ Old endpoint redirects to guide (optional)

---

## 🖥️ UI/UX Changes

### Remove: "MCP Settings" Page
**Current location:** Settings → MCP Integration (or similar)

**Why remove:**
- Redundant with service-level integration
- Created confusion (two token types)
- Users should configure MCP per service

**Redirect to:** Service list with banner explaining change

---

### Enhance: Service Detail Page → API Section
**Current:** Shows service tokens only
**New:** Shows service tokens + MCP integration

**New sections:**

1. **Service Tokens (existing)**
   - Create/delete service tokens
   - Copy token to clipboard
   - Show token usage stats

2. **MCP Integration (NEW)**
   - Claude Desktop configuration (JSON)
   - ChatGPT action URL
   - Copy-paste snippets
   - Platform-specific instructions
   - Link to MCP documentation

**Mockup:**
```
┌─────────────────────────────────────────────────┐
│ Service: German Tax Calculator                   │
├─────────────────────────────────────────────────┤
│                                                  │
│ [Overview] [API] [Analytics] [Settings]         │
│                                                  │
│ ┌─ API Access ─────────────────────────────┐   │
│ │                                           │   │
│ │ Service Tokens                            │   │
│ │ ├─ token_abc123... (Created: 2 days ago) │   │
│ │ └─ [+ Create New Token]                   │   │
│ │                                           │   │
│ │ MCP Integration                           │   │
│ │ ├─ [Claude Desktop] [ChatGPT]            │   │
│ │ │                                         │   │
│ │ │  Claude Desktop Configuration:          │   │
│ │ │  ┌──────────────────────────────────┐  │   │
│ │ │  │ {                                │  │   │
│ │ │  │   "mcpServers": {                │  │   │
│ │ │  │     "german-tax-calc": {         │  │   │
│ │ │  │       "url": "https://...",      │  │   │
│ │ │  │       "headers": { ... }         │  │   │
│ │ │  │     }                            │  │   │
│ │ │  │   }                              │  │   │
│ │ │  │ }                                │  │   │
│ │ │  │                      [Copy]      │  │   │
│ │ │  └──────────────────────────────────┘  │   │
│ │ │                                         │   │
│ │ │  [View Setup Instructions]             │   │
│ │ └─────────────────────────────────────────┤   │
│ └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

### Update: Navigation Menu
**Remove:**
```
Settings
├─ Profile
├─ Billing
├─ MCP Integration    ← DELETE THIS
└─ Account
```

**Keep:**
```
Services
├─ All Services
└─ [Service Detail]
    └─ API tab
        ├─ Service Tokens
        └─ MCP Integration  ← NEW SECTION HERE
```

---

## 🧪 Testing Strategy

### Unit Tests
**New files to test:**
```javascript
// lib/mcp-service-wrapper.test.js
describe('generateMcpInitialize', () => {
  it('should convert service metadata to MCP initialize response', () => {
    const service = { name: 'Test', description: 'Test service', ... };
    const result = generateMcpInitialize(service);
    expect(result.serverInfo.name).toBe('Test');
  });
});

describe('convertInputsToSchema', () => {
  it('should convert service inputs to JSON Schema', () => {
    const inputs = [
      { name: 'amount', type: 'number', required: true, min: 0 }
    ];
    const schema = convertInputsToSchema(inputs);
    expect(schema.properties.amount.type).toBe('number');
    expect(schema.required).toContain('amount');
  });
});
```

---

### Integration Tests
**Test scenarios:**

1. **Public service (no token)**
   ```bash
   curl -X POST https://spreadapi.io/api/mcp/services/PUBLIC_SERVICE \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"initialize","id":1}'

   Expected: 200 OK with MCP initialize response
   ```

2. **Private service (with token)**
   ```bash
   curl -X POST https://spreadapi.io/api/mcp/services/PRIVATE_SERVICE?token=SERVICE_TOKEN \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"calculate","arguments":{...}},"id":2}'

   Expected: 200 OK with calculation results
   ```

3. **Private service (without token)**
   ```bash
   curl -X POST https://spreadapi.io/api/mcp/services/PRIVATE_SERVICE \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"initialize","id":1}'

   Expected: 401 Unauthorized
   ```

4. **Service not found**
   ```bash
   curl -X POST https://spreadapi.io/api/mcp/services/NONEXISTENT \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"initialize","id":1}'

   Expected: 404 Not Found
   ```

---

### End-to-End Tests

**Claude Desktop:**
1. Create service with 2 inputs, 1 output
2. Publish service
3. Get service token
4. Configure Claude Desktop with new MCP endpoint
5. Restart Claude Desktop
6. Ask Claude to use the service
7. Verify: Tool appears, parameters correct, execution works

**ChatGPT:**
1. Same service as above
2. Add action in ChatGPT with MCP URL + service token
3. Ask ChatGPT to use the service
4. Verify: Tool appears, parameters correct, execution works

---

## 🔙 Rollback Plan

### If Migration Fails

**Scenario:** New single-service MCP has critical bugs

**Rollback steps:**

1. **Keep old endpoints running** (already done in parallel phase)
2. **Revert UI changes** (git revert)
3. **Communicate to users**: "Temporary issue, please use old config"
4. **Fix bugs in new system**
5. **Retry migration**

**Time to rollback:** < 1 hour (if old system still running)

---

### If Partial Migration
**Scenario:** Some users migrated, others haven't

**Support strategy:**
- Keep both systems running for extended period (8-12 weeks)
- Provide side-by-side comparison docs
- Offer migration assistance
- Monitor error rates on both endpoints

---

## 📊 Success Metrics

### Technical Metrics
- [ ] New endpoint latency < 100ms (p95)
- [ ] Error rate < 0.1%
- [ ] 100% of services accessible via new endpoints
- [ ] Unit test coverage > 80%

### Migration Metrics
- [ ] Week 1: 20% users migrated
- [ ] Week 2: 50% users migrated
- [ ] Week 4: 80% users migrated
- [ ] Week 6: 95% users migrated

### User Satisfaction
- [ ] User feedback > 4.0/5.0
- [ ] Support tickets about MCP decrease
- [ ] Time-to-setup decreases (measure via analytics)

---

## ⏱️ Timeline Estimate

### Detailed Breakdown

**Week 1:**
- Days 1-2: Phase 1 (Preparation) - 12 hours
- Days 3-5: Phase 2 (Implementation) - 20 hours
- Total: 32 hours = 4 full days

**Week 2-6:**
- Phase 3 (Migration) - 4 hours + monitoring
- User communication and support
- Bug fixes and refinements

**Week 6-8:**
- Phase 4 (Cleanup) - 3 hours
- Documentation updates
- Post-mortem

**Total Active Development:** ~40 hours (1 week)
**Total Project Timeline:** 6-8 weeks (including migration period)

---

## 📝 Implementation Checklist

### Phase 1: Preparation
- [ ] Create `app/api/mcp/services/[serviceId]/route.js`
- [ ] Create `lib/mcp-service-wrapper.js`
- [ ] Test with one simple service
- [ ] Verify Claude Desktop integration works
- [ ] Document findings

### Phase 2: Implementation
- [ ] Implement initialize method
- [ ] Implement tools/list method
- [ ] Implement tools/call method (calculate)
- [ ] Add formatString output handling
- [ ] Add error handling
- [ ] Add UI section to service detail page
- [ ] Test with 5+ services
- [ ] Write unit tests
- [ ] Write integration tests

### Phase 3: Migration
- [ ] Draft user communication email
- [ ] Create migration guide page
- [ ] Add in-app banner
- [ ] Monitor old endpoint usage
- [ ] Provide user support
- [ ] Collect feedback

### Phase 4: Cleanup
- [ ] Remove old MCP endpoints
- [ ] Remove MCP token management
- [ ] Remove MCP settings page
- [ ] Update navigation menu
- [ ] Update documentation
- [ ] Run final tests

---

## 🚨 Risk Assessment

### High Risk
**Risk:** Users don't migrate, keep using old system
**Mitigation:** Long migration period (6 weeks), clear communication, provide support

### Medium Risk
**Risk:** Service token validation has bugs
**Mitigation:** Reuse existing service token system (proven), thorough testing

### Low Risk
**Risk:** MCP protocol changes
**Mitigation:** Follow spec closely, support multiple versions

---

## 📚 Additional Resources

### MCP Specification
- Official docs: https://modelcontextprotocol.io
- Protocol versions: 2024-11-05, 2025-03-26, 2025-06-18

### Service Token System
- Already implemented and proven
- Located in: `lib/service-auth.js` (or similar)
- No changes needed to core auth

### JSON-RPC 2.0
- Specification: https://www.jsonrpc.org/specification
- Error codes: -32700 to -32603 (standard), -32001+ (custom)

---

## 🎯 Next Steps for Implementation

### Immediate (Today):
1. Review this plan with team
2. Get approval for architecture change
3. Create feature branch: `feature/single-service-mcp`
4. Start Phase 1 (Preparation)

### This Week:
1. Complete Phase 1 + Phase 2
2. Test with multiple services
3. Demo to stakeholders

### Next 6 Weeks:
1. Phase 3 (Migration)
2. User communication
3. Monitoring and support

### Week 6-8:
1. Phase 4 (Cleanup)
2. Documentation
3. Post-mortem and learnings

---

## 💬 Questions for Product Team

Before implementation, clarify:

1. **OAuth for ChatGPT:** Keep or remove?
   - Keep: Better UX, more complex
   - Remove: Simpler, users paste service tokens directly

2. **Migration timeline:** 4 weeks or 6 weeks?
   - Shorter: Faster cleanup, some users may not migrate
   - Longer: More users migrate, old system runs longer

3. **State management:** Keep save/load/list tools?
   - Keep: Users can compare scenarios
   - Remove: Simpler, services are truly stateless

4. **Batch calculations:** Keep batch tool?
   - Keep: Useful for comparisons
   - Remove: Simpler, users can call multiple times

5. **Area operations:** Keep for services with editable areas?
   - Keep: Full feature parity
   - Remove: Simplify to read-only calculations

**Recommendation:** Start minimal (just calculate tool), add features based on user feedback

---

## 📄 Appendix: Code Examples

### Example: Service Wrapper Function
```javascript
// lib/mcp-service-wrapper.js

export function generateMcpTools(service) {
  const tools = [];

  // Main calculation tool
  tools.push({
    name: 'calculate',
    description: `${service.description}

PARAMETERS:
${service.inputs.map(i => `• ${i.name}: ${i.description}${i.required ? ' (required)' : ''}`).join('\n')}

RETURNS:
${service.outputs.map(o => `• ${o.name}: ${o.description}`).join('\n')}

${service.aiDescription ? `⚠️  ${service.aiDescription}` : ''}`,
    inputSchema: convertInputsToSchema(service.inputs)
  });

  return tools;
}
```

### Example: Claude Desktop Config Generator
```javascript
// UI component

function generateClaudeConfig(service, serviceToken) {
  return {
    mcpServers: {
      [service.id]: {
        url: `https://spreadapi.io/api/mcp/services/${service.id}`,
        transport: {
          type: 'http',
          headers: {
            Authorization: `Bearer ${serviceToken}`
          }
        }
      }
    }
  };
}
```

---

**END OF MIGRATION PLAN**

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-26 | Claude | Initial comprehensive plan |

---

## Approval

**Technical Lead:** ________________ Date: ________

**Product Manager:** ________________ Date: ________

**Engineering Manager:** ________________ Date: ________
