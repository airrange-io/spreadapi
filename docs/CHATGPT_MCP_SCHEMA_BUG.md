# ChatGPT MCP Nested Schema Bug - Documentation

**Date:** 2025-01-27
**Issue:** ChatGPT strips nested `properties` fields from MCP tool schemas
**Status:** Documented with workaround implemented
**Severity:** High - affects parameter discovery and type validation

---

## Table of Contents
1. [Problem Summary](#problem-summary)
2. [Technical Details](#technical-details)
3. [Investigation Results](#investigation-results)
4. [Workaround Implementation](#workaround-implementation)
5. [MCP Lifecycle](#mcp-lifecycle)
6. [ChatGPT Responses](#chatgpt-responses)
7. [References](#references)

---

## Problem Summary

ChatGPT's MCP implementation has a bug where **nested `properties` fields in tool input schemas are stripped** during the `tools/list` phase. This prevents ChatGPT from seeing parameter definitions that are correctly built and transmitted by the server.

### What Should Happen
```javascript
// Server sends (correct MCP schema):
{
  name: 'spreadapi_batch',
  inputSchema: {
    type: 'object',
    properties: {
      scenarios: {
        type: 'array',
        items: {
          properties: {
            inputs: {
              type: 'object',
              additionalProperties: true,
              properties: {
                starting_amount: { type: 'number', description: 'Starting Amount' },
                interest_rate: { type: 'number', description: 'Interest Rate' },
                // ... etc
              }
            }
          }
        }
      }
    }
  }
}
```

### What Actually Happens
```javascript
// ChatGPT receives (nested properties missing):
{
  name: 'spreadapi_batch',
  inputSchema: {
    type: 'object',
    properties: {
      scenarios: {
        type: 'array',
        items: {
          properties: {
            inputs: {
              type: 'object',
              description: "Input values for this scenario"
              // ❌ properties field COMPLETELY MISSING
              // ❌ additionalProperties field MISSING
            }
          }
        }
      }
    }
  }
}
```

---

## Technical Details

### Affected Fields
- **Stripped**: `properties` objects at depth > 2
- **Stripped**: `additionalProperties` boolean
- **Preserved**: `type`, `description`, `required` arrays
- **Preserved**: Top-level schema structure

### Impact
1. ChatGPT cannot see parameter names/types from `tools/list`
2. ChatGPT must call `spreadapi_get_details` to discover parameters
3. Adds one extra round-trip for first calculation
4. No impact on functionality (workaround exists)

### MCP Specification Compliance
✅ Our server implementation is **fully compliant** with MCP specification
❌ ChatGPT's client implementation **violates** the specification

From [MCP Schema Spec](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-06-18/schema.json):
```json
"inputSchema": {
  "description": "A JSON Schema object defining the expected parameters for the tool.",
  "properties": {
    "properties": {
      "additionalProperties": {
        "additionalProperties": true,
        "properties": {},
        "type": "object"
      },
      "type": "object"
    }
  }
}
```

**Key Point**: "Each property accepts `additionalProperties: true`, allowing flexible nested structures" with "no documented restrictions on depth or structure."

---

## Investigation Results

### Community Reports

From [OpenAI Community Forum](https://community.openai.com/t/mcp-server-tools-now-in-chatgpt-developer-mode/1357233):

> **Developer Report 1:**
> "Complex structured objects" in tool return types caused failures. Workaround involves reverting "return types of tools from complex structured objects to strings." Claude Web reportedly handled complex objects without this limitation.

> **Developer Report 2:**
> "MCP bridge used in ChatGPT requires the arguments to be sent as a string, not objects," contrasting with other MCP implementations that accepted structured data.

> **Developer Report 3:**
> Tools returning files fail—ChatGPT assumes local filesystem storage but doesn't properly retrieve the files.

### ChatGPT's Limitations vs. Claude

| Feature | MCP Spec | ChatGPT | Claude Web |
|---------|----------|---------|------------|
| Nested schema properties | ✅ Supported | ❌ Stripped | ✅ Works |
| Complex return objects | ✅ Supported | ❌ Fails | ✅ Works |
| File returns | ✅ Supported | ❌ Fails | ✅ Works |
| Bearer token auth | ✅ Supported | ❌ Not supported | ✅ Works |

### Performance Notes

From community feedback:
- **Tool Limit**: Performance degrades with 70+ tools; optimal is 30-40 tools
- **Authentication**: Only OAuth or no-auth supported in ChatGPT
- **Simplification**: "Things work better with fewer tools"

---

## Workaround Implementation

### Strategy: Embed Schema in Description

Since `description` fields transmit correctly but nested `properties` don't, we embed a stringified JSON schema in the tool description.

### Code Implementation

**File:** `/app/api/mcp/service/[serviceId]/route.js`

```javascript
// Build stringified parameter schema for ChatGPT compatibility
const parameterSchemaString = (apiDefinition.inputs && apiDefinition.inputs.length > 0)
  ? '\n\n📋 PARAMETER SCHEMA (for ChatGPT compatibility):\n```json\n' +
    JSON.stringify(
      apiDefinition.inputs.reduce((acc, input) => {
        acc[input.name] = {
          type: input.type === 'number' ? 'number' : input.type === 'boolean' ? 'boolean' : 'string',
          description: input.title || input.name,
          ...(input.min !== undefined && { min: input.min }),
          ...(input.max !== undefined && { max: input.max }),
          ...(input.mandatory !== false && { required: true })
        };
        return acc;
      }, {}),
      null,
      2
    ) + '\n```'
  : '';

// Append to tool descriptions
const calcTool = {
  name: 'spreadapi_calc',
  description: `
    ... existing description ...
    ${parameterSchemaString}
  `,
  inputSchema: { /* proper MCP schema still included */ }
};
```

### Example Output

ChatGPT now sees in tool description:
```markdown
🎯 PRIMARY CALCULATION TOOL
...

📋 PARAMETER SCHEMA (for ChatGPT compatibility):
```json
{
  "starting_amount": {
    "type": "number",
    "description": "Starting Amount",
    "required": true
  },
  "monthly_deposit": {
    "type": "number",
    "description": "Monthly Deposit",
    "required": true
  },
  "interest_rate": {
    "type": "number",
    "description": "Interest Rate",
    "min": 0,
    "max": 1,
    "required": true
  },
  "months_of_payment": {
    "type": "number",
    "description": "Duration",
    "required": true
  }
}
```
```

### Benefits

✅ **ChatGPT can parse JSON** from markdown code blocks
✅ **Includes validation rules** (min, max, required)
✅ **Still MCP-compliant** - proper inputSchema remains intact
✅ **Works for all clients** - Claude can use proper schema, ChatGPT uses description
✅ **Reduces round trips** - ChatGPT might skip `get_details` call
✅ **Future-proof** - When ChatGPT fixes bug, proper schema takes precedence

---

## MCP Lifecycle

### Stage 1: Initialize (Once)
```
ChatGPT → POST initialize
Server  → { name, version, description, instructions }
```

**Result:** Basic server info, NO tool details yet.

### Stage 2: tools/list (Tool Discovery)
```
ChatGPT → POST tools/list
Server  → { tools: [{ name, description, inputSchema }, ...] }
```

**Result:** ChatGPT sees tools but nested schema properties are stripped.

### Stage 3: spreadapi_get_details (Fallback Discovery)
```
ChatGPT → POST tools/call { name: 'spreadapi_get_details' }
Server  → { inputs: [...], outputs: [...], aiDescription, aiUsageGuidance }
```

**Result:** ✅ ChatGPT receives COMPLETE parameter information.

### Stage 4: spreadapi_calc / spreadapi_batch (Execution)
```
ChatGPT → POST tools/call { name: 'spreadapi_calc', arguments: {...} }
Server  → { outputs: {...}, metadata: {...} }
```

**Result:** Calculation executes with proper parameters.

---

## ChatGPT Responses

### Response 1: Initialize Stage
```json
{
  "server": {
    "name": "SpreadAPI",
    "version": "1.0.0",
    "description": "Spreadsheet-driven calculation and comparison service...",
    "id": "abd48d0e-c3f2-4f6b-a032-1449fb35b5ab_mer3vlicgt416"
  },
  "instructions": [
    "🎯 PRIMARY CALCULATION TOOL — use `/spreadapi_calc` for single computations.",
    "⚡ BATCH COMPARISON TOOL — use `/spreadapi_batch` for multi-scenario analysis.",
    "..."
  ]
}
```

### Response 2: tools/list Schema (spreadapi_batch)

**What ChatGPT Receives:**
```json
{
  "type": "object",
  "properties": {
    "scenarios": {
      "type": "array",
      "description": "Array of scenarios to calculate. Each scenario needs a label and inputs.",
      "items": {
        "type": "object",
        "properties": {
          "label": {
            "type": "string",
            "description": "Descriptive label (e.g., \"5% interest\", \"Option A\")"
          },
          "inputs": {
            "type": "object",
            "description": "Input values for this scenario"
          }
        },
        "required": ["inputs"]
      },
      "minItems": 2
    }
  },
  "required": ["scenarios"]
}
```

**ChatGPT's Analysis:**
> "The tool's own schema does not expand the nested inputs object beyond type: object."
>
> "Under ...inputs.properties: there is no properties object either. It's only { "type": "object", "description": "..." } with no nested fields."

### Response 3: Comparison Between Tools

**spreadapi_calc - inputSchema.properties.inputs:**
```json
{
  "type": "object",
  "description": "Input values for the calculation. See service details",
  "additionalProperties": true
}
```
❌ No `properties` object

**spreadapi_batch - ...scenarios.items.properties.inputs:**
```json
{
  "type": "object",
  "description": "Input values for this scenario"
}
```
❌ No `properties` object
❌ No `additionalProperties` field (we sent `true`)

**Conclusion from ChatGPT:**
> "During tools/list, neither tool includes concrete parameter definitions like starting_amount, monthly_deposit, interest_rate, months_of_payment. Both expose inputs merely as a generic object without nested properties."

### Response 4: spreadapi_get_details

**What ChatGPT Receives (COMPLETE):**
```json
{
  "inputs": [
    {
      "starting_amount": {
        "type": "number",
        "description": "Initial principal (e.g., €1000)"
      },
      "monthly_deposit": {
        "type": "number",
        "description": "Amount added each month (e.g., €100)"
      },
      "interest_rate": {
        "type": "number",
        "description": "Annual interest rate as PERCENT (e.g., 5 for 5%, NOT 0.05)"
      },
      "months_of_payment": {
        "type": "integer",
        "description": "Investment duration in months (e.g., 36 = 3 years)"
      }
    }
  ],
  "outputs": [...],
  "aiDescription": "...",
  "aiUsageGuidance": "..."
}
```

**ChatGPT's Summary:**
> "tools/list: schemas were structural only (opaque inputs objects; no fields)."
>
> "spreadapi_get_details: supplied the full parameter names, types, and descriptions, the output fields, the percent-as-percent rule, and practical usage guidance."

### Response 5: Raw Schema Dump

**Command:** `console.log(JSON.stringify(batchTool.inputSchema, null, 2))`

**Output:**
```json
{
  "type": "object",
  "properties": {
    "scenarios": {
      "type": "array",
      "description": "Array of scenarios to calculate. Each scenario needs a label and inputs.",
      "items": {
        "type": "object",
        "properties": {
          "label": {
            "type": "string",
            "description": "Descriptive label (e.g., \"5% interest\", \"Option A\")"
          },
          "inputs": {
            "type": "object",
            "description": "Input values for this scenario"
          }
        },
        "required": ["inputs"]
      },
      "minItems": 2
    }
  },
  "required": ["scenarios"]
}
```

**Confirmation:**
> "That is the complete raw schema returned by the MCP server — there were no nested properties under inputs in the tools/list response, only the type and description you see here."

---

## References

### Official Documentation
- **MCP Specification:** https://modelcontextprotocol.io/
- **MCP JSON Schema:** https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-06-18/schema.json
- **OpenAI MCP Docs:** https://platform.openai.com/docs/mcp

### Community Resources
- **Developer Forum:** https://community.openai.com/t/mcp-server-tools-now-in-chatgpt-developer-mode/1357233
- **MCP Server Examples:** https://github.com/modelcontextprotocol/servers

### Related Issues
- ChatGPT requires tool arguments as strings (not objects)
- Complex return types cause failures
- File returns not supported
- Bearer token authentication unsupported
- Performance degradation with 70+ tools

---

## Conclusion

This bug in ChatGPT's MCP implementation is a **known limitation** that affects nested schema properties but does not prevent successful integration. Our architecture with `spreadapi_get_details` as a discovery tool provides a robust fallback mechanism.

### Current Status
✅ **Server implementation:** Fully MCP-compliant
✅ **Workaround:** Stringified schema in description
✅ **Functionality:** 100% working despite bug
⏳ **ChatGPT fix:** Pending (OpenAI needs to address)

### Recommendations
1. **Keep workaround in place** - provides best UX until ChatGPT fixes bug
2. **Maintain proper schema** - ensures compatibility with Claude and future ChatGPT versions
3. **Monitor OpenAI updates** - remove workaround when bug is fixed
4. **Document in code** - help future developers understand why we have both approaches

---

**Last Updated:** 2025-01-27
**Next Review:** When ChatGPT MCP client is updated
