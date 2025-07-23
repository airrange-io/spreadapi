# MCP Generic Tools Migration Guide

## Overview

The MCP implementation has been updated to use a generic tool approach, reducing tool proliferation from N services × 3 tools to just 5 generic tools total.

## Changes Made

### New Generic Tools

1. **spreadapi_calc** - Generic calculation tool
   - Accepts `serviceId` parameter to specify which service to execute
   - Accepts `inputs` object with service-specific parameters

2. **spreadapi_read_area** - Generic area reading tool
   - Accepts `serviceId` parameter to specify the service
   - Accepts `areaName` to specify which area to read
   - Optional `includeFormulas` and `includeFormatting` flags

3. **spreadapi_update_area** - Generic area update tool
   - Accepts `serviceId` parameter to specify the service
   - Accepts `updates` array with area changes
   - Optional `returnOptions` to control response data

4. **spreadapi_list_services** - Enhanced service listing
   - Now includes area information by default
   - `includeAreas` parameter (default: true)
   - `includeMetadata` parameter for additional details

5. **spreadapi_get_service_details** - Enhanced service details
   - Now includes complete area information
   - Shows permissions for each area
   - Includes usage examples if available

### Backward Compatibility

Service-specific tools (e.g., `spreadapi_calc_mortgage`, `spreadapi_read_area_budget`) are still supported for backward compatibility:

- By default, only generic tools are returned by `tools/list`
- To include service-specific tools, pass `includeServiceSpecificTools: true` in the `tools/list` request
- All existing service-specific tool calls continue to work as before

## Migration Examples

### Before (Service-Specific Tools)
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "spreadapi_calc_mortgage",
    "arguments": {
      "principal": 300000,
      "rate": 0.045,
      "years": 30
    }
  },
  "id": 1
}
```

### After (Generic Tools)
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "spreadapi_calc",
    "arguments": {
      "serviceId": "mortgage",
      "inputs": {
        "principal": 300000,
        "rate": 0.045,
        "years": 30
      }
    }
  },
  "id": 1
}
```

## Benefits

1. **Reduced Tool Count**: Instead of 3 tools per service, we now have just 5 total tools
2. **Better Discovery**: The enhanced `list_services` tool provides comprehensive service information
3. **Consistent Interface**: All services use the same tool interface
4. **Easier Integration**: AI assistants only need to understand 5 tools instead of potentially hundreds

## Testing

Use the provided test script to verify the implementation:

```bash
node test-mcp-generic-tools.js YOUR_MCP_TOKEN
```

This will test:
- Generic tool listing
- Service discovery with areas
- Generic calculation calls
- Backward compatibility mode

## For AI Assistant Developers

When integrating with the MCP API:

1. Start by calling `spreadapi_list_services` to discover available services and their capabilities
2. Use `spreadapi_get_service_details` to get detailed parameter information for a specific service
3. Use the generic tools (`spreadapi_calc`, `spreadapi_read_area`, `spreadapi_update_area`) with the appropriate `serviceId`
4. The service ID is shown in the service list and is typically the URL-friendly identifier (e.g., "mortgage", "budget-tracker")

## Implementation Details

The changes are implemented in `/app/api/mcp/v1/route.js`:

- Generic tools are always included in the tool list
- Service-specific tools are generated only when requested
- All tool handlers check service access permissions
- The same underlying execution logic is used for both generic and service-specific tools