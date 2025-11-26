/**
 * Centralized Editor Type Detection Manager
 *
 * Provides consistent editor detection for:
 * - InputRenderer (React/antd forms)
 * - ServiceTester (API Testing panel)
 * - WebAppClient (Public WebApp)
 * - mustacheRenderer (WebSnippets HTML)
 */

// ============================================================================
// Types
// ============================================================================

export interface InputParameter {
  name: string;
  title?: string;
  description?: string;
  type?: string;
  dataType?: string;  // Alternative to type (some APIs use this)
  format?: string;    // 'percentage', etc.
  formatString?: string;  // Excel-style: "$#,##0.00", "0.00%"
  allowedValues?: string[];
  min?: number | string;  // May come as string from Redis
  max?: number | string;
  value?: any;
  mandatory?: boolean;
  placeholder?: string;
}

export type EditorType =
  | 'select'      // Dropdown for allowedValues
  | 'boolean'     // Switch/checkbox
  | 'percentage'  // Number with % display, stored as 0-1
  | 'slider'      // Number with slider (has bounded range)
  | 'number'      // Regular number input
  | 'date'
  | 'email'
  | 'url'
  | 'tel'
  | 'text';       // Default fallback

export interface FormatInfo {
  prefix: string;       // "$", "€", etc.
  suffix: string;       // " kg", " EUR", etc.
  decimals: number;     // Number of decimal places
  hasThousands: boolean;
  isPercentage: boolean;
}

export interface EditorConfig {
  editorType: EditorType;
  htmlInputType: string;  // HTML input type attribute

  // Number-specific
  isPercentage: boolean;
  hasSlider: boolean;
  min?: number;
  max?: number;
  step: number;

  // Display values for percentage (stored 0-1, display 0-100)
  displayMin?: number;
  displayMax?: number;
  displayStep?: number;

  // Dropdown options
  allowedValues?: string[];

  // Format information
  formatInfo: FormatInfo;
}

// ============================================================================
// Locale Detection
// ============================================================================

/**
 * Detect browser/system locale with SSR-safe fallback.
 * Consumers should call this once and pass the result to other functions.
 */
export function detectLocale(): string {
  // SSR-safe: check if window exists
  if (typeof window === 'undefined') {
    return 'en-US';
  }

  // Try navigator.language first
  if (navigator?.language) {
    return navigator.language;
  }

  // Fallback to Intl
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return 'en-US';
  }
}

/**
 * Check if locale uses comma as decimal separator.
 */
export function usesCommaDecimal(locale: string): boolean {
  try {
    const formatted = new Intl.NumberFormat(locale).format(1.1);
    return formatted.includes(',');
  } catch {
    return false;
  }
}

// ============================================================================
// Number Formatter Cache
// ============================================================================

const formatterCache = new Map<string, Intl.NumberFormat>();

function getCacheKey(locale: string, options: Intl.NumberFormatOptions): string {
  return `${locale}:${JSON.stringify(options)}`;
}

/**
 * Get or create a cached NumberFormat instance.
 */
export function getNumberFormatter(locale: string, options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  const key = getCacheKey(locale, options);

  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, options));
  }

  return formatterCache.get(key)!;
}

/**
 * Create formatters for integer and decimal display.
 */
export function createFormatters(locale: string) {
  return {
    integer: getNumberFormatter(locale, { maximumFractionDigits: 0 }),
    decimal: getNumberFormatter(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    forDecimals: (decimals: number) => getNumberFormatter(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  };
}

// ============================================================================
// Number Parsing
// ============================================================================

/**
 * Parse a locale-formatted number string.
 * Handles both "1,234.56" (en) and "1.234,56" (de) formats.
 */
export function parseLocaleNumber(value: string | undefined, locale: string): number {
  if (!value || typeof value !== 'string') return NaN;

  const commaIsDecimal = usesCommaDecimal(locale);

  let cleaned = value.trim();

  if (commaIsDecimal) {
    // German-style: 1.234,56 → remove dots, replace comma with dot
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // English-style: 1,234.56 → just remove commas
    cleaned = cleaned.replace(/,/g, '');
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? NaN : parsed;
}

/**
 * Create a parser function bound to a locale.
 * Useful for antd InputNumber parser prop.
 */
export function createLocaleParser(locale: string): (value: string | undefined) => number {
  return (value) => parseLocaleNumber(value, locale);
}

// ============================================================================
// Format String Parsing
// ============================================================================

/**
 * Parse Excel-style format string to extract formatting info.
 * Examples: "$#,##0.00", "0.00%", "#,##0 EUR"
 */
export function parseFormatString(formatStr: string | undefined): FormatInfo {
  if (!formatStr) {
    return { prefix: '', suffix: '', decimals: 2, hasThousands: false, isPercentage: false };
  }

  const isPercentage = formatStr.includes('%');
  const hasThousands = formatStr.includes(',') || formatStr.includes('#,');

  // Extract decimals from patterns like ".00" or ".000"
  const decimalMatch = formatStr.match(/\.([0#]+)/);
  const decimals = decimalMatch ? decimalMatch[1].length : 0;

  // Extract prefix (anything before the first digit placeholder)
  const prefixMatch = formatStr.match(/^([^#0,.%]*)/);
  let prefix = prefixMatch ? prefixMatch[1].trim() : '';

  // Extract suffix (anything after the last digit placeholder, excluding %)
  const suffixMatch = formatStr.match(/[#0]([^#0%]*)(%?)$/);
  let suffix = '';
  if (suffixMatch) {
    suffix = suffixMatch[1].trim();
  }

  // Handle case where suffix is at the end after %
  if (isPercentage) {
    const afterPercent = formatStr.match(/%(.+)$/);
    if (afterPercent) {
      suffix = afterPercent[1].trim();
    }
  }

  return { prefix, suffix, decimals, hasThousands, isPercentage };
}

// ============================================================================
// Smart Step Calculation
// ============================================================================

/**
 * Calculate smart step size that results in nice increments.
 * Aims for ~50-100 steps across the range, with nice rounded values.
 */
export function getSmartStep(
  value: number | undefined,
  min: number | string | undefined,
  max: number | string | undefined
): number {
  // Convert to numbers (may be strings from Redis)
  const minNum = min !== undefined && min !== '' ? Number(min) : undefined;
  const maxNum = max !== undefined && max !== '' ? Number(max) : undefined;
  const valueNum = value !== undefined ? Number(value) : undefined;

  // If we have a bounded range, calculate step from range
  if (minNum !== undefined && maxNum !== undefined && !isNaN(minNum) && !isNaN(maxNum)) {
    const range = maxNum - minNum;

    if (range <= 0) return 1;
    if (range <= 1) return 0.01;
    if (range <= 10) return 0.1;
    if (range <= 100) return 1;
    if (range <= 1000) return 10;
    if (range <= 10000) return 100;

    // For large ranges, aim for ~100 steps with nice rounding
    const rawStep = range / 100;

    // Round to nice numbers
    if (rawStep >= 1000) return Math.round(rawStep / 1000) * 1000;
    if (rawStep >= 100) return Math.round(rawStep / 100) * 100;
    if (rawStep >= 10) return Math.round(rawStep / 10) * 10;
    if (rawStep >= 1) return Math.round(rawStep);

    return rawStep;
  }

  // No range - base step on current value
  const currentValue = (valueNum !== undefined && !isNaN(valueNum)) ? Math.abs(valueNum) : 0;

  if (currentValue === 0) return 1;
  if (currentValue < 1) return 0.01;
  if (currentValue < 10) return 0.1;
  if (currentValue < 100) return 1;
  if (currentValue < 1000) return 10;
  if (currentValue < 10000) return 100;

  // For large values, ~2-5% step
  return Math.round(currentValue / 50);
}

// ============================================================================
// Editor Type Detection
// ============================================================================

/**
 * Get HTML input type attribute for a given parameter type.
 */
export function getHtmlInputType(paramType: string | undefined): string {
  switch (paramType?.toLowerCase()) {
    case 'number':
    case 'integer':
    case 'float':
    case 'double':
      return 'number';
    case 'boolean':
      return 'checkbox';
    case 'date':
      return 'date';
    case 'email':
      return 'email';
    case 'url':
      return 'url';
    case 'tel':
    case 'phone':
      return 'tel';
    default:
      return 'text';
  }
}

/**
 * Determine the appropriate editor type for an input parameter.
 */
export function getEditorType(input: InputParameter): EditorType {
  // 1. Dropdown for allowedValues
  if (input.allowedValues && Array.isArray(input.allowedValues) && input.allowedValues.length > 0) {
    return 'select';
  }

  // Normalize type (some APIs use dataType)
  const inputType = (input.type || input.dataType || 'text').toLowerCase();

  // 2. Boolean
  if (inputType === 'boolean') {
    return 'boolean';
  }

  // 3. Number variants
  if (['number', 'integer', 'float', 'double'].includes(inputType)) {
    // Check for percentage
    const isPercentage = input.format === 'percentage' || input.formatString?.includes('%');
    if (isPercentage) {
      return 'percentage';
    }

    // Check for slider (bounded range)
    const min = input.min !== undefined && input.min !== '' ? Number(input.min) : undefined;
    const max = input.max !== undefined && input.max !== '' ? Number(input.max) : undefined;

    if (min !== undefined && max !== undefined && !isNaN(min) && !isNaN(max)) {
      const range = max - min;
      // Use slider for reasonable ranges (not too large)
      if (range > 0 && range <= 10000) {
        return 'slider';
      }
    }

    return 'number';
  }

  // 4. Other specific types
  if (inputType === 'date') return 'date';
  if (inputType === 'email') return 'email';
  if (inputType === 'url') return 'url';
  if (inputType === 'tel' || inputType === 'phone') return 'tel';

  // 5. Default to text
  return 'text';
}

/**
 * Get complete editor configuration for an input parameter.
 */
export function getEditorConfig(input: InputParameter): EditorConfig {
  const editorType = getEditorType(input);
  const formatInfo = parseFormatString(input.formatString);

  // Parse min/max (may be strings from Redis)
  const min = input.min !== undefined && input.min !== '' ? Number(input.min) : undefined;
  const max = input.max !== undefined && input.max !== '' ? Number(input.max) : undefined;

  const isPercentage = editorType === 'percentage' || formatInfo.isPercentage;
  const hasSlider = editorType === 'slider' ||
    (isPercentage && min !== undefined && max !== undefined);

  const step = getSmartStep(input.value, min, max);

  // Calculate display values for percentage (stored as 0-1, display as 0-100)
  let displayMin: number | undefined;
  let displayMax: number | undefined;
  let displayStep: number | undefined;

  if (isPercentage) {
    displayMin = min !== undefined ? min * 100 : undefined;
    displayMax = max !== undefined ? max * 100 : undefined;
    displayStep = step * 100;
  }

  return {
    editorType: editorType === 'slider' ? 'number' : editorType, // slider is a variant of number
    htmlInputType: getHtmlInputType(input.type || input.dataType),
    isPercentage,
    hasSlider,
    min,
    max,
    step,
    displayMin,
    displayMax,
    displayStep,
    allowedValues: input.allowedValues,
    formatInfo
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a description is AI-specific and should be hidden from users.
 */
export function isAiDescription(desc: string | undefined): boolean {
  if (!desc) return false;

  const aiPatterns = [
    /^CRITICAL:/i,
    /you MUST pass/i,
    /Never pass the whole number/i,
    /Pass actual boolean value/i,
    /Accept multiple formats.*yes\/no.*true\/false/i,
    /this is only relevant if/i,
    /only relevant when/i,
    /only applies if/i,
    /only applies when/i
  ];

  return aiPatterns.some(pattern => pattern.test(desc));
}

/**
 * Parse boolean from various formats.
 */
export function parseBooleanValue(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1 || value === 'yes') return true;
  return false;
}

/**
 * Convert stored value to display value for percentage fields.
 * Stored: 0.05 → Display: 5
 */
export function toDisplayValue(value: number | undefined, isPercentage: boolean): number | undefined {
  if (value === undefined || value === null) return undefined;
  return isPercentage ? value * 100 : value;
}

/**
 * Convert display value to stored value for percentage fields.
 * Display: 5 → Stored: 0.05
 */
export function toStoredValue(value: number | null | undefined, isPercentage: boolean): number | null {
  if (value === undefined || value === null) return null;
  return isPercentage ? value / 100 : value;
}

/**
 * Format a number for display with locale and format info.
 */
export function formatNumber(
  value: number,
  locale: string,
  formatInfo: FormatInfo
): string {
  const formatter = getNumberFormatter(locale, {
    minimumFractionDigits: formatInfo.decimals,
    maximumFractionDigits: formatInfo.decimals,
    useGrouping: formatInfo.hasThousands
  });

  let result = formatter.format(value);

  if (formatInfo.prefix) {
    result = formatInfo.prefix + result;
  }
  if (formatInfo.suffix) {
    result = result + formatInfo.suffix;
  }
  if (formatInfo.isPercentage) {
    result = result + '%';
  }

  return result;
}
