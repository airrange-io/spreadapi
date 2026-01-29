// L1 Result Cache - caches calculation results by serviceId + hash(inputs)

const crypto = require('crypto');

const cache = new Map();
const MAX_ENTRIES = 1000;
const TTL_MS = 15 * 60 * 1000; // 15 minutes

function hashInputs(inputs) {
  const sorted = JSON.stringify(inputs, Object.keys(inputs || {}).sort());
  return crypto.createHash('md5').update(sorted).digest('hex').slice(0, 16);
}

function get(serviceId, inputs) {
  const key = `${serviceId}:${hashInputs(inputs)}`;
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < TTL_MS) {
    return entry.result;
  }
  if (entry) cache.delete(key);
  return null;
}

function set(serviceId, inputs, result) {
  const key = `${serviceId}:${hashInputs(inputs)}`;
  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { result, timestamp: Date.now() });
}

function invalidateService(serviceId) {
  const prefix = `${serviceId}:`;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

module.exports = { get, set, invalidateService };
