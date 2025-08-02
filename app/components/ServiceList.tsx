'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, Empty, Button, Space, Typography, Tag, Spin, Popconfirm, Row, Col, App, Table, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, PlayCircleOutlined, CalendarOutlined, BarChartOutlined, LineChartOutlined, MoreOutlined, CopyOutlined, ExportOutlined, ApiOutlined, LoadingOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { generateServiceId } from '@/lib/generateServiceId';
import { DEMO_SERVICE_ID, DEMO_SERVICE_IDS, isDemoService } from '@/lib/constants';

const { Title, Text, Paragraph } = Typography;

interface Service {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  calls: number;
  lastUsed: string | null;
}

interface ServiceListProps {
  searchQuery?: string;
  viewMode?: 'table' | 'card';
  isAuthenticated?: boolean | null;
  userId?: string;
}

export default function ServiceList({ searchQuery = '', viewMode = 'card', isAuthenticated = null, userId }: ServiceListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { message } = App.useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(isAuthenticated === null);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [clickedServiceId, setClickedServiceId] = useState<string | null>(null);
  const [hideDemoService, setHideDemoService] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    // Check if demo service should be hidden
    const shouldHideDemo = localStorage.getItem('hideDemoService') === 'true';
    setHideDemoService(shouldHideDemo);

    // Only load services once when auth state is determined
    if (isAuthenticated !== null) {
      loadServices();
    }
  }, [isAuthenticated]);

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
  }, []);

  // Filter services based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.id.toLowerCase().includes(query)
    );

    setFilteredServices(filtered);
  }, [searchQuery, services]);

  const loadServices = async (forceHideDemo?: boolean) => {
    const shouldHideDemo = forceHideDemo !== undefined ? forceHideDemo : hideDemoService;
    // Prevent duplicate calls
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      // If not authenticated, show demo services
      if (isAuthenticated === false) {
        const demoServices: Service[] = [
          {
            id: DEMO_SERVICE_IDS[0],
            name: 'Demo: Compound Interest Calculator',
            description: 'Try our Excel API with this interactive compound interest calculator demo.',
            status: 'published',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
            calls: 0,
            lastUsed: null
          },
          {
            id: DEMO_SERVICE_IDS[1],
            name: 'Demo: Orders Lookup',
            description: 'Get customer and order summary based on external data.',
            status: 'published',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
            calls: 0,
            lastUsed: null
          }
        ];
        setServices(demoServices);
        setFilteredServices(demoServices);
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
        setFilteredServices([]);
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

        // If user has no services, add the demo services (unless hidden)
        if (loadedServices.length === 0 && !shouldHideDemo) {
          const demoServices: Service[] = [
            {
              id: DEMO_SERVICE_IDS[0],
              name: 'Demo: Compound Interest Calculator',
              description: 'Try our Excel API with this interactive compound interest calculator demo.',
              status: 'published',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: new Date().toISOString(),
              calls: 0,
              lastUsed: null
            },
            {
              id: DEMO_SERVICE_IDS[1],
              name: 'Demo: Orders Lookup',
              description: 'Get customer and order summary based on external data.',
              status: 'published',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: new Date().toISOString(),
              calls: 0,
              lastUsed: null
            }
          ];
          loadedServices.push(...demoServices);
        }

        setServices(loadedServices);
        // Initialize filtered services with all services if no search query
        if (!searchQuery.trim()) {
          setFilteredServices(loadedServices);
        }
      } else {
        // Handle 401 errors
        if (response.status === 401) {
          setServices([]);
          setFilteredServices([]);
          // If we thought we were authenticated but got 401, update state
          if (isAuthenticated) {
            window.location.href = '/login';
          }
        } else {
          message.error('Failed to load services');
        }
      }
    } catch (error: any) {
      // Only log non-401 errors
      if (error?.status !== 401) {
        console.error('Error loading services:', error);
        message.error('Failed to load services');
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleDelete = useCallback(async (serviceId: string, serviceName: string) => {
    try {
      const response = await fetch(`/api/services?id=${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success(`Service "${serviceName}" deleted`);
        loadServices(); // Reload the list
      } else {
        message.error('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      message.error('Failed to delete service');
    }
  }, [message]);

  const handleEdit = useCallback((serviceId: string) => {
    setClickedServiceId(serviceId);
    router.push(`/service/${serviceId}`);
  }, [router]);


  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const tableColumns = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Service) => (
        <Button type="link" onClick={() => handleEdit(record.id)} style={{ padding: 0 }}>
          {record.id === DEMO_SERVICE_ID ? `${text}` : text}
          {clickedServiceId === record.id && <LoadingOutlined style={{ marginLeft: 8 }} />}
        </Button>
      ),
      sorter: (a: Service, b: Service) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      responsive: ['md' as const] as any,
      render: (text: string) => text || 'No description',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' },
      ],
      onFilter: (value: string, record: Service) => record.status === value,
    },
    {
      title: 'Calls',
      dataIndex: 'calls',
      key: 'calls',
      align: 'center' as const,
      width: 100,
      render: (calls: number) => calls || 0,
      sorter: (a: Service, b: Service) => a.calls - b.calls,
    },
    // {
    //   title: 'Updated',
    //   dataIndex: 'updatedAt',
    //   key: 'updatedAt',
    //   width: 180,
    //   render: (date: string) => formatDate(date),
    //   sorter: (a: Service, b: Service) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    // },
    {
      title: '',
      key: 'actions',
      width: 60,
      align: 'left' as const,
      render: (_: any, record: Service) => (
        <Space size="middle">
          {/* <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          /> */}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'copy',
                  icon: <CopyOutlined />,
                  label: 'Copy ID',
                  onClick: () => {
                    navigator.clipboard.writeText(record.id);
                    message.success('Service ID copied to clipboard');
                  },
                },
                {
                  key: 'endpoint',
                  icon: <ApiOutlined />,
                  label: 'Copy Endpoint',
                  onClick: () => {
                    const endpoint = `${window.location.origin}/api/v1/services/${record.id}/execute`;
                    navigator.clipboard.writeText(endpoint);
                    message.success('API endpoint copied to clipboard');
                  },
                  disabled: record.status === 'draft',
                },
                { type: 'divider' },
                ...(record.id !== DEMO_SERVICE_ID ? [{
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: (
                    <Popconfirm
                      title="Delete this service?"
                      description="This action cannot be undone."
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleDelete(record.id, record.name);
                      }}
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{ danger: true }}
                    >
                      <span style={{ color: '#ff4d4f' }}>Delete</span>
                    </Popconfirm>
                  ),
                  danger: true,
                }] : [{
                  key: 'remove-demo',
                  icon: <DeleteOutlined />,
                  label: 'Remove this demo service',
                  onClick: () => {
                    localStorage.setItem('hideDemoService', 'true');
                    setHideDemoService(true);
                    loadServices(true);
                    message.success('Demo service removed from your list');
                  },
                }]),
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ], [clickedServiceId, formatDate, handleDelete, handleEdit, message, setHideDemoService]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <Spin size="default" />
      </div>
    );
  }

  if (services.length === 0 && !searchQuery) {
    // If auth state is still loading (null), don't show anything yet
    if (isAuthenticated === null) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <Spin size="default" />
        </div>
      );
    }

    // This empty state should only show if authenticated but no services (including demo)
    if (isAuthenticated === true) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No APIs created yet"
          style={{ marginTop: 180 }}
        >
          <Space direction="vertical" align="center">
            <Button type="primary" onClick={() => {
              const newId = generateServiceId(userId || 'test1234');
              console.log('[ServiceList] Generated service ID:', newId);
              router.push(`/service/${newId}`);
            }}>
              Create Your First Service
            </Button>
            {hideDemoService && (
              <Button type="link" onClick={() => {
                localStorage.removeItem('hideDemoService');
                setHideDemoService(false);
                loadServices(false);
              }}>
                Show demo service
              </Button>
            )}
          </Space>
        </Empty>
      );
    }

    // For unauthenticated users, we should have the demo service
    return null;
  }

  if (filteredServices.length === 0 && searchQuery) {
    return (
      <Empty
        description={`No APIs found matching "${searchQuery}"`}
        style={{ marginTop: 100 }}
      />
    );
  }

  if (viewMode === 'table') {
    return (
      <div style={{ padding: '20px 0' }}>
        <Table
          columns={tableColumns}
          dataSource={filteredServices}
          rowKey="id"
          pagination={false}
          // pagination={{
          //   pageSize: 10,
          //   showSizeChanger: true,
          //   showTotal: (total) => `Total ${total} services`,
          // }}
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
              styles={{ body: { padding: 24, paddingRight: 16 } }}
              actions={[
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(service.id)}
                  >
                    {service.id === DEMO_SERVICE_ID ? 'Try Demo' : 'Edit'}
                  </Button>
                </div>,
                // <div onClick={(e) => e.stopPropagation()}>
                //   <Button
                //     type="text"
                //     icon={<PlayCircleOutlined />}
                //     onClick={() => handleTest(service.id, service.name)}
                //     disabled={service.status === 'draft'}
                //   >
                //     Test
                //   </Button>
                // </div>,
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
                    <Tag color={service.status === 'published' ? 'green' : 'orange'} style={{ marginInlineEnd: 4 }}>
                      {service.status}
                    </Tag>
                  </div>
                }
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: 8 }}
                    >
                      {service.description || 'No description'}
                    </Paragraph>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space size="small" style={{ fontSize: '12px', color: '#888' }}>
                        <CalendarOutlined />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatDate(service.updatedAt)}
                        </Text>
                      </Space>

                      {service.id !== DEMO_SERVICE_ID && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Popconfirm
                            title="Delete this service?"
                            description="This action cannot be undone."
                            onConfirm={() => handleDelete(service.id, service.name)}
                            okText="Yes"
                            cancelText="No"
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
                      )}
                    </div>

                    {service.calls > 0 && (
                      <Space size="small" style={{ fontSize: '12px', color: '#888' }}>
                        <BarChartOutlined />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {service.calls} calls
                        </Text>
                      </Space>
                    )}
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