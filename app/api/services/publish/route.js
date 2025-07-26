import { NextResponse } from 'next/server';
import { createOrUpdateService } from '@/lib/publishService';

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
    const { serviceId, publishData, tenant = userId } = body;
    
    if (!serviceId || !publishData) {
      return NextResponse.json(
        { error: 'serviceId and publishData are required' },
        { status: 400 }
      );
    }
    
    // Call the server-side function with userId
    const result = await createOrUpdateService(serviceId, publishData, tenant, userId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in publish API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish service' },
      { status: 500 }
    );
  }
}