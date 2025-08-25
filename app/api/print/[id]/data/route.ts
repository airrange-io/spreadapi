import { NextRequest, NextResponse } from 'next/server';
import { getPrintJob } from '@/lib/print/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  
  try {
    // Get print job
    const job = await getPrintJob(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Print job not found' },
        { status: 404 }
      );
    }

    // Check if job has expired
    const expiresAt = new Date(job.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Print job has expired' },
        { status: 410 }
      );
    }

    // Return the job data for client-side PDF generation
    return NextResponse.json({
      serviceId: job.serviceId,
      inputs: job.inputs,
      printSettings: job.printSettings,
      metadata: job.metadata
    });
  } catch (error) {
    console.error('Error getting print job data:', error);
    return NextResponse.json(
      { error: 'Failed to get print job data' },
      { status: 500 }
    );
  }
}