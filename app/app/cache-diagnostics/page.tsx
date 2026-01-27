'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, Typography, Alert, Table, Tag, Timeline, Spin } from 'antd';
import { SubPageLayout } from '@/components/SubPageLayout';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();
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
      return <Tag color="default">{t('cacheDiag.notChecked')}</Tag>;
    }
    if (layer.found) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>{t('cacheDiag.hitWithTime', { time: layer.responseTime })}</Tag>;
    }
    return <Tag color="warning" icon={<CloseCircleOutlined />}>{t('cacheDiag.missWithTime', { time: layer.responseTime })}</Tag>;
  };

  const columns = [
    {
      title: t('cacheDiag.cacheLayer'),
      dataIndex: 'layer',
      key: 'layer',
    },
    {
      title: t('cacheDiag.status'),
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: t('cacheDiag.responseTime'),
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time: number) => `${time}ms`,
    },
  ];

  return (
    <SubPageLayout title={t('cacheDiag.title')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={4}>{t('cacheDiag.diagnoseLookup')}</Title>
          <Paragraph type="secondary">
            {t('cacheDiag.diagnoseLookupDesc')}
          </Paragraph>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleDiagnose}
          >
            <Form.Item
              label={t('cacheDiag.apiToken')}
              name="token"
              rules={[{ required: true, message: t('cacheDiag.apiTokenRequired') }]}
            >
              <Input placeholder={t('cacheDiag.apiTokenPlaceholder')} />
            </Form.Item>

            <Form.Item
              label={t('cacheDiag.cellReference')}
              name="cell"
              rules={[{ required: true, message: t('cacheDiag.cellReferenceRequired') }]}
            >
              <Input placeholder={t('cacheDiag.cellReferencePlaceholder')} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SearchOutlined />}
                size="large"
              >
                {t('cacheDiag.runDiagnosis')}
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
              <Paragraph style={{ marginTop: 16 }}>{t('cacheDiag.running')}</Paragraph>
            </div>
          </Card>
        )}

        {result && !loading && (
          <>
            {result.error ? (
              <Alert
                title={t('cacheDiag.diagnosisError')}
                description={result.error}
                type="error"
                showIcon
              />
            ) : (
              <Card title={t('cacheDiag.diagnosisResults')}>
                <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text strong>{t('cacheDiag.tokenLabel')} </Text>
                    <Text code>{result.token}</Text>
                  </div>
                  <div>
                    <Text strong>{t('cacheDiag.cellLabel')} </Text>
                    <Text code>{result.cell}</Text>
                  </div>
                  <div>
                    <Text strong>{t('cacheDiag.totalTime')} </Text>
                    <Text>{result.totalTime}ms</Text>
                  </div>

                  <Timeline
                    items={[
                      {
                        color: result.layers.processCache.found ? 'green' : 'gray',
                        children: (
                          <div>
                            <Text strong>{t('cacheDiag.processCache')}</Text>
                            {renderLayerStatus(result.layers.processCache, 'Process Cache')}
                          </div>
                        ),
                      },
                      {
                        color: result.layers.redisCache.found ? 'green' : 'gray',
                        children: (
                          <div>
                            <Text strong>{t('cacheDiag.redisCache')}</Text>
                            {renderLayerStatus(result.layers.redisCache, 'Redis Cache')}
                          </div>
                        ),
                      },
                      {
                        color: result.layers.blobStorage.found ? 'green' : 'gray',
                        children: (
                          <div>
                            <Text strong>{t('cacheDiag.blobStorage')}</Text>
                            {renderLayerStatus(result.layers.blobStorage, 'Blob Storage')}
                          </div>
                        ),
                      },
                    ]}
                  />

                  {result.result && (
                    <Card type="inner" title={t('cacheDiag.result')}>
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
          <Card title={t('cacheDiag.recentDiagnoses')}>
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
                  title: t('cacheDiag.colTime'),
                  dataIndex: 'timestamp',
                  key: 'timestamp',
                },
                {
                  title: t('cacheDiag.colToken'),
                  dataIndex: 'token',
                  key: 'token',
                },
                {
                  title: t('cacheDiag.colCell'),
                  dataIndex: 'cell',
                  key: 'cell',
                },
                {
                  title: t('cacheDiag.colProcess'),
                  dataIndex: 'processCache',
                  key: 'processCache',
                  render: (found: boolean) => found ?
                    <Tag color="success">{t('cacheDiag.hit')}</Tag> :
                    <Tag color="default">{t('cacheDiag.miss')}</Tag>,
                },
                {
                  title: t('cacheDiag.colRedis'),
                  dataIndex: 'redisCache',
                  key: 'redisCache',
                  render: (found: boolean) => found ?
                    <Tag color="success">{t('cacheDiag.hit')}</Tag> :
                    <Tag color="default">{t('cacheDiag.miss')}</Tag>,
                },
                {
                  title: t('cacheDiag.colBlob'),
                  dataIndex: 'blobStorage',
                  key: 'blobStorage',
                  render: (found: boolean) => found ?
                    <Tag color="success">{t('cacheDiag.hit')}</Tag> :
                    <Tag color="default">{t('cacheDiag.miss')}</Tag>,
                },
                {
                  title: t('cacheDiag.colTotalMs'),
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