'use client';

import PusherClient from 'pusher-js';

let pusherClient: PusherClient | null = null;

/**
 * Get or create the Pusher client singleton
 * Returns null if Pusher is not configured
 */
export function getPusherClient(): PusherClient | null {
  // Only run on client
  if (typeof window === 'undefined') {
    return null;
  }

  // Return cached instance
  if (pusherClient) {
    return pusherClient;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    // Pusher not configured
    return null;
  }

  pusherClient = new PusherClient(key, {
    cluster,
    authEndpoint: '/api/pusher/auth',
    // Auth will include cookies automatically
  });

  // Log connection state changes in development
  if (process.env.NODE_ENV === 'development') {
    pusherClient.connection.bind('state_change', (states: { current: string; previous: string }) => {
      console.log('[Pusher] Connection state:', states.previous, '->', states.current);
    });
  }

  return pusherClient;
}

/**
 * Disconnect and cleanup Pusher client
 * Call this on logout or unmount
 */
export function disconnectPusher(): void {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
}
