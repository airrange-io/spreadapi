import React from 'react';
import { Space, Typography, Tooltip, Button, App } from 'antd';
import { CopyOutlined, LinkOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ApiEndpointPreviewProps {
  serviceId: string;
  isPublished: boolean;
  requireToken?: boolean;
  baseUrl?: string;
}

export default function ApiEndpointPreview({ 
  serviceId, 
  isPublished,
  requireToken = false,
  baseUrl
}: ApiEndpointPreviewProps) {
  const { message } = App.useApp();
  
  // Use current origin for local development if baseUrl not provided
  const apiBaseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://spreadapi.io');
  const endpoint = `${apiBaseUrl}/api/v1/services/${serviceId}/execute`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(endpoint);
    message.success('Endpoint copied to clipboard');
  };

  return (
    <div style={{
      background: isPublished ? '#E4F2D4' : '#FFFBE6',
      border: '1px solid #FFE58F', //#b7eb8f
      // border: `1px solid ${isPublished ? '#f0f0f0' : '#d9d9d9'}`, //#b7eb8f
      borderRadius: '8px',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.3s ease'
    }}>
      <Space size="small" style={{ flex: 1 }}>
        <Tooltip title={isPublished ? 
          'This endpoint is active and ready to receive requests' : 
          'This endpoint is in draft mode. Publish the service to make it available.'
        }>
          <Text 
            strong
            style={{ 
              color: isPublished ? '#389E0E' : '#FAAD14',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'help',
              display: 'inline-block',
              minWidth: '40px'
            }}
          >
            GET
          </Text>
        </Tooltip>
        
        <div style={{ flex: 1 }}>
          <Text 
            style={{ 
              fontSize: '12px',
              fontFamily: 'monospace',
              color: isPublished ? '#389E0E' : '#262626',
              wordBreak: 'break-all'

            }}
          >
            {endpoint}
            {requireToken && (
              <Tooltip title="This service requires authentication">
                <span style={{ color: '#1890ff', marginLeft: '4px' }}>
                  &token=...
                </span>
              </Tooltip>
            )}
          </Text>
        </div>
      </Space>

      <Tooltip title="Copy endpoint">
        <Button
          type="text"
          icon={<CopyOutlined />}
          onClick={copyToClipboard}
          style={{ color: '#8c8c8c' }}
        />
      </Tooltip>
    </div>
  );
}