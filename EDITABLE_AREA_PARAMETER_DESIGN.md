# Editable Area Parameter Design

## Current vs. Enhanced Parameter Types

### Current System
```javascript
{
  "inputs": [
    {"name": "rate", "address": "B2", "type": "number"}
  ],
  "outputs": [
    {"name": "total", "address": "B10", "type": "number"},
    {"name": "summary", "address": "A1:D10", "type": "range"} // Read-only
  ]
}
```

### Enhanced System with Areas
```javascript
{
  "inputs": [...],
  "outputs": [...],
  "areas": [  // NEW parameter type
    {
      "name": "sales_data",
      "alias": "Monthly Sales Table", 
      "address": "Sheet1!A1:D13",
      "type": "area",
      "mode": "editable",  // "readonly", "editable", "interactive"
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
      },
      "validation": {
        "allowedFormulas": ["SUM", "AVERAGE", "IF", "VLOOKUP"],
        "protectedCells": ["A1", "D13"],  // Specific cells that can't be modified
        "editableColumns": [1, 2],  // Only columns B and C are editable
        "formulaComplexityLimit": 10,  // Max depth of formula nesting
        "valueConstraints": {
          "column_1": {"min": 0, "max": 1000000, "type": "number"},
          "column_2": {"min": 0, "max": 100, "type": "percentage"}
        }
      }
    }
  ]
}
```

## Permission Levels

### 1. Read-Only Area
```javascript
{
  "name": "financial_summary",
  "mode": "readonly",
  "permissions": {
    "canReadValues": true,
    "canWriteValues": false,
    "canReadFormulas": false,  // Hide proprietary formulas
    "canWriteFormulas": false
  }
}
```

### 2. Value-Editable Area
```javascript
{
  "name": "input_assumptions", 
  "mode": "editable",
  "permissions": {
    "canReadValues": true,
    "canWriteValues": true,
    "canReadFormulas": true,
    "canWriteFormulas": false  // Can change values but not formulas
  }
}
```

### 3. Formula-Editable Area
```javascript
{
  "name": "custom_calculations",
  "mode": "editable", 
  "permissions": {
    "canReadValues": true,
    "canWriteValues": true,
    "canReadFormulas": true,
    "canWriteFormulas": true,
    "allowedFormulas": ["SUM", "IF", "AVERAGE"]  // Whitelist safe functions
  }
}
```

### 4. Interactive Area
```javascript
{
  "name": "dynamic_model",
  "mode": "interactive",
  "permissions": {
    "canReadValues": true,
    "canWriteValues": true,
    "canReadFormulas": true,
    "canWriteFormulas": true,
    "canAddRows": true,
    "canDeleteRows": true,
    "canModifyStructure": true
  }
}
```

## UI Component Updates

### Area Configuration Panel
```typescript
interface AreaConfiguration {
  // Basic settings
  name: string;
  alias: string;
  address: string;
  description?: string;
  
  // Access mode
  mode: 'readonly' | 'editable' | 'interactive';
  
  // Granular permissions
  permissions: {
    values: {
      read: boolean;
      write: boolean;
    };
    formulas: {
      read: boolean;
      write: boolean;
      allowedFunctions?: string[];
    };
    formatting: {
      read: boolean;
      write: boolean;
    };
    structure: {
      addRows: boolean;
      deleteRows: boolean;
      addColumns: boolean;
      deleteColumns: boolean;
    };
  };
  
  // Validation rules
  validation?: {
    protectedRanges?: string[];
    editableRanges?: string[];
    valueConstraints?: Record<string, any>;
    customRules?: ValidationRule[];
  };
  
  // AI hints
  aiContext?: {
    purpose: string;
    expectedBehavior: string;
    examples?: string[];
  };
}
```

## MCP Tool Enhancement

### Updated Tool Schema
```javascript
{
  name: 'spreadapi_interact_area',
  description: 'Read and optionally modify an area in the spreadsheet',
  inputSchema: {
    type: 'object',
    properties: {
      serviceId: { type: 'string' },
      areaName: { type: 'string' },
      operation: {
        type: 'string',
        enum: ['read', 'write', 'analyze', 'validate'],
        description: 'Operation to perform on the area'
      },
      options: {
        type: 'object',
        properties: {
          includeFormulas: { type: 'boolean', default: false },
          includeFormatting: { type: 'boolean', default: false },
          includeMetadata: { type: 'boolean', default: true }
        }
      },
      changes: {
        type: 'array',
        description: 'For write operations: array of changes to apply',
        items: {
          type: 'object',
          properties: {
            cell: { type: 'string' },
            value: {},
            formula: { type: 'string' }
          }
        }
      }
    }
  }
}
```

## API Implementation

### Area Access Check
```javascript
async function checkAreaAccess(area, operation, requestedAction) {
  // Check basic mode
  if (area.mode === 'readonly' && operation === 'write') {
    throw new Error('Area is read-only');
  }
  
  // Check specific permissions
  const perms = area.permissions;
  
  switch (requestedAction) {
    case 'readFormula':
      if (!perms.canReadFormulas) {
        throw new Error('Formula access not permitted');
      }
      break;
      
    case 'writeFormula':
      if (!perms.canWriteFormulas) {
        throw new Error('Formula modification not permitted');
      }
      break;
      
    case 'writeValue':
      if (!perms.canWriteValues) {
        throw new Error('Value modification not permitted');
      }
      break;
  }
  
  return true;
}
```

### Formula Validation
```javascript
function validateFormula(formula, area) {
  if (!area.permissions.canWriteFormulas) {
    throw new Error('Formula writing not allowed');
  }
  
  // Check allowed functions
  if (area.permissions.allowedFormulas) {
    const usedFunctions = extractFunctions(formula);
    const disallowed = usedFunctions.filter(
      fn => !area.permissions.allowedFormulas.includes(fn)
    );
    
    if (disallowed.length > 0) {
      throw new Error(`Disallowed functions: ${disallowed.join(', ')}`);
    }
  }
  
  // Check complexity
  if (area.validation?.formulaComplexityLimit) {
    const complexity = calculateFormulaComplexity(formula);
    if (complexity > area.validation.formulaComplexityLimit) {
      throw new Error('Formula too complex');
    }
  }
  
  return true;
}
```

## Example Use Cases

### 1. Budget Planning Template
```javascript
{
  "areas": [
    {
      "name": "assumptions",
      "address": "Assumptions!B2:B10",
      "mode": "editable",
      "permissions": {
        "canWriteValues": true,
        "canWriteFormulas": false  // Only change assumption values
      }
    },
    {
      "name": "calculations",
      "address": "Budget!A1:F50",
      "mode": "readonly",
      "permissions": {
        "canReadValues": true,
        "canReadFormulas": false  // Hide proprietary calculations
      }
    }
  ]
}
```

### 2. Collaborative Forecasting
```javascript
{
  "areas": [
    {
      "name": "historical_data",
      "address": "Data!A1:D25",
      "mode": "readonly"
    },
    {
      "name": "forecast_model",
      "address": "Forecast!A1:D25",
      "mode": "interactive",
      "permissions": {
        "canWriteFormulas": true,
        "allowedFormulas": ["TREND", "FORECAST", "AVERAGE", "IF"],
        "canAddRows": true  // Allow extending forecast period
      }
    }
  ]
}
```

### 3. Data Entry Form
```javascript
{
  "areas": [
    {
      "name": "entry_form",
      "address": "Form!B2:B20",
      "mode": "editable",
      "permissions": {
        "canWriteValues": true,
        "canWriteFormulas": false
      },
      "validation": {
        "protectedCells": ["B10", "B15"],  // Calculated fields
        "valueConstraints": {
          "B2": {"type": "date", "min": "2024-01-01"},
          "B3": {"type": "number", "min": 0, "max": 1000000}
        }
      }
    }
  ]
}
```

## Benefits

1. **Fine-Grained Control**: Exactly specify what Claude can see and modify
2. **Security**: Protect sensitive formulas while allowing value updates
3. **Flexibility**: Different permission levels for different use cases
4. **Validation**: Ensure data integrity with constraints
5. **Auditability**: Track what can be modified and by whom

This design gives you complete control over how AI interacts with your spreadsheets while enabling powerful collaborative scenarios.