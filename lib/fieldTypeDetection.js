/**
 * Shared Field Type Detection
 *
 * Provides consistent field type detection across all AI instruction locations:
 * - ServiceAI (/lib/serviceAI.js) - AI-generated service metadata
 * - MCP Instructions (/lib/mcp-ai-instructions.js) - Chat and MCP guidance
 * - Parameter Validation (/lib/parameterValidation.js) - Server-side safety net
 *
 * CRITICAL: These detection rules MUST stay synchronized to ensure AI receives
 * consistent guidance regardless of which code path generates the instructions.
 */

/**
 * Detect percentage fields in input parameters
 *
 * A field is considered a percentage field if ANY of these conditions are true:
 * 1. format === 'percentage' (explicit declaration)
 * 2. formatString contains '%' (e.g., "#,##0.00%")
 * 3. name contains 'rate', 'percent', or '%' (semantic detection)
 * 4. title contains 'rate', 'percent', or '%' (semantic detection)
 * 5. min=0 and max=1 (decimal percentage range)
 *
 * @param {Array} inputs - Array of input parameter definitions
 * @returns {Array} Array of percentage field definitions
 */
export function detectPercentageFields(inputs) {
  if (!inputs || !Array.isArray(inputs)) return [];

  return inputs.filter(input => {
    // Explicit format declaration
    if (input.format === 'percentage') return true;

    // Format string contains percentage sign
    if (input.formatString && input.formatString.includes('%')) return true;

    // Name suggests percentage (interest_rate, tax_rate, discount_percent, etc.)
    if (input.name && /rate|percent|%/i.test(input.name)) return true;

    // Title suggests percentage (Interest Rate, Tax Percent, etc.)
    if (input.title && /rate|percent|%/i.test(input.title)) return true;

    // Decimal bounds suggest percentage (0.0 to 1.0 = 0% to 100%)
    if (input.min === 0 && input.max === 1) return true;

    return false;
  });
}

/**
 * Detect boolean fields in input parameters
 *
 * @param {Array} inputs - Array of input parameter definitions
 * @returns {Array} Array of boolean field definitions
 */
export function detectBooleanFields(inputs) {
  if (!inputs || !Array.isArray(inputs)) return [];
  return inputs.filter(input => input.type === 'boolean');
}

/**
 * Check if any percentage fields exist
 *
 * @param {Array} inputs - Array of input parameter definitions
 * @returns {boolean} True if at least one percentage field exists
 */
export function hasPercentageFields(inputs) {
  return detectPercentageFields(inputs).length > 0;
}

/**
 * Check if any boolean fields exist
 *
 * @param {Array} inputs - Array of input parameter definitions
 * @returns {boolean} True if at least one boolean field exists
 */
export function hasBooleanFields(inputs) {
  return detectBooleanFields(inputs).length > 0;
}

/**
 * Get detailed percentage field information for AI guidance
 *
 * @param {Array} inputs - Array of input parameter definitions
 * @returns {Object} { fields: Array, hasFields: boolean, fieldNames: Array }
 */
export function getPercentageFieldInfo(inputs) {
  const fields = detectPercentageFields(inputs);
  return {
    fields,
    hasFields: fields.length > 0,
    fieldNames: fields.map(f => f.name),
    fieldTitles: fields.map(f => f.title || f.name)
  };
}

/**
 * Get detailed boolean field information for AI guidance
 *
 * @param {Array} inputs - Array of input parameter definitions
 * @returns {Object} { fields: Array, hasFields: boolean, fieldNames: Array }
 */
export function getBooleanFieldInfo(inputs) {
  const fields = detectBooleanFields(inputs);
  return {
    fields,
    hasFields: fields.length > 0,
    fieldNames: fields.map(f => f.name),
    fieldTitles: fields.map(f => f.title || f.name)
  };
}
