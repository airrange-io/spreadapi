// Simple Mustache-like template renderer
// Supports: {{variable}}, {{#section}}, {{/section}}, {{^inverted}}, {{/inverted}}

import {
  getEditorConfig,
  getHtmlInputType,
  parseFormatString,
  parseBooleanValue,
  getNumberFormatter,
  detectLocale,
  type InputParameter
} from './editorTypes';

export function renderTemplate(template: string, data: any): string {
  let result = template;

  // IMPORTANT: Process sections FIRST, then variables
  // Otherwise variables get replaced before the section context is applied

  // Handle {{#section}} ... {{/section}} (truthy/loop)
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
    const value = data[key];

    // If array, loop through items
    if (Array.isArray(value)) {
      return value.map(item => renderTemplate(content, item)).join('');
    }

    // If truthy, render once
    if (value) {
      return renderTemplate(content, data);
    }

    // If falsy, don't render
    return '';
  });

  // Handle {{^inverted}} ... {{/inverted}} (falsy)
  result = result.replace(/\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
    const value = data[key];

    // If falsy, render
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return renderTemplate(content, data);
    }

    // If truthy, don't render
    return '';
  });

  // Replace unescaped variables {{{variable}}} - do this before escaped variables
  // This allows HTML to be rendered without escaping
  result = result.replace(/\{\{\{([\w.]+)\}\}\}/g, (match, key) => {
    // Support nested properties like {{{input.optimizedHtml}}}
    const keys = key.split('.');
    let value: any = data;
    for (const k of keys) {
      value = value?.[k];
    }
    return value !== undefined && value !== null ? String(value) : '';
  });

  // Replace simple variables {{variable}} - do this LAST
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    return value !== undefined && value !== null ? String(value) : '';
  });

  return result;
}

// Re-export getHtmlInputType for backwards compatibility
export { getHtmlInputType as getInputType } from './editorTypes';

// Generate optimized HTML input based on input metadata (lightweight version)
export function generateOptimizedInput(input: InputParameter): string {
  const config = getEditorConfig(input);
  const name = input.name;
  const value = input.value ?? '';

  // 1. Dropdown for allowedValues
  if (config.editorType === 'select' && config.allowedValues) {
    const options = config.allowedValues.map((val: string) => {
      const selected = String(val) === String(value) ? ' selected' : '';
      return `<option value="${val}"${selected}>${val}</option>`;
    }).join('');

    return `<select id="${name}" name="${name}" class="optimized-select">${options}</select>`;
  }

  // 2. Boolean as dropdown with visual indicators
  if (config.editorType === 'boolean') {
    const currentValue = parseBooleanValue(value) ? 'true' : 'false';
    const trueSelected = currentValue === 'true' ? ' selected' : '';
    const falseSelected = currentValue === 'false' ? ' selected' : '';

    return `<select id="${name}" name="${name}" class="optimized-select boolean-select">
      <option value="true"${trueSelected}>✓</option>
      <option value="false"${falseSelected}>✗</option>
    </select>`;
  }

  // 3. Percentage input - with % suffix and value transformation
  if (config.isPercentage) {
    // Transform value: storage (0-1) -> display (0-100)
    const displayValue = value !== '' && value !== undefined && value !== null
      ? (typeof value === 'number' ? value * 100 : parseFloat(String(value)) * 100)
      : '';

    const min = config.displayMin !== undefined ? ` min="${config.displayMin}"` : '';
    const max = config.displayMax !== undefined ? ` max="${config.displayMax}"` : '';
    const placeholder = input.placeholder ? ` placeholder="${input.placeholder}"` : '';
    const displayValueStr = isNaN(Number(displayValue)) ? '' : String(displayValue);

    return `<div class="percentage-input-wrapper"><input id="${name}" type="number" name="${name}" value="${displayValueStr}"${min}${max}${placeholder} class="percentage-input" data-is-percentage="true"><span class="percentage-suffix">%</span></div>`;
  }

  // 4. Regular input (fallback)
  const inputType = getHtmlInputType(input.type);
  const min = config.min !== undefined ? ` min="${config.min}"` : '';
  const max = config.max !== undefined ? ` max="${config.max}"` : '';
  const placeholder = input.placeholder ? ` placeholder="${input.placeholder}"` : '';

  return `<input id="${name}" type="${inputType}" name="${name}" value="${value}"${min}${max}${placeholder}>`;
}

// Format output value based on formatString
// Note: Uses browser locale for formatting
export function formatValue(output: any, locale?: string): string {
  const value = output.value;
  const effectiveLocale = locale || detectLocale();

  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Helper to format a number with formatString
  const formatNumber = (num: number, formatStr?: string): string => {
    if (formatStr) {
      const formatInfo = parseFormatString(formatStr);

      if (formatInfo.isPercentage) {
        const formatter = getNumberFormatter(effectiveLocale, {
          minimumFractionDigits: formatInfo.decimals,
          maximumFractionDigits: formatInfo.decimals
        });
        return formatter.format(num) + '%';
      }

      const formatter = getNumberFormatter(effectiveLocale, {
        minimumFractionDigits: formatInfo.decimals,
        maximumFractionDigits: formatInfo.decimals,
        useGrouping: formatInfo.hasThousands
      });
      return formatInfo.prefix + formatter.format(num) + formatInfo.suffix;
    }

    // Default formatting
    const formatter = Number.isInteger(num)
      ? getNumberFormatter(effectiveLocale, { maximumFractionDigits: 0 })
      : getNumberFormatter(effectiveLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatter.format(num);
  };

  // Handle arrays (cell ranges) - format as HTML table
  if (Array.isArray(value)) {
    const formatCell = (cellValue: any): string => {
      if (cellValue === null || cellValue === undefined) return '';

      if (typeof cellValue === 'number') {
        return formatNumber(cellValue, output.formatString);
      }

      return String(cellValue);
    };

    // Check if 2D array
    if (value.length > 0 && Array.isArray(value[0])) {
      // 2D array - create HTML table
      const rows = value.map((row: any[], rowIndex: number) => {
        const cells = row.map((cell: any) => {
          const textAlign = typeof cell === 'number' ? 'right' : 'left';
          const fontWeight = typeof cell === 'number' ? '500' : '400';
          const bgColor = rowIndex % 2 === 0 ? '#fafafa' : 'white';
          return `<td style="padding: 8px 12px; border: 1px solid #e8e8e8; text-align: ${textAlign}; background-color: ${bgColor}; font-weight: ${fontWeight};">${formatCell(cell)}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('');

      return `<table class="array-output-table" style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 4px;"><tbody>${rows}</tbody></table>`;
    } else {
      // 1D array - create single-row table
      const cells = value.map((cell: any) => {
        const textAlign = typeof cell === 'number' ? 'right' : 'left';
        const fontWeight = typeof cell === 'number' ? '500' : '400';
        return `<td style="padding: 8px 12px; border: 1px solid #e8e8e8; text-align: ${textAlign}; background-color: #fafafa; font-weight: ${fontWeight};">${formatCell(cell)}</td>`;
      }).join('');

      return `<table class="array-output-table" style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 4px;"><tbody><tr>${cells}</tr></tbody></table>`;
    }
  }

  // Handle number formatting
  if (typeof value === 'number') {
    return formatNumber(value, output.formatString);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}
