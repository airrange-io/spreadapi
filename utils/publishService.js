// Client-safe publish service utilities
// NOTE: This file must not import any server-side modules like Redis

import { extractRangeValues } from '@/lib/rangeValidation';

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

// Call service management via API route (client-safe)
export async function publishService(serviceId, publishData, tenant = null) {
  try {
    // Use API route instead of direct function call
    const response = await fetch('/api/services/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceId,
        publishData,
        tenant
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to publish service');
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error('Error publishing service:', error);
    throw error;
  }
}