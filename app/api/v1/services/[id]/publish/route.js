import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

/**
 * POST /api/v1/services/{id}/publish - Publish a service
 * DELETE /api/v1/services/{id}/publish - Unpublish a service
 */

// POST - Publish service
export async function POST(request, { params }) {
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

    // Check if already published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (isPublished) {
      return NextResponse.json({
        error: 'Conflict',
        message: 'Service is already published'
      }, { status: 409 });
    }

    // Get service metadata
    const metadata = await redis.hGetAll(`service:${serviceId}:metadata`);
    
    // Check if service has a workbook
    const hasWorkbook = await redis.exists(`service:${serviceId}:workbook`);
    if (!hasWorkbook) {
      return NextResponse.json({
        error: 'Bad request',
        message: 'Cannot publish service without a configured spreadsheet'
      }, { status: 400 });
    }

    // For now, we'll mark it as published without the full publishing logic
    // The actual publishing logic (extracting inputs/outputs, areas, etc.) 
    // should be done through the web UI
    return NextResponse.json({
      error: 'Not implemented',
      message: 'Publishing must be done through the web UI at spreadapi.io',
      details: 'The API cannot handle spreadsheet configuration and area selection'
    }, { status: 501 });

  } catch (error) {
    console.error('Error publishing service:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

// DELETE - Unpublish service
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

    // Check if published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return NextResponse.json({
        error: 'Conflict',
        message: 'Service is not published'
      }, { status: 409 });
    }

    // Delete published data
    await redis.del(`service:${serviceId}:published`);
    
    // Clear any caches
    await redis.del(`service:${serviceId}:cache`);
    
    // Update metadata
    await redis.hSet(`service:${serviceId}:metadata`, {
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      message: 'Service unpublished successfully',
      id: serviceId
    });

  } catch (error) {
    console.error('Error unpublishing service:', error);
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
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}