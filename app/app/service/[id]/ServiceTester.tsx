'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Button, Input, Space, Typography, Alert, Form, InputNumber, Switch, Statistic, Row, Col, Divider } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, ApiOutlined } from '@ant-design/icons';
import CollapsibleSection from './components/CollapsibleSection';
import { useServicePrewarm } from '@/hooks/useServicePrewarm';

const { Text } = Typography;
const { TextArea } = Input;

interface ServiceTesterProps {
  serviceId: string;
  serviceName?: string;
  isPublished: boolean;
  inputs: any[];
  outputs: any[];
  requireToken?: boolean;
  existingToken?: string;
  containerWidth?: number;
  onTestComplete?: () => void;
}

const ServiceTester: React.FC<ServiceTesterProps> = ({
  serviceId,
  serviceName,
  isPublished,
  inputs,
  outputs,
  requireToken,
  existingToken,
  containerWidth: propsContainerWidth,
  onTestComplete
}) => {
  const [form] = Form.useForm();
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [wizardTesting, setWizardTesting] = useState(false);
  const [wizardResult, setWizardResult] = useState<any>(null);
  const [wizardError, setWizardError] = useState<string>('');
  const [wizardResponseTime, setWizardResponseTime] = useState<number>(0);
  const [totalCalls, setTotalCalls] = useState<number>(0);
  const containerWidth = propsContainerWidth || 0;
  const isMounted = useRef(false);
  
  // Prewarm the service when component mounts
  useServicePrewarm(serviceId, isPublished);

  // Initialize parameter values from inputs
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    inputs.forEach(input => {
      const key = input.name;
      // Use the provided value, or set appropriate defaults
      if (input.value !== undefined && input.value !== null) {
        initialValues[key] = input.value;
      } else if (input.type === 'number') {
        // For numbers, use min value or 0 as default
        initialValues[key] = input.min || 0;
      } else if (input.type === 'boolean') {
        initialValues[key] = false;
      } else {
        initialValues[key] = '';
      }
    });
    setParameterValues(initialValues);
  }, [inputs]);


  const handleWizardTest = async () => {
    setWizardTesting(true);
    setWizardError('');
    setWizardResult(null);

    // Validate form before testing
    try {
      await form.validateFields();
    } catch (error) {
      setWizardError('Please fill in all required fields');
      setWizardTesting(false);
      return;
    }

    // Get current form values and build URL
    const currentFormValues = form.getFieldsValue();
    const testUrl = buildWizardUrl(currentFormValues);
    
    const startTime = Date.now();

    try {
      const response = await fetch(testUrl);
      const responseTime = Date.now() - startTime;
      // We'll update this after we get the actual calculation time from the response
      setWizardResponseTime(responseTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        // Check if it's a missing parameters error
        if (errorData.error === 'Missing required parameters' && errorData.details) {
          const requiredParams = errorData.details.required.map((p: any) => p.name).join(', ');
          throw new Error(`Missing required parameters: ${requiredParams}`);
        }
        throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setWizardResult(data);
      setTotalCalls(prev => prev + 1);
      
      // Use the actual calculation time from the response if available
      if (data.metadata && data.metadata.executionTime !== undefined) {
        setWizardResponseTime(data.metadata.executionTime);
      } else if (data.metadata && data.metadata.totalTime !== undefined) {
        setWizardResponseTime(data.metadata.totalTime);
      }
      
      // Trigger callback to refresh tokens if test was successful
      if (onTestComplete && requireToken) {
        onTestComplete();
      }
    } catch (error: any) {
      setWizardError(error.message || 'Failed to test API');
    } finally {
      setWizardTesting(false);
    }
  };

  // Remove this function as Form handles the state

  // Build wizard test URL dynamically
  const buildWizardUrl = (params: Record<string, any>) => {
    const baseUrl = `${window.location.origin}/api/v1/services/${serviceId}/execute`;
    const urlParams = new URLSearchParams();


    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlParams.append(key, String(value));
      }
    });

    if (requireToken) {
      // Always use placeholder since we don't have the actual token value
      // Users need to replace this with their actual token
      urlParams.append('token', 'REPLACE_WITH_YOUR_TOKEN');
    }

    const finalUrl = `${baseUrl}?${urlParams.toString()}`;
    return finalUrl;
  };

  const [wizardUrl, setWizardUrl] = useState('');

  // Update wizard URL when parameters change
  useEffect(() => {
    // Use parameterValues directly since form might not be synced yet
    setWizardUrl(buildWizardUrl(parameterValues));
  }, [parameterValues, serviceId, requireToken, existingToken]);

  // Track mounted state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Sync form values when parameterValues change  
  // No need for this effect since we're using initialValues on the Form
  // and onValuesChange to keep parameterValues in sync


  // Get column span based on container width
  const getColumnSpan = () => {
    // Fallback to a reasonable default if width measurement fails
    const effectiveWidth = containerWidth || 800;
    
    if (effectiveWidth < 600) return 24; // 1 column for small containers
    if (effectiveWidth < 900) return 12; // 2 columns for medium containers
    if (effectiveWidth < 1200) return 8; // 3 columns for large containers
    return 6; // 4 columns for extra large containers
  };

  // Alternative: CSS Grid approach (for future refactoring)
  // <div style={{
  //   display: 'grid',
  //   gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  //   gap: '16px'
  // }}>
  //   {inputs.map(input => <div key={input.id}>...</div>)}
  // </div>

  // Get column span for statistics
  const getStatColumnSpan = () => {
    if (containerWidth === 0 || containerWidth < 400) return 24; // 1 column
    if (containerWidth < 600) return 12; // 2 columns
    if (containerWidth < 900) return 8; // 3 columns
    return 6; // 4 columns
  };

  const renderParameterInput = (input: any) => {
    // Debug log to check what types we're getting
    
    const commonProps = {
      style: { width: '100%' }
    };

    // Helper function to determine smart step size
    const getSmartStep = (value: number | undefined, min: number | undefined, max: number | undefined, fieldName: string) => {
      // If we have min and max, calculate step based on range
      if (min !== undefined && max !== undefined) {
        const range = max - min;
        if (range <= 1) return 0.01;
        if (range <= 10) return 0.1;
        if (range <= 100) return 1;
        if (range <= 1000) return 10;
        return 100;
      }

      // Otherwise, base step on current value
      // Use parameterValues instead of form.getFieldValue to avoid warning during initial render
      const currentValue = value || parameterValues[fieldName] || 0;
      const absValue = Math.abs(currentValue);

      if (absValue === 0) return 1;
      if (absValue < 1) return 0.01;
      if (absValue < 10) return 0.1;
      if (absValue < 100) return 1;
      if (absValue < 1000) return 10;
      return 100;
    };

    // Check both type and dataType properties
    const inputType = input.type || input.dataType;
    const fieldName = input.name;

    switch (inputType) {
      case 'number':
        return (
          <InputNumber
            {...commonProps}
            min={input.min}
            max={input.max}
            step={getSmartStep(input.value, input.min, input.max, fieldName)}
            placeholder={`Enter ${input.name}`}
            keyboard={true}
            controls={true}
            precision={input.min !== undefined && input.max !== undefined && (input.max - input.min) <= 1 ? 2 : undefined}
          />
        );
      case 'boolean':
        return (
          <Switch />
        );
      default:
        return (
          <Input
            {...commonProps}
            placeholder={`Enter ${input.name}`}
          />
        );
    }
  };

  return (
    <>
      {/* Test the Published API Section */}
      <CollapsibleSection
        title="Test the Published API"
        defaultOpen={false}
      >
        <div style={{ width: '100%' }}>
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
          {/* Input Parameters Form */}
          <Form
            form={form}
            layout="vertical"
            initialValues={parameterValues}
            style={{ width: '100%' }}
            onValuesChange={(changedValues, allValues) => {
              setParameterValues(allValues);
              // Update URL immediately when values change
              setWizardUrl(buildWizardUrl(allValues));
            }}
          >
            {inputs.length > 0 && (
              <div style={{ width: '100%' }}>
                <Typography.Text strong style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 12 }}>
                  Input Parameters
                </Typography.Text>
                <Row gutter={[16, 8]}>
                  {inputs.map((input) => {
                    // Only span full width if the input has a description or is a text area
                    const shouldSpanFull = false; // Allow all inputs to use responsive columns
                    const colSpan = shouldSpanFull ? 24 : getColumnSpan();
                    
                    return (
                      <Col key={input.id} span={colSpan}>
                        <Form.Item
                          name={input.name}
                          label={
                            <Space>
                              <span>{input.title || input.name}</span>
                              {input.mandatory && <Typography.Text type="danger">*</Typography.Text>}
                            </Space>
                          }
                          help={input.description}
                          rules={[
                            {
                              required: input.mandatory,
                              message: `Please enter ${input.name}`
                            }
                          ]}
                        >
                          {renderParameterInput(input)}
                        </Form.Item>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            )}
          </Form>

          {/* Dynamic URL Input */}
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Test URL (Modify to test with different values):
            </Text>
            {requireToken && (
              <div style={{ marginTop: 4 }}>
                <Text type="warning" style={{ fontSize: 12 }}>
                  ⚠️ Replace REPLACE_WITH_YOUR_TOKEN with your actual token
                </Text>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  Note: Token usage is only tracked when using a real token, not the placeholder.
                </Text>
              </div>
            )}
            <TextArea
              value={wizardUrl}
              onChange={(e) => setWizardUrl(e.target.value)}
              rows={3}
              style={{
                marginTop: 4,
                fontFamily: 'monospace',
                fontSize: 12
              }}
              disabled={!isPublished}
            />
          </div>

          {/* Test Button */}
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleWizardTest}
            loading={wizardTesting}
            disabled={!isPublished}
            block
          >
            Run Test
          </Button>

          {/* Results Section */}
          {(wizardResult || wizardError) && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              
              {/* Output Results Statistics */}
              {wizardResult && wizardResult.outputs && wizardResult.outputs.length > 0 && (
                <>
                  <Typography.Text strong style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 12 }}>
                    Output Results
                  </Typography.Text>
                  <Row gutter={[16, 8]}>
                    {wizardResult.outputs.map((output: any) => {
                      
                      // Use title if available, otherwise alias or name
                      const displayTitle = output.title || output.name;
                      
                      // Format the value based on type
                      let displayValue: string | number;
                      let precision: number | undefined;
                      
                      if (typeof output.value === 'number') {
                        displayValue = output.value;
                        precision = 2;
                      } else if (typeof output.value === 'boolean') {
                        displayValue = output.value ? 'True' : 'False';
                      } else if (Array.isArray(output.value)) {
                        // Handle arrays/areas
                        if (output.value.length === 0) {
                          displayValue = 'Empty';
                        } else if (Array.isArray(output.value[0])) {
                          // 2D array (area)
                          const rows = output.value.length;
                          const cols = output.value[0].length;
                          displayValue = `${rows}×${cols} area`;
                        } else {
                          // 1D array
                          displayValue = `${output.value.length} items`;
                        }
                      } else if (output.value === null || output.value === undefined) {
                        displayValue = 'N/A';
                      } else {
                        // String or other - truncate if too long
                        const strValue = String(output.value);
                        displayValue = strValue.length > 20 ? strValue.substring(0, 17) + '...' : strValue;
                      }
                      
                        return (
                          <Col key={output.name} span={getColumnSpan()}>
                            <Statistic
                              title={displayTitle}
                              value={displayValue}
                              precision={precision}
                              valueStyle={{ 
                                fontSize: '18px',
                                color: output.error ? '#ff4d4f' : undefined
                              }}
                            />
                          </Col>
                        );
                      })}
                  </Row>
                </>
              )}
              
              {/* Call Statistics */}
              <Typography.Text strong style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 12 }}>
                Call Statistics
              </Typography.Text>
              <Row gutter={[16, 8]}>
                <Col span={getStatColumnSpan()}>
                  <Statistic
                    title="Calculation Time"
                    value={wizardResponseTime}
                    suffix="ms"
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ fontSize: '18px' }}
                  />
                  {wizardResult?.metadata && (
                    <Typography.Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                      {wizardResult.metadata.fromProcessCache && "From process cache"}
                      {wizardResult.metadata.fromRedisCache && "From Redis cache"}
                      {wizardResult.metadata.fromResultCache && "From result cache"}
                      {!(wizardResult.metadata.fromProcessCache || 
                         wizardResult.metadata.fromRedisCache || 
                         wizardResult.metadata.fromResultCache) && "Fresh calculation"}
                    </Typography.Text>
                  )}
                </Col>
                <Col span={getStatColumnSpan()}>
                  <Statistic
                    title="Status"
                    value={wizardError ? "Error" : "Success"}
                    valueStyle={{ color: wizardError ? '#ff4d4f' : '#52c41a', fontSize: '18px' }}
                    prefix={wizardError ? <InfoCircleOutlined /> : <CheckCircleOutlined />}
                  />
                </Col>
                <Col span={getStatColumnSpan()}>
                  <Statistic
                    title="Total Calls"
                    value={totalCalls}
                    prefix={<ApiOutlined />}
                    valueStyle={{ fontSize: '18px' }}
                  />
                </Col>
              </Row>

              {/* Result or Error Display */}
              <div style={{ marginTop: 16 }}>
                {wizardError ? (
                  <Alert
                    message="Test Failed"
                    description={wizardError}
                    type="error"
                    showIcon
                  />
                ) : (
                  <div>
                    <Typography.Text strong style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 8 }}>
                      API Response
                    </Typography.Text>
                    <div style={{
                      background: '#f5f5f5',
                      padding: 12,
                      borderRadius: 4,
                      maxHeight: 300,
                      overflow: 'auto'
                    }}>
                      <pre style={{ margin: 0, fontSize: 12 }}>
                        {JSON.stringify(wizardResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          </Space>
        </div>
      </CollapsibleSection>
    </>
  );
};

export default ServiceTester;