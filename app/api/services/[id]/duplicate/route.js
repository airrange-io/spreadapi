import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { putBlob } from '@/lib/blob-client';
import { trackUserActivity, getUserStats } from '@/lib/userData';
import { getLicenseType, getLimits } from '@/lib/licensing';

// POST /api/services/[id]/duplicate - Duplicate a service
export async function POST(request, { params }) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: sourceId } = await params;

    // Check service limit
    const userData = await redis.hGetAll(`user:${userId}`);
    const licenseType = getLicenseType(userData?.licenseType);
    const limits = getLimits(licenseType);
    const stats = await getUserStats(userId);

    if (stats.services >= limits.maxServices) {
      return NextResponse.json(
        {
          error: 'Service limit reached',
          code: 'SERVICE_LIMIT_REACHED',
          message: `Your ${licenseType} plan allows ${limits.maxServices} service${limits.maxServices === 1 ? '' : 's'}. Upgrade your plan to create more.`,
          currentCount: stats.services,
          maxAllowed: limits.maxServices,
          licenseType,
        },
        { status: 403 }
      );
    }

    // Fetch source service
    const sourceData = await redis.hGetAll(`service:${sourceId}`);

    if (!sourceData || Object.keys(sourceData).length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (sourceData.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate new ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const newId = `${userId}_${timestamp}${random}`;
    const now = new Date().toISOString();

    // Copy workbook blob if it exists
    let newWorkbookUrl = '';
    if (sourceData.workbookUrl) {
      try {
        const blobResponse = await fetch(sourceData.workbookUrl);
        if (blobResponse.ok) {
          const blobData = await blobResponse.arrayBuffer();
          const ext = sourceData.workbookUrl.includes('.sjs') ? 'sjs' : 'json';
          const result = await putBlob(
            `users/${userId}/workbooks/${newId}.${ext}`,
            Buffer.from(blobData),
            { access: 'public', addRandomSuffix: false }
          );
          newWorkbookUrl = result.url;
        }
      } catch (err) {
        console.error('[Duplicate] Failed to copy workbook blob:', err);
        // Continue without workbook - user can re-upload
      }
    }

    // Build new service data
    const newServiceData = {
      ...sourceData,
      id: newId,
      userId,
      name: `${sourceData.name} (Copy)`,
      workbookUrl: newWorkbookUrl,
      workbookModified: newWorkbookUrl ? now : '',
      createdAt: now,
      updatedAt: now,
      // Reset webhook (user should configure fresh)
      webhookUrl: '',
      webhookSecret: '',
      // Reset web app token
      webAppToken: '',
    };

    // Store new service
    await redis.hSet(`service:${newId}`, newServiceData);

    // Add to user's service index as draft
    await redis.hSet(`user:${userId}:services`, newId, 'draft');

    // Track activity
    await trackUserActivity(userId, `duplicated_service:${sourceId}:to:${newId}`);

    return NextResponse.json({
      success: true,
      service: {
        ...newServiceData,
        inputs: JSON.parse(newServiceData.inputs || '[]').map(i => ({ ...i, mandatory: i.mandatory !== false })),
        outputs: JSON.parse(newServiceData.outputs || '[]'),
        areas: JSON.parse(newServiceData.areas || '[]'),
      },
    });
  } catch (error) {
    console.error('[Duplicate] Error duplicating service:', error);
    return NextResponse.json({ error: 'Failed to duplicate service' }, { status: 500 });
  }
}
