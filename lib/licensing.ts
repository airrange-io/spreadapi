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
  hasMcpAccess: boolean;
  hasAdvancedAnalytics: boolean;
}

export const LICENSE_LIMITS: Record<LicenseType, LicenseLimits> = {
  free: {
    maxFileSizeMB: 1,
    maxFileSizeBytes: 1 * 1024 * 1024,
    maxServices: 1,
    hasMcpAccess: false,
    hasAdvancedAnalytics: false,
  },
  pro: {
    maxFileSizeMB: 3,
    maxFileSizeBytes: 3 * 1024 * 1024,
    maxServices: 3,
    hasMcpAccess: true,
    hasAdvancedAnalytics: false,
  },
  premium: {
    maxFileSizeMB: 25,
    maxFileSizeBytes: 25 * 1024 * 1024,
    maxServices: Infinity,
    hasMcpAccess: true,
    hasAdvancedAnalytics: true,
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
