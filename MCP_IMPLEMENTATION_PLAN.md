# SpreadAPI MCP Server Implementation Plan

## Project Overview
Implement a remote MCP (Model Context Protocol) server that allows AI assistants like Claude Desktop to discover and execute spreadsheet calculations from SpreadAPI.

## Architecture

```
┌─────────────────┐     stdio      ┌──────────────────┐     HTTPS       ┌─────────────────┐
│  Claude Desktop │ ◄────────────► │  NPM Bridge      │ ◄─────────────► │  SpreadAPI      │
│  (MCP Client)   │                │  (User Machine)  │                 │  MCP Server     │
└─────────────────┘                └──────────────────┘                 └─────────────────┘
                                           │                                      │
                                    Token: spapi_live_xxx                    Validates token
                                                                            Lists services
                                                                            Executes calcs
```

## Implementation Phases

### Phase 1: Token Management System

#### 1.1 Token Model
```javascript
// Redis key structure
`mcp:token:${token}` = {
  name: string,          // "My Claude Assistant"
  description: string,   // Optional description
  created: datetime,     // ISO string
  lastUsed: datetime,    // ISO string
  requests: number,      // Total request count
  userId: string,        // Owner's user ID
  isActive: boolean      // Can be deactivated
}

// User's token set
`mcp:user:${userId}:tokens` = Set<token>

// Token format
`spapi_live_${32-char-random-string}`
```

#### 1.2 Token API Endpoints

**POST /api/mcp/tokens/create**
```typescript
// Request
{
  name: string,
  description?: string
}

// Response
{
  token: string,
  name: string,
  created: datetime
}
```

**GET /api/mcp/tokens**
```typescript
// Response
{
  tokens: [{
    token: string,      // First 8 chars + ...
    name: string,
    created: datetime,
    lastUsed: datetime,
    requests: number
  }]
}
```

**DELETE /api/mcp/tokens/[token]**
```typescript
// Response
{ success: boolean }
```

### Phase 2: MCP Server Implementation

#### 2.1 Main Endpoint: POST /api/mcp/v1

**Authentication:**
- Bearer token in Authorization header
- OR token as query parameter (for SSE support)

**Request Format:**
```json
{
  "jsonrpc": "2.0",
  "method": "methodName",
  "params": {},
  "id": 1
}
```

#### 2.2 Enhanced Service Model with AI Descriptions

**Parameter Structure with Descriptions:**
```typescript
interface Parameter {
  name: string;
  type: 'number' | 'text' | 'boolean' | 'date';
  alias?: string;
  mandatory: boolean;
  min?: number;
  max?: number;
  description?: string;  // AI-friendly explanation
}

interface ServiceDefinition {
  // Existing fields
  id: string;
  name: string;
  description: string;
  inputs: Parameter[];
  outputs: Parameter[];
  
  // New AI-specific fields
  aiDescription?: string;      // Detailed explanation for AI
  aiUsageExamples?: string[];  // Example questions/use cases
  aiTags?: string[];           // Searchable tags
  category?: string;           // Finance, Math, Statistics, etc.
}
```

**Example Enhanced Service:**
```json
{
  "name": "Mortgage Calculator",
  "description": "Calculate monthly mortgage payments",
  "aiDescription": "Calculates fixed-rate mortgage payments using standard amortization. Use for home loans, monthly payments, and interest calculations. Assumes monthly compounding.",
  "aiUsageExamples": [
    "What's the monthly payment on a $300k mortgage at 7%?",
    "How much interest will I pay on a 30-year loan?"
  ],
  "aiTags": ["mortgage", "loan", "real estate", "payment"],
  "inputs": [
    {
      "name": "principal",
      "type": "number",
      "mandatory": true,
      "min": 0,
      "description": "Loan amount in dollars (home price minus down payment)"
    },
    {
      "name": "rate",
      "type": "number", 
      "mandatory": true,
      "min": 0,
      "max": 1,
      "description": "Annual interest rate as decimal (0.07 for 7%)"
    }
  ],
  "outputs": [
    {
      "name": "payment",
      "type": "number",
      "description": "Monthly payment including principal and interest"
    }
  ]
}
```

#### 2.3 Method Implementations

**initialize**
```javascript
// Request
{ "method": "initialize" }

// Response
{
  "protocolVersion": "1.0",
  "capabilities": {
    "tools": {},
    "resources": { "subscribe": false }
  },
  "serverInfo": {
    "name": "spreadapi-mcp",
    "version": "1.0.0"
  }
}
```

**tools/list**
```javascript
// Response with enhanced descriptions
{
  "tools": [{
    "name": "spreadapi_calc_${serviceId}",
    "description": "Service description + AI description if available",
    "inputSchema": {
      "type": "object",
      "properties": {
        "paramName": {
          "type": "number|string",
          "description": "Parameter description from service definition",
          "minimum": 0,  // from parameter min
          "maximum": 100, // from parameter max
          "default": null // if provided
        }
      },
      "required": ["param1", "param2"],
      "additionalProperties": false
    },
    // Extended metadata for AI understanding
    "x-spreadapi-metadata": {
      "category": "Finance",
      "tags": ["mortgage", "loan"],
      "examples": ["Calculate 30-year mortgage payment"],
      "outputDescription": "Returns payment details including monthly amount and total interest"
    }
  }]
}
```

**tools/call**
```javascript
// Request
{
  "method": "tools/call",
  "params": {
    "name": "spreadapi_calc_abc123",
    "arguments": {
      "interest": 0.05,
      "periods": 12
    }
  }
}

// Response
{
  "content": [{
    "type": "text",
    "text": "Result: 1234.56"
  }]
}
```

### Phase 3: NPM Bridge Package

#### 3.1 Package Structure
```
packages/spreadapi-mcp/
├── package.json
├── index.js           # Main executable
├── README.md
└── .env.example
```

#### 3.2 package.json
```json
{
  "name": "spreadapi-mcp",
  "version": "1.0.0",
  "description": "MCP bridge for SpreadAPI",
  "bin": {
    "spreadapi-mcp": "./index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "node-fetch": "^3.3.2"
  },
  "engines": {
    "node": ">=18"
  }
}
```

#### 3.3 Bridge Implementation (index.js)
```javascript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const SPREADAPI_URL = process.env.SPREADAPI_URL || 'https://spreadapi.io';
const SPREADAPI_TOKEN = process.env.SPREADAPI_TOKEN;

// Create transport and forward requests to remote server
```

### Phase 4: Settings UI

#### 4.1 UI Enhancements for Parameter Descriptions

**Parameters Modal Updates:**
```typescript
// Add description field to parameter form
<Form.Item label="Description (for AI assistants)">
  <Input.TextArea
    placeholder="Describe what this parameter represents and how it should be used..."
    value={parameter.description}
    onChange={(e) => updateParameter(index, 'description', e.target.value)}
    rows={2}
    maxLength={500}
    showCount
  />
  <Text type="secondary" style={{ fontSize: '12px' }}>
    This helps AI assistants understand and use this parameter correctly
  </Text>
</Form.Item>
```

**Service Editor Enhancements:**
```typescript
// New fields in service editor
<Collapse>
  <Panel header="AI Assistant Information" key="ai">
    <Form.Item label="AI Description">
      <TextArea
        placeholder="Detailed explanation of what this service does and when to use it..."
        value={aiDescription}
        onChange={(e) => setAiDescription(e.target.value)}
        rows={4}
      />
    </Form.Item>
    
    <Form.Item label="Usage Examples">
      <Select
        mode="tags"
        placeholder="Add example questions or use cases..."
        value={aiUsageExamples}
        onChange={setAiUsageExamples}
      />
    </Form.Item>
    
    <Form.Item label="Tags">
      <Select
        mode="tags"
        placeholder="Add searchable tags..."
        value={aiTags}
        onChange={setAiTags}
      />
    </Form.Item>
    
    <Form.Item label="Category">
      <Select value={category} onChange={setCategory}>
        <Option value="finance">Finance</Option>
        <Option value="math">Mathematics</Option>
        <Option value="statistics">Statistics</Option>
        <Option value="business">Business</Option>
        <Option value="science">Science</Option>
      </Select>
    </Form.Item>
  </Panel>
</Collapse>
```

#### 4.2 MCP Settings Page (/app/mcp-settings/page.tsx)

**Components:**
1. Token Generation Form
   - Name input (required)
   - Description textarea (optional)
   - Generate button

2. Token Display
   - Show full token once (copyable)
   - Warning about saving it

3. Token List
   - Show existing tokens (partial display)
   - Usage statistics
   - Revoke button

4. Integration Instructions
   - Claude Desktop config JSON
   - OS-specific file paths
   - Copy button

#### 4.2 UI Flow
```
Enter Token Name → Generate → Display Token → Copy → Show Config
```

### Phase 5: Integration Details

#### 5.1 Service Discovery Logic
```javascript
// In tools/list handler
1. Get all Redis keys matching "service:*"
2. Filter out special keys (:analytics, :tokens, etc)
3. For each service:
   - Check if published (exists `service:${id}:published`)
   - Get published API definition
   - Transform to MCP tool format
4. Return tool list
```

#### 5.2 Calculation Execution
```javascript
// In tools/call handler
1. Extract serviceId from tool name
2. Validate inputs against schema
3. Build request to /api/getresults
4. Execute and format response
5. Handle errors gracefully
```

### Phase 6: Testing Plan

#### 6.1 Unit Tests
- Token generation and validation
- MCP method handlers
- Service discovery filtering
- Input validation

#### 6.2 Integration Test Script
```bash
# 1. Generate token via API
TOKEN=$(curl -X POST .../api/mcp/tokens/create)

# 2. Test MCP endpoint directly
curl -X POST .../api/mcp/v1 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# 3. Test with bridge
SPREADAPI_TOKEN=$TOKEN npx spreadapi-mcp
```

#### 6.3 End-to-End Test
1. Install bridge locally
2. Configure Claude Desktop
3. Test service discovery
4. Execute calculations
5. Verify results

## File Structure

```
/app/
  api/
    mcp/
      v1/
        route.js           # Main MCP endpoint
      tokens/
        create/
          route.js         # Generate token
        route.js           # List tokens
        [token]/
          route.js         # Delete token
  mcp-settings/
    page.tsx               # Settings UI
    
/packages/
  spreadapi-mcp/           # NPM bridge package
    index.js
    package.json
    README.md

/lib/
  mcp-auth.js              # Token validation middleware
  mcp-tools.js             # Tool transformation utilities
```

## Implementation Checklist

### Backend - Token System
- [ ] Token storage in Redis
- [ ] Token generation endpoint
- [ ] Token list endpoint  
- [ ] Token revoke endpoint
- [ ] Token validation middleware

### Backend - MCP Server
- [ ] MCP v1 endpoint structure
- [ ] Initialize method
- [ ] Tools/list method with enhanced descriptions
- [ ] Tools/call method
- [ ] Error handling with proper JSON-RPC codes
- [ ] CORS headers for browser clients

### Backend - Service Enhancements
- [ ] Add description field to parameter model
- [ ] Add AI metadata fields to service model
- [ ] Update publish service to include new fields
- [ ] Migrate existing services (optional descriptions)

### Frontend - UI Updates
- [ ] Add description textarea to Parameters modal
- [ ] Add AI Information section to service editor
- [ ] Create MCP Settings page
- [ ] Token generation form
- [ ] Token list with usage stats
- [ ] Claude config display component

### NPM Bridge Package
- [ ] Create package structure
- [ ] Implement stdio-to-HTTP bridge
- [ ] Add error handling and retry logic
- [ ] Create README with setup instructions
- [ ] Publish to NPM

### Testing & Documentation
- [ ] Integration testing with Claude Desktop
- [ ] API documentation
- [ ] User setup guide
- [ ] Example service definitions

## Key Decisions

1. **Simple Token Model**: No complex permissions, all tokens can browse and calculate
2. **Tool Naming**: `spreadapi_calc_${serviceId}` for easy parsing
3. **Direct Execution**: Use existing `/api/getresults` endpoint
4. **Stateless Bridge**: Bridge only translates protocols
5. **No Rate Limiting**: Add later if needed (development phase)
6. **Rich Parameter Descriptions**: Each input/output parameter includes AI-friendly descriptions
7. **Service AI Metadata**: Services include AI descriptions, usage examples, and tags

## Environment Variables

**Server:**
```env
# Already configured in SpreadAPI
REDIS_HOST=...
REDIS_PASSWORD=...
```

**Bridge (User's machine):**
```env
SPREADAPI_URL=https://spreadapi.io  # or http://localhost:3000
SPREADAPI_TOKEN=spapi_live_xxxxx
```

## Success Criteria

1. Claude Desktop can discover all published SpreadAPI services
2. Services appear with correct parameter schemas
3. Calculations execute and return correct results
4. Token management is simple and secure
5. Setup process takes < 5 minutes for users

## Notes for Implementation

1. Use existing Redis connection from `/lib/redis.js`
2. Reuse authentication patterns from existing API routes
3. Follow Next.js App Router conventions
4. Keep MCP protocol implementation simple
5. Focus on core functionality over edge cases

This plan provides everything needed to implement a working MCP server for SpreadAPI. The implementation should take approximately 2 days with testing.