'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPusherClient, disconnectPusher } from '@/lib/pusher/client';
import type { Channel } from 'pusher-js';

interface CallCountUpdate {
  serviceId: string;
  calls: number;
}

interface UseRealtimeCallCountsOptions {
  userId: string | undefined;
  enabled?: boolean;
  /** Debounce delay in ms before applying batched updates (default: 2000) */
  debounceMs?: number;
}

/**
 * Hook for receiving real-time call count updates via Pusher
 * Updates are debounced/batched to avoid excessive re-renders
 *
 * @param options.userId - Current user's ID (from useAuth)
 * @param options.enabled - Whether to enable real-time updates (default: true)
 * @param options.debounceMs - Debounce delay in ms (default: 2000)
 * @returns Object with callCounts map and connection status
 */
export function useRealtimeCallCounts({
  userId,
  enabled = true,
  debounceMs = 2000,
}: UseRealtimeCallCountsOptions) {
  // Map of serviceId -> current call count
  const [callCounts, setCallCounts] = useState<Map<string, number>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<Channel | null>(null);

  // Pending updates buffer for debouncing
  const pendingUpdatesRef = useRef<Map<string, number>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Flush pending updates to state
  const flushUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.size === 0) return;

    const updates = pendingUpdatesRef.current;
    pendingUpdatesRef.current = new Map();

    setCallCounts((prev) => {
      const next = new Map(prev);
      updates.forEach((count, serviceId) => {
        next.set(serviceId, count);
      });
      return next;
    });
  }, []);

  // Handle incoming call count update (debounced)
  const handleCallCountUpdate = useCallback((data: CallCountUpdate) => {
    // Buffer the update
    pendingUpdatesRef.current.set(data.serviceId, data.calls);

    // Reset debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Schedule flush after debounce delay
    debounceTimerRef.current = setTimeout(() => {
      flushUpdates();
    }, debounceMs);
  }, [debounceMs, flushUpdates]);

  useEffect(() => {
    // Skip if not enabled or no user
    if (!enabled || !userId) {
      return;
    }

    const pusher = getPusherClient();
    if (!pusher) {
      // Pusher not configured
      return;
    }

    // Subscribe to user's private channel
    const channelName = `private-user-${userId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // Handle subscription success
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Pusher] Subscribed to ${channelName}`);
      }
    });

    // Handle subscription error
    channel.bind('pusher:subscription_error', (error: unknown) => {
      console.error(`[Pusher] Subscription error for ${channelName}:`, error);
      setIsConnected(false);
    });

    // Listen for call count updates
    channel.bind('call-count-update', handleCallCountUpdate);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusher.unsubscribe(channelName);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [userId, enabled, handleCallCountUpdate]);

  // Get call count for a specific service (returns undefined if not yet updated)
  const getCallCount = useCallback(
    (serviceId: string): number | undefined => {
      return callCounts.get(serviceId);
    },
    [callCounts]
  );

  return {
    callCounts,
    getCallCount,
    isConnected,
  };
}

// Export disconnect function for logout cleanup
export { disconnectPusher };
