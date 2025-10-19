import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { CACHE_KEYS } from '@/lib/cacheHelpers';
import { revalidateServicesCache } from '@/lib/revalidateServices';

export async function POST(request, { params }) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id: serviceId } = await params;
    
    // Get service data to verify ownership
    const serviceData = await redis.hGetAll(`service:${serviceId}`);
    
    if (!serviceData || Object.keys(serviceData).length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (serviceData.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
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
        const { delBlob } = await import('@/lib/blob-client');
        await delBlob(publishedData.urlData);
      } catch (error) {
        console.warn('Failed to delete blob:', error);
      }
    }
    
    // Delete published data and caches in single round-trip
    const multi = redis.multi();
    multi.del(`service:${serviceId}:published`);
    multi.del(CACHE_KEYS.apiCache(serviceId));
    multi.del(CACHE_KEYS.resultCache(serviceId));
    multi.hSet(`user:${userId}:services`, serviceId, 'draft');
    await multi.exec();
    
    // Revalidate services cache
    await revalidateServicesCache();
    
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