'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Layout, Button, Typography, Select, Space, Spin, Avatar, Breadcrumb, Dropdown } from 'antd';
import { MenuOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { useAppStore } from '@/shared/hooks/useAppStore';
import { DEMO_SERVICES } from '@/lib/demoServices';
import dynamic from 'next/dynamic';
import './chat.css';

const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  ssr: false,
  loading: () => null
});

const { Content } = Layout;
const { Text } = Typography;

export default function ChatWrapper() {
  const router = useRouter();
  const appStore = useAppStore();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedService, setSelectedService] = useState<string>('general');
  const [userServices, setUserServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Simple useChat hook usage following Vercel's example
  const { messages, sendMessage, isLoading } = useChat({
    api: '/api/chat',
  });
  
  // Local input state
  const [input, setInput] = useState('');

  // Load services
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
          
          if (loadedServices.length === 0 && !isAuthenticated) {
            loadedServices = DEMO_SERVICES;
          }
          
          setUserServices(loadedServices);
        } else {
          // If API fails and user is not authenticated, use demo services
          if (!isAuthenticated) {
            setUserServices(DEMO_SERVICES);
          }
        }
      } catch (error) {
        console.error('Failed to load services:', error);
        // On error, use demo services for non-authenticated users
        if (!isAuthenticated) {
          setUserServices(DEMO_SERVICES);
        }
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [isAuthenticated]);

  const generalAIOption = {
    id: 'general',
    name: 'General AI Assistant',
    description: 'Chat with AI about anything',
    icon: '🤖'
  };
  
  const availableServices = [
    generalAIOption,
    ...(isAuthenticated ? userServices : DEMO_SERVICES)
  ];
  
  const currentService = selectedService === 'general' 
    ? generalAIOption 
    : availableServices.find(s => s.id === selectedService) || generalAIOption;

  if (authLoading || loadingServices) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="default" />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      
      <Layout style={{ marginLeft: 0 }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '12px 16px',
          height: '56px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              type='text'
              icon={<MenuOutlined />}
              onClick={appStore.toggleSidebar}
            />
            <Breadcrumb
              items={[
                { title: <a onClick={() => router.push('/')}>Services</a> },
                { title: 'Chat' }
              ]}
            />
          </div>

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
                  onClick: () => {
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
                    style={{ backgroundColor: '#4F2D7F', color: '#fff' }}
                    size={32}
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <Avatar
                    style={{ backgroundColor: '#f0f0f0', color: '#999' }}
                    size={32}
                    icon={<UserOutlined />}
                  />
                )
              }
            />
          </Dropdown>
        </div>

        <Content style={{ 
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
          padding: '24px',
          height: 'calc(100vh - 56px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Service Selector */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Select a mode:</Text>
            </div>
            <Select
              value={selectedService}
              onChange={setSelectedService}
              className="chat-service-select"
              style={{ width: '100%' }}
              size="large"
              optionLabelProp="label"
              options={availableServices.map(service => ({
                value: service.id,
                label: `${service.icon} ${service.name}`,
                children: (
                  <Space>
                    <span>{service.icon}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{service.name}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>{service.description}</div>
                    </div>
                  </Space>
                )
              }))}
            />
          </div>

          {/* Chat Container */}
          <div style={{
            flex: 1,
            background: 'white',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Messages */}
            <div style={{ 
              flex: 1,
              overflow: 'auto',
              padding: '24px'
            }}>
              {messages.length === 0 && (
                <div style={{ 
                  textAlign: 'center',
                  color: '#8c8c8c',
                  padding: '40px 20px'
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{currentService.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                    {currentService.name}
                  </div>
                  <div style={{ fontSize: 14 }}>
                    {currentService.description}
                  </div>
                </div>
              )}
              
              {messages.map(m => (
                <div 
                  key={m.id} 
                  style={{
                    display: 'flex',
                    justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 16
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    backgroundColor: m.role === 'user' ? '#502D80' : '#f0f0f0',
                    color: m.role === 'user' ? 'white' : 'black'
                  }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 4,
                      opacity: 0.8
                    }}>
                      {m.role === 'user' ? 'You' : currentService.name}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {m.content || (m.parts && m.parts.find(p => p.type === 'text')?.text) || ''}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: 16
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    backgroundColor: '#f0f0f0'
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, opacity: 0.8 }}>
                      {currentService.name}
                    </div>
                    <div>Thinking...</div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!input || !input.trim() || isLoading) return;
                
                await sendMessage({ 
                  content: input, 
                  role: 'user' 
                }, {
                  body: selectedService === 'general' ? {} : { serviceId: selectedService }
                });
                
                setInput('');
              }}
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                gap: 8
              }}
            >
              <input
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  fontSize: 14,
                  outline: 'none'
                }}
                value={input}
                placeholder={`Ask ${currentService.name} anything...`}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input || !input.trim()}
                style={{
                  padding: '8px 24px',
                  backgroundColor: isLoading || !input || !input.trim() ? '#f0f0f0' : '#502D80',
                  color: isLoading || !input || !input.trim() ? '#999' : 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: isLoading || !input || !input.trim() ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}