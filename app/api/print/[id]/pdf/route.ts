import { NextRequest, NextResponse } from 'next/server';
import { getPrintJob, updatePrintJobStatus } from '@/lib/print/redis';
import { 
  generatePDFFromWorkbook, 
  loadWorkbookFromJSON, 
  applyInputsToWorkbook 
} from '@/lib/pdf/generator';
import redis from '@/lib/redis';

// Helper to get service workbook data
async function getServiceWorkbook(serviceId: string): Promise<any> {
  try {
    // Try to get from Redis cache first
    const cachedData = await redis.get(`service:${serviceId}:workbook`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // If not in cache, load from service (you may need to adjust this based on your actual implementation)
    const serviceData = await redis.get(`service:${serviceId}`);
    if (!serviceData) {
      throw new Error('Service not found');
    }

    const service = JSON.parse(serviceData);
    return service.workbook || service.spreadsheet;
  } catch (error) {
    console.error('Error getting service workbook:', error);
    throw error;
  }
}

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

    // If PDF was already generated and cached, return it
    if (job.status === 'completed' && job.result?.pdfUrl) {
      // In a production environment, you would redirect to the cached PDF URL
      // For now, we'll regenerate it
    }

    // Update status to processing
    await updatePrintJobStatus(jobId, 'processing');

    try {
      // Get the service workbook data
      const workbookData = await getServiceWorkbook(job.serviceId);
      
      // Load workbook from JSON
      const workbook = await loadWorkbookFromJSON(workbookData);
      
      // Apply inputs to workbook
      await applyInputsToWorkbook(workbook, job.inputs);
      
      // Generate PDF
      const pdfBlob = await generatePDFFromWorkbook(
        workbook,
        job.printSettings || {
          orientation: 'portrait',
          fitToPage: true
        },
        {
          title: job.metadata?.title || 'SpreadAPI Report',
          subject: job.metadata?.description,
          creator: 'SpreadAPI PDF Generator'
        }
      );

      // Update job status to completed
      await updatePrintJobStatus(jobId, 'completed', {
        generatedAt: new Date().toISOString()
      });

      // Return PDF as response
      return new NextResponse(pdfBlob, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${job.metadata?.title || 'report'}.pdf"`,
          'Cache-Control': 'private, max-age=3600' // Cache for 1 hour
        }
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Update job status to failed
      await updatePrintJobStatus(
        jobId, 
        'failed', 
        undefined,
        error instanceof Error ? error.message : 'PDF generation failed'
      );
      
      return NextResponse.json(
        { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing print job:', error);
    return NextResponse.json(
      { error: 'Failed to process print job' },
      { status: 500 }
    );
  }
}