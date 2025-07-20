'use client';

import React from 'react';
import { Layout, Button, Typography, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { COLORS, TRANSITIONS } from '@/constants/theme';

const { Content } = Layout;
const { Title } = Typography;

interface SubPageLayoutProps {
  title: string;
  children: React.ReactNode;
  backPath?: string;
  extra?: React.ReactNode;
}

export const SubPageLayout: React.FC<SubPageLayoutProps> = ({
  title,
  children,
  backPath = '/',
  extra
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.push(backPath);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: 0 }}>
        {/* Header with back button */}
        <div
          style={{
            background: 'white',
            borderBottom: `1px solid ${COLORS.border}`,
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{
                fontSize: '16px',
                height: '40px',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: TRANSITIONS.default,
              }}
            >
              Back
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              {title}
            </Title>
          </div>
          {extra && <div>{extra}</div>}
        </div>

        {/* Main content area */}
        <div
          style={{
            padding: '32px',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
          }}
          className="sub-page-content-wrapper"
        >
          <style>{`
            @media (max-width: 768px) {
              .sub-page-content-wrapper {
                padding: 20px !important;
              }
            }
          `}</style>
          {children}
        </div>
      </Content>
    </Layout>
  );
};