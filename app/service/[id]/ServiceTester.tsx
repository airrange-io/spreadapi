'use client';

import React, { useState, useEffect, lazy, Suspense, useRef, useLayoutEffect } from 'react';
import { Button, Input, Space, Typography, Alert, Form, InputNumber, Switch, Statistic, Row, Col, Divider, Spin } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, ApiOutlined } from '@ant-design/icons';
import CollapsibleSection from './components/CollapsibleSection';

// Lazy load the IntegrationExamples component
const IntegrationExamples = lazy(() => import('./components/IntegrationExamples'));

const { Text } = Typography;
const { TextArea } = Input;

interface ServiceTesterProps {
  serviceId: string;
  isPublished: boolean;
  inputs: any[];
  outputs: any[];
  requireToken?: boolean;
  existingToken?: string;
  containerWidth?: number;
}

const ServiceTester: React.FC<ServiceTesterProps> = ({
  serviceId,
  isPublished,
  inputs,
  outputs,
  requireToken,
  existingToken,
  containerWidth: propsContainerWidth
}) => {
  const [form] = Form.useForm();
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [wizardTesting, setWizardTesting] = useState(false);
  const [wizardResult, setWizardResult] = useState<any>(null);
  const [wizardError, setWizardError] = useState<string>('');
  const [wizardResponseTime, setWizardResponseTime] = useState<number>(0);
  const [totalCalls, setTotalCalls] = useState<number>(0);
  const containerWidth = propsContainerWidth || 0;

  // Initialize parameter values from inputs
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    inputs.forEach(input => {
      initialValues[input.alias || input.name] = input.value || '';
    });
    setParameterValues(initialValues);
    form.setFieldsValue(initialValues);
  }, [inputs, form]);


  const handleWizardTest = async () => {
    setWizardTesting(true);
    setWizardError('');
    setWizardResult(null);

    // Use the wizardUrl state which can be manually edited
    const testUrl = wizardUrl;
    const startTime = Date.now();

    try {
      const response = await fetch(testUrl);
      const responseTime = Date.now() - startTime;
      setWizardResponseTime(responseTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setWizardResult(data);
      setTotalCalls(prev => prev + 1);
    } catch (error: any) {
      setWizardError(error.message || 'Failed to test API');
    } finally {
      setWizardTesting(false);
    }
  };

  const handleParameterChange = (name: string, value: any) => {
    setParameterValues(prev => ({ ...prev, [name]: value }));
  };

  // Build wizard test URL dynamically
  const buildWizardUrl = (params: Record<string, any>) => {
    const baseUrl = `${window.location.origin}/api/getresults`;
    const urlParams = new URLSearchParams();
    urlParams.append('id', serviceId);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlParams.append(key, String(value));
      }
    });

    if (requireToken) {
      // Use a clear placeholder that indicates the user needs to replace it
      urlParams.append('token', 'REPLACE_WITH_YOUR_TOKEN');
    }

    return `${baseUrl}?${urlParams.toString()}`;
  };

  const [wizardUrl, setWizardUrl] = useState('');

  // Update wizard URL when parameters change
  useEffect(() => {
    setWizardUrl(buildWizardUrl(parameterValues));
  }, [parameterValues, serviceId, requireToken, existingToken]);


  // Get column span based on container width
  const getColumnSpan = () => {
    if (containerWidth === 0 || containerWidth < 400) return 24; // 1 column
    if (containerWidth < 600) return 12; // 2 columns
    if (containerWidth < 900) return 8; // 3 columns
    return 6; // 4 columns
  };

  // Get column span for statistics
  const getStatColumnSpan = () => {
    if (containerWidth === 0 || containerWidth < 400) return 24; // 1 column
    if (containerWidth < 600) return 12; // 2 columns
    if (containerWidth < 900) return 8; // 3 columns
    return 6; // 4 columns
  };

  const renderParameterInput = (input: any) => {
    const commonProps = {
      style: { width: '100%' },
      onChange: (value: any) => handleParameterChange(input.alias || input.name, value)
    };

    switch (input.type) {
      case 'number':
        return (
          <InputNumber
            {...commonProps}
            min={input.min}
            max={input.max}
            placeholder={`Enter ${input.name}`}
          />
        );
      case 'boolean':
        return (
          <Switch
            checked={parameterValues[input.alias || input.name] || false}
            onChange={(checked) => handleParameterChange(input.alias || input.name, checked)}
          />
        );
      default:
        return (
          <Input
            {...commonProps}
            placeholder={`Enter ${input.name}`}
            onChange={(e) => handleParameterChange(input.alias || input.name, e.target.value)}
          />
        );
    }
  };

  return (
    <>
      {/* Quick Test Section */}
      <CollapsibleSection 
        title="Quick Test"
        defaultOpen={false}
      >
        <div style={{ width: '100%' }}>
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
          {/* Input Parameters Form */}
          {inputs.length > 0 && (
            <div style={{ width: '100%' }}>
              <Typography.Text strong style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 12 }}>
                Input Parameters {containerWidth > 0 && `(${containerWidth}px)`}
              </Typography.Text>
              <Form
                form={form}
                layout="vertical"
                initialValues={parameterValues}
                style={{ width: '100%' }}
              >
                <Row gutter={[16, 8]}>
                  {inputs.map((input) => {
                    // For text inputs or inputs with descriptions, span full width
                    const shouldSpanFull = input.type !== 'number' && input.type !== 'boolean';
                    const colSpan = shouldSpanFull ? 24 : getColumnSpan();
                    
                    return (
                      <Col key={input.id} span={colSpan}>
                        <Form.Item
                          name={input.alias || input.name}
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
              </Form>
            </div>
          )}

          {/* Dynamic URL Input */}
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Test URL (Modify to test with different values):
              {requireToken && (
                <Text type="warning" style={{ fontSize: 12, marginLeft: 8 }}>
                  ⚠️ Replace REPLACE_WITH_YOUR_TOKEN with your actual token
                </Text>
              )}
            </Text>
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
                      const displayTitle = output.title || output.alias || output.name;
                      
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
                          <Col key={output.name || output.alias} span={getColumnSpan()}>
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
                    title="Response Time"
                    value={wizardResponseTime}
                    suffix="ms"
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ fontSize: '18px' }}
                  />
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

      {/* Integration Examples Section */}
      <CollapsibleSection 
        title="Integration Examples" 
        defaultOpen={false}
        style={{ marginTop: 12 }}
      >
        <Suspense fallback={
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="small" />
          </div>
        }>
          <IntegrationExamples 
            serviceId={serviceId}
            requireToken={requireToken}
            parameterValues={parameterValues}
          />
        </Suspense>
      </CollapsibleSection>
    </>
  );
};

export default ServiceTester;