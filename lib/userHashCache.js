/**
 * User Hash Cache Management
 * Handles caching of Hanko user data in Redis
 */

import redis, { isRedisConnected } from './redis';

// Cache TTL: 1 hour
const USER_CACHE_TTL = 3600;

/**
 * Cache user data from Hanko
 * @param {string} userId - The Hanko user ID
 * @param {object} userData - The user data to cache
 * @returns {Promise<boolean>} Success status
 */
export async function cacheUserData(userId, userData) {
  if (!isRedisConnected()) {
    console.log('Redis not connected, skipping user cache');
    return false;
  }

  if (!userId || !userData) {
    throw new Error('User ID and data are required');
  }

  try {
    const userKey = `user:${userId}`;
    
    // Store user data as hash
    const userHash = {
      id: userId,
      email: userData.email || '',
      createdAt: userData.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      // Add any additional Hanko user fields
      ...(userData.verified !== undefined && { verified: userData.verified.toString() }),
      ...(userData.has_webauthn !== undefined && { hasWebauthn: userData.has_webauthn.toString() }),
      ...(userData.has_password !== undefined && { hasPassword: userData.has_password.toString() })
    };

    // Use multi for atomic operations
    const multi = redis.multi();
    
    // Set user hash fields
    for (const [field, value] of Object.entries(userHash)) {
      multi.hSet(userKey, field, value);
    }
    
    // Set expiration
    multi.expire(userKey, USER_CACHE_TTL);
    
    // Add to user index (for admin purposes)
    multi.sAdd('users:index', userId);
    
    await multi.exec();
    
    console.log(`[UserCache] Cached user data for ${userId}`);
    return true;
    
  } catch (error) {
    console.error('[UserCache] Error caching user data:', error);
    return false;
  }
}

/**
 * Get cached user data
 * @param {string} userId - The user ID
 * @returns {Promise<object|null>} Cached user data or null
 */
export async function getCachedUserData(userId) {
  if (!isRedisConnected()) {
    return null;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const userKey = `user:${userId}`;
    const userData = await redis.hGetAll(userKey);
    
    if (!userData || Object.keys(userData).length === 0) {
      return null;
    }
    
    // Refresh TTL on read
    await redis.expire(userKey, USER_CACHE_TTL);
    
    // Convert string booleans back to booleans
    return {
      ...userData,
      verified: userData.verified === 'true',
      hasWebauthn: userData.hasWebauthn === 'true',
      hasPassword: userData.hasPassword === 'true'
    };
    
  } catch (error) {
    console.error('[UserCache] Error getting cached user data:', error);
    return null;
  }
}

/**
 * Update specific user fields
 * @param {string} userId - The user ID
 * @param {object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateUserCache(userId, updates) {
  if (!isRedisConnected()) {
    return false;
  }

  if (!userId || !updates) {
    throw new Error('User ID and updates are required');
  }

  try {
    const userKey = `user:${userId}`;
    
    // Check if user exists in cache
    const exists = await redis.exists(userKey);
    if (!exists) {
      return false;
    }
    
    const multi = redis.multi();
    
    // Update fields
    for (const [field, value] of Object.entries(updates)) {
      const stringValue = typeof value === 'boolean' ? value.toString() : value;
      multi.hSet(userKey, field, stringValue);
    }
    
    // Update lastActivity
    multi.hSet(userKey, 'lastActivity', new Date().toISOString());
    
    // Refresh TTL
    multi.expire(userKey, USER_CACHE_TTL);
    
    await multi.exec();
    
    console.log(`[UserCache] Updated cache for user ${userId}`);
    return true;
    
  } catch (error) {
    console.error('[UserCache] Error updating user cache:', error);
    return false;
  }
}

/**
 * Invalidate user cache
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} Success status
 */
export async function invalidateUserCache(userId) {
  if (!isRedisConnected()) {
    return false;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const result = await redis.del(`user:${userId}`);
    console.log(`[UserCache] Invalidated cache for user ${userId}`);
    return result > 0;
  } catch (error) {
    console.error('[UserCache] Error invalidating user cache:', error);
    return false;
  }
}

/**
 * Get user statistics
 * @param {string} userId - The user ID
 * @returns {Promise<object>} User statistics
 */
export async function getUserStats(userId) {
  if (!isRedisConnected()) {
    return { services: 0, tokens: 0 };
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    // Get service count
    const servicesKey = `user:${userId}:services`;
    const services = await redis.hGetAll(servicesKey);
    const serviceCount = Object.keys(services).length;
    
    // Get token count
    const tokensKey = `mcp:user:${userId}:tokens`;
    const tokenCount = await redis.sCard(tokensKey);
    
    return {
      services: serviceCount,
      tokens: tokenCount
    };
    
  } catch (error) {
    console.error('[UserCache] Error getting user stats:', error);
    return { services: 0, tokens: 0 };
  }
}

/**
 * Track user activity
 * @param {string} userId - The user ID
 * @param {string} action - The action performed
 * @returns {Promise<void>}
 */
export async function trackUserActivity(userId, action) {
  if (!isRedisConnected()) {
    return;
  }

  if (!userId || !action) {
    return;
  }

  try {
    const activityKey = `user:${userId}:activity`;
    const timestamp = new Date().toISOString();
    
    // Store activity in a sorted set (score is timestamp)
    await redis.zAdd(activityKey, {
      score: Date.now(),
      value: JSON.stringify({ action, timestamp })
    });
    
    // Keep only last 100 activities
    await redis.zRemRangeByRank(activityKey, 0, -101);
    
    // Set TTL on activity log
    await redis.expire(activityKey, USER_CACHE_TTL * 24); // 24 hours
    
  } catch (error) {
    console.error('[UserCache] Error tracking activity:', error);
  }
}

/**
 * Get recent user activity
 * @param {string} userId - The user ID
 * @param {number} limit - Number of activities to retrieve
 * @returns {Promise<array>} Recent activities
 */
export async function getRecentActivity(userId, limit = 10) {
  if (!isRedisConnected()) {
    return [];
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const activityKey = `user:${userId}:activity`;
    
    // Get most recent activities
    const activities = await redis.zRange(activityKey, -limit, -1, {
      REV: true
    });
    
    return activities.map(activity => {
      try {
        return JSON.parse(activity);
      } catch {
        return null;
      }
    }).filter(Boolean);
    
  } catch (error) {
    console.error('[UserCache] Error getting recent activity:', error);
    return [];
  }
}

/**
 * Batch get multiple users (for admin dashboards)
 * @param {string[]} userIds - Array of user IDs
 * @returns {Promise<object>} Map of userId to userData
 */
export async function batchGetUsers(userIds) {
  if (!isRedisConnected() || !userIds || userIds.length === 0) {
    return {};
  }

  try {
    const multi = redis.multi();
    
    // Queue all user fetches
    for (const userId of userIds) {
      multi.hGetAll(`user:${userId}`);
    }
    
    const results = await multi.exec();
    
    // Map results to user IDs
    const usersMap = {};
    userIds.forEach((userId, index) => {
      const userData = results[index][1];
      if (userData && Object.keys(userData).length > 0) {
        usersMap[userId] = {
          ...userData,
          verified: userData.verified === 'true',
          hasWebauthn: userData.hasWebauthn === 'true',
          hasPassword: userData.hasPassword === 'true'
        };
      }
    });
    
    return usersMap;
    
  } catch (error) {
    console.error('[UserCache] Error batch getting users:', error);
    return {};
  }
}

export default {
  cacheUserData,
  getCachedUserData,
  updateUserCache,
  invalidateUserCache,
  getUserStats,
  trackUserActivity,
  getRecentActivity,
  batchGetUsers
};