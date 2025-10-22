'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Space, Tag, Button, Dropdown } from 'antd';
import { HolderOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import type { InputDefinition, OutputDefinition } from './ParametersSection';

interface SortableParameterItemProps {
  parameter: InputDefinition | OutputDefinition;
  type: 'input' | 'output';
  isDemoMode?: boolean;
  useCompactLayout?: boolean;
  onNavigate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const SortableParameterItem: React.FC<SortableParameterItemProps> = ({
  parameter,
  type,
  isDemoMode,
  useCompactLayout,
  onNavigate,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: parameter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const input = type === 'input' ? (parameter as InputDefinition) : null;
  const output = type === 'output' ? (parameter as OutputDefinition) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="sortable-parameter-item"
    >
      <div style={{
        padding: '8px 12px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e8e8e8',
        cursor: isDragging ? 'grabbing' : 'default',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            role="button"
            aria-label={`Drag to reorder ${parameter.name}`}
            aria-describedby={`drag-hint-${parameter.id}`}
            tabIndex={0}
            style={{
              cursor: 'grab',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#999',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#502D80';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#999';
            }}
            onKeyDown={(e) => {
              // Improve keyboard accessibility
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
              }
            }}
          >
            <HolderOutlined />
            {/* Hidden hint for screen readers */}
            <span id={`drag-hint-${parameter.id}`} style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
              Press space to start dragging. Use arrow keys to reorder. Press space again to drop.
            </span>
          </div>

          {/* Parameter Content */}
          <div
            style={{ cursor: 'pointer', flex: 1 }}
            onClick={onNavigate}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Space direction="vertical" size={0}>
              <Space direction='horizontal' style={{ flexWrap: 'wrap', fontSize: '14px' }}>
                <strong style={{ color: input?.mandatory !== false ? '#4F2D7F' : 'inherit' }}>
                  {parameter.name}
                </strong>
              </Space>
              <Space direction='horizontal' style={{ flexWrap: 'wrap' }}>
                {useCompactLayout ? (
                  <div style={{ color: '#888', fontSize: '11px' }}>{parameter.address}</div>
                ) : (
                  parameter.title && parameter.title !== parameter.name && (
                    <div style={{ color: '#888', fontSize: '11px' }}>{parameter.title}</div>
                  )
                )}
                {input && (input.min !== undefined || input.max !== undefined) && (
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                    {input.min !== undefined && `Min: ${input.min}`}
                    {input.min !== undefined && input.max !== undefined && ' • '}
                    {input.max !== undefined && `Max: ${input.max}`}
                  </div>
                )}
                {parameter.description && (
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                    {parameter.description}
                  </div>
                )}
              </Space>
            </Space>
          </div>

          {/* Actions */}
          <Space size={4}>
            {!useCompactLayout && (
              <Tag color='purple' onClick={onNavigate} style={{ cursor: 'pointer', padding: '4px 8px' }}>
                {parameter.address}
              </Tag>
            )}
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={onEdit}
            />
            {!isDemoMode && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'delete',
                      label: 'Delete',
                      icon: <DeleteOutlined />,
                      danger: true,
                      onClick: onDelete,
                    },
                  ],
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button size="small" type="text" icon={<MoreOutlined />} />
              </Dropdown>
            )}
          </Space>
        </div>
      </div>
    </div>
  );
};
