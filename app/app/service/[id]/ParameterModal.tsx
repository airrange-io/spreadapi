'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Alert, Checkbox, Segmented } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { validateRangeFormat } from '@/lib/rangeValidation';

interface InputDefinition {
  id: string;
  address: string;
  name: string;
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
  aiExamples?: string[];
  allowedValues?: string[];
  allowedValuesRange?: string;
  allowedValuesCaseSensitive?: boolean;
  defaultValue?: any;
}

interface OutputDefinition {
  id: string;
  address: string;
  name: string;
  title?: string;
  row: number;
  col: number;
  rowCount?: number;
  colCount?: number;
  type: 'number' | 'string' | 'boolean';
  value?: any;
  direction: 'output';
  description?: string;
  aiPresentationHint?: string;
  formatString?: string; // Simple, editable format string (e.g., "€#,##0.00", "#,##0.0 kg", "0.00%")
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
    format: string | null; // Generic format type: 'percentage', 'currency', 'date', etc.
    formatter: string | null; // Raw Excel format string
    // JavaScript-friendly metadata
    currencySymbol?: string | null;
    decimals?: number | null;
    thousandsSeparator?: boolean | null;
  };
  dropdownItems?: any[];
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
  const [activeView, setActiveView] = useState<'parameter' | 'ai'>('parameter');
  const [showAdvancedAllowedValues, setShowAdvancedAllowedValues] = useState<boolean>(false);

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

      // Show advanced options if allowedValuesRange is set
      if ('allowedValuesRange' in editingParameter && editingParameter.allowedValuesRange) {
        setShowAdvancedAllowedValues(true);
      }
    } else if (open && !editingParameter) {
      // Reset advanced options for new parameters
      setShowAdvancedAllowedValues(false);
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
      destroyOnHidden={true} // Ensure clean state on close
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
          max: editingParameter && 'max' in editingParameter ? editingParameter.max : undefined,
          aiExamples: editingParameter && 'aiExamples' in editingParameter ? editingParameter.aiExamples : undefined,
          aiPresentationHint: editingParameter && 'aiPresentationHint' in editingParameter ? editingParameter.aiPresentationHint : undefined,
          allowedValues: editingParameter && 'allowedValues' in editingParameter
            ? editingParameter.allowedValues
            : (selectedCellInfo?.dropdownItems || undefined),
          allowedValuesRange: editingParameter && 'allowedValuesRange' in editingParameter ? editingParameter.allowedValuesRange : undefined,
          allowedValuesCaseSensitive: editingParameter && 'allowedValuesCaseSensitive' in editingParameter ? editingParameter.allowedValuesCaseSensitive : false,
          defaultValue: editingParameter && 'defaultValue' in editingParameter ? editingParameter.defaultValue : undefined,
          // Format string (for outputs) - build simple format from detected Excel format
          formatString: (() => {
            // If editing existing parameter, use its formatString
            if (editingParameter && 'formatString' in editingParameter) {
              return editingParameter.formatString;
            }
            // Otherwise, build from detected Excel format
            if (selectedCellInfo?.format?.format) {
              const { format, currencySymbol, decimals, thousandsSeparator } = selectedCellInfo.format;
              if (format === 'percentage') {
                const d = decimals || 0;
                return d > 0 ? '0.' + '0'.repeat(d) + '%' : '0%';
              } else if (format === 'currency') {
                const symbol = currencySymbol || '$';
                const thousands = thousandsSeparator ? '#,##0' : '#';
                const d = decimals !== null && decimals !== undefined ? decimals : 2;
                const decimalPart = d > 0 ? '.' + '0'.repeat(d) : '';
                return `${symbol}${thousands}${decimalPart}`;
              } else if (format === 'date') {
                return 'date';
              } else if (format === 'decimal') {
                const thousands = thousandsSeparator ? '#,##0' : '#';
                const d = decimals !== null && decimals !== undefined ? decimals : 2;
                const decimalPart = d > 0 ? '.' + '0'.repeat(d) : '';
                return `${thousands}${decimalPart}`;
              }
            }
            return undefined;
          })()
        }}
      >
        {/* View Switcher */}
        <div style={{ marginBottom: 24 }}>
          <Segmented
            options={['Parameter Info', '🤖 AI Info']}
            value={activeView === 'parameter' ? 'Parameter Info' : '🤖 AI Info'}
            onChange={(value) => setActiveView(value === 'Parameter Info' ? 'parameter' : 'ai')}
            block
            style={{
              backgroundColor: '#f5f5f5',
              padding: 4
            }}
          />
        </div>

        {/* Parameter Info View */}
        {activeView === 'parameter' && (
          <>
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
                  {selectedCellInfo?.value !== null && selectedCellInfo?.value !== undefined && !selectedCellInfo?.hasFormula && (
                    <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 'normal' }}>
                      (Current: {selectedCellInfo.value})
                    </span>
                  )}
                  {selectedCellInfo?.hasFormula && (
                    <span style={{ color: '#52c41a', fontSize: '12px', fontWeight: 'normal' }}>
                      (✓ Formula)
                    </span>
                  )}
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

            {selectedCellInfo?.format?.isPercentage && parameterType === 'input' && (
              <Alert
                message="Percentage Format Detected"
                description="This cell is formatted as a percentage in Excel. Users should enter decimal values (e.g., 0.05 for 5%)."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Format String - Only for Output Parameters */}
            {parameterType === 'output' && (
              <Form.Item
                label="Format String (Optional)"
                name="formatString"
                help="Examples: €#,##0.00, $#,##0.00, #,##0.0 kg, 0.00%, date"
              >
                <Input placeholder="e.g., €#,##0.00 or #,##0.0 kg" />
              </Form.Item>
            )}

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

                {/* Allowed Values (Enum Validation) */}
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.dataType !== currentValues.dataType}
                >
                  {({ getFieldValue }) => {
                    const dataType = getFieldValue('dataType');
                    const isNumberOrString = dataType === 'number' || dataType === 'string' || !dataType;

                    return isNumberOrString ? (
                      <>
                        <Form.Item
                          label={
                            <Space>
                              Allowed Values (Optional)
                              <InfoCircleOutlined
                                style={{ color: '#8c8c8c', fontSize: '12px' }}
                                title="Restrict input to specific values. Leave empty to allow any value."
                              />
                              <Button
                                type="link"
                                size="small"
                                onClick={() => setShowAdvancedAllowedValues(!showAdvancedAllowedValues)}
                                style={{ padding: 0, height: 'auto', fontSize: '12px' }}
                              >
                                {showAdvancedAllowedValues ? 'Hide Advanced' : 'Advanced'}
                              </Button>
                            </Space>
                          }
                          name="allowedValues"
                          help={
                            selectedCellInfo?.dropdownItems && !editingParameter
                              ? `✓ Auto-detected from cell dropdown (${selectedCellInfo.dropdownItems.length} items)`
                              : undefined
                          }
                        >
                          <Select
                            mode="tags"
                            placeholder={dataType === 'number' ? 'e.g., 1, 2, 3' : 'e.g., Angestellt, Selbstständig, Unbekannt'}
                            tokenSeparators={[',']}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>

                        {showAdvancedAllowedValues && (
                          <>
                            <div style={{ height: 12 }} />

                            <Form.Item
                              label={
                                <Space>
                                  Or Load from Worksheet Range
                                  <InfoCircleOutlined
                                    style={{ color: '#8c8c8c', fontSize: '12px' }}
                                    title="Values will be extracted from this range when you publish the service"
                                  />
                                </Space>
                              }
                              name="allowedValuesRange"
                              help="Extract allowed values from a worksheet range at publish time (e.g., Values!B2:B24)"
                              rules={[
                                {
                                  validator: (_, value) => {
                                    if (!value || value.trim() === '') {
                                      return Promise.resolve();
                                    }
                                    const validation = validateRangeFormat(value);
                                    if (validation.valid) {
                                      return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(validation.error));
                                  }
                                }
                              ]}
                            >
                              <Input
                                placeholder="e.g., Values!B2:B24 or 'Jahr 2025'!B2:B44"
                              />
                            </Form.Item>
                          </>
                        )}

                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, curr) => prev.allowedValues !== curr.allowedValues}
                        >
                          {({ getFieldValue: getVal }) => {
                            const hasAllowedValues = getVal('allowedValues')?.length > 0;
                            return hasAllowedValues && dataType === 'string' ? (
                              <Form.Item
                                name="allowedValuesCaseSensitive"
                                valuePropName="checked"
                                style={{ marginTop: -8, marginBottom: 16 }}
                              >
                                <Checkbox>Case-sensitive matching</Checkbox>
                              </Form.Item>
                            ) : null;
                          }}
                        </Form.Item>
                      </>
                    ) : null;
                  }}
                </Form.Item>

                {/* Default Value (for optional parameters only) */}
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.dataType !== currentValues.dataType ||
                    prevValues.mandatory !== currentValues.mandatory ||
                    prevValues.allowedValues !== currentValues.allowedValues
                  }
                >
                  {({ getFieldValue }) => {
                    const dataType = getFieldValue('dataType');
                    const isMandatory = getFieldValue('mandatory');
                    const allowedValues = getFieldValue('allowedValues');

                    // Only show for optional parameters
                    return !isMandatory ? (
                      <Form.Item
                        label="Default Value (Optional)"
                        name="defaultValue"
                        help="Value to use when this parameter is not provided"
                        rules={[
                          {
                            validator: (_, value) => {
                              if (!value || !allowedValues || allowedValues.length === 0) {
                                return Promise.resolve();
                              }

                              // Validate that default value is in allowedValues
                              const valueStr = String(value);
                              const caseSensitive = getFieldValue('allowedValuesCaseSensitive') === true;
                              const valueToCheck = caseSensitive ? valueStr : valueStr.toLowerCase();
                              const allowedSet = caseSensitive
                                ? allowedValues
                                : allowedValues.map((v: any) => String(v).toLowerCase());

                              if (!allowedSet.includes(valueToCheck)) {
                                return Promise.reject(new Error(`Default value must be one of: ${allowedValues.join(', ')}`));
                              }

                              return Promise.resolve();
                            }
                          }
                        ]}
                      >
                        {dataType === 'number' ? (
                          <Input type="number" placeholder="Optional default" />
                        ) : dataType === 'boolean' ? (
                          <Select placeholder="Select default" allowClear>
                            <Select.Option value={true}>True</Select.Option>
                            <Select.Option value={false}>False</Select.Option>
                          </Select>
                        ) : (
                          <Input placeholder="Optional default" />
                        )}
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
              </>
            )}

            {parameterType === 'input' && (
              <Form.Item
                name="mandatory"
                valuePropName="checked"
              >
                <Checkbox>Mandatory parameter</Checkbox>
              </Form.Item>
            )}
          </>
        )}

        {/* AI Info View */}
        {activeView === 'ai' && (
          <Space direction="vertical" size={16} style={{ width: '100%', marginBottom: 24 }}>
            <div>
              <div style={{ marginBottom: 8, fontSize: 13, color: '#666', fontWeight: 500 }}>
                Description (for AI assistants)
              </div>
              <Form.Item name="description" noStyle>
                <Input.TextArea
                  rows={3}
                  placeholder="Describe what this parameter represents and how it should be used by AI assistants..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                Help AI understand the purpose and usage of this parameter
              </div>
            </div>

            {parameterType === 'input' && (
              <div>
                <div style={{ marginBottom: 8, fontSize: 13, color: '#666', fontWeight: 500 }}>
                  Example Values
                </div>
                <Form.Item name="aiExamples" noStyle>
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="E.g., '0.05 (5% APR)', '300000 (for $300k)', '30 (years)'"
                    tokenSeparators={[',']}
                  />
                </Form.Item>
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  Provide example values that AI can suggest to users
                </div>
              </div>
            )}

            {parameterType === 'output' && (
              <div>
                <div style={{ marginBottom: 8, fontSize: 13, color: '#666', fontWeight: 500 }}>
                  Presentation Hint
                </div>
                <Form.Item name="aiPresentationHint" noStyle>
                  <Input
                    placeholder="E.g., 'Format as currency with 2 decimals' or 'Show as percentage'"
                  />
                </Form.Item>
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  Guide AI on how to format and present this result to users
                </div>
              </div>
            )}
          </Space>
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