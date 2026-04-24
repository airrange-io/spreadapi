// Google Sheets — backend fetch. We bypass Pipedream's pre-built
// `list-sheet-values` action and hit the Sheets API directly via
// pd.proxy.get(). Same pattern listplus uses in production. The action is
// too cascaded (drive → spreadsheet → sheet → range, each with configureProp
// round-trips) to give good UX in our inline form.
//
// Saved source shape:
//   source.configuredProps = {
//     spreadsheetId: '1AbC...',  // Drive file id
//     sheetName:     'Sheet1',   // tab name (URL-encoded at request time)
//     range?:        'A1:Z',     // optional, defaults to 'A:Z' (the tab)
//   }
//
// The response is a 2-D array of cell values. We convert it to a flat
// array of row objects keyed by the header row, which is the only shape
// SpreadJS and everything downstream expects.

import type { PipedreamSource } from '../types';

interface CustomFetchOpts {
  pd: any;
  source: PipedreamSource;
  maxRows: number;
}

async function proxyGet(pd: any, url: string, source: PipedreamSource) {
  const res = await pd.proxy.get({
    url,
    externalUserId: source.externalUserId,
    accountId: source.accountId,
  });
  return await parseProxyResponse(res);
}

async function parseProxyResponse(res: any): Promise<any> {
  // Pipedream's proxy responses come as standard Response-like objects with
  // .json()/.text(). Some SDK versions wrap payload in {data: ...}.
  try {
    if (typeof res?.json === 'function') {
      return await res.json();
    }
    if (res?.data !== undefined) return res.data;
    return res;
  } catch {
    // Fall back to text when JSON parse fails (rare — Google APIs always
    // return JSON on success).
    if (typeof res?.text === 'function') {
      const text = await res.text();
      return { rawText: text };
    }
    return null;
  }
}

export async function fetchGoogleSheetsValues({
  pd,
  source,
  maxRows,
}: CustomFetchOpts): Promise<unknown[]> {
  const props = source.configuredProps || {};
  const spreadsheetId = String(
    (props as any).spreadsheetId || (props as any).spreadsheet_id || '',
  );
  const sheetName = String(
    (props as any).sheetName || (props as any).sheet_name || '',
  );
  const range =
    ((props as any).range as string | undefined) ||
    (sheetName ? `${sheetName}!A:Z` : 'A:Z');

  if (!spreadsheetId) {
    throw new Error('Google Sheets source is missing spreadsheetId');
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId,
  )}/values/${encodeURIComponent(range)}`;

  const data = await proxyGet(pd, url, source);
  const values: unknown[][] = Array.isArray(data?.values) ? data.values : [];
  if (values.length === 0) return [];

  // First row = headers. Remaining rows = data. Missing cells become empty
  // strings (Google Sheets returns jagged arrays for trailing-empty cells).
  const headers = (values[0] || []).map((h, i) =>
    h == null || h === '' ? `col_${i + 1}` : String(h),
  );
  const rows: Record<string, unknown>[] = [];
  for (let r = 1; r < values.length && rows.length < maxRows; r++) {
    const row = values[r] || [];
    const obj: Record<string, unknown> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c] ?? '';
    }
    rows.push(obj);
  }
  return rows;
}

// Helper for the picker endpoints — list spreadsheets in the user's drive.
export async function listGoogleSpreadsheets(
  pd: any,
  externalUserId: string,
  accountId: string,
  pageToken?: string,
): Promise<{ files: Array<{ id: string; name: string }>; nextPageToken?: string }> {
  const params = new URLSearchParams({
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed = false",
    pageSize: '50',
    fields: 'nextPageToken,files(id,name,modifiedTime)',
    orderBy: 'modifiedTime desc',
  });
  if (pageToken) params.set('pageToken', pageToken);
  const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
  const data = await proxyGet(pd, url, {
    type: 'pipedream',
    appSlug: 'google_sheets',
    actionId: '',
    accountId,
    externalUserId,
    configuredProps: {},
  });
  return {
    files: Array.isArray(data?.files) ? data.files : [],
    nextPageToken: data?.nextPageToken,
  };
}

export async function listGoogleSheetTabs(
  pd: any,
  externalUserId: string,
  accountId: string,
  spreadsheetId: string,
): Promise<Array<{ title: string; sheetId: number }>> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId,
  )}?fields=sheets(properties(title,sheetId))`;
  const data = await proxyGet(pd, url, {
    type: 'pipedream',
    appSlug: 'google_sheets',
    actionId: '',
    accountId,
    externalUserId,
    configuredProps: {},
  });
  const sheets: any[] = Array.isArray(data?.sheets) ? data.sheets : [];
  return sheets
    .map((s) => s?.properties)
    .filter(Boolean)
    .map((p) => ({ title: String(p.title || ''), sheetId: Number(p.sheetId) }));
}
