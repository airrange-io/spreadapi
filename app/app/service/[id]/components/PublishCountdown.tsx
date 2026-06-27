import React from 'react';
import { formatRemaining } from '@/lib/formatRemaining';

/**
 * Renders the remaining time of a Free-plan publish window as a small inline
 * suffix (e.g. " · 4h 12m" / " · Expired"). Ticks every 30 s. Renders nothing
 * when `expiresAt` is null/undefined (paid or never-published services), so it
 * is a no-op for Pro/Premium and causes no visual change there.
 */
export default function PublishCountdown({ expiresAt }: { expiresAt?: number | null }) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const remaining = formatRemaining(expiresAt, now);
  if (!remaining) return null;

  const color = remaining.expired ? '#fff' : remaining.urgent ? '#FFD8A8' : 'rgba(255,255,255,0.85)';
  return (
    <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 500, color }}>
      · {remaining.expired ? 'Expired' : remaining.label}
    </span>
  );
}
