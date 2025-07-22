import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { CACHE_KEYS } from '@/lib/cacheHelpers';
import { delBlob } from '@/lib/blob-client';
import { revalidateServicesCache } from '@/lib/revalidateServices';

// For now, use a fixed test user
const TEST_USER_ID = 'test1234';

// GET /api/services - List all services for user
export async function GET(request) {
  try {
    // Get user's service index
    const serviceIndex = await redis.hGetAll(`user:${TEST_USER_ID}:services`);
    const serviceIds = Object.keys(serviceIndex);
    
    if (serviceIds.length === 0) {
      return NextResponse.json({ services: [] });
    }
    
    // Parse service index data and build service list
    const services = [];
    
    for (const [serviceId, indexData] of Object.entries(serviceIndex)) {
      try {
        // Parse JSON data from index
        const serviceInfo = typeof indexData === 'string' ? JSON.parse(indexData) : indexData;
        services.push(serviceInfo);
      } catch (error) {
        console.error(`Error processing service ${serviceId}:`, error);
        // Skip this service if there's an error
        continue;
      }
    }
    
    // Filter out nulls and sort by updatedAt descending
    const validServices = services.filter(s => s !== null);
    validServices.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
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
    const body = await request.json();
    
    const { id, name, description } = body;
    
    console.log('[Services API] Creating service with ID:', id);
    
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
    const user = await redis.hGetAll(`user:${TEST_USER_ID}`);
    const tenantId = user.tenantId || 'tenant1234';
    
    const now = new Date().toISOString();
    
    // Create service hash with all fields (no status field!)
    const serviceData = {
      id: id,
      userId: TEST_USER_ID,
      name: name || 'Untitled Service',
      description: description || '',
      workbookUrl: '',
      workbookSize: '0',
      workbookModified: '',
      createdAt: now,
      updatedAt: now,
      
      // Empty inputs/outputs as JSON strings
      inputs: '[]',
      outputs: '[]',
      
      // Default settings
      cacheEnabled: 'true',
      cacheDuration: '300',
      requireToken: 'false',
      rateLimitRequests: '100',
      rateLimitWindow: '60',
      
      // Empty tags
      tags: ''
    };
    
    // Store service
    await redis.hSet(`service:${id}`, serviceData);
    
    // Add to user's services index with full overview data
    const indexData = {
      id: id,
      name: serviceData.name,
      description: serviceData.description,
      status: 'draft',
      createdAt: serviceData.createdAt,
      updatedAt: serviceData.updatedAt,
      publishedAt: null,
      calls: 0,
      lastUsed: null,
      workbookUrl: serviceData.workbookUrl
    };
    await redis.hSet(`user:${TEST_USER_ID}:services`, id, JSON.stringify(indexData));
    
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
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('id');
    
    console.log(`DELETE request for service: ${serviceId}`);
    
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
    if (serviceData.userId !== TEST_USER_ID) {
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
    await redis.hDel(`user:${TEST_USER_ID}:services`, serviceId);
    
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