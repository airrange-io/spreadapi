'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { Layout, Button, Typography, Select, Space, Spin, Avatar, Breadcrumb, Dropdown } from 'antd';
import { MenuOutlined, UserOutlined, LogoutOutlined, SettingOutlined, SendOutlined } from '@ant-design/icons';
import { Bubble, Sender } from '@ant-design/x';
import type { BubbleProps } from '@ant-design/x';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { useAppStore } from '@/shared/hooks/useAppStore';
import { DEMO_SERVICES } from '@/lib/demoServices';
import dynamic from 'next/dynamic';
import markdownit from 'markdown-it';
import './chat.css';

const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  ssr: false,
  loading: () => null
});

const { Content } = Layout;
const { Text } = Typography;

// Initialize markdown renderer
const md = markdownit({ 
  html: true, 
  breaks: true,
  linkify: true,
  typographer: true
});

// Configure markdown to open links in new tabs
md.renderer.rules.link_open = (tokens, idx, options, env, renderer) => {
  const token = tokens[idx];
  token.attrSet('target', '_blank');
  token.attrSet('rel', 'noopener noreferrer');
  return renderer.renderToken(tokens, idx, options);
};

// Memoized message bubble component to prevent re-renders
const MemoizedAIBubble = React.memo(({ content, avatar, placement, styles }: any) => {
  // Pre-render markdown content
  const renderedContent = React.useMemo(() => {
    try {
      return md.render(content);
    } catch (e) {
      return content;
    }
  }, [content]);
  
  return (
    <Bubble
      placement={placement}
      content={content}
      messageRender={() => (
        <div 
          dangerouslySetInnerHTML={{ __html: renderedContent }}
          className="markdown-content"
        />
      )}
      avatar={avatar}
      styles={styles}
    />
  );
});

export default function ChatWrapperBubbles() {
  const router = useRouter();
  const appStore = useAppStore();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedService, setSelectedService] = useState<string>('general');
  const [userServices, setUserServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [serviceDetails, setServiceDetails] = useState<any>(null);
  const hasGreetedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  

  // Simple useChat hook usage following Vercel's example with throttling
  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    experimental_throttle: 50, // Throttle updates to reduce flickering
    onFinish: () => {
      // Auto-scroll to bottom when new message arrives
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });
  
  // Derive isLoading from status
  const isLoading = status === 'submitted' || status === 'streaming';
  

  // Send greeting when service is auto-selected (single service scenario)
  useEffect(() => {
    if (selectedService && selectedService !== 'general' && !hasGreetedRef.current && !loadingServices && messages.length === 0 && userServices.length === 1) {
      hasGreetedRef.current = true;
      // Send greeting message for auto-selected single service
      setTimeout(async () => {
        await sendMessage({
          text: '[GREETING]'
        }, {
          body: { serviceId: selectedService, initialGreeting: true }
        });
      }, 500);
    }
  }, [selectedService, loadingServices, userServices.length]);

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
          
          if (loadedServices.length === 0) {
            loadedServices = DEMO_SERVICES;
          }
          
          setUserServices(loadedServices);
          
          // Auto-select if only one service available
          if (loadedServices.length === 1) {
            setSelectedService(loadedServices[0].id);
            // Fetch details for auto-selected service
            fetchServiceDetails(loadedServices[0].id);
            
          }
        } else {
          // If API fails, use demo services
          setUserServices(DEMO_SERVICES);
          // Auto-select if only one demo service
          if (DEMO_SERVICES.length === 1) {
            setSelectedService(DEMO_SERVICES[0].id);
            
            // No auto-greeting
          }
        }
      } catch (error) {
        console.error('Failed to load services:', error);
        // On error, use demo services as fallback
        setUserServices(DEMO_SERVICES);
        // Auto-select if only one demo service
        if (DEMO_SERVICES.length === 1) {
          setSelectedService(DEMO_SERVICES[0].id);
        }
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [isAuthenticated]);

  // Fetch detailed service information
  const fetchServiceDetails = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/services/${serviceId}/full`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setServiceDetails(data.service);
      } else {
        setServiceDetails(null);
      }
    } catch (error) {
      setServiceDetails(null);
    }
  };

  const generalAIOption = {
    id: 'general',
    name: 'Select a Service',
    description: 'Choose a calculation service to start',
    icon: '📊'
  };
  
  const availableServices = [
    generalAIOption,
    ...userServices
  ];
  
  const currentService = selectedService === 'general' 
    ? generalAIOption 
    : availableServices.find(s => s.id === selectedService) || generalAIOption;

  const handleSend = async (nextMessage: string) => {
    if (!nextMessage.trim() || isLoading) return;
    
    // Clear the input immediately
    setInputValue('');
    
    await sendMessage({
      text: nextMessage
    }, {
      body: selectedService === 'general' ? {} : { serviceId: selectedService }
    });
  };

  // Handle clicks on example buttons
  useEffect(() => {
    const handleExampleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('example-btn')) {
        const example = target.getAttribute('data-example');
        if (example && !isLoading) {
          setInputValue(example);
          // Automatically send the message
          setTimeout(() => handleSend(example), 100);
        }
      }
    };

    // Add event listener for bubble content clicks
    document.addEventListener('click', handleExampleClick);
    
    return () => {
      document.removeEventListener('click', handleExampleClick);
    };
  }, [isLoading, selectedService]);

  if (authLoading || loadingServices) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="default" />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'white' }}>
      <Sidebar />
      
      <Layout style={{ marginLeft: 0, background: 'white' }}>
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
            <Select
              value={selectedService}
              onChange={async (value) => {
                setSelectedService(value);
                
                // Clear messages when switching services
                setMessages([]);
                
                // Reset greeting flag to allow new greeting
                hasGreetedRef.current = false;
                
                // Fetch service details when selected
                if (value !== 'general') {
                  fetchServiceDetails(value);
                  
                  // Always trigger AI greeting for non-general services
                  setTimeout(async () => {
                    hasGreetedRef.current = true;
                    await sendMessage({
                      text: '[GREETING]'
                    }, {
                      body: { serviceId: value, initialGreeting: true }
                    });
                  }, 100);
                } else {
                  setServiceDetails(null);
                }
              }}
              className="chat-service-select"
              style={{ width: '100%' }}
              size="large"
              disabled={userServices.length === 1}
              optionLabelProp="label"
              options={availableServices.map(service => ({
                value: service.id,
                label: (
                  <span style={{ fontSize: 14 }}>{service.icon} {service.name}</span>
                ),
                children: (
                  <Space>
                    <span>{service.icon}</span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{service.name}</div>
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
            background: '#fdfdfd',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #f0f0f0'
          }}>
            {/* Messages with Bubble component */}
            <div style={{ 
              flex: 1,
              overflow: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              
              {/* Deduplicate messages based on ID */}
              {messages
                .filter((m, index, self) => 
                  index === self.findIndex(msg => msg.id === m.id)
                )
                .map((m, index, array) => {
                const isUser = m.role === 'user';
                // Check if this is the last AI message and we're currently streaming
                const isLastAIMessage = !isUser && index === array.length - 1;
                const isStreaming = isLastAIMessage && isLoading;
                
                // Extract content from message parts
                let content = '';
                
                if (m.parts && Array.isArray(m.parts) && m.parts.length > 0) {
                  const textParts = [];
                  
                  // Process each part
                  m.parts.forEach((part) => {
                    if (part.type === 'text' && part.text) {
                      textParts.push(part.text);
                    }
                  });
                  
                  if (textParts.length > 0) {
                    content = textParts.join('\n');
                  }
                }
                
                // Skip empty messages and greeting trigger
                if (!content || content === '[GREETING]') return null;
                
                return (
                  <div 
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    {isUser ? (
                      <Bubble
                        placement="end"
                        content={content}
                        avatar={
                          <Avatar
                            style={{ backgroundColor: '#502D80', color: '#fff' }}
                            size={32}
                          >
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                        }
                        styles={{
                          content: {
                            background: '#502D80',
                            color: 'white',
                            maxWidth: '70%',
                          }
                        }}
                      />
                    ) : (
                      <MemoizedAIBubble
                        placement="start"
                        content={content}
                        avatar={
                          <Avatar
                            style={{ backgroundColor: '#f0f0f0', color: '#333' }}
                            size={32}
                          >
                            {currentService.icon}
                          </Avatar>
                        }
                        styles={{
                          content: {
                            background: '#f0f0f0',
                            color: 'black',
                            maxWidth: '70%',
                            width: isStreaming ? '70%' : undefined,
                            minWidth: '200px',
                          }
                        }}
                      />
                    )}
                  </div>
                );
              })}
              
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Bubble
                    placement="start"
                    loading={true}
                    content="..."
                    avatar={
                      <Avatar
                        style={{ backgroundColor: '#f0f0f0', color: '#333' }}
                        size={32}
                      >
                        {currentService.icon}
                      </Avatar>
                    }
                    styles={{
                      content: {
                        background: '#f0f0f0',
                        color: 'black',
                      }
                    }}
                  />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input with Sender component */}
            <div style={{ 
              padding: '16px 24px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <Sender
                value={inputValue}
                onChange={setInputValue}
                placeholder={selectedService === 'general' ? 'Select a service to start' : 'Type or speak your calculation request...'}
                onSubmit={handleSend}
                loading={isLoading}
                onCancel={isLoading ? stop : undefined}
                style={{ width: '100%' }}
                allowSpeech={true}
                submitType="enter"
                disabled={selectedService === 'general'}
              />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}