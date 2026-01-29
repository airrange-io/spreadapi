import Pusher from 'pusher';

// Lazy initialization
let pusherInstance = null;

function getPusher() {
  if (pusherInstance) return pusherInstance;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  pusherInstance = new Pusher({ appId, key, secret, cluster, useTLS: true });
  return pusherInstance;
}

/**
 * Trigger a Pusher event (fire-and-forget)
 */
export async function triggerPusherEvent(channel, event, data) {
  const pusher = getPusher();
  if (!pusher) return;

  try {
    await pusher.trigger(channel, event, data);
  } catch (error) {
    console.error('[Pusher] Failed to trigger event:', error.message);
  }
}

export default getPusher;
