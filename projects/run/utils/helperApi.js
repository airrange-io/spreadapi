import redis from "../lib/redis.js";
import { getError } from "./helper.js";
const { CACHE_KEYS, CACHE_TTL } = require("../lib/cacheHelpers.ts");

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
    const cached = apiDefinitionCache.get(apiId);

    if (cached && Date.now() - cached.timestamp < API_CACHE_TTL) {
      console.log(`[CACHE HIT] Process cache for ${apiId} - ${Date.now() - perfStart}ms`);
      if (cached.data.needsToken && !apiToken) {
        return getError("Authentication required. Please provide a valid token.");
      }
      return cached.data;
    }
    console.log(`[CACHE MISS] Process cache for ${apiId}`);

    const blobBasicUrl = process.env.NEXT_VERCEL_BLOB_URL;
    if (!blobBasicUrl) {
      console.error("[Config Error] Missing NEXT_VERCEL_BLOB_URL environment variable");
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
        "fullDescription",
        "aiDescription",
        "aiUsageGuidance",
        "cacheTableSheetData",
        "tableSheetCacheTTL",
      ]);
    } catch (redisError) {
      console.error(`[Redis Error] Failed to fetch service info for ${apiId}:`, redisError.message);
      return getError("database error");
    }

    if (!serviceInfo || !serviceInfo[0]) {
      try {
        const serviceExists = await redis.exists(`service:${apiId}`);
        if (serviceExists) {
          console.error(`[Service Error] Service ${apiId} exists but is not published`);
          return getError("Service not published. Please publish the service before making API calls.");
        }
      } catch (checkError) {
        console.error(`[Redis Error] Failed to check service existence for ${apiId}:`, checkError.message);
      }
      console.error(`[Service Error] No service found for ${apiId}`);
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
    const fullDescription = serviceInfo[9] || '';
    const aiDescription = serviceInfo[10] || '';
    const aiUsageGuidance = serviceInfo[11] || '';
    const cacheTableSheetData = serviceInfo[12] || 'true';
    const tableSheetCacheTTL = serviceInfo[13] || '300';

    if (!apiUrl) {
      console.error(`[Service Error] No API URL found for service ${apiId} - service may not be published`);
      return getError("Service not published");
    }

    if (needsToken && !apiToken) {
      console.error(`[Auth Error] Token required but not provided for service ${apiId}`);
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
              fullDescription,
              aiDescription,
              aiUsageGuidance,
              cacheTableSheetData,
              tableSheetCacheTTL,
            };
            apiDefinitionCache.set(apiId, { data: cacheData, timestamp: Date.now() });
            console.log(`[CACHE HIT] Redis cache for ${apiId} - ${Date.now() - perfStart}ms`);
            return cacheData;
          }
        }
      } catch (cacheError) {
        console.error(`[Cache Error] Redis cache retrieval failed for ${apiId}:`, cacheError.message);
        // Continue to fetch from blob if cache retrieval fails
      }
    }

    // Fetch from blob storage
    if (!result) {
      try {
        const fetchUrl = apiUrl.startsWith('http') ? apiUrl : blobBasicUrl + apiUrl;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        console.log(`[Blob Fetch] Fetching ${apiId} from blob storage...`);
        const response = await fetch(fetchUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(`[Blob Error] Fetch failed for ${apiId} with status ${response.status}`);

          // If blob fetch fails (404), try to return helpful error
          if (response.status === 404) {
            try {
              let serviceData = await redis.hGetAll(`service:${apiId}:published`);
              if (!serviceData || Object.keys(serviceData).length === 0) {
                serviceData = await redis.hGetAll(`service:${apiId}`);
              }

              if (serviceData && Object.keys(serviceData).length > 0) {
                let inputs = [];
                let outputs = [];

                try {
                  const cacheKey = CACHE_KEYS.apiCache(apiId);
                  const cachedData = await redis.json.get(cacheKey);

                  if (cachedData && cachedData.apiJson) {
                    inputs = cachedData.apiJson.inputs || cachedData.apiJson.input || [];
                    outputs = cachedData.apiJson.outputs || cachedData.apiJson.output || [];
                  }
                } catch (e) {
                  console.error(`[Cache Error] Failed to get inputs/outputs for ${apiId}:`, e.message);
                }

                return {
                  error: "Missing required parameters",
                  message: "This API requires parameters to function. See the documentation below for usage instructions.",
                  service: {
                    id: apiId,
                    name: serviceData.title || serviceData.name || "Unnamed Service",
                    description: serviceData.description || description || "No description available"
                  },
                  parameters: {
                    required: inputs.filter(i => i.mandatory !== false).map(i => ({
                      name: i.name,
                      type: i.type || "string",
                      description: i.description || "",
                    })),
                    optional: inputs.filter(i => i.mandatory === false).map(i => ({
                      name: i.name,
                      type: i.type || "string",
                      description: i.description || "",
                    }))
                  },
                  outputs: outputs.map(o => ({
                    name: o.name,
                    type: o.type || "any",
                    description: o.description || ""
                  })),
                  example: {
                    url: `https://spreadapi.run/${apiId}${
                      inputs.filter(i => i.mandatory !== false).length > 0
                        ? '?' + inputs.filter(i => i.mandatory !== false)
                            .map(i => `${i.name}={value}`)
                            .join('&')
                        : ''
                    }`,
                    description: "Replace {value} with your actual parameter values"
                  },
                  suggestion: "Try republishing the service from the service editor."
                };
              }
            } catch (err) {
              console.error(`[Error] Failed to fetch service info after 404 for ${apiId}:`, err.message);
            }
          }

          return getError(`fetch failed: ${response.status}`);
        }

        const responseJson = await response.json();

        // Cache the result
        if (useCaching && responseJson) {
          try {
            const cacheKey = CACHE_KEYS.apiCache(apiId);
            await redis.json.set(cacheKey, "$", responseJson);
            await redis.expire(cacheKey, CACHE_TTL.api);
            console.log(`[Cache] Stored API definition for ${apiId} in Redis cache`);
          } catch (setCacheError) {
            console.error(`[Cache Error] Failed to set Redis cache for ${apiId}:`, setCacheError.message);
            // Continue even if caching fails
          }
        }
        result = responseJson;
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          console.error(`[Timeout] Blob fetch timed out for ${apiId} after 60s`);
          return getError("request timed out");
        }
        console.error(`[Fetch Error] Blob fetch failed for ${apiId}:`, fetchError.message);
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
        fullDescription,
        aiDescription,
        aiUsageGuidance,
        cacheTableSheetData,
        tableSheetCacheTTL,
      };
      apiDefinitionCache.set(apiId, { data: cacheData, timestamp: Date.now() });
      console.log(`[CACHE MISS] Fetched from blob for ${apiId} - ${Date.now() - perfStart}ms (cached in process & Redis)`);
      return cacheData;
    }

    return result;
  } catch (error) {
    console.error(`[Critical Error] Unexpected error in getApiDefinition for ${apiId}:`, error);
    return getError("internal server error");
  }
}
