import redis from "@/lib/redis";
import { getError } from "@/utils/helper";
const { CACHE_KEYS, CACHE_TTL } = require("@/lib/cacheHelpers");

// Process-level cache for API definitions
const apiDefinitionCache = new Map();
const API_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function getApiDefinition(apiId, apiToken) {
  try {
    // Check process-level cache first
    const cached = apiDefinitionCache.get(apiId);

    if (cached && Date.now() - cached.timestamp < API_CACHE_TTL) {
      if (cached.data.needsToken && !apiToken) {
        return getError("Authentication required. Please provide a valid token.");
      }
      return cached.data;
    }

    const blobBasicUrl = process.env.NEXT_VERCEL_BLOB_URL;
    if (!blobBasicUrl) {
      return getError("configuration error");
    }

    // Get service info from Redis
    let serviceInfo;
    try {
      serviceInfo = await redis.HMGET(`service:${apiId}:published`, [
        "urlData",
        "tenantId",
        "needsToken",
        "useCaching",
        "tokens",
        "webhookUrl",
        "webhookSecret",
        "serviceName",
        "description",
      ]);
    } catch (redisError) {
      console.error(`Redis error for ${apiId}:`, redisError);
      return getError("database error");
    }

    if (!serviceInfo || !serviceInfo[0]) {
      const serviceExists = await redis.exists(`service:${apiId}`);
      if (serviceExists) {
        return getError("Service not published");
      }
      return getError("Service not found");
    }

    const apiUrl = serviceInfo[0];
    const tenantId = serviceInfo[1];
    const needsToken = serviceInfo[2] === "true";
    const useCaching = serviceInfo[3] === "true";
    const tokens = serviceInfo[4] ? serviceInfo[4].split(",") : [];
    const webhookUrl = serviceInfo[5] || '';
    const webhookSecret = serviceInfo[6] || '';
    const serviceName = serviceInfo[7] || '';
    const description = serviceInfo[8] || '';

    if (!apiUrl) {
      return getError("Service not published");
    }

    if (needsToken && !apiToken) {
      return getError("Authentication required. Please provide a valid token.");
    }

    let result;

    // Try Redis cache if enabled
    if (useCaching) {
      try {
        const cacheKey = CACHE_KEYS.apiCache(apiId);
        const cacheExists = await redis.exists(cacheKey);
        if (cacheExists) {
          result = await redis.json.get(cacheKey);
          if (result) {
            const cacheData = {
              ...result,
              needsToken,
              tokens,
              useCaching,
              webhookUrl,
              webhookSecret,
              serviceName,
              description,
            };
            apiDefinitionCache.set(apiId, { data: cacheData, timestamp: Date.now() });
            return cacheData;
          }
        }
      } catch (cacheError) {
        console.error(`Cache error for ${apiId}:`, cacheError);
      }
    }

    // Fetch from blob storage
    if (!result) {
      try {
        const fetchUrl = apiUrl.startsWith('http') ? apiUrl : blobBasicUrl + apiUrl;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(fetchUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          return getError(`fetch failed: ${response.status}`);
        }

        const responseJson = await response.json();

        // Cache the result
        if (useCaching && responseJson) {
          try {
            const cacheKey = CACHE_KEYS.apiCache(apiId);
            await redis.json.set(cacheKey, "$", responseJson);
            await redis.expire(cacheKey, CACHE_TTL.api);
          } catch (setCacheError) {
            console.error(`Cache set error for ${apiId}:`, setCacheError);
          }
        }
        result = responseJson;
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          return getError("request timed out");
        }
        console.error(`Fetch error for ${apiId}:`, fetchError);
        return getError("error getting api data");
      }
    }

    // Store in process cache
    if (result && !result.error) {
      const cacheData = {
        ...result,
        needsToken,
        tokens,
        useCaching,
        webhookUrl,
        webhookSecret,
        serviceName,
        description,
      };
      apiDefinitionCache.set(apiId, { data: cacheData, timestamp: Date.now() });
      return cacheData;
    }

    return result;
  } catch (error) {
    console.error(`Error in getApiDefinition for ${apiId}:`, error);
    return getError("internal server error");
  }
}
