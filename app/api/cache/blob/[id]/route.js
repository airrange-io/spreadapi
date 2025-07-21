import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { CACHE_KEYS } from '@/lib/cacheHelpers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Try to get from cache first
    const cacheKey = CACHE_KEYS.apiCache(id);
    const cached = await redis.json.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    // If not in cache, return 404
    return NextResponse.json(
      { error: 'Cache not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching cache:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache' },
      { status: 500 }
    );
  }
}