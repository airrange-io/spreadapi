import redis from '../redis.js';
import { getApiDefinition } from '../../utils/helperApi.js';
import { getRangeAsOffset } from '../../utils/helper.js';

const { createWorkbook } = require('../spreadjs-server');

/**
 * Execute a service calculation with integrated area updates
 * This function handles:
 * 1. Applying area updates to the workbook
 * 2. Setting input parameters
 * 3. Calculating results
 * 4. Returning outputs and optionally area data
 */
export async function executeEnhancedCalc(serviceId, inputs = {}, areaUpdates = [], returnOptions = {}, auth) {
  try {
    console.log('[ExecuteEnhancedCalc] Starting calculation for service:', serviceId);
    console.log('[ExecuteEnhancedCalc] Inputs:', inputs);
    console.log('[ExecuteEnhancedCalc] Auth:', auth ? 'provided' : 'none');
    
    // Get service definition
    const apiData = await getApiDefinition(serviceId, null);
    if (apiData.error) {
      console.error('[ExecuteEnhancedCalc] Failed to get service definition:', apiData.error);
      throw new Error(`Service error: ${apiData.error}`);
    }
    
    const apiDefinition = apiData.apiJson || apiData;
    console.log('[ExecuteEnhancedCalc] API Definition keys:', Object.keys(apiDefinition));

    // fileJson is at the root level of apiData, not inside apiJson
    const fileJson = apiData.fileJson;
    
    if (!fileJson) {
      console.error('[ExecuteEnhancedCalc] No fileJson found in apiData');
      console.error('[ExecuteEnhancedCalc] Available keys in apiData:', Object.keys(apiData));
      console.error('[ExecuteEnhancedCalc] Available keys in apiDefinition:', Object.keys(apiDefinition));
      throw new Error('Service file data not found - service may not be properly published');
    }
    
    console.log('[ExecuteEnhancedCalc] FileJson loaded, size:', JSON.stringify(fileJson).length, 'bytes');
    
    // Get published data for areas
    const publishedData = await redis.hGetAll(`service:${serviceId}:published`);
    const areas = publishedData.areas ? JSON.parse(publishedData.areas) : [];
    
    // Create workbook
    const spread = createWorkbook();
    spread.fromJSON(fileJson, {
      calcOnDemand: false,
      doNotRecalculateAfterLoad: false,
    });
    
    // Track area update results
    const areaUpdateResults = [];
    
    // Apply area updates if provided
    if (areaUpdates && areaUpdates.length > 0) {
      for (const update of areaUpdates) {
        const { areaName, changes } = update;
        
        // Find the area
        const area = areas.find(a => a.name === areaName);
        if (!area) {
          areaUpdateResults.push({
            area: areaName,
            success: false,
            error: `Area '${areaName}' not found`
          });
          continue;
        }
        
        // Check if area is writable
        if (area.mode === 'readonly') {
          areaUpdateResults.push({
            area: areaName,
            success: false,
            error: `Area '${areaName}' is read-only`
          });
          continue;
        }
        
        // Parse area address
        const range = getRangeAsOffset(area.address);
        const sheet = spread.getSheetFromName(range.sheetName);
        
        if (!sheet) {
          areaUpdateResults.push({
            area: areaName,
            success: false,
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
            
            // Apply changes based on permissions
            if (change.formula !== undefined) {
              if (!area.permissions.canWriteFormulas) {
                errors.push(`Formula changes not allowed in area '${areaName}'`);
                continue;
              }
              cell.formula(change.formula);
              appliedChanges.push({ row: change.row, col: change.col, type: 'formula' });
            } else if (change.value !== undefined) {
              if (!area.permissions.canWriteValues) {
                errors.push(`Value changes not allowed in area '${areaName}'`);
                continue;
              }
              cell.value(change.value);
              appliedChanges.push({ row: change.row, col: change.col, type: 'value' });
            }
          } catch (err) {
            errors.push(`Error in cell [${change.row},${change.col}]: ${err.message}`);
          }
        }
        
        areaUpdateResults.push({
          area: areaName,
          success: appliedChanges.length > 0,
          appliedChanges: appliedChanges.length,
          errors: errors
        });
      }
      
      // Check if any area updates failed critically
      const hasCriticalErrors = areaUpdateResults.some(r => 
        r.error && !r.success // Complete failure, not partial
      );
      
      if (hasCriticalErrors) {
        const errorDetails = areaUpdateResults
          .filter(r => r.error)
          .map(r => `${r.area}: ${r.error}`)
          .join('\n');
        throw new Error(`Area update failed:\n${errorDetails}`);
      }
    }
    
    // Now set input parameters
    if (apiDefinition.inputs && Array.isArray(apiDefinition.inputs)) {
      for (const inputDef of apiDefinition.inputs) {
        const paramName = inputDef.name;
        const value = inputs[paramName];
        
        if (value !== undefined && value !== null && value !== '') {
          try {
            // Get the input cell address
            const range = getRangeAsOffset(inputDef.address);
            const sheet = spread.getSheetFromName(range.sheetName);
            
            if (sheet) {
              if (inputDef.row !== undefined && inputDef.col !== undefined) {
                // Single cell input
                sheet.getCell(inputDef.row, inputDef.col).value(value);
              } else {
                // Range input - set first cell
                sheet.getCell(range.rowFrom, range.colFrom).value(value);
              }
            }
          } catch (e) {
            console.error(`Error setting input ${paramName}:`, e);
          }
        }
      }
    }
    
    // Force calculation
    spread.calculate();
    
    // Prepare response
    const response = {};
    
    // Set default return options
    const {
      includeOutputs = true,
      includeAreaValues = false,
      includeAreaFormulas = false,
      includeAreaFormatting = false
    } = returnOptions;
    
    // Get calculation outputs if requested
    if (includeOutputs && apiDefinition.outputs && Array.isArray(apiDefinition.outputs)) {
      const outputs = {};
      
      for (const outputDef of apiDefinition.outputs) {
        try {
          const range = getRangeAsOffset(outputDef.address);
          const sheet = spread.getSheetFromName(range.sheetName);
          
          if (sheet) {
            const outputName = outputDef.name;
            
            if (outputDef.row !== undefined && outputDef.col !== undefined) {
              // Single cell output
              outputs[outputName] = sheet.getCell(outputDef.row, outputDef.col).value();
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
              outputs[outputName] = values;
            }
          }
        } catch (e) {
          console.error(`Error reading output ${outputDef.name}:`, e);
        }
      }
      
      response.outputs = outputs;
    }
    
    // Get area data if requested
    if ((includeAreaValues || includeAreaFormulas || includeAreaFormatting) && areas.length > 0) {
      const areaData = {};
      
      // Determine which areas to include
      const areasToRead = areaUpdates && areaUpdates.length > 0
        ? areas.filter(a => areaUpdates.some(u => u.areaName === a.name))
        : areas; // Include all areas if no specific updates
      
      for (const area of areasToRead) {
        try {
          const range = getRangeAsOffset(area.address);
          const sheet = spread.getSheetFromName(range.sheetName);
          
          if (!sheet) continue;
          
          const rows = range.rowTo - range.rowFrom + 1;
          const cols = range.colTo - range.colFrom + 1;
          
          const areaInfo = {
            name: area.name,
            address: area.address,
            mode: area.mode,
            rows: rows,
            columns: cols,
            data: {}
          };
          
          // Read cell data based on options and permissions
          for (let r = 0; r < rows; r++) {
            areaInfo.data[r] = {};
            for (let c = 0; c < cols; c++) {
              const cell = sheet.getCell(range.rowFrom + r, range.colFrom + c);
              const cellData = {};
              
              if (includeAreaValues && area.permissions.canReadValues) {
                cellData.value = cell.value();
              }
              
              if (includeAreaFormulas && area.permissions.canReadFormulas) {
                const formula = cell.formula();
                if (formula) {
                  cellData.formula = formula;
                }
              }
              
              if (includeAreaFormatting && area.permissions.canReadFormatting) {
                const style = cell.style();
                if (style) {
                  cellData.style = style;
                }
              }
              
              if (Object.keys(cellData).length > 0) {
                areaInfo.data[r][c] = cellData;
              }
            }
          }
          
          areaData[area.name] = areaInfo;
        } catch (e) {
          console.error(`Error reading area ${area.name}:`, e);
        }
      }
      
      if (Object.keys(areaData).length > 0) {
        response.areas = areaData;
      }
    }
    
    // Include area update results if there were updates
    if (areaUpdateResults.length > 0) {
      response.areaUpdateResults = areaUpdateResults;
    }
    
    // Format response text
    let responseText = '';
    
    if (response.outputs) {
      responseText += 'Calculation Results:\n';
      for (const [key, value] of Object.entries(response.outputs)) {
        responseText += `${key}: ${JSON.stringify(value)}\n`;
      }
    }
    
    if (response.areaUpdateResults) {
      responseText += '\nArea Updates:\n';
      response.areaUpdateResults.forEach(r => {
        responseText += `- ${r.area}: ${r.success ? `${r.appliedChanges} changes applied` : r.error}\n`;
        if (r.errors && r.errors.length > 0) {
          r.errors.forEach(e => responseText += `  • ${e}\n`);
        }
      });
    }
    
    if (response.areas) {
      responseText += '\nArea Data:\n';
      responseText += JSON.stringify(response.areas, null, 2);
    }
    
    return {
      content: [{
        type: 'text',
        text: responseText || JSON.stringify(response, null, 2)
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}