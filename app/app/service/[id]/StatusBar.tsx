'use client';

import React from 'react';
import { Button, Slider, Space, Divider, Dropdown, Tooltip } from 'antd';
import { TableOutlined, ZoomInOutlined, ZoomOutOutlined, CloseCircleOutlined, TagOutlined, CloseOutlined, HistoryOutlined } from '@ant-design/icons';
import { COLORS } from '@/constants/theme';

interface StatusBarProps {
  recordCount: number;
  selectedCount: number;
  zoomLevel: number;
  onZoomChange: (value: number) => void;
  filteredCount?: number;
  onClearSelection?: () => void;
  onPinSelected?: () => void;
  tagInfo?: {
    uniqueTags: string[];
    tagCounts: Map<string, number>;
  };
  onTagClick?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  changeCount?: number;
  onChangesClick?: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({
  recordCount,
  selectedCount,
  zoomLevel,
  onZoomChange,
  filteredCount,
  onClearSelection,
  tagInfo,
  onTagClick,
  onTagRemove,
  changeCount = 0,
  onChangesClick,
}) => {
  // Create a lighter version of the primary color
  const lighterPrimary = '#6B4A99'; // Lighter shade of #4F2D7F
  
  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 10, 200);
    onZoomChange(newZoom);
  };
  
  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 10, 50);
    onZoomChange(newZoom);
  };
  
  const handleZoomReset = () => {
    onZoomChange(100);
  };

  return (
    <div
      style={{
        height: '32px',
        backgroundColor: lighterPrimary,
        borderTop: `1px solid ${COLORS.primary}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        color: '#fff',
        fontSize: '12px',
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      <Space size="middle" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {/* Record Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TableOutlined style={{ fontSize: '14px', opacity: 0.9 }} />
          {/* <span>
            {filteredCount !== undefined && filteredCount !== recordCount ? (
              <>
                {filteredCount.toLocaleString()} of {recordCount.toLocaleString()} records
              </>
            ) : (
              <>
                {recordCount.toLocaleString()} record{recordCount !== 1 ? 's' : ''}
              </>
            )}
          </span> */}
        </div>
        
        {/* Selected Count - Clickable with menu */}
        {selectedCount > 0 && (
          <>
            <Dropdown
              menu={{
                items: [
                  /* Temporarily disabled - pin functionality needs more work
                  onPinSelected && {
                    key: 'pin',
                    icon: <PushpinOutlined />,
                    label: 'Pin selected rows',
                    onClick: onPinSelected
                  },
                  */
                  {
                    key: 'clear',
                    icon: <CloseCircleOutlined />,
                    label: 'Clear selection',
                    onClick: onClearSelection
                  }
                ].filter(Boolean)
              }}
              trigger={['click']}
              placement="top"
            >
              <span 
                style={{ 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  opacity: 0.9
                }}
                title="Click for options"
              >
                {selectedCount} selected {selectedCount === 1 ? 'entry' : 'entries'}
              </span>
            </Dropdown>
            <Divider type="vertical" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: 0 }} />
          </>
        )}
        
        {/* Tags Count - Clickable with menu */}
        {tagInfo && tagInfo.uniqueTags.length > 0 && (
          <>
            <Dropdown
              menu={{
                items: tagInfo.uniqueTags.map(tag => ({
                  key: tag,
                  label: (
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: '12px',
                        minWidth: '150px'
                      }}
                    >
                      <span
                        onClick={() => onTagClick?.(tag)}
                        style={{ flex: 1, cursor: 'pointer' }}
                      >
                        {tag} ({tagInfo.tagCounts.get(tag) || 0})
                      </span>
                      <CloseOutlined 
                        style={{ 
                          fontSize: '12px', 
                          color: '#8c8c8c',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTagRemove?.(tag);
                        }}
                      />
                    </div>
                  ),
                }))
              }}
              trigger={['click']}
              placement="top"
            >
              <span 
                style={{ 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  opacity: 0.9,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Click for tag options"
              >
                <TagOutlined style={{ fontSize: '14px' }} />
                {tagInfo.uniqueTags.length} {tagInfo.uniqueTags.length === 1 ? 'Tag' : 'Tags'}
              </span>
            </Dropdown>
            <Divider type="vertical" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: 0 }} />
          </>
        )}
      </Space>
      
      {/* Change History */}
      {changeCount > 0 && (
        <Space size={8} style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          <Tooltip title="View change history">
            <span
              style={{
                cursor: 'pointer',
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={onChangesClick}
            >
              <HistoryOutlined style={{ fontSize: '14px' }} />
              {changeCount}
            </span>
          </Tooltip>
          {/* <Divider type="vertical" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: 0, marginLeft: 10, marginRight: 0 }} /> */}
        </Space>
      )}
      
      {/* Zoom Controls */}
      <Space size={8} style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          size="small"
          icon={<ZoomOutOutlined />}
          onClick={handleZoomOut}
          style={{ 
            color: '#fff', 
            height: '24px',
            padding: '0 6px',
            opacity: zoomLevel <= 50 ? 0.5 : 0.9
          }}
          disabled={zoomLevel <= 50}
        />
        
        <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Slider
            min={50}
            max={200}
            step={10}
            value={zoomLevel}
            onChange={onZoomChange}
            tooltip={{ formatter: (value) => `${value}%` }}
            style={{ 
              flex: 1, 
              margin: 0,
              opacity: 0.9
            }}
            styles={{
              rail: { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
              track: { backgroundColor: '#fff' },
              handle: { 
                backgroundColor: '#fff', 
                borderColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }
            }}
          />
          <span 
            style={{ 
              minWidth: '40px', 
              textAlign: 'right', 
              cursor: 'pointer',
              opacity: 0.9
            }}
            onClick={handleZoomReset}
            title="Click to reset zoom"
          >
            {zoomLevel}%
          </span>
        </div>
        
        <Button
          type="text"
          size="small"
          icon={<ZoomInOutlined />}
          onClick={handleZoomIn}
          style={{ 
            color: '#fff', 
            height: '24px',
            padding: '0 6px',
            opacity: zoomLevel >= 200 ? 0.5 : 0.9
          }}
          disabled={zoomLevel >= 200}
        />
      </Space>
    </div>
  );
};

export default StatusBar;