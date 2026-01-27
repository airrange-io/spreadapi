'use client';

import React, { useState, useEffect } from 'react';
import { COLORS } from '@/constants/theme';
import { 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Space, 
  Typography, 
  Button,
  Spin, 
  Empty,
  Alert,
  Progress,
  Tag,
  Skeleton
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  CloudOutlined,
  DashboardOutlined,
  BarChartOutlined,
  SendOutlined,
  WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/i18n';

// Lazy load Recharts components
const RechartsComponents = dynamic(
  () => import('./RechartsComponents'),
  { 
    ssr: false, 
    loading: () => (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
      </div>
    )
  }
);

const { Title, Text } = Typography;

interface UsageViewProps {
  serviceId: string;
  serviceStatus?: {
    published?: boolean;
  };
  configLoaded?: boolean;
}

interface AnalyticsData {
  summary: {
    totalCalls: number;
    todayCalls: number;
    totalErrors: number;
    successRate: number;
    avgResponseTime: number;
    minResponseTime?: number;
    maxResponseTime?: number;
    p50?: number;
    p95?: number;
    p99?: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    breakdown?: {
      process: number;
      redis: number;
      blob: number;
    };
  };
  webhooks?: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
    lastSuccess: string | null;
    lastFailure: string | null;
    consecutiveFailures: number;
    circuitBreakerOpen: boolean;
  };
  hourlyData: Array<{ hour: number; calls: number }>;
  dailyData: Array<{ date: string; calls: number; errors: number; avgResponseTime?: number }>;
  responseTimeDistribution?: Array<{ range: string; count: number }>;
  lastUpdated: string;
}

const UsageView: React.FC<UsageViewProps> = ({
  serviceId,
  serviceStatus,
  configLoaded = false
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (configLoaded && serviceStatus?.published) {
      loadAnalytics();
    } else {
      setLoading(false);
    }
  }, [serviceId, configLoaded, serviceStatus?.published]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/getanalytics?serviceId=${serviceId}&days=7`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  // Show skeleton until config is loaded
  if (!configLoaded || loading) {
    return (
      <div style={{ padding: '16px' }}>
        <Skeleton active paragraph={{ rows: 4 }} />
        <div style={{ marginTop: 16 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </div>
    );
  }

  // Show alert if service is not published
  if (!serviceStatus?.published) {
    return (
      <div style={{
        height: '100%',
        padding: '16px',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}>
        <Alert
          title={t('usage.notAvailableTitle')}
          description={t('usage.notAvailableDesc')}
          type="info"
          showIcon
          style={{ maxWidth: 600, margin: '0 auto', marginTop: 50 }}
        />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{
        height: '100%',
        padding: '16px',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}>
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('usage.noDataYet')} 
        />
      </div>
    );
  }

  // Calculate trends
  const yesterdaysCalls = analytics.dailyData.length > 1 
    ? analytics.dailyData[analytics.dailyData.length - 2].calls 
    : 0;
  const callsTrend = yesterdaysCalls > 0 
    ? ((analytics.summary.todayCalls - yesterdaysCalls) / yesterdaysCalls * 100).toFixed(1)
    : '0';

  // Prepare chart data
  const dailyChartData = analytics.dailyData.slice(-7).map(item => ({
    date: dayjs(item.date).format('MMM DD'),
    calls: item.calls
  }));

  const hourlyChartData = analytics.hourlyData.map(item => ({
    hour: `${item.hour}:00`,
    calls: item.calls
  }));

  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      padding: '16px',
      paddingLeft: '4px',
      paddingTop: '13px',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }}>
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title={t('usage.totalApiCalls')}
              value={analytics.summary.totalCalls}
              prefix={<ApiOutlined />}
              styles={{ content: { color: COLORS.primary, fontSize: '20px' } }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title={t('usage.todaysCalls')}
              value={analytics.summary.todayCalls}
              prefix={<CalendarOutlined />}
              styles={{ content: { fontSize: '20px' } }}
              suffix={
                Number(callsTrend) !== 0 && (
                  <span style={{ fontSize: 14, color: Number(callsTrend) > 0 ? '#389E0E' : '#ff4d4f' }}>
                    {Number(callsTrend) > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(Number(callsTrend))}%
                  </span>
                )
              }
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title={t('usage.successRate')}
              value={analytics.summary.successRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: COLORS.primary, fontSize: '20px' } }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title={t('usage.avgResponse')}
              value={analytics.summary.avgResponseTime}
              suffix="ms"
              prefix={<ThunderboltOutlined />}
              styles={{ content: {
                color: analytics.summary.avgResponseTime < 500 ? COLORS.primary : '#faad14',
                fontSize: '20px'
              } }}
            />
            {analytics.summary.p95 && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                P95: {analytics.summary.p95}ms
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Webhook Statistics */}
      {analytics.webhooks && analytics.webhooks.total > 0 && (
        <Card
          title={
            <span>
              <SendOutlined style={{ marginRight: 8 }} />
              {t('usage.webhookDeliveries')}
            </span>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={t('usage.totalAttempts')}
                value={analytics.webhooks.total}
                styles={{ content: { fontSize: '18px' } }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={t('usage.successful')}
                value={analytics.webhooks.success}
                styles={{ content: { color: '#52c41a', fontSize: '18px' } }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={t('usage.failed')}
                value={analytics.webhooks.failed}
                styles={{ content: { color: analytics.webhooks.failed > 0 ? '#ff4d4f' : undefined, fontSize: '18px' } }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={t('usage.successRate')}
                value={analytics.webhooks.successRate}
                suffix="%"
                styles={{ content: {
                  color: analytics.webhooks.successRate >= 95 ? '#52c41a' : analytics.webhooks.successRate >= 80 ? '#faad14' : '#ff4d4f',
                  fontSize: '18px'
                } }}
              />
            </Col>
          </Row>

          <div style={{ marginTop: 16 }}>
            {analytics.webhooks.circuitBreakerOpen && (
              <Alert
                title={t('usage.circuitBreakerOpen')}
                description={t('usage.circuitBreakerDesc', { failures: analytics.webhooks.consecutiveFailures })}
                type="error"
                icon={<WarningOutlined />}
                showIcon
                style={{ marginBottom: 12 }}
              />
            )}

            <Row gutter={[16, 8]}>
              {analytics.webhooks.lastSuccess && (
                <Col xs={24} sm={12}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {t('usage.lastSuccess')}: {dayjs(analytics.webhooks.lastSuccess).format('MMM D, YYYY h:mm A')}
                  </Text>
                </Col>
              )}
              {analytics.webhooks.lastFailure && (
                <Col xs={24} sm={12}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {t('usage.lastFailure')}: {dayjs(analytics.webhooks.lastFailure).format('MMM D, YYYY h:mm A')}
                  </Text>
                </Col>
              )}
            </Row>

            {analytics.webhooks.consecutiveFailures > 0 && !analytics.webhooks.circuitBreakerOpen && (
              <Alert
                title={t('usage.consecutiveFailures', { failures: analytics.webhooks.consecutiveFailures, remaining: 10 - analytics.webhooks.consecutiveFailures })}
                type="warning"
                showIcon
                style={{ marginTop: 12 }}
              />
            )}
          </div>
        </Card>
      )}

      {/* Charts - Lazy loaded */}
      <RechartsComponents
        dailyChartData={dailyChartData}
        hourlyChartData={hourlyChartData}
        responseTimeDistribution={analytics.responseTimeDistribution}
        cacheBreakdown={analytics.cache.breakdown}
        totalCalls={analytics.summary.totalCalls}
      />

      {/* Cache Efficiency Card */}
      {(analytics.cache.hits > 0 || analytics.cache.misses > 0) && (
        <Card
          title={
            <span>
              <DatabaseOutlined style={{ marginRight: 8 }} />
              {t('usage.cacheEfficiency')}
            </span>
          }
          size="small"
          style={{ marginBottom: 16 }}
          extra={
            <Tag color={analytics.cache.hitRate >= 70 ? 'success' : analytics.cache.hitRate >= 40 ? 'warning' : 'default'}>
              {t('usage.hitRate', { rate: analytics.cache.hitRate.toFixed(1) })}
            </Tag>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={t('usage.totalRequests')}
                value={analytics.cache.hits + analytics.cache.misses}
                prefix={<ApiOutlined />}
                styles={{ content: { fontSize: '18px' } }}
              />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {t('usage.allApiCalls')}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={t('usage.cacheHits')}
                value={analytics.cache.hits}
                prefix={<ThunderboltOutlined />}
                styles={{ content: { color: '#52c41a', fontSize: '18px' } }}
              />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {t('usage.instantResponses')}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title={t('usage.calculations')}
                value={analytics.cache.misses}
                prefix={<CloudOutlined />}
                styles={{ content: { color: COLORS.primary, fontSize: '18px' } }}
              />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {t('usage.fullComputations')}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>{t('usage.computationSaved')}</Text>
              </div>
              <Progress
                percent={analytics.cache.hitRate}
                status={analytics.cache.hitRate >= 70 ? 'success' : analytics.cache.hitRate >= 40 ? 'normal' : 'exception'}
                format={(percent) => `${percent?.toFixed(1)}%`}
                strokeColor={analytics.cache.hitRate >= 70 ? '#52c41a' : analytics.cache.hitRate >= 40 ? '#faad14' : undefined}
              />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                {t('usage.requestsFromCache', { count: analytics.cache.hits })}
              </div>
            </Col>
          </Row>

          {analytics.cache.breakdown && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                <strong>{t('usage.cacheBreakdown')}:</strong>
                {' '}{t('usage.processCache')}: {analytics.cache.breakdown.process || 0}
                {' '} • {t('usage.redisCache')}: {analytics.cache.breakdown.redis || 0}
                {' '} • {t('usage.blobCache')}: {analytics.cache.breakdown.blob || 0}
              </Text>
            </div>
          )}

          <Alert
            title={t('usage.understandingCacheTitle')}
            description={
              <div style={{ fontSize: 13 }}>
                <p style={{ marginBottom: 8 }}>
                  <strong>{t('usage.totalRequests')}:</strong> {t('usage.totalRequestsExplain')}
                </p>
                <p style={{ marginBottom: 8 }}>
                  <strong>{t('usage.cacheHits')}:</strong> {t('usage.cacheHitsExplain')}
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong>{t('usage.actualCalculations')}:</strong> {t('usage.actualCalculationsExplain')}
                </p>
              </div>
            }
            type="info"
            style={{ marginTop: 16, padding: '10px 10px 10px 15px' }}
          />
        </Card>
      )}

      {/* Last Updated and Refresh */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Text type="secondary" style={{ fontSize: 12, color: '#888' }}>
          {t('usage.lastUpdated')}: {dayjs(analytics.lastUpdated).format('MMM D, YYYY h:mm A')}
        </Text>
        <div style={{ marginTop: 12 }}>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh} 
            loading={refreshing}
            size="small"
          >
            {t('usage.refresh')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsageView;