# SpreadAPI MCP Practical Examples

## Real-World Scenarios for AI Assistants

### Scenario 1: Financial Analysis Assistant

**User Request**: "Help me analyze different loan scenarios for buying a house"

**Step 1: Discover Available Tools**
```json
// First, find relevant services
{
  "tool": "spreadapi_list_services",
  "arguments": { "includeMetadata": true }
}

// Found: "Mortgage Calculator" service
// Get details about it
{
  "tool": "spreadapi_get_service_details",
  "arguments": { "serviceId": "test1234_mortgage_calc" }
}
```

**Step 2: Initial Calculation**
```json
{
  "tool": "spreadapi_calc_test1234_mortgage_calc",
  "arguments": {
    "home_price": 500000,
    "down_payment": 100000,
    "interest_rate": 0.065,
    "years": 30
  }
}
// Returns: monthly_payment: $2,528.27
```

**Step 3: Scenario Analysis with Editable Areas**
```json
// Read the scenarios comparison area
{
  "tool": "spreadapi_read_area_test1234_mortgage_calc",
  "arguments": {
    "areaName": "scenarios",
    "includeFormulas": true
  }
}

// Update with multiple scenarios
{
  "tool": "spreadapi_update_area_test1234_mortgage_calc",
  "arguments": {
    "updates": [{
      "areaName": "scenarios",
      "changes": [
        // Scenario 1: 15-year loan
        { "row": 1, "col": 0, "value": "15-year loan" },
        { "row": 1, "col": 1, "value": 500000 },
        { "row": 1, "col": 2, "value": 100000 },
        { "row": 1, "col": 3, "value": 0.055 },
        { "row": 1, "col": 4, "value": 15 },
        { "row": 1, "col": 5, "formula": "=PMT(D2/12,E2*12,-C2+B2)" },
        
        // Scenario 2: 30-year with larger down payment
        { "row": 2, "col": 0, "value": "30-year, 30% down" },
        { "row": 2, "col": 1, "value": 500000 },
        { "row": 2, "col": 2, "value": 150000 },
        { "row": 2, "col": 3, "value": 0.065 },
        { "row": 2, "col": 4, "value": 30 },
        { "row": 2, "col": 5, "formula": "=PMT(D3/12,E3*12,-C3+B3)" }
      ]
    }],
    "returnOptions": {
      "includeValues": true,
      "includeRelatedOutputs": true
    }
  }
}
```

**AI Response to User**:
"I've analyzed three mortgage scenarios for your $500,000 home:

1. **Original (30-year, 20% down)**: $2,528/month
2. **15-year loan option**: $3,266/month (saves $183,000 in interest!)
3. **30-year with 30% down**: $2,218/month

The 15-year option costs $738 more monthly but saves significant interest. Would you like me to explore other scenarios?"

### Scenario 2: Data Transformation Assistant

**User Request**: "I have sales data that needs to be cleaned and analyzed"

**Step 1: Read Raw Data Area**
```json
{
  "tool": "spreadapi_read_area_test1234_sales_analyzer",
  "arguments": {
    "areaName": "raw_sales_data",
    "includeFormulas": false
  }
}
```

**Step 2: Clean and Transform Data**
```json
{
  "tool": "spreadapi_update_area_test1234_sales_analyzer",
  "arguments": {
    "updates": [{
      "areaName": "processed_data",
      "changes": [
        // Add data cleaning formulas
        { "row": 0, "col": 0, "value": "Product" },
        { "row": 0, "col": 1, "value": "Clean Sales" },
        { "row": 0, "col": 2, "value": "Category" },
        { "row": 0, "col": 3, "value": "Margin %" },
        
        // Clean sales amounts (remove text, handle errors)
        { "row": 1, "col": 1, "formula": "=IFERROR(VALUE(SUBSTITUTE(SUBSTITUTE(raw_sales_data!B2,\"$\",\"\"),\",\",\"\")),0)" },
        
        // Extract category from product code
        { "row": 1, "col": 2, "formula": "=LEFT(raw_sales_data!A2,FIND(\"-\",raw_sales_data!A2)-1)" },
        
        // Calculate margin
        { "row": 1, "col": 3, "formula": "=(B2-raw_sales_data!C2)/B2" }
      ]
    }],
    "returnOptions": {
      "includeValues": true,
      "includeFormulas": true
    }
  }
}
```

**Step 3: Add Summary Statistics**
```json
{
  "tool": "spreadapi_update_area_test1234_sales_analyzer",
  "arguments": {
    "updates": [{
      "areaName": "summary_stats",
      "changes": [
        { "row": 0, "col": 0, "value": "Total Sales" },
        { "row": 0, "col": 1, "formula": "=SUM(processed_data!B:B)" },
        { "row": 1, "col": 0, "value": "Average Margin" },
        { "row": 1, "col": 1, "formula": "=AVERAGE(processed_data!D:D)" },
        { "row": 2, "col": 0, "value": "Products > $1000" },
        { "row": 2, "col": 1, "formula": "=COUNTIF(processed_data!B:B,\">1000\")" }
      ]
    }],
    "returnOptions": {
      "includeValues": true,
      "includeRelatedOutputs": true
    }
  }
}
```

### Scenario 3: Interactive Budget Planner

**User Request**: "Help me create a monthly budget and see where I can save money"

**Step 1: Set Up Budget Categories**
```json
{
  "tool": "spreadapi_update_area_test1234_budget_planner",
  "arguments": {
    "updates": [{
      "areaName": "budget_items",
      "changes": [
        // Income
        { "row": 0, "col": 0, "value": "INCOME" },
        { "row": 1, "col": 0, "value": "Salary" },
        { "row": 1, "col": 1, "value": 5000 },
        { "row": 2, "col": 0, "value": "Freelance" },
        { "row": 2, "col": 1, "value": 1000 },
        
        // Expenses
        { "row": 4, "col": 0, "value": "EXPENSES" },
        { "row": 5, "col": 0, "value": "Rent" },
        { "row": 5, "col": 1, "value": 1500 },
        { "row": 6, "col": 0, "value": "Groceries" },
        { "row": 6, "col": 1, "value": 400 },
        
        // Add percentage of income column
        { "row": 5, "col": 2, "formula": "=B6/SUM($B$2:$B$3)" },
        { "row": 6, "col": 2, "formula": "=B7/SUM($B$2:$B$3)" }
      ]
    }]
  }
}
```

**Step 2: What-If Analysis**
```json
// User asks: "What if I reduce dining out by 50%?"
{
  "tool": "spreadapi_update_area_test1234_budget_planner",
  "arguments": {
    "updates": [{
      "areaName": "budget_items",
      "changes": [
        { "row": 8, "col": 3, "value": "Scenario: 50% less dining" },
        { "row": 8, "col": 4, "formula": "=B9*0.5" }
      ]
    }],
    "returnOptions": {
      "includeValues": true,
      "includeRelatedOutputs": true  // See impact on savings
    }
  }
}
```

### Scenario 4: Formula Generator Assistant

**User Request**: "Create formulas to calculate year-over-year growth"

```json
{
  "tool": "spreadapi_update_area_test1234_growth_analyzer",
  "arguments": {
    "updates": [{
      "areaName": "growth_calculations",
      "changes": [
        // Add YoY growth formulas
        { "row": 0, "col": 2, "value": "YoY Growth %" },
        { "row": 1, "col": 2, "formula": "=IFERROR((B2-B1)/B1,\"N/A\")" },
        { "row": 2, "col": 2, "formula": "=IFERROR((B3-B2)/B2,0)" },
        
        // Add moving average
        { "row": 0, "col": 3, "value": "3-Month Avg" },
        { "row": 3, "col": 3, "formula": "=AVERAGE(B2:B4)" },
        
        // Add trend indicator
        { "row": 0, "col": 4, "value": "Trend" },
        { "row": 1, "col": 4, "formula": "=IF(C2>0.1,\"↑ Strong\",IF(C2>0,\"↗ Growing\",IF(C2<-0.1,\"↓ Declining\",\"→ Stable\")))" }
      ]
    }],
    "returnOptions": {
      "includeValues": true,
      "includeFormulas": true
    }
  }
}
```

## Common Patterns and Solutions

### Pattern: Iterative Refinement
```javascript
// Start with simple formula
update_area({ changes: [{ row: 0, col: 1, formula: "=A1*2" }] })

// User: "Add error handling"
update_area({ changes: [{ row: 0, col: 1, formula: "=IFERROR(A1*2,0)" }] })

// User: "Make it handle text values"
update_area({ changes: [{ row: 0, col: 1, formula: "=IFERROR(VALUE(A1)*2,0)" }] })
```

### Pattern: Dynamic Range Formulas
```javascript
// Instead of fixed ranges
{ formula: "=SUM(B1:B10)" }

// Use dynamic ranges
{ formula: "=SUM(B:B)" }  // Entire column
{ formula: "=SUM(OFFSET(B1,0,0,COUNTA(B:B),1))" }  // Dynamic based on data
```

### Pattern: Validation and Constraints
```javascript
// Add data validation formulas
{
  changes: [
    // Ensure positive values
    { row: 0, col: 1, formula: "=MAX(0,A1)" },
    
    // Enforce min/max limits
    { row: 1, col: 1, formula: "=MIN(MAX(A2,0),100)" },
    
    // Validate with error message
    { row: 2, col: 1, formula: "=IF(A3<0,\"ERROR: Negative value\",A3)" }
  ]
}
```

## Error Recovery Examples

### Handling Permission Errors
```javascript
try {
  // Attempt to write formula
  update_area({ changes: [{ formula: "=SUM(A:A)" }] })
} catch (error) {
  if (error.includes("canWriteFormulas")) {
    // Fall back to reading and calculating in code
    const data = read_area({ areaName: "data" })
    const sum = calculateSum(data)
    update_area({ changes: [{ value: sum }] })  // Write value instead
  }
}
```

### Handling Out of Bounds
```javascript
const areaInfo = read_area({ areaName: "data" })
const maxRow = areaInfo.rows - 1

// Ensure we stay within bounds
const changes = userRows.map((row, index) => {
  if (index <= maxRow) {
    return { row: index, col: 0, value: row.value }
  }
}).filter(Boolean)
```

## Advanced Integration Patterns

### Multi-Service Orchestration
```javascript
// 1. Get input from one service
const taxRate = await call_service("tax_calculator", { income: 100000 })

// 2. Use in another service's area
await update_area("budget_planner", {
  changes: [{ row: 10, col: 1, value: taxRate.effective_rate }]
})

// 3. Read final results
const budget = await read_area("budget_planner", { areaName: "summary" })
```

### Conditional Workflows
```javascript
// Read current state
const current = await read_area({ areaName: "portfolio" })

// Make decisions based on data
if (current.data[0][3].value > 1000000) {
  // High-value portfolio logic
  await update_area({
    areaName: "recommendations",
    changes: [{ row: 0, col: 0, value: "Consider tax-loss harvesting" }]
  })
} else {
  // Standard portfolio logic
  await update_area({
    areaName: "recommendations", 
    changes: [{ row: 0, col: 0, value: "Focus on growth investments" }]
  })
}
```

## Tips for Natural Interactions

1. **Explain What You're Doing**
   - "I'll read your current budget to understand the structure..."
   - "Now I'm adding formulas to calculate percentages..."

2. **Show Incremental Progress**
   - Don't make all changes at once
   - Show results after each meaningful change

3. **Offer Alternatives**
   - "I can't modify formulas here, but I can update the values"
   - "Would you like me to create a new area for experiments?"

4. **Validate Understanding**
   - "I see your data has 12 months. Should I add projections for next year?"
   - "The current formula assumes 5% growth. Should I make this adjustable?"

5. **Handle Edge Cases Gracefully**
   - Empty cells: "Some cells are empty. Should I treat them as zero?"
   - Formula errors: "This formula has a #DIV/0 error. I'll add error handling"