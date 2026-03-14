'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Tooltip, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { InputDefinition, OutputDefinition } from './ParametersSection';
import { useTranslation } from '@/lib/i18n';

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
  onNavigate,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 8px',
        cursor: isDragging ? 'grabbing' : 'default',
        borderRadius: 8,
        background: hovered ? '#FAF9FF' : 'transparent',
        transition: 'background 0.15s',
      }}>
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          role="button"
          tabIndex={0}
          style={{
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            color: '#ccc',
            fontSize: 14,
          }}
        >
          <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor">
            <circle cx="2" cy="1.5" r="1.2" />
            <circle cx="6" cy="1.5" r="1.2" />
            <circle cx="2" cy="6" r="1.2" />
            <circle cx="6" cy="6" r="1.2" />
            <circle cx="2" cy="10.5" r="1.2" />
            <circle cx="6" cy="10.5" r="1.2" />
          </svg>
        </div>

        {/* IN/OUT Badge */}
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: type === 'input' ? '#1665A1' : '#7B3AED',
          background: type === 'input' ? '#E8F2FB' : '#F0EEFF',
          borderRadius: 6,
          padding: '2px 0',
          margin: '0 4px',
          width: 38,
          textAlign: 'center',
          flexShrink: 0,
          lineHeight: '16px',
        }}>
          {type === 'input' ? 'IN' : 'OUT'}
        </span>

        {/* Parameter Content */}
        <div
          style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
          onClick={onNavigate}
        >
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#1a1a1a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {parameter.name}
            {type === 'input' && (parameter as InputDefinition).mandatory && (
              <span style={{ color: '#ff4d4f', marginLeft: 2, fontWeight: 700 }}>*</span>
            )}
          </div>
          <div style={{
            fontSize: 12,
            color: '#aaa',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {parameter.address}
          </div>
        </div>

        {/* Hover Actions */}
        <div style={{
          display: 'flex',
          gap: 2,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
          flexShrink: 0,
        }}>
          <Tooltip title={t('common.edit')}>
            <Button
              size="small"
              type="text"
              icon={<EditOutlined style={{ color: '#888' }} />}
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            />
          </Tooltip>
          {!isDemoMode && (
            <Tooltip title={t('common.delete')}>
              <Button
                size="small"
                type="text"
                icon={<DeleteOutlined style={{ color: '#888' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  Modal.confirm({
                    title: t('params.deleteParameter'),
                    content: t('params.cannotUndo'),
                    okText: t('common.yes'),
                    cancelText: t('common.no'),
                    okButtonProps: { danger: true },
                    onOk: onDelete,
                  });
                }}
              />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};
