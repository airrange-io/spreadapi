// 24-byte random value encoded as 48-char hex. Used as the per-data-source
// webhook token for Snapshot refreshes. Backend compare is constant-time.
export function generateWebhookToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint8Array(24);
    crypto.getRandomValues(buf);
    return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Array.from({ length: 48 })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}
