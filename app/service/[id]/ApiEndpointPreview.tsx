import React from 'react';
import { Space, Typography, Tooltip, Button, message } from 'antd';
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
  baseUrl = 'https://spreadapi.io'
}: ApiEndpointPreviewProps) {
  const endpoint = `${baseUrl}/api/getresults?service=${serviceId}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(endpoint);
    message.success('Endpoint copied to clipboard');
  };

  return (
    <div style={{
      background: isPublished ? '#f6ffed' : '#f5f5f5',
      border: `1px solid ${isPublished ? '#b7eb8f' : '#d9d9d9'}`,
      borderRadius: '8px',
      padding: '5px 10px',
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
              color: isPublished ? '#52c41a' : '#8c8c8c',
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
              fontSize: '14px',
              fontFamily: 'monospace',
              color: '#262626',
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