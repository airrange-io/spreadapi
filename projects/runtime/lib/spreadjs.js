// SpreadJS server-side initialization

let isInitialized = false;
let SpreadJS = null;
let browserEnvSetup = false;

// In-memory workbook cache
const workbookCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function setupBrowserEnvironment() {
  if (browserEnvSetup) {
    return;
  }

  // Only run on server
  if (typeof window !== 'undefined') {
    throw new Error('SpreadJS server cannot be used on client side');
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

function initializeSpreadJS() {
  if (isInitialized && SpreadJS) return SpreadJS;

  setupBrowserEnvironment();

  SpreadJS = require('@mescius/spread-sheets');
  const licenseKey = process.env.NEXT_SPREADJS18_KEY || process.env.SPREADJS_LICENSE_KEY;

  if (!licenseKey) {
    console.warn('WARNING: NEXT_SPREADJS18_KEY or SPREADJS_LICENSE_KEY not set');
  } else {
    SpreadJS.Spread.Sheets.LicenseKey = licenseKey;
  }

  isInitialized = true;
  return SpreadJS;
}

function getSpreadJS() {
  if (!isInitialized) return initializeSpreadJS();
  return SpreadJS;
}

function createWorkbook() {
  const MC = getSpreadJS();
  return new MC.Spread.Sheets.Workbook();
}

function getCachedWorkbook(serviceId, fileJson) {
  const cached = workbookCache.get(serviceId);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { workbook: cached.workbook, fromCache: true };
  }

  const workbook = createWorkbook();
  workbook.fromJSON(fileJson, {
    calcOnDemand: false,
    doNotRecalculateAfterLoad: true,
  });

  // Cache it
  workbookCache.set(serviceId, {
    workbook,
    timestamp: Date.now(),
  });

  return { workbook, fromCache: false };
}

function clearCache(serviceId) {
  if (serviceId) {
    workbookCache.delete(serviceId);
  } else {
    workbookCache.clear();
  }
}

module.exports = {
  getSpreadJS,
  createWorkbook,
  getCachedWorkbook,
  clearCache,
};
