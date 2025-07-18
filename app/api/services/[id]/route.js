import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

const TEST_USER_ID = 'test1234';

// GET /api/services/[id] - Get full service data
export async function GET(request, { params }) {
  try {
    const serviceId = params.id;
    
    // Check if user has access to this service
    const summary = await redis.hGet(`user:${TEST_USER_ID}:services`, serviceId);
    if (!summary) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Get full service data
    const fullData = await redis.get(`service:${serviceId}`);
    if (!fullData) {
      return NextResponse.json(
        { error: 'Service data not found' },
        { status: 404 }
      );
    }
    
    // Combine summary and full data
    const service = {
      id: serviceId,
      ...JSON.parse(summary),
      ...JSON.parse(fullData)
    };
    
    return NextResponse.json(service);
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
    const serviceId = params.id;
    const body = await request.json();
    
    // Check if user has access to this service
    const existingSummary = await redis.hGet(`user:${TEST_USER_ID}:services`, serviceId);
    if (!existingSummary) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    const now = new Date().toISOString();
    const parsedSummary = JSON.parse(existingSummary);
    
    // Update summary data if provided
    if (body.name !== undefined || body.description !== undefined || body.status !== undefined) {
      const updatedSummary = {
        ...parsedSummary,
        name: body.name !== undefined ? body.name : parsedSummary.name,
        description: body.description !== undefined ? body.description : parsedSummary.description,
        status: body.status !== undefined ? body.status : parsedSummary.status,
        updatedAt: now
      };
      
      await redis.hSet(
        `user:${TEST_USER_ID}:services`,
        serviceId,
        JSON.stringify(updatedSummary)
      );
    }
    
    // Update full data if provided
    if (body.file !== undefined || body.inputs !== undefined || body.outputs !== undefined) {
      const existingFullData = await redis.get(`service:${serviceId}`);
      const parsedFullData = existingFullData ? JSON.parse(existingFullData) : {};
      
      const updatedFullData = {
        ...parsedFullData,
        file: body.file !== undefined ? body.file : parsedFullData.file,
        inputs: body.inputs !== undefined ? body.inputs : parsedFullData.inputs,
        outputs: body.outputs !== undefined ? body.outputs : parsedFullData.outputs,
        metadata: body.metadata !== undefined ? body.metadata : parsedFullData.metadata
      };
      
      await redis.set(
        `service:${serviceId}`,
        JSON.stringify(updatedFullData)
      );
    }
    
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