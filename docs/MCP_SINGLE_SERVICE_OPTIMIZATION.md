# MCP Single-Service Optimization

## Overview

When an MCP token is configured with exactly **one service**, we can create a significantly better user experience by making the AI immediately aware of that service. Instead of forcing users to ask "what services are available?", the AI will automatically know which service to use and how to use it.

## The Core Concept

**Key Insight**: We already have `spreadapi_get_service_details` - a tool that returns comprehensive service documentation. For single-service MCP tokens, we simply tell the AI upfront which service to query.

### Current Multi-Service Flow
```
User: "Calculate my mortgage"
AI: "Let me first see what services are available..."
AI → calls spreadapi_list_services
AI → sees 15 different services
AI → needs to figure out which one is for mortgages
AI → calls spreadapi_get_service_details
AI → finally calls spreadapi_calc
```

### Optimized Single-Service Flow
```
User: "Calculate my mortgage"
AI: Already knows this is the "Mortgage Calculator" service
AI → calls spreadapi_get_service_details (serviceId provided in hint)
AI → calls spreadapi_calc
```

One less round-trip, zero ambiguity, better UX.

---

## Architecture

### No Special Tools Needed

We use the **exact same MCP tools** for both single-service and multi-service scenarios:
- `spreadapi_get_service_details` (no changes)
- `spreadapi_calc` (no changes)
- `spreadapi_list_services` (no changes)
- `spreadapi_read_area` (no changes)

### The Only Change: Contextual Hints

When MCP token has one service, we enhance the hints:

1. **In `initialize` response**: Tell AI the server is for "Mortgage Calculator"
2. **In tool descriptions**: Include the service ID and name
3. **In service details**: Return AI-friendly metadata (examples, usage guidance)

---

## Implementation

### Phase 1: Enhance Service Metadata

Add optional AI-specific fields to services. These enhance the existing `spreadapi_get_service_details` response.

#### Service-Level Fields

Add to **Settings Tab → AI Integration** section:

```typescript
interface ServiceConfig {
  // Existing fields...
  name: string;
  description: string;
  aiDescription?: string;        // Already exists
  aiUsageExamples?: string[];    // Already exists
  aiTags?: string[];             // Already exists

  // NEW: Just one field
  aiUsageGuidance?: string;      // "Use when user wants to calculate mortgage payments"
}
```

**UI Location**: Settings Tab
```tsx
<CollapsibleSection title="🤖 AI Integration" defaultOpen={false}>
  <Alert
    type="info"
    message="Help AI understand when to use this service"
    description="When accessed via MCP (Claude, ChatGPT), this guidance helps the AI know when to use this service."
  />

  <div>
    <label>Usage Guidance</label>
    <Input.TextArea
      placeholder="E.g., 'Use when user wants to calculate mortgage payments or compare loan options'"
      value={aiUsageGuidance}
      onChange={(e) => onAiUsageGuidanceChange(e.target.value)}
      rows={2}
    />
  </div>
</CollapsibleSection>
```

#### Input Parameter Fields

Add to **Parameters Panel → Each Input Parameter**:

```typescript
interface InputParameter {
  // Existing fields...
  name: string;
  alias: string;
  type: string;
  description?: string;

  // NEW: Just examples
  aiExamples?: string[];  // ["0.05 (5% APR)", "0.065 (6.5% APR)"]
}
```

**UI Location**: Parameters Panel (collapsible section in each input)
```tsx
<Collapse ghost size="small" items={[{
  key: 'ai-hints',
  label: '🤖 AI Examples (Optional)',
  children: (
    <Select
      mode="tags"
      placeholder="Add example values (press Enter)"
      value={input.aiExamples || []}
      onChange={(values) => updateInput(index, 'aiExamples', values)}
    />
  )
}]} />
```

#### Output Parameter Fields

Add to **Parameters Panel → Each Output Parameter**:

```typescript
interface OutputParameter {
  // Existing fields...
  name: string;
  alias: string;
  type: string;
  description?: string;

  // NEW: Presentation hint
  aiPresentationHint?: string;  // "Format as currency with 2 decimals"
}
```

**UI Location**: Parameters Panel (collapsible section in each output)
```tsx
<Collapse ghost size="small" items={[{
  key: 'ai-hints',
  label: '🤖 AI Presentation Hint (Optional)',
  children: (
    <Input
      placeholder="E.g., 'Format as currency', 'Show as percentage'"
      value={output.aiPresentationHint || ''}
      onChange={(e) => updateOutput(index, 'aiPresentationHint', e.target.value)}
    />
  )
}]} />
```

---

### Phase 2: Enhance MCP Server for Single-Service Tokens

#### A. Enhance `initialize` Response

**File**: `/app/api/mcp/bridge/route.js`

```javascript
case 'initialize': {
  const response = {
    protocolVersion: MCP_VERSION,
    capabilities: {
      tools: {},
      resources: { subscribe: false }
    },
    serverInfo: {
      name: SERVER_NAME,
      version: SERVER_VERSION
    }
  };

  // Detect single-service token
  const allowedServiceIds = auth.serviceIds || [];
  if (allowedServiceIds.length === 1) {
    const singleServiceId = allowedServiceIds[0];

    // Load service metadata
    const publishedData = await redis.hGetAll(`service:${singleServiceId}:published`);
    const serviceName = publishedData.title || singleServiceId;

    // Customize server info for this specific service
    response.serverInfo.name = serviceName;
    response.serverInfo.description = `This MCP connection provides access to the "${serviceName}" service (ID: ${singleServiceId}). Call spreadapi_get_service_details with this serviceId first to learn about inputs, outputs, and usage.`;

    // Add explicit instructions
    response.serverInfo.instructions = `This connection is configured for a single service: "${serviceName}". Before making calculations, call spreadapi_get_service_details(serviceId: "${singleServiceId}") to understand what parameters are needed.`;
  }

  return {
    jsonrpc: '2.0',
    result: response,
    id
  };
}
```

#### B. Enhance Tool Descriptions

**File**: `/app/api/mcp/bridge/route.js`

```javascript
case 'tools/list': {
  // Detect single-service token
  const allowedServiceIds = auth.serviceIds || [];
  const isSingleService = allowedServiceIds.length === 1;

  let getDetailsDescription = 'Get detailed information about a specific SpreadAPI service including its inputs, outputs, areas, and usage examples';
  let calcDescription = 'Execute calculations with optional area updates.';
  let listServicesDescription = 'List all published SpreadAPI services with their descriptions, metadata, and available areas';

  // Enhance descriptions for single-service scenario
  if (isSingleService) {
    const singleServiceId = allowedServiceIds[0];
    const publishedData = await redis.hGetAll(`service:${singleServiceId}:published`);
    const serviceName = publishedData.title || singleServiceId;

    getDetailsDescription = `Get details for the "${serviceName}" service. **CALL THIS FIRST** to learn what inputs are needed. Service ID: ${singleServiceId}`;
    calcDescription = `Execute the "${serviceName}" calculation. Call spreadapi_get_service_details first to understand required parameters. Service ID: ${singleServiceId}`;
    listServicesDescription = `List services (this token only has access to "${serviceName}")`;
  }

  const tools = [
    {
      name: 'spreadapi_get_service_details',
      description: getDetailsDescription,
      inputSchema: {
        type: 'object',
        properties: {
          serviceId: {
            type: 'string',
            description: isSingleService
              ? `The service ID (use "${allowedServiceIds[0]}")`
              : 'The service ID to get details for'
          }
        },
        required: ['serviceId']
      }
    },
    {
      name: 'spreadapi_list_services',
      description: listServicesDescription,
      inputSchema: { /* existing schema */ }
    },
    {
      name: 'spreadapi_calc',
      description: calcDescription,
      inputSchema: { /* existing schema */ }
    },
    // ... other tools
  ];

  return {
    jsonrpc: '2.0',
    result: { tools },
    id
  };
}
```

#### C. Enhance `spreadapi_get_service_details` Response

**File**: `/app/api/mcp/bridge/route.js` (around line 1034)

```javascript
if (name === 'spreadapi_get_service_details') {
  // ... existing code to load service ...

  // Format the response
  let responseText = `Service: ${publishedData.title || serviceId}\n`;
  responseText += `ID: ${serviceId}\n`;
  if (publishedData.description || publishedData.aiDescription) {
    responseText += `Description: ${publishedData.description || publishedData.aiDescription}\n`;
  }
  responseText += '\n';

  // NEW: Add usage guidance
  if (publishedData.aiUsageGuidance) {
    responseText += `WHEN TO USE THIS SERVICE:\n${publishedData.aiUsageGuidance}\n\n`;
  }

  // ... existing areas code ...

  if (apiDefinition.inputs && apiDefinition.inputs.length > 0) {
    responseText += 'INPUTS:\n';
    apiDefinition.inputs.forEach(input => {
      responseText += `• ${input.name}`;
      if (input.alias) responseText += ` (alias: ${input.alias})`;
      responseText += ` - ${input.type}`;
      if (input.mandatory) responseText += ' [REQUIRED]';
      if (input.format === 'percentage') {
        responseText += ' [PERCENTAGE: Enter as decimal, e.g., 0.05 for 5%]';
      }
      if (input.description) responseText += `\n  ${input.description}`;

      // NEW: Add AI examples
      if (input.aiExamples && input.aiExamples.length > 0) {
        responseText += `\n  Examples: ${input.aiExamples.join(', ')}`;
      }

      if (input.min !== undefined || input.max !== undefined) {
        responseText += `\n  Range: ${input.min || '*'} to ${input.max || '*'}`;
      }
      responseText += '\n';
    });
  }

  if (apiDefinition.outputs && apiDefinition.outputs.length > 0) {
    responseText += '\nOUTPUTS:\n';
    apiDefinition.outputs.forEach(output => {
      responseText += `• ${output.name} - ${output.type}`;
      if (output.description) responseText += `: ${output.description}`;

      // NEW: Add presentation hint
      if (output.aiPresentationHint) {
        responseText += `\n  Present as: ${output.aiPresentationHint}`;
      }

      responseText += '\n';
    });
  }

  // ... rest of existing code ...
}
```

---

### Phase 3: Backend Storage

#### Store New Fields in Redis

**File**: `/app/api/services/[id]/route.js`

```javascript
// When saving service (PUT handler)
await redis.hSet(`service:${serviceId}`, {
  // ... existing fields ...

  // NEW: AI metadata
  aiUsageGuidance: body.aiUsageGuidance || '',

  // Inputs/outputs already stored as JSON, just ensure AI fields are included
  inputs: JSON.stringify(body.inputs), // Contains aiExamples
  outputs: JSON.stringify(body.outputs) // Contains aiPresentationHint
});

// When publishing service
await redis.hSet(`service:${serviceId}:published`, {
  // ... existing fields ...

  // NEW: Include AI metadata in published data
  aiUsageGuidance: serviceData.aiUsageGuidance || '',
  inputs: serviceData.inputs,  // Already contains AI fields
  outputs: serviceData.outputs // Already contains AI fields
});
```

---

## Complete Example

### Service Configuration

**Service**: Mortgage Calculator

**Settings → AI Integration**:
```
Usage Guidance: "Use when user wants to calculate monthly mortgage payments or compare different loan terms and interest rates"
```

**Parameters → Inputs**:
```
Input: principal
  Type: number
  Description: Total loan amount
  AI Examples: ["300000 (for $300k loan)", "450000 (for $450k loan)", "200000 (for $200k loan)"]

Input: interestRate
  Type: number
  Description: Annual interest rate
  AI Examples: ["0.05 (5% APR)", "0.065 (6.5% APR)", "0.07 (7% APR)"]

Input: loanTerm
  Type: number
  Description: Loan term in years
  AI Examples: ["30 (30 years)", "15 (15 years)", "20 (20 years)"]
```

**Parameters → Outputs**:
```
Output: monthlyPayment
  Type: number
  Description: Monthly payment amount
  AI Presentation Hint: "Format as currency with 2 decimals"

Output: totalInterest
  Type: number
  Description: Total interest paid over loan life
  AI Presentation Hint: "Format as currency, emphasize this is total interest paid"
```

### MCP Token Configuration

**Token**: "Mortgage Calculator for ChatGPT"
**Services**: Only "mortgage_calc_123"

### AI Connection Flow

#### 1. Initialize
**Request**:
```json
{
  "method": "initialize",
  "params": {
    "protocolVersion": "1.0.0",
    "clientInfo": {
      "name": "ChatGPT",
      "version": "1.0.0"
    }
  }
}
```

**Response**:
```json
{
  "result": {
    "protocolVersion": "1.0.0",
    "serverInfo": {
      "name": "Mortgage Calculator",
      "description": "This MCP connection provides access to the 'Mortgage Calculator' service (ID: mortgage_calc_123). Call spreadapi_get_service_details with this serviceId first to learn about inputs, outputs, and usage.",
      "instructions": "This connection is configured for a single service: 'Mortgage Calculator'. Before making calculations, call spreadapi_get_service_details(serviceId: 'mortgage_calc_123') to understand what parameters are needed."
    }
  }
}
```

#### 2. List Tools
**Request**:
```json
{
  "method": "tools/list"
}
```

**Response**:
```json
{
  "result": {
    "tools": [
      {
        "name": "spreadapi_get_service_details",
        "description": "Get details for the 'Mortgage Calculator' service. **CALL THIS FIRST** to learn what inputs are needed. Service ID: mortgage_calc_123",
        "inputSchema": {
          "type": "object",
          "properties": {
            "serviceId": {
              "type": "string",
              "description": "The service ID (use 'mortgage_calc_123')"
            }
          },
          "required": ["serviceId"]
        }
      },
      {
        "name": "spreadapi_calc",
        "description": "Execute the 'Mortgage Calculator' calculation. Call spreadapi_get_service_details first to understand required parameters. Service ID: mortgage_calc_123"
      }
    ]
  }
}
```

#### 3. User Interaction

**User**: "What would my monthly payment be for a $300,000 loan at 6.5% for 30 years?"

**AI thinks**: "I see hints that I should call get_service_details for mortgage_calc_123 first"

**AI calls**:
```json
{
  "method": "tools/call",
  "params": {
    "name": "spreadapi_get_service_details",
    "arguments": {
      "serviceId": "mortgage_calc_123"
    }
  }
}
```

**AI receives**:
```
Service: Mortgage Calculator
ID: mortgage_calc_123
Description: Calculate monthly mortgage payments and total interest

WHEN TO USE THIS SERVICE:
Use when user wants to calculate monthly mortgage payments or compare different loan terms and interest rates

INPUTS:
• principal (alias: loanAmount) - number [REQUIRED]
  Total loan amount
  Examples: 300000 (for $300k loan), 450000 (for $450k loan), 200000 (for $200k loan)

• interestRate (alias: rate) - number [REQUIRED] [PERCENTAGE: Enter as decimal, e.g., 0.05 for 5%]
  Annual interest rate
  Examples: 0.05 (5% APR), 0.065 (6.5% APR), 0.07 (7% APR)

• loanTerm (alias: years) - number [REQUIRED]
  Loan term in years
  Examples: 30 (30 years), 15 (15 years), 20 (20 years)
  Range: 1 to 50

OUTPUTS:
• monthlyPayment - number: Monthly payment amount
  Present as: Format as currency with 2 decimals

• totalInterest - number: Total interest paid over loan life
  Present as: Format as currency, emphasize this is total interest paid

USAGE EXAMPLES:
1. Calculate monthly payment for a $300k loan at 6.5% for 30 years
2. Compare 15 year vs 30 year mortgage
```

**AI now knows everything** and calls:
```json
{
  "method": "tools/call",
  "params": {
    "name": "spreadapi_calc",
    "arguments": {
      "serviceId": "mortgage_calc_123",
      "inputs": {
        "principal": 300000,
        "interestRate": 0.065,
        "loanTerm": 30
      }
    }
  }
}
```

**AI presents results**:
```
For a $300,000 loan at 6.5% APR over 30 years:

💰 Monthly Payment: $1,896.20
📊 Total Interest: $382,632.00

This means you'll pay $382,632 in interest over the life of the loan - more than the original loan amount!
```

---

## Benefits

### For Service Creators
✅ **Easy Configuration**: Just add a few optional fields
✅ **Better AI Understanding**: Examples help AI use service correctly
✅ **Reusable**: Same metadata works for all MCP clients
✅ **No Code Changes**: Just metadata configuration

### For MCP Token Users
✅ **Instant Understanding**: AI knows what service it has access to
✅ **No Discovery Needed**: Zero friction to start using service
✅ **Better Responses**: AI formats outputs correctly
✅ **Natural Conversation**: User doesn't need to know service IDs

### For AI Assistants
✅ **Clear Context**: Knows exactly which service to use
✅ **Rich Documentation**: Examples guide correct parameter usage
✅ **Presentation Hints**: Knows how to format outputs
✅ **Usage Guidance**: Knows when to trigger the service

### Technical Benefits
✅ **No Special Cases**: Same tools for 1 or 100 services
✅ **Backward Compatible**: Multi-service tokens unchanged
✅ **Maintainable**: Service metadata = single source of truth
✅ **Scalable**: Works for any number of services
✅ **Flexible**: AI can still list services if needed

---

## Implementation Checklist

### UI Changes
- [ ] Add "AI Integration" section to Settings tab
  - [ ] Add `aiUsageGuidance` textarea

- [ ] Add AI hints to Parameters Panel
  - [ ] Add `aiExamples` tag input to each input parameter (collapsible)
  - [ ] Add `aiPresentationHint` input to each output parameter (collapsible)

### Backend Changes
- [ ] Update service storage to include new fields
  - [ ] Store `aiUsageGuidance` in service data
  - [ ] Ensure `aiExamples` and `aiPresentationHint` saved in inputs/outputs JSON

- [ ] Update published service data
  - [ ] Include new fields when publishing

- [ ] Enhance MCP bridge endpoint
  - [ ] Modify `initialize` handler to detect single-service tokens
  - [ ] Modify `tools/list` to enhance descriptions for single-service tokens
  - [ ] Modify `spreadapi_get_service_details` to include AI metadata in response

### Testing
- [ ] Create test service with AI metadata
- [ ] Create single-service MCP token
- [ ] Connect with Claude Desktop
- [ ] Verify `initialize` response includes hints
- [ ] Verify tool descriptions include service ID
- [ ] Verify `get_service_details` includes examples and hints
- [ ] Test with multi-service token (ensure no regression)

---

## Migration Strategy

### For Existing Services
- All existing services continue to work without changes
- New AI fields are **optional**
- Service creators can add AI metadata gradually

### For Existing Tokens
- Multi-service tokens: **No changes**, same behavior
- Single-service tokens: **Automatically get hints** when service has metadata
- No breaking changes to any existing functionality

---

## Future Enhancements

### Phase 2 (Optional)
- Add personality/tone settings (professional, casual, technical)
- Add example conversation flows
- Add multi-language support for descriptions

### Phase 3 (Optional)
- Auto-generate AI metadata from service structure
- Suggest examples based on parameter types
- Learn from actual usage patterns

---

## Summary

This optimization creates **specialized AI agents** from single-service MCP tokens by:

1. ✅ Storing optional AI-friendly metadata in service configuration
2. ✅ Detecting single-service tokens at MCP connection time
3. ✅ Providing contextual hints to guide the AI
4. ✅ Enhancing the existing `get_service_details` response

**Zero special tools needed.** Just smart hints that help AI understand context.

The result: Users can create ChatGPT agents or Claude Desktop connections that immediately know their purpose and how to fulfill it - no manual discovery needed.
