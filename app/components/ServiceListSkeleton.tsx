'use client';

import React from 'react';
import { Card, Row, Col, Skeleton, Space, Spin } from 'antd';

interface ServiceListSkeletonProps {
  viewMode?: 'card' | 'table';
}

export default function ServiceListSkeleton({ viewMode = 'card' }: ServiceListSkeletonProps) {
  // Show 4 skeleton items as a reasonable default
  const skeletonItems = Array(4).fill(null);
  
  if (viewMode === 'table') {
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
  
  return (
    <div style={{ padding: '20px 0' }}>
      <Row gutter={[16, 16]}>
        {skeletonItems.map((_, index) => (
          <Col xs={24} sm={24} md={12} lg={8} xl={6} key={`skeleton-${index}`}>
            <Card
              style={{ cursor: 'pointer' }}
              styles={{ body: { padding: 24, paddingRight: 16 } }}
              actions={[
                <Skeleton.Button active size="small" />,
                <Skeleton.Button active size="small" />
              ]}
            >
              <Card.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton.Input active size="small" style={{ width: 120 }} />
                    <Skeleton.Button active size="small" style={{ width: 60 }} />
                  </div>
                }
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Skeleton active paragraph={{ rows: 2 }} title={false} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <Skeleton.Input active size="small" style={{ width: 100 }} />
                      <Skeleton.Button active size="small" shape="circle" />
                    </div>
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