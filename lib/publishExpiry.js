import redis from './redis';

// Free-plan published services auto-expire via a Redis TTL on the :published
// key. When that key is gone, the execution paths (v1 execute, MCP, web app)
// need to tell "expired free publish" (402 — re-publish or upgrade) apart from
// "never published" (404). The publish path mirrors the deadline onto the
// persistent draft hash as `expiresAt` (epoch ms), which survives the TTL.
//
// Returns null when there is no expiry marker (i.e. never published, or a paid
// service whose marker was cleared). Otherwise { expiresAt, isExpired }.
export async function getPublishExpiry(serviceId) {
  try {
    const raw = await redis.hGet(`service:${serviceId}`, 'expiresAt');
    if (!raw) return null;
    const expiresAt = parseInt(raw, 10);
    if (!Number.isFinite(expiresAt)) return null;
    return { expiresAt, isExpired: Date.now() >= expiresAt };
  } catch {
    return null;
  }
}

// Standard 402 response body for an expired free publish.
export const EXPIRED_PUBLISH_BODY = {
  error: 'Service expired',
  code: 'PUBLISH_EXPIRED',
  message:
    "This service's free live window has ended. Re-publish it for another window, or upgrade to keep it online permanently.",
};
