// This file contains server-only code for SpreadJS initialization
// It should never be imported on the client side

let isInitialized = false;
let SpreadJS = null;

// Process-level workbook cache
const workbookCache = new Map();
const CACHE_MAX_SIZE = 1000; // ~500MB for 100-500KB workbooks (well within 3GB limit)
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes TTL

/**
 * Initialize SpreadJS with browser environment
 * This function ensures SpreadJS is only initialized once
 */
function initializeSpreadJS() {
  if (isInitialized && SpreadJS) {
    return SpreadJS;
  }

  // Only run on server
  if (typeof window !== 'undefined') {
    throw new Error('SpreadJS server utilities cannot be used on client side');
  }

  // Set up browser environment
  const mockBrowser = require('mock-browser').mocks.MockBrowser;
  const canvas = require('canvas');
  
  global.window = mockBrowser.createWindow();
  global.document = window.document;
  global.navigator = window.navigator;
  global.self = global;
  global.HTMLCollection = window.HTMLCollection;
  global.getComputedStyle = window.getComputedStyle;
  global.customElements = null;
  global.canvas = canvas;
  global.HTMLElement = window.HTMLElement;
  global.HTMLDivElement = window.HTMLDivElement;

  // Load SpreadJS after browser environment is set up
  SpreadJS = require('@mescius/spread-sheets');
  const licenseKey = process.env.NEXT_SPREADJS18_KEY;
  if (!licenseKey) {
    console.error('WARNING: NEXT_SPREADJS18_KEY environment variable is not set');
  }
  SpreadJS.Spread.Sheets.LicenseKey = licenseKey;

  isInitialized = true;
  return SpreadJS;
}

/**
 * Get SpreadJS instance
 * Ensures SpreadJS is initialized before returning
 */
function getSpreadJS() {
  if (!isInitialized || !SpreadJS) {
    return initializeSpreadJS();
  }
  return SpreadJS;
}

/**
 * Create a new workbook instance
 */
function createWorkbook() {
  const MC = getSpreadJS();
  return new MC.Spread.Sheets.Workbook();
}

/**
 * Get or create a cached workbook
 * @param {string} apiId - The API identifier
 * @param {string} cacheKey - Unique cache key (e.g., based on inputs)
 * @param {Function} createFn - Function to create and populate the workbook
 * @returns {Promise<Object>} Workbook data and cache status
 */
async function getCachedWorkbook(apiId, cacheKey, createFn) {
  const fullKey = `${apiId}:${cacheKey}`;
  const cached = workbookCache.get(fullKey);
  
  // Check if cached and not expired
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      workbook: cached.workbook,
      fromCache: true,
      cacheSize: workbookCache.size
    };
  }
  
  // Create new workbook
  const workbook = createWorkbook();
  await createFn(workbook);
  
  // Evict oldest entries if cache is full
  if (workbookCache.size >= CACHE_MAX_SIZE) {
    const oldestKey = workbookCache.keys().next().value;
    workbookCache.delete(oldestKey);
  }
  
  // Cache the workbook
  workbookCache.set(fullKey, {
    workbook: workbook,
    timestamp: Date.now()
  });
  
  return {
    workbook: workbook,
    fromCache: false,
    cacheSize: workbookCache.size
  };
}

/**
 * Clear expired entries from cache
 */
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of workbookCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      workbookCache.delete(key);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupCache, 60 * 1000);

/**
 * Load tablesheet module if needed
 */
async function loadTablesheetModule() {
  try {
    await import('@mescius/spread-sheets-tablesheet');
    return true;
  } catch (error) {
    console.error('Failed to load tablesheet module:', error);
    return false;
  }
}

module.exports = {
  getSpreadJS,
  createWorkbook,
  getCachedWorkbook,
  loadTablesheetModule,
  initializeSpreadJS,
  // Cache stats for monitoring
  getCacheStats: () => ({
    size: workbookCache.size,
    maxSize: CACHE_MAX_SIZE,
    ttlMs: CACHE_TTL_MS
  })
};