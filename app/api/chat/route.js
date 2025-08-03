import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getServiceDetails } from '@/utils/serviceHelpers';
import { getItemType, isNumberType } from '@/utils/normalizeServiceData';

// Create OpenAI instance with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Helper to send debug logs
async function debugLog(type, data) {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    await fetch(`${baseUrl}/api/chat/debug`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log: { type, data } })
    });
  } catch (e) {
    // Ignore debug log errors
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, serviceId, initialGreeting } = body;
    
    await debugLog('request', { serviceId, messageCount: messages.length, initialGreeting });
    
    let formattedMessages;
    
    // If this is an initial greeting, replace the trigger message
    if (initialGreeting || (messages.length === 1 && messages[0]?.content === '[GREETING]')) {
      // Create system context for initial greeting
      formattedMessages = [{
        role: 'user',
        content: 'Hello, I just selected this service. What can it do?'
      }];
    } else {
      // Convert messages to proper format for the AI SDK
      formattedMessages = messages.map(msg => {
        // Handle messages with parts array (from UI)
        if (msg.parts && Array.isArray(msg.parts)) {
          const textPart = msg.parts.find(p => p.type === 'text');
          return {
            role: msg.role,
            content: textPart?.text || ''
          };
        }
        // Handle regular messages
        return {
          role: msg.role,
          content: msg.content || ''
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
          error: 'OpenAI API key not configured',
          details: 'Please add OPENAI_API_KEY to your .env.local file'
        }), 
        { 
          status: 500,
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
    console.log('=== Fetching service details ===');
    console.log('Service ID:', serviceId);
    await debugLog('fetchingService', { serviceId });
    
    try {
      // Get auth from current request
      const userId = req.headers.get('x-user-id');
      console.log('Current request userId:', userId);
      
      // Use the centralized helper function
      serviceDetails = await getServiceDetails(serviceId, userId);
      
      if (serviceDetails) {
        console.log('=== SERVICE LOADED VIA HELPER ===');
        console.log('Service details:', {
          name: serviceDetails.name,
          inputCount: serviceDetails.inputs.length,
          outputCount: serviceDetails.outputs.length,
          inputs: serviceDetails.inputs,
          outputs: serviceDetails.outputs
        });
        
        await debugLog('serviceLoaded', {
          name: serviceDetails.name,
          inputCount: serviceDetails.inputs.length,
          outputCount: serviceDetails.outputs.length,
          inputs: serviceDetails.inputs
        });
      } else {
        console.error('Service not found or unauthorized');
        
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
      console.error('Error fetching service details:', error);
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
    let systemPrompt = `You are a specialized assistant for the "${serviceDetails?.name || 'SpreadAPI service'}" calculation service.

Your ONLY purpose is to help users use this specific service. You should:
1. On "Hello": Give a VERY brief intro (one short paragraph)
2. Extract parameters from user queries for calculations
3. Ask for missing required parameters  
4. Execute calculations using the provided tool
5. Present results clearly

CRITICAL: Pay attention to input formats - especially percentage values which must be converted to decimals.

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
    
    if (serviceDetails) {
      console.log('Building tools for service:', serviceDetails.name);
      console.log('Service inputs:', serviceDetails.inputs?.length || 0);
      
      // Only add calculate tool if we have inputs
      if (serviceDetails.inputs && serviceDetails.inputs.length > 0) {
        // Build Zod schema for inputs
        const inputSchemas = {};
        
        serviceDetails.inputs.forEach(input => {
          const inputType = getItemType(input);
          console.log(`Processing input: ${input.alias} - type: ${inputType}, format: ${input.format}`);
          
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
        console.log('Created Zod schema with inputs:', Object.keys(inputSchemas));
        
        tools.calculate = tool({
          description: `Calculate ${serviceDetails.name}. Use this tool when the user asks for calculations related to ${serviceDetails.name}.`,
          inputSchema: toolZodSchema, // Use inputSchema, not parameters
          execute: async (params) => {
            console.log('Tool executing with params:', params);
            try {
              console.log('=== TOOL EXECUTION ===');
              console.log('Service:', serviceDetails.name);
              console.log('Params received:', params);
              
              // Execute calculation via internal API
              const baseUrl = process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}` 
                : 'http://localhost:3000';
              
              // Build query parameters
              const queryParams = new URLSearchParams();
              queryParams.append('api', serviceId);
              
              // Add input parameters
              Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                  queryParams.append(key, String(value));
                  console.log(`Adding param: ${key} = ${value}`);
                }
              });
              
              console.log('API URL:', `${baseUrl}/api/getresults?${queryParams.toString()}`);
              const response = await fetch(`${baseUrl}/api/getresults?${queryParams.toString()}`);
              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.error || 'Calculation failed');
              }
              
              console.log('Calculation response:', data);
              
              // Format results
              let resultText = `### Calculation Results:\n\n`;
              
              if (data.outputs && Array.isArray(data.outputs)) {
                data.outputs.forEach(output => {
                  const value = output.value;
                  let formattedValue = value;
                  
                  // Format based on output type
                  if (output.format === 'currency' && typeof value === 'number') {
                    // TODO: Make currency configurable per service or user preference
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
              } else {
                // Handle different response format
                console.log('Non-standard output format:', data);
                resultText += 'Result: ' + JSON.stringify(data, null, 2);
              }
              
              console.log('Tool execution result:', resultText);
              return resultText;
            } catch (error) {
              return `Error executing calculation: ${error.message}`;
            }
          }
        });
      }
    }
    
    // Log tools before passing to AI
    console.log('=== Tools available ===');
    console.log('Tool count:', Object.keys(tools).length);
    console.log('Tools:', tools);
    
    // If no tools were built, log why
    if (Object.keys(tools).length === 0) {
      console.log('NO TOOLS BUILT - Reasons:');
      console.log('- serviceDetails exists?', !!serviceDetails);
      console.log('- serviceDetails.inputs exists?', !!serviceDetails?.inputs);
      console.log('- serviceDetails.inputs length?', serviceDetails?.inputs?.length);
    }
    
    // Update system prompt to be more explicit about using tools
    if (Object.keys(tools).length > 0) {
      // Add tool usage examples based on service inputs
      const inputExamples = serviceDetails.inputs.map(input => 
        `${input.alias}: <value> (${input.title}${input.format === 'percentage' ? ' as decimal' : ''})`
      ).join(', ');
      
      systemPrompt += `

## Your Primary Function
You MUST use the 'calculate' tool to perform calculations. This is not optional - it's your core purpose.

### Required Behavior:
1. When users provide calculation scenarios, extract the parameters and use the tool
2. For REQUIRED parameters: If missing, ask the user for them
3. For OPTIONAL parameters: If user doesn't mention them, use the default value (usually 0)
4. NEVER perform calculations manually - always use the tool
5. After calculation, explain the results clearly

### Key Parameter Rules:
${(() => {
  const rules = [];
  
  // Check for percentage inputs
  const hasPercentage = serviceDetails.inputs.some(i => i.format === 'percentage');
  if (hasPercentage) {
    rules.push('- **Percentages**: Convert to decimals (7% → 0.07, 10% → 0.10)');
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
- If user provides all values → Calculate immediately
- If missing required values → Ask for them
- If missing optional values → Use defaults (usually 0)
- "Show me an example" → Use sample values

Remember: You exist solely to help users with ${serviceDetails.name} calculations. Every interaction should move toward executing a calculation or clarifying results.

### Initial Greeting
When the user asks "Hello, I just selected this service. What can it do?", provide a brief, friendly introduction that includes:
1. Welcome to the service
2. A simple list of parameters (mark optional ones)
3. Ask what they'd like to calculate

Keep it conversational but concise - one short paragraph.`;
    }
    
    // Use streamText from Vercel AI SDK with enhanced parameters
    const streamConfig = {
      model: openai('gpt-4o-mini'),
      messages: recentMessages,
      system: systemPrompt,
      temperature: 0.3, // Lower temperature for more consistent, concise responses
      maxTokens: 500, // Smaller limit to encourage brevity
    };
    
    // Add tools if available
    if (Object.keys(tools).length > 0) {
      streamConfig.tools = tools;
      // For service-specific chat, we want to use tools when appropriate
      // but not force it for every single message (e.g., when asking for clarification)
      streamConfig.toolChoice = 'auto';
      
      console.log('=== STREAM CONFIG ===');
      console.log('Tool choice:', streamConfig.toolChoice);
      console.log('Tools provided:', Object.keys(tools));
    }
    
    const result = await streamText(streamConfig);
    
    console.log('=== STREAM RESULT ===');
    console.log('Result type:', typeof result);
    console.log('Has toUIMessageStreamResponse:', typeof result.toUIMessageStreamResponse);
    
    // Return the stream response in the format expected by useChat
    return result.toUIMessageStreamResponse();
    
  } catch (error) {
    console.error('API Error:', error);
    
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