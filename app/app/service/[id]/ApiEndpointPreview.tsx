import React from 'react';
import { Space, Typography, Tooltip, Button, App } from 'antd';
import { CopyOutlined, LinkOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

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
  const { notification } = App.useApp();
  const { t } = useTranslation();

  // Use current origin for local development if baseUrl not provided
  const apiBaseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://spreadapi.io');
  const endpoint = `${apiBaseUrl}/api/v1/services/${serviceId}/execute`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(endpoint);
    notification.success({ message: t('apiPreview.endpointCopied') });
  };

  return (
    <div style={{
      background: isPublished ? '#E4F2D4' : '#FFFBE6',
      border: isPublished ? '1px solid #E4F2D4' : '1px solid #FFE58F', //#b7eb8f
      // border: `1px solid ${isPublished ? '#f0f0f0' : '#d9d9d9'}`, //#b7eb8f
      borderRadius: '8px',
      padding: '8px 16px',
      marginTop: -2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.3s ease'
    }}>
      <Space size="small" style={{ flex: 1 }}>
        <Tooltip title={isPublished ?
          t('apiPreview.endpointActive') :
          t('apiPreview.endpointDraft')
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
              <Tooltip title={t('apiPreview.requiresAuth')}>
                <span style={{ color: '#1890ff', marginLeft: '4px' }}>
                  &token=...
                </span>
              </Tooltip>
            )}
          </Text>
        </div>
      </Space>

      <Tooltip title={t('apiPreview.copyEndpoint')}>
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