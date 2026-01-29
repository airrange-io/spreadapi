import crypto from 'crypto';

/**
 * Trigger a Pusher event using native fetch (more reliable in serverless)
 * Errors are logged but don't throw
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
    }
  } catch (error) {
    console.error('[Pusher] Failed to trigger event:', error);
  }
}
