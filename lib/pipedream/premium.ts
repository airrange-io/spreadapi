import redis from '@/lib/redis';
import { isValidLicenseType, type LicenseType } from '@/lib/licensing';

// Premium gate for Pipedream Connect. Browsing apps/components is open;
// anything that costs us money (account auth, action.run) goes through this.
export async function userHasPipedreamAccess(
  userId: string | null | undefined,
): Promise<boolean> {
  if (!userId) return false;
  try {
    const raw = await redis.hGet(`user:${userId}`, 'licenseType');
    const value = typeof raw === 'string' ? raw : raw?.toString();
    if (!isValidLicenseType(value)) return false;
    return (value as LicenseType) === 'premium';
  } catch {
    // Redis hiccup: deny rather than allow. The user can retry; we don't
    // accidentally hand out paid features when our gate is down.
    return false;
  }
}
