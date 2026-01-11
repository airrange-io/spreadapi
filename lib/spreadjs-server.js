// This file contains server-only code for SpreadJS initialization
// It should never be imported on the client side

let isInitialized = false;
let SpreadJS = null;
let browserEnvSetup = false;

// Process-level workbook cache
const workbookCache = new Map();
const CACHE_MAX_SIZE = 1000; // ~500MB for 100-500KB workbooks (well within 3GB limit)
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes TTL
const MAX_PROCESS_CACHE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB - larger workbooks use Redis only

/**
 * Set up browser environment for SpreadJS
 * Separated from initialization for better control
 */
function setupBrowserEnvironment() {
  if (browserEnvSetup) {
    return;
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
      global.self = global.window || global;
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

    browserEnvSetup = true;
  } catch (error) {
    console.error('Failed to setup browser environment:', error);
    throw error;
  }
}

/**
 * Initialize SpreadJS with browser environment
 * This function ensures SpreadJS is only initialized once
 */
function initializeSpreadJS() {
  if (isInitialized && SpreadJS) {
    return SpreadJS;
  }

  try {
    // Ensure browser environment is set up
    setupBrowserEnvironment();
    
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
 * Get or create a cached workbook
 * @param {string} apiId - The API identifier
 * @param {string} cacheKey - Unique cache key (e.g., based on inputs)
 * @param {Function} createFn - Function to create and populate the workbook
 * @param {boolean} checkOnly - If true, only check cache without creating
 * @param {number} dataSizeBytes - Optional size of the source data in bytes (for size-based filtering)
 * @returns {Promise<Object>} Workbook data and cache status
 */
async function getCachedWorkbook(apiId, cacheKey, createFn, checkOnly = false, dataSizeBytes = 0) {
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

  // If checkOnly, return cache miss
  if (checkOnly) {
    return {
      workbook: null,
      fromCache: false,
      cacheSize: workbookCache.size
    };
  }

  // Create new workbook
  const workbook = createWorkbook();
  await createFn(workbook);

  // Skip process cache for large workbooks (they'll use Redis cache instead)
  if (dataSizeBytes > MAX_PROCESS_CACHE_SIZE_BYTES) {
    console.log(`[ProcessCache] Skipping cache for ${apiId} - too large (${(dataSizeBytes / 1024 / 1024).toFixed(1)}MB > ${MAX_PROCESS_CACHE_SIZE_BYTES / 1024 / 1024}MB limit)`);
    return {
      workbook: workbook,
      fromCache: false,
      skippedProcessCache: true,
      reason: 'size_exceeded',
      cacheSize: workbookCache.size
    };
  }

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

let tablesheetLoaded = false;

/**
 * Load tablesheet module if needed
 * Only loads when actually required, minimizing memory usage
 */
function loadTablesheetModule() {
  if (tablesheetLoaded) {
    return true;
  }
  
  try {
    // Ensure browser environment is set up first
    setupBrowserEnvironment();
    
    // Ensure SpreadJS base is loaded
    getSpreadJS();
    
    // Load TableSheet module
    require('@mescius/spread-sheets-tablesheet');
    tablesheetLoaded = true;
    console.log('[SpreadJS] TableSheet module loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load tablesheet module:', error);
    return false;
  }
}

/**
 * Check if tablesheet module is needed based on fileJson
 * This avoids loading the module for services that don't need it
 * TableSheets are identified by having dataManager.tables with external data connections
 */
function needsTablesheetModule(fileJson) {
  if (!fileJson || !fileJson.sheets) return false;

  // Check if any sheet has TableSheet data connections
  for (const sheet of Object.values(fileJson.sheets)) {
    if (sheet && sheet.dataManager && sheet.dataManager.tables) {
      // Check if there are actual table definitions
      const tables = sheet.dataManager.tables;
      if (typeof tables === 'object' && Object.keys(tables).length > 0) {
        return true;
      }
    }
  }

  return false;
}

module.exports = {
  getSpreadJS,
  createWorkbook,
  getCachedWorkbook,
  loadTablesheetModule,
  needsTablesheetModule,
  initializeSpreadJS,
  // Cache stats for monitoring
  getCacheStats: () => ({
    size: workbookCache.size,
    maxSize: CACHE_MAX_SIZE,
    ttlMs: CACHE_TTL_MS
  })
};