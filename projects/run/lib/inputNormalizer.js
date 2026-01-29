/**
 * Normalize input keys to lowercase for consistent lookups.
 *
 * This ensures that parameter names like "Price", "PRICE", and "price"
 * are all treated the same way when matching against service definitions.
 *
 * @param {Object} inputs - The inputs object with potentially mixed-case keys
 * @returns {Object} - New object with all keys lowercased
 */
export function normalizeInputKeys(inputs) {
  if (!inputs || typeof inputs !== 'object') {
    return {};
  }

  const normalized = {};
  for (const [key, value] of Object.entries(inputs)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}
