'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button, Typography, Space, Spin, Avatar, Empty, Tooltip, Select } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, ReloadOutlined, MessageOutlined } from '@ant-design/icons';
import { Bubble, Sender } from '@ant-design/x';
import type { BubbleProps } from '@ant-design/x';
import markdownit from 'markdown-it';
import '@/app/chat/chat.css';

const { Text, Title } = Typography;

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

// Custom markdown renderer for Bubble component - matches existing chat styling
const renderMarkdown: BubbleProps['messageRender'] = (content) => {
  return (
    <Typography>
      <div
        dangerouslySetInnerHTML={{ __html: md.render(content) }}
        style={{
          fontSize: '14px',
          lineHeight: '1.6'
        } as any}
        className="chat-bubble-content"
      />
    </Typography>
  );
};

interface ServiceChatSectionProps {
  serviceId: string;
  serviceName?: string;
  isLoading?: boolean;
  apiConfig?: any;
}

const ServiceChatSection: React.FC<ServiceChatSectionProps> = ({
  serviceId,
  serviceName = 'Service',
  isLoading: parentLoading = false,
  apiConfig
}) => {
  const hasGreetedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Extract current values from apiConfig (captured when parameters were added)
  const currentInputValues = useMemo(() => {
    if (!apiConfig || !apiConfig.inputs) return null;

    const values: any = {};
    apiConfig.inputs.forEach((input: any) => {
      if (input.value !== null && input.value !== undefined) {
        values[input.name] = {
          value: input.value,
          title: input.title,
          format: input.format
        };
      }
    });

    return Object.keys(values).length > 0 ? values : null;
  }, [apiConfig]);

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

  const {
    messages,
    status,
    sendMessage,
    setMessages
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        serviceId,
        model: selectedModel,
        // Include current spreadsheet values for unpublished services
        currentInputValues
      }
    }),
    onFinish: () => {
      console.log('[ServiceChat] Message finished');
    },
    onError: (error) => {
      console.error('[ServiceChat] Error:', error);
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // OPTIMIZATION: Auto-greeting disabled for faster initial load
  // Users can start conversation by typing or clicking examples in empty state
  //
  // Original auto-greeting (caused 10+ second delay):
  // useEffect(() => {
  //   if (!hasGreetedRef.current && !isLoading && messages.length === 0 && sendMessage) {
  //     hasGreetedRef.current = true;
  //     sendMessage({ text: 'Hello! Tell me about this service and what you can help me calculate.' });
  //   }
  // }, [isLoading, messages.length, sendMessage]);

  // Handle clicks on example buttons (matching existing chat)
  useEffect(() => {
    const handleExampleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('example-btn')) {
        const example = target.getAttribute('data-example');
        if (example && !isLoading && sendMessage) {
          setInputValue(example);
          // Automatically send the message
          setTimeout(() => {
            sendMessage({ text: example });
          }, 100);
        }
      }
    };

    // Add event listener for bubble content clicks
    document.addEventListener('click', handleExampleClick);

    return () => {
      document.removeEventListener('click', handleExampleClick);
    };
  }, [isLoading, sendMessage]);

  const handleReset = () => {
    setMessages([]);
    hasGreetedRef.current = false;
    setInputValue('');
  };

  if (parentLoading) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <Spin size="default" />
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Space orientation="vertical" size={0}>
          <Title level={5} style={{ margin: 0 }}>
            Chat Test
          </Title>
          {/* <Text type="secondary" style={{ fontSize: '12px' }}>
            Test your AI descriptions and see how the assistant responds
          </Text> */}
        </Space>
        <Space size={12}>
          <Select
            value={selectedModel}
            onChange={(value) => {
              setSelectedModel(value);
              // Clear messages when switching models to start fresh
              setMessages([]);
              hasGreetedRef.current = false;
              setInputValue('');
            }}
            style={{ width: 140 }}
            disabled={isLoading}
            options={AI_MODELS.map(model => ({
              label: model.name,
              value: model.id,
              title: model.description
            }))}
          />
          <Tooltip title="Reset Chat">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={messages.length === 0}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: messages.length === 0 ? 'center' : 'flex-start'
      }}>
        {messages.length === 0 && !isLoading ? (
          <Empty
            image={<MessageOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description={
              <Space orientation="vertical" size={8} style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
                <Text strong style={{ fontSize: '16px' }}>
                  Test Your AI Configuration
                </Text>
                <Text type="secondary" style={{ fontSize: '13px', textAlign: 'center' }}>
                  Ask questions about your service to see how the AI responds based on your descriptions and usage guidance
                </Text>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => {
                    if (sendMessage && !hasGreetedRef.current) {
                      hasGreetedRef.current = true;
                      sendMessage({ text: 'Hello! Tell me about this service and what you can help me calculate.' });
                    }
                  }}
                  style={{ marginTop: 8 }}
                >
                  Get AI Examples
                </Button>
              </Space>
            }
          />
        ) : (
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            {messages
              .filter((message, index) => {
                // Only show completed messages (not currently streaming)
                // A message is complete if it's not the last assistant message while loading
                const isLastMessage = index === messages.length - 1;
                const isAssistantMessage = message.role === 'assistant';

                // Show user messages immediately
                if (message.role === 'user') return true;

                // Show assistant messages only if we're not currently streaming
                // or if it's not the last message
                return !isLoading || !isLastMessage || !isAssistantMessage;
              })
              .map((message, index) => {
                const isUser = message.role === 'user';

                // Extract text from message parts
                const content = message.parts
                  ?.filter((part: any) => part.type === 'text')
                  .map((part: any) => part.text)
                  .join('') || '';

                // Skip empty messages or greeting triggers
                if (!content || content === '[GREETING]') return null;

                return (
                  <div
                    key={index}
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
                            icon={<UserOutlined />}
                          />
                        ) : (
                          <Avatar
                            style={{ backgroundColor: '#f0f0f0', color: '#502D80' }}
                            size={32}
                            icon={<RobotOutlined />}
                          />
                        )
                      }
                      styles={{
                        content: {
                          backgroundColor: isUser ? '#502D80' : '#f0f0f0',
                          color: isUser ? '#ffffff' : '#000000',
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
                      style={{ backgroundColor: '#f0f0f0', color: '#502D80' }}
                      size={32}
                      icon={<RobotOutlined />}
                    />
                  }
                  styles={{
                    content: {
                      backgroundColor: '#f0f0f0',
                      color: '#000000',
                    }
                  }}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </Space>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#ffffff'
      }}>
        <Sender
          value={inputValue}
          onChange={setInputValue}
          onSubmit={(value) => {
            if (value.trim() && sendMessage) {
              sendMessage({ text: value });
              setInputValue('');
            }
          }}
          placeholder="Test your AI descriptions and see how the assistant responds"
          loading={isLoading}
          disabled={isLoading}
          styles={{
            input: {
              fontSize: '14px'
            }
          }}
        />
      </div>
    </div>
  );
};

export default ServiceChatSection;
