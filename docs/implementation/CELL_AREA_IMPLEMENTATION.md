# Cell Area Read/Write Implementation Guide

## Overview

This enhancement allows Claude to read and write to defined cell areas (ranges) in spreadsheets, enabling more complex data manipulation scenarios like updating tables, reading datasets, and modifying multiple related cells.

## Implementation Steps

### 1. Update Service Definition Schema

Add an `areas` field to your service definition:

```javascript
// In service creation/editing
{
  "inputs": [...],   // Existing single-cell inputs
  "outputs": [...],  // Existing outputs
  "areas": [         // NEW: Cell area definitions
    {
      "name": "sales_table",
      "alias": "Monthly Sales Data",
      "address": "Sheet1!A1:D13",
      "type": "table",
      "access": "read-write",  // or "read", "write"
      "structure": {
        "hasHeaders": true,
        "columns": [
          {"index": 0, "name": "Month", "type": "string", "readonly": true},
          {"index": 1, "name": "Actual", "type": "number"},
          {"index": 2, "name": "Target", "type": "number"},
          {"index": 3, "name": "Variance", "type": "formula", "readonly": true}
        ]
      }
    }
  ]
}
```

### 2. Add Area Tools to MCP Server

Update `/app/api/mcp/v1/route.js` to include area tools in the tools list:

```javascript
// In the 'tools/list' case, add these after the existing tools:
{
  name: 'spreadapi_read_area',
  description: 'Read data from a defined cell area in a spreadsheet service',
  inputSchema: {
    type: 'object',
    properties: {
      serviceId: {
        type: 'string',
        description: 'The service ID'
      },
      areaName: {
        type: 'string', 
        description: 'The name of the area to read (e.g., "sales_table")'
      },
      format: {
        type: 'string',
        enum: ['table', 'array', 'object'],
        default: 'table',
        description: 'Output format: table (with headers), array (raw values), or object (named cells)'
      }
    },
    required: ['serviceId', 'areaName']
  }
},
{
  name: 'spreadapi_write_area',
  description: 'Write values to specific cells within a defined area',
  inputSchema: {
    type: 'object',
    properties: {
      serviceId: {
        type: 'string',
        description: 'The service ID'
      },
      areaName: {
        type: 'string',
        description: 'The name of the area to write to'
      },
      changes: {
        type: 'array',
        description: 'Array of cell changes',
        items: {
          type: 'object',
          properties: {
            row: { type: 'number', description: 'Row index (0-based) within the area' },
            col: { type: 'number', description: 'Column index (0-based) within the area' },
            value: { description: 'New value for the cell' }
          },
          required: ['row', 'col', 'value']
        }
      }
    },
    required: ['serviceId', 'areaName', 'changes']
  }
}
```

### 3. Add Tool Handlers

In the 'tools/call' case, add handlers for the new tools:

```javascript
// After the existing tool handlers
if (name === 'spreadapi_read_area') {
  const { serviceId, areaName, format } = args;
  
  if (!serviceId || !areaName) {
    throw new Error('serviceId and areaName are required');
  }
  
  const { handleReadArea } = await import('./areaHandlers.js');
  const result = await handleReadArea(serviceId, areaName, format || 'table', auth);
  
  return {
    jsonrpc: '2.0',
    result,
    id
  };
}

if (name === 'spreadapi_write_area') {
  const { serviceId, areaName, changes } = args;
  
  if (!serviceId || !areaName || !changes) {
    throw new Error('serviceId, areaName, and changes are required');
  }
  
  const { handleWriteArea } = await import('./areaHandlers.js');
  const result = await handleWriteArea(serviceId, areaName, changes, null, auth);
  
  return {
    jsonrpc: '2.0',
    result,
    id
  };
}
```

## Use Cases

### 1. Reading a Sales Table

Claude can read an entire table:
```
"Can you analyze the sales data in my spreadsheet?"

Claude uses: spreadapi_read_area(serviceId: "sales_tracker", areaName: "sales_table", format: "table")

Returns:
{
  "headers": ["Month", "Actual", "Target", "Variance"],
  "data": [
    {"Month": "Jan", "Actual": 45000, "Target": 50000, "Variance": -5000},
    {"Month": "Feb", "Actual": 52000, "Target": 50000, "Variance": 2000},
    ...
  ]
}
```

### 2. Updating Multiple Cells

Claude can update specific cells:
```
"Update February and March targets to 55000"

Claude uses: spreadapi_write_area(
  serviceId: "sales_tracker",
  areaName: "sales_table", 
  changes: [
    {row: 1, col: 2, value: 55000},  // Feb target
    {row: 2, col: 2, value: 55000}   // Mar target
  ]
)
```

### 3. Bulk Data Entry

Claude can populate an entire dataset:
```
"Here's my sales data for Q1: Jan: 45000, Feb: 52000, Mar: 48000"

Claude uses: spreadapi_write_area(
  serviceId: "sales_tracker",
  areaName: "sales_table",
  changes: [
    {row: 0, col: 1, value: 45000},
    {row: 1, col: 1, value: 52000},
    {row: 2, col: 1, value: 48000}
  ]
)
```

## Benefits

1. **Efficiency**: Read/write multiple cells in one operation
2. **Context**: Claude understands table structure and relationships
3. **Safety**: Define read-only columns/areas to protect formulas
4. **Flexibility**: Support different data formats (tables, ranges, named cells)
5. **Intelligence**: Claude can analyze patterns and suggest updates

## Security Considerations

1. **Access Control**: Areas inherit service-level permissions
2. **Validation**: Bounds checking prevents writing outside defined areas
3. **Read-Only Protection**: Columns/areas can be marked as read-only
4. **Audit Trail**: All changes are logged with old/new values

## Future Enhancements

1. **Change Tracking**: Return only cells that changed after calculation
2. **Batch Operations**: Support multiple area operations in one call
3. **Filtering**: Read areas with conditions (e.g., "sales > 50000")
4. **Formulas**: Allow Claude to update formulas, not just values
5. **Formatting**: Preserve/update cell formatting

This system would transform SpreadAPI from a simple input/output calculator to a full spreadsheet manipulation platform for AI assistants.