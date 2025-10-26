/**
 * MCP Service Wrapper
 *
 * Converts SpreadAPI service metadata into MCP protocol format.
 * This library enables each service to be exposed as a dedicated MCP server.
 *
 * Key functions:
 * - generateMcpInitialize: Create MCP initialize response from service
 * - generateMcpTools: Generate tool list from service metadata
 * - convertInputsToSchema: Convert service inputs to JSON Schema
 * - generateServiceInstructions: Create AI instructions for single service
 */

import { formatValueWithExcelFormat } from '../utils/formatting.js';

/**
 * Generate MCP initialize response from service metadata
 *
 * @param {Object} service - Service metadata from Redis
 * @returns {Object} MCP initialize response
 */
export function generateMcpInitialize(service) {
  return {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: { listChanged: true }
    },
    serverInfo: {
      name: service.name || service.id,
      version: '1.0.0',
      description: service.description || 'SpreadAPI calculation service',
      instructions: generateServiceInstructions(service)
    }
  };
}

/**
 * Generate MCP tools list from service metadata
 *
 * @param {Object} service - Service metadata
 * @returns {Array} Array of MCP tool definitions
 */
export function generateMcpTools(service) {
  const tools = [];

  // Main calculation tool
  tools.push({
    name: 'calculate',
    description: generateToolDescription(service),
    inputSchema: convertInputsToSchema(service.inputs || [])
  });

  // Area read tool (if service has editable areas)
  if (service.areas && service.areas.length > 0) {
    tools.push({
      name: 'read_area',
      description: `Read data from editable spreadsheet areas in ${service.name}`,
      inputSchema: {
        type: 'object',
        properties: {
          area: {
            type: 'string',
            description: `Area name. Available areas: ${service.areas.map(a => a.name).join(', ')}`,
            enum: service.areas.map(a => a.name)
          }
        },
        required: ['area'],
        additionalProperties: false
      }
    });
  }

  return tools;
}

/**
 * Generate detailed tool description from service metadata
 *
 * @param {Object} service - Service metadata
 * @returns {string} Tool description
 */
export function generateToolDescription(service) {
  const parts = [];

  // Service description
  parts.push(service.description || 'Perform calculation');

  // Parameters section
  if (service.inputs && service.inputs.length > 0) {
    parts.push('\n\nPARAMETERS:');
    service.inputs.forEach(input => {
      const required = input.required ? ' (required)' : ' (optional)';
      const defaultInfo = !input.required && input.defaultValue !== undefined
        ? ` [default: ${input.defaultValue}]`
        : '';
      parts.push(`• ${input.name}: ${input.description}${required}${defaultInfo}`);
    });
  }

  // Returns section
  if (service.outputs && service.outputs.length > 0) {
    parts.push('\n\nRETURNS:');
    service.outputs.forEach(output => {
      parts.push(`• ${output.title || output.name}: ${output.description || 'Calculated value'}`);
    });
  }

  // AI-specific guidance
  if (service.aiDescription) {
    parts.push(`\n\n⚠️  ${service.aiDescription}`);
  }

  if (service.aiUsageGuidance) {
    parts.push(`\n\n💡 ${service.aiUsageGuidance}`);
  }

  return parts.join('\n');
}

/**
 * Convert service inputs to JSON Schema format
 *
 * @param {Array} inputs - Service input parameters
 * @returns {Object} JSON Schema object
 */
export function convertInputsToSchema(inputs) {
  const properties = {};
  const required = [];

  for (const input of inputs) {
    const property = {
      description: input.description || input.name
    };

    // Type mapping
    switch (input.dataType || input.type) {
      case 'number':
      case 'decimal':
      case 'integer':
        property.type = 'number';
        if (input.min !== undefined) property.minimum = input.min;
        if (input.max !== undefined) property.maximum = input.max;
        break;

      case 'string':
      case 'text':
        property.type = 'string';
        break;

      case 'boolean':
      case 'bool':
        property.type = 'boolean';
        break;

      case 'enum':
        property.type = 'string';
        if (input.enum && Array.isArray(input.enum)) {
          property.enum = input.enum;
        }
        break;

      default:
        property.type = 'string';
    }

    // Enum handling
    if (input.enum && Array.isArray(input.enum) && !property.enum) {
      property.enum = input.enum;
    }

    properties[input.name] = property;

    // Required fields
    if (input.required) {
      required.push(input.name);
    }
  }

  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false
  };
}

/**
 * Generate service-specific AI instructions
 *
 * @param {Object} service - Service metadata
 * @returns {string} AI instructions
 */
export function generateServiceInstructions(service) {
  const parts = [];

  parts.push(`🎯 ${service.name}`);
  parts.push(`\n${service.description || 'Calculation service'}`);

  parts.push('\n\n🚀 WORKFLOW:');
  parts.push('When user provides values:');
  parts.push('→ Call the \'calculate\' tool immediately with the input parameters');

  if (service.inputs && service.inputs.length > 0) {
    parts.push('\n\n📝 PARAMETERS:');
    service.inputs.forEach(input => {
      const required = input.required ? ' (required)' : ' (optional)';
      const defaultInfo = !input.required && input.defaultValue !== undefined
        ? ` [default: ${input.defaultValue}]`
        : '';
      parts.push(`• ${input.name}: ${input.description}${required}${defaultInfo}`);
    });
  }

  parts.push('\n\n⚠️  CRITICAL - PERCENTAGE VALUES:');
  parts.push('ALWAYS convert percentages to decimals (divide by 100):');
  parts.push('• "5%" → 0.05 (NOT 5)');
  parts.push('• "42%" → 0.42 (NOT 42)');
  parts.push('• "0.5%" → 0.005 (NOT 0.5)');
  parts.push('Entering "5" instead of "0.05" causes wildly incorrect results!');

  parts.push('\n\n📊 PRESENTING RESULTS:');
  parts.push('Outputs include formatString - ALWAYS use it when available!');
  parts.push('• formatString "€#,##0.00" → €265.53');
  parts.push('• formatString "$#,##0.00" → $31,998.32');
  parts.push('• Use title field for labels, not name');
  parts.push('Present as: "Title: Formatted Value" (e.g., "Total: $31,998.32")');

  parts.push('\n\n🚀 BE PROACTIVE:');
  parts.push('✅ DO: Calculate immediately when you have all required values');
  parts.push('✅ DO: Use intelligent defaults for optional parameters');
  parts.push('❌ DON\'T: Ask "Would you like me to calculate?" - just do it');
  parts.push('❌ DON\'T: Ask for parameters you can reasonably infer');

  // Service-specific guidance
  if (service.aiDescription) {
    parts.push(`\n\n⚠️  SERVICE-SPECIFIC: ${service.aiDescription}`);
  }

  if (service.aiUsageGuidance) {
    parts.push(`\n\n💡 GUIDANCE: ${service.aiUsageGuidance}`);
  }

  parts.push('\n\n🔄 AUTO-RECOVERY:');
  parts.push('• If result seems absurd (>$1M for typical inputs, scientific notation) → Check percentage format, retry with correction');

  return parts.join('\n');
}

/**
 * Format calculation results with Excel-style formatting
 *
 * @param {Array} outputs - Raw calculation outputs
 * @param {Array} outputSchema - Service output schema with formatStrings
 * @returns {Array} Formatted outputs
 */
export function formatCalculationResults(outputs, outputSchema) {
  if (!outputs || !outputSchema) return outputs;

  const formatted = {};

  outputs.forEach(output => {
    const schema = outputSchema.find(s => s.name === output.name);

    if (schema && schema.formatString) {
      formatted[output.name] = {
        name: output.name,
        title: output.title || schema.title || output.name,
        value: output.value,
        formatted: formatValueWithExcelFormat(output.value, schema.formatString),
        formatString: schema.formatString,
        description: schema.description || output.description
      };
    } else {
      formatted[output.name] = {
        name: output.name,
        title: output.title || output.name,
        value: output.value,
        description: output.description
      };
    }
  });

  return formatted;
}

/**
 * Build MCP tool call result response
 *
 * @param {Object} results - Calculation results
 * @param {boolean} isError - Whether this is an error response
 * @returns {Object} MCP tool call result
 */
export function buildToolCallResult(results, isError = false) {
  if (isError) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${results.message || 'Calculation failed'}`
      }],
      isError: true
    };
  }

  // Format results as text for Claude/ChatGPT
  const textParts = [];

  if (results.outputs) {
    textParts.push('Calculation Results:');
    Object.values(results.outputs).forEach(output => {
      const displayValue = output.formatted || output.value;
      const title = output.title || output.name;
      textParts.push(`${title}: ${displayValue}`);
    });
  }

  return {
    content: [{
      type: 'text',
      text: textParts.join('\n')
    }]
  };
}
