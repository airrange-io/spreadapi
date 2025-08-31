import { NextResponse } from 'next/server';
import { deleteUser, exportUserData } from '@/lib/userManagement';
import redis from '@/lib/redis';

// GET /api/users/[userId] - Get user data
export async function GET(request, { params }) {
  try {
    const { userId } = params;
    
    // Check for export parameter
    const { searchParams } = new URL(request.url);
    const exportData = searchParams.get('export') === 'true';
    
    if (exportData) {
      // Export all user data (GDPR compliance)
      const userData = await exportUserData(userId);
      return NextResponse.json(userData);
    }
    
    // Regular user fetch
    const user = await redis.hGetAll(`user:${userId}`);
    
    if (!user || Object.keys(user).length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get service count
    const userServices = await redis.hGetAll(`user:${userId}:services`);
    const serviceCount = Object.keys(userServices).length;
    
    // Get token count
    const tokenCount = await redis.sCard(`mcp:user:${userId}:tokens`);
    
    return NextResponse.json({
      user,
      stats: {
        services: serviceCount,
        tokens: tokenCount
      }
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[userId] - Delete user and all associated data
export async function DELETE(request, { params }) {
  try {
    const { userId } = params;
    
    // Get authenticated user from headers
    const authenticatedUserId = request.headers.get('x-user-id');
    
    // Only allow users to delete their own account
    if (!authenticatedUserId || authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - can only delete your own account' },
        { status: 403 }
      );
    }
    
    // Check if user exists
    const userExists = await redis.exists(`user:${userId}`);
    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete user and all associated data
    const result = await deleteUser(userId);
    
    return NextResponse.json({
      message: 'User deleted successfully',
      ...result
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}