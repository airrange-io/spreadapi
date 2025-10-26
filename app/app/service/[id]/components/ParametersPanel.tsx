'use client';

import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { App, Skeleton } from 'antd';
import { observer } from 'mobx-react-lite';
import { generateParameterId } from '@/lib/generateParameterId';
import * as GC from '@mescius/spread-sheets';

// Import types and constants from ParametersSection
import type { InputDefinition, OutputDefinition, AreaParameter, AreaPermissions } from './ParametersSection';
import { COMPACT_LAYOUT_BREAKPOINT_PX } from './ParametersSection';

// Lazy load components
const ParametersSection = lazy(() => import('./ParametersSection'));
const AddParameterButton = lazy(() => import('./AddParameterButton'));

// Lazy load modals
const HowItWorksModal = lazy(() => import('../HowItWorksModal'));
const ParameterModal = lazy(() => import('../ParameterModal'));
const AreaModal = lazy(() => import('../AreaModal'));

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

interface ParametersPanelProps {
  spreadInstance: any;
  serviceId?: string;
  onConfigChange?: (config: any) => void;
  isDemoMode?: boolean;
  isLoading?: boolean;
  initialConfig?: {
    inputs: InputDefinition[];
    outputs: OutputDefinition[];
    areas?: AreaParameter[];
  };
  addButtonRef?: React.RefObject<HTMLDivElement>;
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

const ParametersPanel: React.FC<ParametersPanelProps> = observer(({
  spreadInstance, serviceId, onConfigChange, initialConfig, isLoading, isDemoMode, addButtonRef
}) => {
  const { message } = App.useApp();
  const buttonAreaRef = useRef<HTMLDivElement>(null);
  const [buttonAreaHeight, setButtonAreaHeight] = useState(0);
  const [inputs, setInputs] = useState<InputDefinition[]>(initialConfig?.inputs || []);
  const [outputs, setOutputs] = useState<OutputDefinition[]>(initialConfig?.outputs || []);
  const [areas, setAreas] = useState<AreaParameter[]>(initialConfig?.areas || []);
  const [spreadsheetReady, setSpreadsheetReady] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelWidth, setPanelWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [editingParameter, setEditingParameter] = useState<any>(null);
  const [editingArea, setEditingArea] = useState<any>(null);
  const [selectedCellInfo, setSelectedCellInfo] = useState<any>(null);
  const [suggestedParamName, setSuggestedParamName] = useState<string>('');
  const [parameterType, setParameterType] = useState<'input' | 'output'>('input');

  // Helper function to check overlap between two ranges
  const checkRangeOverlap = (range1: any, range2: any) => {
    const r1Sheet = range1.sheetName || spreadInstance?.getActiveSheet()?.name();
    const r2Sheet = range2.sheetName || spreadInstance?.getActiveSheet()?.name();
    
    if (r1Sheet !== r2Sheet) return false;
    
    const r1StartRow = range1.row;
    const r1EndRow = range1.row + range1.rowCount - 1;
    const r1StartCol = range1.col;
    const r1EndCol = range1.col + range1.colCount - 1;
    
    const r2StartRow = range2.row;
    const r2EndRow = range2.row + range2.rowCount - 1;
    const r2StartCol = range2.col;
    const r2EndCol = range2.col + range2.colCount - 1;
    
    return !(r1EndRow < r2StartRow || r2EndRow < r1StartRow || 
             r1EndCol < r2StartCol || r2EndCol < r1StartCol);
  };

  // Update initial data when loading completes
  useEffect(() => {
    if (!isLoading && initialConfig && !hasInitialized) {
      setInputs(initialConfig.inputs || []);
      setOutputs(initialConfig.outputs || []);
      setAreas(initialConfig.areas || []);
      setHasInitialized(true);
    }
  }, [initialConfig, isLoading]);

  // Add fade-in effect and track width
  useEffect(() => {
    setMounted(true);
    
    const updateWidth = () => {
      if (containerRef.current) {
        setPanelWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Notify parent of changes
  useEffect(() => {
    // Don't notify until we've been initialized with real data
    if (!hasInitialized) return;
    
    const timer = setTimeout(() => {
      if (onConfigChange) {
        onConfigChange({
          inputs,
          outputs,
          areas
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputs, outputs, areas, hasInitialized]);

  // Monitor button area height
  useEffect(() => {
    if (!buttonAreaRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setButtonAreaHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(buttonAreaRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle parameter editing
  const handleEditParameter = useCallback((type: 'input' | 'output', param: any) => {
    // Create cell info from existing parameter
    const cellInfo = {
      address: param.address,
      row: param.row,
      col: param.col,
      rowCount: param.rowCount || 1,
      colCount: param.colCount || 1,
      hasFormula: param.direction === 'output',
      value: param.value,
      isSingleCell: (param.rowCount || 1) === 1 && (param.colCount || 1) === 1,
      detectedDataType: param.dataType || param.type, // Use dataType if available, fallback to type
      suggestedName: param.name,
      suggestedTitle: param.title || param.name,
      // Include format information if it exists
      ...(param.format && {
        format: {
          format: param.format,
          formatter: param.formatter,
          isPercentage: param.format === 'percentage',
          currencySymbol: param.currencySymbol,
          decimals: param.decimals,
          thousandsSeparator: param.thousandsSeparator
        }
      })
    };

    setSelectedCellInfo(cellInfo);
    setSuggestedParamName(param.name);
    setParameterType(param.direction || (param.type === 'input' ? 'input' : 'output'));
    setEditingParameter(param);
    setShowParameterModal(true);
  }, []);

  // Handle area editing
  const handleEditArea = useCallback((area: any, index: number) => {
    setEditingArea(area);
    setShowAreaModal(true);
  }, []);

  // Navigate to parameter
  const navigateToParameter = useCallback((param: any) => {
    if (!spreadInstance) return;

    try {
      spreadInstance.suspendPaint();
      
      const targetSheet = spreadInstance.getSheetFromName(param.sheetName);
      if (targetSheet) {
        spreadInstance.setActiveSheet(targetSheet);
      }

      const sheet = spreadInstance.getActiveSheet();
      if (sheet) {
        sheet.setActiveCell(param.row, param.col);
        sheet.showCell(param.row, param.col, 3, 3);
        
        sheet.clearSelection();
        sheet.addSelection(param.row, param.col, param.rowCount, param.colCount);
      }
    } finally {
      spreadInstance.resumePaint();
    }
  }, [spreadInstance]);

  // Navigate to area
  const handleNavigateToArea = useCallback((area: AreaParameter) => {
    if (!spreadInstance || !area.address) return;

    try {
      spreadInstance.suspendPaint();
      
      // Parse the address string (e.g., "Sheet1!A1:B10" or "A1:B10")
      let sheetName: string | undefined;
      let rangeStr = area.address;
      
      // Check if address contains sheet name
      const sheetSeparatorIndex = rangeStr.indexOf('!');
      if (sheetSeparatorIndex > -1) {
        sheetName = rangeStr.substring(0, sheetSeparatorIndex);
        rangeStr = rangeStr.substring(sheetSeparatorIndex + 1);
      }
      
      // Switch to target sheet if specified
      if (sheetName) {
        const targetSheet = spreadInstance.getSheetFromName(sheetName);
        if (targetSheet) {
          spreadInstance.setActiveSheet(targetSheet);
        }
      }
      
      const sheet = spreadInstance.getActiveSheet();
      if (sheet) {
        // Use getRange to parse the range string
        const range = sheet.getRange(rangeStr);
        if (range) {
          const row = range.row;
          const col = range.col;
          const rowCount = range.rowCount;
          const colCount = range.colCount;
          
          sheet.setActiveCell(row, col);
          sheet.showCell(row, col, 3, 3);
          
          sheet.clearSelection();
          sheet.addSelection(row, col, rowCount, colCount);
        }
      }
    } catch (error) {
      console.error('Error navigating to area:', error);
    } finally {
      spreadInstance.resumePaint();
    }
  }, [spreadInstance]);

  // Delete parameter
  const handleDeleteParameter = useCallback((type: 'input' | 'output', id: string) => {
    if (type === 'input') {
      setInputs(prev => prev.filter(p => p.id !== id));
    } else {
      setOutputs(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  // Reorder inputs
  const handleReorderInputs = useCallback((newOrder: InputDefinition[]) => {
    setInputs(newOrder);
  }, []);

  // Reorder outputs
  const handleReorderOutputs = useCallback((newOrder: OutputDefinition[]) => {
    setOutputs(newOrder);
  }, []);

  // Remove area
  const handleRemoveArea = useCallback((index: number) => {
    setAreas(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle parameter save from modal
  const handleParameterSave = useCallback((updatedParam: any) => {
    if (updatedParam.type === 'input') {
      setInputs(prev => prev.map(p => p.id === updatedParam.id ? updatedParam : p));
    } else {
      setOutputs(prev => prev.map(p => p.id === updatedParam.id ? updatedParam : p));
    }
    setShowParameterModal(false);
    setEditingParameter(null);
  }, []);

  // Handle area save from modal
  const handleAreaSave = useCallback((updatedArea: AreaParameter) => {
    // Check if this is a new area or an existing one
    setAreas(prev => {
      const existingIndex = prev.findIndex(a => a.id === updatedArea.id);
      if (existingIndex >= 0) {
        // Update existing area
        return prev.map(a => a.id === updatedArea.id ? updatedArea : a);
      } else {
        // Add new area
        return [...prev, updatedArea];
      }
    });
    setShowAreaModal(false);
    setEditingArea(null);
  }, []);

  // Add parameter from selection
  const handleAddParameterFromSelection = useCallback(async () => {
    if (!currentSelection || !spreadInstance) {
      message.warning('Please select a cell or range in the spreadsheet first');
      return;
    }

    const sheet = spreadInstance.getActiveSheet();
    let sheetName = '';
    
    try {
      sheetName = sheet?.name ? sheet.name() : sheet?.['name']?.() || 'Sheet1';
    } catch (error) {
      console.error('Error getting sheet name:', error);
      sheetName = 'Sheet1';
    }

    // Get cell value and detect type
    let value = null;
    let hasFormula = false;
    let detectedType = 'string';
    let titleText = '';
    let cellFormat = null;
    let dropdownItems = null;

    try {
      value = sheet.getValue(currentSelection.row, currentSelection.col);
      hasFormula = sheet.getFormula(currentSelection.row, currentSelection.col) ? true : false;

      // Detect data type
      if (typeof value === 'number') {
        detectedType = 'number';
      } else if (typeof value === 'boolean') {
        detectedType = 'boolean';
      } else if (typeof value === 'string') {
        // Check if string is actually a number
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value.trim() === numValue.toString()) {
          detectedType = 'number';
        }
      }

      // Detect cell format (for percentage detection) and dropdown items
      if (currentSelection.rowCount === 1 && currentSelection.colCount === 1) {
        try {
          const cell = sheet.getCell(currentSelection.row, currentSelection.col);
          const formatter = cell.formatter();
          const style = sheet.getStyle(currentSelection.row, currentSelection.col);

          const formatterString = formatter || (style && style.formatter) || null;

          cellFormat = {
            formatter: formatterString,
            isPercentage: false,
            format: null, // Generic format type: 'percentage', 'currency', 'date', etc.
            // JavaScript-friendly metadata
            currencySymbol: null,
            decimals: null,
            thousandsSeparator: null
          };

          if (formatterString) {
            // Detect percentage format
            if (formatterString.includes('%')) {
              cellFormat.isPercentage = true;
              cellFormat.format = 'percentage';
              // Extract decimal places from format like "0.00%"
              const match = formatterString.match(/0\.(0+)%/);
              if (match) {
                cellFormat.decimals = match[1].length;
              } else {
                cellFormat.decimals = 0;
              }
            }
            // Detect currency format
            else if (formatterString.includes('$') || formatterString.includes('€') ||
                     formatterString.includes('£') || formatterString.includes('¥') ||
                     formatterString.includes('₹') || formatterString.includes('CHF')) {
              cellFormat.format = 'currency';

              // Extract currency symbol
              if (formatterString.includes('€')) cellFormat.currencySymbol = '€';
              else if (formatterString.includes('$')) cellFormat.currencySymbol = '$';
              else if (formatterString.includes('£')) cellFormat.currencySymbol = '£';
              else if (formatterString.includes('¥')) cellFormat.currencySymbol = '¥';
              else if (formatterString.includes('₹')) cellFormat.currencySymbol = '₹';
              else if (formatterString.includes('CHF')) cellFormat.currencySymbol = 'CHF';

              // Extract decimal places (look for pattern like #,##0.00)
              const decimalMatch = formatterString.match(/0\.(0+)/);
              if (decimalMatch) {
                cellFormat.decimals = decimalMatch[1].length;
              } else if (formatterString.includes('.')) {
                cellFormat.decimals = 2; // default
              } else {
                cellFormat.decimals = 0;
              }

              // Detect thousands separator
              cellFormat.thousandsSeparator = formatterString.includes('#,##') || formatterString.includes('#.##');
            }
            // Detect date/time formats
            else if (formatterString.match(/[dmyDMY]{1,4}|h{1,2}|s{1,2}/)) {
              cellFormat.format = 'date';
            }
          }

          // Detect SpreadJS dropdown in cell

          // Method 1: Check cellType (for combo box cell types)
          if (style && style.cellType) {
            const cellType = style.cellType;
            if (cellType.typeName === 'combobox' || cellType.type === 'combobox') {
              if (cellType.items || cellType.option?.items) {
                dropdownItems = cellType.items || cellType.option.items;
              }
            }
          }

          // Method 2: Check data validation (most common method)
          if (!dropdownItems) {
            const dataValidation = sheet.getDataValidator(currentSelection.row, currentSelection.col);

            if (dataValidation && dataValidation.type() === 3) {
              // Type 3 is list validation in SpreadJS
              // Use getValidList to get the actual dropdown items
              try {
                const validList = dataValidation.getValidList(sheet, currentSelection.row, currentSelection.col);
                if (validList && Array.isArray(validList) && validList.length > 0) {
                  dropdownItems = validList;
                }
              } catch (e) {
                // Fallback: Try manual extraction from formula
                let formula = null;
                if (dataValidation._S && dataValidation._S[0]) {
                  formula = dataValidation._S[0];
                }

                // Check if formula is a range reference object
                if (formula && typeof formula === 'object' &&
                    'row' in formula && 'col' in formula &&
                    'rowCount' in formula && 'colCount' in formula) {
                  // Extract values from the range
                  dropdownItems = [];
                  for (let r = formula.row; r < formula.row + formula.rowCount; r++) {
                    for (let c = formula.col; c < formula.col + formula.colCount; c++) {
                      const value = sheet.getValue(r, c);
                      if (value !== null && value !== undefined && value !== '') {
                        dropdownItems.push(value);
                      }
                    }
                  }
                } else if (formula && typeof formula === 'string') {
                  // Parse comma-separated list
                  dropdownItems = formula.split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
                }
              }
            }
          }

          // Method 3: Check cellButtons and dropDowns (legacy method)
          if (!dropdownItems && style && style.cellButtons && style.cellButtons.length > 0) {
            const hasDropdown = style.cellButtons.some((btn: any) =>
              btn.command === 'openList' || btn.imageType === 1
            );

            if (hasDropdown && style.dropDowns && style.dropDowns.length > 0) {
              const dropdown = style.dropDowns[0];
              if (dropdown && dropdown.option && dropdown.option.items) {
                dropdownItems = dropdown.option.items;
              }
            }
          }
        } catch (e) {
          console.log('Could not get cell format or dropdown:', e);
        }
      }
      
      // Try to find a title from neighboring cells
      const isSingleCell = currentSelection.rowCount === 1 && currentSelection.colCount === 1;
      
      if (isSingleCell) {
        // Check cell to the left (same row, col-1)
        if (currentSelection.col > 0) {
          try {
            const leftValue = sheet.getValue(currentSelection.row, currentSelection.col - 1);
            if (leftValue && typeof leftValue === 'string' && leftValue.trim()) {
              titleText = leftValue.trim();
            }
          } catch (e) {
            console.log('Could not get left cell value');
          }
        }
        
        // If no title found on left, check cell above (row-1, same col)
        if (!titleText && currentSelection.row > 0) {
          try {
            const aboveValue = sheet.getValue(currentSelection.row - 1, currentSelection.col);
            if (aboveValue && typeof aboveValue === 'string' && aboveValue.trim()) {
              titleText = aboveValue.trim();
            }
          } catch (e) {
            console.log('Could not get above cell value');
          }
        }
      } else {
        // For ranges, check the cell to the left of the first cell in the range
        if (currentSelection.col > 0) {
          try {
            const leftValue = sheet.getValue(currentSelection.row, currentSelection.col - 1);
            if (leftValue && typeof leftValue === 'string' && leftValue.trim()) {
              titleText = leftValue.trim();
            }
          } catch (e) {
            console.log('Could not get left cell value');
          }
        }
        
        // If no title found, check above the first cell
        if (!titleText && currentSelection.row > 0) {
          try {
            const aboveValue = sheet.getValue(currentSelection.row - 1, currentSelection.col);
            if (aboveValue && typeof aboveValue === 'string' && aboveValue.trim()) {
              titleText = aboveValue.trim();
            }
          } catch (e) {
            console.log('Could not get above cell value');
          }
        }
      }
    } catch (error) {
      console.error('Error getting cell value:', error);
    }

    // Determine parameter type based on selection
    const isRange = currentSelection.rowCount > 1 || currentSelection.colCount > 1;
    const type = hasFormula || isRange ? 'output' : 'input';
    
    // Get cell address
    const getCellAddress = (row: number, col: number) => {
      let columnLetter = '';
      let tempCol = col;
      while (tempCol >= 0) {
        columnLetter = String.fromCharCode(65 + (tempCol % 26)) + columnLetter;
        tempCol = Math.floor(tempCol / 26) - 1;
      }
      return `${columnLetter}${row + 1}`;
    };
    
    const cellAddress = getCellAddress(currentSelection.row, currentSelection.col);
    const endAddress = isRange ? getCellAddress(
      currentSelection.row + currentSelection.rowCount - 1,
      currentSelection.col + currentSelection.colCount - 1
    ) : '';
    const address = isRange ? `${sheetName}!${cellAddress}:${endAddress}` : `${sheetName}!${cellAddress}`;
    
    // Generate suggested name from title if found
    let suggestedName = '';
    if (titleText) {
      // Clean the title to create a URL parameter safe name
      suggestedName = titleText.toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/^_+|_+$/g, '')
        .replace(/^(\d)/, '_$1');
      
      if (!suggestedName || suggestedName.match(/^_*$/)) {
        suggestedName = cellAddress.toLowerCase();
      }
    } else {
      suggestedName = cellAddress.toLowerCase();
    }
    
    const suggestedTitle = titleText || (value ? String(value).substring(0, 30) : cellAddress);

    // Check for range overlap with existing parameters
    const existingParams = [...inputs, ...outputs];
    const newRange = {
      sheetName,
      row: currentSelection.row,
      col: currentSelection.col,
      rowCount: currentSelection.rowCount,
      colCount: currentSelection.colCount
    };
    
    for (const param of existingParams) {
      // Extract sheet name from address if present
      let paramSheetName = sheetName;
      let paramAddress = param.address;
      const sheetSeparatorIndex = paramAddress.indexOf('!');
      if (sheetSeparatorIndex > -1) {
        paramSheetName = paramAddress.substring(0, sheetSeparatorIndex);
      }
      
      const paramRange = {
        sheetName: paramSheetName,
        row: param.row,
        col: param.col,
        rowCount: 1,
        colCount: 1
      };
      
      if (checkRangeOverlap(newRange, paramRange)) {
        message.warning(`This selection overlaps with existing parameter "${param.name}". Please select a different range.`);
        return;
      }
    }
    
    // Create cell info for modal
    const cellInfo = {
      address,
      row: currentSelection.row,
      col: currentSelection.col,
      rowCount: currentSelection.rowCount,
      colCount: currentSelection.colCount,
      hasFormula,
      value,
      isSingleCell: !isRange,
      detectedDataType: detectedType,
      suggestedName,
      suggestedTitle,
      format: cellFormat,
      dropdownItems: dropdownItems // Auto-detected dropdown items from SpreadJS
    };

    setSelectedCellInfo(cellInfo);
    setSuggestedParamName(suggestedName);
    setParameterType(type);
    setEditingParameter(null); // New parameter
    setShowParameterModal(true);
  }, [currentSelection, spreadInstance]);

  // Add area from selection
  const handleAddAreaFromSelection = useCallback(async () => {
    if (!currentSelection || !spreadInstance) {
      message.warning('Please select a range in the spreadsheet first');
      return;
    }

    if (currentSelection.rowCount === 1 && currentSelection.colCount === 1) {
      message.warning('Please select a range with multiple cells for an area');
      return;
    }

    const sheet = spreadInstance.getActiveSheet();
    let sheetName = '';
    
    try {
      sheetName = sheet?.name ? sheet.name() : sheet?.['name']?.() || 'Sheet1';
    } catch (error) {
      console.error('Error getting sheet name:', error);
      sheetName = 'Sheet1';
    }

    const newId = generateParameterId();
    // Convert selection to address string
    const colToLetter = (col: number) => {
      let letter = '';
      while (col >= 0) {
        letter = String.fromCharCode((col % 26) + 65) + letter;
        col = Math.floor(col / 26) - 1;
      }
      return letter;
    };
    
    const startCol = colToLetter(currentSelection.col);
    const startRow = currentSelection.row + 1;
    const endCol = colToLetter(currentSelection.col + currentSelection.colCount - 1);
    const endRow = currentSelection.row + currentSelection.rowCount;
    
    const rangeAddress = (currentSelection.rowCount === 1 && currentSelection.colCount === 1)
      ? `${startCol}${startRow}`
      : `${startCol}${startRow}:${endCol}${endRow}`;
    
    const address = sheetName !== 'Sheet1' ? `${sheetName}!${rangeAddress}` : rangeAddress;
    
    const newArea: AreaParameter = {
      id: newId,
      name: '',
      address: address,
      description: '',
      mode: 'editable',
      permissions: PERMISSION_PRESETS.valueOnly
    };

    setEditingArea(newArea);
    setShowAreaModal(true);
  }, [currentSelection, spreadInstance]);

  // Track spreadsheet initialization
  useEffect(() => {
    if (spreadInstance) {
      setSpreadsheetReady(true);
    }
  }, [spreadInstance]);

  // Track selection changes
  useEffect(() => {
    if (!spreadInstance || !spreadsheetReady) return;

    const handleSelectionChanged = (e: any, args: any) => {
      const sheet = spreadInstance.getActiveSheet();
      const selections = sheet?.getSelections();
      
      if (selections && selections.length > 0) {
        const sel = selections[selections.length - 1];
        let sheetName = '';
        
        try {
          sheetName = sheet?.name ? sheet.name() : sheet?.['name']?.() || 'Sheet1';
        } catch (error) {
          console.error('Error getting sheet name:', error);
          sheetName = 'Sheet1';
        }
        
        // Check if the selected cell has a formula
        let hasFormula = false;
        const isSingleCell = sel.rowCount === 1 && sel.colCount === 1;
        const isRange = !isSingleCell;
        
        if (isSingleCell) {
          try {
            // Try multiple methods to get formula
            let formula = null;
            
            // Method 1: getFormula
            if (sheet.getFormula) {
              formula = sheet.getFormula(sel.row, sel.col);
            }
            
            // Method 2: getCell().formula()
            if (!formula && sheet.getCell) {
              const cell = sheet.getCell(sel.row, sel.col);
              if (cell && cell.formula) {
                formula = cell.formula();
              }
            }
            
            hasFormula = formula ? true : false;
          } catch (e) {
            console.log('Could not check formula:', e);
          }
        }
        
        setCurrentSelection({
          row: sel.row,
          col: sel.col,
          rowCount: sel.rowCount,
          colCount: sel.colCount,
          sheetName: sheetName,
          isSingleCell,
          hasFormula,
          isRange
        });
      } else {
        setCurrentSelection(null);
      }
    };

    spreadInstance.bind(window.GC?.Spread?.Sheets?.Events?.SelectionChanged || 'SelectionChanged', handleSelectionChanged);

    return () => {
      spreadInstance.unbind(window.GC?.Spread?.Sheets?.Events?.SelectionChanged || 'SelectionChanged', handleSelectionChanged);
    };
  }, [spreadInstance, spreadsheetReady]);

  return (
    <div ref={containerRef} style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }}>
      {/* Scrollable content area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px',
        paddingTop: '6px',
        paddingBottom: buttonAreaHeight + 12,
        minHeight: 0
      }}>
        <Suspense fallback={null}>
          <ParametersSection
            inputs={inputs}
            outputs={outputs}
            areas={areas}
            isLoading={isLoading}
            hasInitialized={hasInitialized}
            isDemoMode={isDemoMode}
            panelWidth={panelWidth}
            onNavigateToParameter={navigateToParameter}
            onEditParameter={handleEditParameter}
            onDeleteParameter={handleDeleteParameter}
            onEditArea={handleEditArea}
            onRemoveArea={handleRemoveArea}
            onNavigateToArea={handleNavigateToArea}
            onShowHowItWorks={() => setShowHowItWorksModal(true)}
            onReorderInputs={handleReorderInputs}
            onReorderOutputs={handleReorderOutputs}
          />
        </Suspense>
      </div>

      {/* Fixed button at bottom */}
      <Suspense fallback={null}>
        <div ref={buttonAreaRef}>
          <AddParameterButton
            currentSelection={currentSelection}
            spreadsheetReady={spreadsheetReady}
            spreadInstance={spreadInstance}
            inputs={inputs}
            outputs={outputs}
            isCompact={panelWidth < COMPACT_LAYOUT_BREAKPOINT_PX}
            onAddFromSelection={handleAddParameterFromSelection}
            onAddAsEditableArea={handleAddAreaFromSelection}
            buttonRef={addButtonRef}
          />
        </div>
      </Suspense>

      {/* Modals */}
      <Suspense fallback={null}>
        {showParameterModal && (
          <ParameterModal
            open={showParameterModal}
            parameterType={parameterType}
            editingParameter={editingParameter}
            selectedCellInfo={selectedCellInfo}
            suggestedParamName={suggestedParamName}
            onClose={() => {
              setShowParameterModal(false);
              setEditingParameter(null);
              setSelectedCellInfo(null);
            }}
            onSubmit={(values) => {
              // Map dataType from form to type in parameter
              const { dataType, ...otherValues } = values;
              // Map "array" type to "string" for backend compatibility (ranges are handled as JSON strings)
              const mappedType = dataType === 'array' ? 'string' : dataType;
              const newParam = {
                // When editing, preserve all existing properties; when creating new, use selectedCellInfo
                ...(editingParameter || selectedCellInfo),
                ...otherValues,
                type: mappedType, // Map dataType to type
                id: editingParameter?.id || generateParameterId(),
                direction: parameterType
              };

              if (parameterType === 'input') {
                if (editingParameter) {
                  setInputs(prev => prev.map(p => {
                    // Check if this is a boolean parameter
                    const isBoolean = newParam.type === 'boolean' || newParam.dataType === 'boolean' ||
                                     p.type === 'boolean';

                    return p.id === newParam.id ? {
                    ...newParam,
                    // Use new format from selectedCellInfo if available, otherwise preserve existing format
                    ...(selectedCellInfo?.format?.isPercentage ? {
                      format: 'percentage' as const,
                      // Add AI examples to help AI understand decimal format
                      aiExamples: newParam.aiExamples && newParam.aiExamples.length > 0
                        ? newParam.aiExamples
                        : ['0.05 for 5%', '0.10 for 10%', '0.075 for 7.5%'],
                      // Auto-populate description with percentage conversion guidance if not already set
                      description: newParam.description && newParam.description.trim().length > 0
                        ? newParam.description
                        : `CRITICAL: This is a percentage parameter. User says "6%" but you MUST pass 0.06 as decimal. Convert: 5%→0.05, 6%→0.06, 7.5%→0.075. Never pass the whole number!`
                    } : p.format === 'percentage' ? {
                      // Preserve existing percentage format
                      format: 'percentage' as const,
                      aiExamples: p.aiExamples && p.aiExamples.length > 0
                        ? p.aiExamples
                        : ['0.05 for 5%', '0.10 for 10%', '0.075 for 7.5%'],
                      // Auto-populate description with percentage conversion guidance if not already set
                      description: newParam.description && newParam.description.trim().length > 0
                        ? newParam.description
                        : p.description && p.description.trim().length > 0
                          ? p.description
                          : `CRITICAL: This is a percentage parameter. User says "6%" but you MUST pass 0.06 as decimal. Convert: 5%→0.05, 6%→0.06, 7.5%→0.075. Never pass the whole number!`
                    } : isBoolean ? {
                      // Add AI examples for boolean values
                      aiExamples: newParam.aiExamples && newParam.aiExamples.length > 0
                        ? newParam.aiExamples
                        : p.aiExamples && p.aiExamples.length > 0
                          ? p.aiExamples
                          : ['true', 'false', 'yes', 'no', '1', '0'],
                      // Auto-populate description with boolean conversion guidance if not already set
                      description: newParam.description && newParam.description.trim().length > 0
                        ? newParam.description
                        : p.description && p.description.trim().length > 0
                          ? p.description
                          : `Accept multiple formats: yes/no, true/false, 1/0, ja/nein. Pass actual boolean value (true/false), NOT string.`
                    } : {})
                  } : p
                }));
                } else {
                  // Check if this is a boolean parameter
                  const isBoolean = newParam.type === 'boolean' || newParam.dataType === 'boolean';

                  setInputs(prev => [...prev, {
                    ...newParam,
                    sheetName: selectedCellInfo.sheetName || 'Sheet1',
                    rowCount: selectedCellInfo.rowCount,
                    colCount: selectedCellInfo.colCount,
                    ...(selectedCellInfo?.format?.isPercentage && {
                      format: 'percentage' as const,
                      // Add AI examples to help AI understand decimal format
                      aiExamples: newParam.aiExamples && newParam.aiExamples.length > 0
                        ? newParam.aiExamples
                        : ['0.05 for 5%', '0.10 for 10%', '0.075 for 7.5%'],
                      // Auto-populate description with percentage conversion guidance if not already set
                      description: newParam.description && newParam.description.trim().length > 0
                        ? newParam.description
                        : `CRITICAL: This is a percentage parameter. User says "6%" but you MUST pass 0.06 as decimal. Convert: 5%→0.05, 6%→0.06, 7.5%→0.075. Never pass the whole number!`
                    }),
                    ...(isBoolean && !selectedCellInfo?.format?.isPercentage && {
                      // Add AI examples for boolean values
                      aiExamples: newParam.aiExamples && newParam.aiExamples.length > 0
                        ? newParam.aiExamples
                        : ['true', 'false', 'yes', 'no', '1', '0'],
                      // Auto-populate description with boolean conversion guidance if not already set
                      description: newParam.description && newParam.description.trim().length > 0
                        ? newParam.description
                        : `Accept multiple formats: yes/no, true/false, 1/0, ja/nein. Pass actual boolean value (true/false), NOT string.`
                    })
                  }]);
                }
              } else {
                if (editingParameter) {
                  setOutputs(prev => prev.map(p => p.id === newParam.id ? {
                    ...newParam,
                    // Store only the simple formatString (user can edit this)
                    ...(newParam.formatString && { formatString: newParam.formatString })
                  } : p));
                } else {
                  setOutputs(prev => [...prev, {
                    ...newParam,
                    sheetName: selectedCellInfo.sheetName || 'Sheet1',
                    rowCount: selectedCellInfo.rowCount,
                    colCount: selectedCellInfo.colCount,
                    // Store only the simple formatString (user can edit this)
                    ...(newParam.formatString && { formatString: newParam.formatString })
                  }]);
                }
              }
              
              setShowParameterModal(false);
              setEditingParameter(null);
              setSelectedCellInfo(null);
            }}
          />
        )}

        {showAreaModal && (
          <AreaModal
            open={showAreaModal}
            editingArea={editingArea}
            editingAreaIndex={areas.findIndex(a => a.id === editingArea?.id)}
            onClose={() => {
              setShowAreaModal(false);
              setEditingArea(null);
            }}
            onSave={handleAreaSave}
            onAreaChange={(area) => {
              // Update area in state as user types
              setEditingArea(area);
            }}
          />
        )}

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

export default ParametersPanel;