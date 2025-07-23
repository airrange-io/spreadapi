# SpreadAPI MCP Quick Reference Card

## 🚀 Essential Commands

### Discovery
```json
// List all services
{ "tool": "spreadapi_list_services", "arguments": {} }

// Get service details
{ "tool": "spreadapi_get_service_details", "arguments": { "serviceId": "xxx" } }
```

### Basic Calculation
```json
// Run calculation with inputs
{ "tool": "spreadapi_calc_[serviceId]", "arguments": { "param1": value1, "param2": value2 } }
```

### Area Operations
```json
// Read area
{ 
  "tool": "spreadapi_read_area_[serviceId]", 
  "arguments": { 
    "areaName": "area_name",
    "includeFormulas": true 
  } 
}

// Update area
{ 
  "tool": "spreadapi_update_area_[serviceId]", 
  "arguments": { 
    "updates": [{
      "areaName": "area_name",
      "changes": [
        { "row": 0, "col": 0, "value": 123 },
        { "row": 1, "col": 0, "formula": "=A1*2" }
      ]
    }],
    "returnOptions": { "includeValues": true }
  } 
}
```

## 📊 Key Concepts

| Concept | Description | Example |
|---------|-------------|---------|
| **Input** | Single cell, write-only | `interest_rate: 0.05` |
| **Output** | Calculated result, read-only | `monthly_payment: 1234.56` |
| **Area** | Range of cells, read/write | `A1:D10` with permissions |

## 🔧 Area Permissions

| Permission | Allows You To |
|------------|---------------|
| `canReadValues` | See calculated cell values |
| `canWriteValues` | Change cell values |
| `canReadFormulas` | See cell formulas |
| `canWriteFormulas` | Create/modify formulas |
| `canReadFormatting` | See cell styles |
| `canWriteFormatting` | Change cell appearance |

## 📐 Coordinate System

- **Rows/Columns**: 0-based within areas
- **Area "B5:D10"**: row:0, col:0 = cell B5
- **Column mapping**: A=0, B=1, ..., Z=25, AA=26

## 🎯 Common Formulas

```excel
=SUM(A1:A10)                    // Sum range
=AVERAGE(B:B)                   // Average column
=IF(A1>100, "High", "Low")      // Conditional
=VLOOKUP(A1, D:E, 2, FALSE)     // Lookup
=IFERROR(A1/B1, 0)              // Error handling
=COUNTIF(A:A, ">100")           // Count condition
=A1*$B$1                        // Absolute reference
```

## 🚦 Return Options

```json
{
  "includeValues": true,      // Get calculated results (default)
  "includeFormulas": false,   // Get formulas
  "includeFormatting": false, // Get cell styles
  "includeRelatedOutputs": false // Get output parameters
}
```

## ⚡ Best Practices

1. **Read First**: Always read area before updating
2. **Batch Updates**: Combine related changes
3. **Check Permissions**: Verify before attempting operations
4. **Use Formulas**: Let Excel do calculations
5. **Handle Errors**: Use IFERROR() in formulas

## 🛠️ Troubleshooting

| Error | Meaning | Solution |
|-------|---------|----------|
| "Missing required parameters" | Input params needed | Check service details |
| "Permission denied" | Operation not allowed | Check area permissions |
| "Index out of bounds" | Row/col outside area | Check area dimensions |
| "#NAME?" | Unknown formula function | Check Excel function name |
| "#DIV/0!" | Division by zero | Add IFERROR wrapper |

## 💡 Quick Patterns

### What-If Analysis
```json
// Try different values
for (rate of [0.04, 0.05, 0.06]) {
  update_area({ changes: [{ row: 0, col: 0, value: rate }] })
  // Observe results
}
```

### Bulk Formula Creation
```json
// Add formulas to multiple rows
changes = []
for (i = 0; i < 10; i++) {
  changes.push({ row: i, col: 2, formula: `=A${i+1}*B${i+1}` })
}
```

### Safe Updates
```json
// Only update if we have permission
if (area.permissions.canWriteFormulas) {
  update_area({ changes: [{ formula: "=SUM(A:A)" }] })
} else {
  // Calculate externally and write value
  update_area({ changes: [{ value: calculatedSum }] })
}
```

## 📝 Response Format Examples

### Successful Calculation
```
Calculation Results:
total: 150000
payment: 1234.56

Calculation time: 12ms
```

### Area Update Response
```json
{
  "results": [{ "area": "data", "success": true, "appliedChanges": 3 }],
  "updatedAreas": {
    "data": {
      "rows": 10,
      "columns": 3,
      "data": { "0": { "0": { "value": 100 } } }
    }
  }
}
```

## 🎓 Remember

- Excel formulas use 1-based cell references (A1, B2)
- API uses 0-based row/col indices
- Changes are applied atomically (all or none)
- Calculations happen automatically after updates
- Cache improves performance for repeated calls