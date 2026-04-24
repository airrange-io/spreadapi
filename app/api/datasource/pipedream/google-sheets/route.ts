import { NextResponse, type NextRequest } from 'next/server';
import { makePipedreamClient } from '@/lib/pipedream/client';
import { verifyAuth } from '@/lib/pipedream/auth';
import {
  listGoogleSpreadsheets,
  listGoogleSheetTabs,
} from '@/lib/pipedream/providers/google_sheets.backend';

// GET — Google-Sheets-specific picker helpers used by the custom form.
// Authenticated (Hanko), so externalUserId is never supplied by the client.
//
//   ?action=spreadsheets&accountId=apn_xxx[&pageToken=...]
//     → { ok, files: [{id, name}], nextPageToken? }
//
//   ?action=sheets&accountId=apn_xxx&spreadsheetId=1abc...
//     → { ok, sheets: [{title, sheetId}] }
export async function GET(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const accountId = searchParams.get('accountId');

  if (!accountId) {
    return NextResponse.json({ ok: false, error: 'accountId is required' }, { status: 400 });
  }

  try {
    const pd = makePipedreamClient();

    if (action === 'spreadsheets') {
      const pageToken = searchParams.get('pageToken') || undefined;
      const result = await listGoogleSpreadsheets(pd, userId, accountId, pageToken);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === 'sheets') {
      const spreadsheetId = searchParams.get('spreadsheetId');
      if (!spreadsheetId) {
        return NextResponse.json(
          { ok: false, error: 'spreadsheetId is required' },
          { status: 400 },
        );
      }
      const sheets = await listGoogleSheetTabs(pd, userId, accountId, spreadsheetId);
      return NextResponse.json({ ok: true, sheets });
    }

    return NextResponse.json(
      { ok: false, error: 'Unknown action' },
      { status: 400 },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'google-sheets helper failed';
    console.error('[pipedream/google-sheets]', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
