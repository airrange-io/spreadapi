const tableSheetDataCache = new Map();
const MAX_CACHE_SIZE = 100 * 1024 * 1024;
let currentCacheSize = 0;

function getCachedTableSheetData(cacheKey, ttlSeconds) {
  const entry = tableSheetDataCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlSeconds * 1000) {
    currentCacheSize -= entry.size;
    tableSheetDataCache.delete(cacheKey);
    return null;
  }
  return entry.data;
}

function cacheTableSheetData(cacheKey, data, url, dataSize) {
  if (dataSize > 10 * 1024 * 1024) return false;

  while (currentCacheSize + dataSize > MAX_CACHE_SIZE && tableSheetDataCache.size > 0) {
    let oldest = null, oldestTime = Date.now();
    for (const [key, entry] of tableSheetDataCache.entries()) {
      if (entry.timestamp < oldestTime) { oldest = key; oldestTime = entry.timestamp; }
    }
    if (oldest) {
      currentCacheSize -= tableSheetDataCache.get(oldest).size;
      tableSheetDataCache.delete(oldest);
    } else break;
  }

  if (currentCacheSize + dataSize > MAX_CACHE_SIZE) return false;

  if (tableSheetDataCache.has(cacheKey)) {
    currentCacheSize -= tableSheetDataCache.get(cacheKey).size;
    tableSheetDataCache.delete(cacheKey);
  }

  tableSheetDataCache.set(cacheKey, { data, size: dataSize, timestamp: Date.now() });
  currentCacheSize += dataSize;
  return true;
}

// Cleanup every 5 minutes, expire after 1 hour
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of tableSheetDataCache.entries()) {
    if (now - entry.timestamp > 3600000) {
      currentCacheSize -= entry.size;
      tableSheetDataCache.delete(key);
    }
  }
}, 300000);

module.exports = { getCachedTableSheetData, cacheTableSheetData };
