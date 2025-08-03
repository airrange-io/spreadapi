import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Create OpenAI instance with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req) {
  try {
    const { messages, serviceId } = await req.json();
    
    // Limit conversation history to prevent token overflow
    // Keep last 20 messages (10 exchanges) for context
    const recentMessages = messages.slice(-20);

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
    const systemPrompt = `You are a helpful AI assistant for SpreadAPI, a platform that turns Excel spreadsheets into APIs.

Current context:
- Date: ${currentDate}
- Time: ${currentTime}
- Platform: SpreadAPI (Excel to API conversion service)

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
- Structure long responses with headers and bullet points

If the user selected a specific service, they want help with that particular Excel-based calculation or API.`;
    
    // Use streamText from Vercel AI SDK with enhanced parameters
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: recentMessages,
      system: systemPrompt,
      temperature: 0.7, // Balanced between creativity and consistency
      maxTokens: 2000, // Reasonable limit for chat responses
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