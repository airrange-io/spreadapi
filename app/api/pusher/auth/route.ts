import { NextRequest, NextResponse } from 'next/server';
import { authenticateChannel } from '@/lib/pusher/server';

/**
 * POST /api/pusher/auth
 * Authenticates private channel subscriptions
 *
 * Pusher sends: { socket_id, channel_name }
 * We verify the user owns the channel and return auth signature
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware header
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data (Pusher sends as application/x-www-form-urlencoded)
    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Verify user can access this channel
    // Channel format: private-user-{userId}
    if (channelName.startsWith('private-user-')) {
      const channelUserId = channelName.replace('private-user-', '');

      if (channelUserId !== userId) {
        console.warn(`[Pusher Auth] User ${userId} attempted to subscribe to channel for user ${channelUserId}`);
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    } else {
      // Unknown channel type
      return NextResponse.json(
        { error: 'Invalid channel' },
        { status: 400 }
      );
    }

    // Generate auth signature
    const auth = authenticateChannel(socketId, channelName);

    if (!auth) {
      return NextResponse.json(
        { error: 'Pusher not configured' },
        { status: 503 }
      );
    }

    return NextResponse.json(auth);
  } catch (error) {
    console.error('[Pusher Auth] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
