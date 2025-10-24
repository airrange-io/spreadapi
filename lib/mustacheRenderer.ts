// Simple Mustache-like template renderer
// Supports: {{variable}}, {{#section}}, {{/section}}, {{^inverted}}, {{/inverted}}

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

// Get HTML input type from parameter type
export function getInputType(paramType: string): string {
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

// Generate optimized HTML input based on input metadata (lightweight version)
export function generateOptimizedInput(input: any): string {
  const name = input.name;
  const value = input.value || '';

  // 1. Dropdown for allowedValues - compact and user-friendly
  if (input.allowedValues && Array.isArray(input.allowedValues) && input.allowedValues.length > 0) {
    const options = input.allowedValues.map((val: string) => {
      const selected = String(val) === String(value) ? ' selected' : '';
      return `<option value="${val}"${selected}>${val}</option>`;
    }).join('');

    return `<select id="${name}" name="${name}" class="optimized-select">${options}</select>`;
  }

  // 2. Boolean as dropdown with visual indicators - universal icons
  if (input.type === 'boolean') {
    const currentValue = (value === true || value === 'true' || value === '1') ? 'true' : 'false';
    const trueSelected = currentValue === 'true' ? ' selected' : '';
    const falseSelected = currentValue === 'false' ? ' selected' : '';

    return `<select id="${name}" name="${name}" class="optimized-select boolean-select">
      <option value="true"${trueSelected}>✓</option>
      <option value="false"${falseSelected}>✗</option>
    </select>`;
  }

  // 3. Regular input (fallback)
  const inputType = getInputType(input.type);
  const min = input.min !== undefined ? ` min="${input.min}"` : '';
  const max = input.max !== undefined ? ` max="${input.max}"` : '';
  const placeholder = input.placeholder ? ` placeholder="${input.placeholder}"` : '';

  return `<input id="${name}" type="${inputType}" name="${name}" value="${value}"${min}${max}${placeholder}>`;
}

// Format output value based on formatString
export function formatValue(output: any): string {
  const value = output.value;

  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Handle arrays (cell ranges) - format as HTML table
  if (Array.isArray(value)) {
    // Helper to format individual cell values
    const formatCell = (cellValue: any): string => {
      if (cellValue === null || cellValue === undefined) return '';

      // Apply formatString if available and value is a number
      if (output.formatString && typeof cellValue === 'number') {
        const formatStr = output.formatString.trim();

        if (formatStr.includes('%')) {
          const decimals = (formatStr.match(/\.0+/)?.[0].length || 1) - 1;
          return new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          }).format(cellValue) + '%';
        }

        const prefixMatch = formatStr.match(/^([^#0,.\s]+)/);
        const suffixMatch = formatStr.match(/([^#0,.\s]+)$/);
        const decimalMatch = formatStr.match(/\.0+/);
        const hasThousands = formatStr.includes(',');
        const decimals = decimalMatch ? decimalMatch[0].length - 1 : 0;
        const prefix = prefixMatch ? prefixMatch[1] : '';
        const suffix = suffixMatch && !prefixMatch ? suffixMatch[1] : '';

        return prefix + new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
          useGrouping: hasThousands
        }).format(cellValue) + suffix;
      }

      if (typeof cellValue === 'number') {
        const formatter = Number.isInteger(cellValue)
          ? new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })
          : new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return formatter.format(cellValue);
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
  if (typeof value === 'number' && output.formatString) {
    const formatStr = output.formatString.trim();

    // Handle percentage
    if (formatStr.includes('%')) {
      const decimals = (formatStr.match(/\.0+/)?.[0].length || 1) - 1;
      return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value) + '%';
    }

    // Handle currency and other formats
    const prefixMatch = formatStr.match(/^([^#0,.\s]+)/);
    const suffixMatch = formatStr.match(/([^#0,.\s]+)$/);
    const decimalMatch = formatStr.match(/\.0+/);
    const hasThousands = formatStr.includes(',');

    const decimals = decimalMatch ? decimalMatch[0].length - 1 : 0;
    const prefix = prefixMatch ? prefixMatch[1] : '';
    const suffix = suffixMatch && !prefixMatch ? suffixMatch[1] : '';

    const formattedNum = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: hasThousands
    }).format(value);

    return `${prefix}${formattedNum}${suffix}`;
  }

  if (typeof value === 'number') {
    const formatter = Number.isInteger(value)
      ? new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })
      : new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatter.format(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}
