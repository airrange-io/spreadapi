'use client';

import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { App, Skeleton } from 'antd';
import { observer } from 'mobx-react-lite';
import { generateParameterId } from '@/lib/generateParameterId';
import * as GC from '@mescius/spread-sheets';

// Import types from ParametersSection
import type { InputDefinition, OutputDefinition, AreaParameter, AreaPermissions } from './components/ParametersSection';

// Lazy load all components for performance
const StatisticCards = lazy(() => import(/* webpackChunkName: "StatisticCards" */ './components/StatisticCards'));
const ParametersSection = lazy(() => import(/* webpackChunkName: "ParametersSection" */ './components/ParametersSection'));
const SettingsSection = lazy(() => import(/* webpackChunkName: "SettingsSection" */ './components/SettingsSection'));
const TokensSection = lazy(() => import(/* webpackChunkName: "TokensSection" */ './components/TokensSection'));
const AddParameterButton = lazy(() => import(/* webpackChunkName: "AddParameterButton" */ './components/AddParameterButton'));

// Lazy load modals for performance
const HowItWorksModal = lazy(() => import(/* webpackChunkName: "HowItWorksModal" */ './HowItWorksModal'));
const ParameterModal = lazy(() => import(/* webpackChunkName: "ParameterModal" */ './ParameterModal'));
const AreaModal = lazy(() => import(/* webpackChunkName: "AreaModal" */ './AreaModal'));

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

interface EditorPanelProps {
  spreadInstance: any;
  serviceId?: string;
  onConfigChange?: (config: any) => void;
  onImportExcel?: (file: File) => void;
  serviceStatus?: any;
  showEmptyState?: boolean;
  isLoading?: boolean;
  isDemoMode?: boolean;
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
  spreadInstance, serviceId, onConfigChange, onImportExcel, serviceStatus, initialConfig, showEmptyState, isLoading, isDemoMode
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
                  newStyle.backColor = "#F0F5FF"; // Light geekblue (geekblue-1) to match the tag color

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
            newStyle.backColor = "#F0F5FF"; // Light geekblue (geekblue-1) to match the tag color

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
    if (isDemoMode) {
      message.warning('Parameters cannot be deleted in demo mode');
      return;
    }
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
    if (isDemoMode) {
      message.warning('Areas cannot be deleted in demo mode');
      return;
    }
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

  // Callbacks for navigating to areas
  const handleNavigateToArea = useCallback((area: AreaParameter) => {
    if (!spreadInstance) return;
    try {
      const [sheetName, rangeRef] = area.address.split('!');
      const sheet = spreadInstance.getSheetFromName(sheetName);
      if (sheet) {
        spreadInstance.setActiveSheet(sheet);

        const rangeParts = rangeRef.split(':');
        if (rangeParts.length === 2) {
          const startMatch = rangeParts[0].match(/^([A-Z]+)(\d+)$/);
          const endMatch = rangeParts[1].match(/^([A-Z]+)(\d+)$/);

          if (startMatch && endMatch) {
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

            sheet.setSelection(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1);

            const viewportInfo = sheet.getViewportInfo();
            const rowViewportIndex = viewportInfo.rowViewportIndex || 0;
            const colViewportIndex = viewportInfo.colViewportIndex || 0;

            const centerRow = Math.floor((startRow + endRow) / 2);
            const centerCol = Math.floor((startCol + endCol) / 2);

            const topRow = sheet.getViewportTopRow(rowViewportIndex);
            const bottomRow = sheet.getViewportBottomRow(rowViewportIndex);
            const leftCol = sheet.getViewportLeftColumn(colViewportIndex);
            const rightCol = sheet.getViewportRightColumn(colViewportIndex);

            if (centerRow < topRow || centerRow > bottomRow) {
              sheet.showRow(centerRow, 3);
            }

            if (centerCol < leftCol || centerCol > rightCol) {
              sheet.showColumn(centerCol, 3);
            }
          }
        } else {
          const match = rangeRef.match(/^([A-Z]+)(\d+)$/);
          if (match) {
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
            sheet.showCell(row, col, 3, 3);
          }
        }

        if (spreadInstance.focus) {
          spreadInstance.focus();
        }
      }
    } catch (e) {
      console.error('Error navigating to area:', e);
    }
  }, [spreadInstance]);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Fixed header with cards */}
      <Suspense fallback={<div style={{ padding: '12px' }}><Skeleton active /></div>}>
        <StatisticCards
          activeCard={activeCard}
          inputsCount={inputs.length}
          outputsCount={outputs.length}
          tokenCount={tokenCount}
          onCardClick={handleCardClick}
        />
      </Suspense>

      {/* Scrollable content area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '0 16px',
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
            {/* Settings Detail */}
            {activeCard === 'detail' && (
              <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
                <SettingsSection
                  apiName={apiName}
                  apiDescription={apiDescription}
                  enableCaching={enableCaching}
                  aiDescription={aiDescription}
                  aiUsageExamples={aiUsageExamples}
                  aiTags={aiTags}
                  category={category}
                  onApiNameChange={setApiName}
                  onApiDescriptionChange={setApiDescription}
                  onEnableCachingChange={setEnableCaching}
                  onAiDescriptionChange={setAiDescription}
                  onAiUsageExamplesChange={setAiUsageExamples}
                  onAiTagsChange={setAiTags}
                  onCategoryChange={setCategory}
                />
              </Suspense>
            )}

            {/* Parameters Detail */}
            {activeCard === 'parameters' && (
              <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
                <ParametersSection
                  inputs={inputs}
                  outputs={outputs}
                  areas={areas}
                  isLoading={isLoading}
                  hasInitialized={hasInitialized}
                  isDemoMode={isDemoMode}
                  onNavigateToParameter={navigateToParameter}
                  onEditParameter={handleEditParameter}
                  onDeleteParameter={handleDeleteParameter}
                  onEditArea={handleEditArea}
                  onRemoveArea={handleRemoveArea}
                  onNavigateToArea={handleNavigateToArea}
                  onShowHowItWorks={() => setShowHowItWorksModal(true)}
                />
              </Suspense>
            )}

            {/* Tokens Detail */}
            {activeCard === 'tokens' && (
              <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
                <TokensSection
                  serviceId={serviceId || ''}
                  isPublished={serviceStatus?.published || false}
                  requireToken={requireToken}
                  inputs={inputs}
                  outputs={outputs}
                  availableTokens={availableTokens}
                  isDemoMode={isDemoMode}
                  onRequireTokenChange={handleRequireTokenChange}
                  onTokenCountChange={handleTokenCountChange}
                  onTokensChange={handleTokensChange}
                />
              </Suspense>
            )}

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          </div>
        )}
      </div>

      {/* Fixed button at bottom - only show in parameters mode */}
      {activeCard === 'parameters' && (
        <Suspense fallback={<div style={{ padding: '12px' }}><Skeleton.Button active block /></div>}>
          <div ref={buttonAreaRef}>
            <AddParameterButton
              currentSelection={currentSelection}
              spreadsheetReady={spreadsheetReady}
              spreadInstance={spreadInstance}
              inputs={inputs}
              outputs={outputs}
              onAddFromSelection={handleAddFromSelection}
              onAddAsEditableArea={handleAddAsEditableArea}
            />
          </div>
        </Suspense>
      )}

      {/* Add/Edit Parameter Modal - Lazy Loaded */}
      <Suspense fallback={<div />}>
        {showAddParameterModal && (
          <ParameterModal
            open={showAddParameterModal}
            parameterType={parameterType}
            editingParameter={editingParameter}
            selectedCellInfo={selectedCellInfo}
            suggestedParamName={suggestedParamName}
            onClose={() => {
              setShowAddParameterModal(false);
              setEditingParameter(null);
            }}
            onSubmit={handleAddParameter}
          />
        )}
      </Suspense>

      {/* Area Configuration Modal - Lazy Loaded */}
      <Suspense fallback={<div />}>
        {showAreaModal && (
          <AreaModal
            open={showAreaModal}
            editingArea={editingArea}
            editingAreaIndex={editingAreaIndex}
            onClose={() => {
              setShowAreaModal(false);
              setEditingArea(null);
              setEditingAreaIndex(-1);
            }}
            onSave={handleSaveArea}
            onAreaChange={setEditingArea}
          />
        )}
      </Suspense>

      {/* How It Works Modal - Lazy Loaded */}
      <Suspense fallback={<div />}>
        {showHowItWorksModal && (
          <HowItWorksModal
            open={showHowItWorksModal}
            onClose={() => setShowHowItWorksModal(false)}
          />
        )}
      </Suspense>

    </div>
  );
});

export default EditorPanel;