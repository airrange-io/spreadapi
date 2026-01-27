'use client';

import React, { useEffect, useState } from 'react';
import { Button, App, Typography, Skeleton } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { getCodeExample, getLanguageDescription } from '@/lib/codeExamples';
import type { CodeExampleParams } from '@/lib/codeExamples';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Lazy load syntax highlighter only when this component mounts
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter'),
  {
    loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
    ssr: false
  }
);

const { Title, Paragraph } = Typography;

export type CodeLanguage = 'curl' | 'javascript' | 'python' | 'nodejs' | 'php' | 'excel' | 'googlesheets' | 'postman';

interface CodeExampleProps {
  language: CodeLanguage;
  serviceId: string;
  serviceName?: string;
  requireToken?: boolean;
  parameterValues?: Record<string, any>;
  inputs?: any[];
  outputs?: any[];
}

const CodeExample: React.FC<CodeExampleProps> = ({
  language,
  serviceId,
  serviceName,
  requireToken,
  parameterValues = {},
  inputs = [],
  outputs = []
}) => {
  const { notification } = App.useApp();
  const [code, setCode] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate code when component mounts
    const params: CodeExampleParams = {
      serviceId,
      serviceName,
      requireToken,
      parameterValues,
      inputs,
      outputs
    };
    const generatedCode = getCodeExample(language, params);
    setCode(generatedCode);
  }, [language, serviceId, requireToken, parameterValues]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    notification.success({ message: 'Copied to clipboard' });
  };

  // Map language names to syntax highlighter language identifiers
  const languageMap: Record<string, string> = {
    'curl': 'bash',
    'nodejs': 'javascript',
    'googlesheets': 'javascript',
    'excel': 'vbnet',
    'postman': 'plaintext'
  };

  const highlighterLanguage = languageMap[language] || language;
  const description = getLanguageDescription(language);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>
          {language.charAt(0).toUpperCase() + language.slice(1)} Integration
        </Title>
        <Paragraph type="secondary">
          {description}
          {requireToken && ' Remember to replace YOUR_TOKEN_HERE with your actual API token.'}
        </Paragraph>
      </div>

      <div style={{ position: 'relative' }}>
        <Button
          icon={<CopyOutlined />}
          size="small"
          onClick={copyToClipboard}
          style={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
        >
          Copy
        </Button>
        {mounted ? (
          <SyntaxHighlighter
            language={highlighterLanguage}
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
            {code}
          </SyntaxHighlighter>
        ) : (
          <Skeleton active paragraph={{ rows: 10 }} />
        )}
      </div>
    </div>
  );
};

export default CodeExample;
