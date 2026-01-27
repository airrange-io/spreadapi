'use client';

import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Progress, Space, Button, Spin, Alert, Typography } from 'antd';
import { SubPageLayout } from '@/components/SubPageLayout';
import { ReloadOutlined, DatabaseOutlined, CloudOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

const { Title, Text } = Typography;

interface CacheStats {
  processCache: {
    size: number;
    maxSize: number;
    hitRate: number;
    hits: number;
    misses: number;
  };
  redisCache: {
    connected: boolean;
    hitRate: number;
    hits: number;
    misses: number;
    avgResponseTime: number;
  };
  blobStorage: {
    requests: number;
    avgResponseTime: number;
  };
  overall: {
    totalRequests: number;
    avgResponseTime: number;
    cacheEfficiency: number;
  };
}

export default function CacheStatsPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cache-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch cache statistics');
      }
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (hitRate: number) => {
    if (hitRate >= 80) return '#52c41a';
    if (hitRate >= 60) return '#faad14';
    return '#f5222d';
  };

  return (
    <SubPageLayout
      title={t('cacheStats.title')}
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchStats}
          loading={loading}
        >
          {t('cacheStats.refresh')}
        </Button>
      }
    >
      {loading && !stats ? (
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <Spin size="default" />
        </div>
      ) : error ? (
        <Alert
          title={t('cacheStats.error')}
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchStats}>
              {t('cacheStats.retry')}
            </Button>
          }
        />
      ) : stats ? (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          {/* Overall Performance */}
          <Card>
            <Title level={4}>{t('cacheStats.overallPerformance')}</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title={t('cacheStats.totalRequests')}
                  value={stats.overall.totalRequests}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title={t('cacheStats.avgResponseTime')}
                  value={stats.overall.avgResponseTime}
                  suffix="ms"
                  precision={0}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Progress
                  type="dashboard"
                  percent={Math.round(stats.overall.cacheEfficiency)}
                  format={(percent) => `${percent}%`}
                  strokeColor={getStatusColor(stats.overall.cacheEfficiency)}
                  width={120}
                />
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
                  {t('cacheStats.cacheEfficiency')}
                </Text>
              </Col>
            </Row>
          </Card>

          {/* Process Cache */}
          <Card title={
            <Space>
              <ThunderboltOutlined />
              <span>{t('cacheStats.processCache')}</span>
            </Space>
          }>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('cacheStats.size')}
                  value={stats.processCache.size}
                  suffix={`/ ${stats.processCache.maxSize}`}
                />
                <Progress
                  percent={Math.round((stats.processCache.size / stats.processCache.maxSize) * 100)}
                  size="small"
                  showInfo={false}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('cacheStats.hitRate')}
                  value={stats.processCache.hitRate}
                  suffix="%"
                  styles={{ content: { color: getStatusColor(stats.processCache.hitRate) } }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('cacheStats.hits')}
                  value={stats.processCache.hits}
                  styles={{ content: { color: '#52c41a' } }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('cacheStats.misses')}
                  value={stats.processCache.misses}
                  styles={{ content: { color: '#f5222d' } }}
                />
              </Col>
            </Row>
          </Card>

          {/* Redis Cache */}
          <Card title={
            <Space>
              <DatabaseOutlined />
              <span>{t('cacheStats.redisCache')}</span>
            </Space>
          }
          extra={
            stats.redisCache.connected ? (
              <Text type="success">{t('cacheStats.connected')}</Text>
            ) : (
              <Text type="danger">{t('cacheStats.disconnected')}</Text>
            )
          }>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('cacheStats.hitRate')}
                  value={stats.redisCache.hitRate}
                  suffix="%"
                  styles={{ content: { color: getStatusColor(stats.redisCache.hitRate) } }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('cacheStats.hits')}
                  value={stats.redisCache.hits}
                  styles={{ content: { color: '#52c41a' } }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('cacheStats.misses')}
                  value={stats.redisCache.misses}
                  styles={{ content: { color: '#f5222d' } }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title={t('cacheStats.avgResponse')}
                  value={stats.redisCache.avgResponseTime}
                  suffix="ms"
                  precision={0}
                />
              </Col>
            </Row>
          </Card>

          {/* Blob Storage */}
          <Card title={
            <Space>
              <CloudOutlined />
              <span>{t('cacheStats.blobStorage')}</span>
            </Space>
          }>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Statistic
                  title={t('cacheStats.totalRequests')}
                  value={stats.blobStorage.requests}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title={t('cacheStats.avgResponseTime')}
                  value={stats.blobStorage.avgResponseTime}
                  suffix="ms"
                  precision={0}
                />
              </Col>
            </Row>
          </Card>
        </Space>
      ) : null}
    </SubPageLayout>
  );
}