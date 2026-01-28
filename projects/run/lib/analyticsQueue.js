/**
 * Analytics Queue - Batches analytics for minimal Redis calls
 */

import redis from './redis.js';

class AnalyticsQueue {
  constructor() {
    this.queue = [];
    this.flushTimer = null;
  }

  track(serviceId, field, increment = 1) {
    if (!serviceId || !field) return;

    this.queue.push({ serviceId, field, increment });

    if (this.queue.length >= 100) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 50);
    }
  }

  async flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, 100);

    try {
      const byService = {};
      batch.forEach(({ serviceId, field, increment }) => {
        if (!byService[serviceId]) byService[serviceId] = {};
        byService[serviceId][field] = (byService[serviceId][field] || 0) + increment;
      });

      await Promise.all(
        Object.entries(byService).map(async ([serviceId, fields]) => {
          try {
            const multi = redis.multi();
            Object.entries(fields).forEach(([field, value]) => {
              multi.hIncrBy(`service:${serviceId}:analytics`, field, value);
            });
            await multi.exec();
          } catch {}
        })
      );
    } catch {}

    if (this.queue.length > 0) {
      setImmediate(() => this.flush());
    }
  }
}

export const analyticsQueue = new AnalyticsQueue();
