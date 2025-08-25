import { NextRequest, NextResponse } from 'next/server';
import { getPrintJob, getPrintJobStatus, deletePrintJob } from '@/lib/print/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    
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
        { status: 410 } // Gone
      );
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error('Error getting print job:', error);
    return NextResponse.json(
      { error: 'Failed to get print job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    
    // Get user ID from request headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }
    
    // Get print job to check ownership
    const job = await getPrintJob(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Print job not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the job
    if (job.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this print job' },
        { status: 403 }
      );
    }
    
    // Delete the job
    const deleted = await deletePrintJob(jobId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete print job' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Print job deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting print job:', error);
    return NextResponse.json(
      { error: 'Failed to delete print job' },
      { status: 500 }
    );
  }
}