/**
 * User Management Functions
 * Handles user lifecycle including proper cleanup
 */

import redis from './redis';

/**
 * Delete a user and all associated data
 * @param {string} userId - The user ID to delete
 * @returns {Promise<object>} Result of deletion
 */
export async function deleteUser(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    // Start a transaction for atomic deletion
    const multi = redis.multi();
    
    // 1. Get user's services
    const userServices = await redis.hGetAll(`user:${userId}:services`);
    const serviceIds = Object.keys(userServices);
    
    // 2. Delete all service-related data
    for (const serviceId of serviceIds) {
      // Delete service hash
      multi.del(`service:${serviceId}`);
      
      // Delete published data
      multi.del(`service:${serviceId}:published`);
      
      // Delete analytics data
      multi.del(`service:${serviceId}:analytics`);
      
      // Delete cache data
      multi.del(`service:${serviceId}:cache`);
      multi.del(`cache:api:${serviceId}`);
      
      // Delete any result caches
      const resultCachePattern = `service:${serviceId}:cache:result:*`;
      const resultCacheKeys = await redis.keys(resultCachePattern);
      if (resultCacheKeys.length > 0) {
        resultCacheKeys.forEach(key => multi.del(key));
      }
    }
    
    // 3. Delete user's service index
    multi.del(`user:${userId}:services`);
    
    // 4. Delete user's MCP tokens
    const userTokens = await redis.sMembers(`mcp:user:${userId}:tokens`);
    for (const token of userTokens) {
      multi.del(`mcp:token:${token}`);
    }
    multi.del(`mcp:user:${userId}:tokens`);
    
    // 5. Delete user record itself
    multi.del(`user:${userId}`);
    
    // Execute all deletions atomically
    await multi.exec();
    
    return {
      success: true,
      deleted: {
        userId,
        servicesCount: serviceIds.length,
        tokensCount: userTokens.length
      }
    };
    
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

/**
 * Get all data associated with a user (for GDPR compliance)
 * @param {string} userId - The user ID
 * @returns {Promise<object>} All user data
 */
export async function exportUserData(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  try {
    const userData = {
      user: await redis.hGetAll(`user:${userId}`),
      services: {},
      tokens: []
    };
    
    // Get services
    const userServices = await redis.hGetAll(`user:${userId}:services`);
    for (const [serviceId, status] of Object.entries(userServices)) {
      userData.services[serviceId] = {
        status,
        data: await redis.hGetAll(`service:${serviceId}`),
        published: await redis.hGetAll(`service:${serviceId}:published`),
        analytics: await redis.hGetAll(`service:${serviceId}:analytics`)
      };
    }
    
    // Get tokens
    const userTokens = await redis.sMembers(`mcp:user:${userId}:tokens`);
    for (const token of userTokens) {
      const tokenData = await redis.hGetAll(`mcp:token:${token}`);
      userData.tokens.push({
        token: token.substring(0, 16) + '...', // Partial token for security
        ...tokenData
      });
    }
    
    return userData;
    
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw new Error(`Failed to export user data: ${error.message}`);
  }
}

/**
 * Transfer services from one user to another
 * @param {string} fromUserId - Source user ID
 * @param {string} toUserId - Destination user ID
 * @returns {Promise<object>} Transfer result
 */
export async function transferUserServices(fromUserId, toUserId) {
  if (!fromUserId || !toUserId) {
    throw new Error('Both user IDs are required');
  }
  
  try {
    // Get source user's services
    const userServices = await redis.hGetAll(`user:${fromUserId}:services`);
    const serviceIds = Object.keys(userServices);
    
    if (serviceIds.length === 0) {
      return {
        success: true,
        transferred: 0
      };
    }
    
    const multi = redis.multi();
    
    // Transfer each service
    for (const [serviceId, status] of Object.entries(userServices)) {
      // Update service owner
      multi.hSet(`service:${serviceId}`, 'userId', toUserId);
      
      // Add to destination user's services
      multi.hSet(`user:${toUserId}:services`, serviceId, status);
      
      // Remove from source user's services
      multi.hDel(`user:${fromUserId}:services`, serviceId);
    }
    
    await multi.exec();
    
    return {
      success: true,
      transferred: serviceIds.length
    };
    
  } catch (error) {
    console.error('Error transferring services:', error);
    throw new Error(`Failed to transfer services: ${error.message}`);
  }
}