'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, Empty, Button, Space, Typography, Tag, Spin, Popconfirm, Row, Col, App, Table, Dropdown, Badge } from 'antd';
import { EditOutlined, DeleteOutlined, CalendarOutlined, BarChartOutlined, MoreOutlined, CopyOutlined, ApiOutlined, LoadingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { deleteLocalService } from '@/lib/localServiceStorage';
import type { LocalService } from '@/lib/localServiceStorage';
import { useAuth } from '@/components/auth/AuthContext';
import { useRealtimeCallCounts } from '@/hooks/useRealtimeCallCounts';

const { Text, Paragraph } = Typography;

interface Service {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'published' | 'private';
  createdAt: string;
  updatedAt: string;
  calls: number;
  lastUsed: string | null;
}

interface ServiceListProps {
  searchQuery?: string;
  viewMode?: 'table' | 'card';
  isAuthenticated?: boolean | null;
  onServiceCount?: (count: number) => void;
  onUseSample?: () => void;
  localServices?: LocalService[];
  onLocalServicesChange?: () => void;
}

export default function ServiceList({ searchQuery = '', viewMode = 'card', isAuthenticated = null, onServiceCount, onUseSample, localServices, onLocalServicesChange }: ServiceListProps) {
  const router = useRouter();
  const { notification } = App.useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(isAuthenticated === null);
  const [clickedServiceId, setClickedServiceId] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const { t, locale } = useTranslation();
  const { user } = useAuth();

  // Real-time call count updates via Pusher
  const { getCallCount } = useRealtimeCallCounts({
    userId: user?.id,
    enabled: !!user?.id,
  });

  // Merge cloud services with local (private) services
  const mergedServices = useMemo(() => {
    const localList: Service[] = (localServices || []).map(ls => ({
      id: ls.id,
      name: ls.name || (ls.config as any)?.name || 'Untitled',
      description: ls.description || (ls.config as any)?.description || '',
      status: 'private' as const,
      createdAt: ls.createdAt,
      updatedAt: ls.savedAt,
      calls: 0,
      lastUsed: null,
    }));
    return [...localList, ...services];
  }, [services, localServices]);

  // Derive filtered services from mergedServices + searchQuery (no separate state needed)
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return mergedServices;
    const query = searchQuery.toLowerCase();
    return mergedServices.filter(service =>
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.id.toLowerCase().includes(query)
    );
  }, [searchQuery, mergedServices]);

  const loadServices = useCallback(async () => {
    // Prevent duplicate calls
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      // If not authenticated, clear cloud services (local services still show via mergedServices)
      if (isAuthenticated === false) {
        setServices([]);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      // If authentication state is still being checked, wait
      if (isAuthenticated === null) {
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      // Double-check we have a hanko cookie before making the API call
      const hankoCookie = document.cookie.split('; ').find(row => row.startsWith('hanko='));
      if (!hankoCookie) {
        setServices([]);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      const response = await fetch('/api/services', {
        credentials: 'include' // Ensure cookies are sent
      });

      if (response.ok) {
        const data = await response.json();
        const loadedServices = data.services || [];
        setServices(loadedServices);
      } else {
        // Handle 401 errors
        if (response.status === 401) {
          setServices([]);
          if (isAuthenticated) {
            window.location.href = '/login';
          }
        } else {
          notification.error({ message: t('serviceList.loadFailed') });
        }
      }
    } catch (error: any) {
      // Only log non-401 errors
      if (error?.status !== 401) {
        notification.error({ message: t('serviceList.loadFailed') });
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [isAuthenticated, notification, t]);

  useEffect(() => {
    // Only load services once when auth state is determined
    if (isAuthenticated !== null) {
      loadServices();
    }
  }, [isAuthenticated, loadServices]);

  // Listen for storage events to refresh when services are published/unpublished
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'refreshServiceList') {
        loadServices();
      }
    };

    // Check on focus if we need to refresh
    const handleFocus = () => {
      const lastRefresh = window.localStorage.getItem('refreshServiceList');
      if (lastRefresh) {
        window.localStorage.removeItem('refreshServiceList');
        loadServices();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadServices]);

  useEffect(() => {
    onServiceCount?.(mergedServices.length);
  }, [mergedServices.length, onServiceCount]);

  const handleDelete = useCallback(async (serviceId: string, serviceName: string) => {
    // Check if this is a private (local) service
    const isPrivate = (localServices || []).some(ls => ls.id === serviceId);

    if (isPrivate) {
      try {
        await deleteLocalService(serviceId);
        notification.success({ message: t('serviceList.serviceDeleted', { name: serviceName }) });
        onLocalServicesChange?.();
      } catch {
        notification.error({ message: t('serviceList.deleteFailed') });
      }
      return;
    }

    try {
      const response = await fetch(`/api/services?id=${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        notification.success({ message: t('serviceList.serviceDeleted', { name: serviceName }) });
        // Remove the deleted service from state immediately for better UX
        setServices(prevServices => prevServices.filter(s => s.id !== serviceId));
        // Then reload to ensure consistency with backend
        loadServices();
      } else {
        // Check for specific error message
        const errorData = await response.json().catch(() => null);
        if (errorData?.error?.includes('published')) {
          notification.warning({
            message: t('serviceList.cannotDeletePublished'),
            description: (
              <span>
                {({ en: <>Please unpublish <strong>{serviceName}</strong> first, then try deleting again.</>, de: <>Bitte <strong>{serviceName}</strong> zuerst deaktivieren, dann erneut versuchen.</> } as Record<string, React.ReactNode>)[locale] ?? <>Please unpublish <strong>{serviceName}</strong> first, then try deleting again.</>}
              </span>
            ),
          });
        } else {
          notification.error({ message: t('serviceList.deleteFailed') });
        }
      }
    } catch (error) {
      // Error deleting service
      notification.error({ message: t('serviceList.deleteFailed') });
    }
  }, [notification, t, locale, localServices, onLocalServicesChange, loadServices]);

  const handleEdit = useCallback((serviceId: string) => {
    setClickedServiceId(serviceId);
    router.push(`/app/service/${serviceId}`);
  }, [router]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [locale]);

  const tableColumns = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      onCell: () => ({ style: { color: '#4F2D7F', cursor: 'pointer' } }),
      render: (text: string, record: Service) => (
        <span onClick={() => handleEdit(record.id)}>
          {text}
          {clickedServiceId === record.id && <LoadingOutlined style={{ marginLeft: 8 }} />}
        </span>
      ),
      sorter: (a: Service, b: Service) => a.name.localeCompare(b.name),
    },
    {
      title: t('serviceList.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      responsive: ['md' as const] as any,
      render: (text: string) => text || t('serviceList.noDescription'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'published' ? 'purple' : status === 'private' ? 'blue' : 'orange'}>
          {status === 'published' ? t('serviceList.statusActive') : status === 'private' ? t('serviceList.statusPrivate') : t('serviceList.statusDraft')}
        </Tag>
      ),
      filters: [
        { text: t('serviceList.filterPublished'), value: 'published' },
        { text: t('serviceList.filterDraft'), value: 'draft' },
        { text: t('serviceList.filterPrivate'), value: 'private' },
      ],
      onFilter: (value: string, record: Service) => record.status === value,
    },
    {
      title: t('serviceList.calls'),
      dataIndex: 'calls',
      key: 'calls',
      align: 'center' as const,
      width: 100,
      render: (calls: number, record: Service) => {
        if (record.status === 'private') return '–';
        // Use real-time count if available, otherwise fall back to initial count
        const realtimeCount = getCallCount(record.id);
        const displayCount = realtimeCount !== undefined ? realtimeCount : (calls || 0);
        return (
          <Badge
            count={displayCount}
            showZero
            overflowCount={999999}
            style={{ backgroundColor: '#b0b0b0' }}
          />
        );
      },
      sorter: (a: Service, b: Service) => a.calls - b.calls,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      align: 'left' as const,
      render: (_: any, record: Service) => (
        <Space size="middle">
          <Dropdown
            menu={{
              items: [
                {
                  key: 'copy',
                  icon: <CopyOutlined />,
                  label: t('serviceList.copyId'),
                  onClick: () => {
                    navigator.clipboard.writeText(record.id);
                    notification.success({ message: t('serviceList.idCopied') });
                  },
                },
                {
                  key: 'endpoint',
                  icon: <ApiOutlined />,
                  label: t('serviceList.copyEndpoint'),
                  onClick: () => {
                    const endpoint = `${window.location.origin}/api/v1/services/${record.id}/execute`;
                    navigator.clipboard.writeText(endpoint);
                    notification.success({ message: t('serviceList.endpointCopied') });
                  },
                  disabled: record.status === 'draft' || record.status === 'private',
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: (
                    <Popconfirm
                      title={t('serviceList.deleteConfirmTitle')}
                      description={t('serviceList.deleteConfirmDescription')}
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleDelete(record.id, record.name);
                      }}
                      okText={t('common.yes')}
                      cancelText={t('common.no')}
                      okButtonProps={{ danger: true }}
                    >
                      {t('common.delete')}
                    </Popconfirm>
                  ),
                  danger: true,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ], [clickedServiceId, formatDate, handleDelete, handleEdit, notification, t, locale, getCallCount]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '20px 0'
      }}>
        <Spin size="default" />
      </div>
    );
  }

  if (mergedServices.length === 0 && !searchQuery) {
    return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 260px)',
          padding: '24px',
          maxWidth: '560px',
          margin: '0 auto',
        }}>
          {/* Description */}
          <p style={{
            fontSize: 14,
            color: '#bfbfbf',
            textAlign: 'center',
            margin: '0 0 20px',
            lineHeight: '1.6',
            maxWidth: '360px',
            userSelect: 'none',
          }}>
            {t('serviceList.emptyDescription')}
          </p>

          {/* Hero illustration: Spreadsheet → API */}
          <div
            onClick={onUseSample}
            style={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 12,
              overflow: 'hidden',
              cursor: onUseSample ? 'pointer' : undefined,
            }}
          >
            <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <rect width="800" height="400" fill="#F8F6FE" rx="12"/>
              {/* Spreadsheet on left */}
              <rect x="50" y="100" width="300" height="200" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
              <rect x="70" y="120" width="260" height="30" fill="#F8F6FE"/>
              <rect x="70" y="160" width="80" height="30" fill="#E6F4FF"/>
              <rect x="160" y="160" width="80" height="30" fill="#F8F6FE"/>
              <rect x="250" y="160" width="80" height="30" fill="#F8F6FE"/>
              <rect x="70" y="200" width="80" height="30" fill="#F8F6FE"/>
              <rect x="160" y="200" width="80" height="30" fill="#E6F4FF"/>
              <rect x="250" y="200" width="80" height="30" fill="#F8F6FE"/>
              <rect x="70" y="240" width="80" height="30" fill="#F8F6FE"/>
              <rect x="160" y="240" width="80" height="30" fill="#F8F6FE"/>
              <rect x="250" y="240" width="80" height="30" fill="#FFE4E1"/>
              {/* Arrow */}
              <path d="M370 200 L430 200" stroke="#9333EA" strokeWidth="3" strokeDasharray="5,5"/>
              <path d="M420 190 L430 200 L420 210" stroke="#9333EA" strokeWidth="3" fill="none"/>
              {/* API on right */}
              <rect x="450" y="100" width="300" height="200" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
              <rect x="470" y="120" width="260" height="40" fill="#F8F6FE"/>
              <text x="600" y="145" textAnchor="middle" fill="#0a0a0a" fontSize="16" fontWeight="500">API Endpoint</text>
              <rect x="470" y="180" width="260" height="100" rx="4" fill="#F8F6FE"/>
              <text x="490" y="210" fill="#5a5a5a" fontSize="14">{"{"}</text>
              <text x="510" y="230" fill="#5a5a5a" fontSize="14">{'"inputs": [...],'}</text>
              <text x="510" y="250" fill="#5a5a5a" fontSize="14">{'"outputs": [...]'}</text>
              <text x="490" y="270" fill="#5a5a5a" fontSize="14">{"}"}</text>
            </svg>
          </div>

          {/* On-premises hint */}
          <p style={{
            fontSize: 14,
            color: '#bfbfbf',
            textAlign: 'center',
            margin: '20px 0 0',
            lineHeight: '1.6',
          }}>
            {t('serviceList.onPremisesHint')} <a href="/on-premises" style={{ color: '#9333EA' }}>{t('serviceList.learnMore')}</a>
          </p>
        </div>
    );
  }

  if (filteredServices.length === 0 && searchQuery) {
    return (
      <Empty
        description={t('serviceList.noApisFound', { query: searchQuery })}
        style={{ marginTop: 100 }}
      />
    );
  }

  if (viewMode === 'table') {
    return (
      <div style={{ marginTop: 20, border: '1px solid #E7E7E7', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          columns={tableColumns}
          dataSource={filteredServices}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            style: { cursor: 'pointer' },
            onClick: (e) => {
              // Don't navigate if clicking on buttons or links
              const target = e.target as HTMLElement;
              if (target.closest('button') || target.closest('a') || target.closest('.ant-dropdown')) {
                return;
              }
              handleEdit(record.id);
            },
          })}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <Row gutter={[16, 16]}>
        {filteredServices.map((service) => (
          <Col xs={24} sm={24} md={12} lg={8} xl={6} key={service.id}>
            <Card
              hoverable
              onClick={() => handleEdit(service.id)}
              style={{ cursor: 'pointer' }}
              styles={{ body: { paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 16 } }}
              actions={[
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(service.id)}
                  >
                    {t('common.edit')}
                  </Button>
                </div>,
                <div onClick={(e) => e.stopPropagation()}>
                </div>
              ]}
            >
              <Card.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Text strong>{service.name}</Text>
                      {clickedServiceId === service.id && <LoadingOutlined style={{ marginLeft: 8 }} />}
                    </div>
                    <Tag color={service.status === 'published' ? 'purple' : service.status === 'private' ? 'blue' : 'orange'} style={{ marginInlineEnd: 4 }}>
                      {service.status === 'published' ? t('serviceList.statusActive') : service.status === 'private' ? t('serviceList.statusPrivate') : t('serviceList.statusDraft')}
                    </Tag>
                  </div>
                }
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: 8 }}
                    >
                      {service.description || t('serviceList.noDescription')}
                    </Paragraph>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space size="small" style={{ fontSize: '12px', color: '#888' }}>
                        <CalendarOutlined />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatDate(service.updatedAt)}
                        </Text>
                      </Space>

                      <div onClick={(e) => e.stopPropagation()}>
                        <Popconfirm
                          title={t('serviceList.deleteConfirmTitle')}
                          description={t('serviceList.deleteConfirmDescription')}
                          onConfirm={() => handleDelete(service.id, service.name)}
                          okText={t('common.yes')}
                          cancelText={t('common.no')}
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                          />
                        </Popconfirm>
                      </div>
                    </div>

                    {(() => {
                      // Use real-time count if available, otherwise fall back to initial count
                      const realtimeCount = getCallCount(service.id);
                      const displayCount = realtimeCount !== undefined ? realtimeCount : service.calls;
                      if (service.status !== 'private') {
                        return (
                          <Space size="small" style={{ fontSize: '12px', color: '#888' }}>
                            <BarChartOutlined />
                            <Badge
                              count={displayCount}
                              showZero
                              overflowCount={999999}
                              style={{ backgroundColor: '#b0b0b0' }}
                            />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {t('serviceList.calls').toLowerCase()}
                            </Text>
                          </Space>
                        );
                      }
                      return null;
                    })()}
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}