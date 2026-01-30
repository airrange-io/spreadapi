'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Layout, Typography, Card, Table, Breadcrumb, Button, Spin, Statistic, Segmented, Avatar, Dropdown, Tag, Empty } from 'antd';
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  GlobalOutlined,
  CheckOutlined,
  CloudOutlined,
  CrownOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { TRANSITIONS } from '@/constants/theme';
import type { LicenseType } from '@/lib/licensing';

const { Content } = Layout;
const { Title, Text } = Typography;

interface ServiceSummary {
  id: string;
  name: string;
  status: 'published' | 'draft';
  totalCalls: number;
  todayCalls: number;
  weekCalls: number;
  monthCalls: number;
  avgResponseTime: number;
  errorRate: number;
}

interface DailyData {
  date: string;
  calls: number;
  errors: number;
}

interface AnalyticsData {
  summary: {
    totalServices: number;
    publishedServices: number;
    totalCalls: number;
    todayCalls: number;
    weekCalls: number;
    monthCalls: number;
    maxCallsPerMonth: number;
    avgResponseTime: number;
    errorRate: number;
  };
  license: {
    type: 'free' | 'pro' | 'premium';
    maxCallsPerMonth: number;
  };
  services: ServiceSummary[];
  dailyData: DailyData[];
  timestamp: string;
}

type TimeRange = 'day' | 'week' | 'month';

function formatNumber(num: number | null | undefined): string {
  if (num == null) return '0';
  if (num >= 1000000) {
    const val = num / 1000000;
    return (val % 1 === 0 ? val.toString() : val.toFixed(1)) + 'M';
  }
  if (num >= 1000) {
    const val = num / 1000;
    return (val % 1 === 0 ? val.toString() : val.toFixed(1)) + 'K';
  }
  return num.toLocaleString();
}

// Simple bar chart component
function SimpleBarChart({ data, height = 120 }: { data: DailyData[]; height?: number }) {
  const maxCalls = Math.max(...data.map(d => d.calls), 1);
  const barWidth = Math.max(4, Math.floor((100 / data.length) - 1));

  return (
    <div style={{ height, display: 'flex', alignItems: 'flex-end', gap: 2, padding: '0 4px' }}>
      {data.map((item, index) => {
        const barHeight = (item.calls / maxCalls) * (height - 24);
        const isToday = index === data.length - 1;
        return (
          <div
            key={item.date}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 24,
                height: Math.max(2, barHeight),
                backgroundColor: isToday ? '#722ed1' : '#d3adf7',
                borderRadius: 2,
                transition: 'height 0.3s ease',
              }}
              title={`${item.date}: ${item.calls} calls`}
            />
            {(index === 0 || index === data.length - 1 || index === Math.floor(data.length / 2)) && (
              <Text style={{ fontSize: 10, color: '#8c8c8c', marginTop: 4 }}>
                {item.date.slice(5)}
              </Text>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t, locale, setLocale } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?returnTo=/app/analytics');
      return;
    }

    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics?days=30');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on time range
  const filteredDailyData = useMemo(() => {
    if (!data?.dailyData) return [];
    const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
    return data.dailyData.slice(-days);
  }, [data?.dailyData, timeRange]);

  const currentCalls = useMemo(() => {
    if (!data) return 0;
    switch (timeRange) {
      case 'day':
        return data.summary.todayCalls;
      case 'week':
        return data.summary.weekCalls;
      case 'month':
        return data.summary.monthCalls;
    }
  }, [data, timeRange]);

  const dropdownMenuItems = useMemo(() => {
    const languageItems = [
      { key: 'en', label: 'English', icon: <CheckOutlined style={{ visibility: locale === 'en' ? 'visible' : 'hidden' }} />, onClick: () => setLocale('en') },
      { key: 'de', label: 'Deutsch', icon: <CheckOutlined style={{ visibility: locale === 'de' ? 'visible' : 'hidden' }} />, onClick: () => setLocale('de') },
    ];

    if (isAuthenticated && user) {
      const licenseType = (user?.licenseType || 'free') as LicenseType;
      const licenseColors: Record<LicenseType, string> = {
        free: '#8c8c8c',
        pro: '#722ed1',
        premium: '#faad14',
      };
      const licenseLabels: Record<LicenseType, string> = {
        free: 'Free',
        pro: 'Pro',
        premium: 'Premium',
      };

      return [
        {
          key: 'license',
          icon: <CrownOutlined style={{ color: licenseColors[licenseType] }} />,
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color={licenseType === 'free' ? 'default' : licenseType === 'pro' ? 'purple' : 'gold'} style={{ margin: 0 }}>
                {licenseLabels[licenseType]}
              </Tag>
            </div>
          ),
        },
        { type: 'divider' as const },
        {
          key: 'profile',
          icon: <SettingOutlined />,
          label: t('app.profileSettings'),
          onClick: () => router.push('/app/profile'),
        },
        {
          key: 'language',
          icon: <GlobalOutlined />,
          label: t('app.language'),
          children: languageItems,
        },
        { type: 'divider' as const },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: t('app.logout'),
          onClick: async () => {
            document.cookie = 'hanko=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            router.push('/app');
          },
        },
      ];
    }
    return [];
  }, [isAuthenticated, router, t, locale, setLocale, user?.licenseType]);

  const columns = [
    {
      title: 'Service',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string, record: ServiceSummary) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name}>{name}</span>
          {record.status === 'published' && (
            <Tag color="green" style={{ margin: 0, fontSize: 10, flexShrink: 0 }}>Live</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalCalls',
      key: 'totalCalls',
      align: 'right' as const,
      width: 80,
      render: (val: number) => formatNumber(val),
      sorter: (a: ServiceSummary, b: ServiceSummary) => a.totalCalls - b.totalCalls,
    },
    {
      title: 'Today',
      dataIndex: 'todayCalls',
      key: 'todayCalls',
      align: 'right' as const,
      width: 80,
      render: (val: number) => formatNumber(val),
      sorter: (a: ServiceSummary, b: ServiceSummary) => a.todayCalls - b.todayCalls,
      responsive: ['lg'] as ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')[],
    },
    {
      title: 'Week',
      dataIndex: 'weekCalls',
      key: 'weekCalls',
      align: 'right' as const,
      width: 80,
      render: (val: number) => formatNumber(val),
      sorter: (a: ServiceSummary, b: ServiceSummary) => a.weekCalls - b.weekCalls,
      responsive: ['md'] as ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')[],
    },
    {
      title: 'Month',
      dataIndex: 'monthCalls',
      key: 'monthCalls',
      align: 'right' as const,
      width: 80,
      render: (val: number) => formatNumber(val),
      sorter: (a: ServiceSummary, b: ServiceSummary) => a.monthCalls - b.monthCalls,
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Response',
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
      align: 'right' as const,
      width: 100,
      render: (val: number) => val > 0 ? `${val}ms` : '-',
      responsive: ['lg'] as ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')[],
    },
    {
      title: 'Errors',
      dataIndex: 'errorRate',
      key: 'errorRate',
      align: 'right' as const,
      width: 80,
      responsive: ['lg'] as ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')[],
      render: (val: number | null) => {
        const rate = val ?? 0;
        return (
          <span style={{ color: rate > 5 ? '#ff4d4f' : rate > 1 ? '#faad14' : '#52c41a' }}>
            {rate.toFixed(1)}%
          </span>
        );
      },
    },
  ];

  if (authLoading || loading) {
    return (
      <Layout style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Layout style={{ transition: TRANSITIONS.default }}>
        <Content style={{ background: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/app')}
              />
              <Breadcrumb
                items={[
                  { title: 'Analytics' },
                ]}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dropdown menu={{ items: dropdownMenuItems }} placement="bottomRight">
                <Button
                  type="text"
                  style={{ padding: 4 }}
                  icon={
                    isAuthenticated && user?.email ? (
                      <Avatar
                        style={{ backgroundColor: '#4F2D7F', color: '#fff', fontSize: '14px' }}
                        size={32}
                      >
                        {user.email.charAt(0).toUpperCase()}
                      </Avatar>
                    ) : (
                      <Avatar
                        style={{ backgroundColor: '#f0f0f0', color: '#999' }}
                        size={32}
                        icon={<UserOutlined />}
                      />
                    )
                  }
                />
              </Dropdown>
            </div>
          </div>

          {/* Main Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            background: '#fafafa',
          }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {/* Page Title */}
              <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
                  <BarChartOutlined style={{ marginRight: 8 }} />
                  Analytics Overview
                </Title>
                <Text type="secondary">
                  Track API usage across all your services
                </Text>
              </div>

              {!data || data.services.length === 0 ? (
                <Card>
                  <Empty
                    description="No services found. Create your first service to start tracking analytics."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" onClick={() => router.push('/app')}>
                      Go to Services
                    </Button>
                  </Empty>
                </Card>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                    marginBottom: 24,
                  }}>
                    <Card variant="borderless" style={{ background: '#fff' }}>
                      <Statistic
                        title={
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ApiOutlined style={{ color: '#722ed1' }} />
                            Total Calls
                          </span>
                        }
                        value={data.summary.totalCalls}
                        formatter={(val) => formatNumber(val as number)}
                      />
                    </Card>

                    <Card variant="borderless" style={{ background: '#fff' }}>
                      <Statistic
                        title={
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ThunderboltOutlined style={{ color: (data.license.maxCallsPerMonth > 0 && data.summary.monthCalls > data.license.maxCallsPerMonth) ? '#ff4d4f' : '#52c41a' }} />
                            This Month
                          </span>
                        }
                        value={data.summary.monthCalls}
                        formatter={(val) => {
                          const maxCalls = data.license.maxCallsPerMonth;
                          const isUnlimited = maxCalls === -1 || maxCalls == null;
                          const isOverLimit = !isUnlimited && data.summary.monthCalls > maxCalls;
                          return (
                            <span style={{ color: isOverLimit ? '#ff4d4f' : undefined }}>
                              {formatNumber(val as number)}
                              {!isUnlimited && maxCalls > 0 && (
                                <span style={{ fontSize: 14, fontWeight: 400, color: isOverLimit ? '#ff4d4f' : '#8c8c8c' }}>
                                  {' '}of {formatNumber(maxCalls)}
                                </span>
                              )}
                            </span>
                          );
                        }}
                      />
                    </Card>

                    <Card variant="borderless" style={{ background: '#fff' }}>
                      <Statistic
                        title={
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ClockCircleOutlined style={{ color: '#1890ff' }} />
                            Avg Response
                          </span>
                        }
                        value={data.summary.avgResponseTime}
                        suffix="ms"
                      />
                    </Card>

                    <Card variant="borderless" style={{ background: '#fff' }}>
                      <Statistic
                        title={
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ExclamationCircleOutlined style={{ color: data.summary.errorRate > 1 ? '#ff4d4f' : '#52c41a' }} />
                            Error Rate
                          </span>
                        }
                        value={data.summary.errorRate}
                        precision={1}
                        suffix="%"
                        styles={{ content: { color: data.summary.errorRate > 5 ? '#ff4d4f' : data.summary.errorRate > 1 ? '#faad14' : '#52c41a' } }}
                      />
                    </Card>
                  </div>

                  {/* Traffic Chart */}
                  <Card
                    variant="borderless"
                    style={{ marginBottom: 24, background: '#fff' }}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>API Traffic</span>
                        <Text type="secondary" style={{ fontWeight: 400, fontSize: 14, flex: 1, textAlign: 'right' }}>
                          {formatNumber(currentCalls)} calls
                        </Text>
                        <Segmented
                          size="small"
                          options={[
                            { label: 'Day', value: 'day' },
                            { label: 'Week', value: 'week' },
                            { label: 'Month', value: 'month' },
                          ]}
                          value={timeRange}
                          onChange={(val) => setTimeRange(val as TimeRange)}
                        />
                      </div>
                    }
                  >
                    {filteredDailyData.length > 0 ? (
                      <SimpleBarChart data={filteredDailyData} height={140} />
                    ) : (
                      <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text type="secondary">No data available</Text>
                      </div>
                    )}
                  </Card>

                  {/* Services Table */}
                  <Card
                    variant="borderless"
                    style={{ background: '#fff', overflow: 'hidden' }}
                    title={`Services (${data.summary.publishedServices} live / ${data.summary.totalServices} total)`}
                  >
                    <Table
                      dataSource={data.services}
                      columns={columns}
                      rowKey="id"
                      pagination={data.services.length > 10 ? { pageSize: 10 } : false}
                      size="small"
                      onRow={(record) => ({
                        onClick: () => router.push(`/app/service/${record.id}`),
                        style: { cursor: 'pointer' },
                      })}
                    />
                  </Card>
                </>
              )}
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
