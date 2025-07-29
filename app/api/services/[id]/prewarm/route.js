import { NextResponse } from 'next/server';
import { prewarmService } from '@/lib/prewarmService';
import redis from '@/lib/redis';

/**
 * Prewarm a service by loading its workbook into cache
 * POST /api/services/{id}/prewarm
 */
export async function POST(request, { params }) {
  try {
    const { id: serviceId } = await params;
    
    // Check if service exists and is published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return NextResponse.json({
        error: 'Service not found or not published'
      }, { status: 404 });
    }
    
    // Get force refresh flag from body
    let forceRefresh = false;
    try {
      const body = await request.json();
      forceRefresh = body.forceRefresh === true;
    } catch {
      // No body or invalid JSON is fine, use default
    }
    
    // Prewarm the service
    const result = await prewarmService(serviceId, forceRefresh);
    
    return NextResponse.json({
      serviceId,
      ...result
    });
    
  } catch (error) {
    console.error('Prewarm error:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}