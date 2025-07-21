'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Space, 
  Typography, 
  Button, 
  DatePicker, 
  Spin, 
  Empty,
  Tag,
  Progress,
  Breadcrumb
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
  BarChartOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  CloudOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';

// Dynamic imports for chart components to avoid SSR issues
const Line = dynamic(
  () => import('@ant-design/plots').then((mod) => mod.Line),
  { ssr: false }
);

const Column = dynamic(
  () => import('@ant-design/plots').then((mod) => mod.Column),
  { ssr: false }
);

const Pie = dynamic(
  () => import('@ant-design/plots').then((mod) => mod.Pie),
  { ssr: false }
);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface AnalyticsData {
  serviceId: string;
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
  dailyData: Array<{ date: string; calls: number; errors: number; isToday: boolean; avgResponseTime?: number }>;
  weeklyData?: Array<{ week: string; calls: number; avgResponseTime: number }>;
  monthlyData?: Array<{ month: string; calls: number; avgResponseTime: number }>;
  responseTimeDistribution?: Array<{ range: string; count: number }>;
  callsByDate?: Array<{ date: string; calls: number }>;
  lastUpdated: string;
}

interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export default function AnalyticsPageClient({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs()
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [timeView, setTimeView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, [serviceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch both service info and analytics in parallel
      const [serviceResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/services/${serviceId}`),
        fetch(`/api/getanalytics?serviceId=${serviceId}&days=7`) // Add days parameter
      ]);

      if (serviceResponse.ok) {
        const service = await serviceResponse.json();
        setServiceInfo(service);
      }

      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json();
        console.log('Analytics data received:', data);
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
    await loadData();
    setRefreshing(false);
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spin size="default" />
      </div>
    );
  }

  if (!analytics || !serviceInfo) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <div style={{ padding: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back to Services
          </Button>
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Analytics data not available" 
            style={{ marginTop: 100 }}
          />
        </div>
      </Layout>
    );
  }

  // Prepare chart data
  const dailyChartData = analytics.dailyData.map(item => ({
    date: dayjs(item.date).format('MMM DD'),
    calls: item.calls,
    errors: item.errors,
    type: 'Calls'
  }));

  const hourlyChartData = analytics.hourlyData.map(item => ({
    hour: `${item.hour}:00`,
    calls: item.calls
  }));

  const cacheData = [
    { type: 'Cache Hits', value: analytics.cache.hits || 0 },
    { type: 'Cache Misses', value: analytics.cache.misses || 0 }
  ];

  // Calculate trends
  const yesterdaysCalls = analytics.dailyData.length > 1 
    ? analytics.dailyData[analytics.dailyData.length - 2].calls 
    : 0;
  const callsTrend = yesterdaysCalls > 0 
    ? ((analytics.summary.todayCalls - yesterdaysCalls) / yesterdaysCalls * 100).toFixed(1)
    : '0';

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Breadcrumb items={[
          { title: <a onClick={handleBack}>Services</a> },
          { title: <a onClick={() => router.push(`/service/${serviceId}`)}>{serviceInfo.name}</a> },
          { title: 'Analytics' }
        ]} />
        
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh} 
            loading={refreshing}
            title="Refresh data"
          />
          <RangePicker 
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          />
        </Space>
      </div>

      <div style={{ padding: 24 }}>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total API Calls"
                value={analytics.summary.totalCalls}
                prefix={<ApiOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Today's Calls"
                value={analytics.summary.todayCalls}
                prefix={<CalendarOutlined />}
                suffix={
                  Number(callsTrend) !== 0 && (
                    <span style={{ fontSize: 14, color: Number(callsTrend) > 0 ? '#52c41a' : '#ff4d4f' }}>
                      {Number(callsTrend) > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {Math.abs(Number(callsTrend))}%
                    </span>
                  )
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Success Rate"
                value={analytics.summary.successRate}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Response Time"
                value={analytics.summary.avgResponseTime}
                suffix="ms"
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: analytics.summary.avgResponseTime < 500 ? '#52c41a' : '#faad14' }}
              />
              {analytics.summary.p95 && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  P95: {analytics.summary.p95}ms | P99: {analytics.summary.p99}ms
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Performance Overview Card */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <DashboardOutlined />
                  <span>Performance Overview</span>
                </Space>
              }
              extra={
                <Space>
                  <Button 
                    type={timeView === 'daily' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setTimeView('daily')}
                  >
                    Daily
                  </Button>
                  <Button 
                    type={timeView === 'weekly' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setTimeView('weekly')}
                  >
                    Weekly
                  </Button>
                  <Button 
                    type={timeView === 'monthly' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setTimeView('monthly')}
                  >
                    Monthly
                  </Button>
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  {/* Response Time Metrics */}
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Title level={5}>Response Time Metrics</Title>
                    <Row gutter={[16, 16]}>
                      <Col xs={8}>
                        <Statistic
                          title="Min"
                          value={analytics.summary.minResponseTime || 0}
                          suffix="ms"
                          valueStyle={{ fontSize: '20px' }}
                        />
                      </Col>
                      <Col xs={8}>
                        <Statistic
                          title="P50 (Median)"
                          value={analytics.summary.p50 || analytics.summary.avgResponseTime}
                          suffix="ms"
                          valueStyle={{ fontSize: '20px', color: '#1890ff' }}
                        />
                      </Col>
                      <Col xs={8}>
                        <Statistic
                          title="Max"
                          value={analytics.summary.maxResponseTime || 0}
                          suffix="ms"
                          valueStyle={{ fontSize: '20px' }}
                        />
                      </Col>
                    </Row>
                  </Space>
                </Col>
                <Col xs={24} lg={8}>
                  {/* Cache Performance */}
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Title level={5}>Cache Performance</Title>
                    {analytics.cache.breakdown ? (
                      <div>
                        <div style={{ marginBottom: '8px' }}>
                          <Text type="secondary">Process Cache: </Text>
                          <Text strong>{((analytics.cache.breakdown.process / analytics.summary.totalCalls) * 100).toFixed(1)}%</Text>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <Text type="secondary">Redis Cache: </Text>
                          <Text strong>{((analytics.cache.breakdown.redis / analytics.summary.totalCalls) * 100).toFixed(1)}%</Text>
                        </div>
                        <div>
                          <Text type="secondary">Blob Storage: </Text>
                          <Text strong>{((analytics.cache.breakdown.blob / analytics.summary.totalCalls) * 100).toFixed(1)}%</Text>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Text type="secondary">Cache Hit Rate: </Text>
                        <Text strong>{analytics.cache.hitRate.toFixed(1)}%</Text>
                      </div>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {/* API Calls Chart */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <LineChartOutlined />
                  <span>API Calls {timeView === 'daily' ? 'per Day' : timeView === 'weekly' ? 'per Week' : 'per Month'}</span>
                </Space>
              }
            >
              {(() => {
                const chartData = timeView === 'daily' ? dailyChartData :
                                 timeView === 'weekly' ? (analytics.weeklyData || []).map(item => ({
                                   date: item.week,
                                   calls: item.calls
                                 })) :
                                 (analytics.monthlyData || []).map(item => ({
                                   date: item.month,
                                   calls: item.calls
                                 }));
                
                return chartData.length > 0 ? (
                  <Line
                    data={chartData}
                    xField="date"
                    yField="calls"
                    point={{ size: 5, shape: 'circle' }}
                    height={300}
                    smooth
                    color="#1890ff"
                    yAxis={{
                      label: {
                        formatter: (v: string) => `${v} calls`
                      }
                    }}
                  />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data available" />
                );
              })()}
            </Card>
          </Col>
          
          {/* Response Time Chart */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <LineChartOutlined />
                  <span>Response Time {timeView === 'daily' ? 'per Day' : timeView === 'weekly' ? 'per Week' : 'per Month'}</span>
                </Space>
              }
            >
              {(() => {
                const responseTimeData = timeView === 'daily' ? 
                  analytics.dailyData.filter(d => d.avgResponseTime).map(item => ({
                    date: dayjs(item.date).format('MMM DD'),
                    avgTime: item.avgResponseTime || 0
                  })) :
                  timeView === 'weekly' ? 
                  (analytics.weeklyData || []).map(item => ({
                    date: item.week,
                    avgTime: item.avgResponseTime
                  })) :
                  (analytics.monthlyData || []).map(item => ({
                    date: item.month,
                    avgTime: item.avgResponseTime
                  }));
                
                return responseTimeData.length > 0 ? (
                  <Line
                    data={responseTimeData}
                    xField="date"
                    yField="avgTime"
                    point={{ size: 5, shape: 'circle' }}
                    height={300}
                    smooth
                    color="#52c41a"
                    yAxis={{
                      label: {
                        formatter: (v: string) => `${v}ms`
                      }
                    }}
                  />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No response time data available" />
                );
              })()}
            </Card>
          </Col>
        </Row>

        {/* Additional Charts Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {/* Hourly Distribution */}
          <Col xs={24} lg={12}>
            <Card 
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
                  color="#1890ff"
                  columnStyle={{
                    radius: [4, 4, 0, 0],
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
          
          {/* Response Time Distribution */}
          <Col xs={24} lg={12}>
            <Card 
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
                  color="#52c41a"
                  columnStyle={{
                    radius: [4, 4, 0, 0],
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
        
        {/* Cache Performance Pie Chart */}
        {analytics.cache.breakdown && (
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <DatabaseOutlined />
                    <span>Data Source Distribution</span>
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
                      height={300}
                      label={{
                        type: 'outer',
                        formatter: (datum: any) => `${datum.type}: ${((datum.value / analytics.summary.totalCalls) * 100).toFixed(1)}%`
                      }}
                      interactions={[
                        {
                          type: 'element-active',
                        },
                      ]}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <div style={{ padding: '20px' }}>
                      <Title level={5}>Performance Impact</Title>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Alert
                          message="Process Cache"
                          description="In-memory cache provides the fastest response times (< 5ms)"
                          type="success"
                          showIcon
                          icon={<ThunderboltOutlined />}
                        />
                        <Alert
                          message="Redis Cache"
                          description="Distributed cache offers good performance (10-50ms)"
                          type="info"
                          showIcon
                          icon={<DatabaseOutlined />}
                        />
                        <Alert
                          message="Blob Storage"
                          description="Remote storage has higher latency (50-200ms)"
                          type="warning"
                          showIcon
                          icon={<CloudOutlined />}
                        />
                      </Space>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )}

        {/* Last Updated */}
        <div style={{ textAlign: 'center', marginTop: 24, color: '#888' }}>
          <Text type="secondary">
            Last updated: {dayjs(analytics.lastUpdated).format('MMMM D, YYYY h:mm A')}
          </Text>
        </div>
      </div>
    </Layout>
  );
}