import { NextResponse } from 'next/server';
import { createOrUpdateService } from '@/lib/publishService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { serviceId, publishData, tenant = 'test1234' } = body;
    
    if (!serviceId || !publishData) {
      return NextResponse.json(
        { error: 'serviceId and publishData are required' },
        { status: 400 }
      );
    }
    
    // Call the server-side function
    const result = await createOrUpdateService(serviceId, publishData, tenant);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in publish API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish service' },
      { status: 500 }
    );
  }
}