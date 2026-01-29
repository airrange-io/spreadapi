// Service JSON Cache - simple in-memory cache with TTL

const cache = new Map();
const MAX_ENTRIES = 50;
const TTL_MS = 10 * 60 * 1000; // 10 minutes

function get(serviceId) {
  const entry = cache.get(serviceId);
  if (entry && Date.now() - entry.timestamp < TTL_MS) {
    return entry.data;
  }
  if (entry) cache.delete(serviceId);
  return null;
}

function set(serviceId, data) {
  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(serviceId, { data, timestamp: Date.now() });
}

function invalidate(serviceId) {
  cache.delete(serviceId);
}

function getStats() {
  return { entries: cache.size, maxEntries: MAX_ENTRIES };
}

module.exports = { get, set, invalidate, getStats };
