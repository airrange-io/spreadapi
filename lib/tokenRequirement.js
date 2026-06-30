import redis from '@/lib/redis';
import { invalidateServiceCache } from '@/lib/cacheHelpers';
import { clearApiDefinitionCache } from '@/utils/helperApi';

/**
 * Apply (or remove) the token requirement for a service and make it take effect
 * immediately on the live endpoint.
 *
 * The execute path reads `needsToken` only from the PUBLISHED copy
 * (service:{id}:published), while the editor reads `requireToken` from the DRAFT
 * (service:{id}). To keep both in sync — and to make the change live without a
 * re-publish — we:
 *   1. write the draft flag,
 *   2. write the published flag (only if the service is currently published),
 *   3. invalidate the Redis caches. invalidateServiceCache also clears the
 *      result cache, which matters because the result-cache lookup runs BEFORE
 *      token validation in calculateDirect.js — stale "open" results would
 *      otherwise bypass a freshly enabled requirement,
 *   4. clear the in-process (10 min) definition cache for this instance.
 *
 * Note: on multi-instance deployments, other warm instances still rely on the
 * Redis invalidation + their own process-cache TTL, same as the publish flow.
 *
 * @param {string} serviceId
 * @param {boolean} required
 * @returns {Promise<{published: boolean}>}
 */
export async function applyTokenRequirement(serviceId, required) {
  const value = required ? 'true' : 'false';

  // Draft flag (what the editor / save / re-publish reads)
  await redis.hSet(`service:${serviceId}`, 'requireToken', value);

  // Live flag — only if the service is actually published
  const isPublished = await redis.exists(`service:${serviceId}:published`);
  if (isPublished) {
    await redis.hSet(`service:${serviceId}:published`, 'needsToken', value);
    await invalidateServiceCache(redis, serviceId);
    clearApiDefinitionCache(serviceId);
  }

  return { published: !!isPublished };
}
