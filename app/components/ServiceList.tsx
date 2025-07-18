'use client';

import React, { useState, useEffect } from 'react';
import { Card, Empty, Button, Space, Typography, Tag, Spin, message, Popconfirm, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, PlayCircleOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

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
}

export default function ServiceList({ searchQuery = '' }: ServiceListProps) {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    loadServices();
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

  const handleTest = (serviceId: string) => {
    // Navigate to API tester with pre-filled service ID
    router.push(`/api-tester?service=${serviceId}`);
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
        description="No APIs created yet"
        style={{ marginTop: 100 }}
      >
        <Button type="primary" onClick={() => {
          const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
          router.push(`/service/${newId}`);
        }}>
          Create Your First API
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

  return (
    <div style={{ padding: '20px 0' }}>
      <Row gutter={[16, 16]}>
        {filteredServices.map((service) => (
          <Col xs={24} sm={24} md={12} lg={8} xl={6} key={service.id}>
            <Card
              hoverable
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(service.id)}
                >
                  Edit
                </Button>,
                <Button
                  type="text"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleTest(service.id)}
                  disabled={service.status === 'draft'}
                >
                  Test
                </Button>,
                <Popconfirm
                  title="Delete this API?"
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
                  >
                    Delete
                  </Button>
                </Popconfirm>
              ]}
            >
              <Card.Meta
                title={
                  <Space>
                    <Text strong>{service.name}</Text>
                    <Tag color={service.status === 'published' ? 'green' : 'orange'}>
                      {service.status}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Paragraph 
                      ellipsis={{ rows: 2 }} 
                      style={{ marginBottom: 8 }}
                    >
                      {service.description || 'No description'}
                    </Paragraph>
                    
                    <Space size="small" style={{ fontSize: '12px', color: '#888' }}>
                      <CalendarOutlined />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatDate(service.updatedAt)}
                      </Text>
                    </Space>
                    
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