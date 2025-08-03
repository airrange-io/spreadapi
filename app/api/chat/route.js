import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages, tool } from 'ai';
import { z } from 'zod';
import { cookies } from 'next/headers';
import redis from '../../../lib/redis';
import { DEMO_SERVICE_IDS } from '../../../lib/constants';

// Get user ID from Hanko cookie
async function getUserIdFromCookie() {
  const cookieStore = cookies();
  const hankoCookie = cookieStore.get('hanko');
  
  if (!hankoCookie) {
    return null;
  }
  
  try {
    // This is a simplified version - in production you'd validate the JWT
    const payload = JSON.parse(Buffer.from(hankoCookie.value.split('.')[1], 'base64').toString());
    return payload.sub;
  } catch (error) {
    console.error('Error parsing Hanko cookie:', error);
    return null;
  }
}

// Execute service via internal API
async function executeService(serviceId, inputs, isDemo = false) {
  try {
    const params = new URLSearchParams();
    params.append('api', serviceId);
    
    // For demo services, use special demo parameter
    if (isDemo) {
      params.append('demo', 'true');
    }
    
    // Add input parameters
    Object.entries(inputs).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/getresults?${params.toString()}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Service execution failed`);
    }
    
    // Format response
    let resultText = `### Results for ${serviceId}:\n\n`;
    
    if (data.outputs || data.result) {
      const outputs = data.outputs || data.result;
      
      if (Array.isArray(outputs)) {
        outputs.forEach(output => {
          if (output.type === 'output') {
            resultText += `**${output.alias || output.name}**: ${output.value}\n`;
          }
        });
      } else {
        for (const [key, value] of Object.entries(outputs)) {
          resultText += `**${key}**: ${value}\n`;
        }
      }
    }
    
    return resultText;
  } catch (error) {
    return `Error executing ${serviceId}: ${error.message}`;
  }
}

// Get available services for user
async function getAvailableServices(userId) {
  const services = [];
  
  if (!userId) {
    // Return demo services for unauthenticated users
    const demoServices = [];
    for (const demoId of DEMO_SERVICE_IDS) {
      const publishedData = await redis.hGetAll(`service:${demoId}:published`);
      if (publishedData && publishedData.title) {
        demoServices.push({
          id: demoId,
          name: publishedData.title,
          description: publishedData.description || '',
          isDemo: true
        });
      }
    }
    return demoServices;
  }
  
  // Get user's published services
  const userServiceIndex = await redis.hGetAll(`user:${userId}:services`);
  
  for (const [serviceId, serviceData] of Object.entries(userServiceIndex)) {
    try {
      const indexData = JSON.parse(serviceData);
      if (indexData.status === 'published') {
        const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
        services.push({
          id: serviceId,
          name: publishedData.title || serviceId,
          description: publishedData.description || publishedData.aiDescription || '',
          isDemo: false
        });
      }
    } catch (error) {
      console.error(`Error processing service ${serviceId}:`, error);
    }
  }
  
  return services;
}

export async function POST(request) {
  try {
    const { messages, serviceId } = await request.json();
    const userId = await getUserIdFromCookie();
    
    if (!serviceId) {
      return new Response(
        JSON.stringify({ error: 'Service ID is required' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get service details
    let serviceDetails = null;
    let isDemo = false;
    
    if (DEMO_SERVICE_IDS.includes(serviceId)) {
      isDemo = true;
      // For demo services, get the actual service details from Redis
      const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
      if (publishedData && publishedData.title) {
        serviceDetails = {
          id: serviceId,
          name: publishedData.title,
          description: publishedData.description || publishedData.aiDescription || '',
          inputs: publishedData.inputs ? JSON.parse(publishedData.inputs) : [],
          outputs: publishedData.outputs ? JSON.parse(publishedData.outputs) : []
        };
      }
    } else if (userId) {
      // Check if user has access to this service
      const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
      if (publishedData && publishedData.title) {
        serviceDetails = {
          id: serviceId,
          name: publishedData.title,
          description: publishedData.description || publishedData.aiDescription || '',
          inputs: publishedData.inputs ? JSON.parse(publishedData.inputs) : [],
          outputs: publishedData.outputs ? JSON.parse(publishedData.outputs) : []
        };
      }
    }
    
    if (!serviceDetails) {
      return new Response(
        JSON.stringify({ error: 'Service not found or access denied' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Build focused system prompt for this specific service
    let systemPrompt = `You are an AI assistant specialized in the "${serviceDetails.name}" service. 

Service Details:
${serviceDetails.description}

Inputs:
${serviceDetails.inputs.map(i => `- ${i.name}: ${i.description}${i.mandatory === false ? ' (optional)' : ''}`).join('\n')}

Outputs:
${serviceDetails.outputs.map(o => `- ${o.name}: ${o.description}`).join('\n')}

Your role is to:
1. Help users understand how to use this service
2. Execute calculations when requested
3. Explain results clearly
4. Suggest interesting scenarios to explore
5. Format currency values with $ and commas, percentages as % (e.g., 6.5%)

Be conversational and helpful. Focus only on this specific service.`;

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
      tools: {
        calculate: tool({
          description: `Execute a calculation using the ${serviceDetails.name}`,
          parameters: z.object({
            inputs: z.record(z.any()).describe('Input parameters for the calculation')
          }),
          execute: async ({ inputs }) => {
            return await executeService(serviceId, inputs, isDemo);
          }
        }),
        
        compareScenarios: tool({
          description: 'Compare multiple calculation scenarios',
          parameters: z.object({
            scenarios: z.array(z.object({
              label: z.string().describe('Label for this scenario'),
              inputs: z.record(z.any()).describe('Input parameters')
            })).describe('Array of scenarios to compare')
          }),
          execute: async ({ scenarios }) => {
            let response = `### Comparison Results:\n\n`;
            
            for (const scenario of scenarios) {
              response += `#### ${scenario.label}\n`;
              const result = await executeService(serviceId, scenario.inputs, isDemo);
              response += result + '\n';
            }
            
            return response;
          }
        }),
        
        explainService: tool({
          description: 'Explain how this service works',
          parameters: z.object({}),
          execute: async () => {
            let response = `### How ${serviceDetails.name} Works\n\n`;
            response += `${serviceDetails.description}\n\n`;
            
            response += '**Required Inputs:**\n';
            serviceDetails.inputs.forEach(input => {
              if (input.mandatory !== false) {
                response += `- **${input.name}**: ${input.description}\n`;
              }
            });
            
            const optionalInputs = serviceDetails.inputs.filter(i => i.mandatory === false);
            if (optionalInputs.length > 0) {
              response += '\n**Optional Inputs:**\n';
              optionalInputs.forEach(input => {
                response += `- **${input.name}**: ${input.description}\n`;
              });
            }
            
            response += '\n**What you get back:**\n';
            serviceDetails.outputs.forEach(output => {
              response += `- **${output.name}**: ${output.description}\n`;
            });
            
            return response;
          }
        })
      }
    });
    
    return result.toAIStreamResponse();
    
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}