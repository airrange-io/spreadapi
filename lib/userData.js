/**
 * User Data Management
 * Handles persistent storage of Hanko user data in Redis
 * Note: User data persists indefinitely (no TTL)
 */

import redis, { isRedisConnected } from './redis';

// Activity log TTL: 30 days (in seconds)
const ACTIVITY_LOG_TTL = 30 * 24 * 60 * 60; // 2592000 seconds

/**
 * Store user data from Hanko
 * @param {string} userId - The Hanko user ID
 * @param {object} userData - The user data to store
 * @returns {Promise<boolean>} Success status
 */
export async function storeUserData(userId, userData) {
  if (!isRedisConnected()) {
    console.log('Redis not connected, skipping user storage');
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

    // No expiration - users persist indefinitely
    // This ensures sentToCRM flag and user data remain available

    // Add to user index (for admin purposes)
    multi.sAdd('users:index', userId);

    await multi.exec();
    
    console.log(`[UserData] Stored user data for ${userId}`);
    return true;
    
  } catch (error) {
    console.error('[UserData] Error storing user data:', error);
    return false;
  }
}

/**
 * Get user data
 * @param {string} userId - The user ID
 * @returns {Promise<object|null>} User data or null
 */
export async function getUserData(userId) {
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

    // Convert string booleans back to booleans
    return {
      ...userData,
      verified: userData.verified === 'true',
      hasWebauthn: userData.hasWebauthn === 'true',
      hasPassword: userData.hasPassword === 'true'
    };

  } catch (error) {
    console.error('[UserData] Error getting user data:', error);
    return null;
  }
}

/**
 * Update specific user fields
 * @param {string} userId - The user ID
 * @param {object} updates - Fields to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateUserData(userId, updates) {
  if (!isRedisConnected()) {
    return false;
  }

  if (!userId || !updates) {
    throw new Error('User ID and updates are required');
  }

  try {
    const userKey = `user:${userId}`;

    // Check if user exists
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

    // No TTL - users persist indefinitely

    await multi.exec();
    
    console.log(`[UserData] Updated data for user ${userId}`);
    return true;
    
  } catch (error) {
    console.error('[UserData] Error updating user data:', error);
    return false;
  }
}

/**
 * Delete user data
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteUserData(userId) {
  if (!isRedisConnected()) {
    return false;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    // Use multi for atomic deletion of all user-related data
    const multi = redis.multi();

    // Delete main user hash
    multi.del(`user:${userId}`);

    // Delete user's activity log
    multi.del(`user:${userId}:activity`);

    // Delete user's services index
    multi.del(`user:${userId}:services`);

    // Remove user from global users index
    multi.sRem('users:index', userId);

    const results = await multi.exec();

    console.log(`[UserData] Deleted user data for ${userId}`);
    return results[0] > 0; // Return true if main user hash was deleted
  } catch (error) {
    console.error('[UserData] Error deleting user data:', error);
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
    console.error('[UserData] Error getting user stats:', error);
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

    // Use multi for atomic operations
    const multi = redis.multi();

    // Store activity in a sorted set (score is timestamp)
    multi.zAdd(activityKey, {
      score: Date.now(),
      value: JSON.stringify({ action, timestamp })
    });

    // Keep only last 100 activities
    multi.zRemRangeByRank(activityKey, 0, -101);

    // Set TTL on activity log (30 days)
    multi.expire(activityKey, ACTIVITY_LOG_TTL);

    await multi.exec();

  } catch (error) {
    console.error('[UserData] Error tracking activity:', error);
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
    console.error('[UserData] Error getting recent activity:', error);
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
    console.error('[UserData] Error batch getting users:', error);
    return {};
  }
}

export default {
  storeUserData,
  getUserData,
  updateUserData,
  deleteUserData,
  getUserStats,
  trackUserActivity,
  getRecentActivity,
  batchGetUsers
};