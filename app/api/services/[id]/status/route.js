import { NextResponse } from 'next/server';
import { getServiceStatus } from '@/lib/publishService';
import redis from '@/lib/redis';

export async function GET(request, { params }) {
  try {
    const { id: serviceId } = await params;
    
    // Get service definition to check ownership and get updated timestamp
    const serviceData = await redis.hGetAll(`service:${serviceId}`);
    if (!serviceData || Object.keys(serviceData).length === 0) {
      return NextResponse.json({ published: false, status: 'not_found' });
    }
    
    // Get published status
    const status = await getServiceStatus(serviceId);
    
    // Check for unpublished changes
    if (status.published && serviceData.updatedAt > status.lastModified) {
      status.hasUnpublishedChanges = true;
    }
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching service status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service status' },
      { status: 500 }
    );
  }
}