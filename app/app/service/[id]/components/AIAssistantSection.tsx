'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Space, Input, Select, Button, message, Modal, Typography, Divider } from 'antd';
import { BulbOutlined, LoadingOutlined } from '@ant-design/icons';

// Debounced Input component
interface DebouncedInputProps {
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  delay?: number;
}

const DebouncedInput: React.FC<DebouncedInputProps> = ({
  defaultValue = '',
  onChange,
  placeholder,
  disabled,
  delay = 500
}) => {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

// Debounced TextArea component
interface DebouncedTextAreaProps {
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  delay?: number;
}

const DebouncedTextArea: React.FC<DebouncedTextAreaProps> = ({
  defaultValue = '',
  onChange,
  placeholder,
  rows,
  disabled,
  delay = 500
}) => {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <Input.TextArea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
    />
  );
};

interface AIAssistantSectionProps {
  serviceId: string;
  aiDescription: string;
  aiUsageGuidance?: string;
  aiUsageExamples: string[];
  aiTags: string[];
  category: string;
  isLoading?: boolean;
  onAiDescriptionChange: (value: string) => void;
  onAiUsageGuidanceChange: (value: string) => void;
  onAiUsageExamplesChange: (values: string[]) => void;
  onAiTagsChange: (values: string[]) => void;
  onCategoryChange: (value: string) => void;
}

const AIAssistantSection: React.FC<AIAssistantSectionProps> = ({
  serviceId,
  aiDescription,
  aiUsageGuidance,
  aiUsageExamples,
  aiTags,
  category,
  isLoading = false,
  onAiDescriptionChange,
  onAiUsageGuidanceChange,
  onAiUsageExamplesChange,
  onAiTagsChange,
  onCategoryChange,
}) => {
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [currentQuestions, setCurrentQuestions] = useState<string[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  const handleGenerateSuggestions = async (answers: string[] = []) => {
    try {
      setGenerating(true);

      // Build conversation history
      let history = [...conversationHistory];
      if (answers.length > 0 && currentQuestions.length > 0) {
        // Add questions and answers to history
        currentQuestions.forEach((q, i) => {
          history.push({ role: 'assistant', content: q });
          if (answers[i]) {
            history.push({ role: 'user', content: answers[i] });
          }
        });
        setConversationHistory(history);
      }

      const response = await fetch(`/api/service/${serviceId}/suggest-ai-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory: history
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }

      const data = await response.json();

      if (data.hasQuestions) {
        // AI has clarifying questions
        setCurrentQuestions(data.questions || []);
        setUserAnswers(new Array(data.questions?.length || 0).fill(''));
        setShowQuestions(true);
      } else {
        // AI has final suggestions
        setSuggestions(data.suggestions);
        setShowPreview(true);
        // Reset conversation
        setConversationHistory([]);
        setCurrentQuestions([]);
      }

    } catch (error) {
      console.error('Error generating suggestions:', error);
      Modal.error({
        title: 'Generation Failed',
        content: 'Failed to generate suggestions. Please try again.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerQuestions = () => {
    // Check if all questions are answered
    if (userAnswers.some(a => !a || a.trim() === '')) {
      Modal.warning({
        title: 'Incomplete Answers',
        content: 'Please answer all questions to continue.',
      });
      return;
    }

    setShowQuestions(false);
    handleGenerateSuggestions(userAnswers);
  };

  const handleApplySuggestions = () => {
    if (!suggestions) return;

    // Apply all suggestions
    onAiDescriptionChange(suggestions.aiDescription);
    onAiUsageGuidanceChange(suggestions.aiUsageGuidance);
    onAiUsageExamplesChange(suggestions.aiUsageExamples);
    onAiTagsChange(suggestions.aiTags);
    onCategoryChange(suggestions.category);

    setShowPreview(false);
    Modal.success({
      title: 'Applied Successfully',
      content: 'AI suggestions have been applied to your service configuration.',
    });
  };

  return (
    <div style={{ padding: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            AI Description
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            Detailed explanation for AI assistants about what this service does and when to use it
          </div>
          <DebouncedTextArea
            placeholder="e.g., This service calculates mortgage payments based on loan amount, interest rate, and term..."
            defaultValue={aiDescription}
            onChange={onAiDescriptionChange}
            rows={4}
            disabled={isLoading}
            delay={500}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            Usage Guidance
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            When should AI use this service?
          </div>
          <DebouncedTextArea
            placeholder="e.g., Use when user wants to calculate mortgage payments or compare loan terms"
            defaultValue={aiUsageGuidance || ''}
            onChange={onAiUsageGuidanceChange}
            rows={3}
            disabled={isLoading}
            delay={500}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            Usage Examples
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            Add example questions or use cases (press Enter to add)
          </div>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="e.g., What's my monthly payment for a $300k loan at 4%?"
            value={aiUsageExamples}
            onChange={onAiUsageExamplesChange}
            tokenSeparators={[',']}
            disabled={isLoading}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            Tags
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            Searchable keywords for AI discovery
          </div>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="e.g., finance, mortgage, loan, calculator"
            value={aiTags}
            onChange={onAiTagsChange}
            tokenSeparators={[',']}
            disabled={isLoading}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            Category
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            Main category for this service
          </div>
          <Select
            style={{ width: '100%' }}
            placeholder="Select a category"
            value={category}
            onChange={onCategoryChange}
            disabled={isLoading}
          >
            <Select.Option value="finance">Finance</Select.Option>
            <Select.Option value="math">Mathematics</Select.Option>
            <Select.Option value="statistics">Statistics</Select.Option>
            <Select.Option value="business">Business</Select.Option>
            <Select.Option value="science">Science</Select.Option>
            <Select.Option value="engineering">Engineering</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </div>

        {/* AI Generation Button */}
        <Divider style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="primary"
            icon={generating ? <LoadingOutlined /> : <BulbOutlined />}
            onClick={() => handleGenerateSuggestions()}
            loading={generating}
            disabled={isLoading || generating}
            size="large"
          >
            {generating ? 'Generating AI Suggestions...' : 'Generate AI Suggestions'}
          </Button>
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>
          AI will analyze your service parameters and suggest descriptions
        </div>
      </Space>

      {/* Preview Modal */}
      <Modal
        title={
          <Space>
            <BulbOutlined style={{ color: '#502D80' }} />
            <span>AI-Generated Suggestions</span>
          </Space>
        }
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        onOk={handleApplySuggestions}
        okText="Apply All Suggestions"
        cancelText="Cancel"
        width={700}
        centered
        okButtonProps={{ type: 'primary' }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 250px)',
            overflowY: 'auto'
          }
        }}
      >
        {suggestions && (
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>AI Description</Typography.Title>
              <Typography.Paragraph style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {suggestions.aiDescription}
              </Typography.Paragraph>
            </div>

            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>Usage Guidance</Typography.Title>
              <Typography.Paragraph style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {suggestions.aiUsageGuidance}
              </Typography.Paragraph>
            </div>

            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>Usage Examples</Typography.Title>
              <ul style={{ background: '#f5f5f5', padding: '12px 12px 12px 32px', borderRadius: 4, margin: 0 }}>
                {suggestions.aiUsageExamples.map((example: string, index: number) => (
                  <li key={index} style={{ marginBottom: 4 }}>{example}</li>
                ))}
              </ul>
            </div>

            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>Tags</Typography.Title>
              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {suggestions.aiTags.map((tag: string, index: number) => (
                  <span key={index} style={{
                    display: 'inline-block',
                    background: '#fff',
                    padding: '4px 12px',
                    borderRadius: 4,
                    marginRight: 8,
                    marginBottom: 8,
                    border: '1px solid #d9d9d9'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>Category</Typography.Title>
              <Typography.Paragraph style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {suggestions.category}
              </Typography.Paragraph>
            </div>

            {suggestions.reasoning && (
              <div style={{ marginTop: 16, padding: 12, background: '#f0f5ff', borderRadius: 4, border: '1px solid #adc6ff' }}>
                <Typography.Text style={{ fontSize: 12, color: '#002766' }}>
                  <strong>AI Reasoning:</strong> {suggestions.reasoning}
                </Typography.Text>
              </div>
            )}
          </Space>
        )}
      </Modal>

      {/* Questions Modal */}
      <Modal
        title={
          <Space>
            <BulbOutlined style={{ color: '#502D80' }} />
            <span>Help AI Understand Your Service</span>
          </Space>
        }
        open={showQuestions}
        onCancel={() => {
          setShowQuestions(false);
          setCurrentQuestions([]);
          setUserAnswers([]);
        }}
        onOk={handleAnswerQuestions}
        okText="Continue"
        cancelText="Cancel"
        width={600}
        centered
        okButtonProps={{ type: 'primary', loading: generating }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 250px)',
            overflowY: 'auto'
          }
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text style={{ color: '#8c8c8c' }}>
            Please answer these questions to help generate better AI suggestions:
          </Typography.Text>
        </div>
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          {currentQuestions.map((question, index) => (
            <div key={index}>
              <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                {index + 1}. {question}
              </Typography.Text>
              <Input.TextArea
                value={userAnswers[index]}
                onChange={(e) => {
                  const newAnswers = [...userAnswers];
                  newAnswers[index] = e.target.value;
                  setUserAnswers(newAnswers);
                }}
                placeholder="Your answer..."
                rows={3}
                autoFocus={index === 0}
              />
            </div>
          ))}
        </Space>
      </Modal>
    </div>
  );
};

export default AIAssistantSection;
