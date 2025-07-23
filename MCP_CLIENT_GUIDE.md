# SpreadAPI MCP Client Guide

## Overview for AI Assistants

SpreadAPI allows you to interact with Excel/SpreadJS spreadsheets through a programmatic interface. Think of each published service as a "spreadsheet function" that accepts inputs and returns outputs, but with the added capability of editable areas where you can experiment with formulas and data.

## Core Concepts

### 1. **Input Parameters** (Write-Only)
- Single cells where you provide values
- Like function arguments - you set them, the spreadsheet uses them
- Example: interest_rate, loan_amount, years

### 2. **Output Parameters** (Read-Only)
- Cells or ranges that contain calculated results
- Like function return values - you read them after calculation
- Example: monthly_payment, total_interest, final_balance

### 3. **Editable Areas** (Read/Write)
- Ranges of cells you can both read and modify
- Like having direct access to a portion of the spreadsheet
- You can change values, add formulas, and see results immediately
- Example: A data table where you can modify values and formulas

## Tool Discovery Flow

### Step 1: List Available Services
```json
{
  "tool": "spreadapi_list_services",
  "arguments": {
    "includeMetadata": true
  }
}
```
This shows you all available spreadsheet services with their descriptions.

### Step 2: Get Service Details
```json
{
  "tool": "spreadapi_get_service_details",
  "arguments": {
    "serviceId": "test1234_mdejqoua8ptor"
  }
}
```
This provides:
- Required/optional input parameters
- Output parameters and their meanings
- Available editable areas and their permissions
- Usage examples

### Step 3: Use the Service

#### A. Simple Calculation (Inputs → Outputs)
```json
{
  "tool": "spreadapi_calc_test1234_mdejqoua8ptor",
  "arguments": {
    "interest_rate": 0.05,
    "loan_amount": 100000,
    "years": 30
  }
}
```

#### B. Working with Editable Areas

**First, read the current state:**
```json
{
  "tool": "spreadapi_read_area_test1234_mdejqoua8ptor",
  "arguments": {
    "areaName": "loan_schedule",
    "includeFormulas": true
  }
}
```

**Then, make changes and see results:**
```json
{
  "tool": "spreadapi_update_area_test1234_mdejqoua8ptor",
  "arguments": {
    "updates": [{
      "areaName": "loan_schedule",
      "changes": [
        { "row": 0, "col": 1, "value": 1200 },
        { "row": 1, "col": 2, "formula": "=B2*1.05" }
      ]
    }],
    "returnOptions": {
      "includeValues": true,
      "includeFormulas": true
    }
  }
}
```

## Understanding Editable Areas

### Area Permissions
Each area has specific permissions that control what you can do:

- **canReadValues**: See calculated cell values
- **canWriteValues**: Change cell values
- **canReadFormulas**: See the formulas behind cells
- **canWriteFormulas**: Create or modify formulas
- **canReadFormatting**: See cell styles and formats
- **canWriteFormatting**: Change cell appearance
- **canAddRows/canDeleteRows**: Modify area structure
- **canModifyStructure**: Change area layout

### Area Modes
- **readonly**: You can only read data
- **editable**: You can modify values/formulas based on permissions
- **interactive**: Full control within permission bounds

### Working with Cell References
- **Row/Column indices are 0-based** within the area
- If an area starts at B5, then row:0, col:0 refers to B5
- Areas maintain their Excel addresses (like "Sheet1!B5:D10")

## Best Practices

### 1. **Understand Before Modifying**
Always read an area first to understand its structure:
```json
{
  "tool": "spreadapi_read_area_[serviceId]",
  "arguments": {
    "areaName": "data_table",
    "includeFormulas": true
  }
}
```

### 2. **Incremental Changes**
Make small changes and observe results:
```json
{
  "updates": [{
    "areaName": "calculations",
    "changes": [
      { "row": 0, "col": 1, "value": 100 }
    ]
  }],
  "returnOptions": {
    "includeValues": true,
    "includeRelatedOutputs": true
  }
}
```

### 3. **Use returnOptions Wisely**
- Default (`includeValues: true`) - For seeing calculated results
- `includeFormulas: true` - When you need to verify formula logic
- `includeRelatedOutputs: true` - To see impact on defined outputs
- `includeFormatting: true` - Only when cell appearance matters

### 4. **Formula Best Practices**
- Use relative references for patterns: `=A1*1.1`
- Use absolute references for constants: `=$B$1*1.1`
- Excel formula syntax applies: `=SUM(A1:A10)`, `=IF(A1>0,A1*2,0)`

## Common Patterns

### Pattern 1: What-If Analysis
```javascript
// 1. Read current state
read_area("projections")

// 2. Try different scenarios
for (growth_rate of [0.05, 0.10, 0.15]) {
  update_area({
    changes: [{ row: 0, col: 1, value: growth_rate }]
  })
  // Observe how projections change
}
```

### Pattern 2: Formula Generation
```javascript
// Create a series of calculated cells
changes = []
for (i = 0; i < 10; i++) {
  changes.push({
    row: i,
    col: 2,
    formula: `=A${i+1}*B${i+1}`
  })
}
update_area({ changes })
```

### Pattern 3: Data Transformation
```javascript
// Read data, process it, write back results
data = read_area("raw_data")
// Process data...
update_area({
  changes: processed_results,
  returnOptions: {
    includeValues: true,
    includeRelatedOutputs: true  // See impact on outputs
  }
})
```

## Error Handling

### Missing Parameters
If you get "Missing required parameters", the service will return documentation showing what's needed.

### Permission Denied
If you try to write formulas without `canWriteFormulas` permission:
```
"Cannot write formulas to area 'data' - permission denied"
```

### Out of Bounds
If you reference row:10 in a 5-row area:
```
"Row index 10 out of bounds for area (5 rows)"
```

### Invalid Formulas
Excel will show `#NAME?`, `#VALUE!`, etc. for formula errors.

## Advanced Usage

### 1. **Bulk Updates**
Update multiple areas in one call:
```json
{
  "updates": [
    {
      "areaName": "inputs",
      "changes": [...]
    },
    {
      "areaName": "assumptions",
      "changes": [...]
    }
  ]
}
```

### 2. **Discovering Relationships**
Use `includeRelatedOutputs` to understand how areas affect outputs:
```json
{
  "returnOptions": {
    "includeValues": true,
    "includeRelatedOutputs": true
  }
}
```

### 3. **Performance Optimization**
- Set `includeValues: false` if you only need to confirm changes were applied
- Batch related changes into single update calls
- Use area updates instead of multiple single-cell calculations

## Typical Workflow

1. **Discover**: List services → Get service details
2. **Understand**: Read areas to see current state and structure
3. **Plan**: Identify what changes you want to make
4. **Execute**: Update areas with your changes
5. **Verify**: Check returned values and related outputs
6. **Iterate**: Refine based on results

## Tips for AI Assistants

1. **Be Explicit**: When users ask to "change the interest rate", clarify whether they mean an input parameter or a value in an editable area.

2. **Show Your Work**: Explain what areas you're modifying and why.

3. **Validate First**: Before making changes, confirm you understand the spreadsheet structure.

4. **Handle Errors Gracefully**: If permissions are denied, explain what's possible instead.

5. **Think in Batches**: Group related changes for efficiency.

Remember: Editable areas give you a window into the spreadsheet where you can experiment freely within the defined permissions. Use them to explore, analyze, and transform data while the calculation engine handles all the formula dependencies automatically.