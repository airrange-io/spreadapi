import redis from './redis';

// Keys are namespaced per (service, source). Rows live in a plain string (JSON-
// stringified array); meta lives in a small hash. Kept separate from the
// workbook blob and from apiConfig so refresh only touches the data layer.

const rowsKey = (serviceId, sourceId) => `service:${serviceId}:datasource:${sourceId}:rows`;
const metaKey = (serviceId, sourceId) => `service:${serviceId}:datasource:${sourceId}:meta`;
const lockKey = (serviceId, sourceId) => `service:${serviceId}:datasource:${sourceId}:lock`;

const MAX_ROWS_BYTES = 10 * 1024 * 1024; // 10 MB hard cap per source
const DEFAULT_ROWS_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days — refreshes bump it

export async function getRows(serviceId, sourceId) {
  const raw = await redis.get(rowsKey(serviceId, sourceId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('[dataSourceRows.getRows] parse failed', serviceId, sourceId, e);
    return null;
  }
}

export async function setRows(serviceId, sourceId, rows, opts = {}) {
  if (!Array.isArray(rows)) {
    throw new Error('rows must be an array');
  }
  const json = JSON.stringify(rows);
  const bytes = Buffer.byteLength(json, 'utf8');
  if (bytes > MAX_ROWS_BYTES) {
    throw new Error(`rows payload is ${bytes} bytes (max ${MAX_ROWS_BYTES})`);
  }
  const ttl = opts.ttlSeconds ?? DEFAULT_ROWS_TTL_SECONDS;
  await redis.set(rowsKey(serviceId, sourceId), json, { EX: ttl });
  return bytes;
}

export async function getMeta(serviceId, sourceId) {
  const raw = await redis.hGetAll(metaKey(serviceId, sourceId));
  if (!raw || Object.keys(raw).length === 0) return null;
  return {
    lastRefreshedAt: raw.lastRefreshedAt ? parseInt(raw.lastRefreshedAt, 10) : null,
    rowCount: raw.rowCount ? parseInt(raw.rowCount, 10) : null,
    bytes: raw.bytes ? parseInt(raw.bytes, 10) : null,
    lastError: raw.lastError || null,
    lastErrorAt: raw.lastErrorAt ? parseInt(raw.lastErrorAt, 10) : null,
    refreshedBy: raw.refreshedBy || null,
  };
}

export async function recordRefresh(serviceId, sourceId, { rowCount, bytes, refreshedBy }) {
  await redis.hSet(metaKey(serviceId, sourceId), {
    lastRefreshedAt: Date.now().toString(),
    rowCount: String(rowCount ?? 0),
    bytes: String(bytes ?? 0),
    refreshedBy: refreshedBy || 'unknown',
    lastError: '',
    lastErrorAt: '',
  });
}

export async function recordRefreshError(serviceId, sourceId, errorMessage) {
  await redis.hSet(metaKey(serviceId, sourceId), {
    lastError: (errorMessage || 'refresh failed').slice(0, 500),
    lastErrorAt: Date.now().toString(),
  });
}

export async function deleteDataSource(serviceId, sourceId) {
  const multi = redis.multi();
  multi.del(rowsKey(serviceId, sourceId));
  multi.del(metaKey(serviceId, sourceId));
  multi.del(lockKey(serviceId, sourceId));
  await multi.exec();
}

// Acquire a 60 s in-flight lock. Returns true if acquired, false if another
// refresh is already in progress.
export async function acquireRefreshLock(serviceId, sourceId) {
  const result = await redis.set(lockKey(serviceId, sourceId), '1', { NX: true, EX: 60 });
  return result === 'OK';
}

export async function releaseRefreshLock(serviceId, sourceId) {
  await redis.del(lockKey(serviceId, sourceId));
}

// Best-effort: invalidate the service-level result cache after a successful
// refresh so subsequent calls recompute against the new rows.
export async function invalidateResultCache(serviceId) {
  try {
    await redis.del(`service:${serviceId}:cache:results`);
  } catch (e) {
    console.error('[dataSourceRows.invalidateResultCache] failed', serviceId, e);
  }
}
