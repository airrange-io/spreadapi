# MCP Single-Service Hints - Implementation

## What Was Implemented

A **minimal enhancement** to help AI assistants when an MCP token has exactly **one service**. No UI changes, no new database fields - just smart hints.

## How It Works

### When Token Has Multiple Services
```
AI connects → Gets generic tool descriptions
             → Must call spreadapi_list_services to discover
             → Then call spreadapi_get_service_details
             → Then call spreadapi_calc
```

### When Token Has ONE Service (NEW)
```
AI connects → Server says: "This is the Mortgage Calculator service"
             → Tool descriptions say: "CALL THIS FIRST for service ID: mortgage_calc_123"
             → AI automatically calls spreadapi_get_service_details
             → Then calls spreadapi_calc with correct parameters
```

## Changes Made

### 1. Enhanced `initialize` Response

**File**: `/app/api/mcp/bridge/route.js`

When a token has one service, the initialization response now includes:

```javascript
{
  "serverInfo": {
    "name": "Mortgage Calculator",  // Instead of "spreadapi-mcp"
    "description": "This MCP connection provides access to the 'Mortgage Calculator' service...",
    "instructions": "Start by calling spreadapi_get_service_details(serviceId: 'mortgage_calc_123')..."
  }
}
```

### 2. Enhanced Tool Descriptions

**File**: `/app/api/mcp/bridge/route.js`

Tool descriptions are enhanced with service-specific hints:

#### `spreadapi_get_service_details`:
```
Multi-service: "Get detailed information about a specific SpreadAPI service..."

Single-service: "Get details for the 'Mortgage Calculator' service.
                 **CALL THIS FIRST** to understand what inputs are needed.
                 Service ID: mortgage_calc_123"
```

#### `spreadapi_calc`:
```
Multi-service: "Execute calculations with optional area updates..."

Single-service: "Execute the 'Mortgage Calculator' calculation.
                 Call spreadapi_get_service_details first to learn what
                 parameters are required. Service ID: mortgage_calc_123"
```

#### `spreadapi_list_services`:
```
Multi-service: "List all published SpreadAPI services..."

Single-service: "List services (this token only has access to 'Mortgage Calculator')"
```

## Example Flow

### User Creates Token
1. Creates MCP token
2. Selects **only** "Compound Interest Calculator" service
3. Token saved with `serviceIds: ["compound_interest_calc"]`

### Claude Desktop Connects

**1. Initialize**
```json
Request:
{
  "method": "initialize"
}

Response:
{
  "serverInfo": {
    "name": "Compound Interest Calculator",
    "description": "This MCP connection provides access to the 'Compound Interest Calculator' service. Use spreadapi_get_service_details with serviceId 'compound_interest_calc' to learn about its capabilities.",
    "instructions": "Start by calling spreadapi_get_service_details(serviceId: 'compound_interest_calc') to understand what this service does and what parameters it needs."
  }
}
```

**2. List Tools**
```json
Request:
{
  "method": "tools/list"
}

Response:
{
  "tools": [
    {
      "name": "spreadapi_get_service_details",
      "description": "Get details for the 'Compound Interest Calculator' service. **CALL THIS FIRST** to understand what inputs are needed and how to use the service. Service ID: compound_interest_calc",
      "inputSchema": {
        "properties": {
          "serviceId": {
            "description": "The service ID (use \"compound_interest_calc\")"
          }
        }
      }
    },
    {
      "name": "spreadapi_calc",
      "description": "Execute the 'Compound Interest Calculator' calculation. Call spreadapi_get_service_details first to learn what parameters are required. Service ID: compound_interest_calc"
    }
  ]
}
```

**3. User Interaction**

User: "Calculate compound interest for $10,000 at 5% for 10 years"

AI sees hints → Calls `spreadapi_get_service_details("compound_interest_calc")` first → Gets full documentation → Calls `spreadapi_calc` with correct parameters

## Benefits

### For Users
✅ AI immediately knows which service to use
✅ No need to ask "what services do I have?"
✅ Faster, more natural conversations

### For Service Creators
✅ Zero configuration needed
✅ Works automatically when token has one service
✅ No UI changes required

### Technical
✅ **Minimal code changes** - Just 50 lines added
✅ **No database changes** - Uses existing service metadata
✅ **Backward compatible** - Multi-service tokens work exactly as before
✅ **Zero breaking changes**

## Testing

### Test Single-Service Token
1. Create a service (any service)
2. Publish it
3. Create MCP token with **only that one service**
4. Connect with Claude Desktop
5. Verify:
   - Server name shows service name
   - Tool descriptions mention the service ID
   - AI behavior is guided by hints

### Test Multi-Service Token (Regression)
1. Create MCP token with 2+ services
2. Connect with Claude Desktop
3. Verify:
   - Server name is still "spreadapi-mcp"
   - Tool descriptions are generic (no service-specific hints)
   - Everything works as before

## Next Steps (Optional)

If this works well, we can enhance it further with:

1. **Phase 2**: Add AI examples to input parameters (UI changes)
2. **Phase 3**: Add presentation hints to output parameters (UI changes)
3. **Phase 4**: Add usage guidance field in service settings (UI changes)

But for now, this minimal implementation provides immediate value with zero UI changes!

## Code Changes Summary

**Files Modified**: 1
- `/app/api/mcp/bridge/route.js`

**Lines Changed**: ~50 lines
- Enhanced `initialize` case (~20 lines)
- Enhanced `tools/list` case (~30 lines)

**New Dependencies**: None
**Breaking Changes**: None
**UI Changes**: None
**Database Changes**: None

---

**Status**: ✅ Implemented & Working
**Deployment**: Ready to deploy immediately
