import React from 'react';
import { Modal, Button, Spin, Typography, Tag, App } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';

interface ApiDefinitionModalProps {
  visible: boolean;
  onClose: () => void;
  data: any;
  loading: boolean;
}

export default function ApiDefinitionModal({ visible, onClose, data, loading }: ApiDefinitionModalProps) {
  const { message } = App.useApp();

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    message.success('API definition copied to clipboard!');
  };

  return (
    <Modal
      title="API Definition"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="copy"
          type="primary"
          icon={<FileExcelOutlined />}
          onClick={handleCopyJson}
          disabled={!data}
        >
          Copy JSON
        </Button>
      ]}
      width={800}
      styles={{
        body: { maxHeight: '70vh', overflow: 'auto' }
      }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="default" />
          <p style={{ marginTop: 16, color: '#666' }}>Loading API definition...</p>
        </div>
      ) : data ? (
        <div>
          {/* Service Info */}
          <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
              {data.name}
            </Typography.Title>
            {data.description && (
              <Typography.Text type="secondary">{data.description}</Typography.Text>
            )}
            <div style={{ marginTop: 12 }}>
              <Tag color={data.metadata?.requiresToken ? 'orange' : 'green'}>
                {data.metadata?.requiresToken ? 'Token Required' : 'Public'}
              </Tag>
              <Tag>{data.metadata?.category || 'General'}</Tag>
              {data.metadata?.totalCalls > 0 && (
                <Tag color="blue">{data.metadata.totalCalls.toLocaleString()} calls</Tag>
              )}
            </div>
          </div>

          {/* Inputs */}
          {data.api?.inputs && data.api.inputs.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5}>Inputs ({data.api.inputs.length})</Typography.Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.api.inputs.map((input: any, idx: number) => (
                  <div key={idx} style={{ padding: 12, border: '1px solid #e8e8e8', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Typography.Text strong>{input.name}</Typography.Text>
                      <Tag color="blue" style={{ margin: 0 }}>{input.type}</Tag>
                      {input.mandatory && <Tag color="red" style={{ margin: 0 }}>Required</Tag>}
                    </div>
                    {input.description && (
                      <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>
                        {input.description}
                      </Typography.Text>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12 }}>
                      {input.min !== undefined && <span>Min: <strong>{input.min}</strong></span>}
                      {input.max !== undefined && <span>Max: <strong>{input.max}</strong></span>}
                      {input.defaultValue !== undefined && <span>Default: <strong>{JSON.stringify(input.defaultValue)}</strong></span>}
                      {input.allowedValues && input.allowedValues.length > 0 && (
                        <div style={{ width: '100%', marginTop: 4 }}>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Allowed values{input.allowedValuesCaseSensitive && ' (case-sensitive)'}:
                          </Typography.Text>
                          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {input.allowedValues.map((val: any, i: number) => (
                              <Tag key={i} style={{ margin: 0 }}>{String(val)}</Tag>
                            ))}
                          </div>
                          {input.allowedValuesRange && (
                            <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                              Source: {input.allowedValuesRange}
                            </Typography.Text>
                          )}
                        </div>
                      )}
                      {input.aiExamples && input.aiExamples.length > 0 && (
                        <div style={{ width: '100%', marginTop: 4 }}>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Examples:</Typography.Text>
                          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {input.aiExamples.map((ex: any, i: number) => (
                              <Tag key={i} color="cyan" style={{ margin: 0 }}>{String(ex)}</Tag>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outputs */}
          {data.api?.outputs && data.api.outputs.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5}>Outputs ({data.api.outputs.length})</Typography.Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.api.outputs.map((output: any, idx: number) => (
                  <div key={idx} style={{ padding: 12, border: '1px solid #e8e8e8', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Typography.Text strong>{output.name}</Typography.Text>
                      <Tag color="green" style={{ margin: 0 }}>{output.type}</Tag>
                    </div>
                    {output.description && (
                      <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                        {output.description}
                      </Typography.Text>
                    )}
                    {output.aiPresentationHint && (
                      <Typography.Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 4 }}>
                        Presentation: {output.aiPresentationHint}
                      </Typography.Text>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Endpoint Info */}
          <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>Execute Endpoint:</Typography.Text>
            <Typography.Text code copyable style={{ fontSize: 12 }}>
              {data.endpoint?.execute}
            </Typography.Text>
          </div>
        </div>
      ) : (
        <Typography.Text type="secondary">No data available</Typography.Text>
      )}
    </Modal>
  );
}
