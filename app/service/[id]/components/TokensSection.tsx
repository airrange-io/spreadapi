'use client';

import React, { useRef, useState, useLayoutEffect } from 'react';
import { Space, Alert } from 'antd';
import ApiEndpointPreview from '../ApiEndpointPreview';
import ServiceTester from '../ServiceTester';
import TokenManagement from '../TokenManagement';
import { InputDefinition, OutputDefinition } from './ParametersSection';

interface TokensSectionProps {
  serviceId: string;
  isPublished: boolean;
  requireToken: boolean;
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  availableTokens: any[];
  isDemoMode?: boolean;
  onRequireTokenChange: (value: boolean) => void;
  onTokenCountChange: (count: number) => void;
  onTokensChange: (tokens: any[]) => void;
}

const TokensSection: React.FC<TokensSectionProps> = ({
  serviceId,
  isPublished,
  requireToken,
  inputs,
  outputs,
  availableTokens,
  isDemoMode,
  onRequireTokenChange,
  onTokenCountChange,
  onTokensChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const measureWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    measureWidth();
    const timeout = setTimeout(measureWidth, 100);

    const resizeObserver = new ResizeObserver(measureWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', measureWidth);

    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureWidth);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        marginTop: '8px',
        minHeight: 0
      }}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        {!isPublished && (
          <Alert
            message="Service must be published to test"
            type="warning"
            showIcon
          />
        )}
        <ApiEndpointPreview
          serviceId={serviceId}
          isPublished={isPublished}
          requireToken={requireToken}
        />
        <ServiceTester
          serviceId={serviceId}
          isPublished={isPublished}
          inputs={inputs}
          outputs={outputs}
          requireToken={requireToken}
          existingToken={availableTokens.length > 0 ? availableTokens[0].id : undefined}
          containerWidth={containerWidth}
        />
        <TokenManagement
          serviceId={serviceId}
          requireToken={requireToken}
          isDemoMode={isDemoMode}
          onRequireTokenChange={onRequireTokenChange}
          onTokenCountChange={onTokenCountChange}
          onTokensChange={onTokensChange}
        />
      </Space>
    </div>
  );
};

export default TokensSection;