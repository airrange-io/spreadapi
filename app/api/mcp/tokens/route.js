import { NextResponse } from 'next/server';
import { getUserTokens } from '@/lib/mcp-auth';

/**
 * GET /api/mcp/tokens - List user's MCP tokens
 */
export async function GET(request) {
  try {
    // Get authenticated user ID from headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }
    
    // Get user's tokens
    const tokens = await getUserTokens(userId);
    
    return NextResponse.json({
      success: true,
      tokens: tokens,
      count: tokens.length
    });
    
  } catch (error) {
    console.error('Error fetching MCP tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens', details: error.message },
      { status: 500 }
    );
  }
}