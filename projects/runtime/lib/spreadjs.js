// SpreadJS server-side initialization
// Supports both shared workbook (cached) and stateless modes

const config = require('./config');

let isInitialized = false;
let SpreadJS = null;
let browserEnvSetup = false;

// In-memory workbook cache
const workbookCache = new Map();

// Mutex locks per service to prevent concurrent workbook access
const workbookLocks = new Map();

/**
 * Simple mutex for async operations
 */
class Mutex {
  constructor() {
    this.locked = false;
    this.waiting = [];
  }

  async acquire() {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.waiting.push(resolve);
      }
    });
  }

  release() {
    if (this.waiting.length > 0) {
      const next = this.waiting.shift();
      next();
    } else {
      this.locked = false;
    }
  }
}

function getMutex(serviceId) {
  if (!workbookLocks.has(serviceId)) {
    workbookLocks.set(serviceId, new Mutex());
  }
  return workbookLocks.get(serviceId);
}

function setupBrowserEnvironment() {
  if (browserEnvSetup) return;

  if (typeof window !== 'undefined') {
    throw new Error('SpreadJS server cannot be used on client side');
  }

  try {
    const mockBrowser = require('mock-browser').mocks.MockBrowser;
    const canvas = require('canvas');
    const mockWindow = mockBrowser.createWindow();

    if (typeof global.window === 'undefined') global.window = mockWindow;
    if (typeof global.document === 'undefined') global.document = mockWindow.document;
    if (typeof global.navigator === 'undefined') {
      Object.defineProperty(global, 'navigator', {
        value: mockWindow.navigator,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
    if (typeof global.self === 'undefined') global.self = global.window || global;
    if (typeof global.HTMLCollection === 'undefined') global.HTMLCollection = mockWindow.HTMLCollection;
    if (typeof global.getComputedStyle === 'undefined') global.getComputedStyle = mockWindow.getComputedStyle;
    if (typeof global.customElements === 'undefined') global.customElements = null;
    if (typeof global.canvas === 'undefined') global.canvas = canvas;
    if (typeof global.HTMLElement === 'undefined') global.HTMLElement = mockWindow.HTMLElement;
    if (typeof global.HTMLDivElement === 'undefined') global.HTMLDivElement = mockWindow.HTMLDivElement;

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
    console.warn('WARNING: SPREADJS_LICENSE_KEY not set');
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

function createWorkbookFromJson(fileJson) {
  const workbook = createWorkbook();
  workbook.fromJSON(fileJson, {
    calcOnDemand: false,
    doNotRecalculateAfterLoad: true,
  });
  return workbook;
}

function getCachedWorkbookInternal(serviceId, fileJson) {
  const cached = workbookCache.get(serviceId);

  if (cached && Date.now() - cached.timestamp < config.workbookCacheTTL) {
    return { workbook: cached.workbook, fromCache: true };
  }

  const workbook = createWorkbookFromJson(fileJson);
  workbookCache.set(serviceId, { workbook, timestamp: Date.now() });

  return { workbook, fromCache: false };
}

/**
 * Execute calculation with mutex lock for thread-safe shared workbook access
 */
async function withWorkbook(serviceId, fileJson, calculationFn) {
  if (config.sharedWorkbook) {
    const mutex = getMutex(serviceId);
    await mutex.acquire();
    try {
      const { workbook, fromCache } = getCachedWorkbookInternal(serviceId, fileJson);
      return await calculationFn(workbook, fromCache);
    } finally {
      mutex.release();
    }
  } else {
    const workbook = createWorkbookFromJson(fileJson);
    return await calculationFn(workbook, false);
  }
}

function clearCache(serviceId) {
  if (serviceId) {
    workbookCache.delete(serviceId);
    workbookLocks.delete(serviceId);
  } else {
    workbookCache.clear();
    workbookLocks.clear();
  }
}

function getCacheStats() {
  return {
    workbookCount: workbookCache.size,
    mode: config.sharedWorkbook ? 'shared' : 'stateless',
  };
}

module.exports = {
  getSpreadJS,
  createWorkbook,
  createWorkbookFromJson,
  withWorkbook,
  clearCache,
  getCacheStats,
};
