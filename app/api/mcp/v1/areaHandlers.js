/**
 * MCP Area Handlers
 * Implements read/write operations for cell areas
 */

import { readCellArea, writeCellArea, getAreaDefinition } from '../../../../lib/cellAreaHandler.js';
import { getApiDefinition } from '../../../../utils/helperApi.js';
import redis from '../../../../lib/redis.js';

const { createWorkbook, getCachedWorkbook } = require('../../../../lib/spreadjs-server');

/**
 * Handle reading from a cell area
 */
export async function handleReadArea(serviceId, areaName, format, auth) {
  try {
    // Verify service access
    const userServiceIndex = await redis.hGetAll(`user:${auth.userId}:services`);
    if (!userServiceIndex[serviceId]) {
      throw new Error('Service not found');
    }
    
    // Check token restrictions
    const allowedServiceIds = auth.serviceIds || [];
    if (allowedServiceIds.length > 0 && !allowedServiceIds.includes(serviceId)) {
      throw new Error('Access denied to this service');
    }
    
    // Get service definition
    const apiDefinition = await getApiDefinition(serviceId, null);
    if (apiDefinition.error) {
      throw new Error(apiDefinition.error);
    }
    
    // Get area definition
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
    const areas = publishedData.areas ? JSON.parse(publishedData.areas) : [];
    const areaDef = areas.find(a => a.name === areaName);
    
    if (!areaDef) {
      throw new Error(`Area '${areaName}' not found in service`);
    }
    
    // Get or create workbook
    const fileJson = apiDefinition.fileJson;
    const cacheResult = await getCachedWorkbook(
      serviceId,
      `area_${serviceId}`,
      async (workbook) => {
        workbook.fromJSON(fileJson, {
          calcOnDemand: false,
          doNotRecalculateAfterLoad: false,
        });
      }
    );
    
    const spread = cacheResult.workbook;
    
    // Read the area
    const data = await readCellArea(spread, areaDef, format);
    
    return {
      content: [{
        type: 'text',
        text: `Data from area '${areaName}':\n\n${JSON.stringify(data, null, 2)}`
      }],
      metadata: {
        area: areaDef.name,
        address: areaDef.address,
        format: format
      }
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error reading area: ${error.message}`
      }],
      isError: true
    };
  }
}

/**
 * Handle writing to a cell area
 */
export async function handleWriteArea(serviceId, areaName, changes, tableData, auth) {
  try {
    // Verify service access (same as read)
    const userServiceIndex = await redis.hGetAll(`user:${auth.userId}:services`);
    if (!userServiceIndex[serviceId]) {
      throw new Error('Service not found');
    }
    
    const allowedServiceIds = auth.serviceIds || [];
    if (allowedServiceIds.length > 0 && !allowedServiceIds.includes(serviceId)) {
      throw new Error('Access denied to this service');
    }
    
    // Get service definition
    const apiDefinition = await getApiDefinition(serviceId, null);
    if (apiDefinition.error) {
      throw new Error(apiDefinition.error);
    }
    
    // Get area definition
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
    const areas = publishedData.areas ? JSON.parse(publishedData.areas) : [];
    const areaDef = areas.find(a => a.name === areaName);
    
    if (!areaDef) {
      throw new Error(`Area '${areaName}' not found in service`);
    }
    
    // Check write access
    if (areaDef.access === 'read') {
      throw new Error(`Area '${areaName}' is read-only`);
    }
    
    // Convert tableData to changes if provided
    let cellChanges = changes;
    if (tableData && !changes) {
      cellChanges = convertTableDataToChanges(tableData, areaDef);
    }
    
    if (!cellChanges || cellChanges.length === 0) {
      throw new Error('No changes provided');
    }
    
    // Get or create workbook
    const fileJson = apiDefinition.fileJson;
    const spread = createWorkbook(); // Create fresh for write operations
    spread.fromJSON(fileJson, {
      calcOnDemand: false,
      doNotRecalculateAfterLoad: false,
    });
    
    // Apply changes
    const result = await writeCellArea(spread, areaDef, cellChanges);
    
    // If successful, invalidate the cached workbook
    if (result.success) {
      // This would need to be implemented in your cache system
      // invalidateWorkbookCache(serviceId);
    }
    
    // Get updated values from affected cells
    const updatedValues = {};
    for (const change of result.appliedChanges) {
      updatedValues[change.absoluteAddress] = {
        old: change.oldValue,
        new: change.newValue
      };
    }
    
    return {
      content: [{
        type: 'text',
        text: `Area write results:\n${result.summary}\n\nUpdated cells:\n${JSON.stringify(updatedValues, null, 2)}`
      }],
      metadata: {
        area: areaDef.name,
        appliedChanges: result.appliedChanges.length,
        errors: result.errors.length
      }
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error writing to area: ${error.message}`
      }],
      isError: true
    };
  }
}

/**
 * Convert table data format to cell changes
 */
function convertTableDataToChanges(tableData, areaDef) {
  const changes = [];
  
  if (!areaDef.structure?.columns) {
    throw new Error('Table data format requires column definitions in area structure');
  }
  
  const hasHeaders = areaDef.structure.hasHeaders;
  const startRow = hasHeaders ? 1 : 0; // Skip header row if present
  
  tableData.forEach((rowData, rowIndex) => {
    areaDef.structure.columns.forEach((colDef) => {
      if (colDef.readonly) return; // Skip readonly columns
      
      const value = rowData[colDef.name];
      if (value !== undefined) {
        changes.push({
          row: startRow + rowIndex,
          col: colDef.index,
          value: value
        });
      }
    });
  });
  
  return changes;
}