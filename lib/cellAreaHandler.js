/**
 * Cell Area Handler for SpreadAPI
 * Handles reading and writing to defined cell areas
 */

import { getRangeAsOffset } from '../utils/helper.js';

/**
 * Read data from a cell area
 * @param {Object} spread - SpreadJS workbook instance
 * @param {Object} areaDef - Area definition from service
 * @param {string} format - Output format (table, array, object)
 * @returns {Object} Formatted data from the area
 */
export async function readCellArea(spread, areaDef, format = 'table') {
  const range = getRangeAsOffset(areaDef.address);
  const sheet = spread.getSheetFromName(range.sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet not found: ${range.sheetName}`);
  }
  
  // Calculate dimensions
  const rows = range.rowTo - range.rowFrom + 1;
  const cols = range.colTo - range.colFrom + 1;
  
  // Get all values in the range
  const values = sheet.getArray(
    range.rowFrom,
    range.colFrom,
    rows,
    cols,
    false // Don't get formulas
  );
  
  // Format based on requested format
  switch (format) {
    case 'table':
      return formatAsTable(values, areaDef);
    case 'array':
      return values;
    case 'object':
      return formatAsObject(values, areaDef);
    default:
      return values;
  }
}

/**
 * Write changes to specific cells in an area
 * @param {Object} spread - SpreadJS workbook instance
 * @param {Object} areaDef - Area definition from service
 * @param {Array} changes - Array of cell changes
 * @returns {Object} Summary of changes applied
 */
export async function writeCellArea(spread, areaDef, changes) {
  const range = getRangeAsOffset(areaDef.address);
  const sheet = spread.getSheetFromName(range.sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet not found: ${range.sheetName}`);
  }
  
  // Validate access
  if (areaDef.access === 'read') {
    throw new Error(`Area '${areaDef.name}' is read-only`);
  }
  
  const appliedChanges = [];
  const errors = [];
  
  // Apply each change
  for (const change of changes) {
    try {
      let absoluteRow, absoluteCol;
      
      // Handle row/col index or cell reference
      if (change.row !== undefined && change.col !== undefined) {
        // Relative to area start
        absoluteRow = range.rowFrom + change.row;
        absoluteCol = range.colFrom + change.col;
      } else if (change.cell) {
        // Parse cell reference (e.g., "B2")
        const cellRef = parseCellReference(change.cell);
        absoluteRow = range.rowFrom + cellRef.row;
        absoluteCol = range.colFrom + cellRef.col;
      } else {
        throw new Error('Must specify either row/col or cell reference');
      }
      
      // Validate bounds
      if (absoluteRow > range.rowTo || absoluteCol > range.colTo) {
        throw new Error('Cell reference outside of area bounds');
      }
      
      // Check column-level readonly if defined
      if (areaDef.structure?.columns) {
        const colDef = areaDef.structure.columns[change.col];
        if (colDef?.readonly) {
          throw new Error(`Column '${colDef.name}' is read-only`);
        }
      }
      
      // Get old value for change tracking
      const oldValue = sheet.getCell(absoluteRow, absoluteCol).value();
      
      // Set new value
      sheet.getCell(absoluteRow, absoluteCol).value(change.value);
      
      appliedChanges.push({
        row: change.row,
        col: change.col,
        cell: change.cell,
        oldValue,
        newValue: change.value,
        absoluteAddress: `${String.fromCharCode(65 + absoluteCol)}${absoluteRow + 1}`
      });
      
    } catch (error) {
      errors.push({
        change,
        error: error.message
      });
    }
  }
  
  return {
    success: appliedChanges.length > 0,
    appliedChanges,
    errors,
    summary: `Applied ${appliedChanges.length} changes, ${errors.length} errors`
  };
}

/**
 * Format values as a table with headers
 */
function formatAsTable(values, areaDef) {
  if (!areaDef.structure?.hasHeaders) {
    return {
      headers: null,
      data: values
    };
  }
  
  const headers = values[0];
  const data = values.slice(1);
  
  // Convert to array of objects if column names are defined
  if (areaDef.structure?.columns) {
    const rows = data.map(row => {
      const obj = {};
      areaDef.structure.columns.forEach((col, idx) => {
        obj[col.name] = row[idx];
      });
      return obj;
    });
    
    return {
      headers,
      data: rows,
      metadata: {
        rowCount: data.length,
        columnCount: headers.length
      }
    };
  }
  
  return {
    headers,
    data
  };
}

/**
 * Format values as named object based on cell definitions
 */
function formatAsObject(values, areaDef) {
  const result = {};
  
  if (areaDef.cells) {
    // Use cell definitions to create named properties
    areaDef.cells.forEach(cellDef => {
      const row = Math.floor(cellDef.offset / values[0].length);
      const col = cellDef.offset % values[0].length;
      result[cellDef.name] = values[row]?.[col];
    });
  } else {
    // Flatten to single array if no structure defined
    result.values = values.flat();
  }
  
  return result;
}

/**
 * Parse cell reference like "B2" to row/col indices
 */
function parseCellReference(cellRef) {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error('Invalid cell reference format');
  }
  
  const col = match[1].charCodeAt(0) - 65; // A=0, B=1, etc.
  const row = parseInt(match[2]) - 1; // 1-based to 0-based
  
  return { row, col };
}

/**
 * Get area definition from service
 */
export async function getAreaDefinition(serviceData, areaName) {
  const areas = serviceData.areas || [];
  const area = areas.find(a => a.name === areaName || a.alias === areaName);
  
  if (!area) {
    throw new Error(`Area '${areaName}' not found in service`);
  }
  
  return area;
}