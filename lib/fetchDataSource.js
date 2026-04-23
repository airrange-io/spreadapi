// Shared fetch + parse logic for Live Data sources.
// Used by both the design-time preview endpoint (small sample, returns inferred
// schema) and the runtime refresh endpoint (full dataset, writes to Redis).

const MAX_RESPONSE_BYTES = 20 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 5;

function isPrivateHost(hostname) {
  const h = (hostname || '').toLowerCase();
  if (h === 'localhost' || h === '0.0.0.0' || h === '::1' || h === '::') return true;
  if (h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (/^fc|^fd/.test(h)) return true;
  return false;
}

export function validateUrl(raw) {
  let u;
  try { u = new URL(raw); } catch { return { ok: false, error: 'Invalid URL' }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return { ok: false, error: 'Only http(s) URLs are supported' };
  }
  if (isPrivateHost(u.hostname)) {
    return { ok: false, error: 'Private and local addresses are not allowed' };
  }
  return { ok: true, url: u };
}

async function fetchWithLimits(initialUrl, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    let currentUrl = initialUrl;
    let res;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      res = await fetch(currentUrl, { ...init, signal: ctrl.signal, redirect: 'manual' });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (!location) {
          return { ok: false, error: `Upstream returned ${res.status} with no Location header` };
        }
        let next;
        try { next = new URL(location, currentUrl); }
        catch { return { ok: false, error: `Invalid redirect target: ${location}` }; }
        const v = validateUrl(next.toString());
        if (!v.ok) return { ok: false, error: `Redirect blocked: ${v.error}` };
        if (hop === MAX_REDIRECTS) return { ok: false, error: 'Too many redirects' };
        currentUrl = next.toString();
        if (res.status === 301 || res.status === 302 || res.status === 303) {
          init = { ...init, method: 'GET', body: undefined };
        }
        continue;
      }
      break;
    }
    if (!res.ok) {
      return { ok: false, error: `Upstream returned ${res.status} ${res.statusText}` };
    }
    const reader = res.body?.getReader();
    if (!reader) {
      const text = await res.text();
      return { ok: true, text };
    }
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_RESPONSE_BYTES) {
        try { await reader.cancel(); } catch {}
        return { ok: false, error: `Response exceeded ${MAX_RESPONSE_BYTES} bytes` };
      }
      chunks.push(value);
    }
    const buf = new Uint8Array(received);
    let offset = 0;
    for (const c of chunks) { buf.set(c, offset); offset += c.byteLength; }
    return { ok: true, text: new TextDecoder('utf-8').decode(buf) };
  } catch (e) {
    if (e.name === 'AbortError') return { ok: false, error: 'Request timed out' };
    return { ok: false, error: e.message || 'Fetch failed' };
  } finally {
    clearTimeout(timer);
  }
}

function extractArrayByPath(data, path) {
  if (!path) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      for (const key of ['data', 'results', 'items', 'records', 'rows']) {
        if (Array.isArray(data[key])) return data[key];
      }
    }
    return null;
  }
  const parts = path.split('.').filter(Boolean);
  let cursor = data;
  for (const part of parts) {
    if (cursor == null) return null;
    cursor = cursor[part];
  }
  return Array.isArray(cursor) ? cursor : null;
}

function parseCsv(text, delimiter) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === delimiter) { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* ignore */ }
      else { field += c; }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function inferType(values) {
  const nonEmpty = values.filter((v) => v !== null && v !== undefined && v !== '');
  if (nonEmpty.length === 0) return 'string';
  const isNum = nonEmpty.every((v) => typeof v === 'number' || (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())));
  if (isNum) return 'number';
  const isBool = nonEmpty.every((v) => v === true || v === false || (typeof v === 'string' && /^(true|false)$/i.test(v.trim())));
  if (isBool) return 'boolean';
  const isDate = nonEmpty.every((v) => typeof v === 'string' && !Number.isNaN(Date.parse(v)) && /\d{4}-\d{2}-\d{2}/.test(v));
  if (isDate) return 'date';
  return 'string';
}

export function inferSchema(rows) {
  if (!rows || rows.length === 0) return [];
  const seen = new Map();
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(row[key]);
    }
  }
  return Array.from(seen.entries()).map(([name, values]) => ({
    name,
    dataType: inferType(values),
  }));
}

function csvRowsToObjects(rawRows, hasHeader) {
  if (rawRows.length === 0) return { columns: [], objects: [] };
  const headers = hasHeader
    ? rawRows[0].map((h, i) => (h && h.trim()) || `col_${i + 1}`)
    : rawRows[0].map((_, i) => `col_${i + 1}`);
  const body = hasHeader ? rawRows.slice(1) : rawRows;
  const objects = body
    .filter((r) => r.some((c) => c !== ''))
    .map((r) => {
      const o = {};
      headers.forEach((h, i) => { o[h] = r[i] ?? ''; });
      return o;
    });
  return { columns: headers, objects };
}

/**
 * Fetch and parse a data source into rows + inferred schema.
 *
 * @param {object} source - Source config: { type, url, method?, headers?, requestBody?, jsonPath?, hasHeader?, delimiter? }
 * @param {object} opts   - Optional: { maxRows } (caps the result)
 * @returns {Promise<{ ok: true, rows, columns, totalRowsFetched } | { ok: false, error, stage }>}
 */
export async function fetchDataSource(source, opts = {}) {
  const { type, url, method, headers, requestBody, jsonPath, hasHeader, delimiter } = source || {};

  const v = validateUrl(url);
  if (!v.ok) return { ok: false, error: v.error, stage: 'validate' };

  const init = { method: 'GET', headers: { 'User-Agent': 'SpreadAPI-Fetch/1.0' } };
  if (type === 'rest') {
    init.method = (method || 'GET').toUpperCase();
    if (headers && typeof headers === 'object') {
      init.headers = { ...init.headers, ...headers };
    }
    if (requestBody && init.method !== 'GET' && init.method !== 'HEAD') {
      init.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
      if (!init.headers['Content-Type'] && !init.headers['content-type']) {
        init.headers['Content-Type'] = 'application/json';
      }
    }
  }

  const result = await fetchWithLimits(v.url.toString(), init);
  if (!result.ok) return { ok: false, error: result.error, stage: 'fetch' };

  if (type === 'csv') {
    const delim = (delimiter && delimiter.length === 1) ? delimiter : ',';
    const text = result.text.charCodeAt(0) === 0xFEFF ? result.text.slice(1) : result.text;
    const rawRows = parseCsv(text, delim);
    const { columns, objects } = csvRowsToObjects(rawRows, hasHeader !== false);
    const capped = opts.maxRows ? objects.slice(0, opts.maxRows) : objects;
    const schema = columns.map((name) => ({
      name,
      dataType: inferType(objects.map((o) => o[name])),
    }));
    return { ok: true, rows: capped, columns: schema, totalRowsFetched: objects.length };
  }

  let parsed;
  try { parsed = JSON.parse(result.text); }
  catch { return { ok: false, error: 'Response is not valid JSON', stage: 'parse' }; }

  const arr = extractArrayByPath(parsed, jsonPath);
  if (!arr) {
    return {
      ok: false,
      error: jsonPath
        ? `No array found at path "${jsonPath}"`
        : 'Could not find an array in the response. Provide a JSON path.',
      stage: 'path',
    };
  }

  const capped = opts.maxRows ? arr.slice(0, opts.maxRows) : arr;
  const schema = inferSchema(arr);
  return { ok: true, rows: capped, columns: schema, totalRowsFetched: arr.length };
}
