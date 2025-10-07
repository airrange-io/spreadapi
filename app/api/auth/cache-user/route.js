import { NextResponse } from 'next/server';
import { cacheUserData, updateUserCache, trackUserActivity, getCachedUserData } from '@/lib/userHashCache';

export async function POST(request) {
  try {
    const { userId, userData, action } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user already sent to CRM
    const existingUser = await getCachedUserData(userId);
    const sentToCRM = existingUser?.sentToCRM === 'true' || existingUser?.sentToCRM === true;

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

    // Send user data to Pipedream webhook (only if not yet sent to CRM)
    if (process.env.PIPEDREAM_NEW_USER_WEBHOOK_URL && action === 'login' && !sentToCRM) {
      try {
        const headers = { 'Content-Type': 'application/json' };

        // Add secret token if configured
        if (process.env.PIPEDREAM_NEW_USER_WEBHOOK_SECRET) {
          headers['Authorization'] = `Bearer ${process.env.PIPEDREAM_NEW_USER_WEBHOOK_SECRET}`;
        }

        await fetch(process.env.PIPEDREAM_NEW_USER_WEBHOOK_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userId,
            userData,
            action: 'new_user_registration',
            timestamp: new Date().toISOString()
          })
        });

        // Mark user as sent to CRM
        await updateUserCache(userId, {
          sentToCRM: 'true'
        });

        console.log(`User ${userId} sent to CRM via Pipedream webhook`);
      } catch (webhookError) {
        console.error('Failed to send to Pipedream webhook:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

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