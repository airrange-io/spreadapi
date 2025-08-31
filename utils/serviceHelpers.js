import redis from "../lib/redis";
import { normalizeService } from "./normalizeServiceData";

/**
 * Get full service details including inputs, outputs, and areas
 * This is the centralized function to avoid redundant Redis calls
 * 
 * @param {string} serviceId - The service ID
 * @param {string} userId - The user ID for ownership verification (optional for internal use)
 * @returns {object|null} Service details or null if not found/unauthorized
 */
export async function getServiceDetails(serviceId, userId = null) {
  try {
    console.log('[ServiceHelper] Getting service details for:', serviceId);
    
    // First check if this is a published service
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    console.log('[ServiceHelper] Is published?', isPublished);
    
    // Always get base service data for metadata (name, id, description, etc.)
    const baseServiceData = await redis.hGetAll(`service:${serviceId}`);
    
    // Get the appropriate data source for inputs/outputs/areas
    let serviceData;
    if (isPublished) {
      // For published services, use published data for inputs/outputs but merge with base metadata
      const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
      serviceData = {
        ...baseServiceData,  // Base metadata (id, name, description, etc.)
        ...publishedData,     // Published snapshot (inputs, outputs, areas, etc.)
        id: baseServiceData.id,  // Ensure we keep the original ID
        name: baseServiceData.name,  // Ensure we keep the original name
        description: baseServiceData.description  // Keep original description
      };
    } else {
      serviceData = baseServiceData;
    }
    
    console.log('[ServiceHelper] Service data found:', {
      id: serviceData?.id,
      name: serviceData?.name,
      hasInputs: !!serviceData?.inputs,
      hasOutputs: !!serviceData?.outputs,
      inputCount: serviceData?.inputs ? JSON.parse(serviceData.inputs).length : 0,
      outputCount: serviceData?.outputs ? JSON.parse(serviceData.outputs).length : 0
    });
    
    if (!serviceData || Object.keys(serviceData).length === 0) {
      console.log('[ServiceHelper] No service data found');
      return null;
    }
    
    // Verify ownership if userId is provided
    if (userId && serviceData.userId !== userId) {
      // Check for demo service access
      const isDemoService = serviceId.startsWith('demoservice_');
      if (!isDemoService) {
        return null; // Unauthorized
      }
    }
    
    // Parse JSON fields safely
    const parseJsonField = (field, defaultValue = []) => {
      if (!field) return defaultValue;
      try {
        return JSON.parse(field);
      } catch (e) {
        console.error(`Error parsing JSON field:`, e);
        return defaultValue;
      }
    };
    
    // Build the service details object
    const serviceDetails = {
      id: serviceData.id || serviceId,
      name: serviceData.name || 'Untitled Service',
      description: serviceData.description || '',
      inputs: parseJsonField(serviceData.inputs, []),
      outputs: parseJsonField(serviceData.outputs, []),
      areas: parseJsonField(serviceData.areas, []),
      // AI metadata
      aiDescription: serviceData.aiDescription || '',
      aiUsageExamples: parseJsonField(serviceData.aiUsageExamples, []),
      aiTags: parseJsonField(serviceData.aiTags, []),
      category: serviceData.category || '',
      // Other metadata
      enableCaching: serviceData.cacheEnabled !== 'false',
      requireToken: serviceData.requireToken === 'true',
      createdAt: serviceData.createdAt,
      updatedAt: serviceData.updatedAt
    };
    
    // Add published status info
    if (isPublished) {
      const publishedData = serviceData; // We already have it from above
      serviceDetails.published = {
        status: true,
        publishedAt: publishedData.created || null,
        version: publishedData.version || null,
        calls: parseInt(publishedData.calls || '0'),
        lastUsed: publishedData.lastUsed || null
      };
    } else {
      serviceDetails.published = {
        status: false
      };
    }
    
    // Normalize the service data to ensure consistency
    return normalizeService(serviceDetails);
  } catch (error) {
    console.error('Error fetching service details:', error);
    return null;
  }
}

/**
 * Get published service details (for MCP and public APIs)
 * Only returns data if the service is published
 * 
 * @param {string} serviceId - The service ID
 * @returns {object|null} Published service details or null if not found/not published
 */
export async function getPublishedServiceDetails(serviceId) {
  try {
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (!isPublished) {
      return null;
    }
    
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
    if (!publishedData || !publishedData.urlData) {
      return null;
    }
    
    // Parse JSON fields
    const parseJsonField = (field, defaultValue = []) => {
      if (!field) return defaultValue;
      try {
        return JSON.parse(field);
      } catch (e) {
        return defaultValue;
      }
    };
    
    const publishedService = {
      id: serviceId,
      title: publishedData.title || serviceId,
      description: publishedData.description || publishedData.aiDescription || '',
      inputs: parseJsonField(publishedData.inputs, []),
      outputs: parseJsonField(publishedData.outputs, []),
      areas: parseJsonField(publishedData.areas, []),
      aiUsageExamples: parseJsonField(publishedData.aiUsageExamples, []),
      urlData: publishedData.urlData,
      version: publishedData.version || null,
      calls: parseInt(publishedData.calls || '0'),
      lastUsed: publishedData.lastUsed || null
    };
    
    // Normalize the published service data
    return normalizeService(publishedService);
  } catch (error) {
    console.error('Error fetching published service details:', error);
    return null;
  }
}