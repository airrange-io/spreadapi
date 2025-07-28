import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

/**
 * GET /api/v1/services - List published services available for execution
 * 
 * This endpoint is designed for API consumers to discover available services.
 * By default, only returns published services.
 */

// GET - List published services
export async function GET(request) {
  try {
    // Get user ID from middleware (optional for public access)
    const userId = request.headers.get('x-user-id');
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true'; // Only for authenticated users
    const sort = searchParams.get('sort') || 'name'; // name, calls, updatedAt
    const order = searchParams.get('order') || 'asc'; // asc, desc
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let serviceIds = [];
    
    if (userId) {
      // If authenticated, show user's services (including drafts if includeAll)
      const userServices = await redis.hGetAll(`user:${userId}:services`);
      serviceIds = Object.keys(userServices);
    } else {
      // If not authenticated, show all published services
      const publishedKeys = [];
      let cursor = '0';
      
      do {
        const result = await redis.scan(cursor, {
          MATCH: 'service:*:published',
          COUNT: 100
        });
        cursor = result.cursor;
        publishedKeys.push(...result.keys);
      } while (cursor !== '0');
      
      console.log('[v1/services] Found published keys:', publishedKeys);
      serviceIds = publishedKeys.map(key => key.replace('service:', '').replace(':published', ''));
      console.log('[v1/services] Service IDs:', serviceIds);
    }

    // Fetch service details
    const services = [];
    for (const serviceId of serviceIds) {
      const serviceData = await redis.hGetAll(`service:${serviceId}:metadata`);
      console.log(`[v1/services] Metadata for ${serviceId}:`, serviceData ? 'found' : 'not found');
      
      if (!serviceData || !serviceData.id) {
        // If no metadata, try basic service data
        const basicData = await redis.hGetAll(`service:${serviceId}`);
        if (basicData && basicData.tenantId) {
          serviceData.id = serviceId;
          serviceData.name = basicData.name || 'Untitled';
          serviceData.description = basicData.description || '';
          serviceData.createdAt = basicData.createdAt;
          serviceData.updatedAt = basicData.updatedAt;
        } else {
          console.log(`[v1/services] No data found for service ${serviceId}`);
          continue;
        }
      }

      // Check if service is published
      const isPublished = await redis.exists(`service:${serviceId}:published`);
      
      // For non-authenticated users, only show published services
      if (!userId && !isPublished) {
        continue;
      }
      
      // For authenticated users, skip draft services unless includeAll is true
      if (userId && !isPublished && !includeAll) {
        continue;
      }
      
      serviceData.status = isPublished ? 'published' : 'draft';

      // Get usage stats
      const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
      serviceData.calls = parseInt(publishedData.calls || '0');

      // For published services, get API definition
      let apiDefinition = null;
      if (isPublished && publishedData.inputs && publishedData.outputs) {
        try {
          apiDefinition = {
            inputs: JSON.parse(publishedData.inputs),
            outputs: JSON.parse(publishedData.outputs)
          };
        } catch (e) {}
      }

      services.push({
        id: serviceData.id,
        name: publishedData.title || serviceData.name || 'Untitled Service',
        description: publishedData.description || serviceData.description || '',
        status: serviceData.status,
        endpoint: `https://spreadapi.io/api/v1/services/${serviceData.id}/execute`,
        calls: serviceData.calls,
        inputs: apiDefinition?.inputs?.map(i => i.name) || [],
        outputs: apiDefinition?.outputs?.map(o => o.name) || [],
        tags: serviceData.tags ? JSON.parse(serviceData.tags) : []
      });
    }

    // Sort services
    services.sort((a, b) => {
      let comparison = 0;
      switch (sort) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return order === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const paginatedServices = services.slice(offset, offset + limit);

    return NextResponse.json({
      services: paginatedServices,
      pagination: {
        total: services.length,
        limit,
        offset,
        hasMore: offset + limit < services.length
      }
    });

  } catch (error) {
    console.error('Error listing services:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

// Note: Service creation is done through the web UI only
// The API focuses on service discovery and execution

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}