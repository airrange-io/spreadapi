'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dropdown, Input, Tag } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';
import type { MenuProps } from 'antd';
import type { Folder } from '@/lib/folderStorage';

interface FolderCardProps {
  folder: Folder;
  serviceCount: number;
  variant?: 'card' | 'row';
  onClick: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onDropService?: (serviceId: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  serviceCount,
  variant = 'card',
  onClick,
  onRename,
  onDelete,
  onDropService,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<any>(null);
  const renamingRef = useRef(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRename = () => {
    if (renamingRef.current) return;
    renamingRef.current = true;
    const trimmed = editName.trim();
    if (trimmed && trimmed !== folder.name) {
      onRename(trimmed);
    }
    setIsEditing(false);
    setTimeout(() => { renamingRef.current = false; }, 0);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'rename',
      icon: <EditOutlined />,
      label: t('folders.rename'),
      onClick: (e) => {
        e.domEvent.stopPropagation();
        setEditName(folder.name);
        setIsEditing(true);
      },
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: t('folders.delete'),
      danger: true,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        onDelete();
      },
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('text/serviceid')) {
      setIsDragOver(true);
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const serviceId = e.dataTransfer.getData('text/serviceid');
    if (serviceId && onDropService) {
      onDropService(serviceId);
    }
  };

  // Shared styles
  const baseBg = isDragOver ? '#f9f0ff' : '#faf8ff';
  const baseBorder = isDragOver ? '2px solid #b37feb' : '1px solid #ede8fa';
  const baseShadow = isDragOver ? '0 2px 8px rgba(114, 46, 209, 0.15)' : undefined;

  if (variant === 'row') {
    return (
      <div
        onClick={onClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          background: baseBg,
          border: baseBorder,
          borderRadius: 8,
          padding: '14px 14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 52,
          minWidth: 0,
          transition: 'all 0.15s ease',
          boxShadow: baseShadow,
        }}
        onMouseEnter={(e) => {
          if (!isDragOver) {
            e.currentTarget.style.borderColor = '#d9d9d9';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragOver) {
            e.currentTarget.style.borderColor = '#ede8fa';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        <FolderOutlined style={{ fontSize: 20, color: '#7c3aed', flexShrink: 0 }} />
        {isEditing ? (
          <Input
            ref={inputRef}
            size="small"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onPressEnter={handleRename}
            onBlur={handleRename}
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1, fontSize: 13 }}
          />
        ) : (
          <span style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 500,
            color: '#262626',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {folder.name}
          </span>
        )}
        <Tag
          style={{
            backgroundColor: serviceCount > 0 ? '#f3f0ff' : '#f5f5f5',
            color: serviceCount > 0 ? '#7c3aed' : '#8b8b9e',
            margin: 0,
            fontSize: 12,
            padding: '0px 12px',
            borderRadius: 8,
            border: 'none',
          }}
        >
          {serviceCount}
        </Tag>
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <span
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '2px 4px', borderRadius: 4, cursor: 'pointer', color: '#bfbfbf', flexShrink: 0 }}
          >
            <MoreOutlined style={{ fontSize: 14 }} />
          </span>
        </Dropdown>
      </div>
    );
  }

  // Card variant
  return (
    <div
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: baseBg,
        border: baseBorder,
        borderRadius: 10,
        padding: '18px 14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
        transition: 'all 0.15s ease',
        boxShadow: isDragOver ? baseShadow : '0 1px 2px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = '#d9d9d9';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = '#ede8fa';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
        }
      }}
    >
      <FolderOutlined style={{ fontSize: 20, color: '#7c3aed', flexShrink: 0 }} />
      {isEditing ? (
        <Input
          ref={inputRef}
          size="small"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onPressEnter={handleRename}
          onBlur={handleRename}
          onClick={(e) => e.stopPropagation()}
          style={{ flex: 1, fontSize: 13 }}
        />
      ) : (
        <span style={{
          flex: 1,
          fontSize: 13,
          fontWeight: 500,
          color: '#262626',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {folder.name}
        </span>
      )}
      <Tag
        style={{
          backgroundColor: serviceCount > 0 ? '#f3f0ff' : '#f5f5f5',
          color: serviceCount > 0 ? '#7c3aed' : '#8b8b9e',
          margin: 0,
          fontSize: 12,
          padding: '0px 12px',
          borderRadius: 8,
          border: 'none',
        }}
      >
        {serviceCount}
      </Tag>
      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
        <span
          onClick={(e) => e.stopPropagation()}
          style={{ padding: '2px 4px', borderRadius: 4, cursor: 'pointer', color: '#bfbfbf', flexShrink: 0 }}
        >
          <MoreOutlined style={{ fontSize: 14 }} />
        </span>
      </Dropdown>
    </div>
  );
};
