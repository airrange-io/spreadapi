'use client';

import React from 'react';
import { Spin } from 'antd';

interface ServiceListSkeletonProps {
  viewMode?: 'card' | 'table';
}

export default function ServiceListSkeleton({ viewMode = 'card' }: ServiceListSkeletonProps) {
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