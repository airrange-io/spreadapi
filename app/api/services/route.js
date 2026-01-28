import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { trackUserActivity, getUserStats } from '@/lib/userData';
import { CACHE_KEYS } from '@/lib/cacheHelpers';
import { delBlob } from '@/lib/blob-client';
import { revalidateServicesCache } from '@/lib/revalidateServices';
import { getLicenseType, getLimits } from '@/lib/licensing';

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
    
    // Use Redis multi for batch operations
    const multi = redis.multi();
    
    // Queue all Redis commands
    for (const serviceId of serviceIds) {
      multi.hGetAll(`service:${serviceId}`);
      multi.exists(`service:${serviceId}:published`);
      multi.hGet(`service:${serviceId}:published`, 'calls');
    }
    
    // Execute all commands at once
    const results = await multi.exec();
    
    // Process results (3 results per service)
    for (let i = 0; i < serviceIds.length; i++) {
      try {
        const baseIndex = i * 3;
        const serviceData = results[baseIndex];
        const isPublished = results[baseIndex + 1] === 1;
        
        console.log('[Services API] Processing service:', {
          serviceId: serviceIds[i],
          name: serviceData?.name,
          isPublished
        });
        const publishedCalls = results[baseIndex + 2];
        
        if (!serviceData || !serviceData.id) continue;
        
        // Build service info with real-time status
        services.push({
          id: serviceData.id,
          name: serviceData.name || 'Untitled Service',
          description: serviceData.description || '',
          status: isPublished ? 'published' : 'draft',
          calls: isPublished ? (parseInt(publishedCalls) || 0) : 0,
          createdAt: serviceData.createdAt,
          updatedAt: serviceData.updatedAt,
          lastUsed: null // This could be tracked separately if needed
        });
      } catch (error) {
        console.error(`Error processing service ${serviceIds[i]}:`, error);
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

    // Check service count limit based on user's license
    const userData = await redis.hGetAll(`user:${userId}`);
    const licenseType = getLicenseType(userData?.licenseType);
    const limits = getLimits(licenseType);
    const stats = await getUserStats(userId);

    console.log('[Services API] License check:', { userId, licenseType, maxServices: limits.maxServices, currentServices: stats.services });

    if (stats.services >= limits.maxServices) {
      console.log('[Services API] Service limit reached for user:', userId);
      return NextResponse.json(
        {
          error: 'Service limit reached',
          code: 'SERVICE_LIMIT_REACHED',
          message: `Your ${licenseType} plan allows ${limits.maxServices} service${limits.maxServices === 1 ? '' : 's'}. Upgrade your plan to create more.`,
          currentCount: stats.services,
          maxAllowed: limits.maxServices,
          licenseType
        },
        { status: 403 }
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
    
    // Delete service and all caches in single round-trip
    const multi = redis.multi();
    multi.del(`service:${serviceId}`);
    multi.del(CACHE_KEYS.apiCache(serviceId));
    multi.del(CACHE_KEYS.resultCache(serviceId));
    multi.hDel(`user:${userId}:services`, serviceId);
    await multi.exec();
    
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