'use client';

import React from 'react';
import { Collapse } from 'antd';
import type { CollapseProps } from 'antd';

interface CollapsibleSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = true,
  extra,
  style
}) => {
  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: (
        <div style={{ color: '#898989', fontWeight: 'bold' }}>
          {title}
        </div>
      ),
      children: (
        <div style={{
          fontSize: '12px',
        }}>
          {children}
        </div>
      ),
      extra: extra,
      styles: {
        header: {
          backgroundColor: '#f8f8f8',
          borderBottom: 'none',
          padding: '14px',
        },
        body: {
          backgroundColor: '#f8f8f8',
          padding: '8px 14px 14px 14px',
        },
      },
    },
  ];

  return (
    <Collapse
      defaultActiveKey={defaultOpen ? ['1'] : []}
      expandIconPlacement="end"
      bordered={false}
      style={{
        backgroundColor: '#f8f8f8',
        border: 'none',
        borderRadius: '8px',
        overflow: 'hidden',
        ...style
      }}
      items={items}
    />
  );
};

export default CollapsibleSection;