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
  BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';

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
          message="Usage Analytics Not Available"
          description="Analytics are only available for published services. Please publish your service to start tracking usage metrics."
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
          description="No analytics data available yet" 
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
              title="Total API Calls"
              value={analytics.summary.totalCalls}
              prefix={<ApiOutlined />}
              valueStyle={{ color: COLORS.primary, fontSize: '20px' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Today's Calls"
              value={analytics.summary.todayCalls}
              prefix={<CalendarOutlined />}
              valueStyle={{ fontSize: '20px' }}
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
              title="Success Rate"
              value={analytics.summary.successRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: COLORS.primary, fontSize: '20px' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Avg Response"
              value={analytics.summary.avgResponseTime}
              suffix="ms"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ 
                color: analytics.summary.avgResponseTime < 500 ? COLORS.primary : '#faad14',
                fontSize: '20px'
              }}
            />
            {analytics.summary.p95 && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                P95: {analytics.summary.p95}ms
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Charts - Lazy loaded */}
      <RechartsComponents
        dailyChartData={dailyChartData}
        hourlyChartData={hourlyChartData}
        responseTimeDistribution={analytics.responseTimeDistribution}
        cacheBreakdown={analytics.cache.breakdown}
        totalCalls={analytics.summary.totalCalls}
      />

      {/* Last Updated and Refresh */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Text type="secondary" style={{ fontSize: 12, color: '#888' }}>
          Last updated: {dayjs(analytics.lastUpdated).format('MMM D, YYYY h:mm A')}
        </Text>
        <div style={{ marginTop: 12 }}>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh} 
            loading={refreshing}
            size="small"
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsageView;