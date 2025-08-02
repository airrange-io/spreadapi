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

// Dynamic imports for chart components
const Line = dynamic(
  () => import('@ant-design/plots').then((mod) => mod.Line),
  { ssr: false, loading: () => <Spin /> }
);

const Column = dynamic(
  () => import('@ant-design/plots').then((mod) => mod.Column),
  { ssr: false, loading: () => <Spin /> }
);

const Pie = dynamic(
  () => import('@ant-design/plots').then((mod) => mod.Pie),
  { ssr: false, loading: () => <Spin /> }
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
      paddingTop: '14px',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }}>
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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
              valueStyle={{ color: '#389E0E', fontSize: '20px' }}
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
                color: analytics.summary.avgResponseTime < 500 ? '#389E0E' : '#faad14',
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

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Daily Calls Chart */}
        <Col xs={24} lg={12}>
          <Card 
            size="small"
            title={
              <Space>
                <LineChartOutlined />
                <span>API Calls (Last 7 Days)</span>
              </Space>
            }
          >
            {dailyChartData.length > 0 ? (
              <Line
                data={dailyChartData}
                xField="date"
                yField="calls"
                height={200}
                smooth
                padding="auto"
                scale={{
                  color: {
                    type: 'identity',
                    range: ['#4F2D7F']
                  }
                }}
                style={{
                  lineWidth: 2,
                  stroke: '#4F2D7F'
                }}
                point={{
                  size: 4,
                  shape: 'circle',
                  style: {
                    fill: '#4F2D7F',
                    stroke: '#4F2D7F'
                  }
                }}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
            )}
          </Card>
        </Col>
        
        {/* Today's Hourly Distribution */}
        <Col xs={24} lg={12}>
          <Card 
            size="small"
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Today's Hourly Distribution</span>
              </Space>
            }
          >
            {hourlyChartData.length > 0 ? (
              <Column
                data={hourlyChartData}
                xField="hour"
                yField="calls"
                height={200}
                theme={{
                  color: '#4F2D7F'
                }}
                columnStyle={{
                  radius: [4, 4, 0, 0]
                }}
                yAxis={{
                  label: {
                    formatter: (v: string) => `${v}`
                  }
                }}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data for today" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Additional Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Response Time Distribution */}
        <Col xs={24} lg={12}>
          <Card 
            size="small"
            title={
              <Space>
                <BarChartOutlined />
                <span>Response Time Distribution</span>
              </Space>
            }
          >
            {analytics.responseTimeDistribution && analytics.responseTimeDistribution.length > 0 ? (
              <Column
                data={analytics.responseTimeDistribution}
                xField="range"
                yField="count"
                height={200}
                theme={{
                  color: '#389E0E'
                }}
                columnStyle={{
                  radius: [4, 4, 0, 0]
                }}
                xAxis={{
                  label: {
                    autoRotate: true,
                    style: {
                      fontSize: 11
                    }
                  }
                }}
                yAxis={{
                  label: {
                    formatter: (v: string) => `${v} calls`
                  }
                }}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No distribution data available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Cache Performance */}
      {analytics.cache.breakdown && (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card 
              size="small"
              title={
                <Space>
                  <DatabaseOutlined />
                  <span>Cache Performance</span>
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Pie
                    data={[
                      { type: 'Process Cache', value: analytics.cache.breakdown.process },
                      { type: 'Redis Cache', value: analytics.cache.breakdown.redis },
                      { type: 'Blob Storage', value: analytics.cache.breakdown.blob }
                    ]}
                    angleField="value"
                    colorField="type"
                    radius={0.8}
                    height={200}
                    label={{
                      type: 'outer',
                      formatter: (datum: any) => 
                        `${datum.type}: ${((datum.value / analytics.summary.totalCalls) * 100).toFixed(1)}%`
                    }}
                  />
                </Col>
                <Col xs={24} md={12}>
                  <Space direction="vertical" style={{ width: '100%', padding: '20px' }}>
                    <div>
                      <Text type="secondary">Process Cache: </Text>
                      <Text strong>
                        {((analytics.cache.breakdown.process / analytics.summary.totalCalls) * 100).toFixed(1)}%
                      </Text>
                      <Tag color="#389E0E" style={{ marginLeft: 8 }}>Fastest</Tag>
                    </div>
                    <div>
                      <Text type="secondary">Redis Cache: </Text>
                      <Text strong>
                        {((analytics.cache.breakdown.redis / analytics.summary.totalCalls) * 100).toFixed(1)}%
                      </Text>
                      <Tag style={{ marginLeft: 8, backgroundColor: COLORS.primary, color: 'white' }}>Fast</Tag>
                    </div>
                    <div>
                      <Text type="secondary">Blob Storage: </Text>
                      <Text strong>
                        {((analytics.cache.breakdown.blob / analytics.summary.totalCalls) * 100).toFixed(1)}%
                      </Text>
                      <Tag color="orange" style={{ marginLeft: 8 }}>Slower</Tag>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Cache Hit Rate: <strong>{analytics.cache.hitRate.toFixed(1)}%</strong>
                      </Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

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