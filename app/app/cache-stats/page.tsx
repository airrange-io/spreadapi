'use client';

import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Progress, Space, Button, Spin, Alert, Typography } from 'antd';
import { SubPageLayout } from '@/components/SubPageLayout';
import { ReloadOutlined, DatabaseOutlined, CloudOutlined, ThunderboltOutlined } from '@ant-design/icons';

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
      title="Cache Statistics"
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchStats}
          loading={loading}
        >
          Refresh
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
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchStats}>
              Retry
            </Button>
          }
        />
      ) : stats ? (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          {/* Overall Performance */}
          <Card>
            <Title level={4}>Overall Performance</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Total Requests"
                  value={stats.overall.totalRequests}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Avg Response Time"
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
                  Cache Efficiency
                </Text>
              </Col>
            </Row>
          </Card>

          {/* Process Cache */}
          <Card title={
            <Space>
              <ThunderboltOutlined />
              <span>Process Cache</span>
            </Space>
          }>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Size"
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
                  title="Hit Rate"
                  value={stats.processCache.hitRate}
                  suffix="%"
                  styles={{ content: { color: getStatusColor(stats.processCache.hitRate) } }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Hits"
                  value={stats.processCache.hits}
                  styles={{ content: { color: '#52c41a' } }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Misses"
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
              <span>Redis Cache</span>
            </Space>
          }
          extra={
            stats.redisCache.connected ? (
              <Text type="success">Connected</Text>
            ) : (
              <Text type="danger">Disconnected</Text>
            )
          }>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Hit Rate"
                  value={stats.redisCache.hitRate}
                  suffix="%"
                  styles={{ content: { color: getStatusColor(stats.redisCache.hitRate) } }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Hits"
                  value={stats.redisCache.hits}
                  styles={{ content: { color: '#52c41a' } }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Misses"
                  value={stats.redisCache.misses}
                  styles={{ content: { color: '#f5222d' } }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Avg Response"
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
              <span>Blob Storage</span>
            </Space>
          }>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Total Requests"
                  value={stats.blobStorage.requests}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Avg Response Time"
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