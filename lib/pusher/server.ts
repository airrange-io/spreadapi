import Pusher from 'pusher';

// Lazy initialization to avoid issues when env vars are not set
let pusherInstance: Pusher | null = null;

function getPusher(): Pusher | null {
  // Return cached instance
  if (pusherInstance) {
    return pusherInstance;
  }

  // Check if all required env vars are present
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    // Pusher not configured - this is fine, feature just won't be active
    return null;
  }

  pusherInstance = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherInstance;
}

/**
 * Trigger a Pusher event (non-blocking, fire-and-forget)
 * Returns immediately, errors are logged but don't throw
 */
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const pusher = getPusher();

  if (!pusher) {
    // Pusher not configured, skip silently
    return;
  }

  try {
    await pusher.trigger(channel, event, data);
  } catch (error) {
    // Log but don't throw - this is a non-critical feature
    console.error('[Pusher] Failed to trigger event:', error);
  }
}

/**
 * Authenticate a private channel subscription
 * Used by the /api/pusher/auth endpoint
 */
export function authenticateChannel(
  socketId: string,
  channel: string
): { auth: string } | null {
  const pusher = getPusher();

  if (!pusher) {
    return null;
  }

  return pusher.authorizeChannel(socketId, channel);
}

export default getPusher;
