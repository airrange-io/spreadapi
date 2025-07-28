# Add Area Handler Imports to MCP Route

## Update /app/api/mcp/v1/route.js

Add this import at the top of the file:

```javascript
import { executeAreaRead, executeAreaUpdate } from './areaExecutors.js';
```

## Complete Area Tool Example

Here's how Claude would interact with these areas:

### 1. Reading Area Data

**User**: "Show me the sales data table"

**Claude uses**: `spreadapi_read_area_mortgage_calculator`
```json
{
  "areaName": "sales_table",
  "includeFormulas": true,
  "includeFormatting": false
}
```

**Response**:
```json
{
  "area": {
    "name": "sales_table",
    "alias": "Monthly Sales Data",
    "address": "Sheet1!A1:D13",
    "mode": "editable",
    "rows": 13,
    "columns": 4
  },
  "data": {
    "0": {
      "0": {"value": "Month"},
      "1": {"value": "Sales"},
      "2": {"value": "Target"},
      "3": {"value": "Variance", "formula": "=B2-C2"}
    },
    "1": {
      "0": {"value": "Jan"},
      "1": {"value": 45000},
      "2": {"value": 50000},
      "3": {"value": -5000, "formula": "=B3-C3"}
    }
    // ... more rows
  }
}
```

### 2. Updating Multiple Areas

**User**: "Update February sales to 52000 and March target to 55000"

**Claude uses**: `spreadapi_update_area_mortgage_calculator`
```json
{
  "updates": [
    {
      "areaName": "sales_table",
      "changes": [
        {"row": 2, "col": 1, "value": 52000},  // Feb sales
        {"row": 3, "col": 2, "value": 55000}   // Mar target
      ]
    }
  ]
}
```

**Response**:
```json
{
  "results": [
    {
      "area": "sales_table",
      "success": true,
      "appliedChanges": 2,
      "errors": 0,
      "details": {
        "changes": [
          {"row": 2, "col": 1, "oldValue": 48000, "newValue": 52000, "type": "value"},
          {"row": 3, "col": 2, "oldValue": 50000, "newValue": 55000, "type": "value"}
        ]
      }
    }
  ]
}
```

### 3. Formula Updates (if permitted)

**User**: "Change the variance formula to show percentage"

**Claude uses**: `spreadapi_update_area_mortgage_calculator`
```json
{
  "updates": [
    {
      "areaName": "sales_table",
      "changes": [
        {"row": 1, "col": 3, "formula": "=(B2-C2)/C2"},
        {"row": 2, "col": 3, "formula": "=(B3-C3)/C3"},
        {"row": 3, "col": 3, "formula": "=(B4-C4)/C4"}
      ]
    }
  ]
}
```

## Key Features

1. **Dynamic Tool Generation**: Each service gets its own area tools based on defined areas
2. **Permission Enforcement**: Tools respect the permissions set for each area
3. **Batch Updates**: Can update multiple areas and cells in one operation
4. **Complete Metadata**: Returns formulas, values, and formatting based on permissions
5. **Error Handling**: Graceful handling of permission violations and invalid operations

This implementation transforms SpreadAPI into a powerful collaborative spreadsheet platform where Claude can work with complex data structures while respecting security boundaries.