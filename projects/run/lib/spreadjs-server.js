let isInitialized = false;
let SpreadJS = null;
let browserEnvSetup = false;
let tablesheetLoaded = false;

const workbookCache = new Map();
const CACHE_MAX_SIZE = 1000;
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes
const MAX_PROCESS_CACHE_SIZE_BYTES = 10 * 1024 * 1024;

function setupBrowserEnvironment() {
  if (browserEnvSetup) return;
  if (typeof window !== 'undefined') throw new Error('Server-side only');

  const mockBrowser = require('mock-browser').mocks.MockBrowser;
  const canvas = require('canvas');
  const mockWindow = mockBrowser.createWindow();

  if (typeof global.window === 'undefined') global.window = mockWindow;
  if (typeof global.document === 'undefined') global.document = mockWindow.document;
  if (typeof global.navigator === 'undefined') {
    Object.defineProperty(global, 'navigator', { value: mockWindow.navigator, writable: true, enumerable: true, configurable: true });
  }
  if (typeof global.self === 'undefined') global.self = global.window || global;
  if (typeof global.HTMLCollection === 'undefined') global.HTMLCollection = mockWindow.HTMLCollection;
  if (typeof global.getComputedStyle === 'undefined') global.getComputedStyle = mockWindow.getComputedStyle;
  if (typeof global.customElements === 'undefined') global.customElements = null;
  if (typeof global.canvas === 'undefined') global.canvas = canvas;
  if (typeof global.HTMLElement === 'undefined') global.HTMLElement = mockWindow.HTMLElement;
  if (typeof global.HTMLDivElement === 'undefined') global.HTMLDivElement = mockWindow.HTMLDivElement;

  browserEnvSetup = true;
}

function initializeSpreadJS() {
  if (isInitialized && SpreadJS) return SpreadJS;

  setupBrowserEnvironment();
  SpreadJS = require('@mescius/spread-sheets');
  SpreadJS.Spread.Sheets.LicenseKey = process.env.NEXT_SPREADJS18_KEY;
  isInitialized = true;
  return SpreadJS;
}

function getSpreadJS() {
  if (!isInitialized || !SpreadJS) return initializeSpreadJS();
  return SpreadJS;
}

function createWorkbook() {
  const MC = getSpreadJS();
  return new MC.Spread.Sheets.Workbook();
}

async function getCachedWorkbook(apiId, cacheKey, createFn, checkOnly = false, dataSizeBytes = 0) {
  const fullKey = `${apiId}:${cacheKey}`;
  const cached = workbookCache.get(fullKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { workbook: cached.workbook, fromCache: true };
  }

  if (checkOnly) return { workbook: null, fromCache: false };

  const workbook = createWorkbook();
  await createFn(workbook);

  if (dataSizeBytes > MAX_PROCESS_CACHE_SIZE_BYTES) {
    return { workbook, fromCache: false };
  }

  if (workbookCache.size >= CACHE_MAX_SIZE) {
    const oldestKey = workbookCache.keys().next().value;
    workbookCache.delete(oldestKey);
  }

  workbookCache.set(fullKey, { workbook, timestamp: Date.now() });
  return { workbook, fromCache: false };
}

function loadTablesheetModule() {
  if (tablesheetLoaded) return true;
  try {
    setupBrowserEnvironment();
    getSpreadJS();
    require('@mescius/spread-sheets-tablesheet');
    tablesheetLoaded = true;
    return true;
  } catch {
    return false;
  }
}

function needsTablesheetModule(fileJson) {
  if (!fileJson?.sheets) return false;
  for (const sheet of Object.values(fileJson.sheets)) {
    if (sheet?.dataManager?.tables && Object.keys(sheet.dataManager.tables).length > 0) {
      return true;
    }
  }
  return false;
}

// Cleanup expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of workbookCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) workbookCache.delete(key);
  }
}, 60 * 1000);

module.exports = {
  getSpreadJS,
  createWorkbook,
  getCachedWorkbook,
  loadTablesheetModule,
  needsTablesheetModule,
  initializeSpreadJS
};
