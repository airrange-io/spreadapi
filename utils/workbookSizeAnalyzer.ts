/**
 * Utility to analyze and compare workbook sizes between formats
 */

interface SizeComparison {
  originalSize: number;
  sjsSize: number;
  ratio: number;
  originalFormat: string;
  originalSizeMB: string;
  sjsSizeMB: string;
  percentChange: string;
}

export async function compareWorkbookSizes(
  originalFile: File,
  sjsBlob: Blob
): Promise<SizeComparison> {
  const originalSize = originalFile.size;
  const sjsSize = sjsBlob.size;
  const ratio = sjsSize / originalSize;
  
  const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);
  const sjsSizeMB = (sjsSize / 1024 / 1024).toFixed(2);
  const percentChange = ((ratio - 1) * 100).toFixed(1);
  
  return {
    originalSize,
    sjsSize,
    ratio,
    originalFormat: originalFile.name.split('.').pop()?.toLowerCase() || 'unknown',
    originalSizeMB,
    sjsSizeMB,
    percentChange: percentChange.startsWith('-') ? percentChange : `+${percentChange}`
  };
}

export function logSizeComparison(comparison: SizeComparison): void {
  const { originalFormat, originalSizeMB, sjsSizeMB, percentChange } = comparison;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Workbook Size Comparison:
    Original (${originalFormat}): ${originalSizeMB}MB
    SJS Format: ${sjsSizeMB}MB
    Change: ${percentChange}%
    ${comparison.ratio < 1 ? '✅ SJS is smaller' : comparison.ratio > 1 ? '📈 SJS is larger' : '⚖️ Same size'}`);
  }
}

// Helper to estimate workbook complexity
export function estimateWorkbookComplexity(workbookData: any): 'simple' | 'moderate' | 'complex' {
  if (!workbookData || !workbookData.sheets) return 'simple';
  
  let complexity = 0;
  
  // Count sheets
  const sheetCount = Object.keys(workbookData.sheets).length;
  complexity += sheetCount * 10;
  
  // Check for formulas, conditional formatting, charts, etc.
  Object.values(workbookData.sheets).forEach((sheet: any) => {
    if (sheet.data) {
      // Check for formulas
      const hasFormulas = JSON.stringify(sheet.data).includes('"formula":');
      if (hasFormulas) complexity += 20;
      
      // Check for conditional formatting
      if (sheet.conditionalFormats) complexity += 15;
      
      // Check for charts
      if (sheet.charts) complexity += 25;
      
      // Check for pictures
      if (sheet.pictures) complexity += 20;
    }
  });
  
  if (complexity < 30) return 'simple';
  if (complexity < 70) return 'moderate';
  return 'complex';
}