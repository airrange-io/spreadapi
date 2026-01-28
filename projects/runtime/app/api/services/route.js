import { NextResponse } from 'next/server';
import { listServices, getService, deleteService } from '@/lib/storage';
import { clearCache } from '@/lib/calculate';

// GET /api/services - List all services
export async function GET() {
  try {
    const services = await listServices();
    return NextResponse.json({
      services,
      total: services.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to list services', message: err.message },
      { status: 500 }
    );
  }
}

// DELETE /api/services?id=xxx - Delete a service
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('id');

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing service ID' },
        { status: 400 }
      );
    }

    const deleted = await deleteService(serviceId);
    if (deleted) {
      clearCache(serviceId);
      return NextResponse.json({ success: true, serviceId });
    } else {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to delete service', message: err.message },
      { status: 500 }
    );
  }
}
