import { NextResponse } from 'next/server';
import { storeUserData, updateUserData, trackUserActivity, getUserData } from '@/lib/userData';

/**
 * POST /api/auth/user-data - Store/update user data in Redis
 * This is persistent storage (no TTL on user records)
 */
export async function POST(request) {
  try {
    const { userId, userData, action } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await getUserData(userId);
    const isNewUser = !existingUser;

    // For NEW users: Create full user record
    if (isNewUser && userData) {
      await storeUserData(userId, userData);
    }
    // For EXISTING users: Only update changed fields
    else if (userData) {
      await updateUserData(userId, {
        lastLogin: new Date().toISOString(),
        email: userData.email,  // In case email changed in Hanko
        verified: userData.verified?.toString(),
        hasWebauthn: userData.has_webauthn?.toString(),
        hasPassword: userData.has_password?.toString()
      });
    }

    // Track activity if action provided
    if (action) {
      await trackUserActivity(userId, action);
    } else {
      // Default to login action
      await trackUserActivity(userId, 'login');
    }

    // Send user data to Pipedream webhook (only if not yet sent to CRM)
    if (process.env.PIPEDREAM_NEW_USER_WEBHOOK_URL && action === 'login') {
      // Check if already sent (use existing user data from line 17)
      // For new users: existingUser is null, so sentToCRM is undefined
      // For existing users: existingUser contains the sentToCRM flag
      const alreadySent = existingUser?.sentToCRM === 'true';

      if (!alreadySent) {
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

          // Only mark as sent after successful webhook call
          await updateUserData(userId, { sentToCRM: 'true' });

          console.log(`User ${userId} sent to CRM via Pipedream webhook`);
        } catch (webhookError) {
          console.error('Failed to send to Pipedream webhook:', webhookError);
          // Webhook failed - flag NOT set, will retry on next login
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User data stored successfully'
    });

  } catch (error) {
    console.error('Error storing user data:', error);
    return NextResponse.json({
      error: 'Failed to store user data',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // This endpoint could be used to get stored user data
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