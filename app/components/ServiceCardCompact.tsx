'use client';

import React from 'react';
import { Dropdown, Popconfirm } from 'antd';
import { MoreOutlined, DeleteOutlined, CopyOutlined, ApiOutlined, ClockCircleOutlined, BarChartOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';
import type { MenuProps } from 'antd';

interface Service {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'published' | 'private';
  createdAt: string;
  updatedAt: string;
  calls: number;
  lastUsed: string | null;
}

interface ServiceCardCompactProps {
  service: Service;
  onClick: () => void;
  onDelete: (id: string, name: string) => void;
  onCopyId: (id: string) => void;
  onCopyEndpoint: (id: string) => void;
  isNavigating?: boolean;
  callCount?: number;
  locale?: string;
  folderMenuItems?: MenuProps['items'];
}

const statusColors: Record<string, string> = {
  published: '#9333EA',
  private: '#1677ff',
  draft: '#fa8c16',
};

const statusBgColors: Record<string, string> = {
  published: '#f3f0ff',
  private: '#e6f4ff',
  draft: '#fff7e6',
};

function timeAgo(dateStr: string, locale: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (locale === 'de') {
    if (diffMin < 1) return 'gerade eben';
    if (diffMin < 60) return `vor ${diffMin} Min.`;
    if (diffHrs < 24) return `vor ${diffHrs} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    return new Date(dateStr).toLocaleDateString('de', { month: 'short', day: 'numeric' });
  }

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export const ServiceCardCompact: React.FC<ServiceCardCompactProps> = ({
  service,
  onClick,
  onDelete,
  onCopyId,
  onCopyEndpoint,
  isNavigating = false,
  callCount,
  locale = 'en',
  folderMenuItems,
}) => {
  const { t } = useTranslation();
  const displayCount = callCount ?? service.calls ?? 0;
  const displayDate = service.updatedAt || service.createdAt;
  const color = statusColors[service.status] || '#8c8c8c';

  const menuItems: MenuProps['items'] = [
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: t('serviceList.copyId'),
      onClick: (e) => {
        e.domEvent.stopPropagation();
        onCopyId(service.id);
      },
    },
    {
      key: 'endpoint',
      icon: <ApiOutlined />,
      label: t('serviceList.copyEndpoint'),
      onClick: (e) => {
        e.domEvent.stopPropagation();
        onCopyEndpoint(service.id);
      },
      disabled: service.status === 'draft' || service.status === 'private',
    },
    ...(folderMenuItems ? [{ type: 'divider' as const }, ...folderMenuItems] : []),
    { type: 'divider' as const },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: (
        <Popconfirm
          title={t('serviceList.deleteConfirmTitle')}
          description={t('serviceList.deleteConfirmDescription')}
          onConfirm={(e) => {
            e?.stopPropagation();
            onDelete(service.id, service.name);
          }}
          onCancel={(e) => {
            e?.stopPropagation();
          }}
          okText={t('common.yes')}
          cancelText={t('common.no')}
          okButtonProps={{ danger: true }}
        >
          {t('common.delete')}
        </Popconfirm>
      ),
      danger: true,
    },
  ];

  return (
    <div
      onClick={onClick}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/serviceid', service.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      style={{
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 10,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        minHeight: 52,
        minWidth: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#d9d9d9';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#f0f0f0';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Status dot */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: statusBgColors[service.status] || '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: color,
          }} />
        </div>

        {/* Name + subtitle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#262626',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            {service.name}
            {isNavigating && <LoadingOutlined style={{ fontSize: 12 }} />}
          </div>
          <div style={{
            fontSize: 11,
            color: '#8c8c8c',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            gap: 4,
            alignItems: 'center',
          }}>
            {displayDate && (
              <>
                <ClockCircleOutlined style={{ fontSize: 11 }} />
                <span>{timeAgo(displayDate, locale)}</span>
              </>
            )}
            {service.description && (
              <>
                <span style={{ color: '#d9d9d9' }}>|</span>
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}>
                  {service.description}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Call count badge */}
        {service.status !== 'private' && displayCount > 0 && (
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#5b5b75',
            background: '#f5f5f8',
            borderRadius: 8,
            padding: '2px 8px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            {displayCount.toLocaleString()}
          </span>
        )}

        {/* Three-dot menu */}
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <span
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '2px 4px',
              borderRadius: 4,
              cursor: 'pointer',
              color: '#bfbfbf',
              flexShrink: 0,
            }}
          >
            <MoreOutlined style={{ fontSize: 14 }} />
          </span>
        </Dropdown>
      </div>
    </div>
  );
};
