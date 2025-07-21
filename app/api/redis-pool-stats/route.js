import { NextResponse } from 'next/server';
import { getPoolStats } from '../../../lib/redis-pool.js';
import { redisMonitor } from '../../../lib/redis-monitor.js';

/**
 * GET /api/redis-pool-stats
 * Returns comprehensive statistics about the Redis connection pool
 */
export async function GET(request) {
  try {
    // Get pool statistics
    const poolStats = getPoolStats();
    
    // Get performance metrics from monitor
    const performanceReport = redisMonitor.getReport();
    
    // Combine all stats
    const stats = {
      pool: poolStats,
      performance: performanceReport,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching Redis pool stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Redis pool statistics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/redis-pool-stats/reset
 * Reset performance metrics
 */
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'reset') {
      redisMonitor.reset();
      return NextResponse.json({ 
        success: true, 
        message: 'Performance metrics reset successfully' 
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Use ?action=reset' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error resetting Redis stats:', error);
    return NextResponse.json(
      { error: 'Failed to reset statistics' },
      { status: 500 }
    );
  }
}