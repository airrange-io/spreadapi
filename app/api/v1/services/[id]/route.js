import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

/**
 * GET /api/v1/services/{id} - Get service details
 * PUT /api/v1/services/{id} - Update service metadata (name, description, tags only)
 * DELETE /api/v1/services/{id} - Delete service (unpublished only)
 */

// GET - Get service details
export async function GET(request, { params }) {
  try {
    const { id: serviceId } = await params;
    const userId = request.headers.get('x-user-id');
    const isPublicAccess = request.headers.get('x-public-access') === 'true';
    
    // Check if service is published (for public access)
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    
    // If no user ID and service is not published, require auth
    if (!userId && !isPublished) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'User authentication required'
      }, { status: 401 });
    }
    
    // For public access, only show published services
    if (isPublicAccess && !isPublished) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Service not found or not published'
      }, { status: 404 });
    }

    // For authenticated users, check ownership
    if (userId) {
      const userServices = await redis.hGetAll(`user:${userId}:services`);
      if (!userServices[serviceId] && !isPublished) {
        return NextResponse.json({
          error: 'Not found',
          message: 'Service not found or you do not have access to it'
        }, { status: 404 });
      }
    }

    // Get service metadata
    let metadata = {};
    
    // For public access to published services, metadata is optional
    if (isPublicAccess && isPublished) {
      metadata = await redis.hGetAll(`service:${serviceId}:metadata`) || {};
      if (!metadata.id) {
        metadata.id = serviceId;
      }
    } else {
      // For authenticated access, we need metadata
      metadata = await redis.hGetAll(`service:${serviceId}:metadata`);
      if (!metadata || !metadata.id) {
        // Try alternative keys that might be used
        const altMetadata = await redis.hGetAll(`services:${serviceId}`);
        if (!altMetadata || Object.keys(altMetadata).length === 0) {
          return NextResponse.json({
            error: 'Not found',
            message: 'Service metadata not found',
            debug: {
              serviceId,
              metadataKey: `service:${serviceId}:metadata`,
              altKey: `services:${serviceId}`,
              userId
            }
          }, { status: 404 });
        }
        // If we found data in the alternative location, use it
        metadata = { id: serviceId, ...altMetadata };
      }
    }

    // Get published data if available
    const publishedData = isPublished ? await redis.hGetAll(`service:${serviceId}:published`) : null;

    // Get areas if defined
    let areas = [];
    if (publishedData?.areas) {
      try {
        areas = JSON.parse(publishedData.areas);
      } catch (e) {
        console.error('Error parsing areas:', e);
      }
    }

    // Get API definition
    let apiDefinition = null;
    if (publishedData?.inputs && publishedData?.outputs) {
      try {
        apiDefinition = {
          inputs: JSON.parse(publishedData.inputs),
          outputs: JSON.parse(publishedData.outputs)
        };
      } catch (e) {
        console.error('Error parsing API definition:', e);
      }
    }

    // Build response based on access level
    let response;
    
    if (isPublicAccess) {
      // Limited information for public access
      response = {
        id: serviceId,
        name: publishedData?.title || 'Untitled Service',
        description: publishedData?.description || '',
        status: 'published',
        endpoint: `https://spreadapi.io/api/v1/services/${serviceId}/execute`,
        requiresToken: publishedData?.needsToken === 'true',
        ...(apiDefinition && {
          inputs: apiDefinition.inputs.map(i => ({
            name: i.alias || i.name,
            type: i.type || 'any',
            required: i.mandatory !== false,
            description: i.description || ''
          })),
          outputs: apiDefinition.outputs.map(o => ({
            name: o.alias || o.name,
            type: o.type || 'any',
            description: o.description || '',
            ...(o.formatString && { formatString: o.formatString })
          }))
        })
      };
    } else {
      // Full information for authenticated users
      response = {
        id: serviceId,
        name: metadata.name || publishedData?.title || 'Untitled Service',
        description: metadata.description || publishedData?.description || '',
        status: isPublished ? 'published' : 'draft',
        createdAt: metadata.createdAt || metadata.created,
        updatedAt: metadata.updatedAt || metadata.modified,
        tags: metadata.tags ? JSON.parse(metadata.tags) : [],
        
        // Published-specific data
        ...(isPublished && {
          published: {
            url: publishedData.urlData,
            needsToken: publishedData.needsToken === 'true',
            useCaching: publishedData.useCaching === 'true',
            calls: parseInt(publishedData.calls || '0'),
            publishedAt: publishedData.publishedAt || publishedData.created,
            apiDefinition,
            areas
          }
        })
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error getting service:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

// PUT - Update service metadata only
export async function PUT(request, { params }) {
  try {
    const { id: serviceId } = await params;
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'User authentication required'
      }, { status: 401 });
    }

    // Check if user owns this service
    const userServices = await redis.hGetAll(`user:${userId}:services`);
    if (!userServices[serviceId]) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Service not found'
      }, { status: 404 });
    }

    const body = await request.json();
    
    // Only allow metadata updates
    const allowedFields = ['name', 'description', 'tags'];
    const unknownFields = Object.keys(body).filter(key => !allowedFields.includes(key));
    
    if (unknownFields.length > 0) {
      return NextResponse.json({
        error: 'Bad request',
        message: `Only metadata updates are allowed. Unknown fields: ${unknownFields.join(', ')}`,
        allowedFields
      }, { status: 400 });
    }
    
    const updates = {};

    // Validate and prepare updates
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({
          error: 'Bad request',
          message: 'Service name must be a non-empty string'
        }, { status: 400 });
      }
      updates.name = body.name.substring(0, 100);
    }

    if (body.description !== undefined) {
      updates.description = String(body.description).substring(0, 500);
    }

    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return NextResponse.json({
          error: 'Bad request',
          message: 'Tags must be an array'
        }, { status: 400 });
      }
      updates.tags = JSON.stringify(body.tags);
    }

    // Only update if there are changes
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        error: 'Bad request',
        message: 'No valid fields to update'
      }, { status: 400 });
    }

    // Update timestamp
    updates.updatedAt = new Date().toISOString();

    // Update metadata in Redis
    await redis.hSet(`service:${serviceId}:metadata`, updates);

    // Get updated service data
    const metadata = await redis.hGetAll(`service:${serviceId}:metadata`);
    const isPublished = await redis.exists(`service:${serviceId}:published`);

    return NextResponse.json({
      id: serviceId,
      name: metadata.name,
      description: metadata.description,
      status: isPublished ? 'published' : 'draft',
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
      tags: metadata.tags ? JSON.parse(metadata.tags) : []
    });

  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete service
export async function DELETE(request, { params }) {
  try {
    const { id: serviceId } = await params;
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'User authentication required'
      }, { status: 401 });
    }

    // Check if user owns this service
    const userServices = await redis.hGetAll(`user:${userId}:services`);
    if (!userServices[serviceId]) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Service not found'
      }, { status: 404 });
    }

    // Check if service is published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (isPublished) {
      return NextResponse.json({
        error: 'Conflict',
        message: 'Cannot delete published service. Unpublish it first.'
      }, { status: 409 });
    }

    // Delete all service data
    const keysToDelete = [
      `service:${serviceId}:metadata`,
      `service:${serviceId}:workbook`,
      `service:${serviceId}:areas`,
      `service:${serviceId}:cache`,
      `service:${serviceId}:tokens`
    ];

    await Promise.all([
      ...keysToDelete.map(key => redis.del(key)),
      redis.hDel(`user:${userId}:services`, serviceId)
    ]);

    return NextResponse.json({
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}