import { NextResponse } from 'next/server';
import { revokeToken } from '@/lib/mcp-auth';

/**
 * DELETE /api/mcp/tokens/[tokenId] - Revoke an MCP token
 */
export async function DELETE(request, { params }) {
  try {
    // Get authenticated user ID from headers
    const authenticatedUserId = request.headers.get('x-user-id');

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    const { tokenId } = await params;

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    // Revoke the token (revokeToken function checks ownership)
    try {
      await revokeToken(authenticatedUserId, tokenId);

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
