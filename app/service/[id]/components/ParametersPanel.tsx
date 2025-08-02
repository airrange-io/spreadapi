'use client';

import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { App, Skeleton } from 'antd';
import { observer } from 'mobx-react-lite';
import { generateParameterId } from '@/lib/generateParameterId';
import * as GC from '@mescius/spread-sheets';

// Import types from ParametersSection
import type { InputDefinition, OutputDefinition, AreaParameter, AreaPermissions } from './ParametersSection';

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
  spreadInstance, serviceId, onConfigChange, initialConfig, isLoading, isDemoMode
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
  const handleEditParameter = useCallback((param: any) => {
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
      detectedDataType: param.type,
      suggestedName: param.name,
      suggestedTitle: param.title || param.name
    };
    
    setSelectedCellInfo(cellInfo);
    setSuggestedParamName(param.name);
    setParameterType(param.direction || (param.type === 'input' ? 'input' : 'output'));
    setEditingParameter(param);
    setShowParameterModal(true);
  }, []);

  // Handle area editing
  const handleEditArea = useCallback((area: any) => {
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
        
        sheet.getSelections().clear();
        sheet.addSelection(param.row, param.col, param.rowCount, param.colCount);
      }
    } finally {
      spreadInstance.resumePaint();
    }
  }, [spreadInstance]);

  // Navigate to area
  const handleNavigateToArea = useCallback((area: AreaParameter) => {
    if (!spreadInstance || !area.range) return;

    try {
      spreadInstance.suspendPaint();
      
      const targetSheet = spreadInstance.getSheetFromName(area.range.sheetName);
      if (targetSheet) {
        spreadInstance.setActiveSheet(targetSheet);
      }

      const sheet = spreadInstance.getActiveSheet();
      if (sheet) {
        sheet.setActiveCell(area.range.row, area.range.col);
        sheet.showCell(area.range.row, area.range.col, 3, 3);
        
        sheet.getSelections().clear();
        sheet.addSelection(area.range.row, area.range.col, area.range.rowCount, area.range.colCount);
      }
    } finally {
      spreadInstance.resumePaint();
    }
  }, [spreadInstance]);

  // Delete parameter
  const handleDeleteParameter = useCallback((param: any) => {
    if (param.type === 'input') {
      setInputs(prev => prev.filter(p => p.id !== param.id));
    } else {
      setOutputs(prev => prev.filter(p => p.id !== param.id));
    }
  }, []);

  // Remove area
  const handleRemoveArea = useCallback((areaId: string) => {
    setAreas(prev => prev.filter(a => a.id !== areaId));
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
    setAreas(prev => prev.map(a => a.id === updatedArea.id ? updatedArea : a));
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
      
      // Detect cell format (for percentage detection)
      if (currentSelection.rowCount === 1 && currentSelection.colCount === 1) {
        try {
          const cell = sheet.getCell(currentSelection.row, currentSelection.col);
          const formatter = cell.formatter();
          const style = sheet.getStyle(currentSelection.row, currentSelection.col);
          
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
        } catch (e) {
          console.log('Could not get cell format');
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
      const paramRange = {
        sheetName: param.sheetName || sheetName,
        row: param.row,
        col: param.col,
        rowCount: param.rowCount || 1,
        colCount: param.colCount || 1
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
      format: cellFormat
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
    const newArea: AreaParameter = {
      id: newId,
      name: '',
      description: '',
      permissions: PERMISSION_PRESETS.valueOnly,
      range: {
        sheetName: sheetName,
        row: currentSelection.row,
        col: currentSelection.col,
        rowCount: currentSelection.rowCount,
        colCount: currentSelection.colCount
      }
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
            isCompact={panelWidth < 380}
            onAddFromSelection={handleAddParameterFromSelection}
            onAddAsEditableArea={handleAddAreaFromSelection}
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
              const newParam = {
                ...selectedCellInfo,
                ...values,
                id: editingParameter?.id || generateParameterId(),
                direction: parameterType
              };
              
              if (parameterType === 'input') {
                if (editingParameter) {
                  setInputs(prev => prev.map(p => p.id === newParam.id ? {
                    ...newParam,
                    alias: newParam.name.toLowerCase()
                      .replace(/[\s-]+/g, '')
                      .replace(/[^a-z0-9]/g, ''),
                    ...(selectedCellInfo?.format?.isPercentage && {
                      format: 'percentage' as const,
                      percentageDecimals: selectedCellInfo.format.percentageDecimals
                    })
                  } : p));
                } else {
                  setInputs(prev => [...prev, {
                    ...newParam,
                    alias: newParam.name.toLowerCase()
                      .replace(/[\s-]+/g, '')
                      .replace(/[^a-z0-9]/g, ''),
                    sheetName: selectedCellInfo.sheetName || 'Sheet1',
                    rowCount: selectedCellInfo.rowCount,
                    colCount: selectedCellInfo.colCount,
                    ...(selectedCellInfo?.format?.isPercentage && {
                      format: 'percentage' as const,
                      percentageDecimals: selectedCellInfo.format.percentageDecimals
                    })
                  }]);
                }
              } else {
                if (editingParameter) {
                  setOutputs(prev => prev.map(p => p.id === newParam.id ? {
                    ...newParam,
                    alias: newParam.name.toLowerCase()
                      .replace(/[\s-]+/g, '')
                      .replace(/[^a-z0-9]/g, '')
                  } : p));
                } else {
                  setOutputs(prev => [...prev, {
                    ...newParam,
                    alias: newParam.name.toLowerCase()
                      .replace(/[\s-]+/g, '')
                      .replace(/[^a-z0-9]/g, ''),
                    sheetName: selectedCellInfo.sheetName || 'Sheet1',
                    rowCount: selectedCellInfo.rowCount,
                    colCount: selectedCellInfo.colCount
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