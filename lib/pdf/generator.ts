import type { PrintSettings } from '../print/types';

export interface PDFGenerationOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
}

export async function generatePDFFromWorkbook(
  workbook: any,
  settings: PrintSettings,
  options?: PDFGenerationOptions
): Promise<Blob> {
  // Dynamically import SpreadJS modules for PDF generation
  const [
    { default: GC },
    // { IO },
    // { PDF }
  ] = await Promise.all([
    import('@mescius/spread-sheets'),
    // import('@mescius/spread-sheets-io'),
    // import('@mescius/spread-sheets-pdf')
  ]);

  // Ensure PDF module is loaded
  await import('@mescius/spread-sheets-print');
  await import('@mescius/spread-sheets-pdf');

  // Get the active sheet
  const sheet = workbook.getActiveSheet();
  const printInfo = sheet.printInfo();

  // Apply print settings
  if (settings.printArea) {
    printInfo.printArea(settings.printArea);
  }

  if (settings.orientation) {
    const orientation = settings.orientation === 'landscape'
      ? GC.Spread.Sheets.Print.PrintPageOrientation.landscape
      : GC.Spread.Sheets.Print.PrintPageOrientation.portrait;
    printInfo.orientation(orientation);
  }

  if (settings.fitToPage) {
    printInfo.bestFitColumns(true);
    printInfo.bestFitRows(true);
  }

  if (settings.scale && !settings.fitToPage) {
    printInfo.zoomFactor(settings.scale);
  }

  if (settings.margins) {
    const margin = printInfo.margin();
    if (settings.margins.top !== undefined) margin.top = settings.margins.top;
    if (settings.margins.bottom !== undefined) margin.bottom = settings.margins.bottom;
    if (settings.margins.left !== undefined) margin.left = settings.margins.left;
    if (settings.margins.right !== undefined) margin.right = settings.margins.right;
    printInfo.margin(margin);
  }

  // Set print settings for better quality
  printInfo.showBorder(false);
  printInfo.showGridLine(false);
  printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide);
  printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide);
  
  // Center horizontally and vertically
  printInfo.centering(GC.Spread.Sheets.Print.PrintCentering.horizontal);

  return new Promise((resolve, reject) => {
    const pdfOptions: any = {
      title: options?.title || 'SpreadAPI Report',
      author: options?.author || 'SpreadAPI',
      subject: options?.subject,
      keywords: options?.keywords,
      creator: options?.creator || 'SpreadAPI PDF Generator'
    };

    try {
      workbook.savePDF(
        (blob: Blob) => {
          resolve(blob);
        },
        (error: any) => {
          console.error('PDF generation error:', error);
          reject(new Error(`Failed to generate PDF: ${error?.message || 'Unknown error'}`));
        },
        pdfOptions
      );
    } catch (error) {
      console.error('PDF generation exception:', error);
      reject(new Error(`PDF generation failed: ${error}`));
    }
  });
}

export async function loadWorkbookFromJSON(jsonData: any): Promise<any> {
  // Dynamically import SpreadJS modules
  const { default: GC } = await import('@mescius/spread-sheets');
  await import('@mescius/spread-sheets-io');

  // Create a new workbook
  const workbook = new GC.Spread.Sheets.Workbook();
  
  // Load the JSON data
  workbook.fromJSON(jsonData);
  
  return workbook;
}

export async function applyInputsToWorkbook(
  workbook: any,
  inputs: Record<string, any>
): Promise<void> {
  const sheet = workbook.getActiveSheet();
  
  // Apply inputs to cells
  for (const [cellAddress, value] of Object.entries(inputs)) {
    try {
      // Parse cell address (e.g., "A1", "B2")
      const match = cellAddress.match(/^([A-Z]+)(\d+)$/i);
      if (match) {
        const col = match[1];
        const row = parseInt(match[2], 10);
        
        // Convert column letter to index
        let colIndex = 0;
        for (let i = 0; i < col.length; i++) {
          colIndex = colIndex * 26 + (col.charCodeAt(i) - 65) + 1;
        }
        colIndex--; // 0-based index
        
        // Set the value
        sheet.setValue(row - 1, colIndex, value);
      }
    } catch (error) {
      console.error(`Error setting value for ${cellAddress}:`, error);
    }
  }
  
  // Recalculate formulas
  workbook.calculate();
}