'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, Typography, Alert, Table, Tag, Timeline, Spin } from 'antd';
import { SubPageLayout } from '@/components/SubPageLayout';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface DiagnosticResult {
  token: string;
  cell: string;
  timestamp: string;
  layers: {
    processCache: {
      checked: boolean;
      found: boolean;
      responseTime: number;
      details?: any;
    };
    redisCache: {
      checked: boolean;
      found: boolean;
      responseTime: number;
      details?: any;
    };
    blobStorage: {
      checked: boolean;
      found: boolean;
      responseTime: number;
      details?: any;
    };
  };
  result?: any;
  error?: string;
  totalTime: number;
}

export default function CacheDiagnosticsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [history, setHistory] = useState<DiagnosticResult[]>([]);

  const handleDiagnose = async (values: any) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/diagnose-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: values.token,
          cell: values.cell,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Diagnosis failed');
      }

      setResult(data);
      setHistory(prev => [data, ...prev].slice(0, 5)); // Keep last 5 diagnoses
    } catch (err: any) {
      setResult({
        token: values.token,
        cell: values.cell,
        timestamp: new Date().toISOString(),
        error: err.message,
        layers: {
          processCache: { checked: false, found: false, responseTime: 0 },
          redisCache: { checked: false, found: false, responseTime: 0 },
          blobStorage: { checked: false, found: false, responseTime: 0 },
        },
        totalTime: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLayerStatus = (layer: any, name: string) => {
    if (!layer.checked) {
      return <Tag color="default">Not Checked</Tag>;
    }
    if (layer.found) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>Hit ({layer.responseTime}ms)</Tag>;
    }
    return <Tag color="warning" icon={<CloseCircleOutlined />}>Miss ({layer.responseTime}ms)</Tag>;
  };

  const columns = [
    {
      title: 'Cache Layer',
      dataIndex: 'layer',
      key: 'layer',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Response Time',
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time: number) => `${time}ms`,
    },
  ];

  return (
    <SubPageLayout title="Cache Diagnostics">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={4}>Diagnose Cache Lookup</Title>
          <Paragraph type="secondary">
            Test how a specific API request flows through the cache layers
          </Paragraph>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleDiagnose}
          >
            <Form.Item
              label="API Token"
              name="token"
              rules={[{ required: true, message: 'Please enter an API token' }]}
            >
              <Input placeholder="Enter API token to diagnose" />
            </Form.Item>

            <Form.Item
              label="Cell Reference"
              name="cell"
              rules={[{ required: true, message: 'Please enter a cell reference' }]}
            >
              <Input placeholder="e.g., A1, B2, Sheet1!C3" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SearchOutlined />}
                size="large"
              >
                Run Diagnosis
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {loading && (
          <Card>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              padding: '40px'
            }}>
              <Spin size="default" />
              <Paragraph style={{ marginTop: 16 }}>Running cache diagnosis...</Paragraph>
            </div>
          </Card>
        )}

        {result && !loading && (
          <>
            {result.error ? (
              <Alert
                message="Diagnosis Error"
                description={result.error}
                type="error"
                showIcon
              />
            ) : (
              <Card title="Diagnosis Results">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Token: </Text>
                    <Text code>{result.token}</Text>
                  </div>
                  <div>
                    <Text strong>Cell: </Text>
                    <Text code>{result.cell}</Text>
                  </div>
                  <div>
                    <Text strong>Total Time: </Text>
                    <Text>{result.totalTime}ms</Text>
                  </div>

                  <Timeline
                    items={[
                      {
                        color: result.layers.processCache.found ? 'green' : 'gray',
                        children: (
                          <div>
                            <Text strong>Process Cache</Text>
                            {renderLayerStatus(result.layers.processCache, 'Process Cache')}
                          </div>
                        ),
                      },
                      {
                        color: result.layers.redisCache.found ? 'green' : 'gray',
                        children: (
                          <div>
                            <Text strong>Redis Cache</Text>
                            {renderLayerStatus(result.layers.redisCache, 'Redis Cache')}
                          </div>
                        ),
                      },
                      {
                        color: result.layers.blobStorage.found ? 'green' : 'gray',
                        children: (
                          <div>
                            <Text strong>Blob Storage</Text>
                            {renderLayerStatus(result.layers.blobStorage, 'Blob Storage')}
                          </div>
                        ),
                      },
                    ]}
                  />

                  {result.result && (
                    <Card type="inner" title="Result">
                      <pre style={{
                        backgroundColor: '#f5f5f5',
                        padding: '12px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '200px',
                      }}>
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </Card>
                  )}
                </Space>
              </Card>
            )}
          </>
        )}

        {history.length > 0 && (
          <Card title="Recent Diagnoses">
            <Table
              dataSource={history.map((item, index) => ({
                key: index,
                timestamp: new Date(item.timestamp).toLocaleString(),
                token: item.token.slice(0, 8) + '...',
                cell: item.cell,
                processCache: item.layers.processCache.found,
                redisCache: item.layers.redisCache.found,
                blobStorage: item.layers.blobStorage.found,
                totalTime: item.totalTime,
              }))}
              columns={[
                {
                  title: 'Time',
                  dataIndex: 'timestamp',
                  key: 'timestamp',
                },
                {
                  title: 'Token',
                  dataIndex: 'token',
                  key: 'token',
                },
                {
                  title: 'Cell',
                  dataIndex: 'cell',
                  key: 'cell',
                },
                {
                  title: 'Process',
                  dataIndex: 'processCache',
                  key: 'processCache',
                  render: (found: boolean) => found ? 
                    <Tag color="success">Hit</Tag> : 
                    <Tag color="default">Miss</Tag>,
                },
                {
                  title: 'Redis',
                  dataIndex: 'redisCache',
                  key: 'redisCache',
                  render: (found: boolean) => found ? 
                    <Tag color="success">Hit</Tag> : 
                    <Tag color="default">Miss</Tag>,
                },
                {
                  title: 'Blob',
                  dataIndex: 'blobStorage',
                  key: 'blobStorage',
                  render: (found: boolean) => found ? 
                    <Tag color="success">Hit</Tag> : 
                    <Tag color="default">Miss</Tag>,
                },
                {
                  title: 'Total (ms)',
                  dataIndex: 'totalTime',
                  key: 'totalTime',
                },
              ]}
              size="small"
              pagination={false}
            />
          </Card>
        )}
      </Space>
    </SubPageLayout>
  );
}