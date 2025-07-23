'use client';

import React from 'react';
import { Modal, Typography, Space, Tag, Button, Alert } from 'antd';
import { CopyOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ApiResultViewerProps {
  visible: boolean;
  onClose: () => void;
  result: any;
  error?: string;
  loading?: boolean;
  requestUrl?: string;
  responseTime?: number;
}

const ApiResultViewer: React.FC<ApiResultViewerProps> = ({
  visible,
  onClose,
  result,
  error,
  loading,
  requestUrl,
  responseTime
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      title={
        <Space>
          {error ? (
            <>
              <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              <span>API Test Failed</span>
            </>
          ) : (
            <>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span>API Test Result</span>
            </>
          )}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      centered
      footer={[
        <Button 
          key="copy" 
          icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          disabled={!result || !!error}
        >
          {copied ? 'Copied!' : 'Copy JSON'}
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Testing API...
        </div>
      ) : error ? (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          {requestUrl && (
            <div>
              <Text type="secondary">Request URL:</Text>
              <div style={{ 
                marginTop: 4,
                padding: '8px 12px',
                background: '#f5f5f5',
                borderRadius: 4,
                fontSize: '12px',
                wordBreak: 'break-all'
              }}>
                <code>{requestUrl}</code>
              </div>
            </div>
          )}

          {responseTime !== undefined && (
            <div>
              <Text type="secondary">Response Time: </Text>
              <Tag color="blue">{responseTime}ms</Tag>
            </div>
          )}

          <div>
            <Text type="secondary">Response:</Text>
            <div style={{ 
              marginTop: 8,
              border: '1px solid #e8e8e8',
              borderRadius: 4,
              overflow: 'auto',
              maxHeight: '400px',
              backgroundColor: '#f5f5f5'
            }}>
              <pre style={{ 
                margin: 0,
                padding: 16,
                fontSize: '13px',
                lineHeight: '1.5',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace'
              }}>
                {result && JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </Space>
      )}
    </Modal>
  );
};

export default ApiResultViewer;