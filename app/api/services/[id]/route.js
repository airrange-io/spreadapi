import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { revalidateServicesCache } from '@/lib/revalidateServices';
import { isDemoService, DEMO_USER_ID } from '@/lib/constants';

// GET /api/services/[id] - Get full service data
export async function GET(request, { params }) {
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
    
    // Get service data
    const serviceData = await redis.hGetAll(`service:${serviceId}`);
    
    if (!serviceData || Object.keys(serviceData).length === 0) {
      // Return 204 No Content for non-existent services (expected for new services)
      return new NextResponse(null, { status: 204 });
    }
    
    // Verify ownership (allow demo-user to access demo service)
    const isDemoAccess = userId === DEMO_USER_ID && isDemoService(serviceId);
    if (serviceData.userId !== userId && !isDemoAccess) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Check if published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    let publishedData = null;
    if (isPublished) {
      publishedData = await redis.hGetAll(`service:${serviceId}:published`);
    }
    
    // Parse JSON fields
    const response = {
      ...serviceData,
      inputs: JSON.parse(serviceData.inputs || '[]'),
      outputs: JSON.parse(serviceData.outputs || '[]'),
      areas: JSON.parse(serviceData.areas || '[]'),
      tags: serviceData.tags ? serviceData.tags.split(',').filter(t => t) : [],
      status: isPublished ? 'published' : 'draft',
      published: publishedData,
      // Parse AI metadata
      aiUsageExamples: (() => {
        try {
          return serviceData.aiUsageExamples ? JSON.parse(serviceData.aiUsageExamples) : [];
        } catch (e) {
          return [];
        }
      })(),
      aiTags: (() => {
        try {
          return serviceData.aiTags ? JSON.parse(serviceData.aiTags) : [];
        } catch (e) {
          return [];
        }
      })()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT /api/services/[id] - Update service
export async function PUT(request, { params }) {
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
    const body = await request.json();
    
    // Get existing service
    const existingService = await redis.hGetAll(`service:${serviceId}`);
    if (!existingService || Object.keys(existingService).length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (existingService.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const now = new Date().toISOString();
    
    // Prepare update data
    const updateData = {
      updatedAt: now
    };
    
    // Update simple fields
    const simpleFields = ['name', 'description', 'cacheEnabled', 'cacheDuration',
                         'requireToken', 'rateLimitRequests', 'rateLimitWindow', 'enableCaching',
                         'cacheTableSheetData', 'tableSheetCacheTTL',
                         'aiDescription', 'aiUsageGuidance', 'category', 'webAppEnabled', 'webAppToken'];
    simpleFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field].toString();
      }
    });
    
    // Update JSON fields
    if (body.inputs !== undefined) {
      updateData.inputs = JSON.stringify(body.inputs);
    }
    if (body.outputs !== undefined) {
      updateData.outputs = JSON.stringify(body.outputs);
    }
    if (body.areas !== undefined) {
      updateData.areas = JSON.stringify(body.areas);
    }
    if (body.aiUsageExamples !== undefined) {
      updateData.aiUsageExamples = JSON.stringify(body.aiUsageExamples);
    }
    if (body.aiTags !== undefined) {
      updateData.aiTags = JSON.stringify(body.aiTags);
    }
    
    // Update tags
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags) ? body.tags.join(',') : '';
    }
    
    // Update service
    await redis.hSet(`service:${serviceId}`, updateData);
    
    // No need to update the user's service index here - it only stores status
    // The status doesn't change when updating service details
    
    // Note: We don't update the published data - it remains as a snapshot
    
    // Revalidate services cache
    await revalidateServicesCache();
    
    return NextResponse.json({ 
      success: true,
      updatedAt: now
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}