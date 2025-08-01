/**
 * TableSheet data caching implementation
 * Caches external TableSheet data based on service configuration
 */

// In-memory cache for TableSheet data
const tableSheetDataCache = new Map();

// Cache entry structure
class TableSheetCacheEntry {
  constructor(data, url, size) {
    this.data = data;
    this.url = url;
    this.size = size;
    this.timestamp = Date.now();
    this.hits = 0;
  }
  
  isExpired(ttlMs) {
    return Date.now() - this.timestamp > ttlMs;
  }
  
  hit() {
    this.hits++;
    return this.data;
  }
}

// Maximum cache size: 100MB for all TableSheet data
const MAX_CACHE_SIZE = 100 * 1024 * 1024;
let currentCacheSize = 0;

/**
 * Get cached TableSheet data
 * @param {string} cacheKey - Unique key for this TableSheet data
 * @param {number} ttlSeconds - TTL in seconds
 * @returns {object|null} Cached data or null if not found/expired
 */
function getCachedTableSheetData(cacheKey, ttlSeconds) {
  const entry = tableSheetDataCache.get(cacheKey);
  
  if (!entry) {
    return null;
  }
  
  if (entry.isExpired(ttlSeconds * 1000)) {
    // Remove expired entry
    evictCacheEntry(cacheKey);
    return null;
  }
  
  return entry.hit();
}

/**
 * Cache TableSheet data
 * @param {string} cacheKey - Unique key for this TableSheet data
 * @param {object} data - The data to cache
 * @param {string} url - The source URL
 * @param {number} dataSize - Size of data in bytes
 * @returns {boolean} True if cached successfully
 */
function cacheTableSheetData(cacheKey, data, url, dataSize) {
  // Check size limit (10MB per TableSheet)
  if (dataSize > 10 * 1024 * 1024) {
    console.warn(`TableSheet data too large to cache: ${(dataSize / 1024 / 1024).toFixed(2)}MB`);
    return false;
  }
  
  // Check if we need to evict entries to make room
  while (currentCacheSize + dataSize > MAX_CACHE_SIZE && tableSheetDataCache.size > 0) {
    // Evict least recently used entry
    const lruKey = findLRUEntry();
    if (lruKey) {
      evictCacheEntry(lruKey);
    } else {
      break;
    }
  }
  
  // If still not enough space, don't cache
  if (currentCacheSize + dataSize > MAX_CACHE_SIZE) {
    console.warn('TableSheet cache full, cannot cache new data');
    return false;
  }
  
  // Remove old entry if exists
  if (tableSheetDataCache.has(cacheKey)) {
    evictCacheEntry(cacheKey);
  }
  
  // Add new entry
  const entry = new TableSheetCacheEntry(data, url, dataSize);
  tableSheetDataCache.set(cacheKey, entry);
  currentCacheSize += dataSize;
  
  console.log(`Cached TableSheet data: ${cacheKey}, size: ${(dataSize / 1024).toFixed(2)}KB`);
  return true;
}

/**
 * Find least recently used cache entry
 */
function findLRUEntry() {
  let lruKey = null;
  let oldestTime = Date.now();
  
  for (const [key, entry] of tableSheetDataCache.entries()) {
    if (entry.timestamp < oldestTime) {
      oldestTime = entry.timestamp;
      lruKey = key;
    }
  }
  
  return lruKey;
}

/**
 * Evict a cache entry
 */
function evictCacheEntry(key) {
  const entry = tableSheetDataCache.get(key);
  if (entry) {
    currentCacheSize -= entry.size;
    tableSheetDataCache.delete(key);
    console.log(`Evicted TableSheet cache entry: ${key}`);
  }
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  let totalHits = 0;
  let totalEntries = tableSheetDataCache.size;
  
  for (const entry of tableSheetDataCache.values()) {
    totalHits += entry.hits;
  }
  
  return {
    entries: totalEntries,
    sizeBytes: currentCacheSize,
    sizeMB: (currentCacheSize / 1024 / 1024).toFixed(2),
    maxSizeMB: (MAX_CACHE_SIZE / 1024 / 1024).toFixed(2),
    totalHits: totalHits
  };
}

/**
 * Clear all cached data
 */
function clearCache() {
  tableSheetDataCache.clear();
  currentCacheSize = 0;
}

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of tableSheetDataCache.entries()) {
    // Use a default TTL of 1 hour for cleanup
    if (entry.isExpired(3600 * 1000)) {
      evictCacheEntry(key);
    }
  }
}, 5 * 60 * 1000);

module.exports = {
  getCachedTableSheetData,
  cacheTableSheetData,
  getCacheStats,
  clearCache
};