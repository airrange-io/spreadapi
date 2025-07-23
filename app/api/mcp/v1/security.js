// Security utilities for MCP implementation

/**
 * Sanitize formula inputs to prevent injection attacks
 */
export function sanitizeFormula(formula) {
  if (typeof formula !== 'string') return formula;
  
  // Prevent external references
  if (formula.includes('[') || formula.includes(']')) {
    throw new Error('External references not allowed in formulas');
  }
  
  // Prevent dangerous functions
  const dangerousFunctions = ['INDIRECT', 'HYPERLINK', 'WEBSERVICE'];
  const upperFormula = formula.toUpperCase();
  for (const func of dangerousFunctions) {
    if (upperFormula.includes(func)) {
      throw new Error(`Function ${func} is not allowed for security reasons`);
    }
  }
  
  return formula;
}

/**
 * Validate cell references to prevent out-of-bounds access
 */
export function validateCellReference(row, col, area) {
  // Parse area address (e.g., "B2:D10")
  const match = area.address.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!match) throw new Error('Invalid area address format');
  
  const [, startColStr, startRowStr, endColStr, endRowStr] = match;
  const startRow = parseInt(startRowStr) - 1;
  const endRow = parseInt(endRowStr) - 1;
  const startCol = colToIndex(startColStr);
  const endCol = colToIndex(endColStr);
  
  if (row < startRow || row > endRow || col < startCol || col > endCol) {
    throw new Error(`Cell reference (${row},${col}) is outside allowed area ${area.address}`);
  }
}

function colToIndex(col) {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + col.charCodeAt(i) - 64;
  }
  return index - 1;
}

/**
 * Rate limiting implementation
 */
const rateLimiters = new Map();

export async function checkRateLimit(identifier, options = {}) {
  const {
    windowMs = 60000, // 1 minute
    max = 100,
    keyPrefix = 'rl'
  } = options;
  
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `${keyPrefix}:${identifier}:${windowStart}`;
  
  // Clean old entries
  for (const [k, v] of rateLimiters.entries()) {
    if (v.windowStart < windowStart - windowMs) {
      rateLimiters.delete(k);
    }
  }
  
  const limiter = rateLimiters.get(key) || { count: 0, windowStart };
  
  if (limiter.count >= max) {
    const retryAfter = Math.ceil((windowStart + windowMs - now) / 1000);
    throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
  }
  
  limiter.count++;
  rateLimiters.set(key, limiter);
  
  return { remaining: max - limiter.count, reset: windowStart + windowMs };
}

/**
 * Validate and sanitize area update parameters
 */
export function validateAreaUpdate(update, area) {
  if (!update.cells || !Array.isArray(update.cells)) {
    throw new Error('Invalid update format: cells array required');
  }
  
  for (const cell of update.cells) {
    // Validate cell position
    validateCellReference(cell.row, cell.column || cell.col, area);
    
    // Sanitize formula if present
    if (cell.formula) {
      cell.formula = sanitizeFormula(cell.formula);
    }
    
    // Validate value types
    if (cell.value !== undefined) {
      if (typeof cell.value === 'object' && cell.value !== null) {
        throw new Error('Complex objects not allowed as cell values');
      }
    }
  }
  
  return update;
}