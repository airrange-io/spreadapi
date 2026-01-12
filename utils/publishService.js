// Client-safe publish service utilities
// NOTE: This file must not import any server-side modules like Redis

import { upload } from '@vercel/blob/client';
import { extractRangeValues } from '@/lib/rangeValidation';
import pako from 'pako';

// Payload size limits for publish operations
// Vercel serverless functions have a 4.5MB request body limit
// Compressed data is sent as base64 which adds ~33% overhead
// So 2.5MB compressed becomes ~3.3MB base64, safely under limit
export const PAYLOAD_LIMITS = {
  COMPRESSED_INLINE_THRESHOLD: 2.5 * 1024 * 1024,  // 2.5MB compressed - use blob above this
  LARGE_FILE_THRESHOLD: 1 * 1024 * 1024,  // 1MB raw - show progress above this
};

// Helper function to get object size in bytes
function getObjectSize(obj) {
  const jsonString = JSON.stringify(obj);
  return new Blob([jsonString]).size;
}

// Helper function for deep copy
function jsonCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Optimize workbook data for API service (remove unnecessary data)
function optimizeForService(fileData) {
  if (!fileData) return null;
  
  const data = jsonCopy(fileData);
  let sizeAfter;

  try {
    const sizeBefore = getObjectSize(data);

    // Remove named styles (not needed for calculations)
    if (data.namedStyles) {
      data.namedStyles = {};
    }

    // Get sheets object
    const sheets = data.sheets || {};

    // Remove internal sheets
    if (sheets.hasOwnProperty("AR_INFO")) delete sheets["AR_INFO"];
    if (sheets.hasOwnProperty("AR_LOGS")) delete sheets["AR_LOGS"];

    // Clean each sheet
    Object.keys(sheets).forEach((sheetName) => {
      const sheet = sheets[sheetName];
      
      // Remove visual elements not needed for calculations
      if (sheet.shapes) sheet.shapes = [];
      if (sheet.charts) sheet.charts = [];
      if (sheet.pictures) sheet.pictures = [];
      if (sheet.floatingObjects) sheet.floatingObjects = [];
      
      // Remove print settings
      if (sheet.printInfo) sheet.printInfo = {};
      
      // Remove conditional formatting (keep for calculations but remove if not needed)
      // if (sheet.conditionalFormats) sheet.conditionalFormats = {};
      
      // Clean cell styles from dataTable (keep values and formulas)
      const dataTable = sheet.data?.dataTable || {};
      Object.keys(dataTable).forEach((row) => {
        const rowData = dataTable[row];
        if (rowData && typeof rowData === 'object') {
          Object.keys(rowData).forEach((col) => {
            const cell = rowData[col];
            if (cell && typeof cell === 'object') {
              // Keep only essential properties for calculations
              const essentialProps = ['value', 'formula'];
              Object.keys(cell).forEach(prop => {
                if (!essentialProps.includes(prop)) {
                  delete cell[prop];
                }
              });
            }
          });
        }
      });

      // Remove row/column styles
      if (sheet.rowHeaderData) sheet.rowHeaderData = {};
      if (sheet.colHeaderData) sheet.colHeaderData = {};
    });

    sizeAfter = getObjectSize(data);

    return { data, dataSize: sizeAfter };
  } catch (error) {
    // Error optimizing for service
    return { data: fileData, dataSize: getObjectSize(fileData) };
  }
}

/**
 * Estimate the payload size in bytes for publish data
 * Returns both the size and the JSON string to avoid double serialization
 * @returns {{ size: number, jsonString: string }}
 */
export function estimatePayloadSize(publishData) {
  const jsonString = JSON.stringify(publishData);
  return {
    size: new Blob([jsonString]).size,
    jsonString // Cache the string to reuse in uploadLargePublishData
  };
}

/**
 * Compress data using gzip
 * @param {string} jsonString - JSON string to compress
 * @returns {{ compressed: Uint8Array, originalSize: number, compressedSize: number, ratio: number }}
 */
function compressData(jsonString) {
  const originalSize = new Blob([jsonString]).size;
  const compressed = pako.gzip(jsonString);
  const compressedSize = compressed.length;
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

  console.log(`[Publish Client] Compression: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${ratio}% reduction)`);

  return { compressed, originalSize, compressedSize, ratio: parseFloat(ratio) };
}

/**
 * Convert Uint8Array to base64 string
 * Uses chunked processing to avoid stack overflow on large arrays
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function uint8ArrayToBase64(bytes) {
  // Process in chunks to avoid "Maximum call stack size exceeded"
  const CHUNK_SIZE = 8192;
  const chunks = [];

  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length));
    chunks.push(String.fromCharCode.apply(null, chunk));
  }

  return btoa(chunks.join(''));
}

/**
 * Upload large compressed data to Vercel Blob storage
 * Returns the blob URL for the server to fetch
 * @param {string} serviceId - The service ID
 * @param {Uint8Array} compressedData - Gzip compressed data
 * @param {function} onProgress - Progress callback (percent: number) => void
 * @returns {Promise<string>} The blob URL
 */
async function uploadLargePublishData(serviceId, compressedData, onProgress) {
  const blob = new Blob([compressedData], { type: 'application/gzip' });
  const file = new File([blob], `${serviceId}-publish-data.json.gz`, { type: 'application/gzip' });

  console.log(`[Publish Client] Starting blob upload for ${serviceId}, compressed size: ${(compressedData.length / 1024).toFixed(1)}KB`);

  const result = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/blob/publish-upload',
    onUploadProgress: ({ loaded, total }) => {
      if (onProgress && total > 0) {
        const percent = Math.round((loaded / total) * 100);
        // Scale to 0-80% (leave 20% for server processing)
        onProgress(Math.round(percent * 0.8));
      }
    },
  });

  // Validate we got a URL back
  if (!result || !result.url) {
    console.error('[Publish Client] Blob upload failed - no URL returned', result);
    throw new Error('Blob upload failed - no URL returned');
  }

  console.log(`[Publish Client] Blob uploaded successfully: ${result.url.substring(0, 80)}...`);
  return result.url;
}

// Transform UI service data to manageapi format
export async function prepareServiceForPublish(spreadInstance, service, flags = {}) {
  if (!spreadInstance || !spreadInstance.toJSON) {
    throw new Error('Invalid spread instance - missing toJSON method');
  }

  // Get the workbook data in JSON format
  const workbookJSON = spreadInstance.toJSON({
    includeBindingSource: true,
    saveAsView: false
  });

  // Optimize the workbook data for API service
  const optimized = optimizeForService(workbookJSON);
  const optimizedWorkbook = optimized.data;

  // Transform input definitions to match manageapi format
  const transformedInputs = service.inputs.map(input => {
    // Parse the address to get sheet name and cell reference
    const addressParts = input.address.split('!');
    const sheetName = addressParts[0];
    const cellRef = addressParts[1];

    // Read current value from spreadsheet cell (update the existing value field)
    let currentValue = input.value || ''; // Default to existing value
    try {
      const worksheet = spreadInstance.getSheetFromName(sheetName);
      if (worksheet) {
        const freshValue = worksheet.getValue(input.row, input.col);
        if (freshValue !== null && freshValue !== undefined) {
          currentValue = freshValue;
          console.log(`[Publish] Updated value for ${input.name}: ${currentValue}`);
        }
      }
    } catch (error) {
      console.warn(`[Publish] Could not read current value for ${input.name}:`, error);
    }

    // Prepare the base input object
    const transformedInput = {
      id: input.id,
      address: input.address,
      name: input.name,
      title: input.title,  // Add the human-readable title
      row: input.row,
      col: input.col,
      type: input.type,
      value: currentValue, // Use fresh value from spreadsheet
      direction: 'input',
      mandatory: input.mandatory !== false,
      ...(input.min !== undefined && { min: input.min }),
      ...(input.max !== undefined && { max: input.max }),
      ...(input.description && { description: input.description }),
      ...(input.aiExamples && input.aiExamples.length > 0 && { aiExamples: input.aiExamples }),
      ...(input.allowedValuesCaseSensitive !== undefined && { allowedValuesCaseSensitive: input.allowedValuesCaseSensitive }),
      ...(input.defaultValue !== undefined && { defaultValue: input.defaultValue })
    };

    // Extract values from worksheet range if specified
    if (input.allowedValuesRange && input.allowedValuesRange.trim() !== '') {
      try {
        // Parse the range to get sheet name
        const rangeParts = input.allowedValuesRange.match(/^(?:'([^']+)'|([^!]+))!(.+)$/);
        if (rangeParts) {
          const rangeSheetName = rangeParts[1] || rangeParts[2];
          const worksheet = spreadInstance.getSheetFromName(rangeSheetName);

          if (worksheet) {
            const extraction = extractRangeValues(worksheet, input.allowedValuesRange);

            if (extraction.success) {
              transformedInput.allowedValues = extraction.values;
              transformedInput.allowedValuesRange = input.allowedValuesRange; // Keep source reference
              console.log(`[Publish] Extracted ${extraction.count} values from range ${input.allowedValuesRange} for parameter ${input.name}`);
            } else {
              console.warn(`[Publish] Failed to extract values from range ${input.allowedValuesRange}: ${extraction.error}`);
              // Keep manual allowedValues if extraction fails
              if (input.allowedValues && input.allowedValues.length > 0) {
                transformedInput.allowedValues = input.allowedValues;
              }
              transformedInput.allowedValuesRange = input.allowedValuesRange;
            }
          } else {
            console.warn(`[Publish] Sheet '${rangeSheetName}' not found for range ${input.allowedValuesRange}`);
            // Keep manual allowedValues if sheet not found
            if (input.allowedValues && input.allowedValues.length > 0) {
              transformedInput.allowedValues = input.allowedValues;
            }
            transformedInput.allowedValuesRange = input.allowedValuesRange;
          }
        }
      } catch (error) {
        console.error(`[Publish] Error extracting range values for ${input.name}:`, error);
        // Keep manual allowedValues on error
        if (input.allowedValues && input.allowedValues.length > 0) {
          transformedInput.allowedValues = input.allowedValues;
        }
      }
    } else if (input.allowedValues && input.allowedValues.length > 0) {
      // No range specified - use manual allowedValues
      transformedInput.allowedValues = input.allowedValues;
    }

    return transformedInput;
  });

  // Transform output definitions
  const transformedOutputs = service.outputs.map(output => {
    // Parse the address to get sheet name and cell reference
    const addressParts = output.address.split('!');
    const sheetName = addressParts[0];
    const cellRef = addressParts[1];

    return {
      id: output.id,
      address: output.address,
      name: output.name,
      title: output.title,  // Add the human-readable title
      row: output.row,
      col: output.col,
      type: output.type,
      value: output.value || '',
      direction: 'output',
      ...(output.description && { description: output.description }),
      ...(output.aiPresentationHint && { aiPresentationHint: output.aiPresentationHint }),
      // Store only the simple, editable format string
      ...(output.formatString && { formatString: output.formatString })
    };
  });

  // Prepare the data structure for manageapi
  const publishData = {
    apiJson: {
      title: service.name || "Untitled Service",
      name: service.name || "Untitled Service", // Include both for compatibility
      description: service.description || "",
      inputs: transformedInputs,  // Changed from 'input' to 'inputs'
      outputs: transformedOutputs,  // Changed from 'output' to 'outputs'
      tokens: flags.tokens || [],
      flags: {
        useCaching: flags.enableCaching !== false ? "true" : "false",
        needsToken: flags.requireToken === true ? "true" : "false",
        cacheTableSheetData: flags.cacheTableSheetData !== false ? "true" : "false",
        tableSheetCacheTTL: flags.tableSheetCacheTTL || 300
      },
      // AI metadata fields
      ...(service.aiDescription && { aiDescription: service.aiDescription }),
      ...(service.aiUsageGuidance && { aiUsageGuidance: service.aiUsageGuidance }),
      ...(service.aiUsageExamples && service.aiUsageExamples.length > 0 && { aiUsageExamples: service.aiUsageExamples }),
      ...(service.aiTags && service.aiTags.length > 0 && { aiTags: service.aiTags }),
      ...(service.category && { category: service.category }),
      // Editable areas for AI
      ...(service.areas && service.areas.length > 0 && { areas: service.areas }),
      // Web App settings
      ...(service.webAppEnabled !== undefined && { webAppEnabled: service.webAppEnabled }),
      ...(service.webAppToken && { webAppToken: service.webAppToken })
    },
    fileJson: optimizedWorkbook // The optimized spreadsheet data
  };


  return publishData;
}

/**
 * Publish a service via API route (client-safe)
 * Always compresses data, uses blob upload only for very large compressed payloads
 * Works for both first publish and republish
 * @param {string} serviceId - The service ID
 * @param {object} publishData - The publish data { apiJson, fileJson }
 * @param {string|null} tenant - Optional tenant ID
 * @param {function|null} onProgress - Optional progress callback (percent: number) => void
 * @returns {Promise<object>} The publish result
 */
export async function publishService(serviceId, publishData, tenant = null, onProgress = null) {
  try {
    // Step 1: Serialize (0-5%)
    onProgress?.(0);
    const jsonString = JSON.stringify(publishData);

    // Step 2: Compress (5-20%)
    onProgress?.(5);
    const { compressed, originalSize, compressedSize } = compressData(jsonString);
    onProgress?.(20);

    // Check if compressed data fits inline (with base64 overhead)
    const needsBlobUpload = compressedSize >= PAYLOAD_LIMITS.COMPRESSED_INLINE_THRESHOLD;

    let requestBody;

    if (needsBlobUpload) {
      // Very large payload: upload compressed data to blob first (20-80%)
      console.log(`[Publish Client] Large compressed payload (${(compressedSize / 1024 / 1024).toFixed(2)}MB), using blob upload`);

      // Wrap progress to scale 0-100 to 20-80
      const blobProgress = (percent) => {
        onProgress?.(20 + Math.round(percent * 0.6));
      };

      const blobUrl = await uploadLargePublishData(serviceId, compressed, blobProgress);

      console.log(`[Publish Client] Sending publish request with blobUrl`);
      requestBody = {
        serviceId,
        publishDataUrl: blobUrl,
        isCompressed: true,  // Server knows to decompress after fetching
        tenant
      };
    } else {
      // Normal case: send compressed data inline as base64 (20-40%)
      console.log(`[Publish Client] Sending compressed data inline (${(compressedSize / 1024).toFixed(1)}KB)`);
      onProgress?.(25);
      const base64Data = uint8ArrayToBase64(compressed);
      onProgress?.(40);

      requestBody = {
        serviceId,
        compressedData: base64Data,
        tenant
      };
    }

    // Step 3: Send to server (40-85%)
    onProgress?.(50);

    const response = await fetch('/api/services/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    onProgress?.(85);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to publish service');
    }

    // Step 4: Finalize (85-100%)
    const result = await response.json();
    onProgress?.(100);

    return result;
  } catch (error) {
    console.error('Error publishing service:', error);
    throw error;
  }
}