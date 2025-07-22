import { NextResponse } from 'next/server';
import { revokeToken } from '../../../../../lib/mcp-auth';
import redis from '../../../../../lib/redis';

export async function DELETE(request, { params }) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token parameter is required' },
        { status: 400 }
      );
    }

    // TODO: Add proper authentication with Hanko
    // For now, we need to get the user ID from the token itself
    // since we don't have session info
    const tokenData = await redis.hGetAll(`mcp:token:${token}`);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    const userId = tokenData.userId;

    // Revoke the token
    await revokeToken(userId, token);

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error revoking MCP token:', error);
    
    if (error.message === 'Token not found or unauthorized') {
      return NextResponse.json(
        { error: 'Token not found or unauthorized' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to revoke token' },
      { status: 500 }
    );
  }
}