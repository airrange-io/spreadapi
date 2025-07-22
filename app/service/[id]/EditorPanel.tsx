'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Statistic, Typography, Space, Button, Input, Upload, Modal, Form, Select, Checkbox, App, Tooltip } from 'antd';
import { FileTextOutlined, SwapOutlined, UploadOutlined, PlusOutlined, DeleteOutlined, EditOutlined, KeyOutlined, InfoCircleOutlined, SafetyOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { generateParameterId } from '@/lib/generateParameterId';
import TokenManagement from './TokenManagement';
import ApiEndpointPreview from './ApiEndpointPreview';

const { Title, Text } = Typography;

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

interface EditorPanelProps {
  spreadInstance: any;
  serviceId?: string;
  onConfigChange?: (config: any) => void;
  onImportExcel?: (file: File) => void;
  serviceStatus?: any;
  initialConfig?: {
    name: string;
    description: string;
    inputs: InputDefinition[];
    outputs: OutputDefinition[];
    enableCaching?: boolean;
    requireToken?: boolean;
  };
}

const EditorPanel: React.FC<EditorPanelProps> = observer(({
  spreadInstance, serviceId, onConfigChange, onImportExcel, serviceStatus, initialConfig
}) => {
  const { message } = App.useApp();
  const buttonAreaRef = useRef<HTMLDivElement>(null);
  const [buttonAreaHeight, setButtonAreaHeight] = useState(0);
  const [activeCard, setActiveCard] = useState<ActiveCard>('parameters');
  const [apiName, setApiName] = useState(initialConfig?.name || '');
  const [apiDescription, setApiDescription] = useState(initialConfig?.description || '');
  const [inputs, setInputs] = useState<InputDefinition[]>(initialConfig?.inputs || []);
  const [outputs, setOutputs] = useState<OutputDefinition[]>(initialConfig?.outputs || []);
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
  const [tokenCount, setTokenCount] = useState<number>(0);
  
  // AI metadata fields
  const [aiDescription, setAiDescription] = useState<string>(initialConfig?.aiDescription || '');
  const [aiUsageExamples, setAiUsageExamples] = useState<string[]>(initialConfig?.aiUsageExamples || []);
  const [aiTags, setAiTags] = useState<string[]>(initialConfig?.aiTags || []);
  const [category, setCategory] = useState<string>(initialConfig?.category || '');

  // Handle card activation
  const handleCardClick = useCallback((cardType: ActiveCard) => {
    if (activeCard === cardType) {
      setActiveCard(null); // Deactivate if already active
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
  }, [apiName, apiDescription, inputs, outputs, enableCaching, requireToken, aiDescription, aiUsageExamples, aiTags, category]);

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
  }, [spreadInstance, currentSelection]);

  // Monitor selection changes (always active since button is always visible)
  useEffect(() => {
    if (spreadInstance) {
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
  }, [spreadInstance]);

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

  // Determine button text and parameter type based on selection
  const getAddButtonInfo = () => {
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

    if (isSingleCell) {
      // Check if cell has formula
      hasFormula = sheet.hasFormula(selection.row, selection.col);
      const cell = sheet.getCell(selection.row, selection.col);
      cellValue = cell.value();
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
      suggestedTitle
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
        ...(values.max !== undefined && values.max !== '' && { max: parseFloat(values.max) })
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
      backgroundColor: activeCard === cardType ?  '#E2E3E1' : '#f2f2f2',
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
        enableCaching,
        requireToken: value,
        aiDescription,
        aiUsageExamples,
        aiTags,
        category
      });
    }
  }, [apiName, apiDescription, inputs, outputs, enableCaching, aiDescription, aiUsageExamples, aiTags, category, onConfigChange]);

  const handleTokenCountChange = useCallback((count: number) => {
    setTokenCount(count);
  }, []);

  // Get statistic value style based on active state
  const getStatisticValueStyle = (cardType: ActiveCard, originalColor: string) => {
    if (activeCard === cardType) {
      return { color: originalColor, fontSize: 18 };
    }
    return { color: '#2B2A35', fontSize: 18 };
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
              title="Parameters"
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
              title="API Tokens"
              value={tokenCount}
              prefix={<SafetyOutlined style={{ color: '#858585' }} />}
              valueStyle={getStatisticValueStyle('tokens', '#2B2A35')}
              // suffix={
              //   <span style={{ fontSize: '12px', color: '#999', fontWeight: 'normal' }}>
              //     {requireToken ? 'Required' : 'Optional'}
              //   </span>
              // }
            />
          </Card>
        </div>
      </div>

      {/* Scrollable content area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '0 12px',
        paddingBottom: 12, //buttonAreaHeight + 12,
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
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%', 
                height: '100%',
                marginTop: '8px',
                gap: '12px'
              }}>
                <ApiEndpointPreview
                  serviceId={serviceId || ''}
                  isPublished={serviceStatus?.published || false}
                  requireToken={requireToken}
                />
                <div style={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 14, 
                  backgroundColor: "#f2f2f2", 
                  border: `1px solid #ffffff`, 
                  borderRadius: 8,
                  minHeight: 0,
                  overflow: 'auto'
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

                  <div style={{ marginTop: '16px' }}>
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
                  </div>

                  <div style={{ marginTop: '16px' }}>
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
                    {/* <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    Supports .xlsx and .xls formats
                  </div> */}
                  </div>
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
                minHeight: 0
              }}>
                <div style={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 14, 
                  backgroundColor: "#f2f2f2", 
                  // border: `1px solid #ffffff`, 
                  borderRadius: 8,
                  overflow: 'auto'
                }}>
                  <div>
                    <div style={{ marginBottom: '8px', color: '#898989' }}><strong>Input Parameters</strong></div>
                    <div style={{
                      fontSize: '12px'
                    }}>
                      {inputs.length === 0 ? (
                        <div style={{ color: '#999' }}>No input parameters defined yet</div>
                      ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {inputs.map((input, index) => (
                            <div key={input.id} style={{
                              padding: '8px',
                              background: 'white',
                              borderRadius: '4px',
                              border: '1px solid #e8e8e8'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <strong>{input.name}</strong> ({input.type})
                                  {input.title && input.title !== input.name && (
                                    <span style={{ marginLeft: '8px', color: '#888', fontSize: '11px' }}>({input.title})</span>
                                  )}
                                  {input.address && <span style={{ marginLeft: '8px', color: '#666' }}>→ {input.address}</span>}
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
                                </div>
                                <Space size="small">
                                  <Button
                                    size="small"
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditParameter('input', input)}
                                  />
                                  <Button
                                    size="small"
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteParameter('input', input.id)}
                                  />
                                </Space>
                              </div>
                            </div>
                          ))}
                        </Space>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ marginTop: '16px', marginBottom: '8px', color: '#898989' }}><strong>Output Parameters</strong></div>
                    <div style={{
                      fontSize: '12px'
                    }}>
                      {outputs.length === 0 ? (
                        <div style={{ color: '#999' }}>No output parameters defined yet</div>
                      ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {outputs.map((output, index) => (
                            <div key={output.id} style={{
                              padding: '8px',
                              background: 'white',
                              borderRadius: '4px',
                              border: '1px solid #e8e8e8'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <strong>{output.name}</strong> ({output.type})
                                  {output.title && output.title !== output.name && (
                                    <span style={{ marginLeft: '8px', color: '#888', fontSize: '11px' }}>({output.title})</span>
                                  )}
                                  {output.address && <span style={{ marginLeft: '8px', color: '#666' }}>← {output.address}</span>}
                                  {output.description && (
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                      {output.description}
                                    </div>
                                  )}
                                </div>
                                <Space size="small">
                                  <Button
                                    size="small"
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditParameter('output', output)}
                                  />
                                  <Button
                                    size="small"
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteParameter('output', output.id)}
                                  />
                                </Space>
                              </div>
                            </div>
                          ))}
                        </Space>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                    <strong>How it works:</strong><br />
                    • Input parameters are values users provide when calling your service<br />
                    • These values are placed into the specified spreadsheet cells<br />
                    • Output parameters are calculated results read from spreadsheet cells<br />
                    • The service returns these output values as the API response
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
                <TokenManagement
                  serviceId={serviceId || ''}
                  requireToken={requireToken}
                  onRequireTokenChange={handleRequireTokenChange}
                  onTokenCountChange={handleTokenCountChange}
                />
              </div>
            )}

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          </div>
        )}
      </div>

      {/* Fixed button at bottom */}
      <div
        ref={buttonAreaRef}
        style={{
          padding: '12px',
          paddingTop: 0,
          background: 'white',
          // borderTop: '1px solid #f0f0f0',
          // boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          flex: '0 0 auto'
        }}>
        {(() => {
          const buttonInfo = getAddButtonInfo();
          return (
            <>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ width: '100%', height: 48 }}
                onClick={handleAddFromSelection}
                disabled={buttonInfo.disabled || !spreadInstance}
              >
                {buttonInfo.text}
              </Button>
              {!spreadInstance && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
                  Waiting for spreadsheet to load...
                </div>
              )}
              {spreadInstance && !currentSelection && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
                  Select a cell or range in the spreadsheet
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Add/Edit Parameter Modal */}
      <Modal
        title={`${editingParameter ? 'Edit' : 'Add'} ${parameterType === 'input' ? 'Input' : 'Output'} Parameter`}
        open={showAddParameterModal}
        onCancel={() => {
          setShowAddParameterModal(false);
          setEditingParameter(null);
        }}
        footer={null}
      >
        <Form
          key={`${selectedCellInfo?.address}-${Date.now()}-${editingParameter?.id || ''}`} // Force form to reinitialize
          layout="vertical"
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
          <Form.Item
            label="Parameter Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a parameter name' }]}
          >
            <Input placeholder="e.g., amount, rate, result" />
          </Form.Item>

          <Form.Item
            label="Original Title"
            name="title"
            help="The original title from the spreadsheet (optional)"
          >
            <Input placeholder="e.g., Interest Rate, Total Amount" />
          </Form.Item>

          <Form.Item
            label="Data Type"
            name="dataType"
          >
            <Select>
              <Select.Option value="string">String</Select.Option>
              <Select.Option value="number">Number</Select.Option>
              <Select.Option value="boolean">Boolean</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Description (for AI assistants)"
            name="description"
            help="This helps AI assistants understand what this parameter represents and how to use it"
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
                name="mandatory"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>Mandatory parameter</Checkbox>
              </Form.Item>

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
              {!selectedCellInfo?.isSingleCell && (
                <div style={{ marginTop: '4px', color: '#1890ff' }}>
                  Range: {selectedCellInfo?.rowCount} rows × {selectedCellInfo?.colCount} columns
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
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

    </div>
  );
});

export default EditorPanel;