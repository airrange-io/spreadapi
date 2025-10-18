# Blog Content Cleanup Guide

## Articles Already Cleaned
1. ✅ ai-excel-accuracy-no-hallucinations.json
2. ✅ excel-api-performance-comparison.json

## Key Changes Made
- Removed all fake customer testimonials and quotes
- Simplified overly complex code examples
- Replaced hyperbolic claims with realistic ranges
- Shortened articles for better readability
- Fixed incorrect API examples (no `SpreadAPIService` class)
- Used actual API endpoints: `https://spreadapi.io/api/v1/services/{id}/execute`

## Standard Code Examples to Use

### Basic API Call
```javascript
const response = await fetch('https://spreadapi.io/api/v1/services/SERVICE_ID/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: {
      param1: value1,
      param2: value2
    }
  })
});
const result = await response.json();
```

### With Authentication
```javascript
const response = await fetch('https://spreadapi.io/api/v1/services/SERVICE_ID/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({ inputs: params })
});
```

## Content Guidelines

### REMOVE
- Customer quotes like "Jennifer Park, CTO at TechCorp"
- Specific dollar amounts in case studies ("$2.3M error")
- Claims of "100% accuracy" (use "matches Excel exactly")
- "Revolutionary" or "game-changer" language
- Complex nested code examples
- Emojis and P.S. notes
- "Zero maintenance" claims

### KEEP
- Technical explanations of AI limitations
- Simple, practical code examples
- Performance comparisons with ranges
- Problem/solution structure
- Clear benefits and tradeoffs
- Contact email: hello@airrange.io

### SIMPLIFY
- Multi-step workflows to basic examples
- Complex TypeScript to simple JavaScript
- Long explanations to bullet points
- Technical jargon to plain language

## Articles Needing Cleanup

### High Priority (Complex/Long)
- building-ai-agents-excel-tutorial.json
- stop-reimplementing-excel-business-logic-javascript.json
- excel-api-real-estate-mortgage-calculators.json
- mcp-protocol-excel-developers-guide.json
- claude-desktop-excel-integration-complete-guide.json

### Medium Priority (Moderate Changes)
- excel-goal-seek-api-ai-agents.json
- excel-formulas-vs-javascript.json
- spreadsheet-api-developers-need.json
- chatgpt-excel-integration-secure.json

### Low Priority (Minor Changes)
- excel-api-response-times-optimization.json
- spreadapi-vs-google-sheets-api-comparison.json

## Quick Fixes for All Articles

1. Replace `new SpreadAPIService()` with fetch API calls
2. Remove "100%" claims
3. Delete customer testimonials
4. Shorten to 50-70% of current length
5. Simplify code examples
6. Remove marketing hyperbole