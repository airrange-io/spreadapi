'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Space, Typography, Alert, Tooltip } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ApiResultViewer from './ApiResultViewer';
import CollapsibleSection from './components/CollapsibleSection';

const { Text } = Typography;
const { TextArea } = Input;

interface ServiceTesterProps {
  serviceId: string;
  isPublished: boolean;
  inputs: any[];
  outputs: any[];
  requireToken?: boolean;
  existingToken?: string;
}

const ServiceTester: React.FC<ServiceTesterProps> = ({
  serviceId,
  isPublished,
  inputs,
  outputs,
  requireToken,
  existingToken
}) => {
  const [testUrl, setTestUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string>('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [requestUrl, setRequestUrl] = useState<string>('');
  const [responseTime, setResponseTime] = useState<number>(0);

  // Build the test URL with current parameter values
  useEffect(() => {
    if (!serviceId) return;

    const baseUrl = `${window.location.origin}/api/getresults`;
    const params = new URLSearchParams();

    // Add service ID as parameter
    params.append('id', serviceId);

    // Add input parameters to URL
    inputs.forEach(input => {
      if (input.value !== undefined && input.value !== null && input.value !== '') {
        params.append(input.alias || input.name, String(input.value));
      }
    });

    // Add _token parameter if required
    if (requireToken) {
      params.append('_token', existingToken || 'YOUR_TOKEN_HERE');
    }

    const fullUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    setTestUrl(fullUrl);
  }, [serviceId, inputs, requireToken, existingToken]);

  const handleTest = async () => {
    if (!isPublished) return;

    setTesting(true);
    setTestError('');
    setTestResult(null);
    setRequestUrl(testUrl);

    const startTime = Date.now();

    try {
      const response = await fetch(testUrl);
      const responseTime = Date.now() - startTime;
      setResponseTime(responseTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setTestResult(data);
      setShowResultModal(true);
    } catch (error: any) {
      setTestError(error.message || 'Failed to test API');
      setShowResultModal(true);
    } finally {
      setTesting(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTestUrl(e.target.value);
  };

  return (
    <>
      <CollapsibleSection 
        title="Quick Test" 
        defaultOpen={true}
        extra={
          <Button
            type="default"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleTest();
            }}
            loading={testing}
            disabled={!isPublished}
          >
            Test API
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>Test URL (Modify the URL to test with different parameter values):</Text>
            <TextArea
              value={testUrl}
              onChange={handleUrlChange}
              rows={3}
              style={{
                marginTop: 4,
                fontFamily: 'monospace',
                fontSize: 12
              }}
              disabled={!isPublished}
            />
          </div>
        </Space>
      </CollapsibleSection>

      <ApiResultViewer
        visible={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={testResult}
        error={testError}
        loading={testing}
        requestUrl={requestUrl}
        responseTime={responseTime}
      />
    </>
  );
};

export default ServiceTester;