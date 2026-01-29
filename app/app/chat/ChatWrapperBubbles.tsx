'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Layout, Button, Typography, Select, Space, Spin, Avatar, Breadcrumb, Dropdown, Empty } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, SendOutlined, RobotOutlined, MessageOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Bubble, Sender } from '@ant-design/x';
import type { BubbleProps } from '@ant-design/x';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import markdownit from 'markdown-it';
import { useTranslation } from '@/lib/i18n';
import './chat.css';

const { Content } = Layout;
const { Text } = Typography;

// Available AI models
const AI_MODELS = [
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', description: 'Ultra-fast & economical (recommended)' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: 'Best quality & reasoning' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast & intelligent' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Very fast & cost-effective' },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', description: 'Cheapest & lowest latency' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Previous generation flagship' },
] as const;

// Initialize markdown renderer
const md = markdownit({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true
});

// Custom markdown renderer for Bubble component
const renderMarkdown: BubbleProps['messageRender'] = (content) => {
  return (
    <Typography>
      <div 
        dangerouslySetInnerHTML={{ __html: md.render(content) }}
        style={{
          // Style for markdown content
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            marginTop: '0.5em',
            marginBottom: '0.5em',
          },
          '& p': {
            marginBottom: '0.5em',
            '&:last-child': {
              marginBottom: 0,
            },
          },
          '& pre': {
            background: '#f6f8fa',
            padding: '12px',
            borderRadius: '6px',
            overflow: 'auto',
          },
          '& code': {
            background: '#f6f8fa',
            padding: '2px 4px',
            borderRadius: '3px',
            fontSize: '0.9em',
          },
          '& pre code': {
            background: 'transparent',
            padding: 0,
          },
          '& blockquote': {
            borderLeft: '4px solid #e4e4e7',
            paddingLeft: '16px',
            marginLeft: 0,
            color: '#666',
          },
          '& ul, & ol': {
            paddingLeft: '20px',
            marginBottom: '0.5em',
          },
          '& a': {
            color: '#502D80',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        } as any}
      />
    </Typography>
  );
};

export default function ChatWrapperBubbles() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedService, setSelectedService] = useState<string>('general');
  const [userServices, setUserServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [serviceDetails, setServiceDetails] = useState<any>(null);
  const hasGreetedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Model selection with localStorage persistence
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('spreadapi-chat-model') || 'gpt-4.1-nano';
    }
    return 'gpt-4.1-nano';
  });

  // Save model selection to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spreadapi-chat-model', selectedModel);
    }
  }, [selectedModel]);

  // Simple useChat hook usage following Vercel's example
  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
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
  

  // OPTIMIZATION: Auto-greeting disabled for faster initial load
  // Users can start conversation by typing or clicking "Get AI Examples" button
  //
  // Original auto-greeting (caused 10+ second delay):
  // useEffect(() => {
  //   if (selectedService && selectedService !== 'general' && !hasGreetedRef.current && !loadingServices && messages.length === 0 && userServices.length === 1) {
  //     hasGreetedRef.current = true;
  //     setTimeout(async () => {
  //       await sendMessage({
  //         text: '[GREETING]'
  //       }, {
  //         body: { serviceId: selectedService, initialGreeting: true }
  //       });
  //     }, 300);
  //   }
  // }, [selectedService, loadingServices, userServices.length]);

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
              description: s.description || t('chat.defaultServiceDesc')
            }));
          
          setUserServices(loadedServices);

          // Auto-select if only one service available
          if (loadedServices.length === 1) {
            setSelectedService(loadedServices[0].id);
            fetchServiceDetails(loadedServices[0].id);
          }
        } else {
          setUserServices([]);
        }
      } catch (error) {
        console.error('Failed to load services:', error);
        setUserServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [isAuthenticated]);

  // Fetch detailed service information
  const fetchServiceDetails = async (serviceId: string) => {
    try {
      console.log('[Chat] Fetching service details for ID:', serviceId);
      const res = await fetch(`/api/services/${serviceId}/full`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('[Chat] Full service details received:', data.service);
        console.log('[Chat] Service areas:', data.service?.areas);
        console.log('[Chat] Service inputs:', data.service?.inputs);
        console.log('[Chat] Service outputs:', data.service?.outputs);
        setServiceDetails(data.service);
      } else {
        console.error('[Chat] Failed to fetch service details, status:', res.status);
        setServiceDetails(null);
      }
    } catch (error) {
      console.error('[Chat] Error fetching service details:', error);
      setServiceDetails(null);
    }
  };

  const generalAIOption = {
    id: 'general',
    name: t('chat.selectService'),
    description: t('chat.selectServiceDesc')
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
      body: selectedService === 'general' ? { model: selectedModel } : { serviceId: selectedService, model: selectedModel }
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
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/app')}
            />
            <Breadcrumb
              items={[
                { title: t('chat.breadcrumbChat') }
              ]}
            />
          </div>

          <Dropdown
            menu={{ 
              items: isAuthenticated ? [
                {
                  key: 'profile',
                  icon: <SettingOutlined />,
                  label: t('chat.profileSettings'),
                  onClick: () => router.push('/app/profile'),
                },
                { type: 'divider' as const },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: t('chat.logout'),
                  onClick: () => {
                    document.cookie = 'hanko=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    router.push('/');
                  },
                },
              ] : [
                {
                  key: 'login',
                  label: t('chat.login'),
                  onClick: () => router.push('/login?returnTo=/app/chat'),
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
                console.log('[Chat] Service selected:', value);
                console.log('[Chat] Available services:', availableServices.map(s => ({ id: s.id, name: s.name })));
                setSelectedService(value);

                // Clear messages when switching services
                setMessages([]);

                // Reset greeting flag to allow new greeting
                hasGreetedRef.current = false;

                // Fetch service details when selected
                if (value !== 'general') {
                  console.log('[Chat] Fetching details for service:', value);
                  fetchServiceDetails(value);

                  // OPTIMIZATION: Auto-greeting disabled - users can click "Get AI Examples" button
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
                  <span style={{ fontSize: 14 }}>{service.name}</span>
                ),
                children: (
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{service.name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{service.description}</div>
                  </div>
                )
              }))}
            />
          </div>

          {/* AI Model Selector */}
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
              {t('chat.aiModel')}
            </Text>
            <Select
              value={selectedModel}
              onChange={(value) => {
                setSelectedModel(value);
                // Clear messages when switching models to start fresh
                setMessages([]);
                hasGreetedRef.current = false;
              }}
              style={{ width: '100%' }}
              disabled={isLoading}
              options={AI_MODELS.map(model => ({
                label: model.name,
                value: model.id,
                title: model.description
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
              gap: 16,
              justifyContent: messages.length === 0 && !isLoading ? 'center' : 'flex-start'
            }}>

              {/* Empty state when no messages */}
              {messages.length === 0 && !isLoading && selectedService !== 'general' && (
                <Empty
                  image={<MessageOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
                  description={
                    <Space orientation="vertical" size={8} style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
                      <Typography.Text strong style={{ fontSize: '16px' }}>
                        {t('chat.startConversation')}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: '13px', textAlign: 'center' }}>
                        {t('chat.startConversationDesc')}
                      </Typography.Text>
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={() => {
                          if (sendMessage && !hasGreetedRef.current) {
                            hasGreetedRef.current = true;
                            sendMessage({
                              text: '[GREETING]'
                            }, {
                              body: { serviceId: selectedService, initialGreeting: true, model: selectedModel }
                            });
                          }
                        }}
                        style={{ marginTop: 8 }}
                      >
                        {t('chat.getAiExamples')}
                      </Button>
                    </Space>
                  }
                />
              )}

              {/* Select service prompt */}
              {messages.length === 0 && !isLoading && selectedService === 'general' && (
                <Empty
                  image={<MessageOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
                  description={
                    <Space orientation="vertical" size={4}>
                      <Typography.Text>{t('chat.selectServicePrompt')}</Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                        {t('chat.selectServicePromptDesc')}
                      </Typography.Text>
                    </Space>
                  }
                />
              )}

              {/* Deduplicate messages based on ID */}
              {messages
                .filter((m, index, self) =>
                  index === self.findIndex(msg => msg.id === m.id)
                )
                .filter((message, index, filteredMessages) => {
                  // Only show completed messages (not currently streaming)
                  // A message is complete if it's not the last assistant message while loading
                  const isLastMessage = index === filteredMessages.length - 1;
                  const isAssistantMessage = message.role === 'assistant';

                  // Show user messages immediately
                  if (message.role === 'user') return true;

                  // Show assistant messages only if we're not currently streaming
                  // or if it's not the last message
                  return !isLoading || !isLastMessage || !isAssistantMessage;
                })
                .map((m, index) => {
                const isUser = m.role === 'user';
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
                      width: '100%',
                      animation: 'fadeInUp 0.3s ease-out',
                    }}
                  >
                    <Bubble
                      placement={isUser ? 'end' : 'start'}
                      content={content}
                      messageRender={!isUser ? renderMarkdown : undefined}
                      avatar={
                        isUser ? (
                          <Avatar
                            style={{ backgroundColor: '#502D80', color: '#fff' }}
                            size={32}
                          >
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                        ) : (
                          <Avatar
                            style={{ backgroundColor: '#f0f0f0' }}
                            size={32}
                            icon={<RobotOutlined style={{ color: '#502D80' }} />}
                          />
                        )
                      }
                      styles={{
                        content: {
                          background: isUser ? '#502D80' : '#f0f0f0',
                          color: isUser ? 'white' : 'black',
                          maxWidth: '70%',
                        }
                      }}
                    />
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
                        style={{ backgroundColor: '#f0f0f0' }}
                        size={32}
                        icon={<RobotOutlined style={{ color: '#502D80' }} />}
                      />
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
                placeholder={selectedService === 'general' ? t('chat.selectServiceToStart') : t('chat.inputPlaceholder')}
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