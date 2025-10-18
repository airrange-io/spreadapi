'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, Form, Input, InputNumber, Button, Space, Alert, Spin, Typography, Divider } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface ServiceData {
  name: string;
  description: string;
  inputs: Array<{
    name: string;
    title?: string;
    description?: string;
    type: string;
    mandatory?: boolean;
    min?: number;
    max?: number;
    aiExamples?: string[];
  }>;
  outputs: Array<{
    name: string;
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
  const [results, setResults] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!token) {
      setError('No access token provided');
      setLoading(false);
      return;
    }

    loadServiceData();
  }, [serviceId, token]);

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

    } catch (err: any) {
      setError(err.message || 'Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (values: any) => {
    try {
      setExecuting(true);
      setError(null);
      setResults(null);

      const response = await fetch(`/api/v1/services/${serviceId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Execution failed');
      }

      const data = await response.json();
      setResults(data);

    } catch (err: any) {
      setError(err.message || 'Failed to execute calculation');
    } finally {
      setExecuting(false);
    }
  };

  const renderInputControl = (input: ServiceData['inputs'][0]) => {
    const label = (
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {input.title || input.name}
          {!input.mandatory && <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>(Optional)</Text>}
        </div>
        {input.description && (
          <div style={{ fontSize: 12, color: '#666', fontWeight: 400, marginBottom: 8 }}>
            {input.description}
          </div>
        )}
      </div>
    );

    if (input.type === 'number') {
      return (
        <Form.Item
          key={input.name}
          name={input.name}
          label={label}
          rules={[{ required: input.mandatory !== false, message: `Please enter ${input.title || input.name}` }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={input.min}
            max={input.max}
            step={input.min !== undefined && input.max !== undefined ?
              (input.max - input.min) / 100 :
              0.01
            }
            placeholder={input.aiExamples?.[0] || `Enter ${input.title || input.name}`}
            size="large"
          />
        </Form.Item>
      );
    }

    if (input.type === 'boolean') {
      return (
        <Form.Item
          key={input.name}
          name={input.name}
          label={label}
          valuePropName="checked"
        >
          <Input
            type="checkbox"
            size="large"
          />
        </Form.Item>
      );
    }

    // Default to string/text
    return (
      <Form.Item
        key={input.name}
        name={input.name}
        label={label}
        rules={[{ required: input.mandatory !== false, message: `Please enter ${input.title || input.name}` }]}
      >
        <Input
          placeholder={input.aiExamples?.[0] || `Enter ${input.title || input.name}`}
          size="large"
        />
      </Form.Item>
    );
  };

  const formatOutput = (output: ServiceData['outputs'][0], value: any) => {
    // Use AI presentation hint if available
    const hint = output.aiPresentationHint?.toLowerCase() || '';

    if (hint.includes('currency')) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
      }
    }

    if (hint.includes('percentage')) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return `${(num * 100).toFixed(2)}%`;
      }
    }

    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
    }

    return value;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Spin size="large" />
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
        padding: 24
      }}>
        <Card style={{ maxWidth: 600, width: '100%' }}>
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
      padding: 24
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            {serviceData?.name}
          </Title>
          {serviceData?.description && (
            <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 0 }}>
              {serviceData.description}
            </Paragraph>
          )}
        </Card>

        {/* Input Form */}
        <Card
          title={<span style={{ fontSize: 18, fontWeight: 600 }}>Input Parameters</span>}
          style={{ marginBottom: 24 }}
        >
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              closable
              onClose={() => setError(null)}
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleExecute}
            size="large"
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {serviceData?.inputs.map(input => renderInputControl(input))}
            </Space>

            <Divider />

            <Button
              type="primary"
              htmlType="submit"
              icon={<PlayCircleOutlined />}
              loading={executing}
              size="large"
              block
              style={{ height: 56, fontSize: 16, fontWeight: 600 }}
            >
              {executing ? 'Calculating...' : 'Calculate Results'}
            </Button>
          </Form>
        </Card>

        {/* Results */}
        {results && (
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                <span style={{ fontSize: 18, fontWeight: 600 }}>Results</span>
              </Space>
            }
            style={{
              borderColor: '#52c41a',
              borderWidth: 2
            }}
          >
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
              {serviceData?.outputs.map(output => {
                const value = results[output.name];
                if (value === undefined || value === null) return null;

                return (
                  <div key={output.name}>
                    <div style={{
                      fontSize: 14,
                      color: '#666',
                      marginBottom: 4,
                      fontWeight: 500
                    }}>
                      {output.title || output.name}
                    </div>
                    <div style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: '#1890ff'
                    }}>
                      {formatOutput(output, value)}
                    </div>
                    {output.description && (
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {output.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </Space>
          </Card>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 48,
          paddingBottom: 24,
          color: '#999',
          fontSize: 13
        }}>
          Powered by <strong>SpreadAPI</strong>
        </div>
      </div>
    </div>
  );
}
