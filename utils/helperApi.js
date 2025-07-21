import redis from "../lib/redis";
import { getError } from "../utils/helper";
const { CACHE_KEYS, CACHE_TTL } = require("../lib/cacheHelpers");

// Process-level cache for API definitions
const apiDefinitionCache = new Map();
const API_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Export cache stats for monitoring
export function getApiDefinitionCacheStats() {
  return {
    size: apiDefinitionCache.size,
    maxSize: 'unlimited',
    ttlMs: API_CACHE_TTL,
    ttlMinutes: API_CACHE_TTL / 60 / 1000
  };
}

export async function getApiDefinition(apiId, apiToken) {
  const perfStart = Date.now();
  try {
    // Check process-level cache first
    const cacheKey = `${apiId}:${apiToken || 'no-token'}`;
    const cached = apiDefinitionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < API_CACHE_TTL) {
      const perfEnd = Date.now();
      console.log(`[CACHE HIT] Process cache for ${apiId} - ${perfEnd - perfStart}ms`);
      return cached.data;
    }
    console.log(`[CACHE MISS] Process cache for ${apiId}`);
    
    let result;
    const blobBasicUrl = process.env.NEXT_VERCEL_BLOB_URL;
    if (!blobBasicUrl) {
      console.error("Missing NEXT_VERCEL_BLOB_URL environment variable");
      return getError("configuration error");
    }

    // get the api url from redis
    console.time("getRedisData");

    let serviceInfo;
    try {
      // Look for published service data
      serviceInfo = await redis.HMGET(`service:${apiId}:published`, [
        "urlData",
        "tenantId",
        "needsToken",
        "useCaching",
        "tokens",
      ]);
    } catch (redisError) {
      console.error(
        `Redis error when fetching service info for ${apiId}:`,
        redisError
      );
      return getError("database error");
    }

    if (!serviceInfo) {
      console.error(`No service info found for ${apiId}`);
      return getError("service not found");
    }

    let apiUrl = serviceInfo[0];
    let tenantId = serviceInfo[1];
    let needsToken = serviceInfo[2] === "true";
    let useCaching = serviceInfo[3] === "true";
    let tokens = serviceInfo[4] ? serviceInfo[4]?.split(",") : [];

    // check the tokens and flags
    if (!apiUrl) {
      console.error(`No API URL found for service:${apiId}`);
      return getError("no api info found");
    }

    if (needsToken && !apiToken) {
      console.error(`Token required but not provided for service:${apiId}`);
      return getError("no token found");
    }

    if (needsToken && tokens && !tokens.includes(apiToken)) {
      console.error(`Invalid token provided for service:${apiId}`);
      return getError("api token is not correct");
    }

    console.timeEnd("getRedisData");

    console.time("fetchData");
    // try to get data from redis first
    if (useCaching) {
      try {
        const cacheKey = CACHE_KEYS.apiCache(apiId);
        const cacheExists = await redis.exists(cacheKey);
        if (cacheExists) {
          result = await redis.json.get(cacheKey);
          if (result) {
            console.timeEnd("fetchData");
            // Store in process-level cache before returning
            apiDefinitionCache.set(cacheKey, {
              data: result,
              timestamp: Date.now()
            });
            const perfEnd = Date.now();
            console.log(`[CACHE HIT] Redis cache for ${apiId} - ${perfEnd - perfStart}ms (stored in process cache, size: ${apiDefinitionCache.size})`);
            return result;
          }
        }
      } catch (cacheError) {
        console.error(
          `Cache retrieval error for service:${apiId}:`,
          cacheError
        );
        // Continue to fetch from API if cache retrieval fails
      }
    }

    // if not found, fetch from the api url
    if (!result) {
      try {
        // If apiUrl already contains the full URL, use it directly
        const fetchUrl = apiUrl.startsWith('http') ? apiUrl : blobBasicUrl + apiUrl;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        const response = await fetch(fetchUrl, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(
            `API fetch failed for ${fetchUrl} with status: ${response.status}`
          );
          return getError(`api fetch failed: ${response.status}`);
        }

        const responseJson = await response.json();

        if (useCaching && responseJson) {
          try {
            const cacheKey = CACHE_KEYS.apiCache(apiId);
            await redis.json.set(cacheKey, "$", responseJson);
            await redis.expire(cacheKey, CACHE_TTL.api);
          } catch (setCacheError) {
            console.error(
              `Failed to set cache for service:${apiId}:`,
              setCacheError
            );
            // Continue even if caching fails
          }
        }
        result = responseJson;
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          console.error(`API fetch timeout for service:${apiId}`);
          return getError("api request timed out");
        } else {
          console.error(`API fetch error for service:${apiId}:`, fetchError);
          return getError("error getting api data");
        }
      }
    }
    console.timeEnd("fetchData");

    // Store in process-level cache
    if (result && !result.error) {
      apiDefinitionCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      const perfEnd = Date.now();
      console.log(`[CACHE MISS] Fetched from blob for ${apiId} - ${perfEnd - perfStart}ms (cached in process & Redis, size: ${apiDefinitionCache.size})`);
    }

    return result;
  } catch (error) {
    console.error(
      `Unexpected error in getApiDefinition for service:${apiId}:`,
      error
    );
    return getError("internal server error");
  }
}
