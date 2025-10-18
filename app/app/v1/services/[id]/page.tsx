'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, Form, Input, InputNumber, Button, Space, Alert, Spin, Typography } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ServiceData {
  name: string;
  description: string;
  inputs: Array<{
    name: string;
    alias?: string;
    title?: string;
    description?: string;
    type: string;
    mandatory?: boolean;
    min?: number;
    max?: number;
    value?: any;
    aiExamples?: string[];
  }>;
  outputs: Array<{
    name: string;
    alias?: string;
    title?: string;
    description?: string;
    type: string;
    aiPresentationHint?: string;
  }>;
}

export default function WebAppPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const serviceId = params.id as string;
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [results, setResults] = useState<Record<string, number | string | boolean> | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState<Record<string, any>>({});

  // Ref to track current request for cancellation
  const currentRequestRef = useRef<AbortController | null>(null);

  // Memoize number formatters to avoid recreating on every render
  const formatters = useMemo(() => ({
    integer: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
    decimal: new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }),
    currency: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
  }), []);

  useEffect(() => {
    if (!token) {
      setError('No access token provided');
      setLoading(false);
      return;
    }

    const loadServiceData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load service data using the web app endpoint (validates token)
        const response = await fetch(`/api/services/${serviceId}/webapp?token=${token}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load service');
        }

        const data = await response.json();

        setServiceData({
          name: data.name || 'Calculation Service',
          description: data.description || '',
          inputs: data.inputs || [],
          outputs: data.outputs || []
        });

        // Set initial values from spreadsheet defaults
        const defaults: Record<string, any> = {};
        (data.inputs || []).forEach((input: any) => {
          const key = input.alias || input.name;
          if (input.value !== undefined && input.value !== null) {
            defaults[key] = input.value;
          } else if (input.type === 'number') {
            defaults[key] = input.min || 0;
          } else if (input.type === 'boolean') {
            defaults[key] = false;
          } else {
            defaults[key] = '';
          }
        });
        setInitialValues(defaults);
        form.setFieldsValue(defaults);

      } catch (err: any) {
        setError(err.message || 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    loadServiceData();
  }, [serviceId, token, form]);

  const handleExecute = async (values: any) => {
    const clientStart = Date.now();

    // Cancel any previous request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    currentRequestRef.current = abortController;

    try {
      setExecuting(true);
      setError(null);
      // Don't clear results to prevent flicker - keep old results visible while calculating

      // Build query string from form values
      const params = new URLSearchParams();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      // Call the actual published API execute endpoint
      const apiUrl = `/api/v1/services/${serviceId}/execute?${params.toString()}`;
      const response = await fetch(apiUrl, {
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Execution failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Convert outputs array to a simple key-value object
      // The execute endpoint returns: { outputs: [{name: 'total', value: 123}, ...] }
      // We need: { total: 123, invested: 456, ... }
      const resultsObj: Record<string, number | string | boolean> = {};
      if (data.outputs && Array.isArray(data.outputs)) {
        data.outputs.forEach((output: any) => {
          if (output.name && output.value !== undefined) {
            resultsObj[output.name] = output.value;
          }
        });
      }
      setResults(resultsObj);

      // Capture execution time from metadata
      if (data.metadata?.executionTime) {
        setExecutionTime(data.metadata.executionTime);
      } else if (data.metadata?.totalTime) {
        setExecutionTime(data.metadata.totalTime);
      }

      // Calculate total round-trip time
      const clientEnd = Date.now();
      setTotalTime(clientEnd - clientStart);

    } catch (err: any) {
      // Ignore aborted requests (user clicked Calculate again)
      if (err.name === 'AbortError') {
        return;
      }

      setError(err.message || 'Failed to execute calculation');
      // Clear stale results on error to avoid confusion
      setResults(null);
      setExecutionTime(null);
      setTotalTime(null);
    } finally {
      setExecuting(false);
      currentRequestRef.current = null;
    }
  };

  // Smart step size calculator
  const getSmartStep = (value: number | undefined, min: number | undefined, max: number | undefined) => {
    // If we have min and max, calculate step based on range
    if (min !== undefined && max !== undefined) {
      const range = max - min;
      // Use ~1% of range as step
      const step = Math.max(range / 100, 0.01);
      // If both min and max are integers, use integer steps only
      if (Number.isInteger(min) && Number.isInteger(max)) {
        return Math.max(Math.floor(step), 1);
      }
      return step;
    }

    // Otherwise, base step on current value
    const currentValue = value || 0;
    const absValue = Math.abs(currentValue);

    // If the value is an integer, never use decimal steps
    if (Number.isInteger(currentValue) && currentValue !== 0) {
      if (absValue < 10) return 1;
      if (absValue < 100) return 10;
      if (absValue < 1000) return 100;
      if (absValue < 10000) return 1000;
      if (absValue < 100000) return 10000;
      return 100000;
    }

    // For decimal values or zero, use decimal steps
    if (absValue < 1) return 0.1;
    if (absValue < 10) return 1;
    if (absValue < 100) return 10;
    if (absValue < 1000) return 100;
    if (absValue < 10000) return 1000;
    if (absValue < 100000) return 10000;
    return 100000;
  };

  const renderInputControl = useCallback((input: ServiceData['inputs'][0]) => {
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

    if (input.type === 'number') {
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
            placeholder={input.aiExamples?.[0] || `Enter ${input.title || input.name}`}
            size="middle"
            keyboard={true}
            formatter={(value) => {
              if (!value) return '';
              const num = parseFloat(value.toString());
              if (isNaN(num)) return value.toString();
              // Show no decimals for integers, up to 2 for decimals
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
          placeholder={input.aiExamples?.[0] || `Enter ${input.title || input.name}`}
          size="middle"
        />
      </Form.Item>
    );
  }, [formatters]);

  const formatOutput = useCallback((output: ServiceData['outputs'][0], value: any) => {
    // Use AI presentation hint if available
    const hint = output.aiPresentationHint?.toLowerCase() || '';

    if (hint.includes('currency')) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return formatters.currency.format(num);
      }
    }

    if (hint.includes('percentage')) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return `${(num * 100).toFixed(2)}%`;
      }
    }

    if (typeof value === 'number') {
      // Don't show decimal places for integers
      if (Number.isInteger(value)) {
        return formatters.integer.format(value);
      }
      // Show up to 2 decimal places for decimals
      return formatters.decimal.format(value);
    }

    return value;
  }, [formatters]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Spin size="default" />
      </div>
    );
  }

  if (error && !serviceData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: 16
      }}>
        <Card style={{ maxWidth: 600, width: '100%', padding: '24px 32px' }}>
          <Alert
            message="Access Denied"
            description={error}
            type="error"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: 16
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card style={{ padding: '24px 32px', marginTop: 20 }}>
          {/* Service Title */}
          <Title level={2} style={{ marginBottom: 24, marginTop: 0, fontSize: 24 }}>
            {serviceData?.name}
          </Title>

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              closable
              onClose={() => setError(null)}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Input Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleExecute}
            size="middle"
            initialValues={initialValues}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '0px 16px',
              marginBottom: 24
            }}>
              {serviceData?.inputs.map(input => renderInputControl(input))}
            </div>

            <Button
              type="primary"
              htmlType="submit"
              icon={<PlayCircleOutlined />}
              loading={executing}
              size="large"
              block
              style={{ height: 48, fontSize: 15, fontWeight: 600, backgroundColor: '#4F2D7F', borderColor: '#4F2D7F' }}
            >
              {executing ? 'Calculating...' : 'Calculate Results'}
            </Button>
          </Form>

          {/* Results */}
          {results && (
            <>
              <div style={{ marginTop: 32 }}>
                <Title level={4} style={{ marginBottom: 16, marginTop: 0, fontSize: 16, fontWeight: 600 }}>
                  Results
                </Title>
                <div style={{
                  backgroundColor: '#f8f8f8',
                  borderRadius: 6,
                  overflow: 'hidden',
                  opacity: executing ? 0.5 : 1,
                  transition: 'opacity 0.3s ease'
                }}>
                  {serviceData?.outputs.map((output, index) => {
                    const value = results[output.name];
                    if (value === undefined || value === null) return null;

                    return (
                      <div key={output.name} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: index < (serviceData?.outputs.length || 0) - 1 ? '1px solid #e8e8e8' : 'none'
                      }}>
                        <div style={{
                          fontSize: 14,
                          color: '#333',
                          fontWeight: 400
                        }}>
                          {output.title || output.name}:
                        </div>
                        <div style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#4F2D7F'
                        }}>
                          {formatOutput(output, value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer inside card */}
              <div style={{
                marginTop: 24,
                color: '#999',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                {(executionTime !== null || totalTime !== null) && (
                  <>
                    <span>
                      {executionTime !== null && totalTime !== null
                        ? `${executionTime}ms / ${totalTime}ms (calc / total)`
                        : executionTime !== null
                        ? `${executionTime}ms`
                        : `${totalTime}ms`
                      }
                    </span>
                    <span>•</span>
                  </>
                )}
                <a href="https://spreadapi.io" target="_blank" rel="noopener noreferrer" style={{ color: '#4F2D7F', textDecoration: 'none' }}>
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
