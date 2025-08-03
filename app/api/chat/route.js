import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Create OpenAI instance with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req) {
  try {
    const { messages, serviceId } = await req.json();
    
    // Convert messages to proper format for the AI SDK
    const formattedMessages = messages.map(msg => {
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
    });
    
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
    
    // Fetch service details if serviceId is provided
    let serviceDetails = null;
    if (serviceId && serviceId !== 'general') {
      try {
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000';
        
        const serviceResponse = await fetch(`${baseUrl}/api/services/${serviceId}/full`);
        
        if (serviceResponse.ok) {
          const data = await serviceResponse.json();
          serviceDetails = data.service;
        }
      } catch (error) {
        console.error('Error fetching service details:', error);
      }
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
    
    // Enhanced system prompt with best practices
    let systemPrompt = `You are a helpful AI assistant for SpreadAPI, a platform that turns Excel spreadsheets into APIs.

Current context:
- Date: ${currentDate}
- Time: ${currentTime}
- Platform: SpreadAPI (Excel to API conversion service)
${serviceDetails ? `- Active Service: ${serviceDetails.name}` : ''}

Guidelines:
1. Be concise but thorough in your responses
2. Use markdown formatting for better readability (bold, lists, code blocks)
3. For code examples, always specify the language for syntax highlighting
4. If you're unsure about something, acknowledge it rather than guessing
5. For technical questions, provide practical examples when relevant
6. Break down complex explanations into steps
7. When discussing Excel formulas or APIs, use inline code formatting

Response style:
- Professional yet friendly
- Focus on being helpful and solution-oriented
- Use emojis sparingly and only when appropriate
- Structure long responses with headers and bullet points`;

    // Add service-specific context if available
    if (serviceDetails) {
      const inputDescriptions = serviceDetails.inputs?.map(input => 
        `- **${input.name}** (${input.alias}): ${input.type}${input.format ? ` (${input.format})` : ''}${input.mandatory === false ? ' (optional)' : ''}`
      ).join('\n') || 'No inputs defined';
      
      const outputDescriptions = serviceDetails.outputs?.map(output => 
        `- **${output.name}** (${output.alias}): ${output.type}${output.format ? ` (${output.format})` : ''}`
      ).join('\n') || 'No outputs defined';
      
      systemPrompt += `

## Active Service: ${serviceDetails.name}

${serviceDetails.description || 'A SpreadAPI calculation service'}

### Inputs:
${inputDescriptions}

### Outputs:
${outputDescriptions}

You are knowledgeable about this specific service and can help users understand how to use it, what values to input, and interpret the results.`;
    }
    
    // Build tools dynamically based on service
    let tools = {};
    
    if (serviceDetails) {
      // Build input schema dynamically from service definition
      const inputSchema = {};
      
      serviceDetails.inputs?.forEach(input => {
        // Map Excel types to Zod schemas
        let schema;
        if (input.type === 'number' || input.format === 'currency' || input.format === 'percentage') {
          schema = z.number().describe(input.name);
        } else {
          schema = z.string().describe(input.name);
        }
        
        // Make optional if not mandatory
        if (input.mandatory === false) {
          schema = schema.optional();
        }
        
        inputSchema[input.alias] = schema;
      });
      
      // Only add calculate tool if we have inputs
      if (Object.keys(inputSchema).length > 0) {
        tools.calculate = tool({
          description: `Calculate ${serviceDetails.name}`,
          parameters: z.object(inputSchema),
          execute: async (params) => {
            try {
              // Execute calculation via internal API
              const baseUrl = process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}` 
                : 'http://localhost:3000';
              
              // Build query parameters
              const queryParams = new URLSearchParams();
              queryParams.append('api', serviceId);
              
              // Add demo flag for demo services
              if (serviceId.startsWith('demoservice_')) {
                queryParams.append('demo', 'true');
              }
              
              // Add input parameters
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
              
              // Format results
              let resultText = `### Calculation Results:\n\n`;
              
              if (data.outputs && Array.isArray(data.outputs)) {
                data.outputs.forEach(output => {
                  const value = output.value;
                  let formattedValue = value;
                  
                  // Format based on output type
                  if (output.format === 'currency' && typeof value === 'number') {
                    formattedValue = new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(value);
                  } else if (output.format === 'percentage' && typeof value === 'number') {
                    formattedValue = `${(value * 100).toFixed(2)}%`;
                  }
                  
                  resultText += `**${output.title || output.alias}**: ${formattedValue}\n`;
                });
              }
              
              return resultText;
            } catch (error) {
              return `Error executing calculation: ${error.message}`;
            }
          }
        });
      }
    }
    
    // Use streamText from Vercel AI SDK with enhanced parameters
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: recentMessages,
      system: systemPrompt,
      temperature: 0.7, // Balanced between creativity and consistency
      maxTokens: 2000, // Reasonable limit for chat responses
      ...(Object.keys(tools).length > 0 && { tools }) // Only add tools if available
    });
    
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