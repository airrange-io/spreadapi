import { NextResponse, type NextRequest } from 'next/server';
import { makePipedreamClient } from '@/lib/pipedream/client';
import { verifyAuth } from '@/lib/pipedream/auth';
import { userHasPipedreamAccess } from '@/lib/pipedream/premium';

// POST — generate a short-lived Connect token for the current user.
// This is the ONLY gated endpoint on the Pipedream path: it's what opens a
// new OAuth connection (billable). Free users can still browse apps/components
// and use existing connections — only creating a NEW account is Premium.
export async function POST(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await userHasPipedreamAccess(userId);
  if (!hasAccess) {
    return NextResponse.json(
      {
        ok: false,
        error: 'premium_required',
        message: 'Connecting new apps requires a Premium plan.',
      },
      { status: 403 },
    );
  }

  try {
    const pd = makePipedreamClient();
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = Array.from(
      new Set(
        [
          origin,
          'http://localhost:3000',
          'http://localhost:3001',
          process.env.NEXT_PUBLIC_URL,
        ].filter((s): s is string => !!s),
      ),
    );

    const { token, expiresAt, connectLinkUrl } = await pd.tokens.create({
      externalUserId: userId,
      allowedOrigins,
    });

    return NextResponse.json({
      ok: true,
      token,
      expiresAt,
      connectLinkUrl,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create connect token';
    console.error('[pipedream/connect-token]', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
