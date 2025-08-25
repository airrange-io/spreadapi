import { NextResponse } from 'next/server';
import { getUserTokens } from '../../../../lib/mcp-auth';

export async function GET(request) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to view MCP tokens' },
        { status: 401 }
      );
    }

    // Get user's tokens
    const tokens = await getUserTokens(userId);

    return NextResponse.json({ 
      tokens,
      userId // Include userId in response
    });
    
  } catch (error) {
    console.error('Error fetching MCP tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}