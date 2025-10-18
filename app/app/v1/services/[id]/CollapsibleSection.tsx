'use client';

import React from 'react';
import { Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import './CollapsibleSection.css';

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
          fontSize: '14px',
        }}>
          {children}
        </div>
      ),
      extra: extra,
    },
  ];

  return (
    <Collapse
      defaultActiveKey={defaultOpen ? ['1'] : []}
      expandIconPosition="end"
      style={{
        backgroundColor: '#f8f8f8',
        border: 'none',
        borderRadius: '8px',
        overflow: 'hidden',
        ...style
      }}
      items={items}
      className="custom-collapse-section"
    />
  );
};

export default CollapsibleSection;
