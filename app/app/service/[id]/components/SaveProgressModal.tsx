import React from 'react';
import { Modal, Progress } from 'antd';

interface SaveProgressModalProps {
  visible: boolean;
  percent: number;
  status: string;
}

export default function SaveProgressModal({ visible, percent, status }: SaveProgressModalProps) {
  return (
    <Modal
      title="Saving Large File"
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
          Large files may take a moment to save...
        </p>
      </div>
    </Modal>
  );
}
