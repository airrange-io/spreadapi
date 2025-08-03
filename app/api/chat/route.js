import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Create OpenAI instance with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req) {
  try {
    const { messages, serviceId } = await req.json();

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

    // Use streamText from Vercel AI SDK
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: messages,
      system: 'You are a helpful AI assistant. Be concise and helpful.',
    });
    
    // Return the stream response in the format expected by useChat
    return result.toUIMessageStreamResponse();
    
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}