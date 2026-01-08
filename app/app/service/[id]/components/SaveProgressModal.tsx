import React from 'react';
import { Modal, Progress } from 'antd';

interface SaveProgressModalProps {
  visible: boolean;
  percent: number;
  status: string;
  title?: string;
  subtitle?: string;
}

export default function SaveProgressModal({
  visible,
  percent,
  status,
  title = "Saving Large File",
  subtitle = "Large files may take a moment to save..."
}: SaveProgressModalProps) {
  return (
    <Modal
      title={title}
      open={visible}
      footer={null}
      closable={false}
      centered
      width={400}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Progress
          percent={percent}
          status="active"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
        <p style={{ marginTop: 16, color: '#666' }}>{status}</p>
        <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          {subtitle}
        </p>
      </div>
    </Modal>
  );
}
