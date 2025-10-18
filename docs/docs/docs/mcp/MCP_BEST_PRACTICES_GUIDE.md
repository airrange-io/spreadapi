# MCP Best Practices Guide for SpreadAPI

## Overview

This guide provides best practices for AI assistants (like Claude) when interacting with SpreadAPI services through the Model Context Protocol (MCP). Following these practices ensures optimal performance, reliability, and user experience.

## Core Principles

### 1. **Discovery First**
Always start by understanding what services are available and their capabilities:

```javascript
// Step 1: List available services
const services = await spreadapi_list_services();

// Step 2: Get detailed information about a specific service
const details = await spreadapi_get_service_details({ 
  serviceId: "mortgage_calculator" 
});
```

### 2. **Single Operation Principle**
Use the enhanced `calc` function to perform multiple operations in one call:

```javascript
// ❌ Avoid multiple calls
await spreadapi_read_area({ serviceId: "budget", areaName: "income" });
await spreadapi_update_area({ serviceId: "budget", updates: [...] });
await spreadapi_calc({ serviceId: "budget", inputs: { tax: 0.25 } });

// ✅ Single unified call
await spreadapi_calc({
  serviceId: "budget",
  inputs: { tax: 0.25 },
  areaUpdates: [{
    areaName: "income",
    cells: [{ row: 2, column: 2, value: 5000 }]
  }],
  returnOptions: { includeAreas: true }
});
```

### 3. **Permission Awareness**
Always check area permissions before attempting operations:

```javascript
const details = await spreadapi_get_service_details({ serviceId: "budget" });
const incomeArea = details.areas.find(a => a.name === "income");

if (incomeArea.permissions.canWriteValues) {
  // Safe to update values
}
if (incomeArea.permissions.canWriteFormulas) {
  // Safe to update formulas
}
```

## Performance Optimization

### 1. **Batch Operations**
When updating multiple cells, batch them in a single call:

```javascript
// ✅ Good: Single call with multiple updates
await spreadapi_calc({
  serviceId: "forecast",
  areaUpdates: [{
    areaName: "assumptions",
    cells: [
      { row: 0, column: 0, value: 100 },
      { row: 1, column: 0, value: 200 },
      { row: 2, column: 0, value: 300 }
    ]
  }]
});
```

### 2. **Selective Data Return**
Only request the data you need:

```javascript
// If you only need outputs, don't request area data
await spreadapi_calc({
  serviceId: "calculator",
  inputs: { amount: 1000 },
  returnOptions: {
    includeOutputs: true,
    includeAreas: false  // Reduces response size
  }
});
```

### 3. **Read Before Write**
When you need to understand current state before making changes:

```javascript
// First understand the current data
const current = await spreadapi_read_area({
  serviceId: "budget",
  areaName: "expenses",
  includeFormulas: true
});

// Then make informed updates
await spreadapi_calc({
  serviceId: "budget",
  areaUpdates: [{
    areaName: "expenses",
    cells: calculateUpdates(current)
  }]
});
```

## Error Handling

### 1. **Graceful Degradation**
Always handle errors gracefully:

```javascript
try {
  const result = await spreadapi_calc({ serviceId: "calc", inputs });
} catch (error) {
  if (error.message.includes("Rate limit")) {
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 5000));
    return await spreadapi_calc({ serviceId: "calc", inputs });
  }
  
  if (error.message.includes("Permission denied")) {
    // Inform user about limitations
    return "This operation requires additional permissions.";
  }
  
  // Generic error handling
  return "I encountered an issue with the calculation. Please try again.";
}
```

### 2. **Validation Before Submission**
Validate inputs before sending requests:

```javascript
function validateInputs(inputs, serviceDetails) {
  for (const param of serviceDetails.inputs) {
    if (param.mandatory && !(param.name in inputs)) {
      throw new Error(`Missing required parameter: ${param.name}`);
    }
    
    const value = inputs[param.name];
    if (param.type === 'number' && isNaN(value)) {
      throw new Error(`${param.name} must be a number`);
    }
    
    if (param.min !== undefined && value < param.min) {
      throw new Error(`${param.name} must be at least ${param.min}`);
    }
  }
}
```

## Common Patterns

### 1. **Financial Modeling**
```javascript
// Monthly budget adjustment
const result = await spreadapi_calc({
  serviceId: "monthly_budget",
  areaUpdates: [{
    areaName: "income",
    cells: userIncomeUpdates
  }, {
    areaName: "expenses",
    cells: userExpenseUpdates
  }],
  returnOptions: {
    includeAreas: true,
    includeOutputs: true
  }
});

// Explain results to user
const surplus = result.outputs.find(o => o.name === "monthly_surplus");
return `Based on your updates, your monthly surplus is ${surplus.value}`;
```

### 2. **What-If Analysis**
```javascript
// Test multiple scenarios
const scenarios = [
  { rate: 0.05, term: 15 },
  { rate: 0.06, term: 30 },
  { rate: 0.055, term: 20 }
];

const results = await Promise.all(
  scenarios.map(scenario => 
    spreadapi_calc({
      serviceId: "loan_calculator",
      inputs: { ...baseInputs, ...scenario }
    })
  )
);

// Compare results for user
```

### 3. **Formula Optimization**
```javascript
// Help users optimize their spreadsheet formulas
const area = await spreadapi_read_area({
  serviceId: "financial_model",
  areaName: "calculations",
  includeFormulas: true
});

// Analyze and suggest improvements
const optimizedCells = area.cells.map(cell => {
  if (cell.formula && cell.formula.includes("VLOOKUP")) {
    return {
      ...cell,
      formula: cell.formula.replace(/VLOOKUP/g, "XLOOKUP"),
      comment: "Upgraded to more efficient XLOOKUP"
    };
  }
  return cell;
});

// Apply optimizations
await spreadapi_calc({
  serviceId: "financial_model",
  areaUpdates: [{
    areaName: "calculations",
    cells: optimizedCells
  }]
});
```

## Security Considerations

### 1. **Never Expose Tokens**
- Don't include tokens in responses to users
- Don't log tokens in debug output
- Use service IDs, not direct API endpoints

### 2. **Validate User Input**
```javascript
// Sanitize formula inputs from users
function sanitizeUserFormula(formula) {
  // Remove potentially dangerous elements
  if (formula.includes("INDIRECT") || 
      formula.includes("WEBSERVICE")) {
    throw new Error("This formula type is not allowed for security reasons");
  }
  return formula;
}
```

### 3. **Respect Boundaries**
- Only access services explicitly shared with your token
- Don't attempt to bypass area restrictions
- Report suspicious service configurations

## Optimization Tips

### 1. **Cache Service Details**
Service structures rarely change, so cache the details:

```javascript
const serviceCache = new Map();

async function getCachedServiceDetails(serviceId) {
  if (!serviceCache.has(serviceId)) {
    const details = await spreadapi_get_service_details({ serviceId });
    serviceCache.set(serviceId, details);
  }
  return serviceCache.get(serviceId);
}
```

### 2. **Minimize Round Trips**
Combine operations whenever possible:

```javascript
// ❌ Multiple round trips
const area1 = await spreadapi_read_area({ serviceId, areaName: "data1" });
const area2 = await spreadapi_read_area({ serviceId, areaName: "data2" });

// ✅ Consider if you can work with just the calc result
const result = await spreadapi_calc({
  serviceId,
  returnOptions: {
    includeAreas: true  // Gets all area data in response
  }
});
```

### 3. **Progressive Enhancement**
Start simple and add complexity as needed:

```javascript
// Start with basic calculation
let result = await spreadapi_calc({
  serviceId: "calculator",
  inputs: basicInputs
});

// If user needs more detail, enhance the request
if (userNeedsDetails) {
  result = await spreadapi_calc({
    serviceId: "calculator",
    inputs: basicInputs,
    returnOptions: {
      includeAreas: true,
      includeFormulas: true
    }
  });
}
```

## Troubleshooting

### Common Issues and Solutions

1. **"Service not found"**
   - Verify service ID with `spreadapi_list_services()`
   - Check if token has access to the service

2. **"Permission denied for area operation"**
   - Review area permissions in service details
   - Ensure operation matches allowed permissions

3. **"Rate limit exceeded"**
   - Implement exponential backoff
   - Batch operations to reduce call frequency

4. **"Invalid cell reference"**
   - Verify cell coordinates are within area bounds
   - Use 0-based indexing for rows and columns

5. **Timeout errors**
   - Complex spreadsheets may take time
   - Consider breaking large updates into smaller chunks

## Future-Proofing

### Version Awareness
The API may evolve. Always check for new capabilities:

```javascript
const services = await spreadapi_list_services();
// Check for new service types or features
const hasNewFeatures = services.some(s => s.type === 'ml-model');
```

### Extensibility
Design your integrations to handle new area modes and permissions:

```javascript
// Future-proof permission checking
function canModifyArea(area, operation) {
  const permission = `canWrite${operation}`;
  return area.permissions[permission] ?? false;
}
```

## Conclusion

By following these best practices, AI assistants can provide powerful, reliable, and secure spreadsheet automation capabilities to users. Remember to:

1. Minimize API calls through unified operations
2. Handle errors gracefully
3. Respect security boundaries
4. Optimize for performance
5. Provide clear feedback to users

The SpreadAPI MCP interface enables AI to work with complex Excel calculations, financial models, and data analysis tasks that were previously impossible to automate intelligently.