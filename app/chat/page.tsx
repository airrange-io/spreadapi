'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Space, Spin, Tag, App, Select, Avatar, Breadcrumb, Dropdown } from 'antd';
import { MenuOutlined, RobotOutlined, AppstoreOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { Conversations, Bubble, Sender } from '@ant-design/x';
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { useAuth } from '@/components/auth/AuthContext';
import { useAppStore } from '@/shared/hooks/useAppStore';
import dynamic from 'next/dynamic';

// Dynamically import Sidebar
const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  ssr: false,
  loading: () => null
});

const { Content } = Layout;
const { Title, Text } = Typography;

// Demo services
const DEMO_SERVICES = [
  {
    id: 'investment_calc',
    name: 'Investment Calculator (Demo)',
    description: 'Calculate compound interest and future value',
    icon: '📈'
  },
  {
    id: 'mortgage_calc', 
    name: 'Mortgage Calculator (Demo)',
    description: 'Calculate monthly mortgage payments',
    icon: '🏠'
  }
];

export default function ChatPage() {
  const router = useRouter();
  const appStore = useAppStore();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { message: messageApi } = App.useApp();
  const [inputValue, setInputValue] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Load user services
  useEffect(() => {
    const loadServices = async () => {
      if (!isAuthenticated) {
        // Set default demo service for non-authenticated users
        setSelectedService('investment_calc');
        setLoadingServices(false);
        return;
      }

      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          const publishedServices = (data.services || [])
            .filter(s => s.status === 'published')
            .map(s => ({
              id: s.id,
              name: s.name,
              description: s.description || 'Spreadsheet calculation service',
              icon: '📊'
            }));
          
          setUserServices(publishedServices);
          // Select first service by default
          if (publishedServices.length > 0) {
            setSelectedService(publishedServices[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    if (!authLoading) {
      loadServices();
    }
  }, [isAuthenticated, authLoading]);

  const { messages, append, isLoading, error, setMessages } = useChat({
    api: '/api/chat',
    body: {
      serviceId: selectedService
    },
    onError: (error) => {
      console.error('Chat error:', error);
      messageApi.error('Failed to send message. Please try again.');
    },
  });

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading || !selectedService) return;
    
    await append({
      role: 'user',
      content: text,
    });
  };

  // Clear messages when service changes
  useEffect(() => {
    if (selectedService) {
      setMessages([]);
    }
  }, [selectedService, setMessages]);

  // Show loading spinner while checking auth status
  if (authLoading || loadingServices) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  // Get available services
  const availableServices = isAuthenticated ? userServices : DEMO_SERVICES;
  const currentService = availableServices.find(s => s.id === selectedService);

  // Convert messages to Conversations format
  const conversationItems = messages.map((message) => ({
    key: message.id,
    label: message.role === 'user' ? 'You' : currentService?.name || 'Assistant',
    children: (
      <Bubble
        content={message.content}
        variant={message.role === 'user' ? 'filled' : 'outlined'}
        style={{
          maxWidth: '70%'
        }}
      />
    ),
  }));

  // Add welcome message if no messages
  if (conversationItems.length === 0 && currentService) {
    conversationItems.push({
      key: 'welcome',
      label: currentService.name,
      children: (
        <Bubble
          content={
            <Space direction="vertical" size="small">
              <Text>
                {currentService.icon} Hi! I'm ready to help you with {currentService.name}.
              </Text>
              <Text type="secondary">{currentService.description}</Text>
              
              {currentService.id === 'investment_calc' && (
                <>
                  <Text type="secondary" style={{ marginTop: 8 }}>Try asking:</Text>
                  <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                    <li>"Calculate $10,000 invested at 8% for 20 years"</li>
                    <li>"What if I add $200 monthly?"</li>
                    <li>"Compare 6% vs 8% returns"</li>
                  </ul>
                </>
              )}
              
              {currentService.id === 'mortgage_calc' && (
                <>
                  <Text type="secondary" style={{ marginTop: 8 }}>Try asking:</Text>
                  <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                    <li>"Monthly payment for $300,000 at 6.5%"</li>
                    <li>"Compare 15 vs 30 year terms"</li>
                    <li>"How much interest will I pay?"</li>
                  </ul>
                </>
              )}
              
              {!isAuthenticated && (
                <Tag color="blue" style={{ marginTop: 8 }}>Demo Mode</Tag>
              )}
            </Space>
          }
          variant="outlined"
          style={{ maxWidth: '90%' }}
        />
      ),
    });
  }

  // Add loading indicator if AI is thinking
  if (isLoading) {
    conversationItems.push({
      key: 'loading',
      label: currentService?.name || 'Assistant',
      children: (
        <Bubble
          loading
          variant="outlined"
          content="Calculating..."
        />
      ),
    });
  }

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      
      <Layout style={{ marginLeft: 0, transition: 'margin-left 0.2s', position: 'relative' }}>
        {/* Header */}
      <div style={{
        background: 'white',
        padding: '12px 16px',
        height: '56px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8
      }}>
        {/* Left side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 auto' }}>
          <Button
            type='text'
            icon={<MenuOutlined />}
            onClick={appStore.toggleSidebar}
          />
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { 
                title: <a onClick={() => router.push('/')}>Services</a>
              },
              { 
                title: 'Chat' 
              }
            ]}
          />
        </div>

        {/* Right side - User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* User Menu */}
          <Dropdown
            menu={{ 
              items: isAuthenticated ? [
                {
                  key: 'profile',
                  icon: <SettingOutlined />,
                  label: 'Profile Settings',
                  onClick: () => router.push('/profile'),
                },
                { type: 'divider' as const },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Logout',
                  onClick: async () => {
                    document.cookie = 'hanko=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    router.push('/');
                  },
                },
              ] : [
                {
                  key: 'login',
                  label: 'Login',
                  onClick: () => router.push('/login?returnTo=/chat'),
                },
              ]
            }}
            placement="bottomRight"
          >
            <Button
              type="text"
              style={{ padding: 4 }}
              icon={
                isAuthenticated && user?.email ? (
                  <Avatar
                    style={{
                      backgroundColor: '#4F2D7F',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                    size={32}
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <Avatar
                    style={{
                      backgroundColor: '#f0f0f0',
                      color: '#999',
                      cursor: 'pointer'
                    }}
                    size={32}
                    icon={<UserOutlined />}
                  />
                )
              }
            />
          </Dropdown>
        </div>
      </div>

      <Content style={{ 
        display: 'flex', 
        flexDirection: 'column',
        maxWidth: 900,
        width: '100%',
        margin: '0 auto',
        padding: '24px',
        height: 'calc(100vh - 56px)'
      }}>
        {/* Service Selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong>Select a service to chat with:</Text>
          </div>
          <Select
            value={selectedService}
            onChange={setSelectedService}
            style={{ width: '100%' }}
            size="large"
            placeholder="Choose a service..."
            disabled={availableServices.length === 0}
            optionLabelProp="title"
            options={availableServices.map(service => ({
              value: service.id,
              title: `${service.icon} ${service.name}`,
              label: (
                <Space>
                  <span style={{ fontSize: 16 }}>{service.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{service.name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{service.description}</div>
                  </div>
                </Space>
              )
            }))}
          />
        </div>

        {availableServices.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: 48,
            textAlign: 'center'
          }}>
            <AppstoreOutlined style={{ fontSize: 64, color: '#bfbfbf', marginBottom: 16 }} />
            <Title level={4}>No Services Available</Title>
            <Text type="secondary">
              {isAuthenticated 
                ? "You don't have any published services yet. Create and publish a service to start chatting!"
                : "Something went wrong loading demo services. Please try refreshing the page."
              }
            </Text>
            <div style={{ marginTop: 24 }}>
              <Button type="primary" onClick={() => router.push('/')}>
                Go to Services
              </Button>
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            background: 'white',
            borderRadius: 8,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Messages */}
            <div style={{ 
              flex: 1, 
              overflow: 'auto',
              padding: '24px'
            }}>
              <Conversations 
                items={conversationItems}
                style={{ paddingBottom: 80 }}
              />
            </div>

            {/* Input */}
            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid #f0f0f0',
              background: 'white'
            }}>
              <Sender
                value={inputValue}
                onChange={setInputValue}
                placeholder={`Ask ${currentService?.name} anything...`}
                onSubmit={handleSubmit}
                loading={isLoading}
                disabled={isLoading || !selectedService}
                style={{ marginBottom: 0 }}
              />
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div style={{ 
            color: '#ff4d4f', 
            fontSize: 12, 
            marginTop: 8,
            padding: '8px 16px',
            background: '#fff2f0',
            borderRadius: 4,
            border: '1px solid #ffccc7'
          }}>
            Error: {error.message}
          </div>
        )}
      </Content>
      </Layout>
    </Layout>
  );
}