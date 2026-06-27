// Pure, client/server-safe helper: human-readable time left until `expiresAt`
// (epoch ms). Returns null when there is no expiry (paid / never-published),
// so callers can render nothing for those cases. `urgent` flags the final hour.
export interface RemainingTime {
  label: string;
  expired: boolean;
  urgent: boolean;
}

export function formatRemaining(
  expiresAt: number | null | undefined,
  now: number = Date.now()
): RemainingTime | null {
  if (!expiresAt) return null;
  const ms = expiresAt - now;
  if (ms <= 0) return { label: 'Expired', expired: true, urgent: true };
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return { label, expired: false, urgent: hours === 0 };
}
