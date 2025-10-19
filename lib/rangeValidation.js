/**
 * Range Validation Module
 * Validates Excel-style worksheet range references (e.g., 'Sheet Name'!A1:B10)
 */

const MAX_ALLOWED_CELLS = 1000;

/**
 * Parse a column reference (A, B, AA, etc.) to column number (1-based)
 * @param {string} col - Column reference (e.g., 'A', 'AA')
 * @returns {number} Column number (1-based)
 */
function columnToNumber(col) {
  let num = 0;
  for (let i = 0; i < col.length; i++) {
    num = num * 26 + (col.charCodeAt(i) - 64);
  }
  return num;
}

/**
 * Parse a cell reference (e.g., 'A1', 'AA100')
 * @param {string} cell - Cell reference
 * @returns {object|null} { col: number, row: number } or null if invalid
 */
function parseCellReference(cell) {
  const match = cell.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;

  const col = columnToNumber(match[1]);
  const row = parseInt(match[2], 10);

  if (row < 1 || col < 1) return null;

  return { col, row };
}

/**
 * Validate worksheet range format and check cell count
 * @param {string} rangeString - Range string (e.g., "Sheet1!A1:B10" or "'Jahr 2025'!B2:B44")
 * @returns {object} { valid: boolean, error?: string, cellCount?: number, sheetName?: string, range?: string }
 */
export function validateRangeFormat(rangeString) {
  if (!rangeString || typeof rangeString !== 'string') {
    return {
      valid: false,
      error: 'Range string is required'
    };
  }

  const trimmed = rangeString.trim();

  if (trimmed === '') {
    return {
      valid: false,
      error: 'Range string cannot be empty'
    };
  }

  // Regex pattern to match:
  // - Optional single-quoted sheet name: 'Sheet Name' OR
  // - Unquoted sheet name: SheetName
  // - Followed by !
  // - Followed by range: A1:B10
  const pattern = /^(?:'([^']+)'|([^!]+))!([A-Z]+\d+):([A-Z]+\d+)$/;
  const match = trimmed.match(pattern);

  if (!match) {
    return {
      valid: false,
      error: 'Invalid range format. Expected format: SheetName!A1:B10 or \'Sheet Name\'!A1:B10'
    };
  }

  const sheetName = match[1] || match[2]; // Quoted or unquoted sheet name
  const startCell = match[3];
  const endCell = match[4];

  // Validate sheet name
  if (!sheetName || sheetName.trim() === '') {
    return {
      valid: false,
      error: 'Sheet name cannot be empty'
    };
  }

  // Parse cell references
  const start = parseCellReference(startCell);
  const end = parseCellReference(endCell);

  if (!start) {
    return {
      valid: false,
      error: `Invalid start cell reference: ${startCell}`
    };
  }

  if (!end) {
    return {
      valid: false,
      error: `Invalid end cell reference: ${endCell}`
    };
  }

  // Validate range direction (start should be before or equal to end)
  if (start.row > end.row || start.col > end.col) {
    return {
      valid: false,
      error: 'Range start must be before or equal to range end'
    };
  }

  // Calculate number of cells in range
  const rowCount = end.row - start.row + 1;
  const colCount = end.col - start.col + 1;
  const cellCount = rowCount * colCount;

  // Check maximum cell limit
  if (cellCount > MAX_ALLOWED_CELLS) {
    return {
      valid: false,
      error: `Range contains ${cellCount} cells, which exceeds the maximum of ${MAX_ALLOWED_CELLS} cells`
    };
  }

  // Valid range
  return {
    valid: true,
    cellCount,
    sheetName: sheetName.trim(),
    range: `${startCell}:${endCell}`,
    startCell: start,
    endCell: end
  };
}

/**
 * Extract values from a worksheet range at publish time
 * @param {object} worksheet - SpreadJS worksheet object
 * @param {string} rangeString - Range string (e.g., "Values!B2:B24")
 * @returns {object} { success: boolean, values?: array, error?: string }
 */
export function extractRangeValues(worksheet, rangeString) {
  // First validate the range format
  const validation = validateRangeFormat(rangeString);

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  try {
    const { startCell, endCell } = validation;
    const values = [];
    const uniqueValues = new Set();

    // Extract values from the range
    for (let row = startCell.row; row <= endCell.row; row++) {
      for (let col = startCell.col; col <= endCell.col; col++) {
        // SpreadJS uses 0-based indexing
        const cell = worksheet.getCell(row - 1, col - 1);
        const value = cell.value();

        // Skip empty cells
        if (value !== null && value !== undefined && value !== '') {
          const stringValue = String(value).trim();
          if (stringValue !== '') {
            uniqueValues.add(stringValue);
          }
        }
      }
    }

    // Convert Set to Array and sort
    const sortedValues = Array.from(uniqueValues).sort();

    if (sortedValues.length === 0) {
      return {
        success: false,
        error: 'Range contains no non-empty values'
      };
    }

    return {
      success: true,
      values: sortedValues,
      count: sortedValues.length
    };

  } catch (error) {
    return {
      success: false,
      error: `Error reading range: ${error.message}`
    };
  }
}

export default {
  validateRangeFormat,
  extractRangeValues,
  MAX_ALLOWED_CELLS
};
