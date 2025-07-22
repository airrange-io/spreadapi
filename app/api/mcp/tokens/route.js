import { NextResponse } from 'next/server';
import { getUserTokens } from '../../../../lib/mcp-auth';

export async function GET(request) {
  try {
    // TODO: Add proper authentication with Hanko
    // For now, using a fixed test user ID for consistency
    const tempUserId = 'test1234';

    // Get user's tokens
    const tokens = await getUserTokens(tempUserId);

    return NextResponse.json({ tokens });
    
  } catch (error) {
    console.error('Error fetching MCP tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}