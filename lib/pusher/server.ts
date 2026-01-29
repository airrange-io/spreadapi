import Pusher from 'pusher';
import crypto from 'crypto';

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
 * Trigger a Pusher event using native fetch (more reliable in serverless)
 * Returns immediately, errors are logged but don't throw
 */
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return;
  }

  try {
    const body = JSON.stringify({
      name: event,
      channel: channel,
      data: JSON.stringify(data),
    });

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyMd5 = crypto.createHash('md5').update(body).digest('hex');

    const stringToSign = [
      'POST',
      `/apps/${appId}/events`,
      `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}`,
    ].join('\n');

    const signature = crypto
      .createHmac('sha256', secret)
      .update(stringToSign)
      .digest('hex');

    const url = `https://api-${cluster}.pusher.com/apps/${appId}/events?auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}&auth_signature=${signature}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[Pusher] HTTP error:', response.status, text);
    } else {
      console.log('[Pusher] Event sent successfully');
    }
  } catch (error) {
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
