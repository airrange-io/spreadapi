import { NextRequest, NextResponse } from 'next/server';
import { getPrintJobStatus } from '@/lib/print/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    
    // Get print job status
    const status = await getPrintJobStatus(jobId);
    
    if (!status) {
      return NextResponse.json(
        { error: 'Print job not found' },
        { status: 404 }
      );
    }

    // Check if job has expired
    const expiresAt = new Date(status.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { 
          error: 'Print job has expired',
          jobId: status.jobId,
          status: 'expired',
          expiresAt: status.expiresAt
        },
        { status: 410 } // Gone
      );
    }

    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error('Error getting print job status:', error);
    return NextResponse.json(
      { error: 'Failed to get print job status' },
      { status: 500 }
    );
  }
}