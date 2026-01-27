'use client';

import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { Card, Empty, Button, Space, Typography, Tag, Popconfirm, Row, Col, App } from 'antd';
import { EditOutlined, DeleteOutlined, LineChartOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { generateServiceId } from '@/lib/generateServiceId';
import { useAuth } from '@/components/auth/AuthContext';
import { useTranslation } from '@/lib/i18n';

const { Text, Paragraph } = Typography;

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

interface ServiceListClientProps {
  initialServices: Service[];
  allServices: Service[];
  initialSearchQuery: string;
}

export default function ServiceListClient({ 
  initialServices, 
  allServices,
  initialSearchQuery 
}: ServiceListClientProps) {
  const router = useRouter();
  const { notification } = App.useApp();
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const [services, setServices] = useState<Service[]>(allServices);
  const [filteredServices, setFilteredServices] = useState<Service[]>(initialServices);
  const [isPending, startTransition] = useTransition();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  
  // Update services when prop changes (after server refresh)
  useEffect(() => {
    setServices(allServices);
    setFilteredServices(initialServices);
  }, [allServices, initialServices]);

  // Client-side filtering is handled by parent now, 
  // so we just use the filtered services passed as props

  // Optimistic delete with proper error handling
  const handleDelete = useCallback(async (serviceId: string, serviceName: string) => {
    // Add to deleting set for UI feedback
    setDeletingIds(prev => new Set(prev).add(serviceId));
    
    // Optimistically update UI
    const previousServices = services;
    setServices(prev => prev.filter(s => s.id !== serviceId));
    
    try {
      const response = await fetch(`/api/services?id=${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      notification.success({ message: t('serviceListClient.serviceDeleted', { name: serviceName }) });
      
      // Trigger server revalidation
      router.refresh();
    } catch (error) {
      // Revert on error
      console.error('Error deleting service:', error);
      setServices(previousServices);
      notification.error({ message: t('serviceListClient.deleteFailed') });
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(serviceId);
        return next;
      });
    }
  }, [services, notification, router, t]);

  const handleEdit = useCallback((serviceId: string) => {
    router.push(`/app/service/${serviceId}`);
  }, [router]);

  const handleUsage = useCallback((serviceId: string) => {
    router.push(`/analytics/${serviceId}`);
  }, [router]);

  const formatDate = useMemo(() => (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [locale]);

  // Memoize the service cards to prevent unnecessary re-renders
  const serviceCards = useMemo(() => (
    filteredServices.map((service) => {
      const isDeleting = deletingIds.has(service.id);
      
      return (
        <Col xs={24} sm={24} md={12} lg={8} xl={6} key={service.id}>
          <Card
            hoverable={!isDeleting}
            onClick={() => !isDeleting && handleEdit(service.id)}
            style={{ 
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.5 : 1,
              transition: 'opacity 0.2s'
            }}
            styles={{ body: { padding: 24, paddingRight: 16 } }}
            actions={[
              <div onClick={(e) => e.stopPropagation()} key="edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(service.id)}
                  disabled={isDeleting}
                >
                  {t('common.edit')}
                </Button>
              </div>,
              <div onClick={(e) => e.stopPropagation()} key="usage">
                <Button
                  type="text"
                  icon={<LineChartOutlined />}
                  onClick={() => handleUsage(service.id)}
                  disabled={service.status === 'draft' || isDeleting}
                >
                  {t('serviceListClient.usage')}
                </Button>
              </div>
            ]}
          >
            <Card.Meta
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{service.name}</Text>
                  <Tag color={service.status === 'published' ? 'green' : 'orange'} style={{ marginInlineEnd: 4}}>
                    {service.status === 'published' ? t('serviceListClient.statusActive') : t('serviceListClient.statusDraft')}
                  </Tag>
                </div>
              }
              description={
                <Space orientation="vertical" style={{ width: '100%' }}>
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ marginBottom: 8 }}
                  >
                    {service.description || t('serviceListClient.noDescription')}
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
                        title={t('serviceListClient.deleteConfirmTitle')}
                        description={t('serviceListClient.deleteConfirmDescription')}
                        onConfirm={() => handleDelete(service.id, service.name)}
                        okText={t('common.yes')}
                        cancelText={t('common.no')}
                        okButtonProps={{ danger: true }}
                        disabled={isDeleting}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          loading={isDeleting}
                          disabled={isDeleting}
                        />
                      </Popconfirm>
                    </div>
                  </div>

                  {service.calls > 0 && (
                    <Space size="small" style={{ fontSize: '12px', color: '#888' }}>
                      <BarChartOutlined />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {t('serviceListClient.callCount', { count: String(service.calls) })}
                      </Text>
                    </Space>
                  )}
                </Space>
              }
            />
          </Card>
        </Col>
      );
    })
  ), [filteredServices, deletingIds, handleEdit, handleDelete, handleUsage, formatDate, t, locale]);

  if (services.length === 0 && !initialSearchQuery) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t('serviceListClient.noApisCreated')}
        style={{ marginTop: 180 }}
      >
        <Button type="primary" onClick={() => {
          const newId = generateServiceId(user?.id);
          console.log('[ServiceList] Generated service ID:', newId);
          router.push(`/app/service/${newId}`);
        }}>
          {t('serviceListClient.createFirstService')}
        </Button>
      </Empty>
    );
  }

  if (filteredServices.length === 0 && initialSearchQuery) {
    return (
      <Empty
        description={t('serviceListClient.noApisFound', { query: initialSearchQuery })}
        style={{ marginTop: 100 }}
      />
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <Row gutter={[16, 16]}>
        {serviceCards}
      </Row>
    </div>
  );
}