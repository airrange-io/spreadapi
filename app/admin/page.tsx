'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Card, Table, Spin, Statistic, Tag, Empty, Alert } from 'antd';
import {
  UserOutlined,
  CloudOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { LicenseType } from '@/lib/licensing';

const { Content } = Layout;
const { Title, Text } = Typography;

interface UserSummary {
  id: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  lastActivity: string;
  licenseType: LicenseType;
  serviceCount: number;
  totalCalls: number;
}

interface DailyCount {
  date: string;
  count: number;
}

interface DailyCalls {
  date: string;
  calls: number;
}

interface TopService {
  id: string;
  name: string;
  userId: string;
  userEmail: string;
  calls: number;
}

interface AdminDashboardData {
  users: UserSummary[];
  totals: {
    userCount: number;
    serviceCount: number;
    totalCalls: number;
    todayCalls: number;
  };
  signupTrend: DailyCount[];
  callsTrend: DailyCalls[];
  topServices: TopService[];
}

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

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.slice(5); // MM-DD
}

function getRelativeTime(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin');
      if (response.status === 403) {
        setError('Access denied. Admin dashboard is only available from localhost.');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch admin data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const userColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      render: (email: string) => (
        <span style={{ fontWeight: 500 }} title={email}>{email}</span>
      ),
    },
    {
      title: 'Signed Up',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: (a: UserSummary, b: UserSummary) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      width: 120,
      render: (date: string) => getRelativeTime(date),
      sorter: (a: UserSummary, b: UserSummary) =>
        new Date(a.lastActivity || 0).getTime() - new Date(b.lastActivity || 0).getTime(),
    },
    {
      title: 'License',
      dataIndex: 'licenseType',
      key: 'licenseType',
      width: 100,
      render: (license: LicenseType) => {
        const colors: Record<LicenseType, string> = {
          free: 'default',
          pro: 'purple',
          premium: 'gold',
        };
        return <Tag color={colors[license]}>{license.charAt(0).toUpperCase() + license.slice(1)}</Tag>;
      },
      filters: [
        { text: 'Free', value: 'free' },
        { text: 'Pro', value: 'pro' },
        { text: 'Premium', value: 'premium' },
      ],
      onFilter: (value: React.Key | boolean, record: UserSummary) => record.licenseType === value,
    },
    {
      title: 'Services',
      dataIndex: 'serviceCount',
      key: 'serviceCount',
      width: 90,
      align: 'right' as const,
      sorter: (a: UserSummary, b: UserSummary) => a.serviceCount - b.serviceCount,
    },
    {
      title: 'Total Calls',
      dataIndex: 'totalCalls',
      key: 'totalCalls',
      width: 110,
      align: 'right' as const,
      render: (val: number) => formatNumber(val),
      sorter: (a: UserSummary, b: UserSummary) => a.totalCalls - b.totalCalls,
      defaultSortOrder: 'descend' as const,
    },
  ];

  const serviceColumns = [
    {
      title: 'Service',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string) => (
        <span style={{ fontWeight: 500 }} title={name}>{name}</span>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'userEmail',
      key: 'userEmail',
      ellipsis: true,
      render: (email: string) => (
        <Text type="secondary" title={email}>{email}</Text>
      ),
    },
    {
      title: 'Total Calls',
      dataIndex: 'calls',
      key: 'calls',
      width: 120,
      align: 'right' as const,
      render: (val: number) => formatNumber(val),
    },
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', padding: 24 }}>
        <Content style={{ maxWidth: 600, margin: '100px auto' }}>
          <Alert
            message="Access Denied"
            description={error}
            type="error"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Content style={{ background: '#f5f5f5', padding: 24, overflow: 'auto' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Page Title */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
              <DashboardOutlined style={{ marginRight: 8 }} />
              Admin Dashboard
            </Title>
            <Text type="secondary">
              Platform analytics and user management (localhost only)
            </Text>
          </div>

          {!data || data.users.length === 0 ? (
            <Card>
              <Empty
                description="No users found in the system."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
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
                        <UserOutlined style={{ color: '#1890ff' }} />
                        Total Users
                      </span>
                    }
                    value={data.totals.userCount}
                    formatter={(val) => formatNumber(val as number)}
                  />
                </Card>

                <Card variant="borderless" style={{ background: '#fff' }}>
                  <Statistic
                    title={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CloudOutlined style={{ color: '#722ed1' }} />
                        Total Services
                      </span>
                    }
                    value={data.totals.serviceCount}
                    formatter={(val) => formatNumber(val as number)}
                  />
                </Card>

                <Card variant="borderless" style={{ background: '#fff' }}>
                  <Statistic
                    title={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ApiOutlined style={{ color: '#52c41a' }} />
                        Total API Calls
                      </span>
                    }
                    value={data.totals.totalCalls}
                    formatter={(val) => formatNumber(val as number)}
                  />
                </Card>

                <Card variant="borderless" style={{ background: '#fff' }}>
                  <Statistic
                    title={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ThunderboltOutlined style={{ color: '#faad14' }} />
                        Today&apos;s Calls
                      </span>
                    }
                    value={data.totals.todayCalls}
                    formatter={(val) => formatNumber(val as number)}
                  />
                </Card>
              </div>

              {/* Trend Charts */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}>
                {/* Signup Trend */}
                <Card
                  variant="borderless"
                  title="User Signups (30 days)"
                  style={{ background: '#fff' }}
                >
                  {data.signupTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data.signupTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatShortDate}
                          tick={{ fontSize: 11 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          formatter={(value: number) => [value, 'Signups']}
                          labelFormatter={(label: string) => formatDate(label)}
                        />
                        <Bar
                          dataKey="count"
                          fill="#1890ff"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text type="secondary">No signup data available</Text>
                    </div>
                  )}
                </Card>

                {/* Calls Trend */}
                <Card
                  variant="borderless"
                  title="API Calls (30 days)"
                  style={{ background: '#fff' }}
                >
                  {data.callsTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={data.callsTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatShortDate}
                          tick={{ fontSize: 11 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={(val) => formatNumber(val)}
                        />
                        <Tooltip
                          formatter={(value: number) => [formatNumber(value), 'Calls']}
                          labelFormatter={(label: string) => formatDate(label)}
                        />
                        <Line
                          type="monotone"
                          dataKey="calls"
                          stroke="#722ed1"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text type="secondary">No calls data available</Text>
                    </div>
                  )}
                </Card>
              </div>

              {/* Users Table */}
              <Card
                variant="borderless"
                title={`Users (${data.users.length})`}
                style={{ background: '#fff', overflow: 'hidden', marginBottom: 16 }}
              >
                <Table
                  dataSource={data.users}
                  columns={userColumns}
                  rowKey="id"
                  pagination={data.users.length > 10 ? { pageSize: 10 } : false}
                  size="small"
                  scroll={{ x: 600 }}
                />
              </Card>

              {/* Top Services Table */}
              <Card
                variant="borderless"
                title="Top Services"
                style={{ background: '#fff', overflow: 'hidden' }}
              >
                {data.topServices.length > 0 ? (
                  <Table
                    dataSource={data.topServices}
                    columns={serviceColumns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ x: 400 }}
                  />
                ) : (
                  <Empty
                    description="No services with API calls"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
}
