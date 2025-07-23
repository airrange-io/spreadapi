'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Statistic, Typography, Space, Tag, Button, Input, Upload, Modal, Form, Select, Checkbox, App, Tooltip, Alert, Popconfirm, Skeleton, Radio, Collapse, Row, Col } from 'antd';
import { FileTextOutlined, SwapOutlined, UploadOutlined, PlusOutlined, DeleteOutlined, EditOutlined, KeyOutlined, InfoCircleOutlined, SafetyOutlined, TableOutlined, LockOutlined, EyeOutlined, FunctionOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { generateParameterId } from '@/lib/generateParameterId';
import TokenManagement from './TokenManagement';
import ApiEndpointPreview from './ApiEndpointPreview';
import ServiceTester from './ServiceTester';
import * as GC from '@mescius/spread-sheets';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Declare GC namespace for TypeScript
declare global {
  interface Window {
    GC?: {
      Spread?: {
        Sheets?: {
          Events?: {
            SelectionChanged?: string;
          };
        };
      };
    };
  }
}

type ActiveCard = 'parameters' | 'detail' | 'tokens' | null;

interface InputDefinition {
  id: string;
  address: string; // Full address like "Savings!D4"
  name: string;
  alias: string; // URL-safe name
  title?: string; // Original title from spreadsheet
  row: number;
  col: number;
  type: 'number' | 'string' | 'boolean';
  value?: any;
  direction: 'input';
  mandatory?: boolean;
  min?: number;
  max?: number;
  description?: string;
  format?: 'percentage';
  percentageDecimals?: number;
}

interface OutputDefinition {
  id: string;
  address: string; // Full address like "Savings!D9"
  name: string;
  alias: string; // URL-safe name
  title?: string; // Original title from spreadsheet
  row: number;
  col: number;
  type: 'number' | 'string' | 'boolean';
  value?: any;
  direction: 'output';
  description?: string;
}

// Area-related interfaces
interface AreaPermissions {
  canReadValues: boolean;
  canWriteValues: boolean;
  canReadFormulas: boolean;
  canWriteFormulas: boolean;
  canReadFormatting: boolean;
  canWriteFormatting: boolean;
  canAddRows: boolean;
  canDeleteRows: boolean;
  canModifyStructure: boolean;
  allowedFormulas?: string[];
}

interface AreaParameter {
  id?: string;
  name: string;
  alias: string;
  address: string;
  description?: string;
  mode: 'readonly' | 'editable' | 'interactive';
  permissions: AreaPermissions;
  validation?: {
    protectedCells?: string[];
    editableColumns?: number[];
    formulaComplexityLimit?: number;
  };
  aiContext?: {
    purpose: string;
    expectedBehavior: string;
  };
}

interface EditorPanelProps {
  spreadInstance: any;
  serviceId?: string;
  onConfigChange?: (config: any) => void;
  onImportExcel?: (file: File) => void;
  serviceStatus?: any;
  showEmptyState?: boolean;
  isLoading?: boolean;
  initialConfig?: {
    name: string;
    description: string;
    inputs: InputDefinition[];
    outputs: OutputDefinition[];
    enableCaching?: boolean;
    requireToken?: boolean;
    aiDescription?: string;
    aiUsageExamples?: string[];
    aiTags?: string[];
    category?: string;
    areas?: AreaParameter[];
  };
}

// Permission presets for areas
const PERMISSION_PRESETS = {
  readonly: {
    canReadValues: true,
    canWriteValues: false,
    canReadFormulas: false,
    canWriteFormulas: false,
    canReadFormatting: true,
    canWriteFormatting: false,
    canAddRows: false,
    canDeleteRows: false,
    canModifyStructure: false
  },
  valueOnly: {
    canReadValues: true,
    canWriteValues: true,
    canReadFormulas: true,
    canWriteFormulas: false,
    canReadFormatting: true,
    canWriteFormatting: false,
    canAddRows: false,
    canDeleteRows: false,
    canModifyStructure: false
  },
  interactive: {
    canReadValues: true,
    canWriteValues: true,
    canReadFormulas: true,
    canWriteFormulas: true,
    canReadFormatting: true,
    canWriteFormatting: true,
    canAddRows: true,
    canDeleteRows: true,
    canModifyStructure: true
  }
};

const EditorPanel: React.FC<EditorPanelProps> = observer(({
  spreadInstance, serviceId, onConfigChange, onImportExcel, serviceStatus, initialConfig, showEmptyState, isLoading
}) => {
  const { message } = App.useApp();
  const buttonAreaRef = useRef<HTMLDivElement>(null);
  const [buttonAreaHeight, setButtonAreaHeight] = useState(0);
  const [activeCard, setActiveCard] = useState<ActiveCard>('parameters');
  const [apiName, setApiName] = useState(initialConfig?.name || '');
  const [apiDescription, setApiDescription] = useState(initialConfig?.description || '');
  const [inputs, setInputs] = useState<InputDefinition[]>(initialConfig?.inputs || []);
  const [outputs, setOutputs] = useState<OutputDefinition[]>(initialConfig?.outputs || []);
  const [areas, setAreas] = useState<AreaParameter[]>(initialConfig?.areas || []);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showAddParameterModal, setShowAddParameterModal] = useState(false);
  const [parameterType, setParameterType] = useState<'input' | 'output'>('input');
  const [selectedCellInfo, setSelectedCellInfo] = useState<any>(null);
  const [currentSelection, setCurrentSelection] = useState<any>(null);
  const [suggestedParamName, setSuggestedParamName] = useState<string>('');
  const [originalTitle, setOriginalTitle] = useState<string>('');
  const [enableCaching, setEnableCaching] = useState<boolean>(initialConfig?.enableCaching !== false);
  const [requireToken, setRequireToken] = useState<boolean>(initialConfig?.requireToken === true);
  const [editingParameter, setEditingParameter] = useState<InputDefinition | OutputDefinition | null>(null);
  const [editingParameterType, setEditingParameterType] = useState<'input' | 'output'>('input');
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaParameter | null>(null);
  const [editingAreaIndex, setEditingAreaIndex] = useState<number>(-1);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [availableTokens, setAvailableTokens] = useState<any[]>([]);
  const [spreadsheetReady, setSpreadsheetReady] = useState<boolean>(false);

  // AI metadata fields
  const [aiDescription, setAiDescription] = useState<string>(initialConfig?.aiDescription || '');
  const [aiUsageExamples, setAiUsageExamples] = useState<string[]>(initialConfig?.aiUsageExamples || []);
  const [aiTags, setAiTags] = useState<string[]>(initialConfig?.aiTags || []);
  const [category, setCategory] = useState<string>(initialConfig?.category || '');

  // Track if we've initialized from config
  const [hasInitialized, setHasInitialized] = useState(false);

  // Update state when initialConfig changes (after data loads)
  useEffect(() => {
    // Only update if we're not loading and we have config
    if (!isLoading && initialConfig) {
      setApiName(initialConfig.name || '');
      setApiDescription(initialConfig.description || '');
      setInputs(initialConfig.inputs || []);
      setOutputs(initialConfig.outputs || []);
      setAreas(initialConfig.areas || []);
      setEnableCaching(initialConfig.enableCaching !== false);
      setRequireToken(initialConfig.requireToken === true);
      setAiDescription(initialConfig.aiDescription || '');
      setAiUsageExamples(initialConfig.aiUsageExamples || []);
      setAiTags(initialConfig.aiTags || []);
      setCategory(initialConfig.category || '');
      setHasInitialized(true);
    }
  }, [initialConfig, isLoading]);

  // Handle card activation
  const handleCardClick = useCallback((cardType: ActiveCard) => {
    if (activeCard === cardType) {
      // setActiveCard(null); // Deactivate if already active
    } else {
      setActiveCard(cardType);
    }
  }, [activeCard]);

  // Notify parent of changes
  useEffect(() => {
    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      if (onConfigChange) {
        onConfigChange({
          name: apiName,
          description: apiDescription,
          inputs,
          outputs,
          areas,
          enableCaching,
          requireToken,
          aiDescription,
          aiUsageExamples,
          aiTags,
          category
        });
      }
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [apiName, apiDescription, inputs, outputs, areas, enableCaching, requireToken, aiDescription, aiUsageExamples, aiTags, category]);

  // Measure button area height
  useEffect(() => {
    const measureButtonArea = () => {
      if (buttonAreaRef.current) {
        setButtonAreaHeight(buttonAreaRef.current.offsetHeight);
      }
    };

    measureButtonArea();
    window.addEventListener('resize', measureButtonArea);

    // Observe for content changes
    const observer = new ResizeObserver(measureButtonArea);
    if (buttonAreaRef.current) {
      observer.observe(buttonAreaRef.current);
    }

    return () => {
      window.removeEventListener('resize', measureButtonArea);
      observer.disconnect();
    };
  }, [spreadInstance, currentSelection, activeCard]);

  // Set spreadsheet ready state after a delay
  useEffect(() => {
    if (spreadInstance && !showEmptyState) {
      // Wait a bit for spreadsheet to fully initialize
      const timer = setTimeout(() => {
        setSpreadsheetReady(true);
      }, 1000); // 1 second delay to ensure spreadsheet is fully loaded

      return () => clearTimeout(timer);
    } else {
      setSpreadsheetReady(false);
    }
  }, [spreadInstance, showEmptyState]);

  // Monitor selection changes (only when spreadsheet is ready)
  useEffect(() => {
    if (spreadInstance && spreadsheetReady) {
      const handleSelectionChanged = () => {
        try {
          const sheet = spreadInstance.getActiveSheet();
          if (sheet) {
            // Get current selection
            const selections = sheet.getSelections();
            if (selections && selections.length > 0) {
              const selection = selections[0];
              const isSingleCell = selection.rowCount === 1 && selection.colCount === 1;
              let hasFormula = false;

              if (isSingleCell) {
                hasFormula = sheet.hasFormula(selection.row, selection.col);
              }

              // Try to guess parameter name from adjacent cells
              let suggestedName = '';
              let titleText = '';
              try {
                if (isSingleCell) {
                  // Check cell to the left (same row, col-1)
                  if (selection.col > 0) {
                    const leftCell = sheet.getCell(selection.row, selection.col - 1);
                    const leftValue = leftCell.value();
                    if (leftValue && typeof leftValue === 'string' && leftValue.trim()) {
                      titleText = leftValue.trim();
                    }
                  }

                  // If no name found on left, check cell above (row-1, same col)
                  if (!titleText && selection.row > 0) {
                    const aboveCell = sheet.getCell(selection.row - 1, selection.col);
                    const aboveValue = aboveCell.value();
                    if (aboveValue && typeof aboveValue === 'string' && aboveValue.trim()) {
                      titleText = aboveValue.trim();
                    }
                  }
                } else {
                  // For ranges, check the cell to the left of the first cell in the range
                  if (selection.col > 0) {
                    const leftCell = sheet.getCell(selection.row, selection.col - 1);
                    const leftValue = leftCell.value();
                    if (leftValue && typeof leftValue === 'string' && leftValue.trim()) {
                      titleText = leftValue.trim();
                    }
                  }

                  // If no name found, check above the first cell
                  if (!titleText && selection.row > 0) {
                    const aboveCell = sheet.getCell(selection.row - 1, selection.col);
                    const aboveValue = aboveCell.value();
                    if (aboveValue && typeof aboveValue === 'string' && aboveValue.trim()) {
                      titleText = aboveValue.trim();
                    }
                  }
                }

                // Clean the suggested name to be URL parameter safe
                if (titleText) {
                  suggestedName = titleText.toLowerCase()
                    .replace(/[\s-]+/g, '_')
                    .replace(/[^a-z0-9_]/g, '')
                    .replace(/^_+|_+$/g, '')
                    .replace(/^(\d)/, '_$1');

                  if (!suggestedName || suggestedName.match(/^_*$/)) {
                    suggestedName = '';
                  }
                }
              } catch (e) {
                console.error('Error getting adjacent cell values:', e);
              }

              setCurrentSelection({
                row: selection.row,
                col: selection.col,
                rowCount: selection.rowCount,
                colCount: selection.colCount,
                isSingleCell,
                hasFormula,
                isRange: !isSingleCell,
                sheetName: sheet.name()
              });
              setSuggestedParamName(suggestedName);
              setOriginalTitle(titleText);
            }
          }
        } catch (e) {
          console.error('Error checking selection:', e);
        }
      };

      // Initial check
      handleSelectionChanged();

      // Alternative approach: poll for selection changes
      // Since SpreadJS might be minified and events are not accessible,
      // we'll use a polling approach to detect selection changes
      let lastSelection = '';

      const checkInterval = setInterval(() => {
        try {
          const sheet = spreadInstance.getActiveSheet();
          if (sheet) {
            const selections = sheet.getSelections();
            if (selections && selections.length > 0) {
              const sel = selections[0];
              const currentSelection = JSON.stringify({
                row: sel.row,
                col: sel.col,
                rowCount: sel.rowCount,
                colCount: sel.colCount
              });

              if (currentSelection !== lastSelection) {
                lastSelection = currentSelection;
                handleSelectionChanged();
              }
            }
          }
        } catch (e) {
          // Silently ignore errors during polling
        }
      }, 100); // Check every 100ms

      // Cleanup
      return () => {
        clearInterval(checkInterval);
      };
    }
  }, [spreadInstance, spreadsheetReady]);

  // Helper function to get cell address from row/col
  const getCellAddress = (row: number, col: number) => {
    // Handle columns beyond Z (AA, AB, etc.)
    let columnLetter = '';
    let tempCol = col;

    while (tempCol >= 0) {
      columnLetter = String.fromCharCode(65 + (tempCol % 26)) + columnLetter;
      tempCol = Math.floor(tempCol / 26) - 1;
    }

    return `${columnLetter}${row + 1}`; // Convert 0-based to 1-based
  };

  // Helper function to highlight parameter cells
  const highlightParameterCells = useCallback(() => {
    if (!spreadInstance || !GC?.Spread?.Sheets) return;

    // Create styles for input and output parameters
    const parameterStyle = new GC.Spread.Sheets.Style();
    parameterStyle.backColor = "#F0E1FF"; // Slightly darker purple background for all parameters

    // Clear existing highlights
    highlightedCells.forEach(cellKey => {
      try {
        const [sheetName, cellAddress] = cellKey.split('!');

        // Try to get sheet by name or index
        let sheet = null;
        try {
          if (spreadInstance.getSheetFromName) {
            sheet = spreadInstance.getSheetFromName(sheetName);
          }
        } catch (e) {
          // Method not available
        }

        if (!sheet) {
          // Try to find sheet by iterating
          const sheetCount = spreadInstance.getSheetCount ? spreadInstance.getSheetCount() : 1;
          for (let i = 0; i < sheetCount; i++) {
            const s = spreadInstance.getSheet(i);
            if (s && s.name && s.name() === sheetName) {
              sheet = s;
              break;
            }
          }
        }

        if (sheet) {
          // Parse cell address to get row and column
          const match = cellAddress.match(/^([A-Z]+)(\d+)$/);
          if (match) {
            const col = match[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
            const row = parseInt(match[2]) - 1;
            sheet.setStyle(row, col, null);
          }
        }
      } catch (e) {
        console.error('Error clearing highlight:', e);
      }
    });

    // Create new highlighted cells set
    const newHighlightedCells = new Set<string>();

    // Highlight input cells
    inputs.forEach(input => {
      try {
        const [sheetName, cellRef] = input.address.split('!');

        // Try to get sheet by name or index
        let sheet = null;
        try {
          // First try getSheetFromName
          if (spreadInstance.getSheetFromName) {
            sheet = spreadInstance.getSheetFromName(sheetName);
          }
        } catch (e) {
          // Method not available
        }

        if (!sheet) {
          // Try to find sheet by iterating through sheets
          const sheetCount = spreadInstance.getSheetCount ? spreadInstance.getSheetCount() : 1;
          for (let i = 0; i < sheetCount; i++) {
            const s = spreadInstance.getSheet(i);
            if (s && s.name && s.name() === sheetName) {
              sheet = s;
              break;
            }
          }
        }

        if (sheet) {
          // Get existing style first to preserve other properties
          const existingStyle = sheet.getStyle(input.row, input.col) || new GC.Spread.Sheets.Style();
          const newStyle = new GC.Spread.Sheets.Style();

          // Copy all existing properties
          if (existingStyle) {
            Object.assign(newStyle, existingStyle);
          }

          // Only change the background color
          newStyle.backColor = "#F0E1FF";

          sheet.setStyle(input.row, input.col, newStyle);
          newHighlightedCells.add(input.address);
        }
      } catch (e) {
        console.error('Error highlighting input:', e);
      }
    });

    // Highlight output cells
    outputs.forEach(output => {
      try {
        const [sheetName, cellRef] = output.address.split('!');

        // Try to get sheet by name or index
        let sheet = null;
        try {
          // First try getSheetFromName
          if (spreadInstance.getSheetFromName) {
            sheet = spreadInstance.getSheetFromName(sheetName);
          }
        } catch (e) {
          // Method not available
        }

        if (!sheet) {
          // Try to find sheet by iterating through sheets
          const sheetCount = spreadInstance.getSheetCount ? spreadInstance.getSheetCount() : 1;
          for (let i = 0; i < sheetCount; i++) {
            const s = spreadInstance.getSheet(i);
            if (s && s.name && s.name() === sheetName) {
              sheet = s;
              break;
            }
          }
        }
        if (sheet) {
          // Handle range outputs
          if (cellRef.includes(':')) {
            const [startCell, endCell] = cellRef.split(':');
            const startMatch = startCell.match(/^([A-Z]+)(\d+)$/);
            const endMatch = endCell.match(/^([A-Z]+)(\d+)$/);

            if (startMatch && endMatch) {
              const startCol = startMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
              const startRow = parseInt(startMatch[2]) - 1;
              const endCol = endMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
              const endRow = parseInt(endMatch[2]) - 1;

              for (let row = startRow; row <= endRow; row++) {
                for (let col = startCol; col <= endCol; col++) {
                  // Get existing style first to preserve other properties
                  const existingStyle = sheet.getStyle(row, col) || new GC.Spread.Sheets.Style();
                  const newStyle = new GC.Spread.Sheets.Style();

                  // Copy all existing properties
                  if (existingStyle) {
                    Object.assign(newStyle, existingStyle);
                  }

                  // Only change the background color
                  newStyle.backColor = "#F9F0FF";

                  sheet.setStyle(row, col, newStyle);
                  newHighlightedCells.add(`${sheetName}!${getCellAddress(row, col)}`);
                }
              }
            }
          } else {
            // Get existing style first to preserve other properties
            const existingStyle = sheet.getStyle(output.row, output.col) || new GC.Spread.Sheets.Style();
            const newStyle = new GC.Spread.Sheets.Style();

            // Copy all existing properties
            if (existingStyle) {
              Object.assign(newStyle, existingStyle);
            }

            // Only change the background color
            newStyle.backColor = "#F9F0FF";

            sheet.setStyle(output.row, output.col, newStyle);
            newHighlightedCells.add(output.address);
          }
        }
      } catch (e) {
        console.error('Error highlighting output:', e);
      }
    });

    setHighlightedCells(newHighlightedCells);
  }, [spreadInstance, inputs, outputs]);

  // Apply highlights when spreadsheet instance or parameters change
  useEffect(() => {
    if (spreadInstance) {
      // Add a small delay to ensure spreadsheet is fully loaded
      const timeoutId = setTimeout(() => {
        highlightParameterCells();
      }, 500); // Increased delay to ensure SpreadJS is fully loaded

      return () => clearTimeout(timeoutId);
    }
  }, [spreadInstance, highlightParameterCells]);

  // Function to navigate to a parameter's cell
  const navigateToParameter = useCallback((param: InputDefinition | OutputDefinition) => {
    if (!spreadInstance) return;

    try {
      const [sheetName, cellRef] = param.address.split('!');

      // Try to get the sheet
      let sheet = null;
      try {
        if (spreadInstance.getSheetFromName) {
          sheet = spreadInstance.getSheetFromName(sheetName);
        }
      } catch (e) {
        // Method not available
      }

      if (!sheet) {
        // Try to find sheet by iterating
        const sheetCount = spreadInstance.getSheetCount ? spreadInstance.getSheetCount() : 1;
        for (let i = 0; i < sheetCount; i++) {
          const s = spreadInstance.getSheet(i);
          if (s && s.name && s.name() === sheetName) {
            sheet = s;
            // Also set this sheet as active
            spreadInstance.setActiveSheet(s);
            break;
          }
        }
      }

      if (sheet) {
        // Set the sheet as active (if not already)
        spreadInstance.setActiveSheet(sheet);

        // For range parameters, select the entire range
        if (cellRef.includes(':')) {
          const [startCell, endCell] = cellRef.split(':');
          const startMatch = startCell.match(/^([A-Z]+)(\d+)$/);
          const endMatch = endCell.match(/^([A-Z]+)(\d+)$/);

          if (startMatch && endMatch) {
            const startCol = startMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
            const startRow = parseInt(startMatch[2]) - 1;
            const endCol = endMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
            const endRow = parseInt(endMatch[2]) - 1;

            // Select the range
            sheet.setSelection(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1);

            // Scroll to make the range visible
            sheet.showCell(startRow, startCol, 3, 3); // 3 = GC.Spread.Sheets.VerticalPosition.center, 3 = GC.Spread.Sheets.HorizontalPosition.center
          }
        } else {
          // Single cell - set selection and scroll to it
          sheet.setSelection(param.row, param.col, 1, 1);

          // Scroll to make the cell visible in the center
          sheet.showCell(param.row, param.col, 3, 3); // 3 = center position
        }

        // Set focus to the spreadsheet
        if (spreadInstance.focus) {
          spreadInstance.focus();
        }
      }
    } catch (e) {
      console.error('Error navigating to parameter:', e);
    }
  }, [spreadInstance]);

  // Determine button text and parameter type based on selection
  const getAddButtonInfo = () => {
    if (!spreadsheetReady) {
      return { text: 'Loading spreadsheet...', disabled: true };
    }

    if (!currentSelection) {
      return { text: 'Add Selection as Parameter', disabled: true };
    }

    const { isSingleCell, hasFormula, isRange, row, col, rowCount, colCount } = currentSelection;
    const cellRef = getCellAddress(row, col);

    // Get the sheet name (default to Sheet1 if not found)
    const sheetName = currentSelection.sheetName || 'Sheet1';

    // Check if this cell/range is already in parameters
    const isAlreadyInParameters = () => {
      if (isRange) {
        const endCellRef = getCellAddress(row + rowCount - 1, col + colCount - 1);
        const rangeAddress = `${sheetName}!${cellRef}:${endCellRef}`;
        return [...inputs, ...outputs].some(param => param.address === rangeAddress);
      } else {
        const cellAddress = `${sheetName}!${cellRef}`;
        return [...inputs, ...outputs].some(param => param.address === cellAddress);
      }
    };

    const alreadyExists = isAlreadyInParameters();

    if (isRange) {
      const endCellRef = getCellAddress(row + rowCount - 1, col + colCount - 1);
      return {
        text: alreadyExists ? `${cellRef}:${endCellRef} already added` : `Add ${cellRef}:${endCellRef} as Output`,
        type: 'output' as const,
        disabled: alreadyExists
      };
    } else if (hasFormula) {
      return {
        text: alreadyExists ? `${cellRef} already added` : `Add ${cellRef} as Output`,
        type: 'output' as const,
        disabled: alreadyExists
      };
    } else {
      return {
        text: alreadyExists ? `${cellRef} already added` : `Add ${cellRef} as Input`,
        type: 'input' as const,
        disabled: alreadyExists
      };
    }
  };

  // Handle adding parameter from selection
  const handleAddFromSelection = () => {
    console.log('handleAddFromSelection called, spreadInstance:', spreadInstance);

    if (!spreadInstance) {
      message.warning('Spreadsheet not initialized');
      return;
    }

    // Switch to parameters section if not already there
    if (activeCard !== 'parameters') {
      setActiveCard('parameters');
    }

    // SpreadJS Workbook should have getActiveSheet method even if minified
    let sheet;
    try {
      // Standard SpreadJS API - this should work regardless of minification
      sheet = spreadInstance.getActiveSheet();
      console.log('Got active sheet:', sheet);
    } catch (e) {
      console.error('Error calling getActiveSheet:', e);

      // Fallback: try to get sheet by index
      try {
        sheet = spreadInstance.getSheet(0);
        console.log('Got sheet by index:', sheet);
      } catch (e2) {
        console.error('Error calling getSheet(0):', e2);
        message.warning('Cannot access spreadsheet. The workbook may not be fully loaded.');
        return;
      }
    }

    if (!sheet) {
      message.warning('No active sheet found');
      return;
    }

    const selections = sheet.getSelections();
    if (!selections || selections.length === 0) {
      message.warning('Please select a cell or range in the spreadsheet');
      return;
    }

    // Get the first selection
    const selection = selections[0];
    const cellAddress = getCellAddress(selection.row, selection.col);

    // Check if it's a single cell
    const isSingleCell = selection.rowCount === 1 && selection.colCount === 1;

    let hasFormula = false;
    let cellValue = null;
    let cellFormat = null;

    if (isSingleCell) {
      // Check if cell has formula
      hasFormula = sheet.hasFormula(selection.row, selection.col);
      const cell = sheet.getCell(selection.row, selection.col);
      cellValue = cell.value();

      // Detect cell format
      const formatter = cell.formatter();
      const style = sheet.getStyle(selection.row, selection.col);
      cellFormat = {
        formatter: formatter || (style && style.formatter) || null,
        isPercentage: false,
        percentageDecimals: 0
      };

      if (cellFormat.formatter && cellFormat.formatter.includes('%')) {
        cellFormat.isPercentage = true;
        // Extract decimal places from format like "0.00%"
        const match = cellFormat.formatter.match(/0\.(0+)%/);
        if (match) {
          cellFormat.percentageDecimals = match[1].length;
        }
      }
    }

    // Auto-detect parameter type based on selection
    const isRange = selection.rowCount > 1 || selection.colCount > 1;
    const suggestedType = (hasFormula || isRange) ? 'output' : 'input';

    // Auto-detect data type based on cell value
    let detectedDataType = 'string';
    if (cellValue !== null && cellValue !== undefined) {
      if (typeof cellValue === 'number') {
        detectedDataType = 'number';
      } else if (typeof cellValue === 'boolean') {
        detectedDataType = 'boolean';
      } else if (typeof cellValue === 'string') {
        // Check if string is actually a number
        const numValue = parseFloat(cellValue);
        if (!isNaN(numValue) && cellValue.trim() === numValue.toString()) {
          detectedDataType = 'number';
        }
      }
    }

    // Use the pre-calculated suggested name from the selection monitoring
    const suggestedName = suggestedParamName;
    const suggestedTitle = originalTitle;

    setSelectedCellInfo({
      address: cellAddress,
      row: selection.row,
      col: selection.col,
      rowCount: selection.rowCount,
      colCount: selection.colCount,
      hasFormula,
      value: cellValue,
      isSingleCell,
      detectedDataType,
      suggestedName,
      suggestedTitle,
      format: cellFormat
    });

    setParameterType(suggestedType);
    setShowAddParameterModal(true);
  };

  // Handle modal form submission
  const handleAddParameter = (values: any) => {
    if (editingParameter) {
      // Update existing parameter
      const alias = values.name.toLowerCase()
        .replace(/[\s-]+/g, '')
        .replace(/[^a-z0-9]/g, '');

      if (editingParameterType === 'input') {
        const updatedParam: InputDefinition = {
          ...editingParameter as InputDefinition,
          name: values.name,
          alias: alias || values.name.toLowerCase(),
          title: values.title || undefined,
          type: values.dataType || 'string',
          mandatory: values.mandatory !== false,
          ...(values.description ? { description: values.description } : { description: undefined }),
          ...(values.min !== undefined && values.min !== '' ? { min: parseFloat(values.min) } : { min: undefined }),
          ...(values.max !== undefined && values.max !== '' ? { max: parseFloat(values.max) } : { max: undefined })
        };
        setInputs(inputs.map(input => input.id === editingParameter.id ? updatedParam : input));
      } else {
        const updatedParam: OutputDefinition = {
          ...editingParameter as OutputDefinition,
          name: values.name,
          alias: alias || values.name.toLowerCase(),
          title: values.title || undefined,
          type: values.dataType || 'string',
          ...(values.description ? { description: values.description } : { description: undefined })
        };
        setOutputs(outputs.map(output => output.id === editingParameter.id ? updatedParam : output));
      }

      setShowAddParameterModal(false);
      setEditingParameter(null);
      message.success(`${editingParameterType === 'input' ? 'Input' : 'Output'} parameter updated`);
      return;
    }

    // Get sheet name from spread instance
    let sheetName = 'Sheet1';
    try {
      if (spreadInstance && spreadInstance.getActiveSheet) {
        const sheet = spreadInstance.getActiveSheet();
        sheetName = sheet.name();
      }
    } catch (e) {
      console.error('Error getting sheet name:', e);
    }

    // Create full address with sheet name
    const fullAddress = selectedCellInfo.isSingleCell
      ? `${sheetName}!${selectedCellInfo.address}`
      : `${sheetName}!${selectedCellInfo.address}:${getCellAddress(
        selectedCellInfo.row + selectedCellInfo.rowCount - 1,
        selectedCellInfo.col + selectedCellInfo.colCount - 1
      )}`;

    // Generate alias from name
    const alias = values.name.toLowerCase()
      .replace(/[\s-]+/g, '')
      .replace(/[^a-z0-9]/g, '');

    if (parameterType === 'input') {
      const newParam: InputDefinition = {
        id: generateParameterId(),
        address: fullAddress,
        name: values.name,
        alias: alias || values.name.toLowerCase(),
        title: values.title || selectedCellInfo.suggestedTitle || undefined,
        row: selectedCellInfo.row,
        col: selectedCellInfo.col,
        type: values.dataType || 'string',
        value: selectedCellInfo.value,
        direction: 'input',
        mandatory: values.mandatory !== false,
        ...(values.description && { description: values.description }),
        ...(values.min !== undefined && values.min !== '' && { min: parseFloat(values.min) }),
        ...(values.max !== undefined && values.max !== '' && { max: parseFloat(values.max) }),
        ...(selectedCellInfo?.format?.isPercentage && {
          format: 'percentage',
          percentageDecimals: selectedCellInfo.format.percentageDecimals
        })
      };
      setInputs([...inputs, newParam]);
    } else {
      const newParam: OutputDefinition = {
        id: generateParameterId(),
        address: fullAddress,
        name: values.name,
        alias: alias || values.name.toLowerCase(),
        title: values.title || selectedCellInfo.suggestedTitle || undefined,
        row: selectedCellInfo.row,
        col: selectedCellInfo.col,
        type: values.dataType || 'string',
        value: selectedCellInfo.value,
        direction: 'output',
        ...(values.description && { description: values.description })
      };
      setOutputs([...outputs, newParam]);
    }

    setShowAddParameterModal(false);
    message.success(`${parameterType === 'input' ? 'Input' : 'Output'} parameter added`);
  };

  // Handle parameter deletion
  const handleDeleteParameter = (type: 'input' | 'output', id: string) => {
    if (type === 'input') {
      setInputs(inputs.filter(input => input.id !== id));
    } else {
      setOutputs(outputs.filter(output => output.id !== id));
    }
    message.success('Parameter deleted');
  };

  // Handle parameter edit
  const handleEditParameter = (type: 'input' | 'output', parameter: InputDefinition | OutputDefinition) => {
    setEditingParameter(parameter);
    setEditingParameterType(type);
    setParameterType(type);
    setSelectedCellInfo({
      address: parameter.address,
      value: parameter.value,
      detectedDataType: parameter.type,
      suggestedTitle: parameter.title
    });
    setShowAddParameterModal(true);
  };


  // Get card styling based on active state
  const getCardStyle = (cardType: ActiveCard) => {
    const baseStyle = {
      flex: 1,
      cursor: 'pointer',
      padding: 6,
      borderRadius: '8px',
      borderColor: 'transparent',
      backgroundColor: activeCard === cardType ? '#E2E3E1' : '#f2f2f2',
      transition: 'all 0.2s'
    };

    if (activeCard === cardType) {
      return {
        ...baseStyle,
        // borderColor: '#8A64C0',
        // boxShadow: '0 0 0 1px rgba(24, 144, 255, 0.2)',
        backgroundColor: '#E2E3E1' // '#f2f2f2'
      };
    }

    return baseStyle;
  };

  // Get card body style for consistent padding
  const getCardBodyStyle = () => ({
    padding: '6px 12px',
    // backgroundColor: '#f2f2f2',
    borderRadius: '8px',
  });

  // Memoize token callbacks to prevent unnecessary re-renders
  const handleRequireTokenChange = useCallback((value: boolean) => {
    setRequireToken(value);
    if (onConfigChange) {
      onConfigChange({
        name: apiName,
        description: apiDescription,
        inputs,
        outputs,
        areas,
        enableCaching,
        requireToken: value,
        aiDescription,
        aiUsageExamples,
        aiTags,
        category
      });
    }
  }, [apiName, apiDescription, inputs, outputs, areas, enableCaching, aiDescription, aiUsageExamples, aiTags, category, onConfigChange]);

  const handleTokenCountChange = useCallback((count: number) => {
    setTokenCount(count);
  }, []);

  const handleTokensChange = useCallback((tokens: any[]) => {
    setAvailableTokens(tokens);
  }, []);

  // Get statistic value style based on active state
  const getStatisticValueStyle = (cardType: ActiveCard, originalColor: string) => {
    if (activeCard === cardType) {
      return { color: originalColor, fontSize: 18 };
    }
    return { color: '#2B2A35', fontSize: 18 };
  };

  // Area-related handler functions
  const handleAddAsEditableArea = () => {
    if (!spreadInstance || !currentSelection) {
      message.warning('Please select a range in the spreadsheet');
      return;
    }

    const { row, col, rowCount = 1, colCount = 1 } = currentSelection;
    
    // Only allow ranges, not single cells
    if (rowCount === 1 && colCount === 1) {
      message.warning('Please select a range of cells, not a single cell');
      return;
    }

    const sheet = spreadInstance.getActiveSheet();
    const sheetName = sheet.name();
    
    // Build the address
    const startCell = getCellAddress(row, col);
    const endCell = getCellAddress(row + rowCount - 1, col + colCount - 1);
    const address = `${sheetName}!${startCell}:${endCell}`;
    
    // Check if this range already exists as an area
    const exists = areas.some(area => area.address === address);
    if (exists) {
      message.warning('This range is already defined as an area');
      return;
    }
    
    // Analyze the selected area
    const areaInfo = analyzeSelectedArea(sheet, row, col, rowCount, colCount);
    
    // Create new area with defaults
    const newArea: AreaParameter = {
      id: `area_${Date.now()}`,
      name: suggestAreaName(startCell, endCell),
      alias: '',
      address: address,
      description: '',
      mode: 'editable',
      permissions: PERMISSION_PRESETS.valueOnly,
      validation: {
        editableColumns: areaInfo.suggestedColumns.map((_, idx) => idx)
      },
      aiContext: {
        purpose: '',
        expectedBehavior: ''
      }
    };
    
    setEditingArea(newArea);
    setEditingAreaIndex(-1); // -1 means new area
    setShowAreaModal(true);
  };

  // Analyze selected area
  const analyzeSelectedArea = (sheet: any, startRow: number, startCol: number, rowCount: number, colCount: number) => {
    const analysis = {
      hasFormulas: false,
      hasHeaders: false,
      columnTypes: [] as string[],
      suggestedColumns: [] as any[]
    };
    
    // Check first row for headers
    const firstRowValues = [];
    for (let c = 0; c < colCount; c++) {
      const value = sheet.getCell(startRow, startCol + c).value();
      firstRowValues.push(value);
      if (typeof value === 'string' && value.trim()) {
        analysis.hasHeaders = true;
      }
    }
    
    // Analyze each column
    for (let c = 0; c < colCount; c++) {
      const columnAnalysis = {
        index: c,
        name: analysis.hasHeaders && firstRowValues[c] ? String(firstRowValues[c]) : `Column ${c + 1}`,
        hasFormulas: false,
        dataType: 'mixed' as string,
        sampleValues: [] as any[]
      };
      
      // Check cells in column (skip header if exists)
      for (let r = analysis.hasHeaders ? 1 : 0; r < Math.min(10, rowCount); r++) {
        const cell = sheet.getCell(startRow + r, startCol + c);
        const formula = cell.formula();
        const value = cell.value();
        
        if (formula) {
          columnAnalysis.hasFormulas = true;
          analysis.hasFormulas = true;
        }
        
        if (value !== null && value !== undefined && value !== '') {
          columnAnalysis.sampleValues.push(value);
        }
      }
      
      // Detect data type
      if (columnAnalysis.sampleValues.length > 0) {
        const types = columnAnalysis.sampleValues.map(v => typeof v);
        if (types.every(t => t === 'number')) {
          columnAnalysis.dataType = 'number';
        } else if (types.every(t => t === 'string')) {
          columnAnalysis.dataType = 'string';
        }
      }
      
      analysis.suggestedColumns.push(columnAnalysis);
    }
    
    return analysis;
  };

  // Suggest area name
  const suggestAreaName = (startCell: string, endCell: string) => {
    return `area_${startCell}_${endCell}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  };

  // Handle area removal
  const handleRemoveArea = (index: number) => {
    const newAreas = [...areas];
    newAreas.splice(index, 1);
    setAreas(newAreas);
    setSaveStatus('unsaved');
  };

  // Handle area editing
  const handleEditArea = (area: AreaParameter, index: number) => {
    setEditingArea(area);
    setEditingAreaIndex(index);
    setShowAreaModal(true);
  };

  // Save area from modal
  const handleSaveArea = (area: AreaParameter) => {
    if (editingAreaIndex === -1) {
      // New area
      setAreas([...areas, area]);
    } else {
      // Update existing area
      const newAreas = [...areas];
      newAreas[editingAreaIndex] = area;
      setAreas(newAreas);
    }
    
    setSaveStatus('unsaved');
    setShowAreaModal(false);
    setEditingArea(null);
    setEditingAreaIndex(-1);
    
    message.success('Area configuration saved');
  };

  // Get user-friendly mode label
  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'readonly': return 'Read Only';
      case 'editable': return 'Values Editable';
      case 'interactive': return 'Fully Interactive';
      default: return mode;
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Fixed header with cards */}
      <div style={{
        padding: '12px',
        flex: '0 0 auto'
      }}>
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>

          <Card
            size="small"
            style={{
              ...getCardStyle('parameters'),
              flex: '0 0 calc(33.33% - 5.33px)',
            }}
            styles={{ body: getCardBodyStyle() }}
            hoverable
            onClick={() => handleCardClick('parameters')}
          >
            <Statistic
              title="API Parameters"
              value={inputs.length + outputs.length}
              prefix={<SwapOutlined style={{ color: '#858585' }} />}
              valueStyle={getStatisticValueStyle('parameters', '#4F2D7F')}
              suffix={
                <span style={{ fontSize: '12px', color: '#999', fontWeight: 'normal' }}>
                  {inputs.length > 0 || outputs.length > 0 ? `(${inputs.length}/${outputs.length})` : ''}
                </span>
              }
            />
          </Card>

          <Card
            size="small"
            style={{
              ...getCardStyle('tokens'),
              flex: '0 0 calc(33.33% - 5.33px)',
            }}
            styles={{ body: getCardBodyStyle() }}
            hoverable
            onClick={() => handleCardClick('tokens')}
          >
            <Statistic
              title="Call the Service"
              value={tokenCount}
              prefix={<SafetyOutlined style={{ color: '#858585' }} />}
              valueStyle={getStatisticValueStyle('tokens', '#2B2A35')}
            />
          </Card>

          <Card
            size="small"
            style={{
              ...getCardStyle('detail'),
              flex: '0 0 calc(33.33% - 5.33px)',
            }}
            styles={{ body: getCardBodyStyle() }}
            hoverable
            onClick={() => handleCardClick('detail')}
          >
            <Statistic
              title="Settings"
              value={'---'}
              prefix={<FileTextOutlined style={{ color: '#858585' }} />}
              valueStyle={getStatisticValueStyle('detail', '#4F2D7F')}
            />
          </Card>

        </div>
      </div>

      {/* Scrollable content area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '0 12px',
        paddingBottom: 12, // activeCard === 'parameters' ? buttonAreaHeight + 12 : 12,
        minHeight: 0
      }}>
        {/* Active Card Detail Areas or Default AI Area */}
        {activeCard ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            {/* Columns Detail */}
            {activeCard === 'detail' && (
              <div style={{
                // display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                marginTop: '8px',
                marginBottom: '16px',
                gap: '12px',
                overflow: 'auto'
              }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 14,
                  backgroundColor: "#f8f8f8",
                  border: `1px solid #ffffff`,
                  borderRadius: 8,
                  minHeight: 0,
                  marginBottom: '16px',
                }}>
                  <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    <div>
                      <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Service Name</strong></div>
                      <Input
                        placeholder="Enter service name"
                        value={apiName}
                        onChange={(e) => setApiName(e.target.value)}
                      />
                    </div>

                    <div>
                      <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Description</strong></div>
                      <Input.TextArea
                        placeholder="Describe what this API does"
                        value={apiDescription}
                        onChange={(e) => setApiDescription(e.target.value)}
                        rows={2} />
                    </div>

                    <div style={{ marginTop: '0px' }}>
                      <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Advanced Options</strong></div>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space align="center">
                          <Checkbox
                            checked={enableCaching}
                            onChange={(e) => setEnableCaching(e.target.checked)}
                          >
                            Enable response caching
                          </Checkbox>
                          <Tooltip title="Cache API responses for improved performance. Users can bypass with nocache=true parameter.">
                            <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: '14px', cursor: 'help' }} />
                          </Tooltip>
                        </Space>
                      </Space>
                    </div>
                  </Space>
                </div>
                <div style={{
                  flex: 1,
                  // display: 'flex',
                  // flexDirection: 'column',
                  padding: 14,
                  backgroundColor: "#f8f8f8",
                  border: `1px solid #ffffff`,
                  borderRadius: 8,
                  minHeight: 0,
                }}>
                  <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    <div style={{ marginBottom: '8px', color: "#898989" }}><strong>AI Assistant Information</strong></div>
                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                      <div>
                        <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>AI Description</div>
                        <Input.TextArea
                          placeholder="Detailed explanation for AI assistants about what this service does and when to use it..."
                          value={aiDescription}
                          onChange={(e) => setAiDescription(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div>
                        <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Usage Examples</div>
                        <Select
                          mode="tags"
                          style={{ width: '100%' }}
                          placeholder="Add example questions or use cases (press Enter to add)"
                          value={aiUsageExamples}
                          onChange={setAiUsageExamples}
                          tokenSeparators={[',']}
                        />
                      </div>

                      <div>
                        <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Tags</div>
                        <Select
                          mode="tags"
                          style={{ width: '100%' }}
                          placeholder="Add searchable tags (e.g., finance, mortgage, loan)"
                          value={aiTags}
                          onChange={setAiTags}
                          tokenSeparators={[',']}
                        />
                      </div>

                      <div>
                        <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>Category</div>
                        <Select
                          style={{ width: '100%' }}
                          placeholder="Select a category"
                          value={category}
                          onChange={setCategory}
                        >
                          <Select.Option value="finance">Finance</Select.Option>
                          <Select.Option value="math">Mathematics</Select.Option>
                          <Select.Option value="statistics">Statistics</Select.Option>
                          <Select.Option value="business">Business</Select.Option>
                          <Select.Option value="science">Science</Select.Option>
                          <Select.Option value="engineering">Engineering</Select.Option>
                          <Select.Option value="other">Other</Select.Option>
                        </Select>
                      </div>
                    </Space>

                    {/* <div style={{ marginTop: '16px' }}>
                      <div style={{ marginBottom: '8px', color: "#898989" }}><strong>Import Data</strong></div>
                      <Upload
                        accept=".xlsx,.xls"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          if (onImportExcel) {
                            onImportExcel(file);
                          } else {
                            message.error('Import handler not configured');
                          }
                          return false; // Prevent default upload behavior
                        }}
                      >
                        <Button icon={<UploadOutlined />}>
                          Import Excel File
                        </Button>
                      </Upload>
                    </div> */}
                  </Space>
                </div>
              </div>
            )}

            {/* Parameters Detail */}
            {activeCard === 'parameters' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                marginTop: '8px',
                height: '100%',
                minHeight: 0,
                overflow: 'auto'
              }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 14,
                  backgroundColor: "#f8f8f8",
                  borderRadius: 8,
                }}>
                  <div>
                    <div style={{ marginBottom: '8px', color: '#898989' }}><strong>Input Parameters</strong></div>
                    <div style={{
                      fontSize: '12px'
                    }}>
                      {isLoading || !hasInitialized ? (
                        <Skeleton active paragraph={{ rows: 2 }} />
                      ) : inputs.length === 0 ? (
                        <div style={{ color: '#999' }}>No input parameters defined yet</div>
                      ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {inputs.map((input, index) => (
                            <div key={input.id} style={{
                              padding: '8px 12px',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #e8e8e8'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div
                                  style={{ cursor: 'pointer', flex: 1 }}
                                  onClick={() => navigateToParameter(input)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '0.8';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                  }}
                                >
                                  <Space direction="vertical" size={0}>
                                    <Space direction='horizontal' style={{ flexWrap: 'wrap', fontSize: '14px' }}>
                                      <strong>{input.name}</strong>
                                    </Space>
                                    <Space direction='horizontal' style={{ flexWrap: 'wrap' }}>
                                      {input.title && input.title !== input.name && (
                                        <div style={{ color: '#888', fontSize: '11px' }}>{input.title}, {input.type}</div>
                                      )}
                                      {(input.min !== undefined || input.max !== undefined) && (
                                        <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                          {input.min !== undefined && `Min: ${input.min}`}
                                          {input.min !== undefined && input.max !== undefined && ' • '}
                                          {input.max !== undefined && `Max: ${input.max}`}
                                        </div>
                                      )}
                                      {input.description && (
                                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                          {input.description}
                                        </div>
                                      )}
                                    </Space>
                                  </Space>
                                </div>
                                <Space size="small">
                                  <Tag color='purple' onClick={() => navigateToParameter(input)} style={{ cursor: 'pointer', padding: '4px 8px' }}>{input.address}</Tag>
                                  <Button
                                    size="small"
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditParameter('input', input)}
                                  />
                                  <Popconfirm
                                    title="Delete this parameter?"
                                    description="This action cannot be undone."
                                    onConfirm={() => handleDeleteParameter('input', input.id)}
                                    okText="Yes"
                                    cancelText="No"
                                    okButtonProps={{ danger: true }}
                                  >
                                    <Button
                                      size="small"
                                      type="text"
                                      danger
                                      icon={<DeleteOutlined />}
                                    />
                                  </Popconfirm>
                                </Space>
                              </div>
                            </div>
                          ))}
                        </Space>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 14,
                  backgroundColor: "#f8f8f8",
                  borderRadius: 8,
                  marginTop: '16px',
                }}>
                  <div>
                    <div style={{ marginBottom: '8px', color: '#898989' }}><strong>Output Parameters</strong></div>
                    <div style={{
                      fontSize: '12px'
                    }}>
                      {isLoading || !hasInitialized ? (
                        <Skeleton active paragraph={{ rows: 2 }} />
                      ) : outputs.length === 0 ? (
                        <div style={{ color: '#999' }}>No output parameters defined yet</div>
                      ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {outputs.map((output, index) => (
                            <div key={output.id} style={{
                              padding: '8px 12px',
                              background: 'white',
                              borderRadius: '8px',
                              border: '1px solid #e8e8e8'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div
                                  style={{ cursor: 'pointer', flex: 1 }}
                                  onClick={() => navigateToParameter(output)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '0.8';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                  }}
                                >
                                  <Space direction="vertical" size={0}>
                                    <Space direction='horizontal' style={{ flexWrap: 'wrap', fontSize: '14px' }}>
                                      <strong>{output.name}</strong>
                                    </Space>
                                    <Space direction='horizontal' style={{ flexWrap: 'wrap' }}>
                                      {output.title && output.title !== output.name && (
                                        <div style={{ color: '#888', fontSize: '11px' }}>{output.title}, {output.type}</div>
                                      )}
                                      {output.description && (
                                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                          {output.description}
                                        </div>
                                      )}
                                    </Space>
                                  </Space>
                                </div>
                                <Space size="small">
                                  <Tag onClick={() => navigateToParameter(output)} color='geekblue' style={{ cursor: 'pointer', padding: '4px 8px' }}>{output.address}</Tag>
                                  <Button
                                    size="small"
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditParameter('output', output)}
                                  />
                                  <Popconfirm
                                    title="Delete this parameter?"
                                    description="This action cannot be undone."
                                    onConfirm={() => handleDeleteParameter('output', output.id)}
                                    okText="Yes"
                                    cancelText="No"
                                    okButtonProps={{ danger: true }}
                                  >
                                    <Button
                                      size="small"
                                      type="text"
                                      danger
                                      icon={<DeleteOutlined />}
                                    />
                                  </Popconfirm>
                                </Space>
                              </div>
                            </div>
                          ))}
                        </Space>
                      )}
                    </div>
                  </div>
                </div>

                {/* Editable Areas for AI Section */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 14,
                  backgroundColor: "#fff7e6",
                  borderRadius: 8,
                  marginTop: '16px',
                  borderLeft: '3px solid #fa8c16'
                }}>
                  <div>
                    <div style={{ 
                      marginBottom: '8px', 
                      color: '#898989',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <strong>Editable Areas for AI</strong>
                      <Tooltip title="Areas that AI assistants can read and optionally modify">
                        <InfoCircleOutlined style={{ fontSize: 12 }} />
                      </Tooltip>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      {isLoading || !hasInitialized ? (
                        <Skeleton active paragraph={{ rows: 2 }} />
                      ) : areas.length === 0 ? (
                        <div style={{ color: '#999' }}>
                          No editable areas defined yet
                          <div style={{ fontSize: '11px', marginTop: 4 }}>
                            Select a range and click "Add as Editable Area"
                          </div>
                        </div>
                      ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {areas.map((area, index) => (
                            <div 
                              key={area.id || index} 
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                border: '1px solid #e8e8e8',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                if (!spreadInstance) return;
                                try {
                                  const [sheetName, rangeRef] = area.address.split('!');
                                  const sheet = spreadInstance.getSheetFromName(sheetName);
                                  if (sheet) {
                                    spreadInstance.setActiveSheet(sheet);
                                    
                                    // Parse the range
                                    const rangeParts = rangeRef.split(':');
                                    if (rangeParts.length === 2) {
                                      // It's a range - select the entire range
                                      const startMatch = rangeParts[0].match(/^([A-Z]+)(\d+)$/);
                                      const endMatch = rangeParts[1].match(/^([A-Z]+)(\d+)$/);
                                      
                                      if (startMatch && endMatch) {
                                        // Convert column letters to column index (supports multi-letter columns)
                                        const colToIndex = (col: string) => {
                                          let index = 0;
                                          for (let i = 0; i < col.length; i++) {
                                            index = index * 26 + col.charCodeAt(i) - 64;
                                          }
                                          return index - 1;
                                        };
                                        
                                        const startCol = colToIndex(startMatch[1]);
                                        const startRow = parseInt(startMatch[2]) - 1;
                                        const endCol = colToIndex(endMatch[1]);
                                        const endRow = parseInt(endMatch[2]) - 1;
                                        
                                        // Select the range
                                        sheet.setSelection(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1);
                                        
                                        // Scroll to make the range visible
                                        const viewportInfo = sheet.getViewportInfo();
                                        const rowViewportIndex = viewportInfo.rowViewportIndex || 0;
                                        const colViewportIndex = viewportInfo.colViewportIndex || 0;
                                        
                                        // Center the range in viewport
                                        const centerRow = Math.floor((startRow + endRow) / 2);
                                        const centerCol = Math.floor((startCol + endCol) / 2);
                                        
                                        // Only scroll if needed
                                        const topRow = sheet.getViewportTopRow(rowViewportIndex);
                                        const bottomRow = sheet.getViewportBottomRow(rowViewportIndex);
                                        const leftCol = sheet.getViewportLeftColumn(colViewportIndex);
                                        const rightCol = sheet.getViewportRightColumn(colViewportIndex);
                                        
                                        if (centerRow < topRow || centerRow > bottomRow) {
                                          sheet.showRow(centerRow, 3); // 3 = VerticalPosition.center
                                        }
                                        
                                        if (centerCol < leftCol || centerCol > rightCol) {
                                          sheet.showColumn(centerCol, 3); // 3 = HorizontalPosition.center
                                        }
                                      }
                                    } else {
                                      // Single cell
                                      const match = rangeRef.match(/^([A-Z]+)(\d+)$/);
                                      if (match) {
                                        // Convert column letters to column index (supports multi-letter columns)
                                        const colToIndex = (col: string) => {
                                          let index = 0;
                                          for (let i = 0; i < col.length; i++) {
                                            index = index * 26 + col.charCodeAt(i) - 64;
                                          }
                                          return index - 1;
                                        };
                                        
                                        const col = colToIndex(match[1]);
                                        const row = parseInt(match[2]) - 1;
                                        sheet.setSelection(row, col, 1, 1);
                                        sheet.showCell(row, col, 3, 3); // 3 = center for both vertical and horizontal
                                      }
                                    }
                                    
                                    if (spreadInstance.focus) {
                                      spreadInstance.focus();
                                    }
                                  }
                                } catch (e) {
                                  console.error('Error navigating to area:', e);
                                }
                              }}
                            >
                              {/* Area Icon based on mode */}
                              {area.mode === 'readonly' ? (
                                <LockOutlined style={{ color: '#ff4d4f' }} />
                              ) : area.mode === 'interactive' ? (
                                <TableOutlined style={{ color: '#52c41a' }} />
                              ) : (
                                <EditOutlined style={{ color: '#1890ff' }} />
                              )}
                              
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500 }}>
                                  {area.alias || area.name}
                                </div>
                                <div style={{ 
                                  fontSize: '11px', 
                                  color: '#999',
                                  display: 'flex',
                                  gap: '12px'
                                }}>
                                  <span>{area.address}</span>
                                  <span>•</span>
                                  <span>{getModeLabel(area.mode)}</span>
                                  {area.permissions.canWriteFormulas && (
                                    <>
                                      <span>•</span>
                                      <span style={{ color: '#fa8c16' }}>
                                        <FunctionOutlined style={{ fontSize: 10 }} /> Formulas
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <Space size="small">
                                <Button
                                  size="small"
                                  type="text"
                                  icon={<EditOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditArea(area, index);
                                  }}
                                />
                                <Button
                                  size="small"
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveArea(index);
                                  }}
                                />
                              </Space>
                            </div>
                          ))}
                        </Space>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<InfoCircleOutlined />}
                      onClick={() => setShowHowItWorksModal(true)}
                      style={{ padding: 0, fontSize: '12px' }}
                    >
                      How it works
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tokens Detail */}
            {activeCard === 'tokens' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                marginTop: '8px',
                minHeight: 0
              }}>
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  <ApiEndpointPreview
                    serviceId={serviceId || ''}
                    isPublished={serviceStatus?.published || false}
                    requireToken={requireToken}
                  />
                  <ServiceTester
                    serviceId={serviceId || ''}
                    isPublished={serviceStatus?.published || false}
                    inputs={inputs}
                    outputs={outputs}
                    requireToken={requireToken}
                    existingToken={availableTokens.length > 0 ? availableTokens[0].id : undefined}
                  />
                  <TokenManagement
                    serviceId={serviceId || ''}
                    requireToken={requireToken}
                    onRequireTokenChange={handleRequireTokenChange}
                    onTokenCountChange={handleTokenCountChange}
                    onTokensChange={handleTokensChange}
                  />
                </Space>
              </div>
            )}

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          </div>
        )}
      </div>

      {/* Fixed button at bottom - only show in parameters mode */}
      {activeCard === 'parameters' && (
        <div
          ref={buttonAreaRef}
          style={{
            padding: '12px',
            paddingTop: 0,
            background: 'white',
            flex: '0 0 auto'
          }}>
          {(() => {
            const buttonInfo = getAddButtonInfo();
            const isRange = currentSelection && (currentSelection.rowCount > 1 || currentSelection.colCount > 1);
            
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ width: '100%', height: 48 }}
                  onClick={handleAddFromSelection}
                  disabled={buttonInfo.disabled || !spreadInstance || !spreadsheetReady}
                >
                  {buttonInfo.text}
                </Button>
                
                {/* Add as Editable Area button - only show for ranges */}
                {isRange && !buttonInfo.disabled && (
                  <Button
                    type="default"
                    icon={<TableOutlined />}
                    style={{ width: '100%', height: 40 }}
                    onClick={handleAddAsEditableArea}
                    disabled={!spreadInstance || !spreadsheetReady}
                  >
                    Add Selection as Editable Area (for AI)
                  </Button>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Add/Edit Parameter Modal */}
      <Modal
        title={`${editingParameter ? 'Edit' : 'Add'} ${parameterType === 'input' ? 'Input' : 'Output'} Parameter`}
        open={showAddParameterModal}
        onCancel={() => {
          setShowAddParameterModal(false);
          setEditingParameter(null);
        }}
        footer={null}
        centered
      >
        <Form
          key={`${selectedCellInfo?.address}-${Date.now()}-${editingParameter?.id || ''}`} // Force form to reinitialize
          layout="vertical"
          variant={'filled'}
          onFinish={handleAddParameter}
          initialValues={{
            name: editingParameter ? editingParameter.name : (suggestedParamName || ''),
            title: editingParameter ? editingParameter.title : (selectedCellInfo?.suggestedTitle || ''),
            dataType: editingParameter ? editingParameter.type : (selectedCellInfo?.detectedDataType || 'string'),
            description: editingParameter?.description || '',
            mandatory: editingParameter ? (editingParameter as InputDefinition).mandatory !== false : true,
            min: editingParameter && 'min' in editingParameter ? editingParameter.min : undefined,
            max: editingParameter && 'max' in editingParameter ? editingParameter.max : undefined
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              label="Parameter Name"
              name="name"
              rules={[{ required: true, message: 'Please enter a parameter name' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="e.g., amount, rate, result" />
            </Form.Item>

            <Form.Item
              label="Data Type"
              name="dataType"
              style={{ width: '150px' }}
            >
              <Select>
                <Select.Option value="string">String</Select.Option>
                <Select.Option value="number">Number</Select.Option>
                <Select.Option value="boolean">Boolean</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Original Title"
            name="title"
          // help="The original title from the spreadsheet (optional)"
          >
            <Input placeholder="e.g., Interest Rate, Total Amount" />
          </Form.Item>

          {selectedCellInfo?.format?.isPercentage && (
            <Alert
              message="Percentage Format Detected"
              description="This cell is formatted as a percentage in Excel. Users should enter decimal values (e.g., 0.05 for 5%)."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            label="Description (for AI assistants)"
            name="description"
          // help="This helps AI assistants understand how to use this parameter"
          >
            <Input.TextArea
              rows={2}
              placeholder="Describe what this parameter represents and how it should be used..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          {parameterType === 'input' && (
            <>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.dataType !== currentValues.dataType}
              >
                {({ getFieldValue }) =>
                  getFieldValue('dataType') === 'number' ? (
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <Form.Item
                        label="Min Value"
                        name="min"
                        style={{ flex: 1 }}
                      >
                        <Input type="number" placeholder="Optional" />
                      </Form.Item>
                      <Form.Item
                        label="Max Value"
                        name="max"
                        style={{ flex: 1 }}
                      >
                        <Input type="number" placeholder="Optional" />
                      </Form.Item>
                    </div>
                  ) : null
                }
              </Form.Item>
            </>
          )}

          <Form.Item style={{ marginBottom: 8 }}>
            <div style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <strong>Selected Cell:</strong> {selectedCellInfo?.address}
              {selectedCellInfo?.hasFormula && (
                <div style={{ marginTop: '4px', color: '#52c41a' }}>
                  ✓ Contains formula (recommended as output)
                </div>
              )}
              {selectedCellInfo?.value !== null && selectedCellInfo?.value !== undefined && (
                <div style={{ marginTop: '4px' }}>
                  Current value: {selectedCellInfo.value}
                </div>
              )}
              {/* {!selectedCellInfo?.isSingleCell && (
                <div style={{ marginTop: '4px', color: '#1890ff' }}>
                  Range: {selectedCellInfo?.rowCount} rows × {selectedCellInfo?.colCount} columns
                </div>
              )} */}
            </div>
          </Form.Item>
          {parameterType === 'input' && (
            <>
              <Form.Item
                name="mandatory"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>Mandatory parameter</Checkbox>
              </Form.Item>
            </>
          )}
          <Form.Item style={{ marginBottom: 0, paddingBottom: 0 }}>
            <Space style={{ marginTop: 8 }}>
              <Button type="primary" htmlType="submit">
                {editingParameter ? 'Update' : 'Add'} Parameter
              </Button>
              <Button onClick={() => {
                setShowAddParameterModal(false);
                setEditingParameter(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Area Configuration Modal */}
      <Modal
        title={
          <Space>
            <TableOutlined />
            <span>{editingAreaIndex === -1 ? 'Add' : 'Edit'} Editable Area</span>
          </Space>
        }
        open={showAreaModal}
        onCancel={() => {
          setShowAreaModal(false);
          setEditingArea(null);
          setEditingAreaIndex(-1);
        }}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setShowAreaModal(false)}>
            Cancel
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={() => {
              if (!editingArea?.name || !editingArea?.address) {
                message.error('Area name and address are required');
                return;
              }
              handleSaveArea(editingArea);
            }}
          >
            {editingAreaIndex === -1 ? 'Add' : 'Save'} Area
          </Button>
        ]}
        centered
      >
        {editingArea && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Basic Info */}
            <div>
              <Form layout="vertical">
                <Form.Item label="Area Name" required>
                  <Input 
                    value={editingArea.name}
                    onChange={e => setEditingArea({...editingArea, name: e.target.value})}
                    placeholder="e.g., sales_data"
                  />
                </Form.Item>
                
                <Form.Item label="Display Name">
                  <Input 
                    value={editingArea.alias}
                    onChange={e => setEditingArea({...editingArea, alias: e.target.value})}
                    placeholder="e.g., Monthly Sales Data"
                  />
                </Form.Item>
                
                <Form.Item label="Selected Range">
                  <Input value={editingArea.address} disabled />
                </Form.Item>
                
                <Form.Item label="Description">
                  <Input.TextArea 
                    value={editingArea.description}
                    onChange={e => setEditingArea({...editingArea, description: e.target.value})}
                    placeholder="Describe what this area contains..."
                    rows={2}
                  />
                </Form.Item>
              </Form>
            </div>
            
            {/* Quick Permission Presets */}
            <div>
              <Title level={5}>Access Level</Title>
              <Radio.Group 
                value={editingArea.mode} 
                onChange={e => {
                  const mode = e.target.value;
                  setEditingArea({
                    ...editingArea,
                    mode,
                    permissions: mode === 'readonly' ? PERMISSION_PRESETS.readonly :
                               mode === 'interactive' ? PERMISSION_PRESETS.interactive :
                               PERMISSION_PRESETS.valueOnly
                  });
                }}
              >
                <Space direction="vertical">
                  <Radio value="readonly">
                    <Space>
                      <LockOutlined />
                      <span>Read Only</span>
                      <Text type="secondary">- AI can see values but not modify</Text>
                    </Space>
                  </Radio>
                  <Radio value="editable">
                    <Space>
                      <EditOutlined />
                      <span>Editable Values</span>
                      <Text type="secondary">- AI can modify values but not formulas</Text>
                    </Space>
                  </Radio>
                  <Radio value="interactive">
                    <Space>
                      <TableOutlined />
                      <span>Full Interactive</span>
                      <Text type="secondary">- AI can modify values, formulas, and structure</Text>
                    </Space>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>
            
            {/* Advanced Options */}
            <Collapse ghost>
              <Panel header="Advanced Permissions" key="1">
                <Row gutter={16}>
                  <Col span={12}>
                    <Space direction="vertical">
                      <Checkbox 
                        checked={editingArea.permissions.canReadFormulas}
                        onChange={e => setEditingArea({
                          ...editingArea,
                          permissions: {...editingArea.permissions, canReadFormulas: e.target.checked}
                        })}
                      >
                        Show formulas to AI
                      </Checkbox>
                      <Checkbox 
                        checked={editingArea.permissions.canWriteFormulas}
                        onChange={e => setEditingArea({
                          ...editingArea,
                          permissions: {...editingArea.permissions, canWriteFormulas: e.target.checked}
                        })}
                        disabled={!editingArea.permissions.canReadFormulas}
                      >
                        Allow formula modifications
                      </Checkbox>
                      <Checkbox 
                        checked={editingArea.permissions.canReadFormatting}
                        onChange={e => setEditingArea({
                          ...editingArea,
                          permissions: {...editingArea.permissions, canReadFormatting: e.target.checked}
                        })}
                      >
                        Include cell formatting
                      </Checkbox>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space direction="vertical">
                      <Checkbox 
                        checked={editingArea.permissions.canAddRows}
                        onChange={e => setEditingArea({
                          ...editingArea,
                          permissions: {...editingArea.permissions, canAddRows: e.target.checked}
                        })}
                      >
                        Allow adding rows
                      </Checkbox>
                      <Checkbox 
                        checked={editingArea.permissions.canDeleteRows}
                        onChange={e => setEditingArea({
                          ...editingArea,
                          permissions: {...editingArea.permissions, canDeleteRows: e.target.checked}
                        })}
                      >
                        Allow deleting rows
                      </Checkbox>
                      <Checkbox 
                        checked={editingArea.permissions.canModifyStructure}
                        onChange={e => setEditingArea({
                          ...editingArea,
                          permissions: {...editingArea.permissions, canModifyStructure: e.target.checked}
                        })}
                      >
                        Allow structure changes
                      </Checkbox>
                    </Space>
                  </Col>
                </Row>
              </Panel>
              
              <Panel header="AI Context (Optional)" key="2">
                <Form.Item label="Purpose">
                  <Input.TextArea 
                    value={editingArea.aiContext?.purpose}
                    onChange={e => setEditingArea({
                      ...editingArea,
                      aiContext: {...editingArea.aiContext, purpose: e.target.value}
                    })}
                    placeholder="Describe what this area contains and its purpose..."
                    rows={2}
                  />
                </Form.Item>
                
                <Form.Item label="Expected Behavior">
                  <Input.TextArea 
                    value={editingArea.aiContext?.expectedBehavior}
                    onChange={e => setEditingArea({
                      ...editingArea,
                      aiContext: {...editingArea.aiContext, expectedBehavior: e.target.value}
                    })}
                    placeholder="Guide the AI on how to interact with this area..."
                    rows={2}
                  />
                </Form.Item>
              </Panel>
            </Collapse>
          </Space>
        )}
      </Modal>

      {/* How It Works Modal */}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined />
            <span>How SpreadAPI Works</span>
          </Space>
        }
        open={showHowItWorksModal}
        onCancel={() => setShowHowItWorksModal(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowHowItWorksModal(false)}>
            Got it!
          </Button>
        ]}
        centered
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Overview */}
            <div>
              <Title level={4}>Overview</Title>
              <Paragraph>
                SpreadAPI turns your spreadsheets into powerful APIs that can be called by applications, AI assistants, 
                or integrated into workflows. Your spreadsheet becomes a calculation engine that accepts inputs and returns outputs.
              </Paragraph>
            </div>

            {/* Three Core Concepts */}
            <div>
              <Title level={4}>Three Core Concepts</Title>
              
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>
                  <Space>
                    <SwapOutlined style={{ color: '#1890ff' }} />
                    1. Input Parameters
                  </Space>
                </Title>
                <Paragraph>
                  Input parameters are values that users or applications provide when calling your service. 
                  Think of them as function arguments - you define which cells should receive these values.
                </Paragraph>
                <ul>
                  <li>Select any cell in your spreadsheet</li>
                  <li>Click "Add as Input" to make it a parameter</li>
                  <li>Give it a meaningful name (e.g., "interest_rate", "loan_amount")</li>
                  <li>Set validation rules (min/max values, required/optional)</li>
                </ul>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Title level={5}>
                  <Space>
                    <FileTextOutlined style={{ color: '#52c41a' }} />
                    2. Output Parameters
                  </Space>
                </Title>
                <Paragraph>
                  Output parameters are the calculated results from your spreadsheet. These are the values 
                  returned when someone calls your API.
                </Paragraph>
                <ul>
                  <li>Select cells containing formulas or results</li>
                  <li>Click "Add as Output"</li>
                  <li>Name your outputs (e.g., "monthly_payment", "total_interest")</li>
                  <li>Can be single cells or ranges (like tables)</li>
                </ul>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Title level={5}>
                  <Space>
                    <TableOutlined style={{ color: '#fa8c16' }} />
                    3. Editable Areas (For AI)
                  </Space>
                </Title>
                <Paragraph>
                  Editable areas are special regions that AI assistants can interact with directly. 
                  Unlike input/output parameters, these allow AI to read and modify multiple cells, 
                  including formulas.
                </Paragraph>
                <ul>
                  <li>Select a range of cells (e.g., A1:D10)</li>
                  <li>Click "Add as Editable Area"</li>
                  <li>Set permissions (read-only, edit values, edit formulas)</li>
                  <li>AI can experiment, analyze, and transform data within these areas</li>
                </ul>
              </div>
            </div>

            {/* How It Flows */}
            <div>
              <Title level={4}>The API Flow</Title>
              <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
                <ol style={{ marginBottom: 0 }}>
                  <li><strong>API Call Received</strong>: Your service receives a request with input values</li>
                  <li><strong>Inputs Applied</strong>: Values are placed into the designated input cells</li>
                  <li><strong>Calculation</strong>: Spreadsheet formulas automatically recalculate</li>
                  <li><strong>Outputs Collected</strong>: Results are read from output cells</li>
                  <li><strong>Response Sent</strong>: Calculated values are returned as JSON</li>
                </ol>
              </div>
            </div>

            {/* Example */}
            <div>
              <Title level={4}>Example: Loan Calculator</Title>
              <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 8 }}>
                <Paragraph style={{ marginBottom: 8 }}>
                  <strong>Inputs:</strong>
                </Paragraph>
                <ul style={{ marginBottom: 12 }}>
                  <li>Cell B2: loan_amount (e.g., 200000)</li>
                  <li>Cell B3: interest_rate (e.g., 0.045)</li>
                  <li>Cell B4: years (e.g., 30)</li>
                </ul>
                
                <Paragraph style={{ marginBottom: 8 }}>
                  <strong>Spreadsheet Formula:</strong>
                </Paragraph>
                <code style={{ display: 'block', marginBottom: 12, padding: 8, background: '#fff' }}>
                  Cell E2: =PMT(B3/12, B4*12, -B2)
                </code>
                
                <Paragraph style={{ marginBottom: 8 }}>
                  <strong>Output:</strong>
                </Paragraph>
                <ul style={{ marginBottom: 12 }}>
                  <li>Cell E2: monthly_payment (returns: 1013.37)</li>
                </ul>
                
                <Paragraph style={{ marginBottom: 0 }}>
                  <strong>API Call:</strong>
                </Paragraph>
                <pre style={{ marginTop: 8, marginBottom: 0 }}>
{`GET /api/getresults?api=loan_calc&loan_amount=200000&interest_rate=0.045&years=30

Response:
{
  "outputs": {
    "monthly_payment": 1013.37
  }
}`}
                </pre>
              </div>
            </div>

            {/* Publishing and Using */}
            <div>
              <Title level={4}>Publishing Your Service</Title>
              <Paragraph>
                Once you've defined your parameters:
              </Paragraph>
              <ol>
                <li>Click "Publish Service" to make it available</li>
                <li>Get your unique API endpoint</li>
                <li>Share with developers or configure for AI assistants</li>
                <li>Enable MCP integration for Claude and other AI tools</li>
              </ol>
            </div>

            {/* AI Integration */}
            <div>
              <Title level={4}>AI Assistant Integration (MCP)</Title>
              <Paragraph>
                When you enable MCP (Model Context Protocol), AI assistants like Claude can:
              </Paragraph>
              <ul>
                <li>Discover your available services automatically</li>
                <li>Call your API with natural language requests</li>
                <li>Work with editable areas to experiment and analyze</li>
                <li>Create complex workflows combining multiple services</li>
              </ul>
              <Alert
                message="Pro Tip"
                description="Editable areas are perfect for AI assistants to perform what-if analysis, data cleaning, or formula generation without affecting your main calculations."
                type="info"
                showIcon
              />
            </div>

            {/* Best Practices */}
            <div>
              <Title level={4}>Best Practices</Title>
              <ul>
                <li><strong>Clear Naming</strong>: Use descriptive names for parameters (not "input1")</li>
                <li><strong>Validation</strong>: Set min/max values to prevent errors</li>
                <li><strong>Documentation</strong>: Add descriptions to help users understand each parameter</li>
                <li><strong>Error Handling</strong>: Use IFERROR() in formulas for robustness</li>
                <li><strong>Test First</strong>: Try your API before publishing</li>
                <li><strong>AI Context</strong>: Provide clear descriptions for AI to understand your service</li>
              </ul>
            </div>
          </Space>
        </div>
      </Modal>

    </div>
  );
});

export default EditorPanel;