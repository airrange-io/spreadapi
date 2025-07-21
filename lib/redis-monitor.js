/**
 * Redis Performance Monitoring Utilities
 */

class RedisPerformanceMonitor {
  constructor() {
    this.metrics = {
      operations: new Map(),
      slowQueries: [],
      errors: [],
    };
    this.slowQueryThreshold = 100; // ms
  }

  /**
   * Wrap Redis operation for monitoring
   */
  async monitor(operationName, operation) {
    const start = Date.now();
    let error = null;
    let result = null;

    try {
      result = await operation();
    } catch (e) {
      error = e;
      this.recordError(operationName, e);
    }

    const duration = Date.now() - start;
    this.recordOperation(operationName, duration, error);

    if (duration > this.slowQueryThreshold) {
      this.recordSlowQuery(operationName, duration);
    }

    if (error) throw error;
    return result;
  }

  recordOperation(name, duration, error) {
    if (!this.metrics.operations.has(name)) {
      this.metrics.operations.set(name, {
        count: 0,
        totalTime: 0,
        errors: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity,
      });
    }

    const metric = this.metrics.operations.get(name);
    metric.count++;
    metric.totalTime += duration;
    metric.avgTime = metric.totalTime / metric.count;
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.minTime = Math.min(metric.minTime, duration);
    
    if (error) {
      metric.errors++;
    }
  }

  recordSlowQuery(operationName, duration) {
    this.metrics.slowQueries.push({
      operation: operationName,
      duration,
      timestamp: new Date(),
    });

    // Keep only last 100 slow queries
    if (this.metrics.slowQueries.length > 100) {
      this.metrics.slowQueries.shift();
    }
  }

  recordError(operationName, error) {
    this.metrics.errors.push({
      operation: operationName,
      error: error.message,
      timestamp: new Date(),
    });

    // Keep only last 50 errors
    if (this.metrics.errors.length > 50) {
      this.metrics.errors.shift();
    }
  }

  getReport() {
    const report = {
      summary: {
        totalOperations: 0,
        totalErrors: 0,
        avgResponseTime: 0,
        slowQueries: this.metrics.slowQueries.length,
      },
      operations: {},
      topSlowQueries: this.metrics.slowQueries.slice(-10).reverse(),
      recentErrors: this.metrics.errors.slice(-10).reverse(),
    };

    let totalTime = 0;
    for (const [name, metric] of this.metrics.operations) {
      report.operations[name] = { ...metric };
      report.summary.totalOperations += metric.count;
      report.summary.totalErrors += metric.errors;
      totalTime += metric.totalTime;
    }

    report.summary.avgResponseTime = 
      report.summary.totalOperations > 0 
        ? totalTime / report.summary.totalOperations 
        : 0;

    return report;
  }

  reset() {
    this.metrics.operations.clear();
    this.metrics.slowQueries = [];
    this.metrics.errors = [];
  }
}

// Singleton instance
export const redisMonitor = new RedisPerformanceMonitor();

/**
 * Middleware for monitoring Redis operations in API routes
 */
export function withRedisMonitoring(handler) {
  return async (req, res) => {
    const start = Date.now();
    
    try {
      const result = await handler(req, res);
      
      // Log slow API responses that might be Redis-related
      const duration = Date.now() - start;
      if (duration > 500) {
        console.warn(`Slow API response: ${req.url} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      console.error(`API error in ${req.url}:`, error);
      throw error;
    }
  };
}