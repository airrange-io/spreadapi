/**
 * Analytics Queue - Batches analytics updates for better performance
 *
 * Purpose:
 * - Reduces Redis calls by batching multiple updates together
 * - Non-blocking using setImmediate for zero latency impact
 * - Groups updates by serviceId for efficiency
 *
 * Performance:
 * - Batches up to 100 updates per flush
 * - Auto-flushes every 50ms or when batch is full
 * - Reduces Redis load by up to 99%
 *
 * Safety:
 * - Fire-and-forget (failures logged but don't block requests)
 * - Graceful degradation if Redis unavailable
 * - No impact on existing functionality when not used
 */

import redis from './redis.js';

class AnalyticsQueue {
  constructor() {
    this.queue = [];
    this.flushing = false;
    this.flushTimer = null;

    // Stats for monitoring
    this.stats = {
      queued: 0,
      flushed: 0,
      errors: 0
    };
  }

  /**
   * Track an analytics event (non-blocking)
   * @param {string} serviceId - Service identifier
   * @param {string} field - Analytics field to increment
   * @param {number} increment - Value to increment by (default 1)
   */
  track(serviceId, field, increment = 1) {
    if (!serviceId || !field) {
      console.warn('[AnalyticsQueue] Invalid track call - missing serviceId or field');
      return;
    }

    this.queue.push({ serviceId, field, increment });
    this.stats.queued++;

    // Flush immediately if batch is full (100 items)
    if (this.queue.length >= 100) {
      this.flush();
    }
    // Otherwise, schedule flush for next event loop tick
    else if (!this.flushing && !this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flush();
      }, 50); // Flush after 50ms max
    }
  }

  /**
   * Flush queued analytics to Redis (async, non-blocking)
   */
  async flush() {
    // Clear the timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Nothing to flush
    if (this.queue.length === 0) {
      this.flushing = false;
      return;
    }

    // Mark as flushing
    this.flushing = true;

    // Take up to 100 items from queue
    const batch = this.queue.splice(0, 100);

    try {
      // Group updates by serviceId for efficiency
      // Example: { 'service1': { 'field1': 5, 'field2': 3 }, 'service2': { 'field1': 2 } }
      const byService = {};

      batch.forEach(({ serviceId, field, increment }) => {
        if (!byService[serviceId]) {
          byService[serviceId] = {};
        }
        byService[serviceId][field] = (byService[serviceId][field] || 0) + increment;
      });

      // Execute all updates in parallel (one multi per service)
      const promises = Object.entries(byService).map(async ([serviceId, fields]) => {
        try {
          const multi = redis.multi();

          Object.entries(fields).forEach(([field, value]) => {
            multi.hIncrBy(`service:${serviceId}:analytics`, field, value);
          });

          await multi.exec();

        } catch (error) {
          console.error(`[AnalyticsQueue] Error flushing for service ${serviceId}:`, error.message);
          this.stats.errors++;
        }
      });

      await Promise.all(promises);
      this.stats.flushed += batch.length;

    } catch (error) {
      console.error('[AnalyticsQueue] Flush error:', error);
      this.stats.errors++;
    }

    // Mark as not flushing
    this.flushing = false;

    // If more items were queued during flush, flush again
    if (this.queue.length > 0) {
      setImmediate(() => this.flush());
    }
  }

  /**
   * Get queue statistics (for monitoring/debugging)
   */
  getStats() {
    return {
      ...this.stats,
      queueLength: this.queue.length,
      flushing: this.flushing
    };
  }

  /**
   * Force flush (for graceful shutdown)
   */
  async forceFlush() {
    await this.flush();
  }
}

// Singleton instance
export const analyticsQueue = new AnalyticsQueue();

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    console.log('[AnalyticsQueue] Flushing before exit...');
    await analyticsQueue.forceFlush();
  });
}
