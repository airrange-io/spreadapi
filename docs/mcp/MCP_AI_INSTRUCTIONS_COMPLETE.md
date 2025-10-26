# MCP AI Instructions - Complete Reference

**Purpose:** This document contains EVERY instruction, guidance, and description that is presented to AI assistants (Claude, ChatGPT) when they use the SpreadAPI MCP server.

**Source:** Extracted from actual code in `/app/api/mcp/bridge/route.js` and `/lib/mcp-ai-instructions.js`

**Last Updated:** 2025-10-26

---

## Table of Contents

1. [Server Initialization Instructions](#server-initialization-instructions)
2. [Tool Descriptions - Complete Text](#tool-descriptions---complete-text)
3. [AI Guidance Functions](#ai-guidance-functions)
4. [Dynamic Service-Specific Guidance](#dynamic-service-specific-guidance)
5. [Tool Input Schemas](#tool-input-schemas)
6. [Error Messages and Hints](#error-messages-and-hints)

---

## Server Initialization Instructions

### When MCP Server Initializes

The AI receives these instructions in the `serverInfo.instructions` field during the `initialize` handshake.

#### For Single Service (1 service available)

**Function:** `getSingleServiceInstructions(serviceId)`

**Exact Text Sent to AI:**

```
🚀 WORKFLOW:

OPTION A - User provides all values (FAST PATH - preferred):
→ Call spreadapi_calc("{serviceId}", inputs) immediately
   Example: User says "Calculate X with Y and Z"
   → You have all values, just call it now!

OPTION B - Need parameter info (DISCOVERY PATH):
1. Call spreadapi_get_service_details("{serviceId}")
2. Show user what parameters are needed
3. Call spreadapi_calc("{serviceId}", inputs)

🎯 PREFER OPTION A whenever possible (faster, better UX)

⚠️  CRITICAL - PERCENTAGE VALUES:
ALWAYS convert percentages to decimals (divide by 100):
• "5%" → 0.05 (NOT 5)
• "42%" → 0.42 (NOT 42)
• "0.5%" → 0.005 (NOT 0.5)
Entering "5" instead of "0.05" causes wildly incorrect results!

📊 PRESENTING RESULTS:
Outputs include formatString - ALWAYS use it!
Example: {"value": 265.53, "formatString": "€#,##0.00", "title": "Alt"}
→ Present as: "Alt: €265.53" (not "265.53")

🚀 BE PROACTIVE:
❌ DON'T ask "Would you like me to retrieve details?"
✅ DO: Just retrieve and use them
❌ DON'T ask "Would you like me to calculate?"
✅ DO: Calculate immediately
Only ask permission for saving data or irreversible actions.

🔄 AUTO-RECOVERY:
If calculation fails → Auto-call get_service_details and retry
If result seems absurd (>$1M for typical inputs, scientific notation) → Check percentage format, retry with correction
```

#### For Multiple Services (2+ services available)

**Function:** `getMultiServiceInstructions()`

**Exact Text Sent to AI:**

```
🎯 YOUR ROLE: Helpful calculation assistant, NOT a technical tool lister

When user asks "what can you do?":
❌ DON'T list technical tools or paths
✅ DO say: "I can help you calculate! What would you like to calculate?"
Focus on USER PROBLEMS, not technical capabilities.

🚀 WORKFLOW (follow this order):

OPTION A - User provides all values (FAST PATH - preferred):
→ Directly call: spreadapi_calc(serviceId, inputs)
   Example: "Calculate compound interest for $10k at 5% for 10 years"
   → You have enough info, call spreadapi_calc immediately!

OPTION B - Need parameter info (DISCOVERY PATH):
1. Call: spreadapi_get_service_details(serviceId)
2. Show user what parameters are needed
3. Call: spreadapi_calc(serviceId, inputs)

🎯 PREFER OPTION A whenever possible (faster, better UX)

⚠️  CRITICAL - PERCENTAGE VALUES:
ALWAYS convert percentages to decimals (divide by 100):
• "5%" → 0.05 (NOT 5)
• "42%" → 0.42 (NOT 42)
• "0.5%" → 0.005 (NOT 0.5)
Entering "5" instead of "0.05" causes wildly incorrect results!

📊 PRESENTING RESULTS:
Outputs include formatString - ALWAYS use it when available!
• formatString "€#,##0.00" → €265.53
• formatString "$#,##0.00" → $31,998.32
• Use title field for labels, not name
Present as: "Title: Formatted Value" (e.g., "Total: $31,998.32")

🚀 BE PROACTIVE - Stop Asking Permission!
❌ DON'T ask: "Would you like me to retrieve details?"
✅ DO: Just retrieve and use them
❌ DON'T ask: "Would you like me to calculate?"
✅ DO: Calculate immediately
Only ask permission for saving data or irreversible actions.

🔄 AUTO-RECOVERY:
• Calculation fails → Auto-call get_service_details and retry
• Result seems absurd (>$1M for typical inputs, scientific notation) → Check percentage format, auto-retry with correction

❌ DON'T:
- Call spreadapi_list_services (services already listed above)
- Ask for parameters you can infer
- Just say "that's unrealistic" - FIX IT!

✅ DO:
- Calculate immediately when you have values
- Pay attention to service warnings (⚠️) above
- Follow service guidance (💡) for conditional parameters
- Auto-correct errors and explain what you fixed
```

#### Fallback Instructions (When Service List Can't Load)

**Function:** `getFallbackInstructions()`

**Exact Text Sent to AI:**

```
🚀 Getting Started:
1. Call spreadapi_list_services() to discover available calculators
2. Use spreadapi_get_service_details(serviceId) to understand parameters
3. Execute the service tool (spreadapi_calc_[serviceId]) with input values

💡 Tips for Best Results:
• Always provide ALL required parameters in each call (stateless)
• Optional parameters have smart defaults applied automatically
• Enum parameters accept numbered choices (1, 2, 3) or values
• Percentages can be entered as decimals (0.42) or percentages (42%)
• Boolean values accept multiple formats (true/false, yes/no, ja/nein)
• For what-if scenarios, make multiple calls with different inputs (very fast!)
• Check parameter constraints (min/max, allowed values) in the schema
```

#### Fallback Description

**Function:** `getFallbackDescription()`

**Exact Text Sent to AI:**

```
SpreadAPI: Spreadsheet Calculations as API Services

This server provides access to Excel/Google Sheets spreadsheets that have been published as calculation APIs. Think of them as powerful, stateless calculators where you provide inputs and get calculated outputs instantly.

🎯 Use Cases:
• Financial calculations (taxes, insurance, loans, pricing)
• Scientific formulas and engineering calculations
• Business logic and data transformations
• Complex multi-step computations

📊 How It Works:
1. Each service is a spreadsheet with defined input and output parameters
2. You provide values for the inputs (required + optional)
3. The spreadsheet calculates and returns the outputs in milliseconds
4. All validation (types, ranges, enums) is handled automatically

⚡ Key Characteristics:
• STATELESS: Each calculation is independent - always provide all parameters
• FAST: Optimized calculations typically complete in <100ms
• BATCH-CAPABLE: You can request multiple parameter combinations at once
• NO MEMORY: Services don't remember previous calculations
```

---

## Tool Descriptions - Complete Text

### 1. spreadapi_calc

**Name:** `spreadapi_calc`

**Complete Description (Dynamically Built):**

```
🎯 PRIMARY TOOL - Use this for ALL calculations

WHEN TO USE:
- User asks for a calculation (e.g., "calculate...", "compute...", "what if...")
- User provides numeric values or scenarios
- User wants to compare options (use spreadapi_batch for 3+ comparisons)

HOW TO USE:
1. FAST PATH (preferred): If you know the parameters → Call immediately
   Example: User: "Calculate 5% interest on $1000 for 12 months"
   → You have: serviceId + inputs → Just call spreadapi_calc right now!

2. DISCOVERY PATH: If unsure about parameters → Call spreadapi_get_service_details first

⚠️  CRITICAL - PERCENTAGE VALUES:
ALWAYS convert percentages to decimals (divide by 100):
• "5%" → 0.05 (NOT 5)
• "42%" → 0.42 (NOT 42)
• "0.5%" → 0.005 (NOT 0.5)
Entering "5" instead of "0.05" causes wildly incorrect results!

📊 PRESENTING RESULTS:
Outputs include formatString - ALWAYS use it when available!
• Example output: {"value": 265.53, "formatString": "€#,##0.00", "title": "Alt"}
• Present as: "Alt: €265.53" (NOT "265.53" or "Alt: 265.53")
• Use title field for labels, not name
• If formatString missing, present raw value

🔄 AUTO-ERROR RECOVERY:
If calculation fails:
1. Auto-call spreadapi_get_service_details(serviceId)
2. Identify the issue (missing param, wrong type, etc.)
3. Retry with corrections
4. Explain what you fixed

If result seems absurd (>$1M for typical inputs, scientific notation):
1. Check if percentage values were converted (5% → 0.05)
2. Auto-retry with corrected values
3. Explain: "I noticed the result was unrealistic. The issue was..."

❌ DON'T just say "that's unrealistic" and stop
✅ DO: Fix it automatically and explain the correction

[DYNAMIC SECTION - Service-Specific Guidance]
IMPORTANT NOTES:

**Service Name** (service-id):
⚠️  [aiDescription if present]
💡 [aiUsageGuidance if present]
📝 Examples:
   • [aiUsageExample 1]
   • [aiUsageExample 2]

[Repeated for each service the token has access to]

[END DYNAMIC SECTION]

Available services:
• Service Title 1 (service-id-1) - Short description...
• Service Title 2 (service-id-2) - Short description...
[... all services listed]

RETURN FORMAT:
- outputs: Array of results with names and values
- serviceName: Human-readable name
- inputs: Echo of what you sent
- metadata: Execution time, caching info
```

**Input Schema Description (in parameters):**

```javascript
{
  serviceId: {
    type: "string",
    description: "Which service to execute. REQUIRED. Use IDs from the service list above.",
    enum: ["service1", "service2", ...] // All available service IDs
  },
  inputs: {
    type: "object",
    description: `Input parameters as key-value pairs.

⚠️  CRITICAL: Call spreadapi_get_service_details(serviceId) first if you don't know parameters!

Parameter formats:
• Percentages: Use decimals (0.05 for 5%, 0.42 for 42%)
• Booleans: true/false, yes/no, ja/nein all work
• Enums: Use exact values or numeric choices (1, 2, 3)
• Optional params: Omit them (defaults apply automatically)

Example: { "interest_rate": 0.05, "principal": 10000, "years": 30 }`,
    additionalProperties: true
  },
  areaUpdates: {
    type: "array",
    description: `ADVANCED: Update editable spreadsheet areas before calculating.

Only use if:
- Service has areas (check spreadapi_get_service_details)
- User wants to modify table data
- Calculation depends on editable dataset

Skip this for simple calculations with just input parameters.`,
    items: {
      type: "object",
      properties: {
        areaName: {
          type: "string",
          description: "The area to update"
        },
        changes: {
          type: "array",
          description: "Cell changes to apply",
          items: {
            type: "object",
            properties: {
              row: { type: "number", description: "Row index within area (0-based)" },
              col: { type: "number", description: "Column index within area (0-based)" },
              value: { description: "New cell value" },
              formula: { type: "string", description: "New cell formula" }
            }
          }
        }
      },
      required: ["areaName", "changes"]
    }
  },
  returnOptions: {
    type: "object",
    description: "Control what data is returned after calculation",
    properties: {
      includeOutputs: {
        type: "boolean",
        description: "Return calculation outputs (default: true)",
        default: true
      },
      includeAreaValues: {
        type: "boolean",
        description: "Return updated area values",
        default: false
      },
      includeAreaFormulas: {
        type: "boolean",
        description: "Return area formulas",
        default: false
      },
      includeAreaFormatting: {
        type: "boolean",
        description: "Return area formatting",
        default: false
      }
    }
  }
}
```

### 2. spreadapi_get_service_details

**Name:** `spreadapi_get_service_details`

**Complete Description:**

```
📋 DISCOVERY TOOL - Learn about service parameters

WHEN TO USE:
- You're about to call spreadapi_calc but don't know required parameters
- User asks "what parameters do you need?" or "what can you calculate?"
- You need to show available enum/choice options

WHEN NOT TO USE:
- User already provided all values → Skip this, call spreadapi_calc directly
- You just want to list services → They're shown in spreadapi_calc description
- Simple calculation with obvious parameters → Infer and calculate

RETURNS:
- inputs: Array with types, constraints, defaults, examples, percentage format hints
- outputs: What the calculation returns (with formatString for presentation)
- aiDescription: Special instructions for this service (READ THIS!)
- aiUsageExamples: Example requests and how to handle them

📊 IMPORTANT: Check outputs for formatString - use it to present results correctly!
```

**Input Schema:**

```javascript
{
  serviceId: {
    type: "string",
    description: "The service ID to get details for"
  }
}
```

### 3. spreadapi_list_services

**Name:** `spreadapi_list_services`

**Complete Description:**

```
📑 OPTIONAL - List all services with metadata

⚠️  USUALLY SKIP THIS! Services are already listed in spreadapi_calc tool description.

ONLY use if:
- User explicitly asks "what services do you have?" or "list all calculators"
- You need detailed metadata (creation dates, call counts, categories)
- You need to discover services with editable areas

🚀 BE PROACTIVE:
❌ DON'T ask "Would you like me to list services?"
✅ DO: Just use the services shown in spreadapi_calc description
```

**Input Schema:**

```javascript
{
  includeMetadata: {
    type: "boolean",
    description: "Include detailed metadata like inputs/outputs (default: false)",
    default: false
  },
  includeAreas: {
    type: "boolean",
    description: "Include information about editable areas (default: true)",
    default: true
  }
}
```

### 4. spreadapi_read_area

**Name:** `spreadapi_read_area`

**Complete Description (Dynamically Built):**

```
🔍 ADVANCED - Read editable spreadsheet areas (tables/lists)

COMPLEX FEATURE - Only use if service has editable areas.

[DYNAMIC SECTION - If services with areas exist]
Your services with editable areas:
• Service Title 1 (service-id-1) - Areas: AreaName1, AreaName2
• Service Title 2 (service-id-2) - Areas: AreaName3
[END DYNAMIC SECTION]
```

**Input Schema:**

```javascript
{
  serviceId: {
    type: "string",
    description: "The ID of the service containing the area",
    enum: ["service-id-1", "service-id-2", ...] // Only services with areas
  },
  areaName: {
    type: "string",
    description: "The name of the area to read"
  },
  includeFormulas: {
    type: "boolean",
    description: "Include cell formulas in the response",
    default: false
  },
  includeFormatting: {
    type: "boolean",
    description: "Include cell formatting in the response",
    default: false
  }
}
```

### 5. spreadapi_batch

**Name:** `spreadapi_batch`

**Complete Description:**

```
Execute multiple calculations at once for comparison. Perfect for scenarios like comparing different loan terms, investment strategies, or budget variations.

🚀 BE PROACTIVE: When user says "compare X and Y", just run the batch immediately - don't ask permission.

⚠️  PERCENTAGE WARNING: Apply same percentage conversion (5% → 0.05) to ALL scenarios in batch.

📊 PRESENTATION: Use formatString from outputs to present comparison table with proper formatting.
```

**Input Schema:**

```javascript
{
  calculations: {
    type: "array",
    description: "Array of calculations to perform",
    items: {
      type: "object",
      properties: {
        serviceId: {
          type: "string",
          description: "The service to use for this calculation"
        },
        inputs: {
          type: "object",
          description: "Input parameters for this calculation"
        },
        label: {
          type: "string",
          description: "Label for this scenario (e.g., \"15-year loan\", \"Conservative estimate\")"
        }
      },
      required: ["serviceId", "inputs"]
    },
    minItems: 1,
    maxItems: 10
  },
  compareOutputs: {
    type: "array",
    description: "Which outputs to include in comparison table",
    items: { type: "string" }
  }
}
```

### 6. spreadapi_save_state

**Name:** `spreadapi_save_state`

**Complete Description:**

```
Save calculation results to enable scenario comparison and decision-making.

PURPOSE: Since calculations are stateless (no memory), this tool bridges that gap - save multiple scenarios to compare later.

WORKFLOW: Calculate → Save with descriptive label → Calculate alternative → Save → Compare → Make decision.

WHEN TO USE: When user says "remember this", "save this scenario", "let's compare options", or when doing what-if analysis.

Examples:
- "Calculate my 30-year mortgage and save it as baseline"
- "Save this as aggressive investment option"

🚀 BE PROACTIVE:
❌ DON'T ask "Would you like me to save this?"
✅ DO: Just save it with a descriptive label when user says "remember" or is comparing options

📊 SAVE WITH FORMATSTRING: Outputs include formatString - they're preserved in saved state.
```

**Input Schema:**

```javascript
{
  serviceId: {
    type: "string",
    description: "The service that was used for calculation"
  },
  inputs: {
    type: "object",
    description: "The input parameters that were used"
  },
  outputs: {
    type: "object",
    description: "The calculation results to save"
  },
  label: {
    type: "string",
    description: "Descriptive label that helps user recall this scenario later (e.g., \"30-year fixed mortgage\", \"conservative portfolio\", \"current salary scenario\"). IMPORTANT: Use clear, distinctive labels since users compare multiple scenarios - avoid vague names like \"option 1\""
  },
  ttl: {
    type: "number",
    description: "Time-to-live in seconds. Defaults to 3600 (1 hour) for temporary states, use 86400 for 24-hour saved scenarios",
    default: 3600
  }
}
```

### 7. spreadapi_load_state

**Name:** `spreadapi_load_state`

**Complete Description:**

```
Retrieve saved calculation to compare or reuse.

PURPOSE: Load previous scenarios for side-by-side comparison or to build upon. Returns both original inputs AND calculated outputs.

WHEN TO USE: When user says "compare with the baseline", "show me the 30-year option", "what were the numbers for scenario X?", or when preparing a comparison table.

TIP: Load multiple saved states to create comparison summaries.

🚀 BE PROACTIVE:
❌ DON'T ask "Would you like me to load the baseline scenario?"
✅ DO: Just load it and show the comparison

📊 USE FORMATSTRING: When presenting loaded results, use formatString from outputs for proper formatting.
```

**Input Schema:**

```javascript
{
  stateId: {
    type: "string",
    description: "The state ID returned from spreadapi_save_state"
  }
}
```

### 8. spreadapi_list_saved_states

**Name:** `spreadapi_list_saved_states`

**Complete Description:**

```
Discover what scenarios the user has already calculated and saved.

PURPOSE: Help user recall their previous work and see all saved options at a glance.

WHEN TO USE: User asks "what scenarios did we calculate?", "show my saved options", "what were we comparing?", or proactively before suggesting new calculations to avoid duplicates.

Returns state IDs (for loading), descriptive labels (user-friendly), service names, and timestamps.
```

**Input Schema:**

```javascript
{
  serviceId: {
    type: "string",
    description: "Optional: filter by specific service. If omitted, shows all saved states across all services"
  },
  limit: {
    type: "number",
    description: "Maximum number of states to return (default: 10, max: 50)",
    default: 10
  }
}
```

---

## Dynamic Service-Specific Guidance

### How Service-Specific Instructions are Added

When building tool descriptions, the system dynamically inserts service-specific AI guidance for each service the token has access to.

**Template:**

```
IMPORTANT NOTES:

**{service.name}** ({service.id}):
⚠️  {service.aiDescription}
💡 {service.aiUsageGuidance}
📝 Examples:
   • {service.aiUsageExamples[0]}
   • {service.aiUsageExamples[1]}
```

**Example (Actual):**

```
IMPORTANT NOTES:

**German Tax Calculator** (lohnsteuer-rechner):
⚠️  This calculates German income tax (Lohnsteuer). Always ask for gross annual salary and tax class (Steuerklasse). Common tax classes: 1 (single), 2 (single parent), 3 (married, higher earner), 4 (married, equal), 5 (married, lower earner), 6 (second job).
💡 When user asks about German salary or net income, use this calculator. Tax class is REQUIRED - if user doesn't provide it, ask them.
📝 Examples:
   • What's my net salary at €60,000 in Germany with tax class 1?
   • Calculate tax on €45,000 gross income in tax class 3

**Mortgage Calculator** (mortgage-calc):
⚠️  Interest rates MUST be entered as decimals. 5% = 0.05, not 5.
💡 Always convert user's percentage to decimal before calling this service.
📝 Examples:
   • Calculate 5% interest on $100,000 for 30 years
   • What's my monthly payment on $250k mortgage at 4.5%?
```

### Service Metadata Used for AI Guidance

From `service:{id}:published` Redis hash:

```javascript
{
  // Basic AI guidance
  aiDescription: "When to use this service",
  aiUsageGuidance: "How to use this service correctly",
  aiUsageExamples: JSON.stringify([
    "Example request 1",
    "Example request 2"
  ]),
  aiTags: JSON.stringify([
    "category1",
    "category2"
  ])
}
```

---

## Tool Input Parameter Descriptions

### Input Parameter Guidance (Built Dynamically)

For each input parameter in a service, the system builds user-friendly descriptions with AI guidance.

**Template for Building Parameter Descriptions:**

```javascript
// Base description
let description = input.title || input.name;

if (input.description) {
  description += ': ' + input.description;
}

// Add enum options (if present)
if (input.allowedValues && input.allowedValues.length > 0) {
  const options = input.allowedValues
    .map((val, idx) => `${idx + 1}. ${val}`)
    .join(', ');
  description += `. Options: ${options} (you can use the number or value)`;
}

// Add boolean guidance
else if (input.type === 'boolean') {
  description += ' (true/false, yes/no, ja/nein, 1/0 accepted)';
}

// Add percentage guidance
else if (input.format === 'percentage' || input.formatString?.includes('%')) {
  description += ' (Enter as decimal: 0.42 for 42%, or as percentage: 42%)';
}

// Add numeric range constraints
else if (input.type === 'number' && (input.min !== undefined || input.max !== undefined)) {
  if (input.min !== undefined && input.max !== undefined) {
    description += `. Must be between ${input.min} and ${input.max}`;
  } else if (input.min !== undefined) {
    description += `. Minimum: ${input.min}`;
  } else if (input.max !== undefined) {
    description += `. Maximum: ${input.max}`;
  }
}
```

**Example Output:**

```
Interest Rate: Annual interest rate for the loan.
Enter as decimal: 0.42 for 42%, or as percentage: 42%.
Must be between 0 and 1
```

**Another Example (Enum):**

```
Tax Class: German tax class (Steuerklasse).
Options: 1. Steuerklasse 1, 2. Steuerklasse 2, 3. Steuerklasse 3, 4. Steuerklasse 4, 5. Steuerklasse 5, 6. Steuerklasse 6
(you can use the number or value)
```

**Another Example (Boolean):**

```
Include Children: Whether taxpayer has children
(true/false, yes/no, ja/nein, 1/0 accepted)
```

---

## Error Messages and Hints

### Authentication Errors

**Invalid Token Format:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Authentication failed: Invalid token format"
  },
  "id": null
}
```

**Token Not Found:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Authentication failed: Token not found or inactive"
  },
  "id": null
}
```

### Tool Call Errors

**Missing Service ID:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Missing required parameter: serviceId",
    "data": {
      "hint": "The \"serviceId\" parameter is required for spreadapi_calc tool. Use tools/list to see available services.",
      "requiredParams": ["serviceId"],
      "optionalParams": ["inputs", "areaUpdates", "returnOptions"],
      "documentation": "https://spreadapi.io/docs/mcp/tools"
    }
  },
  "id": 1
}
```

**Access Denied - No Service Access:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Access denied: This token has no service access configured",
    "data": {
      "hint": "Create a new token with specific services selected at https://spreadapi.io/app/profile",
      "requestedService": "mortgage-calc",
      "allowedServices": [],
      "documentation": "https://spreadapi.io/docs/mcp/tokens"
    }
  },
  "id": 1
}
```

**Access Denied - Specific Service:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Access denied: Service \"mortgage-calc\" is not accessible with this token",
    "data": {
      "requestedService": "mortgage-calc",
      "allowedServices": ["tax-calc", "roi-calc"],
      "hint": "This token has access to: tax-calc, roi-calc. Use tools/list to see available services.",
      "documentation": "https://spreadapi.io/docs/mcp/tokens"
    }
  },
  "id": 1
}
```

**Service Not Found:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Service \"unknown-service\" not found or not published",
    "data": {
      "requestedService": "unknown-service",
      "hint": "The service may have been deleted, unpublished, or the ID is incorrect. Use tools/list to see available services.",
      "allowedServices": ["tax-calc", "roi-calc"]
    }
  },
  "id": 1
}
```

**Unknown Tool:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Unknown tool: \"invalid_tool_name\"",
    "data": {
      "requestedTool": "invalid_tool_name",
      "hint": "Use tools/list to see all available tools. Common tools: spreadapi_calc, spreadapi_read_area, or service-specific tools.",
      "availableGenericTools": ["spreadapi_calc", "spreadapi_read_area"],
      "documentation": "https://spreadapi.io/docs/mcp/tools"
    }
  },
  "id": 1
}
```

---

## Response Format Examples

### Successful Calculation Response

**From spreadapi_calc:**

```
✅ {serviceName} - Calculation Complete

📊 Results:
  • {output.title}: {formatted_value}
  • {output.title}: {formatted_value}

💡 These are the final calculated outputs from the spreadsheet.
To recalculate with different inputs, call this tool again (stateless, very fast).

⚡ Completed in {executionTime}ms
```

**Actual Example:**

```
✅ Mortgage Calculator - Calculation Complete

📊 Results:
  • Monthly Payment: $536.82
  • Total Interest: $93,255.78
  • Total Paid: $193,255.78

💡 These are the final calculated outputs from the spreadsheet.
To recalculate with different inputs, call this tool again (stateless, very fast).

⚡ Completed in 45ms
```

### Get Service Details Response

**Format:**

```
Service: {title}
ID: {serviceId}
Description: {description}

[If aiUsageGuidance present:]
WHEN TO USE:
{aiUsageGuidance}

INPUTS:
• {input.name} - {input.type} [REQUIRED/OPTIONAL]
  {input.description}
  [If percentage:] [PERCENTAGE: Enter as decimal, e.g., 0.05 for 5%]
  [If allowedValues:] Allowed values: {values}
  [If defaultValue:] Default: {defaultValue}
  [If aiExamples:] Examples: {examples}
  [If min/max:] Range: {min} to {max}

OUTPUTS:
• {output.name} - {output.type}: {output.description}
  [If format:] [FORMAT: {format}]
  [If formatString:] 📊 formatString: "{formatString}" - ALWAYS use this for presentation!
      Example: value=265.53 → display as formatted with this pattern
  [If aiPresentationHint:] Present as: {aiPresentationHint}

⚠️  IMPORTANT: When presenting results, check each output for formatString field!
    If present, use it to format the value (e.g., "€#,##0.00" → €265.53)
    Use the title field (not name) as the label for user-friendly display.

[If areas present:]
EDITABLE AREAS:
• {area.name} - {area.mode}
  Address: {area.address}
  Description: {area.description}
  Purpose: {area.aiContext.purpose}
  Expected Behavior: {area.aiContext.expectedBehavior}
  Permissions:
    - Read values
    - Write values
    [etc.]

Requires Token: {needsToken}
Caching Enabled: {useCaching}

[If aiUsageExamples:]
USAGE EXAMPLES:
1. {example1}
2. {example2}
```

### Batch Calculation Response

**Format:**

```
▶ Batch Calculation Results

### {label1}
{output.title}: {formatted_value}
{output.title}: {formatted_value}

### {label2}
{output.title}: {formatted_value}
{output.title}: {formatted_value}

### Comparison Table

| Scenario | {output1.title} | {output2.title} |
|----------|-----------------|-----------------|
| {label1} | {formatted_val} | {formatted_val} |
| {label2} | {formatted_val} | {formatted_val} |
```

### List Services Response

**Format:**

```
Found {count} published services:

▶ {service.title}
   {service.description}
   💡 To run this calculation, use: spreadapi_calc_{service.id}
   Parameters: {inputCount} inputs, {outputCount} outputs
   [If includeAreas and has areas:]
   Interactive areas available:
     • {area.name} ({area.mode}) [{area.address}]
   Usage: {calls} calls

💡 Tip: To run a service calculation, call the tool shown above (e.g., spreadapi_calc_{firstServiceId}). I'll guide you through the required parameters.
```

---

## Backward Compatibility - Service-Specific Tools

### Legacy Tool Names (When includeServiceSpecificTools: true)

For each service, additional legacy tools are generated:

**Tool Name:** `spreadapi_calc_{serviceId}`

**Description Format:**

```
{serviceName}: {description}

📊 This is a stateless spreadsheet calculation with {inputCount} input parameter(s) and {outputCount} output(s). Provide all required inputs to get instant results (typically <100ms).

[If aiUsageExamples:]
💡 Example: {aiUsageExamples[0]}
```

**Input Schema:**
- Direct parameters (no serviceId needed)
- Each service input becomes a tool parameter
- Same parameter descriptions as above

**Tool Name:** `spreadapi_read_area_{serviceId}`

**Description:**
```
Read data from editable areas in {serviceName}. Areas: {areaDescriptions}
```

---

## Complete Workflow Examples

### Example 1: Single Service, FAST PATH

**User:** "Calculate 5% interest on $100,000 for 30 years"

**AI Reasoning (based on instructions):**
```
1. Check: Do I have all values?
   - ✅ Interest rate: 5% (convert to 0.05)
   - ✅ Principal: $100,000
   - ✅ Years: 30

2. Instructions say: "FAST PATH (preferred): If you know parameters → Call immediately"

3. ✅ I have all parameters → Call spreadapi_calc NOW
```

**AI Action:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "spreadapi_calc",
    "arguments": {
      "serviceId": "mortgage-calc",
      "inputs": {
        "interest_rate": 0.05,
        "principal": 100000,
        "years": 30
      }
    }
  }
}
```

### Example 2: Multiple Services, Need Discovery

**User:** "I need to calculate German taxes"

**AI Reasoning:**
```
1. Check: Multiple services available
2. Check: Do I have parameters? ❌ No
3. Instructions say: "DISCOVERY PATH: Call spreadapi_get_service_details first"
4. Which service? "German" → "lohnsteuer-rechner"
```

**AI Action 1:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "spreadapi_get_service_details",
    "arguments": {
      "serviceId": "lohnsteuer-rechner"
    }
  }
}
```

**Response Shows:**
```
INPUTS:
• bruttogehalt - number [REQUIRED]
  Gross annual salary in euros
  Range: 0 to 1000000

• steuerklasse - number [REQUIRED]
  German tax class (Steuerklasse)
  Allowed values: 1, 2, 3, 4, 5, 6

WHEN TO USE:
Always ask for gross salary and tax class. Tax class is REQUIRED.
```

**AI Action 2 (asks user):**
"I can calculate German income tax for you. I'll need:
1. Your gross annual salary in euros
2. Your tax class (Steuerklasse) - which one applies to you?
   1. Steuerklasse 1 (single)
   2. Steuerklasse 2 (single parent)
   3. Steuerklasse 3 (married, higher earner)
   ..."

### Example 3: Auto-Error Recovery

**User:** "Calculate 5% interest on $1000"

**AI Calls:**
```json
{
  "serviceId": "mortgage-calc",
  "inputs": {
    "interest_rate": 5,  // ❌ ERROR: Forgot to convert!
    "principal": 1000
  }
}
```

**AI Gets Result:**
```
Monthly Payment: $42,315,789.21
```

**AI Reasoning (based on instructions):**
```
1. Result seems absurd (>$1M for typical inputs) ✅
2. Instructions say: "Check if percentage values were converted (5% → 0.05)"
3. I sent 5 instead of 0.05! ❌
4. Instructions say: "Auto-retry with corrected values"
```

**AI Auto-Recovery:**
```json
{
  "serviceId": "mortgage-calc",
  "inputs": {
    "interest_rate": 0.05,  // ✅ Corrected
    "principal": 1000,
    "years": 30
  }
}
```

**AI Explains to User:**
"I noticed the result was unrealistic. The issue was that I forgot to convert the percentage to a decimal. I've corrected it - 5% should be 0.05. Your actual monthly payment is $5.37."

---

## Summary

This document contains **every single instruction** that is sent to AI assistants when using SpreadAPI's MCP server:

✅ Server initialization instructions (3 variants: single service, multi service, fallback)
✅ Complete tool descriptions (8 generic tools)
✅ Dynamic service-specific guidance (injected from service metadata)
✅ Input parameter descriptions (with type-specific guidance)
✅ Error messages with helpful hints
✅ Response format templates
✅ Backward compatibility tool descriptions
✅ Complete workflow examples

All text is extracted directly from the source code and represents what AI assistants actually receive.

---

**Source Files:**
- `/app/api/mcp/bridge/route.js` - Tool descriptions and handlers (2262 lines)
- `/lib/mcp-ai-instructions.js` - AI guidance functions (175 lines)

**Total AI Guidance:** ~500+ lines of instructions dynamically assembled based on:
- Number of services (single vs multi)
- Service metadata (aiDescription, aiUsageGuidance, aiUsageExamples)
- Input parameter types (percentage, enum, boolean, numeric ranges)
- Service capabilities (areas, caching, token requirements)

**Version:** 1.0
**Last Updated:** 2025-10-26
**Status:** Complete - Every AI instruction documented
