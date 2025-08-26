import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'PDF ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the PDF data from Redis
    const pdfData = await redis.get(`pdf:${id}`);
    
    if (!pdfData) {
      return NextResponse.json(
        { error: 'PDF not found or expired' },
        { status: 404 }
      );
    }
    
    // Parse and return the data
    try {
      const data = JSON.parse(pdfData);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('Error parsing PDF data:', parseError);
      return NextResponse.json(
        { error: 'Invalid PDF data' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error retrieving PDF data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve PDF data' },
      { status: 500 }
    );
  }
}