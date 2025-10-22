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
    // Note: We cache by apiId only since the API definition doesn't change based on token
    // Token validation happens separately after cache retrieval
    const cacheKey = apiId;
    const cached = apiDefinitionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < API_CACHE_TTL) {
      const perfEnd = Date.now();
      console.log(`[CACHE HIT] Process cache for ${apiId} - ${perfEnd - perfStart}ms`);
      
      // Still need to validate token if required
      if (cached.data.needsToken && !apiToken) {
        return getError("Authentication required. Please provide a valid token using the 'token' parameter.");
      }
      if (cached.data.needsToken && cached.data.tokens && !cached.data.tokens.includes(apiToken)) {
        return getError("Invalid token. Please check your authentication token.");
      }
      
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
        "webhookUrl",
        "webhookSecret",
      ]);
    } catch (redisError) {
      console.error(
        `Redis error when fetching service info for ${apiId}:`,
        redisError
      );
      return getError("database error");
    }

    if (!serviceInfo || !serviceInfo[0]) {
      // Check if service exists at all (not just published)
      const serviceExists = await redis.exists(`service:${apiId}`);
      if (serviceExists) {
        console.error(`Service ${apiId} exists but is not published`);
        return getError("Service not published. Please publish the service before making API calls.");
      } else {
        console.error(`No service found for ${apiId}`);
        return getError("Service not found. Please check the service ID.");
      }
    }

    let apiUrl = serviceInfo[0];
    let tenantId = serviceInfo[1];
    let needsToken = serviceInfo[2] === "true";
    let useCaching = serviceInfo[3] === "true";
    let tokens = serviceInfo[4] ? serviceInfo[4]?.split(",") : [];
    let webhookUrl = serviceInfo[5] || '';
    let webhookSecret = serviceInfo[6] || '';

    // check the tokens and flags
    if (!apiUrl) {
      console.error(`No API URL found for service:${apiId} - service may not be published`);
      return getError("Service not published. Please publish the service before making API calls.");
    }

    if (needsToken && !apiToken) {
      console.error(`Token required but not provided for service:${apiId}`);
      return getError("Authentication required. Please provide a valid token using the 'token' parameter.");
    }

    if (needsToken && tokens && !tokens.includes(apiToken)) {
      console.error(`Invalid token provided for service:${apiId}`);
      return getError("Invalid token. Please check your authentication token.");
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
            // Include needsToken, tokens, and webhook info
            const cacheData = {
              ...result,
              needsToken,
              tokens,
              useCaching,
              webhookUrl,
              webhookSecret
            };
            apiDefinitionCache.set(apiId, {
              data: cacheData,
              timestamp: Date.now()
            });
            const perfEnd = Date.now();
            console.log(`[CACHE HIT] Redis cache for ${apiId} - ${perfEnd - perfStart}ms (stored in process cache, size: ${apiDefinitionCache.size})`);
            return cacheData;
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
          
          // If blob fetch fails (404), try to get service info for documentation
          if (response.status === 404) {
            try {
              // First try to get published service data, then fall back to draft
              let serviceData = await redis.hGetAll(`service:${apiId}:published`);
              if (!serviceData || Object.keys(serviceData).length === 0) {
                serviceData = await redis.hGetAll(`service:${apiId}`);
              }
              
              if (serviceData && Object.keys(serviceData).length > 0) {
                // Try to get cached API definition for inputs/outputs
                let inputs = [];
                let outputs = [];
                let description = serviceData.description || "No description available";
                
                try {
                  // Try to get from Redis cache first
                  const cacheKey = CACHE_KEYS.apiCache(apiId);
                  const cachedData = await redis.json.get(cacheKey);
                  
                  if (cachedData && cachedData.apiJson) {
                    // Handle both plural (new) and singular (old) formats
                    inputs = cachedData.apiJson.inputs || cachedData.apiJson.input || [];
                    outputs = cachedData.apiJson.outputs || cachedData.apiJson.output || [];
                    description = cachedData.apiJson.description || description;
                  } else if (serviceData.inputs) {
                    // Fall back to parsing from service data if available
                    inputs = JSON.parse(serviceData.inputs);
                  }
                } catch (e) {
                  console.error('Error getting inputs/outputs:', e);
                  // Try parsing from serviceData as fallback
                  try {
                    if (serviceData.inputs) inputs = JSON.parse(serviceData.inputs);
                    if (serviceData.outputs) outputs = JSON.parse(serviceData.outputs);
                  } catch (e2) {
                    console.error('Error parsing inputs/outputs from service data:', e2);
                  }
                }
                
                // Return error with helpful documentation
                return {
                  error: "Missing required parameters",
                  message: "This API requires parameters to function. See the documentation below for usage instructions.",
                  service: {
                    id: apiId,
                    name: serviceData.title || serviceData.name || "Unnamed Service",
                    description: description
                  },
                  parameters: {
                    required: inputs.filter(i => i.mandatory !== false).map(i => ({
                      name: i.name,
                      type: i.type || "string",
                      description: i.description || "",
                      min: i.min,
                      max: i.max
                    })),
                    optional: inputs.filter(i => i.mandatory === false).map(i => ({
                      name: i.name,
                      type: i.type || "string",
                      description: i.description || "",
                      min: i.min,
                      max: i.max
                    }))
                  },
                  outputs: outputs.map(o => ({
                    name: o.name,
                    type: o.type || "any",
                    description: o.description || ""
                  })),
                  example: {
                    url: `https://spreadapi.io/api/v1/services/${apiId}/execute${
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
              console.error('Error fetching service info after 404:', err);
            }
          }
          
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
      // Include needsToken, tokens, and webhook info
      const cacheData = {
        ...result,
        needsToken,
        tokens,
        useCaching,
        webhookUrl,
        webhookSecret
      };
      apiDefinitionCache.set(apiId, {
        data: cacheData,
        timestamp: Date.now()
      });
      const perfEnd = Date.now();
      console.log(`[CACHE MISS] Fetched from blob for ${apiId} - ${perfEnd - perfStart}ms (cached in process & Redis, size: ${apiDefinitionCache.size})`);
      return cacheData;
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
