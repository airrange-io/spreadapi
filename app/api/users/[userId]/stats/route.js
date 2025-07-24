import { NextResponse } from 'next/server';
import { getCachedUserData, getUserStats, getRecentActivity } from '@/lib/userHashCache';

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
    
    // Get cached user data
    const cachedUser = await getCachedUserData(userId);
    
    // Get user statistics
    const stats = await getUserStats(userId);
    
    // Get recent activity
    const recentActivity = await getRecentActivity(userId, 5);
    
    return NextResponse.json({
      user: cachedUser || { id: userId },
      stats,
      recentActivity,
      cached: !!cachedUser
    });
    
  } catch (error) {
    console.error('Error getting user stats:', error);
    return NextResponse.json({ 
      error: 'Failed to get user statistics',
      details: error.message 
    }, { status: 500 });
  }
}