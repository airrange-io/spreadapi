'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Space, Typography, Alert, Form, Row, Col, Tooltip, App } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, CopyOutlined, ExportOutlined } from '@ant-design/icons';
import { useServicePrewarm } from '@/hooks/useServicePrewarm';
import { InputRenderer } from '@/components/InputRenderer';

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
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [wizardTesting, setWizardTesting] = useState(false);
  const [wizardResult, setWizardResult] = useState<any>(null);
  const [wizardError, setWizardError] = useState<string>('');
  const [wizardResponseTime, setWizardResponseTime] = useState<number>(0);
  const [totalCalls, setTotalCalls] = useState<number>(0);
  const [responseBoxHeight, setResponseBoxHeight] = useState<number>(200);
  const containerWidth = propsContainerWidth || 0;
  const isMounted = useRef(false);
  const responseBoxRef = useRef<HTMLDivElement>(null);

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
    // Update form fields with initial values
    form.setFieldsValue(initialValues);
  }, [inputs, form]);


  const handleWizardTest = async () => {
    setWizardTesting(true);
    setWizardError('');
    // Don't clear wizardResult - keep previous results visible while loading

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

  // Handle opening URL in new tab
  const handleOpenUrl = () => {
    if (wizardUrl) {
      window.open(wizardUrl, '_blank', 'noopener,noreferrer');
    }
  };

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

  // Calculate dynamic height for API Response box
  useEffect(() => {
    const calculateHeight = () => {
      if (responseBoxRef.current && wizardResult) {
        const rect = responseBoxRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const bottomMargin = 60;
        const minHeight = 200;

        // Calculate available space: viewport height - element top position - bottom margin
        const availableHeight = viewportHeight - rect.top - bottomMargin;

        // Use the larger of minHeight or availableHeight
        const dynamicHeight = Math.max(minHeight, availableHeight);

        setResponseBoxHeight(dynamicHeight);
      }
    };

    // Calculate on mount and when result changes
    calculateHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [wizardResult, wizardError]);

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

  return (
    <div style={{ width: '100%' }}>
      <Space orientation="vertical" style={{ width: '100%' }} size={8}>
          {/* Input Parameters Form */}
          {inputs.length > 0 && (
            <div style={{
              background: '#fafafa',
              borderRadius: 6,
              padding: '14px 14px 6px 14px',
            }}>
              <div style={{ fontSize: 13, color: '#595959', marginBottom: 12 }}>
                Input Parameters
              </div>
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
                <Row gutter={[16, 4]}>
                  {inputs.map((input) => (
                    <Col key={input.id} span={getColumnSpan()}>
                      <InputRenderer
                        input={input}
                        fieldName={input.name}
                        showLabel={true}
                        marginBottom={8}
                        hideAiDescriptions={true}
                      />
                    </Col>
                  ))}
                </Row>
              </Form>
            </div>
          )}

          {/* Dynamic URL Input */}
          <div style={{
            background: '#fafafa',
            borderRadius: 6,
            padding: '10px 14px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              fontSize: 13,
              color: '#595959'
            }}>
              <Tooltip title={isPublished ?
                'This endpoint is active and ready to receive requests' :
                'This endpoint is in draft mode. Publish the service to make it available.'
              }>
                <span style={{
                  background: isPublished ? '#52c41a' : '#faad14',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'help'
                }}>GET</span>
              </Tooltip>
              <span style={{ flex: 1 }}>Test URL</span>
              {requireToken && (
                <>
                  <span style={{ color: '#d9d9d9' }}>|</span>
                  <span style={{ color: '#faad14', fontSize: 12 }}>
                    Replace REPLACE_WITH_YOUR_TOKEN with your actual token
                  </span>
                </>
              )}
              <Tooltip title="Copy URL to clipboard">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(wizardUrl);
                    message.success('URL copied to clipboard');
                  }}
                  style={{ color: '#8c8c8c' }}
                />
              </Tooltip>
            </div>
            <TextArea
              value={wizardUrl}
              onChange={(e) => setWizardUrl(e.target.value)}
              rows={3}
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                background: 'white',
                border: '1px solid #e8e8e8'
              }}
              disabled={!isPublished}
            />
          </div>

          {/* Test Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 15, marginBottom: 15 }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleWizardTest}
              loading={wizardTesting}
              disabled={!isPublished}
              style={{ boxShadow: 'none', flex: 1 }}
            >
              Run Test
            </Button>
            <Tooltip title="Open URL in new tab">
              <Button
                icon={<ExportOutlined />}
                onClick={handleOpenUrl}
                disabled={!isPublished || !wizardUrl}
              />
            </Tooltip>
          </div>

          {/* Results Section */}
          {(wizardResult || wizardError) && (
            <div style={{
              opacity: wizardTesting ? 0.5 : 1,
              transition: 'opacity 0.15s ease-in-out',
              pointerEvents: wizardTesting ? 'none' : 'auto'
            }}>
              {/* Output Results - Clean grid of result boxes */}
              {wizardResult && wizardResult.outputs && wizardResult.outputs.length > 0 && (
                <Row gutter={[12, 12]}>
                  {wizardResult.outputs.map((output: any) => {
                    const displayTitle = output.title || output.name;

                    // Format the value based on type
                    let displayValue: React.ReactNode;
                    let valueStyle: React.CSSProperties = {
                      fontSize: 20,
                      fontWeight: 600,
                      color: '#262626',
                      lineHeight: 1.2
                    };

                    if (typeof output.value === 'number') {
                      const formatted = new Intl.NumberFormat(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 4
                      }).format(output.value);
                      displayValue = formatted;
                    } else if (typeof output.value === 'boolean') {
                      displayValue = output.value ? '✓ Yes' : '✗ No';
                      valueStyle.color = output.value ? '#52c41a' : '#8c8c8c';
                    } else if (Array.isArray(output.value)) {
                      if (output.value.length === 0) {
                        displayValue = 'Empty';
                        valueStyle.color = '#8c8c8c';
                      } else if (Array.isArray(output.value[0])) {
                        const rows = output.value.length;
                        const cols = output.value[0].length;
                        displayValue = `${rows} × ${cols}`;
                        valueStyle.fontSize = 16;
                      } else {
                        displayValue = `${output.value.length} items`;
                        valueStyle.fontSize = 16;
                      }
                    } else if (output.value === null || output.value === undefined) {
                      displayValue = '—';
                      valueStyle.color = '#8c8c8c';
                    } else {
                      const strValue = String(output.value);
                      displayValue = strValue.length > 20 ? (
                        <Tooltip title={strValue}>
                          <span>{strValue.substring(0, 18)}...</span>
                        </Tooltip>
                      ) : strValue;
                      valueStyle.fontSize = 16;
                    }

                    return (
                      <Col key={output.name} span={getColumnSpan()}>
                        <div style={{
                          background: '#fafafa',
                          borderRadius: 8,
                          padding: '12px 16px',
                          height: '100%'
                        }}>
                          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                            {displayTitle}
                          </div>
                          <div style={valueStyle}>
                            {displayValue}
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              )}

              {/* Call Statistics - Unified subtle bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                padding: '10px 14px',
                marginTop: 12,
                background: '#fafafa',
                borderRadius: 6,
                fontSize: 13,
                color: '#595959'
              }}>
                {wizardError ? (
                  <span style={{ color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <InfoCircleOutlined /> Error
                  </span>
                ) : (
                  <span style={{ color: '#52c41a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircleOutlined /> Success
                  </span>
                )}
                <span style={{ color: '#d9d9d9' }}>|</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                  {wizardResponseTime} ms
                </span>
                {wizardResult?.metadata && (
                  <>
                    <span style={{ color: '#d9d9d9' }}>|</span>
                    <span style={{ color: '#8c8c8c' }}>
                      {wizardResult.metadata.fromProcessCache && "process cache"}
                      {wizardResult.metadata.fromRedisCache && "redis cache"}
                      {wizardResult.metadata.fromResultCache && "result cache"}
                      {!(wizardResult.metadata.fromProcessCache ||
                         wizardResult.metadata.fromRedisCache ||
                         wizardResult.metadata.fromResultCache) && "fresh calculation"}
                    </span>
                  </>
                )}
              </div>

              {/* Error Display */}
              {wizardError && (
                <Alert
                  message={wizardError}
                  type="error"
                  showIcon
                  style={{ marginTop: 8 }}
                />
              )}

              {/* Raw API Response (collapsible) */}
              {wizardResult && (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: 'pointer', color: '#8c8c8c', fontSize: 12 }}>
                    View raw response
                  </summary>
                  <div
                    ref={responseBoxRef}
                    style={{
                      background: '#fafafa',
                      padding: 12,
                      borderRadius: 6,
                      maxHeight: responseBoxHeight,
                      overflow: 'auto',
                      marginTop: 8
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: 11, color: '#595959' }}>
                      {JSON.stringify(wizardResult, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          )}
      </Space>
    </div>
  );
};

export default ServiceTester;