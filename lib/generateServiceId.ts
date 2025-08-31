/**
 * Generates a unique service ID with user prefix
 * Format: {userId}_{timestamp}{random}
 * Example: user123_mdct0x0re85ygl
 */
export function generateServiceId(userId: string = 'anonymous'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${userId}_${timestamp}${random}`;
}