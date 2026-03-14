'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Card, Table, Spin, Statistic, Tag, Empty, Alert, Input, Select, Button, App, Space, Badge, Popconfirm } from 'antd';
import {
  UserOutlined,
  CloudOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  SearchOutlined,
  DeleteOutlined,
  ScanOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
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

interface CleanupIssue {
  key: string;
  type: string;
  reason: string;
  safe_to_delete: boolean;
}

interface CategoryBreakdown {
  total: number;
  valid: number;
  issues: number;
}

interface CleanupReport {
  scanned_keys: number;
  valid_keys: number;
  issues: CleanupIssue[];
  summary: Record<string, number>;
  categories: Record<string, CategoryBreakdown>;
  entity_counts: {
    users_in_index: number;
    valid_users: number;
    services_in_indexes: number;
    valid_services: number;
    valid_tokens: number;
  };
  scan_duration_ms: number;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [cleanupReport, setCleanupReport] = useState<CleanupReport | null>(null);
  const [cleanupScanning, setCleanupScanning] = useState(false);
  const [cleanupDeleting, setCleanupDeleting] = useState(false);
  const [selectedCleanupKeys, setSelectedCleanupKeys] = useState<Set<string>>(new Set());
  const { message: msg, modal } = App.useApp();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin');
      if (response.status === 401) {
        // Redirect to login
        window.location.href = '/login?returnTo=/admin';
        return;
      }
      if (response.status === 403) {
        setError('Access denied. You do not have admin privileges.');
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

  const updateLicense = async (userId: string, licenseType: LicenseType) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, licenseType }),
      });
      if (!response.ok) {
        throw new Error('Failed to update license');
      }
      // Update local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map((u) =>
            u.id === userId ? { ...u, licenseType } : u
          ),
        };
      });
      msg.success(`License updated to ${licenseType}`);
    } catch {
      msg.error('Failed to update license');
    }
  };

  const runCleanupScan = async () => {
    try {
      setCleanupScanning(true);
      setCleanupReport(null);
      setSelectedCleanupKeys(new Set());
      const response = await fetch('/api/admin/cleanup');
      if (!response.ok) throw new Error('Scan failed');
      const report: CleanupReport = await response.json();
      setCleanupReport(report);
      if (report.issues.length === 0) {
        msg.success(`Scanned ${report.scanned_keys} keys — no issues found`);
      } else {
        // Auto-select safe-to-delete keys
        const safe = new Set(report.issues.filter(i => i.safe_to_delete).map(i => i.key));
        setSelectedCleanupKeys(safe);
      }
    } catch (err: any) {
      msg.error(`Scan failed: ${err.message}`);
    } finally {
      setCleanupScanning(false);
    }
  };

  const executeCleanup = async () => {
    if (!cleanupReport || selectedCleanupKeys.size === 0) return;

    const keysToDelete: string[] = [];
    const staleIndexEntries: { type: string; value: string; userId?: string }[] = [];

    for (const issue of cleanupReport.issues) {
      if (!selectedCleanupKeys.has(issue.key)) continue;

      if (issue.type === 'stale_user_index') {
        // Parse the key to determine what kind of index entry it is
        const usersIndexMatch = issue.key.match(/^users:index member "(.+)"$/);
        const userServicesMatch = issue.key.match(/^user:([^:]+):services field "(.+)"$/);
        if (usersIndexMatch) {
          staleIndexEntries.push({ type: 'users_index', value: usersIndexMatch[1] });
        } else if (userServicesMatch) {
          staleIndexEntries.push({ type: 'user_services', userId: userServicesMatch[1], value: userServicesMatch[2] });
        } else {
          keysToDelete.push(issue.key);
        }
      } else {
        keysToDelete.push(issue.key);
      }
    }

    try {
      setCleanupDeleting(true);
      const response = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: keysToDelete, stale_index_entries: staleIndexEntries }),
      });
      if (!response.ok) throw new Error('Cleanup failed');
      const result = await response.json();
      msg.success(`Cleaned up ${result.deleted} keys${result.failed > 0 ? `, ${result.failed} failed` : ''}`);
      // Re-scan to show updated state
      await runCleanupScan();
    } catch (err: any) {
      msg.error(`Cleanup failed: ${err.message}`);
    } finally {
      setCleanupDeleting(false);
    }
  };

  const issueTypeLabels: Record<string, { label: string; color: string }> = {
    orphan_service: { label: 'Orphan Service', color: 'red' },
    orphan_published: { label: 'Orphan Published', color: 'red' },
    orphan_analytics: { label: 'Orphan Analytics', color: 'orange' },
    orphan_cache: { label: 'Orphan Cache', color: 'gold' },
    orphan_token: { label: 'Orphan Token', color: 'red' },
    orphan_token_hash: { label: 'Orphan Token Hash', color: 'red' },
    stale_user_index: { label: 'Stale Index', color: 'orange' },
    orphan_mcp_state: { label: 'Orphan MCP State', color: 'orange' },
    orphan_mcp_token: { label: 'Orphan MCP Token', color: 'red' },
    orphan_tenant: { label: 'Orphan Tenant', color: 'orange' },
    unknown_key: { label: 'Unknown Key', color: 'purple' },
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
      width: 130,
      render: (license: LicenseType, record: UserSummary) => {
        const colors: Record<LicenseType, string> = {
          free: 'default',
          pro: 'purple',
          premium: 'gold',
        };
        return (
          <Select
            value={license}
            size="small"
            variant="borderless"
            style={{ width: '100%' }}
            onChange={(value: LicenseType) => updateLicense(record.id, value)}
            options={[
              { value: 'free', label: <Tag color={colors.free}>Free</Tag> },
              { value: 'pro', label: <Tag color={colors.pro}>Pro</Tag> },
              { value: 'premium', label: <Tag color={colors.premium}>Premium</Tag> },
            ]}
            labelRender={({ value }) => (
              <Tag color={colors[value as LicenseType]} style={{ margin: 0 }}>
                {(value as string).charAt(0).toUpperCase() + (value as string).slice(1)}
              </Tag>
            )}
          />
        );
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
        <Spin size="medium" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', padding: 24 }}>
        <Content style={{ maxWidth: 600, margin: '100px auto' }}>
          <Alert
            title="Access Denied"
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
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span>Users ({data.users.length})</span>
                    <Input
                      placeholder="Search users..."
                      prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                      allowClear
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{ width: 240 }}
                      size="small"
                    />
                  </div>
                }
                style={{ background: '#fff', overflow: 'hidden', marginBottom: 16 }}
              >
                <Table
                  dataSource={data.users.filter((u) => {
                    if (!userSearch) return true;
                    const q = userSearch.toLowerCase();
                    return (
                      u.email.toLowerCase().includes(q) ||
                      u.licenseType.toLowerCase().includes(q)
                    );
                  })}
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

              {/* Redis Cleanup Section */}
              <Card
                variant="borderless"
                title={
                  <Space>
                    <DeleteOutlined />
                    <span>Redis Cleanup</span>
                    {cleanupReport && cleanupReport.issues.length > 0 && (
                      <Badge count={cleanupReport.issues.length} style={{ backgroundColor: '#fa8c16' }} />
                    )}
                  </Space>
                }
                extra={
                  <Space>
                    <Button
                      icon={<ScanOutlined />}
                      onClick={runCleanupScan}
                      loading={cleanupScanning}
                    >
                      Scan Redis
                    </Button>
                    {cleanupReport && cleanupReport.issues.length > 0 && selectedCleanupKeys.size > 0 && (
                      <Popconfirm
                        title={`Delete ${selectedCleanupKeys.size} selected keys?`}
                        description="This cannot be undone."
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        onConfirm={executeCleanup}
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          loading={cleanupDeleting}
                        >
                          Clean {selectedCleanupKeys.size} keys
                        </Button>
                      </Popconfirm>
                    )}
                  </Space>
                }
                style={{ background: '#fff', overflow: 'hidden', marginTop: 16 }}
              >
                {!cleanupReport && !cleanupScanning && (
                  <Empty
                    description="Click 'Scan Redis' to analyze all keys for orphans and issues"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
                {cleanupScanning && (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin size="medium" />
                    <div style={{ marginTop: 16, color: '#666' }}>Scanning all Redis keys...</div>
                  </div>
                )}
                {cleanupReport && (
                  <>
                    {/* Scan Summary */}
                    <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                      <Statistic title="Scanned" value={cleanupReport.scanned_keys} suffix="keys" />
                      <Statistic title="Valid" value={cleanupReport.valid_keys} valueStyle={{ color: '#52c41a' }} suffix="keys" />
                      <Statistic title="Issues" value={cleanupReport.issues.length} valueStyle={{ color: cleanupReport.issues.length > 0 ? '#fa8c16' : '#52c41a' }} />
                      <Statistic title="Scan Time" value={cleanupReport.scan_duration_ms} suffix="ms" />
                    </div>

                    {/* Category Breakdown */}
                    <div style={{ marginBottom: 16 }}>
                      <Typography.Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>Key Categories</Typography.Text>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {Object.entries(cleanupReport.categories)
                          .filter(([, cat]) => cat.total > 0)
                          .map(([name, cat]) => (
                            <div key={name} style={{
                              background: cat.issues > 0 ? '#fff7e6' : '#f6ffed',
                              border: `1px solid ${cat.issues > 0 ? '#ffd591' : '#b7eb8f'}`,
                              borderRadius: 8,
                              padding: '6px 12px',
                              fontSize: 12,
                            }}>
                              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{name}</span>
                              <span style={{ color: '#52c41a', marginLeft: 8 }}>{cat.valid} ok</span>
                              {cat.issues > 0 && <span style={{ color: '#fa8c16', marginLeft: 6 }}>{cat.issues} issues</span>}
                              <span style={{ color: '#999', marginLeft: 6 }}>({cat.total} total)</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Entity Counts */}
                    <div style={{ marginBottom: 16 }}>
                      <Typography.Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>Entity Summary</Typography.Text>
                      <Space wrap>
                        <Tag color="blue">Users: {cleanupReport.entity_counts.valid_users} / {cleanupReport.entity_counts.users_in_index} in index</Tag>
                        <Tag color="purple">Services: {cleanupReport.entity_counts.valid_services}</Tag>
                        <Tag color="cyan">Tokens: {cleanupReport.entity_counts.valid_tokens}</Tag>
                      </Space>
                    </div>

                    {cleanupReport.issues.length === 0 ? (
                      <Alert
                        message="All clean"
                        description="No orphaned keys or issues found in Redis."
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                      />
                    ) : (
                      <>
                        {/* Summary by type */}
                        <div style={{ marginBottom: 12 }}>
                          <Space wrap>
                            {Object.entries(cleanupReport.summary).map(([type, count]) => {
                              const info = issueTypeLabels[type] || { label: type, color: 'default' };
                              return (
                                <Tag key={type} color={info.color}>
                                  {info.label}: {count}
                                </Tag>
                              );
                            })}
                          </Space>
                        </div>

                        {/* Select all / none */}
                        <div style={{ marginBottom: 8 }}>
                          <Space size="small">
                            <Button
                              size="small"
                              type="link"
                              onClick={() => setSelectedCleanupKeys(new Set(cleanupReport.issues.filter(i => i.safe_to_delete).map(i => i.key)))}
                            >
                              Select safe
                            </Button>
                            <Button
                              size="small"
                              type="link"
                              onClick={() => setSelectedCleanupKeys(new Set(cleanupReport.issues.map(i => i.key)))}
                            >
                              Select all
                            </Button>
                            <Button
                              size="small"
                              type="link"
                              onClick={() => setSelectedCleanupKeys(new Set())}
                            >
                              Select none
                            </Button>
                          </Space>
                        </div>

                        {/* Issues table */}
                        <Table
                          dataSource={cleanupReport.issues}
                          rowKey="key"
                          size="small"
                          pagination={cleanupReport.issues.length > 20 ? { pageSize: 20 } : false}
                          scroll={{ x: 600 }}
                          rowSelection={{
                            selectedRowKeys: Array.from(selectedCleanupKeys),
                            onChange: (keys) => setSelectedCleanupKeys(new Set(keys as string[])),
                          }}
                          columns={[
                            {
                              title: 'Key',
                              dataIndex: 'key',
                              key: 'key',
                              ellipsis: true,
                              width: 300,
                              render: (key: string) => (
                                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{key}</span>
                              ),
                            },
                            {
                              title: 'Type',
                              dataIndex: 'type',
                              key: 'type',
                              width: 140,
                              filters: Object.entries(issueTypeLabels).map(([value, { label }]) => ({ text: label, value })),
                              onFilter: (value, record) => record.type === value,
                              render: (type: string) => {
                                const info = issueTypeLabels[type] || { label: type, color: 'default' };
                                return <Tag color={info.color}>{info.label}</Tag>;
                              },
                            },
                            {
                              title: 'Reason',
                              dataIndex: 'reason',
                              key: 'reason',
                              ellipsis: true,
                            },
                            {
                              title: 'Safe',
                              dataIndex: 'safe_to_delete',
                              key: 'safe',
                              width: 60,
                              render: (safe: boolean) => safe
                                ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                : <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />,
                            },
                          ]}
                        />
                      </>
                    )}
                  </>
                )}
              </Card>
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
}
