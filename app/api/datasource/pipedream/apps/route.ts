import { NextResponse, type NextRequest } from 'next/server';
import { makePipedreamClient, pipedreamConfigured } from '@/lib/pipedream/client';
import { verifyAuth } from '@/lib/pipedream/auth';
import { normalizeApps } from '@/lib/pipedream/normalize';
import type { PipedreamApp } from '@/lib/pipedream/types';

// GET — browse/search available Pipedream apps.
//     ?q=salesforce   (optional search term)
//     ?limit=50       (optional cap, default 50)
//
// Curated fallback kicks in when Pipedream credentials are missing or
// pd.apps.list throws. The fallback is a short hard-coded list of popular
// apps so the picker UI still works in local dev without credentials.
const CURATED_FALLBACK: PipedreamApp[] = [
  { nameSlug: 'google_sheets', name: 'Google Sheets', description: 'Spreadsheets' },
  { nameSlug: 'airtable_oauth', name: 'Airtable', description: 'Databases and spreadsheets' },
  { nameSlug: 'notion', name: 'Notion', description: 'Databases, pages, blocks' },
  { nameSlug: 'hubspot', name: 'HubSpot', description: 'CRM — contacts, deals, companies' },
  { nameSlug: 'salesforce_rest_api', name: 'Salesforce', description: 'CRM' },
  { nameSlug: 'stripe', name: 'Stripe', description: 'Payments, customers, invoices' },
  { nameSlug: 'shopify', name: 'Shopify', description: 'Orders, products, customers' },
  { nameSlug: 'linear', name: 'Linear', description: 'Issues, projects' },
  { nameSlug: 'github', name: 'GitHub', description: 'Repos, issues, pulls' },
  { nameSlug: 'slack', name: 'Slack', description: 'Channels, messages, users' },
];

export async function GET(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200);

  if (!pipedreamConfigured()) {
    const apps = filterCurated(CURATED_FALLBACK, q).slice(0, limit);
    return NextResponse.json({ ok: true, apps, source: 'fallback' });
  }

  try {
    const pd = makePipedreamClient();
    // Pipedream SDK defaults to a small page (~10). Pass limit explicitly so
    // the user sees all matches for broad queries like "google".
    const raw = await pd.apps.list({
      limit: Math.min(limit, 100),
      ...(q ? { q } : {}),
    });
    const apps = normalizeApps(raw).slice(0, limit);
    return NextResponse.json({ ok: true, apps, source: 'pipedream' });
  } catch (e: unknown) {
    // Fail-open to the curated list so the UI keeps working. Log the error
    // so ops can notice upstream issues.
    const message = e instanceof Error ? e.message : 'Apps listing failed';
    console.warn('[pipedream/apps] falling back to curated:', message);
    const apps = filterCurated(CURATED_FALLBACK, q).slice(0, limit);
    return NextResponse.json({ ok: true, apps, source: 'fallback' });
  }
}

function filterCurated(apps: PipedreamApp[], q?: string): PipedreamApp[] {
  if (!q) return apps;
  const needle = q.toLowerCase();
  return apps.filter(
    (a) =>
      a.name.toLowerCase().includes(needle) ||
      a.nameSlug.toLowerCase().includes(needle) ||
      (a.description || '').toLowerCase().includes(needle),
  );
}
