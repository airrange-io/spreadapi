'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Alert, Checkbox } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface InputDefinition {
  id: string;
  address: string;
  name: string;
  alias: string;
  title?: string;
  row: number;
  col: number;
  rowCount?: number;
  colCount?: number;
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
  address: string;
  name: string;
  alias: string;
  title?: string;
  row: number;
  col: number;
  rowCount?: number;
  colCount?: number;
  type: 'number' | 'string' | 'boolean';
  value?: any;
  direction: 'output';
  description?: string;
}

interface SelectedCellInfo {
  address: string;
  row: number;
  col: number;
  rowCount: number;
  colCount: number;
  hasFormula: boolean;
  value: any;
  isSingleCell: boolean;
  detectedDataType: string;
  suggestedName: string;
  suggestedTitle: string;
  format?: {
    isPercentage: boolean;
    percentageDecimals: number;
  };
}

interface ParameterModalProps {
  open: boolean;
  parameterType: 'input' | 'output';
  editingParameter: InputDefinition | OutputDefinition | null;
  selectedCellInfo: SelectedCellInfo | null;
  suggestedParamName: string;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

// Helper function to parse cell address (e.g., "Sheet1!A1" or "Sheet1!A1:B10")
const parseAddress = (address: string): { sheet: string; startCell: string; endCell?: string; isValid: boolean } => {
  if (!address) return { sheet: '', startCell: '', isValid: false };
  
  // Split by sheet separator
  const parts = address.split('!');
  if (parts.length !== 2) return { sheet: '', startCell: '', isValid: false };
  
  const sheet = parts[0];
  const cellPart = parts[1];
  
  // Check if it's a range
  if (cellPart.includes(':')) {
    const rangeParts = cellPart.split(':');
    if (rangeParts.length !== 2) return { sheet, startCell: '', isValid: false };
    return { sheet, startCell: rangeParts[0], endCell: rangeParts[1], isValid: true };
  }
  
  return { sheet, startCell: cellPart, isValid: true };
};

// Helper function to convert column letters to column index (A=0, B=1, etc.)
const columnLettersToIndex = (letters: string): number => {
  let result = 0;
  for (let i = 0; i < letters.length; i++) {
    result = result * 26 + (letters.charCodeAt(i) - 64);
  }
  return result - 1;
};

// Helper function to convert column index to letters
const columnIndexToLetters = (index: number): string => {
  let result = '';
  let temp = index;
  while (temp >= 0) {
    result = String.fromCharCode(65 + (temp % 26)) + result;
    temp = Math.floor(temp / 26) - 1;
  }
  return result;
};

// Helper function to parse a cell reference (e.g., "A1") to row and column
const parseCellReference = (cellRef: string): { row: number; col: number; isValid: boolean } => {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { row: -1, col: -1, isValid: false };
  
  const col = columnLettersToIndex(match[1]);
  const row = parseInt(match[2]) - 1; // Convert to 0-based
  
  return { row, col, isValid: row >= 0 && col >= 0 };
};

// Helper function to validate and normalize address
const validateAndNormalizeAddress = (address: string): { 
  normalized: string; 
  isValid: boolean; 
  error?: string;
  row?: number;
  col?: number;
  rowCount?: number;
  colCount?: number;
} => {
  const parsed = parseAddress(address);
  if (!parsed.isValid) {
    return { normalized: address, isValid: false, error: 'Invalid address format. Use Sheet!Cell (e.g., Sheet1!A1)' };
  }
  
  const startCell = parseCellReference(parsed.startCell);
  if (!startCell.isValid) {
    return { normalized: address, isValid: false, error: 'Invalid cell reference' };
  }
  
  if (parsed.endCell) {
    const endCell = parseCellReference(parsed.endCell);
    if (!endCell.isValid) {
      return { normalized: address, isValid: false, error: 'Invalid end cell in range' };
    }
    
    // Normalize range (ensure start is before end)
    const minRow = Math.min(startCell.row, endCell.row);
    const maxRow = Math.max(startCell.row, endCell.row);
    const minCol = Math.min(startCell.col, endCell.col);
    const maxCol = Math.max(startCell.col, endCell.col);
    
    const normalizedStart = `${columnIndexToLetters(minCol)}${minRow + 1}`;
    const normalizedEnd = `${columnIndexToLetters(maxCol)}${maxRow + 1}`;
    
    return {
      normalized: `${parsed.sheet}!${normalizedStart}:${normalizedEnd}`,
      isValid: true,
      row: minRow,
      col: minCol,
      rowCount: maxRow - minRow + 1,
      colCount: maxCol - minCol + 1
    };
  }
  
  return {
    normalized: `${parsed.sheet}!${parsed.startCell}`,
    isValid: true,
    row: startCell.row,
    col: startCell.col,
    rowCount: 1,
    colCount: 1
  };
};

const ParameterModal: React.FC<ParameterModalProps> = ({
  open,
  parameterType,
  editingParameter,
  selectedCellInfo,
  suggestedParamName,
  onClose,
  onSubmit
}) => {
  const [form] = Form.useForm();
  const [addressError, setAddressError] = useState<string>('');
  const [parsedAddress, setParsedAddress] = useState<any>(null);
  
  // Check if this is a range selection
  const isRange = selectedCellInfo && !selectedCellInfo.isSingleCell;
  
  // Get initial address
  const getInitialAddress = () => {
    if (editingParameter) {
      return editingParameter.address;
    }
    return selectedCellInfo?.address || '';
  };

  // Handle address change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    const validation = validateAndNormalizeAddress(address);
    
    if (validation.isValid) {
      setAddressError('');
      setParsedAddress(validation);
      // Update form field with normalized address
      form.setFieldsValue({ address: validation.normalized });
    } else {
      setAddressError(validation.error || 'Invalid address');
      setParsedAddress(null);
    }
  };
  
  // Initialize address validation for editing parameter
  React.useEffect(() => {
    if (open && editingParameter) {
      const validation = validateAndNormalizeAddress(editingParameter.address);
      if (validation.isValid) {
        setParsedAddress(validation);
        setAddressError('');
      }
    }
  }, [open, editingParameter]);

  // Determine the appropriate data type for ranges
  const getDefaultDataType = () => {
    if (isRange) {
      return 'array'; // Ranges should be treated as arrays
    }
    return editingParameter?.type || selectedCellInfo?.detectedDataType || 'string';
  };
  
  // Validate initial address when modal opens (for new parameters)
  useEffect(() => {
    if (open && !editingParameter) {
      const initialAddr = getInitialAddress();
      if (initialAddr) {
        const validation = validateAndNormalizeAddress(initialAddr);
        if (validation.isValid) {
          setParsedAddress(validation);
          setAddressError('');
        }
      }
    }
  }, [open, editingParameter]);

  return (
    <Modal
      title={`${editingParameter ? 'Edit' : 'Add'} ${parameterType === 'input' ? 'Input' : 'Output'} Parameter`}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose={true} // Ensure clean state on close
    >
      <Form
        form={form}
        key={`${editingParameter?.id || 'new'}-${open ? 'open' : 'closed'}`} // Better key for stability
        layout="vertical"
        variant={'filled'}
        onFinish={(values) => {
          // Add parsed address data to the values
          if (parsedAddress) {
            onSubmit({
              ...values,
              address: parsedAddress.normalized,
              row: parsedAddress.row,
              col: parsedAddress.col,
              rowCount: parsedAddress.rowCount || 1,
              colCount: parsedAddress.colCount || 1
            });
          } else if (editingParameter) {
            // For editing, keep existing row/col if address wasn't changed
            onSubmit({
              ...values,
              address: values.address || editingParameter.address,
              row: editingParameter.row,
              col: editingParameter.col,
              rowCount: editingParameter.rowCount || 1,
              colCount: editingParameter.colCount || 1
            });
          } else {
            // For new parameters, use cell info
            onSubmit({
              ...values,
              address: values.address || selectedCellInfo?.address,
              row: selectedCellInfo?.row,
              col: selectedCellInfo?.col,
              rowCount: selectedCellInfo?.rowCount || 1,
              colCount: selectedCellInfo?.colCount || 1
            });
          }
        }}
        initialValues={{
          name: editingParameter ? editingParameter.name : (suggestedParamName || ''),
          title: editingParameter ? editingParameter.title : (selectedCellInfo?.suggestedTitle || ''),
          address: getInitialAddress(),
          dataType: getDefaultDataType(),
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
            tooltip={isRange ? "Range selections are automatically treated as arrays" : undefined}
          >
            <Select disabled={isRange}>
              {isRange && <Select.Option value="array">Array (Range)</Select.Option>}
              <Select.Option value="string">String</Select.Option>
              <Select.Option value="number">Number</Select.Option>
              <Select.Option value="boolean">Boolean</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label="Original Title"
          name="title"
        >
          <Input placeholder="e.g., Interest Rate, Total Amount" />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              Cell Address
              <InfoCircleOutlined 
                style={{ color: '#8c8c8c', fontSize: '12px' }}
                title="Enter the cell or range address (e.g., Sheet1!A1 or Sheet1!A1:B10)"
              />
            </Space>
          }
          name="address"
          rules={[
            { required: true, message: 'Cell address is required' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const validation = validateAndNormalizeAddress(value);
                if (validation.isValid) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(validation.error || 'Invalid address'));
              }
            }
          ]}
          validateStatus={addressError ? 'error' : ''}
          help={addressError}
        >
          <Input 
            placeholder="e.g., Sheet1!A1 or Sheet1!A1:B10"
            onChange={handleAddressChange}
            onBlur={(e) => {
              // Normalize address on blur
              const validation = validateAndNormalizeAddress(e.target.value);
              if (validation.isValid) {
                form.setFieldsValue({ address: validation.normalized });
              }
            }}
          />
        </Form.Item>

        {parsedAddress && parsedAddress.rowCount > 1 && (
          <Alert
            message="Range Selection"
            description={`This is a range of ${parsedAddress.rowCount} rows × ${parsedAddress.colCount} columns. The entire range will be returned as an array of values.`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {isRange && !parsedAddress && (
          <Alert
            message="Range Selection"
            description={`This is a range selection (${selectedCellInfo?.address}). The entire range will be returned as an array of values.`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

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
          </div>
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
        
        <Form.Item style={{ marginBottom: 0, paddingBottom: 0 }}>
          <Space style={{ marginTop: 8 }}>
            <Button type="primary" htmlType="submit">
              {editingParameter ? 'Update' : 'Add'} Parameter
            </Button>
            <Button onClick={onClose}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ParameterModal;