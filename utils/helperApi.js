import redis from "../lib/redis";
import { getError } from "../utils/helper";

export async function getApiDefinition(apiId, apiToken) {
  try {
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
      serviceInfo = await redis.HMGET("service:" + apiId, [
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
        const cacheExists = await redis.exists("cache:blob:" + apiId);
        if (cacheExists) {
          result = await redis.json.get("cache:blob:" + apiId);
          if (result) {
            console.timeEnd("fetchData");
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
        const fetchUrl = blobBasicUrl + apiUrl;
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
            await redis.json.set("cache:blob:" + apiId, "$", responseJson);
            await redis.expire("cache:blob:" + apiId, 60 * 30); // cache for 30 minutes
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

    return result;
  } catch (error) {
    console.error(
      `Unexpected error in getApiDefinition for service:${apiId}:`,
      error
    );
    return getError("internal server error");
  }
}
