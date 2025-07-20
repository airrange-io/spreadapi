'use client';

import React, { useState, useEffect } from 'react';
import { Card, Statistic, Typography, Space, Button, Input, Tag } from 'antd';
import { FileTextOutlined, CloseOutlined, BarChartOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';

const { Title, Text } = Typography;

type ActiveCard = 'detail' | 'inputoutput' | 'analytics' | null;

interface InputDefinition {
  id: string;
  name: string;
  cell: string;
  type: 'number' | 'string' | 'boolean';
  defaultValue?: any;
  min?: number;
  max?: number;
  description?: string;
}

interface OutputDefinition {
  id: string;
  name: string;
  cell: string;
  type: 'number' | 'string' | 'boolean';
  description?: string;
}

interface EditorPanelProps {
  spreadInstance: any;
  onConfigChange?: (config: any) => void;
  initialConfig?: {
    name: string;
    description: string;
    inputs: InputDefinition[];
    outputs: OutputDefinition[];
  };
}

const EditorPanel: React.FC<EditorPanelProps> = observer(({
  spreadInstance, onConfigChange, initialConfig
}) => {
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [apiName, setApiName] = useState(initialConfig?.name || '');
  const [apiDescription, setApiDescription] = useState(initialConfig?.description || '');
  const [inputs, setInputs] = useState<InputDefinition[]>(initialConfig?.inputs || []);
  const [outputs, setOutputs] = useState<OutputDefinition[]>(initialConfig?.outputs || []);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Handle card activation
  const handleCardClick = (cardType: ActiveCard) => {
    if (activeCard === cardType) {
      setActiveCard(null); // Deactivate if already active
    } else {
      setActiveCard(cardType);
    }
  };

  // Notify parent of changes
  useEffect(() => {
    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      if (onConfigChange) {
        onConfigChange({
          name: apiName,
          description: apiDescription,
          inputs,
          outputs
        });
      }
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [apiName, apiDescription, inputs, outputs]);


  // Get card styling based on active state
  const getCardStyle = (cardType: ActiveCard) => {
    const baseStyle = {
      flex: 1,
      cursor: 'pointer',
      borderRadius: '8px',
      transition: 'all 0.2s'
    };

    if (activeCard === cardType) {
      return {
        ...baseStyle,
        borderColor: '#8A64C0',
        boxShadow: '0 0 0 1px rgba(24, 144, 255, 0.2)',
        backgroundColor: '#fafafa'
      };
    }

    return baseStyle;
  };

  // Get card body style for consistent padding
  const getCardBodyStyle = () => ({
    padding: '6px 12px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
  });

  // Get statistic value style based on active state
  const getStatisticValueStyle = (cardType: ActiveCard, originalColor: string) => {
    if (activeCard === cardType) {
      return { color: originalColor, fontSize: 18 };
    }
    return { color: '#2B2A35', fontSize: 18 };
  };

  return (
    <div style={{
      padding: '12px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '16px'
    }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* First Row: Records, Analytics, Workflows, Columns */}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>

          <Card
            size="small"
            style={{
              ...getCardStyle('detail'),
              //flex: '0 0 calc(25% - 6px)' 
              flex: '0 0 calc(33.33% - 5.33px)',
            }}
            styles={{ body: getCardBodyStyle() }}
            hoverable
            onClick={() => handleCardClick('detail')}
          >
            <Statistic
              title="Detail"
              value={'---'}
              prefix={<FileTextOutlined />}
              valueStyle={getStatisticValueStyle('detail', '#4F2D7F')}
            />
          </Card>

          <Card
            size="small"
            style={{
              ...getCardStyle('inputoutput'),
              //flex: '0 0 calc(25% - 6px)' 
              flex: '0 0 calc(33.33% - 5.33px)',
            }}
            styles={{ body: getCardBodyStyle() }}
            hoverable
            onClick={() => handleCardClick('inputoutput')}
          >
            <Statistic
              title="Input/Output"
              value={"---"}
              prefix={<NodeIndexOutlined />}
              valueStyle={getStatisticValueStyle('inputoutput', '#4F2D7F')}
            />
          </Card>

          <Card
            size="small"
            style={{
              ...getCardStyle('analytics'),
              //flex: '0 0 calc(25% - 6px)' 
              flex: '0 0 calc(33.33% - 5.33px)',
            }}
            styles={{ body: getCardBodyStyle() }}
            hoverable
            onClick={() => handleCardClick('analytics')}
          >
            <Statistic
              title="Analytics"
              value={"---"}
              prefix={<BarChartOutlined />}
              valueStyle={getStatisticValueStyle('analytics', '#4F2D7F')}
            />
          </Card>

        </div>

        {/* Active Card Detail Areas or Default AI Area */}
        {activeCard ? (
          <div style={{
            marginTop: '12px',
            padding: '0px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            {/* Header with close button and optional actions */}
            {/* <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <Space size={4}>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setActiveCard(null)}
                />
              </Space>
            </div> */}

            {/* Columns Detail */}
            {activeCard === 'detail' && (
              <Space direction="vertical" style={{ width: '100%' }} >
                <div>
                  <div style={{ marginBottom: '8px' }}><strong>API Name</strong></div>
                  <Input
                    placeholder="Enter API name"
                    value={apiName}
                    onChange={(e) => setApiName(e.target.value)}
                  />
                </div>

                <div>
                  <div style={{ marginBottom: '8px' }}><strong>Description</strong></div>
                  <Input.TextArea
                    placeholder="Describe what this API does"
                    value={apiDescription}
                    onChange={(e) => setApiDescription(e.target.value)}
                    rows={4} />
                </div>

                <div>
                  <div style={{ marginBottom: '8px' }}><strong>API Endpoint</strong></div>
                  <Input
                    value={`/api/v1/spreadapi/${apiName || 'untitled'}`}
                    disabled
                    addonBefore="POST"
                  />
                </div>

                <div>
                  <div style={{ marginBottom: '8px' }}><strong>Status</strong></div>
                  <Tag color="orange">Draft</Tag>
                </div>
              </Space>
            )}

            {/* Records Detail */}
            {activeCard === 'inputoutput' && (
              <div>Input/Output</div>
            )}

            {/* Analytics Detail */}
            {activeCard === 'analytics' && (
              <div>Analytics</div>
            )}

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* <AIDetailAreaNew
              messages={aiMessages || []}
              isLoading={isAILoading}
              onSendMessage={onAISendMessage || (() => {})}
              onClearMessages={onAIClearMessages || (() => {})}
              onConfigClick={() => setShowAIConfigModal(true)}
              data={data}
              schema={schema}
              allColumns={allColumns}
              hasConfig={!!aiConfig}
              defaultPrompts={typeSpecificPrompts}
              userId={userId}
            /> */}
          </div>
        )}

      </div>

    </div>
  );
});

export default EditorPanel;