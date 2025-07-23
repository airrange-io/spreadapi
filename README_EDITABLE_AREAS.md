# Editable Areas for AI - SpreadAPI Feature Documentation

## Overview

The Editable Areas feature allows AI assistants (like Claude) to interact with specific regions of a spreadsheet through the MCP (Model Context Protocol). Unlike traditional input/output parameters that work with single cells, editable areas enable AI to read and modify entire ranges of cells, including their values, formulas, and formatting.

## Key Concepts

### What are Editable Areas?

Editable areas are defined regions in a spreadsheet (e.g., A1:D10) that can be exposed to AI assistants with specific permissions. Each area has:

- **Name**: A unique identifier for the area
- **Alias**: A user-friendly name for AI interaction
- **Address**: The cell range (e.g., "Sheet1!A1:D10")
- **Mode**: Access level (readonly, editable, or interactive)
- **Permissions**: Granular control over what the AI can do

### Permission System

Each editable area has fine-grained permissions:

```javascript
{
  canReadValues: boolean,      // AI can see cell values
  canWriteValues: boolean,     // AI can change cell values
  canReadFormulas: boolean,    // AI can see formulas (not just results)
  canWriteFormulas: boolean,   // AI can create/modify formulas
  canReadFormatting: boolean,  // AI can see cell formatting
  canWriteFormatting: boolean, // AI can change cell formatting
  canAddRows: boolean,         // AI can add rows to the area
  canDeleteRows: boolean,      // AI can remove rows from the area
  canModifyStructure: boolean  // AI can change the area structure
}
```

## MCP Integration

### Available MCP Tools

When a service has editable areas defined, the MCP server dynamically creates tools for each area:

1. **Read Tool**: `spreadapi_read_area_[alias]`
   - Reads data from the area based on permissions
   - Returns cell values, formulas, and formatting (if permitted)
   - Uses SpreadJS JSON format for complete cell metadata

2. **Update Tool**: `spreadapi_update_area_[alias]`
   - Updates multiple cells in one or more areas
   - Respects write permissions for values and formulas
   - Validates all changes before applying

### Tool Usage Examples

#### Reading an Area

```json
{
  "tool": "spreadapi_read_area_sales_data",
  "arguments": {
    "includeFormulas": true,
    "includeFormatting": false
  }
}
```

Response:
```json
{
  "area": {
    "name": "SalesData",
    "alias": "sales_data",
    "address": "Sheet1!A1:D10",
    "mode": "editable",
    "rows": 10,
    "columns": 4
  },
  "data": {
    "0": {
      "0": { "value": "Product", "formula": null },
      "1": { "value": "Q1 Sales", "formula": null },
      "2": { "value": "Q2 Sales", "formula": null },
      "3": { "value": 2500, "formula": "=B2+C2" }
    }
  }
}
```

#### Updating an Area

```json
{
  "tool": "spreadapi_update_areas",
  "arguments": {
    "updates": [
      {
        "areaName": "sales_data",
        "changes": [
          { "row": 1, "col": 1, "value": 1500 },
          { "row": 1, "col": 3, "formula": "=B2+C2" }
        ]
      }
    ]
  }
}
```

## Implementation Details

### Frontend (EditorPanel.tsx)

The UI allows users to:
1. Select a cell range in the spreadsheet
2. Click "Add as Editable Area (for AI)"
3. Configure permissions through a modal dialog
4. Save the area configuration with the service

### Backend Storage

Areas are stored in Redis as part of the service configuration:
- Draft areas: `service:[id]` hash with `areas` field (JSON string)
- Published areas: `service:[id]:published` hash with `areas` field

### Area Executors (areaExecutors.js)

Two main functions handle area operations:

1. **executeAreaRead**: 
   - Loads the workbook
   - Finds the requested area
   - Checks read permissions
   - Extracts cell data based on permissions
   - Returns SpreadJS JSON format

2. **executeAreaUpdate**:
   - Loads the workbook
   - Validates area permissions
   - Applies changes to cells
   - Validates bounds and permissions for each change
   - Returns detailed results

## Best Practices for AI Interaction

### When to Use Editable Areas

1. **Data Analysis**: Give AI read access to data ranges for analysis
2. **Report Generation**: Allow AI to update specific report sections
3. **Formula Creation**: Let AI create complex formulas in designated areas
4. **Data Transformation**: Enable AI to process and transform data in place

### Security Considerations

1. **Least Privilege**: Only grant necessary permissions
2. **Boundary Validation**: Areas are confined to their defined ranges
3. **Formula Safety**: AI can only modify formulas if explicitly permitted
4. **Audit Trail**: All changes can be tracked through the MCP protocol

### Performance Notes

- Areas do not affect the normal calculation API performance
- MCP tools are only created for published services with areas
- Workbook caching is used for read operations
- Fresh workbooks are created for write operations to ensure consistency

## Example Use Cases

### 1. Financial Report Assistant
```
Areas:
- "Revenue" (A1:D20) - Read formulas, write values
- "Forecast" (E1:H20) - Full edit permissions
- "Summary" (A25:D30) - Read only

AI can analyze historical revenue, update forecast data, and read summary calculations.
```

### 2. Data Cleaning Tool
```
Areas:
- "RawData" (A:Z) - Read values, write values
- "ValidationRules" (AA:AC) - Read only

AI can clean and standardize data while respecting validation rules.
```

### 3. Formula Generator
```
Areas:
- "InputData" (A1:C100) - Read only
- "Calculations" (D1:F100) - Write formulas only

AI can create complex formulas based on input data patterns.
```

## Integration with Claude

When Claude connects to a SpreadAPI service via MCP:

1. Claude discovers available areas through the tool list
2. Each area appears as separate read/update tools
3. Claude can see area permissions in tool descriptions
4. Claude respects permission boundaries automatically
5. Clear error messages guide Claude when permissions are violated

This design allows Claude to work with spreadsheet data naturally while maintaining security and control over what can be modified.