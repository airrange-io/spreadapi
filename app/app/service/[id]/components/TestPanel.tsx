'use client';

import React, { useState, useEffect } from 'react';
import { Drawer, Form, Button, Space, Typography, Alert, Card, Segmented } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { validateParameters, applyDefaults, coerceTypes } from '@/lib/parameterValidation';
import { InputRenderer } from '@/components/InputRenderer';
import type { InputDefinition, OutputDefinition } from './ParametersSection';

interface TestPanelProps {
  open: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName?: string;
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  spreadInstance?: any;
}

// Helper to validate and parse cell address
function parseAddress(address: string, paramName: string): { sheetName: string; cellRef: string } {
  if (!address || typeof address !== 'string') {
    throw new Error(`Invalid address for parameter "${paramName}": address is missing`);
  }

  if (!address.includes('!')) {
    throw new Error(`Invalid address format for parameter "${paramName}": expected "SheetName!A1" format`);
  }

  const [sheetName, cellRef] = address.split('!');

  if (!sheetName || !cellRef) {
    throw new Error(`Invalid address for parameter "${paramName}": missing sheet name or cell reference`);
  }

  return { sheetName, cellRef };
}

// Helper to check if address is a single cell or range
function isSingleCell(address: string): boolean {
  if (!address) return false;

  const sheetSepIndex = address.indexOf('!');
  const cellAddress = sheetSepIndex > -1
    ? address.substring(sheetSepIndex + 1)
    : address;

  const colonIndex = cellAddress.indexOf(':');
  if (colonIndex === -1) return true;

  const leftCell = cellAddress.substring(0, colonIndex);
  const rightCell = cellAddress.substring(colonIndex + 1);
  return leftCell === rightCell;
}

// Helper to calculate range dimensions from address (e.g., "A1:C5" -> {rowCount: 5, colCount: 3})
function getRangeDimensions(address: string, startRow: number, startCol: number): { rowCount: number; colCount: number } {
  const sheetSepIndex = address.indexOf('!');
  const cellAddress = sheetSepIndex > -1
    ? address.substring(sheetSepIndex + 1).replace(/[$']/g, '')
    : address.replace(/[$']/g, '');

  const colonIndex = cellAddress.indexOf(':');
  if (colonIndex === -1) return { rowCount: 1, colCount: 1 };

  const endCell = cellAddress.substring(colonIndex + 1);

  // Parse end cell coordinates (e.g., "C5" -> row: 5, col: 3)
  const endRow = parseInt(endCell.replace(/^[A-Z]+/, ''));
  const colChars = endCell.replace(/\d+$/, '').split('').reverse();
  let endCol = 0;
  let multiplier = 1;

  while (colChars.length) {
    const char = colChars.shift();
    if (char) {
      endCol += (char.charCodeAt(0) - 64) * multiplier;
      multiplier *= 26;
    }
  }

  // Make range inclusive: need to add 1 to count both start and end cells
  // Example: E3:F10 where startRow=3, startCol=5, endRow=10, endCol=6
  // rowCount = 10 - 3 + 1 = 8 rows (3,4,5,6,7,8,9,10)
  // colCount = 6 - 5 + 1 = 2 cols (E, F)
  return {
    rowCount: endRow - startRow + 1,
    colCount: endCol - startCol + 1
  };
}

const TestPanel: React.FC<TestPanelProps> = ({
  open,
  onClose,
  serviceId,
  serviceName,
  inputs,
  outputs,
  spreadInstance
}) => {
  const [form] = Form.useForm();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [hasChanges, setHasChanges] = useState(true); // Start enabled
  const [viewMode, setViewMode] = useState<'result' | 'json' | 'request'>('result');

  // Build GET URL from current form values
  const buildGetUrl = () => {
    const formValues = form.getFieldsValue();
    const baseUrl = `https://spreadapi.io/api/v1/services/${serviceId}/execute`;
    const params = new URLSearchParams();

    inputs.forEach(input => {
      const value = formValues[input.name];
      if (value !== undefined && value !== null && value !== '') {
        params.append(input.name, String(value));
      }
    });

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Build POST body from current form values
  const buildPostBody = () => {
    const formValues = form.getFieldsValue();
    const body: Record<string, any> = {};

    inputs.forEach(input => {
      const value = formValues[input.name];
      if (value !== undefined && value !== null && value !== '') {
        body[input.name] = value;
      }
    });

    return body;
  };

  // Format output values (simplified version of WebApp)
  const formatOutput = (output: any, value: any) => {
    // Handle arrays (cell ranges) - format as HTML table
    if (Array.isArray(value)) {
      const formatCell = (cellValue: any): string => {
        if (output.formatString && typeof cellValue === 'number') {
          const formatStr = output.formatString.trim();

          // Handle percentage
          if (formatStr.includes('%')) {
            const decimals = (formatStr.match(/\.0+/)?.[0].length || 1) - 1;
            const formattedNum = new Intl.NumberFormat('de-DE', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals
            }).format(cellValue);
            return `${formattedNum}%`;
          }

          // Handle currency
          const currencyMatch = formatStr.match(/^["']?([€$£¥])["']?/);
          if (currencyMatch) {
            const symbol = currencyMatch[1];
            const decimals = (formatStr.match(/\.0+/)?.[0].length || 1) - 1;
            const formattedNum = new Intl.NumberFormat('de-DE', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals
            }).format(cellValue);
            return `${symbol}${formattedNum}`;
          }

          // Handle thousand separator
          if (formatStr.includes('#,##0')) {
            const decimals = (formatStr.match(/\.0+/)?.[0].length || 1) - 1;
            const formattedNum = new Intl.NumberFormat('de-DE', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals
            }).format(cellValue);
            const unitMatch = formatStr.match(/0\s+["']?([a-zA-Z]+)["']?$/);
            return unitMatch ? `${formattedNum} ${unitMatch[1]}` : formattedNum;
          }
        }

        return cellValue != null ? String(cellValue) : '';
      };

      // 2D array - create HTML table
      if (value.length > 0 && Array.isArray(value[0])) {
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '4px' }}>
            <tbody>
              {value.map((row: any[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.map((cell: any, colIndex: number) => (
                    <td
                      key={colIndex}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #e8e8e8',
                        textAlign: typeof cell === 'number' ? 'right' : 'left',
                        backgroundColor: rowIndex % 2 === 0 ? '#fafafa' : 'white',
                        fontWeight: typeof cell === 'number' ? 500 : 400
                      }}
                    >
                      {formatCell(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      // 1D array - horizontal row
      if (value.length > 0) {
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '4px' }}>
            <tbody>
              <tr>
                {value.map((cell: any, colIndex: number) => (
                  <td
                    key={colIndex}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e8e8e8',
                      textAlign: typeof cell === 'number' ? 'right' : 'left',
                      backgroundColor: '#fafafa',
                      fontWeight: typeof cell === 'number' ? 500 : 400
                    }}
                  >
                    {formatCell(cell)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        );
      }
    }

    return formatSingleValue(output, value);
  };

  // Format a single value (extracted for reuse)
  const formatSingleValue = (output: any, value: any) => {
    if (output.formatString && typeof value === 'number') {
      const formatStr = output.formatString.trim();

      // Handle percentage
      if (formatStr.includes('%')) {
        const decimals = (formatStr.match(/\.0+/)?.[0].length || 1) - 1;
        const formattedNum = new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(value);
        return `${formattedNum}%`;
      }

      // Handle currency and other formats
      const prefixMatch = formatStr.match(/^([^#0,.\s]+)/);
      const suffixMatch = formatStr.match(/([^#0,.\s]+)$/);
      const decimalMatch = formatStr.match(/\.0+/);
      const hasThousands = formatStr.includes(',');

      const decimals = decimalMatch ? decimalMatch[0].length - 1 : 0;
      const prefix = prefixMatch ? prefixMatch[1] : '';
      const suffix = suffixMatch && !prefixMatch ? suffixMatch[1] : '';

      const formattedNum = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: hasThousands
      }).format(value);

      return `${prefix}${formattedNum}${suffix}`;
    }

    if (typeof value === 'number') {
      const formatter = Number.isInteger(value)
        ? new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })
        : new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return formatter.format(value);
    }

    if (value === null || value === undefined) {
      return '-';
    }

    return String(value);
  };

  // Initialize form with input values
  useEffect(() => {
    if (inputs.length > 0 && open) {
      const initialValues: Record<string, any> = {};
      inputs.forEach(input => {
        const key = input.name;
        if (input.value !== undefined && input.value !== null) {
          initialValues[key] = input.value;
        } else if (input.type === 'number') {
          initialValues[key] = input.min || 0;
        } else if (input.type === 'boolean') {
          initialValues[key] = false;
        } else {
          initialValues[key] = '';
        }
      });
      form.setFieldsValue(initialValues);
      setHasChanges(true); // Enable button on initial load
      setResults(null); // Clear previous results
      setError(''); // Clear previous errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, open]); // Removed 'form' to prevent unnecessary re-renders

  // Handle test execution - local calculation only
  const handleTest = async () => {
    setTesting(true);
    setError('');
    setResults(null);

    try {
      const formValues = form.getFieldsValue();
      const startTime = Date.now();

      // Step 1: Validate inputs
      const validation = validateParameters(formValues, inputs);
      if (!validation.valid) {
        throw new Error(validation.message || 'Validation failed');
      }

      // Step 2: Apply defaults
      const withDefaults = applyDefaults(formValues, inputs);

      // Step 3: Coerce types
      const coerced = coerceTypes(withDefaults, inputs);

      // Step 4: Set values in spreadsheet
      if (!spreadInstance) {
        throw new Error('Spreadsheet not loaded. Please switch to Workbook view first.');
      }

      // Build inputs array (same format as API)
      const answerInputs: any[] = [];
      for (const input of inputs) {
        try {
          const key = input.name;
          const value = coerced[key];

          // Validate and parse address
          const { sheetName } = parseAddress(input.address, input.name);

          // Get sheet
          const sheet = spreadInstance.getSheetFromName(sheetName);
          if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found for input "${input.title || input.name}"`);
          }

          // Validate row/col exist
          if (input.row === undefined || input.col === undefined) {
            throw new Error(`Missing row or column for input "${input.title || input.name}"`);
          }

          // Set value in spreadsheet
          sheet.setValue(input.row, input.col, value);

          answerInputs.push({
            name: input.name,
            title: input.title || input.name,
            value: value
          });
        } catch (err: any) {
          throw new Error(`Failed to set input "${input.title || input.name}": ${err.message}`);
        }
      }

      // Step 5: SpreadJS recalculates automatically

      // Step 6: Read outputs (same format as API)
      const answerOutputs: any[] = [];
      for (const output of outputs) {
        try {
          // Validate and parse address
          const { sheetName } = parseAddress(output.address, output.name);

          // Get sheet
          const sheet = spreadInstance.getSheetFromName(sheetName);
          if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found for output "${output.title || output.name}"`);
          }

          // Validate row/col exist
          if (output.row === undefined || output.col === undefined) {
            throw new Error(`Missing row or column for output "${output.title || output.name}"`);
          }

          // Check if single cell or range
          let value;
          if (isSingleCell(output.address)) {
            // Single cell - read value directly
            value = sheet.getValue(output.row, output.col);
          } else {
            // Cell range - read as 2D array
            const dimensions = getRangeDimensions(output.address, output.row + 1, output.col + 1);
            value = sheet.getArray(output.row, output.col, dimensions.rowCount, dimensions.colCount);
          }

          const outputObj: any = {
            name: output.name,
            title: output.title || output.name,
            value: value
          };

          // Include formatString if available
          if (output.formatString) {
            outputObj.formatString = output.formatString;
          }

          answerOutputs.push(outputObj);
        } catch (err: any) {
          throw new Error(`Failed to read output "${output.title || output.name}": ${err.message}`);
        }
      }

      const responseTime = Date.now() - startTime;
      setResults({
        serviceId: serviceId,
        inputs: answerInputs,
        outputs: answerOutputs,
        metadata: {
          executionTime: responseTime,
          timestamp: new Date().toISOString(),
          version: 'local'
        }
      });
      setExecutionTime(responseTime);
      setHasChanges(false); // Disable button after calculation
    } catch (err: any) {
      setError(err.message || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  // Handle form value changes
  const handleFormChange = () => {
    setResults(null); // Clear results
    setError(''); // Clear error
    setHasChanges(true); // Enable calculate button
  };

  return (
    <Drawer
      title="Test Current Parameters"
      placement="right"
      onClose={onClose}
      open={open}
      width={Math.min(500, typeof window !== 'undefined' ? window.innerWidth - 40 : 500)}
      styles={{
        body: { padding: '16px' }
      }}
    >
      {/* Content - Quick Test */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px'
      }}>
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          {/* Input Parameters */}
          {inputs.length > 0 && (
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleFormChange}
            >
              {inputs.map((input) => (
                <InputRenderer
                  key={input.id}
                  input={input}
                  fieldName={input.name}
                  showLabel={true}
                  marginBottom={12}
                  hideAiDescriptions={true}
                />
              ))}
            </Form>
          )}

          {/* Calculate Button */}
          <Button
            type="primary"
            icon={<CaretRightOutlined />}
            onClick={handleTest}
            loading={testing}
            disabled={!hasChanges && !testing}
            block
            size="large"
          >
            {testing ? 'Calculating...' : 'Calculate'}
          </Button>

          {/* Error */}
          {error && (
            <Alert
              message="Test Failed"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          {/* Results */}
          {results && (
            <div style={{ marginTop: 16 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <Typography.Title level={5} style={{ margin: 0, fontSize: 14 }}>
                  Results
                </Typography.Title>
                <Segmented
                  value={viewMode}
                  onChange={(value) => setViewMode(value as 'result' | 'json' | 'request')}
                  options={[
                    { label: 'Result', value: 'result' },
                    { label: 'JSON', value: 'json' },
                    { label: 'Request', value: 'request' }
                  ]}
                  size="small"
                />
              </div>

              {viewMode === 'result' ? (
                <>
                  <div style={{
                    backgroundColor: '#f8f8f8',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    {results.outputs.map((outputItem: any, index: number) => {
                      if (outputItem.value === undefined || outputItem.value === null) return null;

                      const formattedValue = formatOutput(outputItem, outputItem.value);
                      const isArray = Array.isArray(outputItem.value);

                      return (
                        <div
                          key={outputItem.name || index}
                          style={{
                            display: isArray ? 'block' : 'flex',
                            justifyContent: isArray ? 'normal' : 'space-between',
                            alignItems: isArray ? 'flex-start' : 'center',
                            padding: '12px 16px',
                            borderBottom: index < results.outputs.length - 1 ? '1px solid #e8e8e8' : 'none'
                          }}
                        >
                          <Typography.Text style={{ fontSize: 14, marginBottom: isArray ? '8px' : 0 }}>
                            {outputItem.title}:
                          </Typography.Text>
                          {isArray ? (
                            <div style={{ width: '100%' }}>
                              {formattedValue}
                            </div>
                          ) : (
                            <Typography.Text strong style={{
                              fontSize: 16,
                              color: '#4F2D7F'
                            }}>
                              {formattedValue}
                            </Typography.Text>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{
                    marginTop: 8,
                    color: '#999',
                    fontSize: 11,
                    textAlign: 'right'
                  }}>
                    {executionTime}ms
                  </div>
                </>
              ) : viewMode === 'json' ? (
                <div style={{
                  backgroundColor: '#1e1e1e',
                  borderRadius: '6px',
                  padding: '16px',
                  overflow: 'auto',
                  maxHeight: '500px'
                }}>
                  <pre style={{
                    margin: 0,
                    fontSize: '12px',
                    lineHeight: '1.5',
                    fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                    color: '#d4d4d4',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size={16}>
                  {/* GET Request */}
                  <div>
                    <Typography.Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                      GET Request
                    </Typography.Text>
                    <div style={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: '6px',
                      padding: '12px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <Typography.Text
                        copyable
                        style={{
                          fontSize: 12,
                          fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                          wordBreak: 'break-all'
                        }}
                      >
                        {buildGetUrl()}
                      </Typography.Text>
                    </div>
                  </div>

                  {/* POST Request */}
                  <div>
                    <Typography.Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                      POST Request
                    </Typography.Text>
                    <div style={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: '6px',
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      marginBottom: 8
                    }}>
                      <Typography.Text style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>
                        URL:
                      </Typography.Text>
                      <Typography.Text
                        copyable
                        style={{
                          fontSize: 12,
                          fontFamily: 'Monaco, Menlo, "Courier New", monospace'
                        }}
                      >
                        {`https://spreadapi.io/api/v1/services/${serviceId}/execute`}
                      </Typography.Text>
                    </div>
                    <div style={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: '6px',
                      padding: '12px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <Typography.Text style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>
                        Body (JSON):
                      </Typography.Text>
                      <Typography.Text
                        copyable
                        code
                        style={{
                          fontSize: 12,
                          fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                          display: 'block',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all'
                        }}
                      >
                        {JSON.stringify(buildPostBody(), null, 2)}
                      </Typography.Text>
                    </div>
                  </div>
                </Space>
              )}
            </div>
          )}
        </Space>
      </div>
    </Drawer>
  );
};

export default TestPanel;
