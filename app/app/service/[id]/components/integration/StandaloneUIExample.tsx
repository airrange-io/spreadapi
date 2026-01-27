'use client';

import React, { useEffect, useState } from 'react';
import { Button, Typography, Space, Skeleton, App } from 'antd';
import { CopyOutlined, CaretRightOutlined, DownloadOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { generateStandaloneUIHTML } from '@/lib/codeExamples';
import type { CodeExampleParams } from '@/lib/codeExamples';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslation } from '@/lib/i18n';

// Lazy load syntax highlighter
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter'),
  {
    loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
    ssr: false
  }
);

const { Text, Title } = Typography;

interface StandaloneUIExampleProps {
  serviceId: string;
  serviceName?: string;
  requireToken?: boolean;
  parameterValues?: Record<string, any>;
  inputs?: any[];
  outputs?: any[];
}

const StandaloneUIExample: React.FC<StandaloneUIExampleProps> = ({
  serviceId,
  serviceName,
  requireToken,
  parameterValues = {},
  inputs = [],
  outputs = []
}) => {
  const { notification } = App.useApp();
  const { t } = useTranslation();
  const [htmlContent, setHtmlContent] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate HTML when component mounts
    const params: CodeExampleParams = {
      serviceId,
      serviceName,
      requireToken,
      parameterValues,
      inputs,
      outputs
    };
    const generatedHTML = generateStandaloneUIHTML(params);
    setHtmlContent(generatedHTML);
  }, [serviceId, serviceName, requireToken, parameterValues, inputs, outputs]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlContent);
    notification.success({ message: t('standalone.copiedToClipboard') });
  };

  const downloadHtml = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${serviceId}-calculator.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notification.success({ message: t('standalone.htmlDownloaded') });
  };

  const openHtmlInNewTab = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');

    if (newWindow) {
      notification.success({ message: t('standalone.calculatorOpened') });
      // Clean up the blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      notification.error({ message: t('standalone.allowPopups') });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>{t('standalone.title')}</Title>
        <div style={{ marginBottom: 16, padding: '16px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <Text strong style={{ display: 'block', marginBottom: 8, color: '#0369a1' }}>
            {t('standalone.readyToUseUi')}
          </Text>
          <Text style={{ fontSize: 13, color: '#075985', display: 'block', marginBottom: 12 }}>
            {t('standalone.description')}
          </Text>
          <Space>
            <Button
              type="primary"
              icon={<CaretRightOutlined />}
              onClick={openHtmlInNewTab}
              size="large"
            >
              {t('standalone.openInNewTab')}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadHtml}
              size="large"
            >
              {t('standalone.downloadHtml')}
            </Button>
          </Space>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <Button
          icon={<CopyOutlined />}
          size="small"
          onClick={copyToClipboard}
          style={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
        >
          {t('standalone.copy')}
        </Button>
        {mounted ? (
          <SyntaxHighlighter
            language="html"
            style={vs2015}
            customStyle={{
              padding: '16px',
              paddingTop: '40px',
              borderRadius: '6px',
              fontSize: '13px',
              lineHeight: '1.5',
              margin: 0
            }}
          >
            {htmlContent}
          </SyntaxHighlighter>
        ) : (
          <Skeleton active paragraph={{ rows: 10 }} />
        )}
      </div>
    </div>
  );
};

export default StandaloneUIExample;
