import { NextResponse } from 'next/server';
import { revokeToken } from '@/lib/mcp-auth';

/**
 * POST /api/mcp/revoke-token - Revoke an MCP token
 */
export async function POST(request) {
  try {
    // Get authenticated user ID from headers
    const authenticatedUserId = request.headers.get('x-user-id');
    
    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Revoke the token (revokeToken function checks ownership)
    try {
      await revokeToken(authenticatedUserId, token);
      
      return NextResponse.json({
        success: true,
        message: 'Token revoked successfully'
      });
    } catch (error) {
      if (error.message.includes('not found or unauthorized')) {
        return NextResponse.json(
          { error: 'Token not found or you do not have permission to revoke it' },
          { status: 403 }
        );
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Error revoking token:', error);
    return NextResponse.json(
      { error: 'Failed to revoke token', details: error.message },
      { status: 500 }
    );
  }
}