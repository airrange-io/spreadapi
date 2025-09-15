'use client';

import React from 'react';
import { Layout, Card, Typography, Button, Space } from 'antd';
import { useRouter } from 'next/navigation';
import HankoProfile from '@/components/auth/HankoProfile';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthContext';

const { Content } = Layout;
const { Title } = Typography;

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{
        padding: '24px',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
            >
              Back
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          <Card
            style={{
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}
            variant="borderless"
          >
            <Title level={2} style={{ marginBottom: 24 }}>
              Account Settings
            </Title>
            
            <div style={{ 
              background: '#fafafa', 
              padding: '24px', 
              borderRadius: '8px',
              minHeight: '400px'
            }}>
              <HankoProfile />
            </div>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
}