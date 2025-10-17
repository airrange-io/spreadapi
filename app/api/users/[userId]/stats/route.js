import { NextResponse } from 'next/server';
import { getUserData, getUserStats, getRecentActivity } from '@/lib/userData';

export async function GET(request, { params }) {
  try {
    const userId = params.userId;
    
    // Get user ID from middleware headers
    const authenticatedUserId = request.headers.get('x-user-id');
    
    // Users can only access their own stats
    if (authenticatedUserId !== userId) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 403 });
    }
    
    // Get user data
    const userData = await getUserData(userId);
    
    // Get user statistics
    const stats = await getUserStats(userId);
    
    // Get recent activity
    const recentActivity = await getRecentActivity(userId, 5);
    
    return NextResponse.json({
      user: userData || { id: userId },
      stats,
      recentActivity,
      fromStorage: !!userData
    });
    
  } catch (error) {
    console.error('Error getting user stats:', error);
    return NextResponse.json({ 
      error: 'Failed to get user statistics',
      details: error.message 
    }, { status: 500 });
  }
}