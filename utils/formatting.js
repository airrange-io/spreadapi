/**
 * Format a value using Excel-style format string
 * Supports common formats like €#,##0.00, $#,##0.00, 0.00%, etc.
 *
 * @param {number} value - The numeric value to format
 * @param {string} formatString - Excel-style format string (e.g., "€#,##0.00")
 * @returns {string|number} Formatted string or original value if formatting fails
 *
 * @example
 * formatValueWithExcelFormat(265.53, "€#,##0.00") // "€265.53"
 * formatValueWithExcelFormat(0.05, "0.00%") // "5.00%"
 * formatValueWithExcelFormat(31998.32, "$#,##0.00") // "$31,998.32"
 */
export function formatValueWithExcelFormat(value, formatString) {
  if (value === null || value === undefined || formatString === null || formatString === undefined) {
    return value;
  }

  try {
    // Handle percentage format (0.00%, 0%, etc.)
    if (formatString.includes('%')) {
      const percentValue = (value * 100).toFixed(2);
      return `${percentValue}%`;
    }

    // Extract currency symbol (€, $, etc.)
    const currencyMatch = formatString.match(/^([€$£¥₹₽])/);
    const currencySymbol = currencyMatch ? currencyMatch[1] : '';

    // Extract decimal places from format string
    const decimalMatch = formatString.match(/\.([0#]+)/);
    const decimalPlaces = decimalMatch ? decimalMatch[1].length : 0;

    // Format number with thousands separators and decimal places
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(value);

    // Combine currency symbol with formatted number
    if (currencySymbol) {
      return `${currencySymbol}${formattedNumber}`;
    }

    return formattedNumber;
  } catch (error) {
    // If formatting fails, return raw value
    console.warn(`Failed to format value ${value} with format ${formatString}:`, error);
    return value;
  }
}
