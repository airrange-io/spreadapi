/**
 * View Themes for Embeddable Snippets and Web Apps
 * Simple, clean themes with optional customization
 */

export interface ViewTheme {
  id: string;
  name: string;
  description: string;
  preview: {
    primaryColor: string;
    containerBg: string;
  };
  styles: {
    // Container
    containerBg: string;
    containerPadding: string;

    // Content area
    contentBg: string;
    contentBorder: string;
    contentBorderRadius: string;
    contentShadow: string;

    // Typography
    fontFamily?: string;
    headingFontFamily?: string;

    // Colors
    primaryColor: string;
    accentColor: string;
    textColor: string;
    labelColor: string;

    // Headings (Service Name, h2, h3)
    headingColor?: string;
    headingFontSize?: string;
    headingFontWeight?: string;

    // Result Labels (e.g., "Total:", "Price:")
    resultLabelColor?: string;
    resultLabelFontSize?: string;
    resultLabelFontWeight?: string;

    // Result Values (the actual output numbers/text)
    resultValueColor?: string;
    resultValueFontSize?: string;
    resultValueFontWeight?: string;

    // Result Dividers (borders between result rows)
    resultDividerColor?: string;
    resultRowPadding?: string;

    // Inputs
    inputBg: string;
    inputBorder: string;
    inputBorderRadius: string;
    inputFocusBorder: string;
    inputFontSize?: string;

    // Input Labels
    inputLabelColor?: string;
    inputLabelFontSize?: string;
    inputLabelFontWeight?: string;

    // Buttons
    buttonBg: string;
    buttonColor: string;
    buttonBorderRadius: string;
    buttonHoverBg: string;
    buttonFontSize?: string;
    buttonFontWeight?: string;

    // Card Header (for Card template)
    cardHeaderBg?: string;
    cardHeaderColor?: string;
    cardHeaderGradientStart?: string;
    cardHeaderGradientEnd?: string;

    // Table Styling
    tableHeaderBg?: string;
    tableHeaderColor?: string;
    tableBorderColor?: string;
    tableRowHoverBg?: string;

    // Section Backgrounds
    inputSectionBg?: string;
    resultsSectionBg?: string;

    // Spacing
    contentPadding?: string;
    sectionSpacing?: string;
    inputGroupSpacing?: string;
    resultItemSpacing?: string;
    buttonPadding?: string;
    headerPadding?: string;
  };
}

export const VIEW_THEMES: Record<string, ViewTheme> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Clean white with minimal styling',
    preview: {
      primaryColor: '#667eea',
      containerBg: '#ffffff'
    },
    styles: {
      containerBg: 'white',
      containerPadding: '20px',
      contentBg: 'white',
      contentBorder: '1px solid #e0e0e0',
      contentBorderRadius: '8px',
      contentShadow: 'none',
      fontFamily: 'Arial, sans-serif',
      headingFontFamily: 'Arial, sans-serif',
      primaryColor: '#667eea',
      accentColor: '#764ba2',
      textColor: '#333333',
      labelColor: '#666666',
      headingColor: '#333333',
      headingFontSize: '20px',
      headingFontWeight: '600',
      resultLabelColor: '#666666',
      resultLabelFontSize: '14px',
      resultLabelFontWeight: '500',
      resultValueColor: '#333333',
      resultValueFontSize: '16px',
      resultValueFontWeight: '600',
      resultDividerColor: '#f0f0f0',
      resultRowPadding: '12px 0',
      inputBg: 'white',
      inputBorder: '1px solid #d9d9d9',
      inputBorderRadius: '4px',
      inputFocusBorder: '1px solid #667eea',
      inputFontSize: '14px',
      inputLabelColor: '#333333',
      inputLabelFontSize: '14px',
      inputLabelFontWeight: '500',
      buttonBg: '#667eea',
      buttonColor: 'white',
      buttonBorderRadius: '4px',
      buttonHoverBg: '#5568d3',
      buttonFontSize: '16px',
      buttonFontWeight: '500',
      cardHeaderBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardHeaderColor: 'white',
      cardHeaderGradientStart: '#667eea',
      cardHeaderGradientEnd: '#764ba2',
      tableHeaderBg: '#f5f5f5',
      tableHeaderColor: '#333333',
      tableBorderColor: '#e0e0e0',
      tableRowHoverBg: '#fafafa',
      inputSectionBg: '#f9f9f9',
      resultsSectionBg: 'transparent',
      contentPadding: '20px',
      sectionSpacing: '20px',
      inputGroupSpacing: '16px',
      resultItemSpacing: '12px',
      buttonPadding: '12px',
      headerPadding: '24px'
    }
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Transparent background, borderless, ultra-clean',
    preview: {
      primaryColor: '#1a1a1a',
      containerBg: 'transparent'
    },
    styles: {
      containerBg: 'transparent',
      containerPadding: '16px',
      contentBg: 'transparent',
      contentBorder: 'none',
      contentBorderRadius: '0',
      contentShadow: 'none',
      primaryColor: '#1a1a1a',
      accentColor: '#4a4a4a',
      textColor: '#1a1a1a',
      labelColor: '#666666',
      inputBg: 'white',
      inputBorder: '1px solid #e0e0e0',
      inputBorderRadius: '2px',
      inputFocusBorder: '1px solid #1a1a1a',
      buttonBg: '#1a1a1a',
      buttonColor: 'white',
      buttonBorderRadius: '2px',
      buttonHoverBg: '#333333'
    }
  },

  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'White card with soft shadow and rounded corners',
    preview: {
      primaryColor: '#4f46e5',
      containerBg: '#f9fafb'
    },
    styles: {
      containerBg: '#f9fafb',
      containerPadding: '24px',
      contentBg: 'white',
      contentBorder: 'none',
      contentBorderRadius: '12px',
      contentShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      primaryColor: '#4f46e5',
      accentColor: '#6366f1',
      textColor: '#111827',
      labelColor: '#6b7280',
      inputBg: 'white',
      inputBorder: '1px solid #e5e7eb',
      inputBorderRadius: '8px',
      inputFocusBorder: '1px solid #4f46e5',
      buttonBg: '#4f46e5',
      buttonColor: 'white',
      buttonBorderRadius: '8px',
      buttonHoverBg: '#4338ca'
    }
  },

  purple: {
    id: 'purple',
    name: 'Purple',
    description: 'SpreadAPI brand purple theme',
    preview: {
      primaryColor: '#502D80',
      containerBg: '#faf9fc'
    },
    styles: {
      containerBg: '#faf9fc',
      containerPadding: '20px',
      contentBg: 'white',
      contentBorder: '1px solid #e9e5f0',
      contentBorderRadius: '8px',
      contentShadow: '0 2px 8px rgba(80, 45, 128, 0.08)',
      primaryColor: '#502D80',
      accentColor: '#6b3fa0',
      textColor: '#2d1950',
      labelColor: '#6b5980',
      inputBg: 'white',
      inputBorder: '1px solid #e9e5f0',
      inputBorderRadius: '6px',
      inputFocusBorder: '1px solid #502D80',
      buttonBg: '#502D80',
      buttonColor: 'white',
      buttonBorderRadius: '6px',
      buttonHoverBg: '#3f2366'
    }
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calm blue and teal tones',
    preview: {
      primaryColor: '#0891b2',
      containerBg: '#f0f9ff'
    },
    styles: {
      containerBg: '#f0f9ff',
      containerPadding: '20px',
      contentBg: 'white',
      contentBorder: '1px solid #bae6fd',
      contentBorderRadius: '10px',
      contentShadow: '0 2px 8px rgba(8, 145, 178, 0.1)',
      primaryColor: '#0891b2',
      accentColor: '#06b6d4',
      textColor: '#164e63',
      labelColor: '#475569',
      inputBg: 'white',
      inputBorder: '1px solid #bae6fd',
      inputBorderRadius: '6px',
      inputFocusBorder: '1px solid #0891b2',
      buttonBg: '#0891b2',
      buttonColor: 'white',
      buttonBorderRadius: '6px',
      buttonHoverBg: '#0e7490'
    }
  },

  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green theme',
    preview: {
      primaryColor: '#059669',
      containerBg: '#f0fdf4'
    },
    styles: {
      containerBg: '#f0fdf4',
      containerPadding: '20px',
      contentBg: 'white',
      contentBorder: '1px solid #bbf7d0',
      contentBorderRadius: '8px',
      contentShadow: '0 2px 8px rgba(5, 150, 105, 0.1)',
      primaryColor: '#059669',
      accentColor: '#10b981',
      textColor: '#14532d',
      labelColor: '#475569',
      inputBg: 'white',
      inputBorder: '1px solid #bbf7d0',
      inputBorderRadius: '6px',
      inputFocusBorder: '1px solid #059669',
      buttonBg: '#059669',
      buttonColor: 'white',
      buttonBorderRadius: '6px',
      buttonHoverBg: '#047857'
    }
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and amber tones',
    preview: {
      primaryColor: '#ea580c',
      containerBg: '#fff7ed'
    },
    styles: {
      containerBg: '#fff7ed',
      containerPadding: '20px',
      contentBg: 'white',
      contentBorder: '1px solid #fed7aa',
      contentBorderRadius: '8px',
      contentShadow: '0 2px 8px rgba(234, 88, 12, 0.1)',
      primaryColor: '#ea580c',
      accentColor: '#f59e0b',
      textColor: '#7c2d12',
      labelColor: '#78716c',
      inputBg: 'white',
      inputBorder: '1px solid #fed7aa',
      inputBorderRadius: '6px',
      inputFocusBorder: '1px solid #ea580c',
      buttonBg: '#ea580c',
      buttonColor: 'white',
      buttonBorderRadius: '6px',
      buttonHoverBg: '#c2410c'
    }
  },

  slate: {
    id: 'slate',
    name: 'Slate',
    description: 'Professional dark grey theme',
    preview: {
      primaryColor: '#475569',
      containerBg: '#f8fafc'
    },
    styles: {
      containerBg: '#f8fafc',
      containerPadding: '20px',
      contentBg: 'white',
      contentBorder: '1px solid #e2e8f0',
      contentBorderRadius: '6px',
      contentShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      primaryColor: '#475569',
      accentColor: '#64748b',
      textColor: '#1e293b',
      labelColor: '#64748b',
      inputBg: 'white',
      inputBorder: '1px solid #e2e8f0',
      inputBorderRadius: '4px',
      inputFocusBorder: '1px solid #475569',
      buttonBg: '#475569',
      buttonColor: 'white',
      buttonBorderRadius: '4px',
      buttonHoverBg: '#334155'
    }
  },

  rose: {
    id: 'rose',
    name: 'Rose',
    description: 'Elegant pink and rose tones',
    preview: {
      primaryColor: '#e11d48',
      containerBg: '#fff1f2'
    },
    styles: {
      containerBg: '#fff1f2',
      containerPadding: '20px',
      contentBg: 'white',
      contentBorder: '1px solid #fecdd3',
      contentBorderRadius: '10px',
      contentShadow: '0 2px 8px rgba(225, 29, 72, 0.1)',
      primaryColor: '#e11d48',
      accentColor: '#f43f5e',
      textColor: '#881337',
      labelColor: '#78716c',
      inputBg: 'white',
      inputBorder: '1px solid #fecdd3',
      inputBorderRadius: '6px',
      inputFocusBorder: '1px solid #e11d48',
      buttonBg: '#e11d48',
      buttonColor: 'white',
      buttonBorderRadius: '6px',
      buttonHoverBg: '#be123c'
    }
  },

  sky: {
    id: 'sky',
    name: 'Sky',
    description: 'Light and airy blue theme',
    preview: {
      primaryColor: '#0284c7',
      containerBg: '#f0f9ff'
    },
    styles: {
      containerBg: '#f0f9ff',
      containerPadding: '20px',
      contentBg: 'white',
      contentBorder: '1px solid #bae6fd',
      contentBorderRadius: '12px',
      contentShadow: '0 2px 8px rgba(2, 132, 199, 0.08)',
      primaryColor: '#0284c7',
      accentColor: '#0ea5e9',
      textColor: '#0c4a6e',
      labelColor: '#64748b',
      inputBg: 'white',
      inputBorder: '1px solid #bae6fd',
      inputBorderRadius: '6px',
      inputFocusBorder: '1px solid #0284c7',
      buttonBg: '#0284c7',
      buttonColor: 'white',
      buttonBorderRadius: '6px',
      buttonHoverBg: '#0369a1'
    }
  }
};

/**
 * Fill in missing theme properties with sensible defaults
 */
function fillThemeDefaults(partial: Partial<ViewTheme['styles']>): ViewTheme['styles'] {
  const defaults: ViewTheme['styles'] = {
    // Use existing properties or fallback to defaults
    containerBg: partial.containerBg || 'white',
    containerPadding: partial.containerPadding || '20px',
    contentBg: partial.contentBg || 'white',
    contentBorder: partial.contentBorder || '1px solid #e0e0e0',
    contentBorderRadius: partial.contentBorderRadius || '8px',
    contentShadow: partial.contentShadow || 'none',
    contentPadding: partial.contentPadding || '20px',

    fontFamily: partial.fontFamily || 'Arial, sans-serif',
    headingFontFamily: partial.headingFontFamily || partial.fontFamily || 'Arial, sans-serif',

    primaryColor: partial.primaryColor || '#667eea',
    accentColor: partial.accentColor || partial.primaryColor || '#764ba2',
    textColor: partial.textColor || '#333333',
    labelColor: partial.labelColor || '#666666',

    headingColor: partial.headingColor || partial.textColor || '#333333',
    headingFontSize: partial.headingFontSize || '20px',
    headingFontWeight: partial.headingFontWeight || '600',

    resultLabelColor: partial.resultLabelColor || partial.labelColor || '#666666',
    resultLabelFontSize: partial.resultLabelFontSize || '14px',
    resultLabelFontWeight: partial.resultLabelFontWeight || '500',

    resultValueColor: partial.resultValueColor || partial.textColor || '#333333',
    resultValueFontSize: partial.resultValueFontSize || '16px',
    resultValueFontWeight: partial.resultValueFontWeight || '600',

    resultDividerColor: partial.resultDividerColor || '#f0f0f0',
    resultRowPadding: partial.resultRowPadding || '12px 0',

    inputBg: partial.inputBg || 'white',
    inputBorder: partial.inputBorder || '1px solid #d9d9d9',
    inputBorderRadius: partial.inputBorderRadius || '4px',
    inputFocusBorder: partial.inputFocusBorder || `1px solid ${partial.primaryColor || '#667eea'}`,
    inputFontSize: partial.inputFontSize || '14px',

    inputLabelColor: partial.inputLabelColor || partial.textColor || '#333333',
    inputLabelFontSize: partial.inputLabelFontSize || '14px',
    inputLabelFontWeight: partial.inputLabelFontWeight || '500',

    buttonBg: partial.buttonBg || partial.primaryColor || '#667eea',
    buttonColor: partial.buttonColor || 'white',
    buttonBorderRadius: partial.buttonBorderRadius || '4px',
    buttonHoverBg: partial.buttonHoverBg || partial.accentColor || '#5568d3',
    buttonFontSize: partial.buttonFontSize || '16px',
    buttonFontWeight: partial.buttonFontWeight || '500',
    buttonPadding: partial.buttonPadding || '12px',

    cardHeaderBg: partial.cardHeaderBg || `linear-gradient(135deg, ${partial.primaryColor || '#667eea'} 0%, ${partial.accentColor || '#764ba2'} 100%)`,
    cardHeaderColor: partial.cardHeaderColor || 'white',
    cardHeaderGradientStart: partial.cardHeaderGradientStart || partial.primaryColor || '#667eea',
    cardHeaderGradientEnd: partial.cardHeaderGradientEnd || partial.accentColor || '#764ba2',

    tableHeaderBg: partial.tableHeaderBg || '#f5f5f5',
    tableHeaderColor: partial.tableHeaderColor || partial.textColor || '#333333',
    tableBorderColor: partial.tableBorderColor || partial.contentBorder || '#e0e0e0',
    tableRowHoverBg: partial.tableRowHoverBg || '#fafafa',

    inputSectionBg: partial.inputSectionBg || '#f9f9f9',
    resultsSectionBg: partial.resultsSectionBg || 'transparent',

    sectionSpacing: partial.sectionSpacing || '20px',
    inputGroupSpacing: partial.inputGroupSpacing || '16px',
    resultItemSpacing: partial.resultItemSpacing || '12px',
    headerPadding: partial.headerPadding || '24px',
  };

  return { ...defaults, ...partial };
}

/**
 * Apply theme overrides to a base theme
 */
export function applyThemeOverrides(
  baseTheme: ViewTheme,
  overrides: Partial<ViewTheme['styles']>
): ViewTheme['styles'] {
  // Fill in any missing properties in the base theme first
  const completeBaseTheme = fillThemeDefaults(baseTheme.styles);

  return {
    ...completeBaseTheme,
    ...overrides
  };
}

/**
 * Parse theme from query parameters
 */
export function parseThemeFromQuery(searchParams: URLSearchParams): {
  theme: ViewTheme;
  overrides: Partial<ViewTheme['styles']>;
} {
  const themeId = searchParams.get('theme') || 'default';
  const baseTheme = VIEW_THEMES[themeId] || VIEW_THEMES.default;

  // Parse individual overrides
  const overrides: Partial<ViewTheme['styles']> = {};

  const overrideKeys: Array<keyof ViewTheme['styles']> = [
    // Container
    'containerBg', 'containerPadding',
    // Content
    'contentBg', 'contentBorder', 'contentBorderRadius', 'contentShadow', 'contentPadding',
    // Typography
    'fontFamily', 'headingFontFamily',
    // Colors
    'primaryColor', 'accentColor', 'textColor', 'labelColor',
    // Headings
    'headingColor', 'headingFontSize', 'headingFontWeight',
    // Result Labels
    'resultLabelColor', 'resultLabelFontSize', 'resultLabelFontWeight',
    // Result Values
    'resultValueColor', 'resultValueFontSize', 'resultValueFontWeight',
    // Result Dividers
    'resultDividerColor', 'resultRowPadding',
    // Inputs
    'inputBg', 'inputBorder', 'inputBorderRadius', 'inputFocusBorder', 'inputFontSize',
    // Input Labels
    'inputLabelColor', 'inputLabelFontSize', 'inputLabelFontWeight',
    // Buttons
    'buttonBg', 'buttonColor', 'buttonBorderRadius', 'buttonHoverBg', 'buttonFontSize', 'buttonFontWeight', 'buttonPadding',
    // Card Header
    'cardHeaderBg', 'cardHeaderColor', 'cardHeaderGradientStart', 'cardHeaderGradientEnd',
    // Table
    'tableHeaderBg', 'tableHeaderColor', 'tableBorderColor', 'tableRowHoverBg',
    // Sections
    'inputSectionBg', 'resultsSectionBg',
    // Spacing
    'sectionSpacing', 'inputGroupSpacing', 'resultItemSpacing', 'headerPadding'
  ];

  for (const key of overrideKeys) {
    const value = searchParams.get(key);
    if (value) {
      overrides[key] = decodeURIComponent(value);
    }
  }

  return { theme: baseTheme, overrides };
}

/**
 * All supported theme parameter properties for URL customization
 *
 * @example
 * ?theme=purple&primaryColor=%23FF0000&headingFontSize=24px&borderRadius=12px
 */
export const SUPPORTED_THEME_PARAMETERS = {
  /** Container styling */
  container: [
    'containerBg',           // Background color of the page container
    'containerPadding',      // Padding around the content
  ],

  /** Content area styling */
  content: [
    'contentBg',             // Background color of the content card
    'contentBorder',         // Border around the content card
    'contentBorderRadius',   // Border radius of the content card
    'contentShadow',         // Box shadow of the content card
    'contentPadding',        // Padding inside the content card
  ],

  /** Typography */
  typography: [
    'fontFamily',            // Base font family
    'headingFontFamily',     // Font family for headings
  ],

  /** Base colors */
  colors: [
    'primaryColor',          // Main brand/accent color
    'accentColor',           // Secondary accent color
    'textColor',             // Main text color
    'labelColor',            // Secondary text/label color
  ],

  /** Heading styling (Service name, h2, h3) */
  headings: [
    'headingColor',          // Color of headings
    'headingFontSize',       // Font size of headings
    'headingFontWeight',     // Font weight of headings (e.g., '600', 'bold')
  ],

  /** Result label styling (e.g., "Total:", "Price:") */
  resultLabels: [
    'resultLabelColor',      // Color of result labels
    'resultLabelFontSize',   // Font size of result labels
    'resultLabelFontWeight', // Font weight of result labels
  ],

  /** Result value styling (the actual output numbers/text) */
  resultValues: [
    'resultValueColor',      // Color of result values
    'resultValueFontSize',   // Font size of result values
    'resultValueFontWeight', // Font weight of result values (e.g., '600', 'bold')
  ],

  /** Result dividers (borders between result rows) */
  resultDividers: [
    'resultDividerColor',    // Border color between result items
    'resultRowPadding',      // Padding for each result row
  ],

  /** Input field styling */
  inputs: [
    'inputBg',               // Background color of input fields
    'inputBorder',           // Border of input fields
    'inputBorderRadius',     // Border radius of input fields
    'inputFocusBorder',      // Border color when input is focused
    'inputFontSize',         // Font size of input text
  ],

  /** Input label styling */
  inputLabels: [
    'inputLabelColor',       // Color of input labels
    'inputLabelFontSize',    // Font size of input labels
    'inputLabelFontWeight',  // Font weight of input labels
  ],

  /** Button styling */
  buttons: [
    'buttonBg',              // Background color of buttons
    'buttonColor',           // Text color of buttons
    'buttonBorderRadius',    // Border radius of buttons
    'buttonHoverBg',         // Background color on hover
    'buttonFontSize',        // Font size of button text
    'buttonFontWeight',      // Font weight of button text
    'buttonPadding',         // Padding inside buttons
  ],

  /** Card header styling (Card template only) */
  cardHeader: [
    'cardHeaderBg',          // Background (can be gradient or solid)
    'cardHeaderColor',       // Text color in header
    'cardHeaderGradientStart', // Gradient start color
    'cardHeaderGradientEnd',   // Gradient end color
  ],

  /** Table styling (Table template only) */
  table: [
    'tableHeaderBg',         // Background color of table header
    'tableHeaderColor',      // Text color of table header
    'tableBorderColor',      // Border color of table cells
    'tableRowHoverBg',       // Background color on row hover
  ],

  /** Section backgrounds */
  sections: [
    'inputSectionBg',        // Background of input section
    'resultsSectionBg',      // Background of results section
  ],

  /** Spacing */
  spacing: [
    'sectionSpacing',        // Space between major sections
    'inputGroupSpacing',     // Space between input fields
    'resultItemSpacing',     // Space between result items
    'headerPadding',         // Padding in card headers
  ],
} as const;

/**
 * Get all supported parameter keys as a flat array
 */
export function getAllSupportedParameters(): string[] {
  return Object.values(SUPPORTED_THEME_PARAMETERS).flat();
}

/**
 * Sanitize CSS value to prevent injection attacks
 * Allows: colors (hex, rgb, rgba, hsl, hsla, named), sizes (px, em, rem, %, etc.),
 * borders, shadows, font names, and common CSS values
 */
function sanitizeCSSValue(value: any, propertyType: 'color' | 'size' | 'shadow' | 'border' | 'font' | 'generic' = 'generic'): string {
  if (value === undefined || value === null) return 'inherit';

  const strValue = String(value).trim();

  // Allow common safe values
  const safeValues = ['none', 'inherit', 'initial', 'unset', 'auto', 'transparent',
                      'normal', 'bold', 'italic', 'left', 'right', 'center'];
  if (safeValues.includes(strValue.toLowerCase())) {
    return strValue;
  }

  // Property-specific validation
  switch (propertyType) {
    case 'color':
      // Hex colors: #RGB, #RRGGBB, #RRGGBBAA
      if (/^#[0-9A-Fa-f]{3,8}$/.test(strValue)) return strValue;
      // RGB/RGBA: rgb(r,g,b) or rgba(r,g,b,a)
      if (/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)$/.test(strValue)) return strValue;
      // HSL/HSLA: hsl(h,s%,l%) or hsla(h,s%,l%,a)
      if (/^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*[\d.]+\s*)?\)$/.test(strValue)) return strValue;
      // Named colors
      if (/^[a-z]+$/.test(strValue.toLowerCase())) return strValue;
      break;

    case 'size':
      // Sizes: 12px, 1.5em, 100%, 2rem, etc.
      if (/^[\d.]+\s*(px|em|rem|%|vh|vw|vmin|vmax|ch|ex)$/.test(strValue)) return strValue;
      break;

    case 'shadow':
      // Box shadow: 0 2px 8px rgba(0,0,0,0.1), multiple shadows, inset, etc.
      if (/^(inset\s+)?[\d.\s]+(px|em|rem)\s+[\d.\s]+(px|em|rem)\s+[\d.\s]+(px|em|rem)(\s+[\d.\s]+(px|em|rem))?\s+(#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z]+)(\s*,\s*(inset\s+)?[\d.\s]+(px|em|rem)\s+[\d.\s]+(px|em|rem)\s+[\d.\s]+(px|em|rem)(\s+[\d.\s]+(px|em|rem))?\s+(#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z]+))*$/i.test(strValue)) {
        return strValue;
      }
      break;

    case 'border':
      // Border: 1px solid #ccc, 2px dashed red, none, etc.
      if (/^([\d.]+\s*(px|em|rem)\s+)?(solid|dashed|dotted|double|groove|ridge|inset|outset)(\s+(#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z]+))?$/i.test(strValue)) {
        return strValue;
      }
      break;

    case 'font':
      // Font family: Arial, "Times New Roman", sans-serif, etc.
      if (/^[a-zA-Z0-9\s"',\-]+$/.test(strValue)) return strValue;
      break;

    case 'generic':
      // Generic safe CSS value (alphanumeric, spaces, common punctuation, no script tags)
      if (/^[a-zA-Z0-9\s\-_.,()%#]+$/.test(strValue) && !/<|>|script|javascript:/i.test(strValue)) {
        return strValue;
      }
      break;
  }

  // If validation fails, log warning and return safe default
  console.warn(`Invalid CSS value detected and sanitized: ${strValue}`);
  return 'inherit';
}

/**
 * Generate CSS variables from theme with sanitization
 */
export function generateThemeCSS(styles: ViewTheme['styles']): string {
  return `
    :root {
      /* Container */
      --container-bg: ${sanitizeCSSValue(styles.containerBg, 'color')};
      --container-padding: ${sanitizeCSSValue(styles.containerPadding, 'size')};

      /* Content area */
      --content-bg: ${sanitizeCSSValue(styles.contentBg, 'color')};
      --content-border: ${sanitizeCSSValue(styles.contentBorder, 'border')};
      --content-border-radius: ${sanitizeCSSValue(styles.contentBorderRadius, 'size')};
      --content-shadow: ${sanitizeCSSValue(styles.contentShadow, 'shadow')};
      --content-padding: ${sanitizeCSSValue(styles.contentPadding, 'size')};

      /* Typography */
      --font-family: ${sanitizeCSSValue(styles.fontFamily, 'font')};
      --heading-font-family: ${sanitizeCSSValue(styles.headingFontFamily, 'font')};

      /* Colors */
      --primary-color: ${sanitizeCSSValue(styles.primaryColor, 'color')};
      --accent-color: ${sanitizeCSSValue(styles.accentColor, 'color')};
      --text-color: ${sanitizeCSSValue(styles.textColor, 'color')};
      --label-color: ${sanitizeCSSValue(styles.labelColor, 'color')};

      /* Headings */
      --heading-color: ${sanitizeCSSValue(styles.headingColor, 'color')};
      --heading-font-size: ${sanitizeCSSValue(styles.headingFontSize, 'size')};
      --heading-font-weight: ${sanitizeCSSValue(styles.headingFontWeight, 'generic')};

      /* Result Labels */
      --result-label-color: ${sanitizeCSSValue(styles.resultLabelColor, 'color')};
      --result-label-font-size: ${sanitizeCSSValue(styles.resultLabelFontSize, 'size')};
      --result-label-font-weight: ${sanitizeCSSValue(styles.resultLabelFontWeight, 'generic')};

      /* Result Values */
      --result-value-color: ${sanitizeCSSValue(styles.resultValueColor, 'color')};
      --result-value-font-size: ${sanitizeCSSValue(styles.resultValueFontSize, 'size')};
      --result-value-font-weight: ${sanitizeCSSValue(styles.resultValueFontWeight, 'generic')};

      /* Result Dividers */
      --result-divider-color: ${sanitizeCSSValue(styles.resultDividerColor, 'color')};
      --result-row-padding: ${sanitizeCSSValue(styles.resultRowPadding, 'generic')};

      /* Inputs */
      --input-bg: ${sanitizeCSSValue(styles.inputBg, 'color')};
      --input-border: ${sanitizeCSSValue(styles.inputBorder, 'border')};
      --input-border-radius: ${sanitizeCSSValue(styles.inputBorderRadius, 'size')};
      --input-focus-border: ${sanitizeCSSValue(styles.inputFocusBorder, 'border')};
      --input-font-size: ${sanitizeCSSValue(styles.inputFontSize, 'size')};

      /* Input Labels */
      --input-label-color: ${sanitizeCSSValue(styles.inputLabelColor, 'color')};
      --input-label-font-size: ${sanitizeCSSValue(styles.inputLabelFontSize, 'size')};
      --input-label-font-weight: ${sanitizeCSSValue(styles.inputLabelFontWeight, 'generic')};

      /* Buttons */
      --button-bg: ${sanitizeCSSValue(styles.buttonBg, 'color')};
      --button-color: ${sanitizeCSSValue(styles.buttonColor, 'color')};
      --button-border-radius: ${sanitizeCSSValue(styles.buttonBorderRadius, 'size')};
      --button-hover-bg: ${sanitizeCSSValue(styles.buttonHoverBg, 'color')};
      --button-font-size: ${sanitizeCSSValue(styles.buttonFontSize, 'size')};
      --button-font-weight: ${sanitizeCSSValue(styles.buttonFontWeight, 'generic')};
      --button-padding: ${sanitizeCSSValue(styles.buttonPadding, 'size')};

      /* Card Header */
      --card-header-bg: ${sanitizeCSSValue(styles.cardHeaderBg, 'generic')};
      --card-header-color: ${sanitizeCSSValue(styles.cardHeaderColor, 'color')};
      --card-header-gradient-start: ${sanitizeCSSValue(styles.cardHeaderGradientStart, 'color')};
      --card-header-gradient-end: ${sanitizeCSSValue(styles.cardHeaderGradientEnd, 'color')};

      /* Table Styling */
      --table-header-bg: ${sanitizeCSSValue(styles.tableHeaderBg, 'color')};
      --table-header-color: ${sanitizeCSSValue(styles.tableHeaderColor, 'color')};
      --table-border-color: ${sanitizeCSSValue(styles.tableBorderColor, 'color')};
      --table-row-hover-bg: ${sanitizeCSSValue(styles.tableRowHoverBg, 'color')};

      /* Section Backgrounds */
      --input-section-bg: ${sanitizeCSSValue(styles.inputSectionBg, 'color')};
      --results-section-bg: ${sanitizeCSSValue(styles.resultsSectionBg, 'color')};

      /* Spacing */
      --section-spacing: ${sanitizeCSSValue(styles.sectionSpacing, 'size')};
      --input-group-spacing: ${sanitizeCSSValue(styles.inputGroupSpacing, 'size')};
      --result-item-spacing: ${sanitizeCSSValue(styles.resultItemSpacing, 'size')};
      --header-padding: ${sanitizeCSSValue(styles.headerPadding, 'size')};
    }
  `.trim();
}

/**
 * Default CSS for Web Apps that uses CSS variables
 * This provides the base styling for all spreadapi- classes
 */
export const DEFAULT_WEBAPP_CSS = `
/* ============================================
   SpreadAPI Web App Default Styles
   Using CSS Variables for easy customization
   ============================================ */

/* Page & Container */
.spreadapi-page {
  min-height: 100vh;
  background-color: var(--spreadapi-container-bg);
  padding: var(--spreadapi-container-padding);
  font-family: var(--spreadapi-font-family);
}

.spreadapi-container {
  max-width: 700px;
  margin: 0 auto;
}

.spreadapi-card {
  margin-top: 20px;
  box-shadow: var(--spreadapi-content-shadow);
  background: var(--spreadapi-content-bg);
  border: var(--spreadapi-content-border);
  border-radius: var(--spreadapi-content-border-radius);
  padding: var(--spreadapi-content-padding);
}

/* Typography */
.spreadapi-title {
  margin-bottom: 24px;
  color: var(--spreadapi-heading-color);
  font-size: var(--spreadapi-heading-font-size);
  font-weight: var(--spreadapi-heading-font-weight);
  font-family: var(--spreadapi-heading-font-family);
}

/* Forms */
.spreadapi-form {
  width: 100%;
}

.spreadapi-inputs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0 16px;
}

.spreadapi-input-group {
  margin-bottom: 12px;
}

/* Labels */
.spreadapi-label {
  font-weight: var(--spreadapi-input-label-font-weight);
  margin-bottom: 2px;
  font-size: var(--spreadapi-input-label-font-size);
  color: var(--spreadapi-input-label-color);
}

.spreadapi-label-optional {
  font-size: 11px;
  margin-left: 6px;
  color: var(--spreadapi-label-color);
}

/* Buttons */
.spreadapi-button {
  background-color: var(--spreadapi-button-bg);
  border-color: var(--spreadapi-button-bg);
  color: var(--spreadapi-button-color);
  font-size: var(--spreadapi-button-font-size);
  font-weight: var(--spreadapi-button-font-weight);
  border-radius: var(--spreadapi-button-border-radius);
  padding: var(--spreadapi-button-padding);
}

.spreadapi-button:hover {
  background-color: var(--spreadapi-button-hover-bg);
  border-color: var(--spreadapi-button-hover-bg);
}

.spreadapi-button-submit {
  width: 100%;
  height: 48px;
  margin-top: 24px;
}

/* Results */
.spreadapi-results {
  margin-top: 32px;
}

.spreadapi-results-title {
  margin-bottom: 16px;
  color: var(--spreadapi-heading-color);
  font-size: 18px;
  font-weight: var(--spreadapi-heading-font-weight);
}

.spreadapi-results-container {
  background-color: var(--spreadapi-input-section-bg);
  border-radius: var(--spreadapi-content-border-radius);
  overflow: hidden;
  padding: 0 16px;
}

.spreadapi-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spreadapi-result-row-padding);
}

.spreadapi-result-label {
  font-size: var(--spreadapi-result-label-font-size);
  color: var(--spreadapi-result-label-color);
  font-weight: var(--spreadapi-result-label-font-weight);
}

.spreadapi-result-value {
  font-size: var(--spreadapi-result-value-font-size);
  color: var(--spreadapi-result-value-color);
  font-weight: var(--spreadapi-result-value-font-weight);
}

/* Switch containers */
.spreadapi-switch-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spreadapi-switch-label {
  font-weight: 400;
  font-size: 13px;
  color: #666;
}

/* Slider containers */
.spreadapi-slider-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* ============================================
   Customization Examples (commented out)
   Users can uncomment and modify these
   ============================================

/* Example: Change all input backgrounds
.spreadapi-input,
.spreadapi-select {
  background-color: #f9f9f9 !important;
}
*/

/* Example: Target specific field by name
.spreadapi-input-discount {
  border: 2px solid #4CAF50 !important;
}
*/

/* Example: Customize result values
.spreadapi-result-value {
  font-size: 20px !important;
  color: #2196F3 !important;
}
*/

/* Example: Target specific result by parameter name
.spreadapi-result-totalPrice .spreadapi-result-value {
  font-size: 24px !important;
  font-weight: bold !important;
  color: #4CAF50 !important;
}
*/

/* ============================================ */
`.trim();

/**
 * Generate CSS variables for Web Apps with spreadapi- prefix
 * This ensures CSS variables don't conflict with user's existing styles
 */
export function generateWebAppThemeCSS(styles: ViewTheme['styles']): string {
  return `
    :root {
      /* Container */
      --spreadapi-container-bg: ${sanitizeCSSValue(styles.containerBg, 'color')};
      --spreadapi-container-padding: ${sanitizeCSSValue(styles.containerPadding, 'size')};

      /* Content area */
      --spreadapi-content-bg: ${sanitizeCSSValue(styles.contentBg, 'color')};
      --spreadapi-content-border: ${sanitizeCSSValue(styles.contentBorder, 'border')};
      --spreadapi-content-border-radius: ${sanitizeCSSValue(styles.contentBorderRadius, 'size')};
      --spreadapi-content-shadow: ${sanitizeCSSValue(styles.contentShadow, 'shadow')};
      --spreadapi-content-padding: ${sanitizeCSSValue(styles.contentPadding, 'size')};

      /* Typography */
      --spreadapi-font-family: ${sanitizeCSSValue(styles.fontFamily, 'font')};
      --spreadapi-heading-font-family: ${sanitizeCSSValue(styles.headingFontFamily, 'font')};

      /* Colors */
      --spreadapi-primary-color: ${sanitizeCSSValue(styles.primaryColor, 'color')};
      --spreadapi-accent-color: ${sanitizeCSSValue(styles.accentColor, 'color')};
      --spreadapi-text-color: ${sanitizeCSSValue(styles.textColor, 'color')};
      --spreadapi-label-color: ${sanitizeCSSValue(styles.labelColor, 'color')};

      /* Headings */
      --spreadapi-heading-color: ${sanitizeCSSValue(styles.headingColor, 'color')};
      --spreadapi-heading-font-size: ${sanitizeCSSValue(styles.headingFontSize, 'size')};
      --spreadapi-heading-font-weight: ${sanitizeCSSValue(styles.headingFontWeight, 'generic')};

      /* Result Labels */
      --spreadapi-result-label-color: ${sanitizeCSSValue(styles.resultLabelColor, 'color')};
      --spreadapi-result-label-font-size: ${sanitizeCSSValue(styles.resultLabelFontSize, 'size')};
      --spreadapi-result-label-font-weight: ${sanitizeCSSValue(styles.resultLabelFontWeight, 'generic')};

      /* Result Values */
      --spreadapi-result-value-color: ${sanitizeCSSValue(styles.resultValueColor, 'color')};
      --spreadapi-result-value-font-size: ${sanitizeCSSValue(styles.resultValueFontSize, 'size')};
      --spreadapi-result-value-font-weight: ${sanitizeCSSValue(styles.resultValueFontWeight, 'generic')};

      /* Result Dividers */
      --spreadapi-result-divider-color: ${sanitizeCSSValue(styles.resultDividerColor, 'color')};
      --spreadapi-result-row-padding: ${sanitizeCSSValue(styles.resultRowPadding, 'generic')};

      /* Inputs */
      --spreadapi-input-bg: ${sanitizeCSSValue(styles.inputBg, 'color')};
      --spreadapi-input-border: ${sanitizeCSSValue(styles.inputBorder, 'border')};
      --spreadapi-input-border-radius: ${sanitizeCSSValue(styles.inputBorderRadius, 'size')};
      --spreadapi-input-focus-border: ${sanitizeCSSValue(styles.inputFocusBorder, 'border')};
      --spreadapi-input-font-size: ${sanitizeCSSValue(styles.inputFontSize, 'size')};

      /* Input Labels */
      --spreadapi-input-label-color: ${sanitizeCSSValue(styles.inputLabelColor, 'color')};
      --spreadapi-input-label-font-size: ${sanitizeCSSValue(styles.inputLabelFontSize, 'size')};
      --spreadapi-input-label-font-weight: ${sanitizeCSSValue(styles.inputLabelFontWeight, 'generic')};

      /* Buttons */
      --spreadapi-button-bg: ${sanitizeCSSValue(styles.buttonBg, 'color')};
      --spreadapi-button-color: ${sanitizeCSSValue(styles.buttonColor, 'color')};
      --spreadapi-button-border-radius: ${sanitizeCSSValue(styles.buttonBorderRadius, 'size')};
      --spreadapi-button-hover-bg: ${sanitizeCSSValue(styles.buttonHoverBg, 'color')};
      --spreadapi-button-font-size: ${sanitizeCSSValue(styles.buttonFontSize, 'size')};
      --spreadapi-button-font-weight: ${sanitizeCSSValue(styles.buttonFontWeight, 'generic')};
      --spreadapi-button-padding: ${sanitizeCSSValue(styles.buttonPadding, 'size')};

      /* Card Header */
      --spreadapi-card-header-bg: ${sanitizeCSSValue(styles.cardHeaderBg, 'generic')};
      --spreadapi-card-header-color: ${sanitizeCSSValue(styles.cardHeaderColor, 'color')};
      --spreadapi-card-header-gradient-start: ${sanitizeCSSValue(styles.cardHeaderGradientStart, 'color')};
      --spreadapi-card-header-gradient-end: ${sanitizeCSSValue(styles.cardHeaderGradientEnd, 'color')};

      /* Table Styling */
      --spreadapi-table-header-bg: ${sanitizeCSSValue(styles.tableHeaderBg, 'color')};
      --spreadapi-table-header-color: ${sanitizeCSSValue(styles.tableHeaderColor, 'color')};
      --spreadapi-table-border-color: ${sanitizeCSSValue(styles.tableBorderColor, 'color')};
      --spreadapi-table-row-hover-bg: ${sanitizeCSSValue(styles.tableRowHoverBg, 'color')};

      /* Section Backgrounds */
      --spreadapi-input-section-bg: ${sanitizeCSSValue(styles.inputSectionBg, 'color')};
      --spreadapi-results-section-bg: ${sanitizeCSSValue(styles.resultsSectionBg, 'color')};

      /* Spacing */
      --spreadapi-section-spacing: ${sanitizeCSSValue(styles.sectionSpacing, 'size')};
      --spreadapi-input-group-spacing: ${sanitizeCSSValue(styles.inputGroupSpacing, 'size')};
      --spreadapi-result-item-spacing: ${sanitizeCSSValue(styles.resultItemSpacing, 'size')};
      --spreadapi-header-padding: ${sanitizeCSSValue(styles.headerPadding, 'size')};
    }
  `.trim();
}
