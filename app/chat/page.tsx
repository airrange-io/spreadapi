'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Space, Spin, Tag, App, Select, Avatar, Breadcrumb, Dropdown } from 'antd';
import './chat.css';
import { MenuOutlined, RobotOutlined, AppstoreOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { Conversations, Bubble, Sender } from '@ant-design/x';
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { useAuth } from '@/components/auth/AuthContext';
import { useAppStore } from '@/shared/hooks/useAppStore';
import { DEMO_SERVICES } from '@/lib/demoServices';
import dynamic from 'next/dynamic';

// Dynamically import Sidebar
const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  ssr: false,
  loading: () => null
});

const { Content } = Layout;
const { Title, Text } = Typography;

export default function ChatPage() {
  const router = useRouter();
  const appStore = useAppStore();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { message: messageApi } = App.useApp();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Load services (user services or demo services)
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await fetch('/api/services', {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          let loadedServices = (data.services || [])
            .filter(s => s.status === 'published')
            .map(s => ({
              id: s.id,
              name: s.name,
              description: s.description || 'Spreadsheet calculation service',
              icon: '📊'
            }));
          
          // If user has no services and not authenticated, add demo services
          if (loadedServices.length === 0 && !isAuthenticated) {
            loadedServices = DEMO_SERVICES;
          }
          
          setUserServices(loadedServices);
          
          // Select first service by default
          if (loadedServices.length > 0) {
            setSelectedService(loadedServices[0].id);
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

  const { messages, sendMessage, status, error, setMessages, stop } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
      messageApi.error('Failed to send message. Please try again.');
    },
  });

  // Local input state for the Sender component
  const [input, setInput] = useState('');

  // Clear messages and input when service changes
  useEffect(() => {
    if (selectedService) {
      setMessages([]);
      setInput('');
    }
  }, [selectedService, setMessages]);

  // Get available services
  const availableServices = isAuthenticated ? userServices : DEMO_SERVICES;
  const currentService = availableServices.find(s => s.id === selectedService);

  // Convert messages to Conversations format with memoization
  const conversationItems = React.useMemo(() => {
    const items = messages.map((message) => ({
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
    if (items.length === 0 && currentService) {
      items.push({
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
                
                {currentService.id === DEMO_SERVICES[0].id && (
                  <>
                    <Text type="secondary" style={{ marginTop: 8 }}>Try asking:</Text>
                    <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                      <li>"Calculate $10,000 invested at 8% for 20 years"</li>
                      <li>"What if I add $200 monthly?"</li>
                      <li>"Compare 6% vs 8% returns"</li>
                    </ul>
                  </>
                )}
                
                {currentService.id === DEMO_SERVICES[1].id && (
                  <>
                    <Text type="secondary" style={{ marginTop: 8 }}>Try asking:</Text>
                    <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                      <li>"Find order #12345"</li>
                      <li>"Show all orders for customer John Doe"</li>
                      <li>"What orders were placed in January?"</li>
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
    if (status === 'loading') {
      items.push({
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

    return items;
  }, [messages, currentService, status, isAuthenticated]);

  // Show loading spinner while checking auth status
  if (authLoading || loadingServices) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="default" />
      </Layout>
    );
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
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong>Select a service to chat with:</Text>
          </div>
          <Select
            value={selectedService}
            onChange={setSelectedService}
            className="chat-service-select"
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
                  <span style={{ fontSize: 14 }}>{service.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{service.name}</div>
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
              {status === 'loading' && (
                <div style={{ marginBottom: 8, textAlign: 'center' }}>
                  <Button 
                    size="small" 
                    onClick={() => stop()}
                    type="default"
                  >
                    Stop generating
                  </Button>
                </div>
              )}
              <Sender
                value={input}
                onChange={setInput}
                placeholder={`Ask ${currentService?.name} anything...`}
                onSubmit={async (text) => {
                  if (!text.trim() || status === 'loading' || !selectedService) return;
                  
                  try {
                    // Send the message using the new API with serviceId in body
                    await sendMessage({
                      content: text,
                      role: 'user'
                    }, {
                      body: {
                        serviceId: selectedService
                      }
                    });
                    
                    // Clear the input after successful send
                    setInput('');
                  } catch (err) {
                    console.error('Failed to send message:', err);
                    // Keep input on error so user can retry
                  }
                }}
                loading={status === 'loading'}
                disabled={status === 'loading' || !selectedService}
                style={{ marginBottom: 5, marginTop: 5 }}
                aria-label="Message input"
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