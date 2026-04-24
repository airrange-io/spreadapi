import { NextResponse, type NextRequest } from 'next/server';
import { makePipedreamClient } from '@/lib/pipedream/client';
import { verifyAuth } from '@/lib/pipedream/auth';
import { normalizeAccounts } from '@/lib/pipedream/normalize';

// GET — list all connected accounts for the current user, optionally filtered
// by app. Always returns the caller's own accounts (externalUserId is server-
// derived from the Hanko session, never from a query param).
export async function GET(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const app = searchParams.get('app') || undefined;

  try {
    const pd = makePipedreamClient();
    const raw = await pd.accounts.list({
      externalUserId: userId,
      includeCredentials: false,
      ...(app ? { app } : {}),
    });
    const accounts = normalizeAccounts(raw);
    // When an app filter was requested but the SDK ignores it (some versions
    // do), post-filter in memory so callers get a predictable response.
    const filtered = app ? accounts.filter((a) => a.app === app) : accounts;
    return NextResponse.json({ ok: true, accounts: filtered });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to list accounts';
    console.error('[pipedream/accounts GET]', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// DELETE — remove a connected account. Body: { accountId }.
export async function DELETE(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: { accountId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const accountId = body.accountId;
  if (!accountId) {
    return NextResponse.json({ ok: false, error: 'accountId is required' }, { status: 400 });
  }

  try {
    const pd = makePipedreamClient();
    // Ownership guard: verify the account belongs to this user before delete.
    const raw = await pd.accounts.list({
      externalUserId: userId,
      includeCredentials: false,
    });
    const accounts = normalizeAccounts(raw);
    if (!accounts.some((a) => a.id === accountId)) {
      return NextResponse.json({ ok: false, error: 'Account not found' }, { status: 404 });
    }
    await pd.accounts.delete(accountId);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to delete account';
    console.error('[pipedream/accounts DELETE]', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
