/**
 * HMAC signing for stateless Excel export URLs.
 *
 * A signed export link authenticates a protected service WITHOUT putting the
 * service token in the URL. The signature binds to (serviceId + exact inputs +
 * expiry), so the link is tamper-proof (changing an input breaks it) and expires.
 *
 * Both the signer (MCP calc metadata) and the verifier (export endpoint) must
 * canonicalize the inputs identically. We canonicalize over the STRING form of
 * the params exactly as they appear in the URL — so there is no type-coercion
 * mismatch between the two sides.
 *
 * If EXPORT_URL_SECRET is not configured, signing returns null and callers fall
 * back to the token (backwards compatible — nothing breaks).
 */
const crypto = require('crypto');

const DEFAULT_TTL_SECONDS = 24 * 60 * 60; // 24h

function getSecret() {
  return process.env.EXPORT_URL_SECRET || '';
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Deterministic string over serviceId + sorted input pairs + expiry.
 * @param {string} serviceId
 * @param {Array<[string,string]>} inputPairs - [key, value] pairs, string form
 * @param {number} exp - unix seconds
 */
function canonicalString(serviceId, inputPairs, exp) {
  const sorted = (inputPairs || [])
    .map(([k, v]) => [String(k).toLowerCase(), String(v)])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0)));
  // Encode key and value so a value containing '&', '=' or a newline can't
  // shift the boundaries and collide with a different input set.
  const params = sorted.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  return `${serviceId}\n${params}\n${exp}`;
}

function computeSig(serviceId, inputPairs, exp) {
  const secret = getSecret();
  if (!secret) return null;
  return crypto
    .createHmac('sha256', secret)
    .update(canonicalString(serviceId, inputPairs, exp))
    .digest('hex');
}

/**
 * Sign export params. Returns { sig, exp } or null when no secret is configured.
 */
function signExportParams(serviceId, inputPairs, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const secret = getSecret();
  if (!secret) return null;
  const exp = nowSeconds() + ttlSeconds;
  const sig = computeSig(serviceId, inputPairs, exp);
  return sig ? { sig, exp } : null;
}

/**
 * Verify an export signature. Returns true only if the secret is configured,
 * the signature matches these exact inputs, and it has not expired.
 */
function verifyExportSignature(serviceId, inputPairs, sig, exp) {
  const secret = getSecret();
  if (!secret || !sig || !exp) return false;

  const expNum = parseInt(exp, 10);
  if (!Number.isFinite(expNum) || expNum < nowSeconds()) return false;

  const expected = computeSig(serviceId, inputPairs, expNum);
  if (!expected) return false;

  let a;
  let b;
  try {
    a = Buffer.from(expected, 'hex');
    b = Buffer.from(String(sig), 'hex');
  } catch (e) {
    return false;
  }
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Build a ready-to-use export download URL for the given inputs.
 * - Public services: plain URL (no auth needed).
 * - Protected services: a signed, expiring URL (no token in the link). Falls back
 *   to the token only if no signing secret is configured.
 * Built fresh per response (never cached) because the signature carries an expiry.
 */
function buildExportUrl(serviceId, inputs, opts = {}) {
  // Prefer the explicit canonical domain (prod), else the request's own origin
  // (so local dev links point at localhost), else a safe default.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || opts.baseUrl || 'https://spreadapi.io';
  const qs = new URLSearchParams();
  const pairs = [];
  for (const [k, v] of Object.entries(inputs || {})) {
    if (v === null || v === undefined) continue;
    const key = String(k);
    const val = String(v);
    qs.set(key, val);
    pairs.push([key, val]);
  }
  if (opts.needsToken) {
    const signed = signExportParams(serviceId, pairs);
    if (signed) {
      qs.set('sig', signed.sig);
      qs.set('exp', String(signed.exp));
    } else if (opts.apiToken) {
      qs.set('token', opts.apiToken);
    }
  }
  return `${baseUrl}/api/v1/services/${serviceId}/export?${qs.toString()}`;
}

module.exports = { signExportParams, verifyExportSignature, buildExportUrl };
