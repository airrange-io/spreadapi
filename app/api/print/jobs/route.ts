import { NextRequest, NextResponse } from 'next/server';
import { createPrintJob, getUserPrintJobs } from '@/lib/print/redis';
import type { PrintJobResponse } from '@/lib/print/types';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request headers or session
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    // Parse request body
    const body = await request.json();
    const { serviceId, inputs, printSettings, metadata } = body;

    // Validate required fields
    if (!serviceId || !inputs) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId and inputs' },
        { status: 400 }
      );
    }

    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || undefined;

    // Create print job
    const printJob = await createPrintJob({
      serviceId,
      userId,
      inputs,
      token,
      printSettings: printSettings || {
        orientation: 'portrait',
        fitToPage: true
      },
      metadata: metadata || {
        title: 'SpreadAPI Report'
      }
    });

    // Build response with correct URL for development/production
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000'
      : (process.env.NEXT_PUBLIC_BASE_URL || 'https://spreadapi.io');
    
    const response: PrintJobResponse = {
      jobId: printJob.id,
      printUrl: `${baseUrl}/print/${printJob.id}`,
      expiresAt: printJob.expiresAt,
      message: 'Print link created successfully'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating print job:', error);
    return NextResponse.json(
      { error: 'Failed to create print job' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request headers or session
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    // Get user's print jobs
    const jobIds = await getUserPrintJobs(userId);

    return NextResponse.json({ jobIds }, { status: 200 });
  } catch (error) {
    console.error('Error getting print jobs:', error);
    return NextResponse.json(
      { error: 'Failed to get print jobs' },
      { status: 500 }
    );
  }
}