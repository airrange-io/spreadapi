import { NextResponse } from 'next/server';
import { cacheUserData, updateUserCache, trackUserActivity } from '@/lib/userHashCache';

export async function POST(request) {
  try {
    const { userId, userData, action } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Cache user data if provided
    if (userData) {
      await cacheUserData(userId, userData);
    }
    
    // Track activity if action provided
    if (action) {
      await trackUserActivity(userId, action);
    } else {
      // Default to login action
      await trackUserActivity(userId, 'login');
    }
    
    // Update last login
    await updateUserCache(userId, {
      lastLogin: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'User data cached successfully' 
    });
    
  } catch (error) {
    console.error('Error caching user data:', error);
    return NextResponse.json({ 
      error: 'Failed to cache user data',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // This endpoint could be used to get cached user data
    // But for now we'll just return method not allowed
    return NextResponse.json({ 
      error: 'Method not allowed' 
    }, { status: 405 });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}