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
      urlData: publishedData.urlData,
      fileSize: publishedData.fileSize ? parseInt(publishedData.fileSize) : null
    };
  } catch (error) {
    console.error("Error getting service status:", error);
    return { published: false, status: 'error' };
  }
}

export async function createOrUpdateService(apiId, publishData, tenant = null, userId = null) {
  const startTime = Date.now();
  console.warn(`[Publish] Starting publish for service ${apiId}`);

  try {
    const { apiJson, fileJson } = publishData;

    if (!apiJson) {
      throw new Error('Missing apiJson in publish data');
    }

    // Prepare the file data
    const jsonString = JSON.stringify({ apiJson, fileJson });
    const buffer = Buffer.from(jsonString);
    const fileName = `${apiId}.json`;
    const fileSize = buffer.length;
    console.log(`[Publish] Prepared data for ${apiId}: ${(fileSize / 1024).toFixed(1)}KB`);

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

    const blobBasicUrl = process.env.NEXT_VERCEL_BLOB_URL || '';
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
      aiUsageGuidance: apiJson.aiUsageGuidance || '',
      aiUsageExamples: JSON.stringify(apiJson.aiUsageExamples || []),
      aiTags: JSON.stringify(apiJson.aiTags || []),
      category: apiJson.category || 'general',

      // Store Web App settings
      webAppEnabled: apiJson.webAppEnabled?.toString() || 'false',
      webAppToken: apiJson.webAppToken || '',

      // Store file size for UI display
      fileSize: fileSize.toString()
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

    const duration = Date.now() - startTime;
    console.warn(`[Publish] Successfully ${isExisting ? 'updated' : 'created'} service ${apiId} in ${duration}ms`);

    return {
      success: true,
      apiId,
      fileUrl: blobUrl,
      fileName,
      fileSize,  // Raw bytes for UI to format
      isNewService: !isExisting,
      status: isExisting ? 'updated' : 'created'
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Publish] Failed to publish service ${apiId} after ${duration}ms:`, error.message);
    throw new Error(`Failed to create/update service: ${error.message}`);
  }
}

export async function deleteService(apiId) {
  console.log(`[Delete] Starting delete for service ${apiId}`);

  try {
    // Get service data BEFORE deleting (need userId for index cleanup)
    const serviceData = await redis.hGetAll(`service:${apiId}`);
    if (!serviceData || Object.keys(serviceData).length === 0) {
      console.warn(`[Delete] Service ${apiId} not found`);
      throw new Error("Service not found");
    }

    // Delete published API blob (urlData is in :published key)
    const publishedBlobUrl = await redis.hGet(`service:${apiId}:published`, "urlData");
    if (publishedBlobUrl) {
      try {
        await del(publishedBlobUrl);
      } catch (err) {
        console.warn("Failed to delete published blob:", err);
      }
    }

    // Delete draft workbook blob (workbookUrl is in draft key)
    if (serviceData.workbookUrl) {
      try {
        await del(serviceData.workbookUrl);
      } catch (err) {
        console.warn("Failed to delete workbook blob:", err);
      }
    }

    // Delete from Redis (both draft and published)
    await redis.del(`service:${apiId}`);
    await redis.del(`service:${apiId}:published`);
    await redis.del(CACHE_KEYS.apiCache(apiId));
    await redis.del(CACHE_KEYS.resultCache(apiId));

    // Remove from user's service index
    if (serviceData.userId) {
      await redis.hDel(`user:${serviceData.userId}:services`, apiId);
    }

    console.log(`[Delete] Successfully deleted service ${apiId}`);

    return {
      success: true,
      apiId,
      status: 'deleted'
    };

  } catch (error) {
    console.error(`[Delete] Failed to delete service ${apiId}:`, error.message);
    throw new Error(`Failed to delete service: ${error.message}`);
  }
}