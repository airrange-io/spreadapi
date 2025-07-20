'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Statistic, Typography, Space, Button, Input, Tag, Upload, message, Modal, Form, Select, Checkbox } from 'antd';
import { FileTextOutlined, CloseOutlined, BarChartOutlined, NodeIndexOutlined, UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';

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

type ActiveCard = 'detail' | 'parameters' | 'endpoint' | null;

interface InputDefinition {
  id: string;
  address: string; // Full address like "Savings!D4"
  name: string;
  alias: string; // URL-safe name
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
  initialConfig?: {
    name: string;
    description: string;
    inputs: InputDefinition[];
    outputs: OutputDefinition[];
  };
}

const EditorPanel: React.FC<EditorPanelProps> = observer(({
  spreadInstance, serviceId, onConfigChange, onImportExcel, initialConfig
}) => {
  const [activeCard, setActiveCard] = useState<ActiveCard>('detail');
  const [apiName, setApiName] = useState(initialConfig?.name || '');
  const [apiDescription, setApiDescription] = useState(initialConfig?.description || '');
  const [inputs, setInputs] = useState<InputDefinition[]>(initialConfig?.inputs || []);
  const [outputs, setOutputs] = useState<OutputDefinition[]>(initialConfig?.outputs || []);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showAddParameterModal, setShowAddParameterModal] = useState(false);
  const [parameterType, setParameterType] = useState<'input' | 'output'>('input');
  const [selectedCellInfo, setSelectedCellInfo] = useState<any>(null);
  const [currentSelection, setCurrentSelection] = useState<any>(null);

  // Handle card activation
  const handleCardClick = (cardType: ActiveCard) => {
    if (activeCard === cardType) {
      setActiveCard(null); // Deactivate if already active
    } else {
      setActiveCard(cardType);
    }
  };

  // Notify parent of changes
  useEffect(() => {
    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      if (onConfigChange) {
        onConfigChange({
          name: apiName,
          description: apiDescription,
          inputs,
          outputs
        });
      }
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [apiName, apiDescription, inputs, outputs]);

  // Monitor selection changes
  useEffect(() => {
    if (spreadInstance && activeCard === 'parameters') {
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
              
              setCurrentSelection({
                row: selection.row,
                col: selection.col,
                rowCount: selection.rowCount,
                colCount: selection.colCount,
                isSingleCell,
                hasFormula,
                isRange: !isSingleCell
              });
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
  }, [spreadInstance, activeCard]);

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
    
    if (isRange) {
      const endCellRef = getCellAddress(row + rowCount - 1, col + colCount - 1);
      return { 
        text: `Add ${cellRef}:${endCellRef} as Output`, 
        type: 'output' as const,
        disabled: false 
      };
    } else if (hasFormula) {
      return { 
        text: `Add ${cellRef} as Output`, 
        type: 'output' as const,
        disabled: false 
      };
    } else {
      return { 
        text: `Add ${cellRef} as Input`, 
        type: 'input' as const,
        disabled: false 
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
    
    // Try to guess parameter name from adjacent cells
    let suggestedName = '';
    try {
      // Check cell to the left (same row, col-1)
      if (selection.col > 0) {
        const leftCell = sheet.getCell(selection.row, selection.col - 1);
        const leftValue = leftCell.value();
        if (leftValue && typeof leftValue === 'string' && leftValue.trim()) {
          suggestedName = leftValue.trim();
        }
      }
      
      // If no name found on left, check cell above (row-1, same col)
      if (!suggestedName && selection.row > 0) {
        const aboveCell = sheet.getCell(selection.row - 1, selection.col);
        const aboveValue = aboveCell.value();
        if (aboveValue && typeof aboveValue === 'string' && aboveValue.trim()) {
          suggestedName = aboveValue.trim();
        }
      }
      
      // Clean the suggested name to be URL parameter safe
      if (suggestedName) {
        // Convert to lowercase, replace spaces with underscores
        suggestedName = suggestedName.toLowerCase()
          // Replace spaces and dashes with underscores
          .replace(/[\s-]+/g, '_')
          // Remove all non-alphanumeric characters except underscores
          .replace(/[^a-z0-9_]/g, '')
          // Remove leading/trailing underscores
          .replace(/^_+|_+$/g, '')
          // Ensure it doesn't start with a number
          .replace(/^(\d)/, '_$1');
        
        // If the name is now empty or just underscores, clear it
        if (!suggestedName || suggestedName.match(/^_*$/)) {
          suggestedName = '';
        }
      }
    } catch (e) {
      console.error('Error getting adjacent cell values:', e);
    }
    
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
      suggestedName
    });
    
    setParameterType(suggestedType);
    setShowAddParameterModal(true);
  };

  // Handle modal form submission
  const handleAddParameter = (values: any) => {
    // Generate a unique ID
    const generateId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
      let id = '';
      for (let i = 0; i < 21; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    };

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
        id: generateId(),
        address: fullAddress,
        name: values.name,
        alias: alias || values.name.toLowerCase(),
        row: selectedCellInfo.row,
        col: selectedCellInfo.col,
        type: values.dataType || 'string',
        value: selectedCellInfo.value,
        direction: 'input',
        mandatory: values.mandatory !== false,
        ...(values.description && { description: values.description })
      };
      setInputs([...inputs, newParam]);
    } else {
      const newParam: OutputDefinition = {
        id: generateId(),
        address: fullAddress,
        name: values.name,
        alias: alias || values.name.toLowerCase(),
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


  // Get card styling based on active state
  const getCardStyle = (cardType: ActiveCard) => {
    const baseStyle = {
      flex: 1,
      cursor: 'pointer',
      borderRadius: '8px',
      transition: 'all 0.2s'
    };

    if (activeCard === cardType) {
      return {
        ...baseStyle,
        borderColor: '#8A64C0',
        boxShadow: '0 0 0 1px rgba(24, 144, 255, 0.2)',
        backgroundColor: '#fafafa'
      };
    }

    return baseStyle;
  };

  // Get card body style for consistent padding
  const getCardBodyStyle = () => ({
    padding: '6px 12px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
  });

  // Get statistic value style based on active state
  const getStatisticValueStyle = (cardType: ActiveCard, originalColor: string) => {
    if (activeCard === cardType) {
      return { color: originalColor, fontSize: 18 };
    }
    return { color: '#2B2A35', fontSize: 18 };
  };

  return (
    <div style={{
      padding: '12px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '16px'
    }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* First Row: Records, Analytics, Workflows, Columns */}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>

          <Card
            size="small"
            style={{
              ...getCardStyle('detail'),
              //flex: '0 0 calc(25% - 6px)' 
              flex: '0 0 calc(33.33% - 5.33px)',
            }}
            styles={{ body: getCardBodyStyle() }}
            hoverable
            onClick={() => handleCardClick('detail')}
          >
            <Statistic
              title="Service"
              value={'---'}
              prefix={<FileTextOutlined />}
              valueStyle={getStatisticValueStyle('detail', '#4F2D7F')}
            />
          </Card>

          <Card
            size="small"
            style={{
              ...getCardStyle('parameters'),
              //flex: '0 0 calc(25% - 6px)' 
              flex: '0 0 calc(33.33% - 5.33px)',
            }}
            styles={{ body: getCardBodyStyle() }}
            hoverable
            onClick={() => handleCardClick('parameters')}
          >
            <Statistic
              title="Parameters"
              value={"---"}
              prefix={<NodeIndexOutlined />}
              valueStyle={getStatisticValueStyle('parameters', '#4F2D7F')}
            />
          </Card>

          <Card
            size="small"
            style={{
              ...getCardStyle('endpoint'),
              //flex: '0 0 calc(25% - 6px)' 
              flex: '0 0 calc(33.33% - 5.33px)',
            }}
            styles={{ body: getCardBodyStyle() }}
            hoverable
            onClick={() => handleCardClick('endpoint')}
          >
            <Statistic
              title="Endpoint"
              value={"---"}
              prefix={<BarChartOutlined />}
              valueStyle={getStatisticValueStyle('endpoint', '#4F2D7F')}
            />
          </Card>

        </div>

        {/* Active Card Detail Areas or Default AI Area */}
        {activeCard ? (
          <div style={{
            marginTop: '12px',
            padding: '0px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            {/* Header with close button and optional actions */}
            {/* <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <Space size={4}>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setActiveCard(null)}
                />
              </Space>
            </div> */}

            {/* Columns Detail */}
            {activeCard === 'detail' && (
              <Space direction="vertical" style={{ width: '100%' }} >
                <div>
                  <div style={{ marginBottom: '8px' }}><strong>Service Name</strong></div>
                  <Input
                    placeholder="Enter service name"
                    value={apiName}
                    onChange={(e) => setApiName(e.target.value)}
                  />
                </div>

                <div>
                  <div style={{ marginBottom: '8px' }}><strong>Description</strong></div>
                  <Input.TextArea
                    placeholder="Describe what this API does"
                    value={apiDescription}
                    onChange={(e) => setApiDescription(e.target.value)}
                    rows={4} />
                </div>

                <div>
                  <div style={{ marginBottom: '8px' }}><strong>Status</strong></div>
                  <Tag color="orange">Draft</Tag>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <div style={{ marginBottom: '8px' }}><strong>Import Data</strong></div>
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
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    Supports .xlsx and .xls formats
                  </div>
                </div>
              </Space>
            )}

            {/* Parameters Detail */}
            {activeCard === 'parameters' && (
              <Space direction="vertical" style={{ width: '100%' }}>
                {(() => {
                  const buttonInfo = getAddButtonInfo();
                  return (
                    <div style={{ marginBottom: '16px' }}>
                      <Button 
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ width: '100%' }}
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
                    </div>
                  );
                })()}

                <div>
                  <div style={{ marginBottom: '8px' }}><strong>Input Parameters</strong></div>
                  <div style={{ 
                    padding: '12px', 
                    background: '#f5f5f5', 
                    borderRadius: '4px',
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
                                {input.address && <span style={{ marginLeft: '8px', color: '#666' }}>→ {input.address}</span>}
                              </div>
                              <Button 
                                size="small" 
                                type="text" 
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteParameter('input', input.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </Space>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: '8px' }}><strong>Output Parameters</strong></div>
                  <div style={{ 
                    padding: '12px', 
                    background: '#f5f5f5', 
                    borderRadius: '4px',
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
                                {output.address && <span style={{ marginLeft: '8px', color: '#666' }}>← {output.address}</span>}
                              </div>
                              <Button 
                                size="small" 
                                type="text" 
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteParameter('output', output.id)}
                              />
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
              </Space>
            )}

            {/* Endpoint Detail */}
            {activeCard === 'endpoint' && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <div style={{ marginBottom: '8px' }}><strong>Service Endpoint</strong></div>
                  <Input
                    value={`/api/getresults?api=${serviceId || '{serviceId}'}${inputs.map(i => `&${i.alias}={value}`).join('')}`}
                    disabled
                    addonBefore="GET"
                  />
                  {inputs.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Replace {inputs.map((i, idx) => <span key={i.id}>{idx > 0 && ', '}<code>{`{${i.alias}}`}</code></span>)} with actual values
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <div style={{ marginBottom: '8px' }}><strong>Example Usage</strong></div>
                  <Input.TextArea
                    value={inputs.length > 0 
                      ? `GET /api/getresults?api=${serviceId || '{serviceId}'}${inputs.map(i => `&${i.alias}=${i.value || '1000'}`).join('')}`
                      : `GET /api/getresults?api=${serviceId || '{serviceId}'}`
                    }
                    disabled
                    rows={2}
                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                  />
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <div style={{ marginBottom: '8px' }}><strong>Response Format</strong></div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {outputs.length > 0 ? (
                      <>
                        The API will return the following outputs:<br />
                        {outputs.map(o => (
                          <div key={o.id}>• <code>{o.alias}</code> - {o.name}</div>
                        ))}
                      </>
                    ) : (
                      'No outputs defined yet'
                    )}
                  </div>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <div style={{ marginBottom: '8px' }}><strong>Optional Parameters</strong></div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    • <code>token</code> - API token for authentication<br />
                    • <code>nocache=true</code> - Bypass result caching
                  </div>
                </div>
              </Space>
            )}

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* <AIDetailAreaNew
              messages={aiMessages || []}
              isLoading={isAILoading}
              onSendMessage={onAISendMessage || (() => {})}
              onClearMessages={onAIClearMessages || (() => {})}
              onConfigClick={() => setShowAIConfigModal(true)}
              data={data}
              schema={schema}
              allColumns={allColumns}
              hasConfig={!!aiConfig}
              defaultPrompts={typeSpecificPrompts}
              userId={userId}
            /> */}
          </div>
        )}

      </div>

      {/* Add Parameter Modal */}
      <Modal
        title={`Add ${parameterType === 'input' ? 'Input' : 'Output'} Parameter`}
        open={showAddParameterModal}
        onCancel={() => setShowAddParameterModal(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleAddParameter}
          initialValues={{
            name: selectedCellInfo?.suggestedName || '',
            dataType: selectedCellInfo?.detectedDataType || 'string'
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
            label="Description"
            name="description"
          >
            <Input.TextArea rows={2} placeholder="Optional description" />
          </Form.Item>

          {parameterType === 'input' && (
            <Form.Item
              name="mandatory"
              valuePropName="checked"
              initialValue={true}
            >
              <Checkbox>Mandatory parameter</Checkbox>
            </Form.Item>
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
                Add Parameter
              </Button>
              <Button onClick={() => setShowAddParameterModal(false)}>
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