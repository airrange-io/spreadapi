'use client';

import React, { useState, useEffect } from 'react';
import { Card, Empty, Button, Space, Typography, Tag, Spin, Popconfirm, Row, Col, App, Table, Dropdown, Menu } from 'antd';
import { EditOutlined, DeleteOutlined, PlayCircleOutlined, CalendarOutlined, BarChartOutlined, LineChartOutlined, MoreOutlined, CopyOutlined, ExportOutlined, ApiOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { generateServiceId } from '@/lib/generateServiceId';

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
  viewMode?: 'card' | 'table';
}

export default function ServiceList({ searchQuery = '', viewMode = 'card' }: ServiceListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { message } = App.useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    // Always load fresh data when component mounts
    loadServices();
  }, []);

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

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      const data = await response.json();

      if (response.ok) {
        const loadedServices = data.services || [];
        setServices(loadedServices);
        // Initialize filtered services with all services if no search query
        if (!searchQuery.trim()) {
          setFilteredServices(loadedServices);
        }
      } else {
        message.error('Failed to load services');
      }
    } catch (error) {
      console.error('Error loading services:', error);
      message.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string, serviceName: string) => {
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
  };

  const handleEdit = (serviceId: string) => {
    router.push(`/service/${serviceId}`);
  };

  const handleTest = (serviceId: string, serviceName: string) => {
    // Navigate to API tester with pre-filled service ID and name
    router.push(`/api-tester?service=${serviceId}&name=${encodeURIComponent(serviceName)}`);
  };

  const handleUsage = (serviceId: string) => {
    // Navigate to usage/analytics page
    router.push(`/analytics/${serviceId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTableColumns = () => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Service) => (
        <Button type="link" onClick={() => handleEdit(record.id)} style={{ padding: 0 }}>
          {text}
        </Button>
      ),
      sorter: (a: Service, b: Service) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || 'No description',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
      width: 80,
      render: (calls: number) => calls || 0,
      sorter: (a: Service, b: Service) => a.calls - b.calls,
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date: string) => formatDate(date),
      sorter: (a: Service, b: Service) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Service) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'test',
                  icon: <PlayCircleOutlined />,
                  label: 'Test API',
                  onClick: () => handleTest(record.id, record.name),
                  disabled: record.status === 'draft',
                },
                {
                  key: 'usage',
                  icon: <LineChartOutlined />,
                  label: 'View Usage',
                  onClick: () => handleUsage(record.id),
                  disabled: record.status === 'draft',
                },
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
                    const endpoint = `${window.location.origin}/api/${record.id}`;
                    navigator.clipboard.writeText(endpoint);
                    message.success('API endpoint copied to clipboard');
                  },
                  disabled: record.status === 'draft',
                },
                { type: 'divider' },
                {
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
  ];

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
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No APIs created yet"
        style={{ marginTop: 180 }}
      >
        <Button type="primary" onClick={() => {
          const newId = generateServiceId();
          console.log('[ServiceList] Generated service ID:', newId);
          router.push(`/service/${newId}`);
        }}>
          Create Your First Service
        </Button>
      </Empty>
    );
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
          columns={getTableColumns()}
          dataSource={filteredServices}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} services`,
          }}
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
                    Edit
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
                  <Button
                    type="text"
                    icon={<LineChartOutlined />}
                    onClick={() => handleUsage(service.id)}
                    disabled={service.status === 'draft'}
                  >
                    Usage
                  </Button>
                </div>
              ]}
            >
              <Card.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>{service.name}</Text>
                    <Tag color={service.status === 'published' ? 'green' : 'orange'} style={{ marginInlineEnd: 4}}>
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