// L1 Result Cache - caches calculation results by serviceId + hash(inputs)

const crypto = require('crypto');
const config = require('./config');

const cache = new Map();

function hashInputs(inputs) {
  const sorted = JSON.stringify(inputs, Object.keys(inputs || {}).sort());
  return crypto.createHash('md5').update(sorted).digest('hex').slice(0, 16);
}

function get(serviceId, inputs) {
  const key = `${serviceId}:${hashInputs(inputs)}`;
  const entry = cache.get(key);

  if (!entry) return null;

  if (Date.now() - entry.timestamp >= config.resultCacheTTL) {
    cache.delete(key);
    return null;
  }

  return entry.result;
}

function set(serviceId, inputs, result) {
  const key = `${serviceId}:${hashInputs(inputs)}`;

  // Simple eviction when full
  if (cache.size >= config.resultCacheMaxEntries) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }

  cache.set(key, { result, timestamp: Date.now() });
}

function invalidateService(serviceId) {
  const prefix = `${serviceId}:`;
  for (const key of [...cache.keys()]) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

function clear() {
  cache.clear();
}

function getStats() {
  return {
    entries: cache.size,
    maxEntries: config.resultCacheMaxEntries,
  };
}

module.exports = { get, set, invalidateService, clear, getStats };
