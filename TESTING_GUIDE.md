# Single-Service MCP Testing Guide

**Service ID:** `abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6`
**Type:** Public (no token required)
**Endpoint:** `http://localhost:3000/api/mcp/services/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6`

---

## 🚀 Quick Testing (3 Steps)

### Step 1: Start Development Server
```bash
cd /Users/stephanmethner/AR/repos/spreadapi
npm run dev
```

Wait for server to start on `http://localhost:3000`

---

### Step 2: Run Automated Test
```bash
# In a new terminal
node test-single-service-mcp.js
```

**Expected Output:**
```
🧪 Testing Single-Service MCP Endpoint

Service ID: abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6

Test 1: MCP Initialize
✅ Initialize Response:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": { "tools": { "listChanged": true } },
    "serverInfo": {
      "name": "...",
      "version": "1.0.0",
      "description": "...",
      "instructions": "🎯 ..."
    }
  }
}

Test 2: MCP Tools List
✅ Tools List Response:
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "calculate",
        "description": "...",
        "inputSchema": { ... }
      }
    ]
  }
}
```

---

### Step 3: Test with Claude Desktop

**File Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration:**
Copy the content from `claude-desktop-config-example.json`:

```json
{
  "mcpServers": {
    "spreadapi-german-tax": {
      "url": "http://localhost:3000/api/mcp/services/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6",
      "transport": {
        "type": "http"
      }
    }
  }
}
```

**Steps:**
1. Save the config file
2. Restart Claude Desktop
3. Look for the new tool (should appear in tool list)
4. Ask Claude: "What tools do you have available?"
5. Ask Claude: "Can you use the calculate tool?"

---

## 🧪 Manual curl Testing

### Test 1: Initialize
```bash
curl -X POST http://localhost:3000/api/mcp/services/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}' | jq
```

**What to check:**
- ✅ HTTP 200 response
- ✅ `result.protocolVersion` = "2024-11-05"
- ✅ `result.serverInfo.name` = service name
- ✅ `result.serverInfo.instructions` contains AI guidance

---

### Test 2: Tools List
```bash
curl -X POST http://localhost:3000/api/mcp/services/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":2}' | jq
```

**What to check:**
- ✅ HTTP 200 response
- ✅ `result.tools` is an array
- ✅ First tool has `name: "calculate"`
- ✅ `inputSchema` contains service parameters

---

### Test 3: CORS Preflight
```bash
curl -X OPTIONS http://localhost:3000/api/mcp/services/abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6 \
  -H "Origin: https://chatgpt.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**What to check:**
- ✅ HTTP 204 response
- ✅ `Access-Control-Allow-Origin: *`
- ✅ `Access-Control-Allow-Methods: POST, OPTIONS`

---

### Test 4: Invalid Service ID
```bash
curl -X POST http://localhost:3000/api/mcp/services/nonexistent-service-id \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}' | jq
```

**Expected:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32600,
    "message": "Service nonexistent-service-id not found or not published"
  }
}
```

---

## 📊 What to Verify

### ✅ Protocol Compliance
- [ ] JSON-RPC 2.0 format (jsonrpc, id, result/error)
- [ ] MCP protocol version (2024-11-05)
- [ ] Proper error codes (-32600, -32601, etc.)

### ✅ Service Metadata
- [ ] Service name is loaded correctly
- [ ] Service description is present
- [ ] AI instructions are generated
- [ ] Input parameters are converted to JSON Schema

### ✅ Authentication
- [ ] Public service works without token
- [ ] (Next test) Private service requires token
- [ ] Invalid token returns 401 error

### ✅ CORS
- [ ] OPTIONS request returns correct headers
- [ ] POST request includes CORS headers
- [ ] ChatGPT can connect (if testing from browser)

### ✅ Error Handling
- [ ] Invalid service ID → Clear error
- [ ] Invalid JSON → Parse error
- [ ] Unknown method → Method not found error

---

## 🔍 Debugging Tips

### Problem: "Service not found"
**Check:**
```bash
# Verify service exists in Redis
redis-cli EXISTS service:abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6:published
# Should return 1

# View service data
redis-cli HGETALL service:abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6:published
```

### Problem: "Cannot connect to endpoint"
**Check:**
```bash
# Verify server is running
curl http://localhost:3000/api/health || echo "Server not running"

# Check logs
# Look for errors in terminal running `npm run dev`
```

### Problem: "Tool not appearing in Claude Desktop"
**Check:**
1. Config file is valid JSON
2. Config file is in correct location
3. Claude Desktop was restarted after config change
4. Check Claude Desktop logs:
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

---

## 🎯 Success Criteria

Phase 1 testing is successful if:

✅ **Initialize works:** Returns server info with service name/description
✅ **Tools list works:** Returns calculate tool with correct input schema
✅ **CORS works:** OPTIONS and POST both have correct headers
✅ **Errors work:** Invalid service returns helpful error message
✅ **No crashes:** Server doesn't crash on malformed requests

---

## 📝 Next Steps After Testing

Once basic testing passes:

1. **Test with actual calculation**
   - Get service parameters from tools/list
   - Call tools/call with sample inputs
   - Verify formatted output

2. **Test with private service**
   - Create service token
   - Add to Authorization header
   - Verify token validation works

3. **Test with multiple services**
   - Try different service types
   - Verify parameter type conversions
   - Test enum/boolean parameters

4. **Build UI integration**
   - Add MCP section to service detail page
   - Show Claude Desktop config
   - Show ChatGPT action URL

---

## 🐛 Known Limitations

- **Area reading:** Not yet implemented (returns error)
- **State management:** Not yet implemented
- **Batch calculations:** Not yet implemented
- **ChatGPT OAuth:** Not yet implemented (manual token paste)

These will be added in Phase 2 if needed.

---

## 📞 Need Help?

**Check these files:**
- `PHASE1_COMPLETE.md` - What was built
- `MIGRATION_PLAN_SINGLE_SERVICE_MCP.md` - Overall plan
- `lib/mcp-service-wrapper.js` - Service → MCP conversion
- `app/api/mcp/services/[serviceId]/route.js` - Endpoint handler

**Common issues:**
- Server not starting → Run `npm install` first
- Redis errors → Check Redis is running: `redis-cli ping`
- TypeScript errors → Run `npm run typecheck`

---

**Last Updated:** 2025-10-26
**Status:** Ready for testing
**Service ID:** abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mgz9ldvz3knf6
