import { NextResponse, type NextRequest } from 'next/server';
import { makePipedreamClient } from '@/lib/pipedream/client';
import { verifyAuth } from '@/lib/pipedream/auth';
import { normalizeComponents } from '@/lib/pipedream/normalize';
import { getProvider } from '@/lib/pipedream/providers';

// GET /api/datasource/pipedream/components?app=google_sheets
// Lists action components available for an app. Action filter applied here
// (rather than relying on the SDK) because some SDK versions return triggers
// mixed in.
export async function GET(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const app = searchParams.get('app');
  if (!app) {
    return NextResponse.json({ ok: false, error: 'app is required' }, { status: 400 });
  }
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200);

  try {
    const pd = makePipedreamClient();
    const raw = await pd.components.list({
      app,
      componentType: 'action',
      limit,
    });
    const all = normalizeComponents(raw);
    // Some SDK versions don't honour componentType; filter again defensively.
    const actionsOnly = all.filter(
      (c) => !c.componentType || c.componentType === 'action',
    );
    const provider = getProvider(app);
    const filtered = provider.filterActions
      ? provider.filterActions(actionsOnly)
      : actionsOnly;
    return NextResponse.json({
      ok: true,
      components: filtered,
      defaultActionId: provider.defaultActionId,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Components listing failed';
    console.error('[pipedream/components]', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
