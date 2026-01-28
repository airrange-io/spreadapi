import redis from '../lib/redis.js';
import { hashToken, parseAuthToken } from './tokenUtils.js';

export async function validateServiceToken(request, serviceId) {
  try {
    let token = parseAuthToken(request.headers.get('authorization'));
    if (!token) {
      const url = new URL(request.url);
      token = url.searchParams.get('token');
    }

    if (!token) return { valid: false, error: 'No token provided', status: 401 };

    const tokenHash = hashToken(token);
    const tokenId = await redis.get(`token:hash:${tokenHash}`);
    if (!tokenId) return { valid: false, error: 'Invalid token', status: 401 };

    const tokenData = await redis.hGetAll(`token:${tokenId}`);
    if (!tokenData || Object.keys(tokenData).length === 0) return { valid: false, error: 'Token not found', status: 401 };
    if (tokenData.serviceId !== serviceId) return { valid: false, error: 'Token does not belong to this service', status: 403 };

    if (tokenData.expiresAt && new Date(tokenData.expiresAt) < new Date()) {
      return { valid: false, error: 'Token expired', status: 401 };
    }

    // Update usage (fire and forget)
    Promise.all([
      redis.hIncrBy(`token:${tokenId}`, 'usageCount', 1),
      redis.hSet(`token:${tokenId}`, 'lastUsedAt', new Date().toISOString())
    ]).catch(() => {});

    return { valid: true, tokenId, tokenData };
  } catch {
    return { valid: false, error: 'Token validation failed', status: 500 };
  }
}
