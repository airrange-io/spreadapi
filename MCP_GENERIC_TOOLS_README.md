# MCP Generic Tools Architecture

## Overview

The SpreadAPI MCP server now uses a generic tool approach to prevent tool proliferation when dealing with multiple services. Instead of creating service-specific tools for each service (which leads to N services × 3 tools), we now provide 5 generic tools that work with any service.

## Architecture Benefits

### Before (Service-Specific Tools)
- With 3 services: 9 tools (3 × 3)
- With 10 services: 30 tools (10 × 3)
- With 100 services: 300 tools (100 × 3)
- Tool names: `spreadapi_calc_servicename_token`, `spreadapi_read_area_servicename_token`, etc.

### After (Generic Tools)
- With any number of services: 5 tools total
- Tool names: `spreadapi_calc`, `spreadapi_read_area`, `spreadapi_update_area`, `spreadapi_list_services`, `spreadapi_get_service_details`

## Generic Tools Reference

### 1. spreadapi_list_services
Lists all available services accessible with the current token.

**Parameters:** None

**Returns:**
```json
{
  "services": [
    {
      "id": "service123",
      "name": "Sales Calculator",
      "description": "Calculate sales projections",
      "type": "calculation",
      "inputCount": 3,
      "outputCount": 2,
      "areaCount": 0,
      "requiresToken": true
    },
    {
      "id": "budget456",
      "name": "Budget Planner",
      "description": "Interactive budget planning with AI",
      "type": "interactive",
      "inputCount": 0,
      "outputCount": 0,
      "areaCount": 5,
      "areas": [
        {
          "name": "income",
          "mode": "editable",
          "permissions": {
            "canReadValues": true,
            "canWriteValues": true,
            "canReadFormulas": true
          }
        }
      ],
      "requiresToken": true
    }
  ]
}
```

### 2. spreadapi_get_service_details
Gets detailed information about a specific service.

**Parameters:**
- `serviceId` (string, required): The service ID

**Returns:**
```json
{
  "service": {
    "id": "budget456",
    "name": "Budget Planner",
    "description": "Interactive budget planning spreadsheet",
    "type": "interactive",
    "inputs": [],
    "outputs": [],
    "areas": [
      {
        "name": "income",
        "alias": "Monthly Income",
        "address": "B2:D10",
        "mode": "editable",
        "permissions": {
          "canReadValues": true,
          "canWriteValues": true,
          "canReadFormulas": true,
          "canWriteFormulas": false,
          "canReadFormatting": true,
          "canWriteFormatting": false,
          "canAddRows": false,
          "canDeleteRows": false,
          "canModifyStructure": false
        }
      }
    ],
    "examples": [
      {
        "description": "Update monthly income values",
        "tool": "spreadapi_update_area",
        "parameters": {
          "serviceId": "budget456",
          "updates": [
            {
              "areaName": "income",
              "cells": [
                {"row": 2, "column": 2, "value": 5000}
              ]
            }
          ]
        }
      }
    ]
  }
}
```

### 3. spreadapi_calc
Performs calculations on services, optionally updating editable areas and input parameters in a single operation.

**Parameters:**
- `serviceId` (string, required): The service ID
- `inputs` (object, optional): Key-value pairs of input parameters
- `areaUpdates` (array, optional): Array of area updates to apply before calculation
- `returnOptions` (object, optional): Control what data is returned

**Examples:**

Basic calculation with inputs only:
```json
{
  "serviceId": "sales123",
  "inputs": {
    "price": 100,
    "quantity": 50,
    "discount": 0.1
  }
}
```

Complete interaction with areas and inputs:
```json
{
  "serviceId": "budget456",
  "inputs": {
    "tax_rate": 0.25,
    "inflation": 0.03
  },
  "areaUpdates": [{
    "areaName": "income",
    "cells": [
      { "row": 2, "column": 2, "value": 5000 },
      { "row": 3, "column": 2, "formula": "=B2*1.1" }
    ]
  }],
  "returnOptions": {
    "includeAreas": true,
    "includeFormulas": true
  }
}
```

Area-only update with calculation:
```json
{
  "serviceId": "forecast789",
  "areaUpdates": [{
    "areaName": "sales_data",
    "cells": [
      { "row": 5, "column": 3, "value": 15000 }
    ]
  }],
  "returnOptions": {
    "includeAreas": true,
    "includeRelatedOutputs": true
  }
}
```

### 4. spreadapi_read_area
Reads data from an editable area.

**Parameters:**
- `serviceId` (string, required): The service ID
- `areaName` (string, required): The name of the area to read
- `includeFormulas` (boolean, optional): Include cell formulas
- `includeFormatting` (boolean, optional): Include cell formatting

**Example:**
```json
{
  "serviceId": "budget456",
  "areaName": "income",
  "includeFormulas": true
}
```

### 5. spreadapi_update_area
Updates values and formulas in editable areas without performing calculations.

**Note**: For most use cases, use `spreadapi_calc` with `areaUpdates` instead, which updates areas AND returns calculated results in one call.

**Parameters:**
- `serviceId` (string, required): The service ID
- `updates` (array, required): Array of area updates
- `returnOptions` (object, optional): Control what data is returned

**Example:**
```json
{
  "serviceId": "budget456",
  "updates": [
    {
      "areaName": "income",
      "cells": [
        {"row": 2, "column": 2, "value": 5000},
        {"row": 3, "column": 2, "formula": "=B2*1.1"}
      ]
    }
  ],
  "returnOptions": {
    "includeValues": true,
    "includeFormulas": true,
    "includeRelatedOutputs": true
  }
}
```

**When to use this vs calc with areaUpdates:**
- Use `update_area`: When you only want to update areas without triggering calculations
- Use `calc` with `areaUpdates`: When you want to update areas AND get calculated results (recommended for most cases)

## Usage Pattern for AI Assistants

### 1. Discovery Phase
```javascript
// First, list available services
const services = await spreadapi_list_services();

// Get details about a specific service
const details = await spreadapi_get_service_details({
  serviceId: "budget456"
});
```

### 2. Interaction Phase

#### Simple Calculation Services
```javascript
// Services with only inputs/outputs
const result = await spreadapi_calc({
  serviceId: "sales123",
  inputs: { price: 100, quantity: 50 }
});
```

#### Interactive Services with Areas
```javascript
// Read current area data
const areaData = await spreadapi_read_area({
  serviceId: "budget456",
  areaName: "income"
});

// Update area and calculate in one call
const result = await spreadapi_calc({
  serviceId: "budget456",
  areaUpdates: [{
    areaName: "income",
    cells: [{ row: 2, column: 2, value: 5500 }]
  }],
  returnOptions: {
    includeAreas: true
  }
});
```

#### Mixed Services (Inputs + Areas)
```javascript
// Update both inputs and areas, then calculate
const result = await spreadapi_calc({
  serviceId: "tax_calculator",
  inputs: {
    tax_rate: 0.25,
    deduction_standard: 12000
  },
  areaUpdates: [{
    areaName: "income_sources",
    cells: [
      { row: 2, column: 2, value: 75000 },
      { row: 3, column: 2, value: 15000 }
    ]
  }],
  returnOptions: {
    includeAreas: true,
    includeFormulas: true
  }
});
```

## Migration from Service-Specific Tools

If you have existing code using service-specific tools:

### Old Way:
```javascript
// Service-specific tool
await spreadapi_calc_sales123_token({
  price: 100,
  quantity: 50
});
```

### New Way:
```javascript
// Generic tool with serviceId
await spreadapi_calc({
  serviceId: "sales123",
  inputs: {
    price: 100,
    quantity: 50
  }
});
```

## Best Practices

1. **Always start with discovery**: Use `spreadapi_list_services` to understand available services
2. **Get service details before interaction**: Use `spreadapi_get_service_details` to understand parameters and permissions
3. **Use the unified calc approach**: 
   - For simple calculations: `spreadapi_calc` with just `inputs`
   - For area updates: `spreadapi_calc` with `areaUpdates`
   - For both: `spreadapi_calc` with both `inputs` and `areaUpdates`
4. **Minimize API calls**: Use the enhanced `calc` function to combine operations instead of separate read/update/calc calls
5. **Check permissions**: Always verify area permissions before attempting operations
6. **Use return options wisely**: 
   - Set `includeAreas: true` if you need to see the updated area data
   - Set `includeFormulas: true` if you need to verify formula changes
   - Omit these options for smaller response sizes when not needed

## Error Handling

All tools return consistent error responses:

```json
{
  "error": "Service not found",
  "details": "No service found with ID: invalid123",
  "suggestion": "Use spreadapi_list_services to see available services"
}
```

## Token Management

- Services may require authentication tokens
- The `requiresToken` field indicates if a service needs authentication
- Tokens are managed at the MCP server configuration level
- All generic tools automatically use the configured token

## Performance Considerations

1. **Service discovery is cached**: The service list is cached for performance
2. **Batch operations**: Use array updates in `spreadapi_update_area` for multiple changes
3. **Return only needed data**: Use `returnOptions` to minimize response payload
4. **Connection reuse**: The MCP server maintains persistent connections

## Future Enhancements

The generic tool architecture allows for easy extension:
- Filtering in `spreadapi_list_services` (by type, permissions, etc.)
- Bulk operations across multiple services
- Transaction support for complex updates
- WebSocket support for real-time updates