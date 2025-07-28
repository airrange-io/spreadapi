# SpreadAPI MCP Technical Reference

## MCP Protocol Implementation

### Authentication
All requests must include a bearer token in the Authorization header:
```
Authorization: Bearer spapi_live_[token]
```

### JSON-RPC 2.0 Format
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": { ... }
  },
  "id": 1
}
```

## Complete Tool Reference

### 1. spreadapi_list_services

**Purpose**: Discover all available spreadsheet services

**Request**:
```json
{
  "tool": "spreadapi_list_services",
  "arguments": {
    "includeMetadata": false  // Optional, default: false
  }
}
```

**Response Example**:
```json
{
  "services": [
    {
      "id": "test1234_mdejqoua8ptor",
      "name": "Loan Calculator",
      "description": "Calculate loan payments and amortization",
      "hasAreas": true,
      "inputCount": 3,
      "outputCount": 2,
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. spreadapi_get_service_details

**Purpose**: Get comprehensive information about a specific service

**Request**:
```json
{
  "tool": "spreadapi_get_service_details",
  "arguments": {
    "serviceId": "test1234_mdejqoua8ptor"
  }
}
```

**Response Structure**:
```json
{
  "service": {
    "id": "test1234_mdejqoua8ptor",
    "name": "Loan Calculator",
    "description": "Calculate loan payments with amortization schedule",
    "aiDescription": "Use this to calculate loan payments, total interest, and generate amortization schedules. Ideal for mortgage calculations, auto loans, or any fixed-rate loan analysis.",
    "aiTags": ["finance", "loan", "mortgage", "calculator"],
    "aiUsageExamples": [
      "Calculate monthly payment for a $200,000 mortgage",
      "What's the total interest on a 5-year car loan?",
      "Generate amortization schedule for a loan"
    ]
  },
  "inputs": [
    {
      "name": "principal",
      "alias": "loan_amount",
      "type": "number",
      "mandatory": true,
      "description": "The initial loan amount",
      "min": 1000,
      "max": 10000000,
      "address": "B2"
    },
    {
      "name": "rate",
      "alias": "interest_rate",
      "type": "number",
      "mandatory": true,
      "description": "Annual interest rate (as decimal, e.g., 0.05 for 5%)",
      "min": 0,
      "max": 0.5,
      "address": "B3"
    }
  ],
  "outputs": [
    {
      "name": "monthly_payment",
      "type": "number",
      "description": "Calculated monthly payment amount",
      "address": "E2"
    },
    {
      "name": "total_interest",
      "type": "number",
      "description": "Total interest paid over loan lifetime",
      "address": "E3"
    }
  ],
  "areas": [
    {
      "name": "amortization_schedule",
      "alias": "schedule",
      "address": "A10:E370",
      "mode": "editable",
      "description": "Monthly payment breakdown showing principal, interest, and balance",
      "permissions": {
        "canReadValues": true,
        "canWriteValues": true,
        "canReadFormulas": true,
        "canWriteFormulas": true,
        "canReadFormatting": true,
        "canWriteFormatting": false,
        "canAddRows": false,
        "canDeleteRows": false,
        "canModifyStructure": false
      }
    }
  ]
}
```

### 3. spreadapi_calc_[serviceId]

**Purpose**: Execute a calculation with input parameters

**Request**:
```json
{
  "tool": "spreadapi_calc_test1234_mdejqoua8ptor",
  "arguments": {
    "loan_amount": 200000,
    "interest_rate": 0.045,
    "years": 30
  }
}
```

**Success Response**:
```
Calculation Results:
monthly_payment: 1013.37
total_interest: 164813.42
total_paid: 364813.42

Calculation time: 15ms
```

**Error Response (Missing Parameters)**:
```
Service: Loan Calculator
Calculate loan payments with amortization schedule

Required parameters:
- loan_amount (number): The initial loan amount [1000-10000000]
- interest_rate (number): Annual interest rate as decimal [0-0.5]
- years (number): Loan term in years [1-50]

Outputs:
- monthly_payment: Calculated monthly payment amount
- total_interest: Total interest paid over loan lifetime
```

### 4. spreadapi_read_area_[serviceId]

**Purpose**: Read data from an editable area

**Request**:
```json
{
  "tool": "spreadapi_read_area_test1234_mdejqoua8ptor",
  "arguments": {
    "areaName": "amortization_schedule",
    "includeFormulas": true,      // Optional, default: false
    "includeFormatting": false    // Optional, default: false
  }
}
```

**Response Structure**:
```json
{
  "area": {
    "name": "amortization_schedule",
    "alias": "schedule",
    "address": "Sheet1!A10:E370",
    "mode": "editable",
    "rows": 360,
    "columns": 5
  },
  "data": {
    "0": {
      "0": { "value": "Month", "formula": null },
      "1": { "value": "Payment", "formula": null },
      "2": { "value": "Principal", "formula": null },
      "3": { "value": "Interest", "formula": null },
      "4": { "value": "Balance", "formula": null }
    },
    "1": {
      "0": { "value": 1, "formula": null },
      "1": { "value": 1013.37, "formula": "=$E$2" },
      "2": { "value": 263.37, "formula": "=B12-D12" },
      "3": { "value": 750.00, "formula": "=$B$2*$B$3/12" },
      "4": { "value": 199736.63, "formula": "=$B$2-C12" }
    }
  }
}
```

### 5. spreadapi_update_area_[serviceId]

**Purpose**: Modify values and formulas in editable areas

**Request Structure**:
```json
{
  "tool": "spreadapi_update_area_test1234_mdejqoua8ptor",
  "arguments": {
    "updates": [
      {
        "areaName": "amortization_schedule",
        "changes": [
          {
            "row": 1,
            "col": 1,
            "value": 1200  // Override calculated payment
          },
          {
            "row": 1,
            "col": 2,
            "formula": "=B12-D12"  // Principal = Payment - Interest
          }
        ]
      }
    ],
    "returnOptions": {
      "includeValues": true,       // Default: true
      "includeFormulas": false,    // Default: false
      "includeFormatting": false,  // Default: false
      "includeRelatedOutputs": false // Default: false
    }
  }
}
```

**Response Structure**:
```json
{
  "results": [
    {
      "area": "amortization_schedule",
      "success": true,
      "appliedChanges": 2,
      "errors": 0,
      "details": {
        "changes": [
          {
            "row": 1,
            "col": 1,
            "type": "value",
            "success": true
          },
          {
            "row": 1,
            "col": 2,
            "type": "formula",
            "success": true
          }
        ],
        "errors": []
      }
    }
  ],
  "updatedAreas": {
    "amortization_schedule": {
      "rows": 360,
      "columns": 5,
      "data": {
        "1": {
          "0": { "value": 1 },
          "1": { "value": 1200 },
          "2": { "value": 450, "formula": "=B12-D12" },
          "3": { "value": 750 },
          "4": { "value": 199550 }
        }
      }
    }
  },
  "relatedOutputs": {
    "total_interest": 165234.50,
    "total_paid": 365234.50
  }
}
```

## Cell Reference System

### Understanding Coordinates

1. **In Area Updates**: Row/column indices are relative to the area
   - Area "B5:D10" → row:0, col:0 refers to cell B5
   - row:2, col:1 refers to cell C7

2. **Excel Column Mapping**:
   - A=0, B=1, C=2, ..., Z=25, AA=26, AB=27, etc.

3. **Formula References**: Use standard Excel notation
   - Relative: `A1`, `B2`
   - Absolute: `$A$1`, `$B$2`
   - Mixed: `$A1`, `A$1`

## Permission System Details

### Permission Combinations

1. **Read-Only Analysis**:
   ```json
   {
     "canReadValues": true,
     "canWriteValues": false,
     "canReadFormulas": true,
     "canWriteFormulas": false
   }
   ```

2. **Value Manipulation Only**:
   ```json
   {
     "canReadValues": true,
     "canWriteValues": true,
     "canReadFormulas": false,
     "canWriteFormulas": false
   }
   ```

3. **Full Formula Access**:
   ```json
   {
     "canReadValues": true,
     "canWriteValues": true,
     "canReadFormulas": true,
     "canWriteFormulas": true
   }
   ```

### Permission Errors

When attempting unauthorized operations:
```json
{
  "error": "Permission denied",
  "message": "Cannot write formulas to area 'data_table' - requires canWriteFormulas permission",
  "area": "data_table",
  "permission": "canWriteFormulas"
}
```

## Advanced Patterns

### Batch Updates Across Multiple Areas
```json
{
  "updates": [
    {
      "areaName": "inputs",
      "changes": [
        { "row": 0, "col": 0, "value": 100 },
        { "row": 1, "col": 0, "value": 200 }
      ]
    },
    {
      "areaName": "calculations", 
      "changes": [
        { "row": 0, "col": 1, "formula": "=inputs!A1*1.1" }
      ]
    }
  ],
  "returnOptions": {
    "includeValues": true,
    "includeRelatedOutputs": true
  }
}
```

### Conditional Updates Based on Read Results
```javascript
// 1. Read current values
const current = await read_area("projections");

// 2. Analyze and decide on changes
const changes = [];
for (let row = 0; row < current.rows; row++) {
  const currentValue = current.data[row][0].value;
  if (currentValue < 1000) {
    changes.push({
      row: row,
      col: 1,
      formula: `=A${row+1}*1.5`  // 50% increase for low values
    });
  }
}

// 3. Apply targeted updates
await update_area({ areaName: "projections", changes });
```

## Error Handling Reference

### Common Error Responses

1. **Invalid Area Name**:
   ```json
   {
     "error": "Area not found",
     "message": "No area named 'invalid_area' exists in this service"
   }
   ```

2. **Out of Bounds**:
   ```json
   {
     "error": "Index out of bounds",
     "message": "Row 50 exceeds area bounds (10 rows)",
     "area": "data_table",
     "bounds": { "rows": 10, "columns": 5 }
   }
   ```

3. **Invalid Formula**:
   ```json
   {
     "error": "Formula error",
     "message": "Invalid formula syntax: '=SUMwrong(A1:A10)'",
     "suggestion": "Did you mean '=SUM(A1:A10)'?"
   }
   ```

## Performance Considerations

1. **Batch Operations**: Combine multiple changes into single requests
2. **Selective Returns**: Only request data you need (values, formulas, formatting)
3. **Caching**: Results are cached server-side for repeated calculations
4. **Large Areas**: For areas > 1000 cells, consider chunked updates

## Formula Capabilities

### Supported Excel Functions
- Mathematical: SUM, AVERAGE, MIN, MAX, COUNT, ROUND
- Logical: IF, AND, OR, NOT, IFERROR
- Lookup: VLOOKUP, HLOOKUP, INDEX, MATCH
- Text: CONCATENATE, LEFT, RIGHT, MID, LEN
- Date: TODAY, NOW, DATE, DATEDIF
- Financial: PMT, PV, FV, RATE, NPV, IRR

### Formula Examples
```excel
=IF(A1>100, A1*0.9, A1)              // Conditional discount
=VLOOKUP(A1, $D$1:$E$100, 2, FALSE) // Lookup value
=SUM(B:B)                            // Sum entire column
=SUMIF(A:A, ">100", B:B)             // Conditional sum
=INDEX(data, MATCH(lookup_value, lookup_array, 0), 2)
```

## Best Practices Summary

1. **Always read before writing** to understand current state
2. **Use batched updates** for related changes
3. **Specify only needed return options** for efficiency
4. **Handle errors gracefully** with user-friendly messages
5. **Document your changes** when modifying formulas
6. **Test incrementally** with small changes first
7. **Respect permissions** and work within bounds