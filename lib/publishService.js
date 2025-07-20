import { put, del } from '@vercel/blob';
import redis from './redis';

// Direct service management functions (no HTTP needed)

export async function checkServiceExists(apiId) {
  try {
    const exists = await redis.exists(`service:${apiId}`);
    return exists > 0;
  } catch (error) {
    console.error("Error checking service:", error);
    return false;
  }
}

export async function getServiceStatus(apiId) {
  try {
    const exists = await redis.exists(`service:${apiId}`);
    if (!exists) {
      return { published: false, status: 'draft' };
    }
    
    // Get service metadata
    const serviceData = await redis.hGetAll(`service:${apiId}`);
    
    return {
      published: true,
      status: 'published',
      publishedAt: serviceData.created || serviceData.modified,
      lastModified: serviceData.modified,
      useCaching: serviceData.useCaching === 'true',
      needsToken: serviceData.needsToken === 'true',
      urlData: serviceData.urlData
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
      const oldBlobUrl = await redis.hGet(`service:${apiId}`, "urlData");
      if (oldBlobUrl) {
        try {
          await del(oldBlobUrl);
        } catch (err) {
          console.warn("Failed to delete old blob:", err);
        }
      }
    }
    
    // Upload to blob storage
    const uploadPath = `${tenant}/data/${fileName}`;
    const uploadInfo = await put(uploadPath, buffer, { 
      access: "public",
      contentType: "application/json"
    });
    
    const blobBasicUrl = process.env.NEXT_VERCEL_BLOB_URL || '';
    const blobUrl = uploadInfo.url?.replace(blobBasicUrl, "");
    const timestamp = new Date().toISOString();
    
    // Prepare service metadata
    const serviceData = {
      apiId: apiId,
      tenantId: tenant,
      urlData: blobUrl,
      title: apiJson.title || "Untitled Service",
      tokens: (apiJson.tokens || []).join(","),
      useCaching: apiJson.flags?.useCaching || "true",
      needsToken: apiJson.flags?.needsToken || "false",
      ...(isExisting ? { modified: timestamp } : { created: timestamp })
    };
    
    // Save to Redis
    await redis.hSet(`service:${apiId}`, serviceData);
    
    // Cache the JSON data for quick access
    if (fileJson) {
      await redis.json.set(`cache:blob:${apiId}`, "$", { apiJson, fileJson });
      await redis.expire(`cache:blob:${apiId}`, 60 * 3); // Cache for 3 minutes
    }
    
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
    throw new Error(`Failed to ${isExisting ? 'update' : 'create'} service: ${error.message}`);
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
    await redis.del(`cache:blob:${apiId}`);
    
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