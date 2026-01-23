import { NextResponse } from 'next/server';
import { saveService } from '@/lib/storage';
import { clearCache } from '@/lib/calculate';

// POST /api/upload - Upload a service JSON
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let data;

    if (contentType.includes('multipart/form-data')) {
      // File upload
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      const content = await file.text();
      try {
        data = JSON.parse(content);
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON file' },
          { status: 400 }
        );
      }
    } else {
      // JSON body
      data = await request.json();
    }

    // Validate required fields
    if (!data.apiJson && !data.fileJson) {
      return NextResponse.json(
        { error: 'Invalid service data. Expected apiJson and fileJson.' },
        { status: 400 }
      );
    }

    // Generate serviceId if not provided
    const serviceId = data.serviceId || data.apiJson?.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `service-${Date.now()}`;

    // Build service object
    const service = {
      serviceId,
      name: data.apiJson?.name || data.name || serviceId,
      title: data.apiJson?.title || data.title || 'Untitled Service',
      description: data.apiJson?.description || data.description || '',
      apiJson: data.apiJson,
      fileJson: data.fileJson,
      uploadedAt: new Date().toISOString(),
    };

    // Save to storage
    await saveService(serviceId, service);

    // Clear any cached workbook
    clearCache(serviceId);

    return NextResponse.json({
      success: true,
      serviceId,
      message: `Service "${service.title}" uploaded successfully`,
      endpoints: {
        execute: `/api/execute/${serviceId}`,
        info: `/api/services/${serviceId}`,
      },
    });

  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Upload failed', message: err.message },
      { status: 500 }
    );
  }
}
