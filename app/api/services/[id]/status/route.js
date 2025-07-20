import { NextResponse } from 'next/server';
import { getServiceStatus } from '@/lib/publishService';

export async function GET(request, { params }) {
  try {
    const { id: serviceId } = await params;
    
    const status = await getServiceStatus(serviceId);
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching service status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service status' },
      { status: 500 }
    );
  }
}