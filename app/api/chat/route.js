import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getServiceDetails } from '@/utils/serviceHelpers';
import { getItemType, isNumberType } from '@/utils/normalizeServiceData';
import { executeAreaRead, executeAreaUpdate } from '../mcp/v1/areaExecutors';
import { executeEnhancedCalc } from '../mcp/v1/executeEnhancedCalc';

// Basic input sanitization to prevent injection attacks
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Remove potential script tags and dangerous characters
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 5000); // Limit input length
}

// Create OpenAI instance with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});


export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, serviceId, initialGreeting } = body;
    
    
    
    let formattedMessages;
    
    // If this is an initial greeting, replace the trigger message
    if (initialGreeting || (messages.length === 1 && messages[0]?.content === '[GREETING]')) {
      // Create system context for initial greeting
      formattedMessages = [{
        role: 'user',
        content: 'Hello, I just selected this service. What can it do?'
      }];
    } else {
      // Convert messages to proper format for the AI SDK with sanitization
      formattedMessages = messages.map(msg => {
        // Handle messages with parts array (from UI)
        if (msg.parts && Array.isArray(msg.parts)) {
          const textPart = msg.parts.find(p => p.type === 'text');
          return {
            role: msg.role,
            content: sanitizeInput(textPart?.text || '')
          };
        }
        // Handle regular messages
        return {
          role: msg.role,
          content: sanitizeInput(msg.content || '')
        };
      }).filter(msg => msg.content); // Remove empty messages
    }
    
    // Limit conversation history to prevent token overflow
    // Keep last 20 messages (10 exchanges) for context
    const recentMessages = formattedMessages.slice(-20);

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'Service temporarily unavailable',
          message: 'The AI service is currently unavailable. Please try again later.'
        }), 
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Service is required for this chat interface
    if (!serviceId || serviceId === 'general') {
      return new Response(
        JSON.stringify({ 
          error: 'No service selected',
          message: 'Please select a calculation service to start chatting.'
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Debug logging for service ID
    console.log('[Chat API] Processing request for service ID:', serviceId);
    console.log('[Chat API] Initial greeting?', initialGreeting);
    
    // Fetch service details
    let serviceDetails = null;
    
    try {
      // Get auth from current request
      const userId = req.headers.get('x-user-id');
      console.log('[Chat API] User ID:', userId);
      
      // Use the centralized helper function
      serviceDetails = await getServiceDetails(serviceId, userId);
      
      // Debug log the fetched service details
      console.log('[Chat API] Fetched service details:', {
        id: serviceDetails?.id,
        name: serviceDetails?.name,
        description: serviceDetails?.description,
        inputCount: serviceDetails?.inputs?.length || 0,
        inputs: serviceDetails?.inputs?.map(i => ({ alias: i.alias, title: i.title })),
        outputCount: serviceDetails?.outputs?.length || 0,
        outputs: serviceDetails?.outputs?.map(o => ({ alias: o.alias, title: o.title }))
      });
      
      if (!serviceDetails) {
        console.log('[Chat API] Service not found for ID:', serviceId);
        
        // Return error response for missing services
        return new Response(
          JSON.stringify({ 
            error: 'Service not found',
            message: 'The selected service could not be loaded. Please select a different service or check your authentication.'
          }), 
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (error) {
      // Error fetching service details
    }

    // Get current date and time with timezone
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    });
    
    // Service-specific system prompt
    let systemPrompt = `You are an assistant for the "${serviceDetails?.name || 'SpreadAPI service'}" calculation service.

When a user asks for a calculation:
1. Extract ALL provided values from their message
2. If they mention percentages (like "5%"), automatically convert to decimals (0.05)
3. Use the 'calculate' tool to get the result
4. Show the result to the user

IMPORTANT: After calling the tool, you must continue your response and show the calculation results to the user.

CRITICAL: When users say percentages like "5%", "7%", etc:
- Automatically convert them (5% → 0.05)
- Do NOT ask for confirmation
- Just use the converted value directly

Current context:
- Date: ${currentDate}
- Time: ${currentTime}
- Service: ${serviceDetails?.name || 'General calculation service'}

IMPORTANT: You are NOT a general AI assistant. Every response should be focused on helping users with this specific calculation service.`;

    // Add service-specific context if available
    if (serviceDetails) {
      // Use AI description if available, otherwise fall back to regular description
      const effectiveDescription = serviceDetails.aiDescription || serviceDetails.description || 'A SpreadAPI calculation service';
      
      systemPrompt += `

## Active Service: ${serviceDetails.name}
${effectiveDescription}

You have access to a calculation tool for this service. Focus on helping users use it effectively.`;
      
      // Add detailed area explanation if areas exist
      if (serviceDetails.areas && serviceDetails.areas.length > 0) {
        let areas = serviceDetails.areas;
        if (typeof areas === 'string') {
          try {
            areas = JSON.parse(areas);
          } catch (e) {
            areas = [];
          }
        }
        
        if (areas.length > 0) {
          systemPrompt += `

## Editable Areas - Advanced Spreadsheet Manipulation

This service includes EDITABLE AREAS - regions of the spreadsheet that contain data, formulas, and calculations that you can read and modify. This is a powerful feature that allows you to:

### What are Editable Areas?
- **Living spreadsheet regions**: Areas contain cells with values, formulas, and formatting
- **Smart data structures**: You can read tables, lookup values, parameters, and calculation ranges
- **Dynamic modification**: Change values or formulas to test different scenarios
- **Intelligent analysis**: You can discover patterns, relationships, and dependencies in the data

### How to Use Areas Effectively:
1. **Explore first**: Use 'read_area' to understand what data is available
2. **Identify patterns**: Look for lookup tables, parameters, calculation ranges
3. **Test scenarios**: Modify area values to see how outputs change
4. **Be intelligent**: Understand the context and purpose of each area from its data

### Available Areas in This Service:
${areas.map(area => {
  let desc = `- **${area.name}**`;
  if (area.alias && area.alias !== area.name) desc += ` (alias: ${area.alias})`;
  desc += `: ${area.mode === 'readonly' ? 'Read-only' : 'Read/Write'}`;
  if (area.description) desc += ` - ${area.description}`;
  if (area.aiContext) {
    if (area.aiContext.purpose) desc += `\n  Purpose: ${area.aiContext.purpose}`;
    if (area.aiContext.expectedBehavior) desc += `\n  Expected behavior: ${area.aiContext.expectedBehavior}`;
  }
  return desc;
}).join('\n')}

### Area Capabilities:
${(() => {
  const capabilities = [];
  const hasReadable = areas.some(a => a.permissions?.canReadValues);
  const hasWritable = areas.some(a => a.permissions?.canWriteValues && a.mode !== 'readonly');
  const hasFormulas = areas.some(a => a.permissions?.canReadFormulas || a.permissions?.canWriteFormulas);
  
  if (hasReadable) capabilities.push('- Read cell values to understand data and parameters');
  if (hasWritable) capabilities.push('- Modify values to test different scenarios');
  if (hasFormulas) capabilities.push('- Read and modify formulas for advanced calculations');
  capabilities.push('- Discover relationships between cells and areas');
  capabilities.push('- Use area data as dynamic lookup tables or reference values');
  
  return capabilities.join('\n');
})()}

### Example Use Cases:
- Modify tax rates in a tax table area to see impact on calculations
- Update product prices in a pricing area to test different scenarios  
- Change assumption parameters to perform sensitivity analysis
- Read lookup tables to understand available options
- Discover calculation logic by examining formulas`;
        }
      }

      // Add usage examples if available
      if (serviceDetails.aiUsageExamples && serviceDetails.aiUsageExamples.length > 0) {
        systemPrompt += `

### Example Use Cases:
${serviceDetails.aiUsageExamples.map(example => `- ${example}`).join('\n')}`;
      }
    }
    
    // Debug log the system prompt being used
    console.log('[Chat API] System prompt service context:', {
      serviceName: serviceDetails?.name,
      serviceDescription: serviceDetails?.description,
      aiDescription: serviceDetails?.aiDescription,
      aiUsageExamples: serviceDetails?.aiUsageExamples
    });
    
    // Build tools dynamically based on service
    let tools = {};
    
    if (serviceDetails) {
      // Comprehensive debug log of all service details
      console.log('[Chat API] Full service details for tool building:', JSON.stringify({
        id: serviceDetails.id,
        name: serviceDetails.name,
        description: serviceDetails.description,
        aiDescription: serviceDetails.aiDescription,
        inputs: serviceDetails.inputs,
        outputs: serviceDetails.outputs,
        aiUsageExamples: serviceDetails.aiUsageExamples
      }, null, 2));
      
      // Only add calculate tool if we have inputs
      if (serviceDetails.inputs && serviceDetails.inputs.length > 0) {
        // Build Zod schema for inputs
        const inputSchemas = {};
        
        serviceDetails.inputs.forEach(input => {
          const inputType = getItemType(input);
          
          let schema;
          // Build comprehensive description for the schema
          let schemaDescription = input.title || input.name;
          if (input.description) {
            schemaDescription += ` - ${input.description}`;
          }
          if (input.format) {
            schemaDescription += ` (format: ${input.format})`;
          }
          
          if (isNumberType(input)) {
            schema = z.number().describe(schemaDescription);
          } else {
            schema = z.string().describe(schemaDescription);
          }
          
          // Make optional if not mandatory
          if (input.mandatory === false) {
            schema = schema.optional();
          }
          
          inputSchemas[input.alias] = schema;
        });
        
        // Create enhanced Zod schema with area update support
        const toolZodSchema = z.object(inputSchemas);
        
        // Create enhanced schema that includes area updates
        const enhancedToolSchema = z.object({
          ...inputSchemas,
          areaUpdates: z.array(z.object({
            areaName: z.string().describe('Name of the area to update'),
            changes: z.array(z.object({
              row: z.number().describe('Row index within the area (0-based)'),
              col: z.number().describe('Column index within the area (0-based)'),
              value: z.any().optional().describe('New value for the cell'),
              formula: z.string().optional().describe('New formula for the cell')
            })).describe('Changes to apply to the area')
          })).optional().describe('Optional area updates to apply before calculation'),
          returnAreaData: z.boolean().optional().default(false).describe('Include updated area data in response')
        });
        
        tools.calculate = tool({
          description: `Calculate ${serviceDetails.name}${serviceDetails.areas && serviceDetails.areas.length > 0 ? '. Supports atomic area updates + calculation in one operation - perfect for what-if scenarios. Use areaUpdates to modify lookup tables, parameters, or reference data before calculating. This is more efficient than separate update_areas + calculate calls.' : '.'}`,
          inputSchema: enhancedToolSchema,
          execute: async (inputs) => {
            try {
              const { areaUpdates, returnAreaData, ...rawInputs } = inputs;
              
              // Filter out only the actual calculation inputs (not the enhanced parameters)
              const calculationInputs = {};
              for (const [key, value] of Object.entries(rawInputs)) {
                if (inputSchemas[key]) {
                  calculationInputs[key] = value;
                }
              }
              
              // If area updates are provided, use enhanced calc
              if (areaUpdates && areaUpdates.length > 0) {
                const returnOptions = {
                  includeOutputs: true,
                  includeAreaValues: returnAreaData || false,
                  includeAreaFormulas: false,
                  includeAreaFormatting: false
                };
                
                let result;
                try {
                  result = await executeEnhancedCalc(
                    serviceId, 
                    calculationInputs, 
                    areaUpdates, 
                    returnOptions, 
                    { userId: 'chat-user' }
                  );
                } catch (calcError) {
                  console.error('[Chat API] Enhanced calc error:', calcError);
                  return `Error: ${calcError.message}`;
                }
                
                // Format the enhanced results
                let resultText = `## Calculation Results\n\n`;
                
                // Show outputs
                if (result.outputs) {
                  resultText += `### Outputs\n`;
                  for (const [key, value] of Object.entries(result.outputs)) {
                    // Find output definition for formatting
                    const outputDef = serviceDetails.outputs.find(o => o.alias === key || o.name === key);
                    const displayName = outputDef?.title || outputDef?.name || key;
                    
                    let formattedValue = value;
                    if (typeof value === 'number') {
                      formattedValue = value.toLocaleString('en-US', { maximumFractionDigits: 2 });
                    } else if (Array.isArray(value)) {
                      // Handle array outputs from ranges
                      formattedValue = `[Array with ${value.length} rows]`;
                      // Could expand to show the array contents if needed
                    } else if (value === null || value === undefined) {
                      formattedValue = 'N/A';
                    } else {
                      formattedValue = String(value);
                    }
                    
                    resultText += `**${displayName}**: ${formattedValue}\n`;
                  }
                }
                
                // Show area data if requested
                if (result.areas) {
                  resultText += `\n### Updated Area Values\n`;
                  for (const [areaName, areaInfo] of Object.entries(result.areas)) {
                    resultText += `\n**${areaName}** (${areaInfo.rows}x${areaInfo.columns}):\n`;
                    resultText += '```\n';
                    
                    // Display area data as table
                    for (let r = 0; r < areaInfo.rows; r++) {
                      const row = [];
                      for (let c = 0; c < areaInfo.columns; c++) {
                        const cell = areaInfo.data[r]?.[c];
                        row.push(cell?.value !== undefined ? cell.value : '');
                      }
                      resultText += row.join('\t') + '\n';
                    }
                    resultText += '```\n';
                  }
                }
                
                return resultText.trim();
              }
              
              // Otherwise use the standard API endpoint
              const baseUrl = process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}` 
                : 'http://localhost:3000';
              
              // Always use the main getresults endpoint - it's battle-tested and what customers use
              const queryParams = new URLSearchParams();
              queryParams.append('api', serviceId);
              
              // Add input parameters
              Object.entries(calculationInputs).forEach(([key, value]) => {
                // Only send parameters that have actual values
                // Skip undefined, null, and empty string values
                if (value !== undefined && value !== null && value !== '') {
                  queryParams.append(key, String(value));
                }
              });
              
              const response = await fetch(`${baseUrl}/api/getresults?${queryParams.toString()}`);
              const data = await response.json();
              
              if (!response.ok) {
                console.error('[Chat API] Calculation failed:', {
                  status: response.status,
                  error: data.error,
                  details: data,
                  url: `${baseUrl}/api/getresults?${queryParams.toString()}`
                });
                throw new Error(data.error || 'Calculation failed');
              }
              
              // Format results
              let resultText = ``;
              
              // Create a map of output aliases to their titles/descriptions
              const outputInfo = {};
              serviceDetails.outputs.forEach(out => {
                outputInfo[out.alias] = {
                  title: out.title || out.name || out.alias,
                  description: out.description || ''
                };
              });
              
              if (data.outputs && Array.isArray(data.outputs)) {
                data.outputs.forEach(output => {
                  const value = output.value;
                  let formattedValue = value;
                  
                  // Get the title from our service details
                  const info = outputInfo[output.alias] || {};
                  const displayName = info.title || output.title || output.alias;
                  
                  // Format based on output type
                  if (output.format === 'currency' && typeof value === 'number') {
                    const currency = output.currency || 'USD';
                    formattedValue = new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency
                    }).format(value);
                  } else if (output.format === 'percentage' && typeof value === 'number') {
                    formattedValue = `${(value * 100).toFixed(2)}%`;
                  } else if (typeof value === 'number') {
                    // For very large or very small numbers, use appropriate formatting
                    if (Math.abs(value) > 1e9 || (Math.abs(value) < 0.001 && value !== 0)) {
                      formattedValue = value.toExponential(2);
                    } else {
                      formattedValue = value.toLocaleString('en-US', { maximumFractionDigits: 2 });
                    }
                  }
                  
                  resultText += `**${displayName}**: ${formattedValue}\n`;
                });
                
                return resultText.trim();
              } else {
                // Handle different response format
                return 'Result: ' + JSON.stringify(data, null, 2);
              }
            } catch (error) {
              return `Error executing calculation: ${error.message}`;
            }
          }
        });
        
        // Add batch calculation tool for multiple calculations at once
        const batchInputSchema = z.object({
          calculations: z.array(toolZodSchema).describe('Array of calculation inputs to process in batch')
        });
        
        tools.calculate_batch = tool({
          description: `Calculate multiple ${serviceDetails.name} scenarios at once. Use this when the user wants to compare multiple options or calculate for several different inputs.`,
          inputSchema: batchInputSchema,
          execute: async ({ calculations }) => {
            try {
              // Execute all calculations in parallel
              const results = await Promise.all(
                calculations.map(async (params, index) => {
                  try {
                    const baseUrl = process.env.VERCEL_URL 
                      ? `https://${process.env.VERCEL_URL}` 
                      : 'http://localhost:3000';
                    
                    const queryParams = new URLSearchParams();
                    queryParams.append('api', serviceId);
                    
                    Object.entries(params).forEach(([key, value]) => {
                      if (value !== undefined && value !== null) {
                        queryParams.append(key, String(value));
                      }
                    });
                    
                    const response = await fetch(`${baseUrl}/api/getresults?${queryParams.toString()}`);
                    const data = await response.json();
                    
                    if (!response.ok) {
                      throw new Error(data.error || 'Calculation failed');
                    }
                    
                    return {
                      scenario: index + 1,
                      inputs: params,
                      outputs: data.outputs,
                      success: true
                    };
                  } catch (error) {
                    return {
                      scenario: index + 1,
                      inputs: params,
                      error: error.message,
                      success: false
                    };
                  }
                })
              );
              
              // Format batch results
              let resultText = `## Batch Calculation Results\n\n`;
              
              results.forEach(result => {
                resultText += `### Scenario ${result.scenario}\n`;
                
                // Show inputs
                resultText += `**Inputs:**\n`;
                Object.entries(result.inputs).forEach(([key, value]) => {
                  resultText += `- ${key}: ${value}\n`;
                });
                
                if (result.success && result.outputs) {
                  resultText += `\n**Results:**\n`;
                  result.outputs.forEach(output => {
                    const value = output.value;
                    let formattedValue = value;
                    
                    if (output.format === 'currency' && typeof value === 'number') {
                      const currency = output.currency || 'USD';
                      formattedValue = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency
                      }).format(value);
                    } else if (output.format === 'percentage' && typeof value === 'number') {
                      formattedValue = `${(value * 100).toFixed(2)}%`;
                    } else if (typeof value === 'number') {
                      formattedValue = value.toLocaleString('en-US', { maximumFractionDigits: 2 });
                    }
                    
                    resultText += `- **${output.title || output.alias}**: ${formattedValue}\n`;
                  });
                } else {
                  resultText += `\n**Error:** ${result.error}\n`;
                }
                
                resultText += `\n---\n\n`;
              });
              
              return resultText.trim();
            } catch (error) {
              return `Error executing batch calculation: ${error.message}`;
            }
          }
        });
      }
      
      // Add area reading tool if service has areas
      if (serviceDetails.areas && serviceDetails.areas.length > 0) {
        // Parse areas from JSON string if needed
        let areas = serviceDetails.areas;
        if (typeof areas === 'string') {
          try {
            areas = JSON.parse(areas);
          } catch (e) {
            areas = [];
          }
        }
        
        // Only add if we have readable areas
        const readableAreas = areas.filter(area => 
          area.permissions && area.permissions.canReadValues
        );
        
        if (readableAreas.length > 0) {
          const areaNames = readableAreas.map(a => a.name);
          
          tools.read_area = tool({
            description: `Read data from an editable area in ${serviceDetails.name}. Areas are spreadsheet regions containing tables, parameters, formulas, and calculations. Use this to explore data structures, understand calculation logic, and prepare for intelligent modifications. Always read an area before modifying it.`,
            inputSchema: z.object({
              areaName: z.enum(areaNames).describe('The name of the area to read'),
              includeFormulas: z.boolean().optional().default(false).describe('Include cell formulas in the response'),
              includeFormatting: z.boolean().optional().default(false).describe('Include cell formatting in the response')
            }),
            execute: async ({ areaName, includeFormulas = false, includeFormatting = false }) => {
              try {
                // Use the already imported executeAreaRead function
                const result = await executeAreaRead(serviceId, areaName, {
                  includeFormulas,
                  includeFormatting
                }, { userId: 'chat-user' });
                
                // Format the response for chat
                let resultText = `## Area: ${result.area.name}\n`;
                resultText += `*${result.area.rows} rows × ${result.area.columns} columns*\n\n`;
                
                // Show the data in a readable format
                resultText += '```\n';
                for (let r = 0; r < result.area.rows; r++) {
                  const row = [];
                  for (let c = 0; c < result.area.columns; c++) {
                    const cell = result.data[r][c];
                    row.push(cell.value !== null ? cell.value : '');
                  }
                  resultText += row.join('\t') + '\n';
                }
                resultText += '```\n';
                
                if (includeFormulas) {
                  // Show cells with formulas
                  const formulaCells = [];
                  for (let r = 0; r < result.area.rows; r++) {
                    for (let c = 0; c < result.area.columns; c++) {
                      const cell = result.data[r][c];
                      if (cell.formula) {
                        formulaCells.push(`[${r},${c}]: ${cell.formula}`);
                      }
                    }
                  }
                  if (formulaCells.length > 0) {
                    resultText += '\n**Formulas:**\n';
                    formulaCells.forEach(f => {
                      resultText += `- ${f}\n`;
                    });
                  }
                }
                
                resultText += `\n*Note: This area contains reference data used in calculations.*`;
                
                return resultText;
              } catch (error) {
                return `Error reading area: ${error.message}`;
              }
            }
          });
        }
        
        // Add standalone area update tool for direct area manipulation
        // This complements the calculate tool which also supports area updates
        // - calculate: atomic area updates + calculation (when inputs exist)
        // - update_areas: just area updates without calculation (always available)
        const writableAreas = areas.filter(area => 
          area.permissions && area.permissions.canWriteValues
        );
        
        if (writableAreas.length > 0) {
          tools.update_areas = tool({
            description: `Update values in editable areas of ${serviceDetails.name}. Use this to modify spreadsheet data like lookup tables, parameters, or reference values. This tool updates areas WITHOUT triggering calculation - useful for preparing multiple changes. For atomic update+calculate, use the calculate tool with areaUpdates parameter instead.`,
            inputSchema: z.object({
              areaUpdates: z.array(z.object({
                areaName: z.string().describe('Name of the area to update'),
                changes: z.array(z.object({
                  row: z.number().describe('Row index within the area (0-based)'),
                  col: z.number().describe('Column index within the area (0-based)'),
                  value: z.any().optional().describe('New value for the cell'),
                  formula: z.string().optional().describe('New formula for the cell')
                })).describe('Changes to apply to the area')
              })).describe('Area updates to apply'),
              returnUpdatedData: z.boolean().optional().default(true).describe('Include updated area data in response')
            }),
            execute: async ({ areaUpdates, returnUpdatedData = true }) => {
              try {
                const returnOptions = {
                  includeValues: returnUpdatedData,
                  includeFormulas: false,
                  includeFormatting: false,
                  includeRelatedOutputs: serviceDetails.outputs && serviceDetails.outputs.length > 0
                };
                
                const result = await executeAreaUpdate(
                  serviceId,
                  areaUpdates,
                  { userId: 'chat-user' },
                  returnOptions
                );
                
                // Parse the result
                const resultData = JSON.parse(result.content[0].text);
                
                // Format response
                let resultText = '## Area Updates Applied\n\n';
                
                resultData.results.forEach(r => {
                  if (r.success) {
                    resultText += `✓ **${r.area}**: ${r.appliedChanges} changes applied\n`;
                  } else {
                    resultText += `✗ **${r.area}**: ${r.error || 'Failed'}\n`;
                  }
                  
                  if (r.details && r.details.errors && r.details.errors.length > 0) {
                    r.details.errors.forEach(e => {
                      resultText += `  • ${e}\n`;
                    });
                  }
                });
                
                // Show updated data if requested
                if (returnUpdatedData && resultData.updatedAreas) {
                  resultText += '\n### Updated Values\n';
                  for (const [areaName, areaData] of Object.entries(resultData.updatedAreas)) {
                    resultText += `\n**${areaName}** (${areaData.rows}×${areaData.columns}):\n`;
                    resultText += '```\n';
                    for (let r = 0; r < areaData.rows; r++) {
                      const row = [];
                      for (let c = 0; c < areaData.columns; c++) {
                        const cell = areaData.data[r] && areaData.data[r][c];
                        row.push(cell && cell.value !== null && cell.value !== undefined ? cell.value : '');
                      }
                      resultText += row.join('\t') + '\n';
                    }
                    resultText += '```\n';
                  }
                }
                
                // Show any related outputs if they exist
                if (resultData.relatedOutputs) {
                  resultText += '\n### Calculated Outputs\n';
                  for (const [key, value] of Object.entries(resultData.relatedOutputs)) {
                    resultText += `**${key}**: ${JSON.stringify(value)}\n`;
                  }
                }
                
                return resultText;
              } catch (error) {
                console.error('[Chat API] Area update error:', error);
                return `Error updating areas: ${error.message}`;
              }
            }
          });
        }
      }
    }
    
    
    // Update system prompt to be more explicit about using tools
    if (Object.keys(tools).length > 0) {
      // Add tool usage examples based on service inputs
      const inputExamples = serviceDetails.inputs.map(input => 
        `${input.alias}: <value> (${input.title}${input.format === 'percentage' ? ' as decimal' : ''})`
      ).join(', ');
      
      systemPrompt += `

## Your Communication Style
You are a helpful assistant in a CHAT conversation. Your responses should be:
- Conversational and friendly
- Clear about what you're calculating
- Explicit about the results you found

### How to Handle Calculations:
1. Extract ALL values from the user's message (including percentages)
2. If user says "5%" for interest rate, that's 0.05 - don't ask again!
3. Only ask for parameters that are ACTUALLY missing
4. Once you have all needed values, use the 'calculate' tool immediately
5. If the user wants to compare multiple scenarios, use 'calculate_batch' tool
6. Present the results in a conversational way

NEVER ask for clarification on values the user already provided!

### When to use batch calculations:
- User wants to compare multiple options
- User provides several sets of inputs
- User asks "what if" questions with multiple scenarios
- User wants to see a range of calculations

### Working with Editable Areas:
${(() => {
  // Check what area tools are available
  const hasReadArea = 'read_area' in tools;
  const hasUpdateAreas = 'update_areas' in tools;
  const hasCalculateWithAreas = 'calculate' in tools && serviceDetails.areas && serviceDetails.areas.length > 0;
  
  const instructions = [];
  
  if (hasReadArea) {
    instructions.push(`#### Reading Areas:
- Use 'read_area' to explore spreadsheet data - tables, parameters, calculation ranges
- Set includeFormulas=true to understand calculation logic
- Always read an area first before attempting to modify it
- Look for patterns: Is it a lookup table? Parameters? Results grid?`);
  }
  
  if (hasUpdateAreas) {
    instructions.push(`#### Updating Areas (Standalone):
- Use 'update_areas' to modify area values without triggering calculation
- Useful for preparing multiple changes before calculating
- Can update multiple areas in one operation
- Returns the modified data so you can verify changes`);
  }
  
  if (hasCalculateWithAreas) {
    instructions.push(`#### Calculate with Area Updates (Atomic):
- Use 'calculate' with areaUpdates parameter for atomic operations
- Modifies areas AND calculates results in a single step
- Perfect for "what-if" scenarios - change assumptions, see results
- Set returnAreaData=true to see both outputs and modified area values`);
  }
  
  instructions.push(`#### Intelligent Area Usage:
- **Discover**: Read areas to understand the spreadsheet structure
- **Analyze**: Identify dependencies between areas and calculations
- **Modify**: Change values intelligently based on context
- **Test**: Try different scenarios by modifying key parameters
- **Learn**: Use formulas to understand calculation logic

#### Common Patterns:
- **Lookup Tables**: Areas with reference data (tax rates, pricing tiers)
- **Input Parameters**: Areas with assumption values
- **Calculation Grids**: Areas with formulas that compute results
- **Data Tables**: Areas with structured data for analysis`);
  
  return instructions.join('\n\n');
})()}

### Required vs Optional Parameters:
${(() => {
  const required = serviceDetails.inputs.filter(i => i.mandatory !== false);
  const optional = serviceDetails.inputs.filter(i => i.mandatory === false);
  
  let text = 'REQUIRED (must ask if missing):\n';
  required.forEach(input => {
    text += `- ${input.alias} (${input.title || input.name || input.alias})`;
    if (input.description) {
      text += `: ${input.description}`;
    }
    text += '\n';
  });
  
  if (optional.length > 0) {
    text += '\nOPTIONAL (omit if not provided by user):\n';
    optional.forEach(input => {
      text += `- ${input.alias} (${input.title || input.name || input.alias})`;
      if (input.description) {
        text += `: ${input.description}`;
      }
      text += '\n';
    });
    text += 'IMPORTANT: For optional parameters, only include them if the user explicitly provides values. Do NOT automatically fill with 0 or defaults.\n';
  }
  
  return text;
})()}

### Key Parameter Rules:
${(() => {
  const rules = [];
  
  // Check for percentage inputs
  const hasPercentage = serviceDetails.inputs.some(i => i.format === 'percentage');
  if (hasPercentage) {
    rules.push('- **Percentages**: ALWAYS convert to decimals (5% → 0.05, 7% → 0.07, 10% → 0.10) - NEVER use whole numbers like 5 for 5%!');
  }
  
  // Check for optional parameters
  const hasOptional = serviceDetails.inputs.some(i => i.mandatory === false);
  if (hasOptional) {
    rules.push('- **Optional parameters**: Use 0 as default if not provided');
  }
  
  // Check for currency inputs
  const hasCurrency = serviceDetails.inputs.some(i => i.format === 'currency');
  if (hasCurrency) {
    rules.push('- **Currency**: Parse "$1,000" → 1000');
  }
  
  return rules.join('\n');
})()}

### Quick Examples:
- If user provides ALL required values → Calculate immediately
- If missing ANY required values → ASK for them (don't assume)
- If missing optional values → Use defaults (usually 0)
- Example: "Show me $1000 at 7% over 20 years" → Missing monthly deposit (required) → ASK: "What monthly deposit amount would you like to use?"
- CRITICAL: "5% interest" → Use interestrate: 0.05 (NOT 5!)

Remember: You exist solely to help users with ${serviceDetails.name} calculations. Every interaction should move toward executing a calculation or clarifying results.

GOLDEN RULE: You are in a CONVERSATION. When you use a tool, you must TELL THE USER what you discovered. Think of tools as a way to get information that you then SHARE with the user in a friendly message.

When presenting results:
- Use human-readable names from the result output, not technical parameter names
- If a result shows "tariff_extra" call it "Tariff Extra" or "Extra Plan"
- If a result shows "member1" call it "first member" or "member 1"
- Make the conversation natural - don't use technical aliases

### Initial Greeting
When the user asks "Hello, I just selected this service. What can it do?", provide a brief, friendly introduction that includes:
1. Welcome to the service
2. List each parameter on a new line with bullet points, formatted as: • <span style="color: #502D80; font-weight: bold;">Parameter Name</span> (required/optional)
3. Provide 2-3 clickable examples with realistic values based on the service type
4. Ask what they'd like to calculate

CRITICAL INSTRUCTION FOR GENERATING EXAMPLES:
Analyze the service parameters and descriptions to understand what this service does:

Service: ${serviceDetails.name}
Description: ${serviceDetails.description || serviceDetails.aiDescription || 'Not provided'}
Input Parameters: ${serviceDetails.inputs.map(i => `${i.alias}: ${i.description || i.title || i.name || 'no description'}`).join(', ')}
Output Parameters: ${serviceDetails.outputs.map(o => `${o.alias}: ${o.description || o.title || o.name || 'no description'}`).join(', ')}

Based on the parameter names, descriptions, and data types, infer what kind of values make sense.
Look for clues in:
- Parameter descriptions (e.g., "age of member", "interest rate", "loan amount")
- Parameter names (what they suggest about the domain)
- Min/max constraints if provided
- Data types (number, string, percentage, currency)

Create 2-3 example buttons. The examples MUST:
- Match the detected service type above
- Use values appropriate for the actual parameters
- Never use interest rates or financial amounts for age-based services
- Never use ages for financial services

Example button format:
<button class="example-btn" data-example="[Natural language with specific values]">📊 [Label]: [Actual values shown]</button>

Based on the service parameters, generate appropriate example buttons. Each example should:
- Include concrete, realistic values for ALL required parameters
- Use natural, conversational language in the data-example attribute
- Show the actual values prominently in the button text

For numeric parameters, use these realistic ranges:
- Interest rates: 4-8% (show as percentages)
- Initial amounts: $500-$10,000
- Monthly deposits: $50-$500
- Time periods: 5-30 years (convert to months if needed)
- Loan amounts: $100,000-$500,000

The button text should clearly show what calculation will be performed with the specific values.`;
    }
    
    // Use streamText with v5 features for better tool handling
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: recentMessages,
      system: systemPrompt,
      temperature: 0.3,
      maxTokens: 2000,
      tools: Object.keys(tools).length > 0 ? tools : undefined,
      toolChoice: Object.keys(tools).length > 0 ? 'auto' : undefined,
      maxSteps: 5,
      // Use stopWhen to ensure the AI continues after tool calls
      stopWhen: ({ finishReason, stepCount }) => {
        // Don't stop after tool calls - continue to generate a response
        if (finishReason === 'tool-calls' && stepCount < 3) {
          return false; // Continue
        }
        // Stop after we've had a chance to respond with the tool results
        return finishReason === 'stop' || stepCount >= 3;
      },
    });
    
    // Return the stream response in the format expected by useChat
    return result.toUIMessageStreamResponse();
    
  } catch (error) {
    // API Error occurred
    
    // Handle specific error types
    let errorMessage = 'An error occurred while processing your request.';
    let statusCode = 500;
    
    if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
      statusCode = 429;
    } else if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API key. Please check your OpenAI API key configuration.';
      statusCode = 401;
    } else if (error.message?.includes('context length')) {
      errorMessage = 'The conversation is too long. Please start a new conversation.';
      statusCode = 400;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }), 
      { 
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}