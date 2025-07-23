/**
 * Cell Area Handler V2 for SpreadAPI
 * Uses SpreadJS toJSON/fromJSON for complete cell metadata
 */

import { getRangeAsOffset } from '../utils/helper.js';

/**
 * Read cell area with full SpreadJS metadata (formulas, formatting, etc.)
 * @param {Object} spread - SpreadJS workbook instance
 * @param {Object} areaDef - Area definition from service
 * @param {Object} options - Read options
 * @returns {Object} Complete cell data in SpreadJS JSON format
 */
export async function readCellAreaWithMetadata(spread, areaDef, options = {}) {
  const range = getRangeAsOffset(areaDef.address);
  const sheet = spread.getSheetFromName(range.sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet not found: ${range.sheetName}`);
  }
  
  // Get the full sheet JSON
  const sheetJson = sheet.toJSON();
  
  // Extract only the relevant area
  const areaData = extractAreaFromSheetJson(sheetJson, range);
  
  // Add computed values for each cell with formula
  if (options.includeValues) {
    addComputedValues(sheet, areaData, range);
  }
  
  // Build the response with full metadata
  return {
    area: {
      name: areaDef.name,
      address: areaDef.address,
      rows: range.rowTo - range.rowFrom + 1,
      columns: range.colTo - range.colFrom + 1
    },
    cells: areaData.cells,
    spans: areaData.spans,
    defaultRowHeight: sheetJson.defaults?.rowHeight,
    defaultColWidth: sheetJson.defaults?.colWidth,
    metadata: {
      hasFormulas: areaData.formulaCount > 0,
      formulaCount: areaData.formulaCount,
      valueCount: areaData.valueCount,
      styleCount: areaData.styleCount
    }
  };
}

/**
 * Write cell area with full SpreadJS metadata
 * @param {Object} spread - SpreadJS workbook instance
 * @param {Object} areaDef - Area definition from service
 * @param {Object} areaJson - Area data in SpreadJS JSON format
 * @returns {Object} Summary of changes applied
 */
export async function writeCellAreaWithMetadata(spread, areaDef, areaJson) {
  const range = getRangeAsOffset(areaDef.address);
  const sheet = spread.getSheetFromName(range.sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet not found: ${range.sheetName}`);
  }
  
  // Validate access
  if (areaDef.access === 'read') {
    throw new Error(`Area '${areaDef.name}' is read-only`);
  }
  
  const changedCells = [];
  const preservedFormulas = [];
  const errors = [];
  
  // Process each cell in the provided JSON
  if (areaJson.cells) {
    for (const [rowIndex, rowData] of Object.entries(areaJson.cells)) {
      const absoluteRow = range.rowFrom + parseInt(rowIndex);
      
      if (absoluteRow > range.rowTo) {
        errors.push(`Row ${rowIndex} outside area bounds`);
        continue;
      }
      
      for (const [colIndex, cellData] of Object.entries(rowData)) {
        const absoluteCol = range.colFrom + parseInt(colIndex);
        
        if (absoluteCol > range.colTo) {
          errors.push(`Column ${colIndex} outside area bounds`);
          continue;
        }
        
        try {
          const cell = sheet.getCell(absoluteRow, absoluteCol);
          const oldValue = cell.value();
          const oldFormula = cell.formula();
          
          // Apply cell data based on what's provided
          if (cellData.formula !== undefined) {
            // Check if formulas are allowed
            if (areaDef.allowFormulas !== false) {
              cell.formula(cellData.formula);
              preservedFormulas.push({
                row: absoluteRow,
                col: absoluteCol,
                formula: cellData.formula
              });
            } else {
              errors.push(`Formulas not allowed in area '${areaDef.name}'`);
              continue;
            }
          } else if (cellData.value !== undefined) {
            cell.value(cellData.value);
          }
          
          // Apply formatting if provided and allowed
          if (cellData.style && areaDef.allowFormatting !== false) {
            applyStyleToCell(cell, cellData.style, sheet);
          }
          
          changedCells.push({
            row: rowIndex,
            col: colIndex,
            absoluteRow,
            absoluteCol,
            oldValue,
            newValue: cellData.value || cellData.formula,
            type: cellData.formula ? 'formula' : 'value'
          });
          
        } catch (error) {
          errors.push(`Error in cell [${rowIndex},${colIndex}]: ${error.message}`);
        }
      }
    }
  }
  
  // Handle spans if provided
  if (areaJson.spans && areaDef.allowSpans !== false) {
    applySpansToArea(sheet, areaJson.spans, range);
  }
  
  return {
    success: changedCells.length > 0,
    changedCells,
    preservedFormulas,
    errors,
    summary: {
      totalChanges: changedCells.length,
      formulasUpdated: preservedFormulas.length,
      errors: errors.length
    }
  };
}

/**
 * Extract area data from full sheet JSON
 */
function extractAreaFromSheetJson(sheetJson, range) {
  const areaData = {
    cells: {},
    spans: [],
    formulaCount: 0,
    valueCount: 0,
    styleCount: 0
  };
  
  // Extract cells in the range
  if (sheetJson.data && sheetJson.data.dataTable) {
    for (let row = range.rowFrom; row <= range.rowTo; row++) {
      const rowData = sheetJson.data.dataTable[row];
      if (!rowData) continue;
      
      const relativeRow = row - range.rowFrom;
      areaData.cells[relativeRow] = {};
      
      for (let col = range.colFrom; col <= range.colTo; col++) {
        const cellData = rowData[col];
        if (!cellData) continue;
        
        const relativeCol = col - range.colFrom;
        areaData.cells[relativeRow][relativeCol] = cellData;
        
        // Count cell types
        if (cellData.formula) areaData.formulaCount++;
        if (cellData.value !== undefined) areaData.valueCount++;
        if (cellData.style) areaData.styleCount++;
      }
    }
  }
  
  // Extract spans in the range
  if (sheetJson.spans) {
    areaData.spans = sheetJson.spans.filter(span => 
      span.row >= range.rowFrom && 
      span.row <= range.rowTo &&
      span.col >= range.colFrom && 
      span.col <= range.colTo
    ).map(span => ({
      row: span.row - range.rowFrom,
      col: span.col - range.colFrom,
      rowCount: span.rowCount,
      colCount: span.colCount
    }));
  }
  
  return areaData;
}

/**
 * Add computed values to cells with formulas
 */
function addComputedValues(sheet, areaData, range) {
  for (const [rowIndex, rowData] of Object.entries(areaData.cells)) {
    for (const [colIndex, cellData] of Object.entries(rowData)) {
      if (cellData.formula) {
        const absoluteRow = range.rowFrom + parseInt(rowIndex);
        const absoluteCol = range.colFrom + parseInt(colIndex);
        const computedValue = sheet.getCell(absoluteRow, absoluteCol).value();
        cellData.computedValue = computedValue;
      }
    }
  }
}

/**
 * Apply style to a cell (simplified version)
 */
function applyStyleToCell(cell, style, sheet) {
  if (style.font) cell.font(style.font);
  if (style.backColor) cell.backColor(style.backColor);
  if (style.foreColor) cell.foreColor(style.foreColor);
  if (style.hAlign !== undefined) cell.hAlign(style.hAlign);
  if (style.vAlign !== undefined) cell.vAlign(style.vAlign);
  if (style.formatter) cell.formatter(style.formatter);
}

/**
 * Apply spans to area
 */
function applySpansToArea(sheet, spans, range) {
  for (const span of spans) {
    const absoluteRow = range.rowFrom + span.row;
    const absoluteCol = range.colFrom + span.col;
    sheet.addSpan(absoluteRow, absoluteCol, span.rowCount, span.colCount);
  }
}

/**
 * Advanced: Get cell dependencies in an area
 */
export async function getCellDependencies(spread, areaDef) {
  const range = getRangeAsOffset(areaDef.address);
  const sheet = spread.getSheetFromName(range.sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet not found: ${range.sheetName}`);
  }
  
  const dependencies = {
    internal: [], // Dependencies within the area
    external: []  // Dependencies outside the area
  };
  
  // Scan all cells in the area for formulas
  for (let row = range.rowFrom; row <= range.rowTo; row++) {
    for (let col = range.colFrom; col <= range.colTo; col++) {
      const cell = sheet.getCell(row, col);
      const formula = cell.formula();
      
      if (formula) {
        // Parse formula to find references (simplified)
        const refs = extractReferencesFromFormula(formula);
        
        refs.forEach(ref => {
          const refRange = getRangeAsOffset(ref);
          const isInternal = 
            refRange.rowFrom >= range.rowFrom &&
            refRange.rowTo <= range.rowTo &&
            refRange.colFrom >= range.colFrom &&
            refRange.colTo <= range.colTo;
          
          const dependency = {
            fromCell: `R${row - range.rowFrom}C${col - range.colFrom}`,
            toCell: ref,
            formula: formula
          };
          
          if (isInternal) {
            dependencies.internal.push(dependency);
          } else {
            dependencies.external.push(dependency);
          }
        });
      }
    }
  }
  
  return dependencies;
}

/**
 * Extract cell references from formula (basic implementation)
 */
function extractReferencesFromFormula(formula) {
  // This is a simplified version - real implementation would need a proper parser
  const refs = [];
  const cellRefPattern = /\b([A-Z]+\d+)\b/g;
  const matches = formula.match(cellRefPattern);
  
  if (matches) {
    refs.push(...matches);
  }
  
  return refs;
}