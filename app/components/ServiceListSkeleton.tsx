'use client';

import React from 'react';
import { Spin } from 'antd';

interface ServiceListSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export default function ServiceListSkeleton({ viewMode = 'list' }: ServiceListSkeletonProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '20px 0'
    }}>
      <Spin size="medium" />
    </div>
  );
}