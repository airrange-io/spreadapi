import { put, del } from '@vercel/blob';
import redis from './redis';
import { CACHE_KEYS, CACHE_TTL, invalidateServiceCache } from './cacheHelpers';
import { revalidateServicesCache } from './revalidateServices';

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

export async function createOrUpdateService(apiId, publishData, tenant = null, userId = null) {
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
    
    // Use userId as tenant if not provided
    const effectiveTenant = tenant || userId || 'default';
    
    // Upload to blob storage
    const uploadPath = `${effectiveTenant}/apis/${fileName}`;
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
      tenantId: effectiveTenant,
      urlData: blobUrl,
      title: apiJson.title || "Untitled Service",
      description: apiJson.description || '',  // Add regular service description
      tokens: (apiJson.tokens || []).join(","),
      useCaching: apiJson.flags?.useCaching || "true",
      needsToken: apiJson.flags?.needsToken || "false",
      cacheTableSheetData: apiJson.flags?.cacheTableSheetData || "true",
      tableSheetCacheTTL: apiJson.flags?.tableSheetCacheTTL || 300,
      created: isExisting ? await redis.hGet(`service:${apiId}:published`, "created") || timestamp : timestamp,
      modified: timestamp,
      calls: isExisting ? await redis.hGet(`service:${apiId}:published`, "calls") || "0" : "0",
      
      // Store API definition directly in Redis for MCP efficiency
      inputs: JSON.stringify(apiJson.inputs || []),
      outputs: JSON.stringify(apiJson.outputs || []),
      areas: JSON.stringify(apiJson.areas || []),
      
      // Store AI metadata if available
      aiDescription: apiJson.aiDescription || '',
      aiUsageExamples: JSON.stringify(apiJson.aiUsageExamples || []),
      aiTags: JSON.stringify(apiJson.aiTags || []),
      category: apiJson.category || 'general'
    };
    
    // Save published data (only one place now)
    await redis.hSet(`service:${apiId}:published`, publishedData);
    
    // Cache the JSON data for quick access
    if (fileJson) {
      const cacheKey = CACHE_KEYS.apiCache(apiId);
      await redis.json.set(cacheKey, "$", { apiJson, fileJson });
      await redis.expire(cacheKey, CACHE_TTL.api); // Use standard API cache TTL (30 minutes)
    }

    // Invalidate all cached results and workbook for this service
    // This ensures the next calculation uses the fresh published data
    await invalidateServiceCache(redis, apiId);

    // Update the user's service index with just the status
    // Get userId from service data if not provided
    if (!userId) {
      const serviceData = await redis.hGetAll(`service:${apiId}`);
      userId = serviceData.userId || effectiveTenant;
    }
    
    // Update index with simple status (as per SERVICE_ARCHITECTURE.md)
    if (userId && userId !== 'default') {
      await redis.hSet(`user:${userId}:services`, apiId, 'published');
    }
    
    // Revalidate services cache
    await revalidateServicesCache();
    
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
    
    // Remove from user's service index
    const serviceData = await redis.hGetAll(`service:${apiId}`);
    if (serviceData.userId) {
      await redis.hDel(`user:${serviceData.userId}:services`, apiId);
    }
    
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