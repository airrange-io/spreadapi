# Key Insights: MCP Server with Remote Bridge Implementation

## Critical Architecture Understanding

### Why a Bridge?

Claude Desktop uses **stdio** (standard input/output) to communicate with MCP servers, but your web app uses **HTTP**. The bridge translates between these protocols:

```
Claude Desktop <--stdio--> NPM Bridge <--HTTP--> Your Web App
```

Without the bridge, Claude Desktop cannot talk to your HTTP API.

### The Bridge is Stateless

The bridge (NPM package) is just a translator. It:
- Receives MCP requests from Claude via stdio
- Forwards them to your HTTP server
- Returns responses back to Claude
- Does NOT store any state or data
- Does NOT implement any business logic

### Authentication Flow

1. **User generates token** in your web app
2. **User configures Claude Desktop** with token
3. **Bridge passes token** with every HTTP request
4. **Your server validates** on each request

Important: The token goes in the query parameter for SSE/streaming support:
```javascript
const url = `${MCP_SERVER_URL}?token=${MCP_TOKEN}`;
```

### JSON-RPC Protocol

MCP uses JSON-RPC 2.0. Every request/response follows this format:

Request:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": { "name": "your_tool", "arguments": {...} }
}
```

Response (success):
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": { "content": [{"type": "text", "text": "Result"}] }
}
```

Response (error):
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": { "code": -32601, "message": "Method not found" }
}
```

### Required MCP Methods

Your server MUST implement these methods:

1. **initialize** - Handshake with protocol version
2. **tools/list** - Return available tools
3. **tools/call** - Execute a tool

Optional but recommended:
- **ping** - Health check
- **resources/list** - External resources
- **prompts/list** - Prompt templates

### Tool Response Format

Tools must return content in this specific format:

```javascript
return {
  content: [
    {
      type: 'text',
      text: 'Your response text here'
    },
    {
      type: 'image',  // Optional
      data: 'base64...',
      mimeType: 'image/png'
    }
  ]
}
```

### CORS is Critical

Your MCP endpoint MUST handle CORS properly:

```javascript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}
```

### Error Handling

Always return proper JSON-RPC errors:

```javascript
// Standard error codes:
// -32700: Parse error
// -32600: Invalid request
// -32601: Method not found
// -32602: Invalid params
// -32603: Internal error
// -32001 to -32099: Custom errors (e.g., -32001 for auth)
```

### Publishing the Bridge

1. The bridge is a separate NPM package
2. Users install it globally: `npm install -g your-app-mcp`
3. Claude Desktop runs it as a subprocess
4. Keep it lightweight (minimal dependencies)

### Security Considerations

1. **Never expose sensitive data** in tool responses
2. **Validate all inputs** - Claude may send unexpected data
3. **Use granular permissions** - not all tokens need write access
4. **Rate limit by token**, not just by user
5. **Log operations** for audit trails

### Testing Strategy

1. **Unit test** your HTTP endpoint with curl/Postman
2. **Integration test** with the bridge locally
3. **End-to-end test** with Claude Desktop
4. **Monitor production** usage and errors

### Common Pitfalls to Avoid

1. **Forgetting the query param token** for SSE support
2. **Not handling the 'id' field** in JSON-RPC
3. **Wrong content format** in tool responses
4. **Missing CORS headers** on error responses
5. **Blocking operations** that timeout

### Quick Debugging

If things aren't working:

1. Check bridge console output (it logs to stderr)
2. Verify token is valid and not expired
3. Test your HTTP endpoint directly with curl
4. Ensure all required methods are implemented
5. Check CORS headers on ALL responses

This architecture allows Claude to interact with any web application securely through a standardized protocol, while keeping the implementation flexible and maintainable.