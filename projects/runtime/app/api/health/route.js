import { NextResponse } from 'next/server';
import { listServices } from '@/lib/storage';
import { getAnalytics } from '@/lib/logger';
import { getCacheStats } from '@/lib/spreadjs';
import { getStats as getResultCacheStats } from '@/lib/resultCache';

export async function GET() {
  try {
    const services = await listServices();
    const analytics = getAnalytics();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        total: services.length,
        list: services.map(s => s.serviceId),
      },
      stats: analytics,
      cache: {
        workbook: getCacheStats(),
        result: getResultCacheStats(),
      },
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { status: 'unhealthy', error: err.message },
      { status: 500 }
    );
  }
}
