/**
 * User Licensing System
 * Defines license types and their associated limits
 *
 * To manually set a user's license in Redis:
 *   HSET user:{userId} licenseType pro
 *   HSET user:{userId} licenseType premium
 */

export type LicenseType = 'free' | 'pro' | 'premium';

export interface LicenseLimits {
  maxFileSizeMB: number;
  maxFileSizeBytes: number;
  maxServices: number;
  maxCallsPerMonth: number;
  hasMcpAccess: boolean;
  hasAdvancedAnalytics: boolean;
  // Free plan: published services are ephemeral and auto-expire after this many
  // seconds (enforced via a Redis TTL on the :published key). null = permanent.
  publishTtlSeconds: number | null;
}

export const LICENSE_LIMITS: Record<LicenseType, LicenseLimits> = {
  free: {
    maxFileSizeMB: 3,
    maxFileSizeBytes: 3 * 1024 * 1024,
    // Unlimited service creation: monetization is the 6 h publish window below,
    // not the service count. Drafts are inert (no public traffic) and cheap
    // (workbooks live in Blob, not Redis).
    maxServices: Infinity,
    // No monthly call cap on Free — the 6 h publish window is the constraint.
    // (maxCallsPerMonth is display-only today; not enforced at execute time.)
    maxCallsPerMonth: Infinity,
    hasMcpAccess: true,
    hasAdvancedAnalytics: false,
    publishTtlSeconds: 6 * 60 * 60, // 6 hours
  },
  pro: {
    maxFileSizeMB: 3,
    maxFileSizeBytes: 3 * 1024 * 1024,
    // Service count is no longer a pricing axis — plans differ by call volume,
    // file size and permanence (paid services don't expire). Call numbers match
    // the pricing page ("included" allotment; add-ons sold separately).
    maxServices: Infinity,
    maxCallsPerMonth: 1000,
    hasMcpAccess: true,
    hasAdvancedAnalytics: false,
    publishTtlSeconds: null, // permanent
  },
  premium: {
    maxFileSizeMB: 25,
    maxFileSizeBytes: 25 * 1024 * 1024,
    maxServices: Infinity,
    maxCallsPerMonth: 10000,
    hasMcpAccess: true,
    hasAdvancedAnalytics: true,
    publishTtlSeconds: null, // permanent
  },
};

export function isValidLicenseType(value: string | undefined | null): value is LicenseType {
  return value === 'free' || value === 'pro' || value === 'premium';
}

export function getLicenseType(value: string | undefined | null): LicenseType {
  return isValidLicenseType(value) ? value : 'free';
}

export function getLimits(licenseType: LicenseType): LicenseLimits {
  return LICENSE_LIMITS[licenseType];
}

export function getLimitsForUser(licenseTypeValue: string | undefined | null): LicenseLimits {
  const licenseType = getLicenseType(licenseTypeValue);
  return LICENSE_LIMITS[licenseType];
}
