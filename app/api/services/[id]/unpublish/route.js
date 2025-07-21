import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { CACHE_KEYS } from '@/lib/cacheHelpers';

// For now, use a fixed test user
const TEST_USER_ID = 'test1234';

export async function POST(request, { params }) {
  try {
    const { id: serviceId } = await params;
    
    // Check if service is published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    
    if (!isPublished) {
      return NextResponse.json(
        { error: 'Service is not published' },
        { status: 400 }
      );
    }
    
    // Get blob URL to delete
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
    if (publishedData.urlData) {
      try {
        const { del } = await import('@/lib/blob-client');
        await del(publishedData.urlData);
      } catch (error) {
        console.warn('Failed to delete blob:', error);
      }
    }
    
    // Delete the published service data
    await redis.del(`service:${serviceId}:published`);
    
    // Delete the legacy structure for calculation engine
    await redis.del(`service:${serviceId}`);
    
    // Also delete the cached API data if it exists
    await redis.del(CACHE_KEYS.apiCache(serviceId));
    
    // Delete all cached results for this service
    const resultKeys = await redis.keys(`service:${serviceId}:cache:result:*`);
    if (resultKeys.length > 0) {
      await redis.del(...resultKeys);
    }
    
    // Update the user's service index
    await redis.hSet(`user:${TEST_USER_ID}:services`, serviceId, 'draft');
    
    return NextResponse.json({ 
      success: true,
      message: 'Service unpublished successfully'
    });
    
  } catch (error) {
    console.error('Error unpublishing service:', error);
    return NextResponse.json(
      { error: 'Failed to unpublish service' },
      { status: 500 }
    );
  }
}