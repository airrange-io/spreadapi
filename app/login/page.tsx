'use client';

import React from 'react';
import { Layout, Card, Typography, Space } from 'antd';
import { useRouter } from 'next/navigation';
import HankoAuth from '@/components/auth/HankoAuth';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px'
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}
          variant="borderless"
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                Welcome to SpreadAPI
              </Title>
              <Text type="secondary">
                Sign in or create an account to manage your APIs
              </Text>
            </div>

            <div style={{ 
              background: '#ffffff', 
              padding: '0px', 
              borderRadius: '8px',
              minHeight: '400px'
            }}>
              <HankoAuth redirectTo="/app" />
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href="/" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                color: '#4F2D7F'
              }}>
                <ArrowLeftOutlined />
                Back to home
              </Link>
            </div>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}