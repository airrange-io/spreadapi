'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Alert, Typography, Slider, Row, Col } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Input {
  name: string;
  alias?: string;
  title?: string;
  description?: string;
  type: string;
  mandatory?: boolean;
  min?: number;
  max?: number;
  value?: any;
  allowedValues?: string[];
  defaultValue?: any;
}

interface Output {
  name: string;
  alias?: string;
  title?: string;
  description?: string;
  type: string;
  formatString?: string;
}

interface ServiceData {
  name: string;
  description: string;
  inputs: Input[];
  outputs: Output[];
}

interface Props {
  serviceId: string;
  serviceData: ServiceData;
}

export default function WebAppClient({ serviceId, serviceData }: Props) {
  const [form] = Form.useForm();
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize form with defaults
  const initialValues = useMemo(() => {
    const defaults: Record<string, any> = {};
    serviceData.inputs.forEach((input) => {
      const key = input.alias || input.name;
      if (input.value !== undefined && input.value !== null) {
        defaults[key] = input.value;
      } else if (input.defaultValue !== undefined && input.defaultValue !== null) {
        defaults[key] = input.defaultValue;
      } else if (input.allowedValues && input.allowedValues.length > 0 && input.mandatory !== false) {
        defaults[key] = input.allowedValues[0];
      } else if (input.type === 'number') {
        defaults[key] = input.min || 0;
      } else if (input.type === 'boolean') {
        defaults[key] = false;
      } else {
        defaults[key] = '';
      }
    });
    return defaults;
  }, [serviceData.inputs]);

  // Memoize formatters
  const formatters = useMemo(() => ({
    integer: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
    decimal: new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
  }), []);

  const formatOutput = useCallback((output: Output, value: any) => {
    if (output.formatString && typeof value === 'number') {
      const formatStr = output.formatString.trim();

      // Handle percentage
      if (formatStr.includes('%')) {
        const decimals = (formatStr.match(/\.0+/)?.[0].length || 1) - 1;
        return `${value.toFixed(decimals)}%`;
      }

      // Handle date
      if (formatStr.toLowerCase() === 'date') {
        return new Date(value).toLocaleDateString();
      }

      // Parse format string
      const prefixMatch = formatStr.match(/^([^#0,.\s]+)/);
      const suffixMatch = formatStr.match(/([^#0,.\s]+)$/);
      const decimalMatch = formatStr.match(/\.0+/);
      const hasThousands = formatStr.includes(',');

      const decimals = decimalMatch ? decimalMatch[0].length - 1 : 0;
      const prefix = prefixMatch ? prefixMatch[1] : '';
      const suffix = suffixMatch && !prefixMatch ? suffixMatch[1] : '';

      const formattedNum = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: hasThousands
      }).format(value);

      return `${prefix}${formattedNum}${suffix}`;
    }

    if (typeof value === 'number') {
      return Number.isInteger(value) ? formatters.integer.format(value) : formatters.decimal.format(value);
    }

    return value;
  }, [formatters]);

  const handleSubmit = async (values: any) => {
    const startTime = Date.now();

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setExecuting(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/v1/services/${serviceId}/execute?${params.toString()}`, {
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Execution failed');
        } catch {
          throw new Error(errorText || 'Execution failed');
        }
      }

      const data = await response.json();

      // Convert outputs array to object
      const resultsObj: Record<string, any> = {};
      if (data.outputs && Array.isArray(data.outputs)) {
        data.outputs.forEach((output: any) => {
          if (output.name && output.value !== undefined) {
            resultsObj[output.name] = output.value;
          }
        });
      }

      setResults(resultsObj);
      setExecutionTime(data.metadata?.executionTime || Date.now() - startTime);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Failed to execute calculation');
      setResults(null);
    } finally {
      setExecuting(false);
      abortControllerRef.current = null;
    }
  };

  // Smart step size calculator - aims for ~2-5% steps
  const getSmartStep = (value: number | undefined, min: number | undefined, max: number | undefined) => {
    // If we have a range, use 1% of the range (max 100 steps)
    if (min !== undefined && max !== undefined) {
      const range = max - min;
      const step = range / 100;

      if (Number.isInteger(min) && Number.isInteger(max)) {
        // For integer ranges, round to nice numbers
        const intStep = Math.floor(step);
        if (intStep >= 10) return Math.round(intStep / 10) * 10; // Round to nearest 10
        if (intStep >= 5) return 5;
        return Math.max(intStep, 1);
      }

      return Math.max(step, 0.01);
    }

    // No range defined - use percentage of current value
    const currentValue = value || 0;
    const absValue = Math.abs(currentValue);

    // For very small values, use fixed small steps
    if (absValue < 1) return 0.1;
    if (absValue < 10) return 1;

    // For larger values, use ~2-5% of the value, rounded to nice numbers
    if (Number.isInteger(currentValue) || absValue >= 10) {
      // Aim for 2-5% step size, rounded to nice numbers
      if (absValue < 100) return 1;        // 20 → step 1 (5%)
      if (absValue < 500) return 10;       // 200 → step 10 (5%)
      if (absValue < 1000) return 25;      // 500 → step 25 (5%)
      if (absValue < 5000) return 100;     // 2000 → step 100 (5%)
      if (absValue < 10000) return 250;    // 5000 → step 250 (5%)
      if (absValue < 100000) return 1000;  // 50000 → step 1000 (2%)
      return Math.round(absValue / 50);    // Large values: ~2% step
    }

    // For decimals, use appropriate decimal steps
    if (absValue < 100) return 1;
    if (absValue < 1000) return 10;
    return 100;
  };

  const renderInputControl = useCallback((input: Input) => {
    const fieldName = input.alias || input.name;

    const label = (
      <div>
        <div style={{ fontWeight: 400, marginBottom: 2, fontSize: 13, color: '#666' }}>
          {input.title || input.name}
          {!input.mandatory && <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>(Optional)</Text>}
        </div>
        {input.description && (
          <div style={{ fontSize: 11, color: '#999', fontWeight: 400, marginBottom: 4 }}>
            {input.description}
          </div>
        )}
      </div>
    );

    // If input has allowedValues, render a dropdown
    if (input.allowedValues && input.allowedValues.length > 0) {
      return (
        <Form.Item
          key={fieldName}
          name={fieldName}
          label={label}
          rules={[{ required: input.mandatory !== false, message: `Please select ${input.title || input.name}` }]}
          style={{ marginBottom: 12 }}
        >
          <Select
            placeholder={`Select ${input.title || input.name}`}
            size="middle"
            showSearch
            optionFilterProp="children"
            filterOption={(inputValue, option) =>
              (option?.label ?? '').toLowerCase().includes(inputValue.toLowerCase())
            }
            options={input.allowedValues.map(value => ({
              value: value,
              label: value
            }))}
          />
        </Form.Item>
      );
    }

    if (input.type === 'number') {
      const hasRange = input.min !== undefined && input.max !== undefined;
      const rangeSize = hasRange ? input.max! - input.min! : 0;
      const useSlider = hasRange && rangeSize > 0 && rangeSize <= 10000; // Use slider for reasonable ranges

      if (useSlider) {
        // Combined Slider + InputNumber for best UX
        return (
          <Form.Item
            key={fieldName}
            name={fieldName}
            label={label}
            rules={[{ required: input.mandatory !== false, message: `Please enter ${input.title || input.name}` }]}
            style={{ marginBottom: 12 }}
          >
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Slider
                  min={input.min}
                  max={input.max}
                  step={getSmartStep(input.value, input.min, input.max)}
                  tooltip={{
                    formatter: (value) => {
                      if (!value) return '';
                      if (Number.isInteger(value)) {
                        return formatters.integer.format(value);
                      }
                      return formatters.decimal.format(value);
                    }
                  }}
                />
              </Col>
              <Col flex="120px">
                <InputNumber
                  style={{ width: '100%' }}
                  min={input.min}
                  max={input.max}
                  step={getSmartStep(input.value, input.min, input.max)}
                  size="middle"
                  keyboard={true}
                  formatter={(value) => {
                    if (!value) return '';
                    const num = parseFloat(value.toString());
                    if (isNaN(num)) return value.toString();
                    if (Number.isInteger(num)) {
                      return formatters.integer.format(num);
                    }
                    return formatters.decimal.format(num);
                  }}
                  parser={(value) => {
                    if (!value) return 0;
                    const parsed = parseFloat(value.replace(/,/g, ''));
                    return isNaN(parsed) ? 0 : parsed;
                  }}
                />
              </Col>
            </Row>
          </Form.Item>
        );
      }

      // Regular InputNumber without slider
      return (
        <Form.Item
          key={fieldName}
          name={fieldName}
          label={label}
          rules={[{ required: input.mandatory !== false, message: `Please enter ${input.title || input.name}` }]}
          style={{ marginBottom: 12 }}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={input.min}
            max={input.max}
            step={getSmartStep(input.value, input.min, input.max)}
            placeholder={`Enter ${input.title || input.name}`}
            size="middle"
            keyboard={true}
            formatter={(value) => {
              if (!value) return '';
              const num = parseFloat(value.toString());
              if (isNaN(num)) return value.toString();
              if (Number.isInteger(num)) {
                return formatters.integer.format(num);
              }
              return formatters.decimal.format(num);
            }}
            parser={(value) => {
              if (!value) return 0;
              const parsed = parseFloat(value.replace(/,/g, ''));
              return isNaN(parsed) ? 0 : parsed;
            }}
          />
        </Form.Item>
      );
    }

    if (input.type === 'boolean') {
      return (
        <Form.Item
          key={fieldName}
          name={fieldName}
          label={label}
          valuePropName="checked"
          style={{ marginBottom: 12 }}
        >
          <Input
            type="checkbox"
            size="middle"
          />
        </Form.Item>
      );
    }

    // Default to string/text
    return (
      <Form.Item
        key={fieldName}
        name={fieldName}
        label={label}
        rules={[{ required: input.mandatory !== false, message: `Please enter ${input.title || input.name}` }]}
        style={{ marginBottom: 12 }}
      >
        <Input
          placeholder={`Enter ${input.title || input.name}`}
          size="middle"
        />
      </Form.Item>
    );
  }, [formatters]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Card
          style={{
            marginTop: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Title level={2} style={{ marginBottom: 24 }}>
            {serviceData.name}
          </Title>

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={initialValues}
            size="middle"
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '0 16px'
            }}>
              {serviceData.inputs.map((input) => renderInputControl(input))}
            </div>

            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={executing}
                icon={<PlayCircleOutlined />}
                block
                size="large"
                style={{
                  backgroundColor: '#4F2D7F',
                  borderColor: '#4F2D7F',
                  height: 48,
                  fontSize: 15,
                  fontWeight: 600
                }}
              >
                {executing ? 'Calculating...' : 'Calculate Results'}
              </Button>
            </Form.Item>
          </Form>

          {results && (
            <>
              <div style={{ marginTop: 32 }}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  Results
                </Title>
                <div style={{
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  opacity: executing ? 0.5 : 1,
                  transition: 'opacity 0.3s ease'
                }}>
                  {serviceData.outputs.map((output, index) => {
                    const value = results[output.name];
                    if (value === undefined || value === null) return null;

                    return (
                      <div
                        key={output.name}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          borderBottom: index < serviceData.outputs.length - 1 ? '1px solid #e8e8e8' : 'none'
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>
                          {output.title || output.name}:
                        </Text>
                        <Text strong style={{
                          fontSize: 16,
                          color: '#4F2D7F'
                        }}>
                          {formatOutput(output, value)}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{
                marginTop: 24,
                color: '#999',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                {executionTime && (
                  <>
                    <span>{executionTime}ms</span>
                    <span>•</span>
                  </>
                )}
                <a
                  href="https://spreadapi.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#4F2D7F', textDecoration: 'none' }}
                >
                  SpreadAPI
                </a>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
