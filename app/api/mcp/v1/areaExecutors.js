import redis from '../../../../lib/redis.js';
import { getApiDefinition } from '../../../../utils/helperApi.js';
import { getRangeAsOffset } from '../../../../utils/helper.js';

const { createWorkbook, getCachedWorkbook } = require('../../../../lib/spreadjs-server');

/**
 * Read data from an area with SpreadJS JSON format
 */
export async function executeAreaRead(serviceId, areaName, options, auth) {
  try {
    // Get service definition
    const apiDefinition = await getApiDefinition(serviceId, null);
    if (apiDefinition.error) {
      throw new Error(apiDefinition.error);
    }
    
    // Get areas from published data
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
    const areas = publishedData.areas ? JSON.parse(publishedData.areas) : [];
    
    // Find the requested area
    const area = areas.find(a => a.name === areaName || a.alias === areaName);
    if (!area) {
      throw new Error(`Area '${areaName}' not found`);
    }
    
    // Check permissions
    if (!area.permissions.canReadValues) {
      throw new Error(`Area '${areaName}' does not allow reading values`);
    }
    
    // Get or create workbook
    const fileJson = apiDefinition.fileJson;
    const cacheResult = await getCachedWorkbook(
      serviceId,
      `area_read_${serviceId}`,
      async (workbook) => {
        workbook.fromJSON(fileJson, {
          calcOnDemand: false,
          doNotRecalculateAfterLoad: false,
        });
      }
    );
    
    const spread = cacheResult.workbook;
    
    // Parse area address
    const range = getRangeAsOffset(area.address);
    const sheet = spread.getSheetFromName(range.sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet not found: ${range.sheetName}`);
    }
    
    // Calculate dimensions
    const rows = range.rowTo - range.rowFrom + 1;
    const cols = range.colTo - range.colFrom + 1;
    
    // Build response based on permissions
    const response = {
      area: {
        name: area.name,
        alias: area.alias,
        address: area.address,
        mode: area.mode,
        rows: rows,
        columns: cols
      },
      data: {}
    };
    
    // Read cell data
    for (let r = 0; r < rows; r++) {
      response.data[r] = {};
      for (let c = 0; c < cols; c++) {
        const cell = sheet.getCell(range.rowFrom + r, range.colFrom + c);
        const cellData = {};
        
        // Always include value
        cellData.value = cell.value();
        
        // Include formula if permitted and requested
        if (options.includeFormulas && area.permissions.canReadFormulas) {
          const formula = cell.formula();
          if (formula) {
            cellData.formula = formula;
          }
        }
        
        // Include formatting if permitted and requested
        if (options.includeFormatting && area.permissions.canReadFormatting) {
          const style = cell.style();
          if (style) {
            cellData.style = style;
          }
        }
        
        response.data[r][c] = cellData;
      }
    }
    
    return {
      content: [{
        type: 'text',
        text: `Area '${areaName}' data:\n${JSON.stringify(response, null, 2)}`
      }]
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
 * Update multiple areas with changes
 */
export async function executeAreaUpdate(serviceId, updates, auth, returnOptions = {}) {
  try {
    // Get service definition
    const apiDefinition = await getApiDefinition(serviceId, null);
    if (apiDefinition.error) {
      throw new Error(apiDefinition.error);
    }
    
    // Get areas from published data
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
    const areas = publishedData.areas ? JSON.parse(publishedData.areas) : [];
    
    // Create fresh workbook for updates
    const fileJson = apiDefinition.fileJson;
    const spread = createWorkbook();
    spread.fromJSON(fileJson, {
      calcOnDemand: false,
      doNotRecalculateAfterLoad: false,
    });
    
    const results = [];
    
    // Process each area update
    for (const update of updates) {
      const { areaName, changes } = update;
      
      // Find the area
      const area = areas.find(a => a.name === areaName || a.alias === areaName);
      if (!area) {
        results.push({
          area: areaName,
          error: `Area '${areaName}' not found`
        });
        continue;
      }
      
      // Check if area is writable
      if (area.mode === 'readonly') {
        results.push({
          area: areaName,
          error: `Area '${areaName}' is read-only`
        });
        continue;
      }
      
      // Parse area address
      const range = getRangeAsOffset(area.address);
      const sheet = spread.getSheetFromName(range.sheetName);
      
      if (!sheet) {
        results.push({
          area: areaName,
          error: `Sheet not found: ${range.sheetName}`
        });
        continue;
      }
      
      const appliedChanges = [];
      const errors = [];
      
      // Apply each change
      for (const change of changes) {
        try {
          const absoluteRow = range.rowFrom + change.row;
          const absoluteCol = range.colFrom + change.col;
          
          // Validate bounds
          if (absoluteRow > range.rowTo || absoluteCol > range.colTo) {
            errors.push(`Cell [${change.row},${change.col}] outside area bounds`);
            continue;
          }
          
          const cell = sheet.getCell(absoluteRow, absoluteCol);
          const oldValue = cell.value();
          const oldFormula = cell.formula();
          
          // Apply changes based on permissions
          if (change.formula !== undefined) {
            if (!area.permissions.canWriteFormulas) {
              errors.push(`Formula changes not allowed in area '${areaName}'`);
              continue;
            }
            cell.formula(change.formula);
          } else if (change.value !== undefined) {
            if (!area.permissions.canWriteValues) {
              errors.push(`Value changes not allowed in area '${areaName}'`);
              continue;
            }
            cell.value(change.value);
          }
          
          appliedChanges.push({
            row: change.row,
            col: change.col,
            oldValue,
            newValue: change.value || change.formula,
            type: change.formula ? 'formula' : 'value'
          });
          
        } catch (err) {
          errors.push(`Error in cell [${change.row},${change.col}]: ${err.message}`);
        }
      }
      
      results.push({
        area: areaName,
        success: appliedChanges.length > 0,
        appliedChanges: appliedChanges.length,
        errors: errors.length,
        details: {
          changes: appliedChanges,
          errors
        }
      });
    }
    
    // If any changes were successful, calculate and return updated values based on options
    const hasSuccessfulChanges = results.some(r => r.success);
    
    // Set default return options
    const {
      includeValues = true,
      includeFormulas = false,
      includeFormatting = false,
      includeRelatedOutputs = false
    } = returnOptions;
    
    const response = { results };
    
    if (hasSuccessfulChanges) {
      // Force recalculation
      spread.calculate();
      
      // Collect updated values from all modified areas if requested
      if (includeValues || includeFormulas || includeFormatting) {
        const updatedAreas = {};
        
        for (const result of results) {
          if (result.success && result.area) {
            const area = areas.find(a => a.name === result.area || a.alias === result.area);
            if (!area) continue;
            
            const range = getRangeAsOffset(area.address);
            const sheet = spread.getSheetFromName(range.sheetName);
            if (!sheet) continue;
            
            const rows = range.rowTo - range.rowFrom + 1;
            const cols = range.colTo - range.colFrom + 1;
            
            updatedAreas[result.area] = {
              rows: rows,
              columns: cols,
              data: {}
            };
            
            // Read back data from the area based on options
            for (let r = 0; r < rows; r++) {
              updatedAreas[result.area].data[r] = {};
              for (let c = 0; c < cols; c++) {
                const cell = sheet.getCell(range.rowFrom + r, range.colFrom + c);
                const cellData = {};
                
                if (includeValues) {
                  cellData.value = cell.value();
                }
                
                if (includeFormulas) {
                  const formula = cell.formula();
                  if (formula) {
                    cellData.formula = formula;
                  }
                }
                
                if (includeFormatting) {
                  const style = cell.style();
                  if (style) {
                    cellData.style = style;
                  }
                }
                
                updatedAreas[result.area].data[r][c] = cellData;
              }
            }
          }
        }
        
        response.updatedAreas = updatedAreas;
      }
      
      // Get related output values if requested
      if (includeRelatedOutputs && apiDefinition.apiJson?.outputs) {
        const outputs = {};
        const outputDefs = apiDefinition.apiJson.outputs;
        
        for (const output of outputDefs) {
          try {
            const range = getRangeAsOffset(output.address);
            const sheet = spread.getSheetFromName(range.sheetName);
            if (sheet) {
              if (output.row !== undefined && output.col !== undefined) {
                // Single cell output
                outputs[output.name] = sheet.getCell(output.row, output.col).value();
              } else {
                // Range output
                const values = [];
                for (let r = range.rowFrom; r <= range.rowTo; r++) {
                  const row = [];
                  for (let c = range.colFrom; c <= range.colTo; c++) {
                    row.push(sheet.getCell(r, c).value());
                  }
                  values.push(row);
                }
                outputs[output.name] = values;
              }
            }
          } catch (e) {
            console.error(`Error reading output ${output.name}:`, e);
          }
        }
        
        response.relatedOutputs = outputs;
      }
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response, null, 2)
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error updating areas: ${error.message}`
      }],
      isError: true
    };
  }
}