import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/pipedream/auth';
import { fetchDataSource } from '@/lib/fetchDataSource';

// POST — run an action once and return rows for the modal's preview table.
// The action is executed against the user's connected account via Pipedream.
// externalUserId is server-derived (Hanko), so users can only preview
// actions for accounts they own.
//
// Body: {
//   appSlug:          'google_sheets',
//   actionId:         'google_sheets-list-sheet-values',
//   accountId:        'apn_xxx',
//   configuredProps:  { spreadsheetId: '…', sheetName: '…' },
//   arrayPath?:       'data.values',          // fallback when auto-detect fails
//   sampleRows?:      10..10000               // cap on returned rows
// }
//
// No column inference here: we hand the raw rows back. SpreadJS infers columns
// at hydrate time; the modal's preview uses the keys of the first row for the
// column list. Consistent with how the URL/CSV preview flow already works.

const DEFAULT_SAMPLE_ROWS = 10;
const MAX_PREVIEW_ROWS = 10_000;

interface Body {
  appSlug: string;
  actionId: string;
  accountId: string;
  configuredProps?: Record<string, unknown>;
  arrayPath?: string;
  sampleRows?: number;
}

export async function POST(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body.appSlug || !body.actionId || !body.accountId) {
    return NextResponse.json(
      { ok: false, error: 'appSlug, actionId and accountId are required' },
      { status: 400 },
    );
  }

  const sampleRows = Math.min(
    Math.max(body.sampleRows || DEFAULT_SAMPLE_ROWS, 1),
    MAX_PREVIEW_ROWS,
  );

  // Preview uses the same fetchDataSource path as the refresh webhook, so
  // provider customFetch hooks (e.g. google_sheets hitting the Sheets API
  // directly via pd.proxy) work identically here. No divergence.
  const result = await fetchDataSource(
    {
      type: 'pipedream',
      appSlug: body.appSlug,
      actionId: body.actionId,
      accountId: body.accountId,
      externalUserId: userId,
      configuredProps: body.configuredProps || {},
      arrayPath: body.arrayPath,
    },
    { maxRows: sampleRows },
  );

  const r = result as any;
  if (!r.ok) {
    return NextResponse.json(
      { ok: false, error: r.error, stage: r.stage },
      { status: r.stage === 'auth' ? 401 : 500 },
    );
  }

  const capped = (r.rows || []) as Record<string, unknown>[];
  return NextResponse.json({
    ok: true,
    rows: capped,
    totalRowsFetched: r.totalRowsFetched,
    columns: inferColumns(capped),
  });
}

function inferColumns(rows: Record<string, unknown>[]) {
  if (!rows.length) return [];
  // Union of keys across the first N rows so rare columns still surface.
  const sample = rows.slice(0, 50);
  const keys = new Set<string>();
  for (const r of sample) {
    if (r && typeof r === 'object') {
      Object.keys(r).forEach((k) => keys.add(k));
    }
  }
  return Array.from(keys).map((name) => ({
    name,
    dataType: inferDataType(rows, name),
  }));
}

function inferDataType(
  rows: Record<string, unknown>[],
  name: string,
): 'string' | 'number' | 'boolean' | 'date' {
  for (const r of rows) {
    const v = r?.[name];
    if (v == null || v === '') continue;
    if (typeof v === 'number') return 'number';
    if (typeof v === 'boolean') return 'boolean';
    if (typeof v === 'string') {
      // Simple ISO-date heuristic, same bar as our JSON/REST preview path.
      if (/^\d{4}-\d{2}-\d{2}(T|$)/.test(v)) return 'date';
    }
    return 'string';
  }
  return 'string';
}
