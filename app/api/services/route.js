import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

// For now, use a fixed test user
const TEST_USER_ID = 'test1234';

// GET /api/services - List all services for user
export async function GET(request) {
  try {
    
    // Get all service summaries for the user
    const summaries = await redis.hGetAll(`user:${TEST_USER_ID}:services`);
    
    // Parse each summary and convert to array
    const services = Object.entries(summaries).map(([id, data]) => ({
      id,
      ...JSON.parse(data)
    }));
    
    // Sort by updatedAt descending
    services.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    return NextResponse.json({ services });
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
    
    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    const now = new Date().toISOString();
    
    // Create service summary for list view
    const summary = {
      name: name || 'Untitled API',
      description: description || '',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      calls: 0,
      lastUsed: null
    };
    
    // Create full service data
    const fullData = {
      userId: TEST_USER_ID,
      file: null,
      inputs: [],
      outputs: [],
      metadata: {}
    };
    
    // Store in Redis (2 operations)
    await redis.hSet(
      `user:${TEST_USER_ID}:services`,
      id,
      JSON.stringify(summary)
    );
    
    await redis.set(
      `service:${id}`,
      JSON.stringify(fullData)
    );
    
    return NextResponse.json({ 
      id,
      ...summary,
      success: true 
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
    
    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    // Check if service exists and belongs to user
    const exists = await redis.hExists(`user:${TEST_USER_ID}:services`, serviceId);
    if (!exists) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Delete from both locations
    await redis.hDel(`user:${TEST_USER_ID}:services`, serviceId);
    await redis.del(`service:${serviceId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}