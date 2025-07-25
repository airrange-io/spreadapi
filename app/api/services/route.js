import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { trackUserActivity } from '@/lib/userHashCache';
import { CACHE_KEYS } from '@/lib/cacheHelpers';
import { delBlob } from '@/lib/blob-client';
import { revalidateServicesCache } from '@/lib/revalidateServices';

// GET /api/services - List all services for user
export async function GET(request) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user's service index
    const serviceIndex = await redis.hGetAll(`user:${userId}:services`);
    const serviceIds = Object.keys(serviceIndex);
    
    if (serviceIds.length === 0) {
      return NextResponse.json({ services: [] });
    }
    
    // Parse service index data and build service list
    const services = [];
    
    // Get all service data with proper status and call counts
    for (const serviceId of Object.keys(serviceIndex)) {
      try {
        // Get actual service data from Redis
        const serviceData = await redis.hGetAll(`service:${serviceId}`);
        if (!serviceData || !serviceData.id) continue;
        
        // Check if service is published
        const isPublished = await redis.exists(`service:${serviceId}:published`) === 1;
        
        // Get call count from published hash if published
        let callCount = 0;
        if (isPublished) {
          const publishedCalls = await redis.hGet(`service:${serviceId}:published`, 'calls');
          callCount = parseInt(publishedCalls) || 0;
        }
        
        // Build service info with real-time status
        services.push({
          id: serviceData.id,
          name: serviceData.name || 'Untitled Service',
          description: serviceData.description || '',
          status: isPublished ? 'published' : 'draft',
          calls: callCount,
          createdAt: serviceData.createdAt,
          updatedAt: serviceData.updatedAt,
          lastUsed: null // This could be tracked separately if needed
        });
      } catch (error) {
        console.error(`Error processing service ${serviceId}:`, error);
        // Skip this service if there's an error
        continue;
      }
    }
    
    // Filter out nulls and sort by updatedAt descending
    const validServices = services.filter(s => s !== null);
    validServices.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // Track user activity
    await trackUserActivity(userId, 'viewed_services');
    
    // TEMPORARY: Disable all caching
    return NextResponse.json({ 
      services: validServices,
      _debug: {
        timestamp: Date.now(),
        count: validServices.length
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/services - Create new service
export async function POST(request) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    const { id, name, description } = body;
    
    console.log('[Services API] Creating service with ID:', id, 'for user:', userId);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    // Check if service already exists
    const exists = await redis.exists(`service:${id}`);
    if (exists) {
      return NextResponse.json(
        { error: 'Service already exists' },
        { status: 409 }
      );
    }
    
    // Get user's tenant ID
    const user = await redis.hGetAll(`user:${userId}`);
    const tenantId = user.tenantId || 'tenant1234';
    
    const now = new Date().toISOString();
    
    // Create service hash with all fields (no status field!)
    const serviceData = {
      id: id,
      userId: userId,
      name: name || 'Untitled Service',
      description: description || '',
      workbookUrl: '',
      workbookSize: '0',
      workbookModified: '',
      createdAt: now,
      updatedAt: now,
      
      // Empty inputs/outputs/areas as JSON strings
      inputs: '[]',
      outputs: '[]',
      areas: '[]',
      
      // Default settings
      cacheEnabled: 'true',
      cacheDuration: '300',
      requireToken: 'false',
      rateLimitRequests: '100',
      rateLimitWindow: '60',
      
      // Empty tags
      tags: '',
      
      // AI metadata
      aiDescription: '',
      aiUsageExamples: '[]',
      aiTags: '[]',
      category: ''
    };
    
    // Store service
    await redis.hSet(`service:${id}`, serviceData);
    
    // Add to user's services index with just the status
    await redis.hSet(`user:${userId}:services`, id, 'draft');
    
    // Track user activity
    await trackUserActivity(userId, `created_service:${id}`);
    
    return NextResponse.json({ 
      success: true,
      service: {
        ...serviceData,
        inputs: JSON.parse(serviceData.inputs),
        outputs: JSON.parse(serviceData.outputs)
      }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// DELETE /api/services?id=xxx - Delete service
export async function DELETE(request) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('id');
    
    console.log(`DELETE request for service: ${serviceId} by user: ${userId}`);
    
    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    // Check if service exists
    const serviceData = await redis.hGetAll(`service:${serviceId}`);
    if (!serviceData || Object.keys(serviceData).length === 0) {
      console.log(`Service ${serviceId} not found`);
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
    
    // Check if published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (isPublished) {
      return NextResponse.json(
        { error: 'Cannot delete published service. Unpublish first.' },
        { status: 400 }
      );
    }
    
    // Delete workbook from blob storage if it exists
    let workbookDeleted = false;
    if (serviceData.workbookUrl) {
      try {
        console.log(`Attempting to delete workbook blob: ${serviceData.workbookUrl}`);
        
        // Check if we have the blob token
        const token = process.env.VERCEL_BLOB_READ_WRITE_TOKEN || 
                     process.env.VERCELBLOB_READ_WRITE_TOKEN || 
                     process.env.BLOB_READ_WRITE_TOKEN;
        
        if (!token) {
          console.warn('Blob storage token not found, skipping workbook deletion');
        } else {
          await delBlob(serviceData.workbookUrl);
          workbookDeleted = true;
          console.log(`Successfully deleted workbook blob`);
        }
      } catch (error) {
        console.error('Error deleting workbook blob:', error);
        // Continue with service deletion even if blob deletion fails
      }
    }
    
    // Delete service hash
    await redis.del(`service:${serviceId}`);
    
    // Delete all caches for this service
    await redis.del(CACHE_KEYS.apiCache(serviceId));
    const resultKeys = await redis.keys(`service:${serviceId}:cache:result:*`);
    if (resultKeys.length > 0) {
      await redis.del(...resultKeys);
    }
    
    // Remove from user's services index
    await redis.hDel(`user:${userId}:services`, serviceId);
    
    // Revalidate services cache
    await revalidateServicesCache();
    
    return NextResponse.json({ 
      success: true,
      workbookDeleted 
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}