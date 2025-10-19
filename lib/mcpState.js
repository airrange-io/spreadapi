/**
 * MCP State Management
 * Handles persistent storage of calculation states in Redis for multi-turn workflows
 */

import redis, { isRedisConnected } from './redis.js';

// State TTL constants
const DEFAULT_STATE_TTL = 60 * 60; // 1 hour in seconds
const SAVED_STATE_TTL = 24 * 60 * 60; // 24 hours in seconds
const MAX_STATES_PER_USER = 100; // Limit to prevent abuse

/**
 * Generate a unique state ID
 * @param {string} userId - The user ID
 * @returns {string} State ID
 */
function generateStateId(userId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `state_${userId}_${timestamp}_${random}`;
}

/**
 * Save calculation state to Redis
 * @param {string} userId - The user ID
 * @param {string} serviceId - The service ID
 * @param {object} inputs - Calculation inputs
 * @param {object} outputs - Calculation outputs
 * @param {string} label - Human-readable label
 * @param {number} ttl - Time-to-live in seconds
 * @returns {Promise<object>} State ID and expiration info
 */
export async function saveState(userId, serviceId, inputs, outputs, label, ttl = DEFAULT_STATE_TTL) {
  if (!isRedisConnected()) {
    throw new Error('Redis not connected');
  }

  if (!userId || !serviceId || !inputs || !outputs || !label) {
    throw new Error('userId, serviceId, inputs, outputs, and label are required');
  }

  try {
    // Generate state ID
    const stateId = generateStateId(userId);
    const now = Date.now();

    // Store state as hash
    // Use multi() to batch all 5 operations in single round-trip
    const stateKey = `mcp:state:${userId}:${stateId}`;
    const indexKey = `mcp:state:index:${userId}`;

    const multi = redis.multi();

    // Store state hash
    multi.hSet(stateKey, {
      stateId: stateId,
      userId: userId,
      serviceId: serviceId,
      inputs: JSON.stringify(inputs),
      outputs: JSON.stringify(outputs),
      label: label,
      created: now.toString(),
      lastAccessed: now.toString()
    });

    // Set TTL on state
    multi.expire(stateKey, ttl);

    // Add to user's state index (sorted set by timestamp)
    multi.zAdd(indexKey, {
      score: now,
      value: stateId
    });

    // Keep only the last MAX_STATES_PER_USER states
    multi.zRemRangeByRank(indexKey, 0, -(MAX_STATES_PER_USER + 1));

    // Set TTL on index (same as longest possible state TTL)
    multi.expire(indexKey, SAVED_STATE_TTL);

    // Execute all operations atomically
    await multi.exec();

    console.log(`[MCP State] Saved state ${stateId} for user ${userId} with TTL ${ttl}s`);

    return {
      stateId,
      expiresIn: ttl,
      expiresAt: new Date(now + ttl * 1000).toISOString()
    };

  } catch (error) {
    console.error('[MCP State] Error saving state:', error);
    throw new Error(`Failed to save state: ${error.message}`);
  }
}

/**
 * Load calculation state from Redis
 * @param {string} userId - The user ID
 * @param {string} stateId - The state ID to load
 * @returns {Promise<object>} State data
 */
export async function loadState(userId, stateId) {
  if (!isRedisConnected()) {
    throw new Error('Redis not connected');
  }

  if (!userId || !stateId) {
    throw new Error('userId and stateId are required');
  }

  try {
    const stateKey = `mcp:state:${userId}:${stateId}`;
    const state = await redis.hGetAll(stateKey);

    if (!state || Object.keys(state).length === 0) {
      throw new Error('State not found or expired');
    }

    // Verify the state belongs to this user
    if (state.userId !== userId) {
      throw new Error('Access denied to this state');
    }

    // Update last accessed timestamp
    await redis.hSet(stateKey, 'lastAccessed', Date.now().toString());

    // Parse JSON fields
    const parsedState = {
      stateId: state.stateId,
      userId: state.userId,
      serviceId: state.serviceId,
      inputs: JSON.parse(state.inputs),
      outputs: JSON.parse(state.outputs),
      label: state.label,
      created: parseInt(state.created),
      lastAccessed: Date.now()
    };

    console.log(`[MCP State] Loaded state ${stateId} for user ${userId}`);

    return parsedState;

  } catch (error) {
    console.error('[MCP State] Error loading state:', error);

    if (error.message.includes('not found') || error.message.includes('Access denied')) {
      throw error;
    }

    throw new Error(`Failed to load state: ${error.message}`);
  }
}

/**
 * List all saved states for a user
 * @param {string} userId - The user ID
 * @param {string} serviceId - Optional: filter by service ID
 * @param {number} limit - Maximum number of states to return
 * @returns {Promise<array>} List of states
 */
export async function listStates(userId, serviceId = null, limit = 10) {
  if (!isRedisConnected()) {
    throw new Error('Redis not connected');
  }

  if (!userId) {
    throw new Error('userId is required');
  }

  // Clamp limit to prevent abuse
  limit = Math.min(Math.max(1, limit), 50);

  try {
    const indexKey = `mcp:state:index:${userId}`;

    // Get most recent state IDs (reverse order, newest first)
    const stateIds = await redis.zRange(indexKey, -limit, -1, {
      REV: true
    });

    if (!stateIds || stateIds.length === 0) {
      return [];
    }

    // Fetch all states in parallel
    const statePromises = stateIds.map(async (stateId) => {
      try {
        const stateKey = `mcp:state:${userId}:${stateId}`;
        const state = await redis.hGetAll(stateKey);

        if (!state || Object.keys(state).length === 0) {
          return null; // State expired
        }

        // Filter by serviceId if specified
        if (serviceId && state.serviceId !== serviceId) {
          return null;
        }

        // Return minimal metadata (don't load full inputs/outputs)
        return {
          stateId: state.stateId,
          serviceId: state.serviceId,
          label: state.label,
          created: parseInt(state.created),
          lastAccessed: parseInt(state.lastAccessed)
        };
      } catch (error) {
        console.error(`[MCP State] Error loading state ${stateId}:`, error);
        return null;
      }
    });

    const states = await Promise.all(statePromises);

    // Filter out nulls (expired or filtered states)
    const validStates = states.filter(Boolean);

    console.log(`[MCP State] Listed ${validStates.length} states for user ${userId}`);

    return validStates;

  } catch (error) {
    console.error('[MCP State] Error listing states:', error);
    throw new Error(`Failed to list states: ${error.message}`);
  }
}

/**
 * Delete a state
 * @param {string} userId - The user ID
 * @param {string} stateId - The state ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteState(userId, stateId) {
  if (!isRedisConnected()) {
    throw new Error('Redis not connected');
  }

  if (!userId || !stateId) {
    throw new Error('userId and stateId are required');
  }

  try {
    // Delete the state hash
    const stateKey = `mcp:state:${userId}:${stateId}`;
    const deleted = await redis.del(stateKey);

    // Remove from index
    const indexKey = `mcp:state:index:${userId}`;
    await redis.zRem(indexKey, stateId);

    console.log(`[MCP State] Deleted state ${stateId} for user ${userId}`);

    return deleted > 0;

  } catch (error) {
    console.error('[MCP State] Error deleting state:', error);
    throw new Error(`Failed to delete state: ${error.message}`);
  }
}

export default {
  saveState,
  loadState,
  listStates,
  deleteState
};
