/**
 * Client-side workbook management utilities
 * Handles spreadsheet operations like export, import, etc.
 */

interface ExportOptions {
  includeBindingSource?: boolean;
  includeStyles?: boolean;
  includeFormulas?: boolean;
  saveAsView?: boolean;
  includeUnusedStyles?: boolean;
  includeAutoMergedCells?: boolean;
}

interface WorkbookData {
  version?: number;
  sheets?: any;
  [key: string]: any;
}

interface ProcessedWorkbookData {
  type: 'sjs' | 'json' | 'excel';
  blob?: Blob;
  data?: any;
  format?: string;
  fileName?: string;
}

interface WorkbookManager {
  exportToExcel: (
    spreadInstance: any,
    fileName?: string,
    options?: ExportOptions
  ) => Promise<void>;
  
  importFromExcel: (
    workbookRef: any,
    file: File
  ) => Promise<void>;
  
  saveWorkbookAsSJS: (
    workbookRef: any
  ) => Promise<Blob | null>;
  
  getWorkbookJSON: (
    workbookRef: any
  ) => any;
  
  processWorkbookData: (
    workbookResult: any
  ) => ProcessedWorkbookData | null;
  
  createDefaultWorkbook: () => WorkbookData;
  
  convertBase64ToBlob: (
    base64: string,
    mimeType?: string
  ) => Blob;
}

class WorkbookManagerImpl implements WorkbookManager {
  /**
   * Export spreadsheet to Excel file
   */
  async exportToExcel(
    spreadInstance: any,
    fileName: string = 'spreadsheet',
    options: ExportOptions = {}
  ): Promise<void> {
    if (!spreadInstance) {
      throw new Error('Spreadsheet instance not provided');
    }

    const defaultOptions: ExportOptions = {
      includeBindingSource: true,
      includeStyles: true,
      includeFormulas: true,
      saveAsView: false,
      includeUnusedStyles: false,
      includeAutoMergedCells: false
    };

    const exportOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      spreadInstance.export(
        (blob: Blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          resolve();
        },
        (error: any) => {
          console.error('Export error:', error);
          reject(new Error('Failed to export Excel file'));
        },
        exportOptions
      );
    });
  }
  
  /**
   * Import Excel file into workbook
   */
  async importFromExcel(workbookRef: any, file: File): Promise<void> {
    if (!workbookRef || !workbookRef.importExcel) {
      throw new Error('Workbook not initialized or importExcel method not available');
    }

    return workbookRef.importExcel(file);
  }
  
  /**
   * Save workbook as SJS (SpreadJS native format) blob
   */
  async saveWorkbookAsSJS(workbookRef: any): Promise<Blob | null> {
    if (!workbookRef || !workbookRef.saveWorkbookSJS) {
      throw new Error('Workbook not initialized or saveWorkbookSJS method not available');
    }

    try {
      const blob = await workbookRef.saveWorkbookSJS();
      return blob;
    } catch (error) {
      console.error('Error saving workbook as SJS:', error);
      return null;
    }
  }
  
  /**
   * Get workbook data as JSON
   */
  getWorkbookJSON(workbookRef: any): any {
    if (!workbookRef || !workbookRef.getWorkbookJSON) {
      throw new Error('Workbook not initialized or getWorkbookJSON method not available');
    }

    return workbookRef.getWorkbookJSON();
  }
  
  /**
   * Process workbook data from API response
   */
  processWorkbookData(workbookResult: any): ProcessedWorkbookData | null {
    if (!workbookResult) return null;

    if (workbookResult.format === 'sjs' && workbookResult.workbookBlob) {
      // Handle SJS format - convert base64 to blob
      const blob = this.convertBase64ToBlob(workbookResult.workbookBlob, 'application/octet-stream');
      
      return {
        type: 'sjs',
        blob: blob,
        format: 'sjs'
      };
    } else if (workbookResult.workbookData) {
      // Handle JSON format
      return {
        type: 'json',
        data: workbookResult.workbookData,
        format: 'json'
      };
    }

    return null;
  }
  
  /**
   * Create a default empty workbook structure
   */
  createDefaultWorkbook(): WorkbookData {
    return {
      version: 18,
      sheetCount: 1,
      customList: [],
      sheets: {
        Sheet1: {
          name: 'Sheet1',
          isSelected: true,
          activeRow: 0,
          activeCol: 0,
          rowCount: 200,
          columnCount: 20,
          frozenTrailingRowStickToEdge: true,
          frozenTrailingColumnStickToEdge: true,
          defaults: {
            colHeaderRowHeight: 20,
            rowHeaderColWidth: 40,
            rowHeight: 20,
            colWidth: 64
          },
          rowHeaderData: {
            defaultDataNode: {
              style: {
                themeFont: 'Body'
              }
            }
          },
          colHeaderData: {
            defaultDataNode: {
              style: {
                themeFont: 'Body'
              }
            }
          },
          data: {
            defaultDataNode: {
              style: {
                themeFont: 'Body'
              }
            }
          },
          selections: {
            0: {
              row: 0,
              col: 0,
              rowCount: 1,
              colCount: 1
            },
            length: 1
          },
          index: 0
        }
      }
    };
  }
  
  /**
   * Convert base64 string to Blob
   */
  convertBase64ToBlob(base64: string, mimeType: string = 'application/octet-stream'): Blob {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new Blob([bytes], { type: mimeType });
  }
}

// Export singleton instance
export const workbookManager = new WorkbookManagerImpl();

// Export types
export type { ExportOptions, WorkbookManager, WorkbookData, ProcessedWorkbookData };