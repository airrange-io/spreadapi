import redis from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Test Redis connectivity
    const start = Date.now();
    await redis.ping();
    const redisLatency = Date.now() - start;

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      redis: {
        connected: true,
        latency: `${redisLatency}ms`
      }
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      redis: {
        connected: false,
        error: error.message
      }
    }, { status: 500 });
  }
}
