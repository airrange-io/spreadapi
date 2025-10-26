'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button, Typography, Space, Spin, Avatar, Empty } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { Bubble, Sender } from '@ant-design/x';
import type { BubbleProps } from '@ant-design/x';
import markdownit from 'markdown-it';
import '@/app/chat/chat.css';

const { Text, Title } = Typography;

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
}

const ServiceChatSection: React.FC<ServiceChatSectionProps> = ({
  serviceId,
  serviceName = 'Service',
  isLoading: parentLoading = false
}) => {
  const hasGreetedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  const {
    messages,
    status,
    sendMessage,
    setMessages
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { serviceId }
    }),
    onResponse: () => {
      console.log('[ServiceChat] Response received');
    },
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

  // Send automatic greeting when chat loads
  useEffect(() => {
    if (!hasGreetedRef.current && !isLoading && messages.length === 0 && sendMessage) {
      hasGreetedRef.current = true;
      // Send greeting message
      sendMessage({ text: 'Hello! Tell me about this service and what you can help me calculate.' });
    }
  }, [isLoading, messages.length, sendMessage]);

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
        <Spin size="large" />
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
        <Space direction="vertical" size={0}>
          <Title level={5} style={{ margin: 0 }}>
            Chat Test - {serviceName}
          </Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Test your AI descriptions and see how the assistant responds
          </Text>
        </Space>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          disabled={messages.length === 0}
        >
          Reset Chat
        </Button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        backgroundColor: '#fafafa'
      }}>
        {messages.length === 0 && !isLoading ? (
          <Empty
            image={<RobotOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description={
              <Space direction="vertical" size={4}>
                <Text>No messages yet</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Start a conversation to test your service's AI configuration
                </Text>
              </Space>
            }
          />
        ) : (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
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
          placeholder="Ask about your service..."
          loading={isLoading}
          disabled={isLoading}
          submitIcon={<SendOutlined />}
          styles={{
            input: {
              fontSize: '14px'
            }
          }}
        />
        <Text type="secondary" style={{ fontSize: '11px', marginTop: '8px', display: 'block' }}>
          This chat uses the AI Description and Usage Guidance you configured above
        </Text>
      </div>
    </div>
  );
};

export default ServiceChatSection;
