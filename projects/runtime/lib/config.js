/**
 * Runtime Configuration
 *
 * Environment variables to customize engine behavior:
 *
 * SPREADAPI_SHARED_WORKBOOK (default: true)
 *   - true: Cache and reuse workbooks per service (faster, recommended)
 *   - false: Create fresh workbook for each request (stateless, slower)
 *
 * SPREADAPI_RESULT_CACHE (default: true)
 *   - true: Cache calculation results by inputs (instant response for same inputs)
 *   - false: Always recalculate (useful for debugging or real-time data)
 *
 * SPREADAPI_WORKBOOK_CACHE_TTL (default: 1800000 = 30 minutes)
 *   - Time in milliseconds before cached workbooks expire
 *
 * SPREADAPI_RESULT_CACHE_TTL (default: 300000 = 5 minutes)
 *   - Time in milliseconds before cached results expire
 */

function parseBoolean(value, defaultValue) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const lower = String(value).toLowerCase().trim();
  if (lower === 'true' || lower === '1' || lower === 'yes') return true;
  if (lower === 'false' || lower === '0' || lower === 'no') return false;
  return defaultValue;
}

function parseNumber(value, defaultValue) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

const config = {
  // Workbook caching: reuse workbooks across requests (recommended for performance)
  sharedWorkbook: parseBoolean(process.env.SPREADAPI_SHARED_WORKBOOK, true),

  // Result caching: cache calculation results by inputs
  resultCache: parseBoolean(process.env.SPREADAPI_RESULT_CACHE, true),

  // Cache TTLs
  workbookCacheTTL: parseNumber(process.env.SPREADAPI_WORKBOOK_CACHE_TTL, 30 * 60 * 1000), // 30 min
  resultCacheTTL: parseNumber(process.env.SPREADAPI_RESULT_CACHE_TTL, 5 * 60 * 1000), // 5 min

  // Maximum cached results (LRU eviction when exceeded)
  resultCacheMaxEntries: parseNumber(process.env.SPREADAPI_RESULT_CACHE_MAX_ENTRIES, 1000),
};

// Log configuration on startup
console.log('[SpreadAPI Runtime Config]', {
  sharedWorkbook: config.sharedWorkbook,
  resultCache: config.resultCache,
  workbookCacheTTL: `${config.workbookCacheTTL / 1000}s`,
  resultCacheTTL: `${config.resultCacheTTL / 1000}s`,
  resultCacheMaxEntries: config.resultCacheMaxEntries,
});

module.exports = config;
