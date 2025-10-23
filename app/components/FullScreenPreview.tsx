'use client';

import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface FullScreenPreviewProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({
  open,
  onClose,
  title,
  children
}) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header with close button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#fafafa'
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>
          {title || 'Full Screen Preview'}
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#fff'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default FullScreenPreview;
