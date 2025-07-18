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

  try {
    // Set up browser environment - more compatible approach
    const mockBrowser = require('mock-browser').mocks.MockBrowser;
    const canvas = require('canvas');
    
    const mockWindow = mockBrowser.createWindow();
    
    // Only set properties that don't exist or are writable
    if (typeof global.window === 'undefined') {
      global.window = mockWindow;
    }
    if (typeof global.document === 'undefined') {
      global.document = mockWindow.document;
    }
    if (typeof global.navigator === 'undefined') {
      Object.defineProperty(global, 'navigator', {
        value: mockWindow.navigator,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
    if (typeof global.self === 'undefined') {
      global.self = global;
    }
    if (typeof global.HTMLCollection === 'undefined') {
      global.HTMLCollection = mockWindow.HTMLCollection;
    }
    if (typeof global.getComputedStyle === 'undefined') {
      global.getComputedStyle = mockWindow.getComputedStyle;
    }
    if (typeof global.customElements === 'undefined') {
      global.customElements = null;
    }
    if (typeof global.canvas === 'undefined') {
      global.canvas = canvas;
    }
    if (typeof global.HTMLElement === 'undefined') {
      global.HTMLElement = mockWindow.HTMLElement;
    }
    if (typeof global.HTMLDivElement === 'undefined') {
      global.HTMLDivElement = mockWindow.HTMLDivElement;
    }

    // Load SpreadJS after browser environment is set up
    SpreadJS = require('@mescius/spread-sheets');
    const licenseKey = process.env.NEXT_SPREADJS18_KEY;
    if (!licenseKey) {
      console.error('WARNING: NEXT_SPREADJS18_KEY environment variable is not set');
    }
    SpreadJS.Spread.Sheets.LicenseKey = licenseKey;

    isInitialized = true;
    return SpreadJS;
  } catch (error) {
    console.error('Failed to initialize SpreadJS:', error);
    throw error;
  }
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
 * Get or create a cached workbook with API definition
 * @param {string} apiId - The API identifier
 * @param {Object} apiDefinition - The full API definition including fileJson
 * @param {Function} initFn - Function to initialize the workbook
 * @returns {Promise<Object>} Workbook, API definition, and cache status
 */
async function getCachedWorkbook(apiId, apiDefinition, initFn) {
  const cached = workbookCache.get(apiId);
  
  // Check if cached and not expired
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      workbook: cached.workbook,
      apiDefinition: cached.apiDefinition,
      fromCache: true,
      cacheSize: workbookCache.size
    };
  }
  
  // Create new workbook
  const workbook = createWorkbook();
  await initFn(workbook);
  
  // Evict oldest entries if cache is full
  if (workbookCache.size >= CACHE_MAX_SIZE) {
    const oldestKey = workbookCache.keys().next().value;
    workbookCache.delete(oldestKey);
  }
  
  // Cache both workbook and API definition together
  workbookCache.set(apiId, {
    workbook: workbook,
    apiDefinition: apiDefinition,
    timestamp: Date.now()
  });
  
  return {
    workbook: workbook,
    apiDefinition: apiDefinition,
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