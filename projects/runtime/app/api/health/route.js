import { NextResponse } from 'next/server';
import { listServices } from '@/lib/storage';
import { getAnalytics } from '@/lib/logger';

// GET /api/health - Health check
export async function GET() {
  try {
    const services = await listServices();
    const analytics = getAnalytics();

    return NextResponse.json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        total: services.length,
        list: services.map(s => s.serviceId),
      },
      stats: analytics,
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
