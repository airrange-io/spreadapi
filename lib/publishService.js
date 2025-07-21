import { put, del } from '@vercel/blob';
import redis from './redis';
import { CACHE_KEYS, CACHE_TTL } from './cacheHelpers';

// Direct service management functions (no HTTP needed)

export async function checkServiceExists(apiId) {
  try {
    // Check if the service is published
    const exists = await redis.exists(`service:${apiId}:published`);
    return exists === 1;
  } catch (error) {
    console.error("Error checking service:", error);
    return false;
  }
}

export async function getServiceStatus(apiId) {
  try {
    const exists = await redis.exists(`service:${apiId}:published`);
    if (!exists) {
      return { published: false, status: 'draft' };
    }
    
    // Get published service metadata
    const publishedData = await redis.hGetAll(`service:${apiId}:published`);
    
    return {
      published: true,
      status: 'published',
      publishedAt: publishedData.created,
      lastModified: publishedData.modified,
      useCaching: publishedData.useCaching === 'true',
      needsToken: publishedData.needsToken === 'true',
      urlData: publishedData.urlData
    };
  } catch (error) {
    console.error("Error getting service status:", error);
    return { published: false, status: 'error' };
  }
}

export async function createOrUpdateService(apiId, publishData, tenant = 'test1234') {
  try {
    const { apiJson, fileJson } = publishData;
    
    // Prepare the file data
    const jsonString = JSON.stringify({ apiJson, fileJson });
    const buffer = Buffer.from(jsonString);
    const fileName = `${apiId}.json`;
    const fileSize = buffer.length;
    
    // Check if service exists
    const isExisting = await checkServiceExists(apiId);
    
    // Delete old blob if updating
    if (isExisting) {
      const oldBlobUrl = await redis.hGet(`service:${apiId}:published`, "urlData");
      if (oldBlobUrl) {
        try {
          await del(oldBlobUrl);
        } catch (err) {
          console.warn("Failed to delete old blob:", err);
        }
      }
    }
    
    // Upload to blob storage
    const uploadPath = `${tenant}/apis/${fileName}`;
    const uploadInfo = await put(uploadPath, buffer, { 
      access: "public",
      contentType: "application/json"
    });
    
    const blobBasicUrl = process.env.NEXT_PUBLIC_VERCEL_BLOB_URL || '';
    const blobUrl = uploadInfo.url?.replace(blobBasicUrl, "");
    const timestamp = new Date().toISOString();
    
    // Create published service data for calculation engine
    const publishedData = {
      apiId: apiId,
      tenantId: tenant,
      urlData: blobUrl,
      title: apiJson.title || "Untitled Service",
      tokens: (apiJson.tokens || []).join(","),
      useCaching: apiJson.flags?.useCaching || "true",
      needsToken: apiJson.flags?.needsToken || "false",
      created: isExisting ? await redis.hGet(`service:${apiId}:published`, "created") || timestamp : timestamp,
      modified: timestamp,
      calls: isExisting ? await redis.hGet(`service:${apiId}:published`, "calls") || "0" : "0"
    };
    
    // Save published data
    await redis.hSet(`service:${apiId}:published`, publishedData);
    
    // Also create/update the legacy structure for calculation engine compatibility
    await redis.hSet(`service:${apiId}`, publishedData);
    
    // Cache the JSON data for quick access
    if (fileJson) {
      const cacheKey = CACHE_KEYS.apiCache(apiId);
      await redis.json.set(cacheKey, "$", { apiJson, fileJson });
      await redis.expire(cacheKey, 60 * 3); // Cache for 3 minutes to warm up
    }
    
    // Update the user's service index
    await redis.hSet(`user:test1234:services`, apiId, 'published');
    
    return {
      success: true,
      apiId,
      fileUrl: blobUrl,
      fileName,
      fileSize: (fileSize / 1024).toFixed(1) + 'KB',
      isNewService: !isExisting,
      status: isExisting ? 'updated' : 'created'
    };
    
  } catch (error) {
    console.error("Error creating/updating service:", error);
    throw new Error(`Failed to create/update service: ${error.message}`);
  }
}

export async function deleteService(apiId) {
  try {
    const exists = await checkServiceExists(apiId);
    if (!exists) {
      throw new Error("Service not found");
    }
    
    // Delete blob
    const blobUrl = await redis.hGet(`service:${apiId}`, "urlData");
    if (blobUrl) {
      await del(blobUrl);
    }
    
    // Delete from Redis
    await redis.del(`service:${apiId}`);
    await redis.del(CACHE_KEYS.apiCache(apiId));
    
    return {
      success: true,
      apiId,
      status: 'deleted'
    };
    
  } catch (error) {
    console.error("Error deleting service:", error);
    throw new Error(`Failed to delete service: ${error.message}`);
  }
}