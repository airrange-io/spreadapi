# MCP (Model Context Protocol) Implementation Guide

## Overview

This guide explains how to implement an MCP server with a remote bridge, enabling Claude Desktop to interact with your web application through a secure, authenticated API. The implementation consists of three main components:

1. **HTTP MCP Server** - Your web app's API endpoint that implements the MCP protocol
2. **Bridge Package** - NPM package that connects Claude Desktop to your HTTP server
3. **Token Management** - Authentication and permission system

## Architecture

```
┌─────────────────┐     stdio     ┌──────────────┐     HTTP      ┌──────────────┐
│ Claude Desktop  │ ◄───────────► │ Bridge (NPM) │ ◄───────────► │ Your Web App │
│                 │               │              │                │ (MCP Server) │
└─────────────────┘               └──────────────┘                └──────────────┘
```

## Step 1: Implement the HTTP MCP Server

### 1.1 Create the Main MCP Endpoint

Create `/api/mcp/v1/route.ts` (or equivalent in your framework):

```typescript
import { NextRequest, NextResponse } from 'next/server';

// MCP Protocol version
const PROTOCOL_VERSION = '2024-11-05';

export async function POST(req: NextRequest) {
  try {
    // 1. Validate authentication (Bearer token or query param)
    const auth = req.headers.get('Authorization');
    const token = auth?.startsWith('Bearer ') ? auth.substring(7) : 
                  new URL(req.url).searchParams.get('token');
    
    if (!token || !await validateToken(token)) {
      return NextResponse.json({
        jsonrpc: '2.0',
        error: { code: -32001, message: 'Authentication required' }
      }, { status: 401 });
    }
    
    // 2. Parse JSON-RPC request
    const body = await req.json();
    const { method, params, id } = body;
    
    // 3. Handle MCP methods
    let result;
    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: {},
            resources: {},
            prompts: {}
          },
          serverInfo: {
            name: 'your-app-mcp',
            version: '1.0.0'
          }
        };
        break;
        
      case 'tools/list':
        result = {
          tools: [
            {
              name: 'your_tool_name',
              description: 'What this tool does',
              inputSchema: {
                type: 'object',
                properties: {
                  param1: { type: 'string', description: 'Parameter description' }
                },
                required: ['param1']
              }
            }
          ]
        };
        break;
        
      case 'tools/call':
        result = await handleToolCall(params.name, params.arguments);
        break;
        
      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: 'Method not found' }
        });
    }
    
    // 4. Return JSON-RPC response
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result
    });
    
  } catch (error) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error' }
    }, { status: 500 });
  }
}

// Handle CORS for browser-based access
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    }
  });
}
```

### 1.2 Implement Tool Handlers

```typescript
async function handleToolCall(toolName: string, args: any) {
  switch (toolName) {
    case 'your_tool_name':
      // Implement your tool logic here
      // Access your database, perform operations, etc.
      return {
        content: [
          { type: 'text', text: 'Tool execution result' }
        ]
      };
      
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
```

## Step 2: Create the Bridge Package

### 2.1 Create Bridge Directory Structure

```
mcp-bridge/
├── package.json
├── index.js
└── README.md
```

### 2.2 Create package.json

```json
{
  "name": "your-app-mcp",
  "version": "1.0.0",
  "description": "Bridge between Claude Desktop and Your App MCP server",
  "type": "module",
  "main": "index.js",
  "bin": {
    "your-app-mcp": "index.js"
  },
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.15.0",
    "node-fetch": "^3.3.2"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### 2.3 Create the Bridge Implementation (index.js)

```javascript
#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema,
  // Add other schemas as needed
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://your-app.com/api/mcp/v1';
const MCP_TOKEN = process.env.MCP_TOKEN;

class YourAppMCPBridge {
  constructor() {
    this.server = new Server(
      { 
        name: 'your-app-mcp-bridge', 
        version: '1.0.0' 
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        }
      }
    );
    
    this.setupHandlers();
  }

  async makeRequest(method, params = {}) {
    const url = `${MCP_SERVER_URL}?token=${MCP_TOKEN}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Unknown error');
      }
      
      return data.result;
    } catch (error) {
      console.error(`[Bridge] Error in ${method}:`, error);
      throw error;
    }
  }

  setupHandlers() {
    // Initialize handler
    this.server.setRequestHandler('initialize', async () => {
      return await this.makeRequest('initialize');
    });
    
    // Tools handlers
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return await this.makeRequest('tools/list');
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await this.makeRequest('tools/call', request.params);
    });
    
    // Add more handlers as needed
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[Bridge] Your App MCP Bridge is running!');
  }
}

// Run the bridge
const bridge = new YourAppMCPBridge();
bridge.run().catch((error) => {
  console.error('[Bridge] Fatal error:', error);
  process.exit(1);
});
```

## Step 3: Implement Token Management

### 3.1 Token Storage (Using Redis Example)

```typescript
// lib/mcp-token-manager.ts
import { nanoid } from 'nanoid';

export interface MCPToken {
  token: string;
  userId: string;
  name: string;
  created: string;
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    // Add your permission fields
  };
}

export class MCPTokenManager {
  static async createToken(userId: string, name: string, permissions: any): Promise<MCPToken> {
    const token = `sk_live_${nanoid(32)}`;
    const tokenData: MCPToken = {
      token,
      userId,
      name,
      created: new Date().toISOString(),
      permissions
    };
    
    // Store in Redis or your database
    await redis.set(`mcp_token:${token}`, JSON.stringify(tokenData));
    
    return tokenData;
  }
  
  static async validateToken(token: string): Promise<MCPToken | null> {
    const data = await redis.get(`mcp_token:${token}`);
    return data ? JSON.parse(data) : null;
  }
}
```

### 3.2 Create Token Management UI

Create a settings page where users can generate and manage tokens:

```typescript
// app/settings/mcp/page.tsx
export default function MCPSettings() {
  const [tokens, setTokens] = useState([]);
  
  const generateToken = async () => {
    const response = await fetch('/api/mcp/tokens/generate', {
      method: 'POST',
      body: JSON.stringify({
        name: 'My Claude Desktop Token',
        permissions: { canRead: true, canWrite: true }
      })
    });
    
    const { token } = await response.json();
    // Show token to user (only shown once!)
  };
  
  return (
    <div>
      <h2>MCP Tokens</h2>
      <button onClick={generateToken}>Generate New Token</button>
      {/* List existing tokens, revoke buttons, etc. */}
    </div>
  );
}
```

## Step 4: Publish the Bridge

### 4.1 Publish to NPM

```bash
cd mcp-bridge
npm publish
```

### 4.2 User Configuration

Users configure Claude Desktop by adding to their config:

```json
{
  "mcpServers": {
    "your-app": {
      "command": "npx",
      "args": ["your-app-mcp"],
      "env": {
        "MCP_SERVER_URL": "https://your-app.com/api/mcp/v1",
        "MCP_TOKEN": "sk_live_..."
      }
    }
  }
}
```

## Step 5: Security Best Practices

### 5.1 Rate Limiting

```typescript
async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `mcp_rate_limit:${userId}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 60); // 60 seconds
  }
  
  return count <= 100; // 100 requests per minute
}
```

### 5.2 Permission Checking

```typescript
// In your tool handlers
if (!token.permissions.canWrite && isWriteOperation(toolName)) {
  throw new Error('Permission denied: write access required');
}
```

### 5.3 Audit Logging

```typescript
// Log all MCP operations
await logMCPOperation({
  userId: token.userId,
  tool: toolName,
  args: sanitizedArgs,
  timestamp: new Date().toISOString(),
  ip: req.headers.get('x-forwarded-for')
});
```

## Implementation Checklist

- [ ] Create MCP API endpoint (`/api/mcp/v1`)
- [ ] Implement authentication (token validation)
- [ ] Add CORS headers for browser support
- [ ] Implement `initialize`, `tools/list`, and `tools/call` methods
- [ ] Create bridge package with stdio transport
- [ ] Implement token management system
- [ ] Add rate limiting
- [ ] Create token management UI
- [ ] Publish bridge to NPM
- [ ] Document user setup instructions
- [ ] Add monitoring and error handling

## Practical Example: Tool Implementation

Here's a complete example of implementing a tool that updates data:

```typescript
// In your route handler
async function handleToolCall(params: any, userId: string, tokenData: any) {
  const { name, arguments: args } = params;
  
  // Update usage statistics
  await MCPTokenManager.recordUsage(tokenData.token, { 
    tool: name,
    args: sanitizeArgs(args) 
  });
  
  switch (name) {
    case 'your_app_update_data':
      // 1. Check permissions
      if (!tokenData.permissions.canWrite) {
        throw new Error('Permission denied: write access required');
      }
      
      // 2. Validate inputs
      const { recordId, field, value } = args;
      if (!recordId || !field || value === undefined) {
        throw new Error('Missing required parameters');
      }
      
      // 3. Perform the operation
      const result = await updateRecord(userId, recordId, field, value);
      
      // 4. Return MCP-formatted response
      return {
        content: [
          {
            type: 'text',
            text: `Updated ${field} to "${value}" for record ${recordId}`
          }
        ]
      };
      
    case 'your_app_analyze_data':
      // For complex responses with visualizations
      const analysis = await analyzeData(userId, args.datasetId);
      
      return {
        content: [
          {
            type: 'text',
            text: `Data Analysis Results:\n${analysis.summary}`
          },
          {
            type: 'image',
            data: analysis.chartBase64,
            mimeType: 'image/png'
          }
        ]
      };
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

## Testing

1. **Test locally first:**
   ```bash
   cd mcp-bridge
   MCP_SERVER_URL=http://localhost:3000/api/mcp/v1 \
   MCP_TOKEN=your-test-token \
   node index.js
   ```

2. **Test with Claude Desktop:**
   - Configure Claude Desktop with local settings
   - Try basic operations
   - Check error handling

3. **Monitor logs:**
   - Bridge console output (stderr)
   - Server-side logs
   - Rate limit counters

4. **Test JSON-RPC directly:**
   ```bash
   curl -X POST http://localhost:3000/api/mcp/v1 \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-test-token" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "tools/list"
     }'
   ```

## Common Issues

1. **Authentication failures**: Ensure token is passed in query param for SSE/streaming
2. **CORS errors**: Add proper CORS headers to all responses
3. **Rate limiting**: Implement per-token limits, not just per-user
4. **Error handling**: Always return proper JSON-RPC error responses

This implementation provides a secure, scalable way to connect Claude Desktop to your web application through MCP.