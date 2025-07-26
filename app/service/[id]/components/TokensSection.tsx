'use client';

import React from 'react';
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
  return (
    <div style={{
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