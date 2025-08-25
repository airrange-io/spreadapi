import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getServiceDetails } from '@/utils/serviceHelpers';
import { getItemType, isNumberType } from '@/utils/normalizeServiceData';
// import { createPrintJob } from '@/lib/print/redis'; // PDF generation removed

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
    
    // Fetch service details
    let serviceDetails = null;
    
    try {
      // Get auth from current request
      const userId = req.headers.get('x-user-id');
      
      // Use the centralized helper function
      serviceDetails = await getServiceDetails(serviceId, userId);
      
      if (!serviceDetails) {
        
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

PDF REPORTS: You have a 'create_pdf' tool available. Use it when:
- User explicitly asks for a PDF, report, or document
- User wants to save or share the results
- User needs formal documentation
- The calculation is complex or important (like a final loan calculation, investment analysis, etc.)
- User asks "can I get this in PDF?" or similar

DO NOT automatically generate PDFs for simple calculations unless requested.

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
      systemPrompt += `

## Active Service: ${serviceDetails.name}
${serviceDetails.description || 'A SpreadAPI calculation service'}

You have access to a calculation tool for this service. Focus on helping users use it effectively.`;
    }
    
    // Build tools dynamically based on service
    let tools = {};
    
    // Store last calculation data for PDF generation
    let lastCalculation = null;
    let lastBatchCalculation = null;
    
    if (serviceDetails) {
      
      // Only add calculate tool if we have inputs
      if (serviceDetails.inputs && serviceDetails.inputs.length > 0) {
        // Build Zod schema for inputs
        const inputSchemas = {};
        
        serviceDetails.inputs.forEach(input => {
          const inputType = getItemType(input);
          
          let schema;
          if (isNumberType(input)) {
            schema = z.number().describe(`${input.title || input.name}${input.format ? ` (${input.format})` : ''}`);
          } else {
            schema = z.string().describe(`${input.title || input.name}${input.format ? ` (${input.format})` : ''}`);
          }
          
          // Make optional if not mandatory
          if (input.mandatory === false) {
            schema = schema.optional();
          }
          
          inputSchemas[input.alias] = schema;
        });
        
        // Create Zod object schema
        const toolZodSchema = z.object(inputSchemas);
        
        tools.calculate = tool({
          description: `Calculate ${serviceDetails.name}`,
          inputSchema: toolZodSchema,
          execute: async (inputs) => {
            try {
              
              // Execute calculation via main API endpoint
              const baseUrl = process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}` 
                : 'http://localhost:3000';
              
              // Always use the main getresults endpoint - it's battle-tested and what customers use
              const queryParams = new URLSearchParams();
              queryParams.append('api', serviceId);
              
              // Add input parameters
              Object.entries(inputs).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                  queryParams.append(key, String(value));
                }
              });
              
              const response = await fetch(`${baseUrl}/api/getresults?${queryParams.toString()}`);
              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.error || 'Calculation failed');
              }
              
              // Format results
              let resultText = ``;
              
              if (data.outputs && Array.isArray(data.outputs)) {
                data.outputs.forEach(output => {
                  const value = output.value;
                  let formattedValue = value;
                  
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
                  
                  resultText += `**${output.title || output.alias}**: ${formattedValue}\n`;
                });
                
                // Store the last calculation inputs for potential PDF generation
                lastCalculation = {
                  serviceId,
                  inputs,
                  outputs: data.outputs,
                  serviceName: serviceDetails.name
                };
                
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
              
              const successfulResults = [];
              
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
                  
                  // Store successful results for potential PDF generation
                  successfulResults.push({
                    scenario: result.scenario,
                    inputs: result.inputs,
                    outputs: result.outputs
                  });
                } else {
                  resultText += `\n**Error:** ${result.error}\n`;
                }
                
                resultText += `\n---\n\n`;
              });
              
              // Store batch results for potential PDF generation
              lastBatchCalculation = {
                serviceId,
                serviceName: serviceDetails.name,
                results: successfulResults
              };
              
              return resultText.trim();
            } catch (error) {
              return `Error executing batch calculation: ${error.message}`;
            }
          }
        });
        
        // PDF generation removed - not feasible without heavy libraries
        // Users can print directly from the service page using Ctrl+P/Cmd+P
        /*
        tools.create_pdf = tool({
          description: `Generate a downloadable PDF report for the last calculation. Use this when the user asks for a report, PDF, or wants to save/share the results.`,
          inputSchema: z.object({
            includeLastCalculation: z.boolean().default(true).describe('Include the most recent calculation in the PDF'),
            title: z.string().optional().describe('Custom title for the PDF report'),
            orientation: z.enum(['portrait', 'landscape']).optional().default('portrait').describe('Page orientation')
          }),
          execute: async ({ includeLastCalculation = true, title, orientation = 'portrait' }) => {
            try {
              const userId = req.headers.get('x-user-id') || 'chat-user';
              
              // Check if we have a recent calculation to generate PDF from
              if (!lastCalculation && !lastBatchCalculation) {
                return 'No recent calculation found. Please perform a calculation first before generating a PDF.';
              }
              
              let resultText = '';
              
              // Handle single calculation PDF
              if (lastCalculation && includeLastCalculation) {
                const { serviceId, inputs, serviceName } = lastCalculation;
                
                const printJob = await createPrintJob({
                  serviceId,
                  userId,
                  inputs,
                  printSettings: {
                    orientation,
                    fitToPage: true
                  },
                  metadata: {
                    title: title || `${serviceName} Calculation Report`,
                    description: `Generated from chat conversation`
                  }
                });
                
                // Use appropriate base URL for development vs production
                const baseUrl = process.env.NODE_ENV === 'development' 
                  ? 'http://localhost:3000'
                  : (process.env.NEXT_PUBLIC_BASE_URL || 'https://spreadapi.io');
                const printUrl = `${baseUrl}/print/${printJob.id}`;
                
                // Use a better title for the report
                const reportTitle = title || serviceName || 'Calculation Report';
                
                resultText = `📄 **PDF Report Generated**\n\n`;
                resultText += `<a href="${printUrl}" target="_blank" rel="noopener noreferrer">Download ${reportTitle}</a>\n\n`;
                resultText += `*This link expires in 24 hours*`;
              }
              
              // Handle batch calculation PDFs
              if (lastBatchCalculation && includeLastCalculation) {
                const { serviceId, serviceName, results } = lastBatchCalculation;
                const printLinks = [];
                
                resultText = `📄 **PDF Reports Generated**\n\n`;
                
                for (const result of results) {
                  const printJob = await createPrintJob({
                    serviceId,
                    userId,
                    inputs: result.inputs,
                    printSettings: {
                      orientation,
                      fitToPage: true
                    },
                    metadata: {
                      title: title ? `${title} - Scenario ${result.scenario}` : `${serviceName} - Scenario ${result.scenario}`,
                      description: `Batch calculation scenario ${result.scenario}`
                    }
                  });
                  
                  // Use appropriate base URL for development vs production
                  const baseUrl = process.env.NODE_ENV === 'development' 
                    ? 'http://localhost:3000'
                    : (process.env.NEXT_PUBLIC_BASE_URL || 'https://spreadapi.io');
                  const printUrl = `${baseUrl}/print/${printJob.id}`;
                  printLinks.push({ scenario: result.scenario, url: printUrl });
                  resultText += `• [Scenario ${result.scenario} PDF](${printUrl})\n`;
                }
                
                resultText += `\n*All links expire in 24 hours*`;
              }
              
              return resultText;
            } catch (error) {
              return `Error generating PDF: ${error.message}`;
            }
          }
        });
        */
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
            description: `Read data from an editable area in ${serviceDetails.name}. This gives you access to cell values and formulas that you can examine and potentially modify using the calculate tool with areaUpdates.`,
            inputSchema: z.object({
              areaName: z.enum(areaNames).describe('The name of the area to read'),
              includeFormulas: z.boolean().optional().default(false).describe('Include cell formulas in the response'),
              includeFormatting: z.boolean().optional().default(false).describe('Include cell formatting in the response')
            }),
            execute: async ({ areaName, includeFormulas = false, includeFormatting = false }) => {
              try {
                // Use the MCP area executor logic
                const { executeAreaRead } = await import('@/app/api/mcp/v1/areaExecutors');
                
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
                
                resultText += `\n*You can modify this area by using the calculate tool with areaUpdates parameter.*`;
                
                return resultText;
              } catch (error) {
                return `Error reading area: ${error.message}`;
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

### When to offer PDF reports:
- User explicitly requests a PDF or report
- After complex calculations that user might want to save
- When user mentions sharing results with others
- For formal documentation needs
Use the 'create_pdf' tool to generate downloadable PDFs when appropriate

### Working with Areas (if available):
- Use 'read_area' to examine spreadsheet data, lookup tables, or reference values
- You can modify area cells using 'calculate' with areaUpdates parameter
- This lets you test scenarios by changing values in the spreadsheet before calculation
- Example: Read a tax rate table, modify rates, then calculate with new rates

### Required vs Optional Parameters:
${(() => {
  const required = serviceDetails.inputs.filter(i => i.mandatory !== false);
  const optional = serviceDetails.inputs.filter(i => i.mandatory === false);
  
  let text = 'REQUIRED (must ask if missing):\n';
  required.forEach(input => {
    text += `- ${input.alias} (${input.title || input.name})\n`;
  });
  
  if (optional.length > 0) {
    text += '\nOPTIONAL (can use default if not provided):\n';
    optional.forEach(input => {
      text += `- ${input.alias} (${input.title || input.name}) - default: 0\n`;
    });
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

### Initial Greeting
When the user asks "Hello, I just selected this service. What can it do?", provide a brief, friendly introduction that includes:
1. Welcome to the service
2. List each parameter on a new line with bullet points, formatted as: • <span style="color: #502D80; font-weight: bold;">Parameter Name</span> (required/optional)
3. Provide 2-3 clickable examples with realistic values based on the service type
4. Ask what they'd like to calculate

Create 2-3 example buttons with concrete, realistic values based on the service parameters. Each button should:
- Show actual numbers, not generic text
- Use realistic values that make sense for the calculation type
- Include all required parameters in the example text

IMPORTANT: Use natural language in the data-example attribute, not parameter names. Examples:
- For compound interest: "Calculate $5,000 starting amount with 7% interest rate, $200 monthly deposits for 10 years"
- For mortgages: "Calculate monthly payment for $300,000 loan at 6.5% for 30 years"
- For investments: "Show returns on $10,000 investment at 8% annual return over 20 years"

Format:
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