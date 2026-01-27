'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Space, Input, Select, Button, Modal, Typography, Divider } from 'antd';
import { BulbOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();
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
        title: t('aiAssistant.generationFailedTitle'),
        content: t('aiAssistant.generationFailedContent'),
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerQuestions = () => {
    // Check if all questions are answered
    if (userAnswers.some(a => !a || a.trim() === '')) {
      Modal.warning({
        title: t('aiAssistant.incompleteAnswersTitle'),
        content: t('aiAssistant.incompleteAnswersContent'),
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
      title: t('aiAssistant.appliedSuccessTitle'),
      content: t('aiAssistant.appliedSuccessContent'),
    });
  };

  return (
    <div style={{ padding: '16px' }}>
      <Space orientation="vertical" style={{ width: '100%' }} size={16}>
        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            {t('aiAssistant.aiDescriptionLabel')}
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            {t('aiAssistant.aiDescriptionHint')}
          </div>
          <DebouncedTextArea
            placeholder={t('aiAssistant.aiDescriptionPlaceholder')}
            defaultValue={aiDescription}
            onChange={onAiDescriptionChange}
            rows={4}
            disabled={isLoading}
            delay={500}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            {t('aiAssistant.usageGuidanceLabel')}
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            {t('aiAssistant.usageGuidanceHint')}
          </div>
          <DebouncedTextArea
            placeholder={t('aiAssistant.usageGuidancePlaceholder')}
            defaultValue={aiUsageGuidance || ''}
            onChange={onAiUsageGuidanceChange}
            rows={3}
            disabled={isLoading}
            delay={500}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            {t('aiAssistant.usageExamplesLabel')}
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            {t('aiAssistant.usageExamplesHint')}
          </div>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder={t('aiAssistant.usageExamplesPlaceholder')}
            value={aiUsageExamples}
            onChange={onAiUsageExamplesChange}
            tokenSeparators={[',']}
            disabled={isLoading}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            {t('aiAssistant.tagsLabel')}
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            {t('aiAssistant.tagsHint')}
          </div>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder={t('aiAssistant.tagsPlaceholder')}
            value={aiTags}
            onChange={onAiTagsChange}
            tokenSeparators={[',']}
            disabled={isLoading}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#262626' }}>
            {t('aiAssistant.categoryLabel')}
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#8c8c8c' }}>
            {t('aiAssistant.categoryHint')}
          </div>
          <Select
            style={{ width: '100%' }}
            placeholder={t('aiAssistant.categoryPlaceholder')}
            value={category}
            onChange={onCategoryChange}
            disabled={isLoading}
          >
            <Select.Option value="finance">{t('aiAssistant.catFinance')}</Select.Option>
            <Select.Option value="math">{t('aiAssistant.catMathematics')}</Select.Option>
            <Select.Option value="statistics">{t('aiAssistant.catStatistics')}</Select.Option>
            <Select.Option value="business">{t('aiAssistant.catBusiness')}</Select.Option>
            <Select.Option value="science">{t('aiAssistant.catScience')}</Select.Option>
            <Select.Option value="engineering">{t('aiAssistant.catEngineering')}</Select.Option>
            <Select.Option value="other">{t('aiAssistant.catOther')}</Select.Option>
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
            {generating ? t('aiAssistant.generatingBtn') : t('aiAssistant.generateBtn')}
          </Button>
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>
          {t('aiAssistant.generateHint')}
        </div>
      </Space>

      {/* Preview Modal */}
      <Modal
        title={
          <Space>
            <BulbOutlined style={{ color: '#502D80' }} />
            <span>{t('aiAssistant.previewModalTitle')}</span>
          </Space>
        }
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        onOk={handleApplySuggestions}
        okText={t('aiAssistant.applyAllBtn')}
        cancelText={t('aiAssistant.cancelBtn')}
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
          <Space orientation="vertical" style={{ width: '100%' }} size={16}>
            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('aiAssistant.aiDescriptionLabel')}</Typography.Title>
              <Typography.Paragraph style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
                {suggestions.aiDescription}
              </Typography.Paragraph>
            </div>

            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('aiAssistant.usageGuidanceLabel')}</Typography.Title>
              <Typography.Paragraph style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
                {suggestions.aiUsageGuidance}
              </Typography.Paragraph>
            </div>

            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('aiAssistant.usageExamplesLabel')}</Typography.Title>
              <ul style={{ background: '#f5f5f5', padding: '12px 12px 12px 32px', borderRadius: 6, margin: 0 }}>
                {suggestions.aiUsageExamples.map((example: string, index: number) => (
                  <li key={index} style={{ marginBottom: 4 }}>{example}</li>
                ))}
              </ul>
            </div>

            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('aiAssistant.tagsLabel')}</Typography.Title>
              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
                {suggestions.aiTags.map((tag: string, index: number) => (
                  <span key={index} style={{
                    display: 'inline-block',
                    background: '#fff',
                    padding: '4px 12px',
                    borderRadius: 6,
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
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('aiAssistant.categoryLabel')}</Typography.Title>
              <Typography.Paragraph style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
                {suggestions.category}
              </Typography.Paragraph>
            </div>

            {suggestions.reasoning && (
              <div style={{ marginTop: 16, padding: 12, background: '#f0f5ff', borderRadius: 6, border: '1px solid #adc6ff' }}>
                <Typography.Text style={{ fontSize: 12, color: '#002766' }}>
                  <strong>{t('aiAssistant.aiReasoning')}</strong> {suggestions.reasoning}
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
            <span>{t('aiAssistant.questionsModalTitle')}</span>
          </Space>
        }
        open={showQuestions}
        onCancel={() => {
          setShowQuestions(false);
          setCurrentQuestions([]);
          setUserAnswers([]);
        }}
        onOk={handleAnswerQuestions}
        okText={t('aiAssistant.continueBtn')}
        cancelText={t('aiAssistant.cancelBtn')}
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
            {t('aiAssistant.questionsIntro')}
          </Typography.Text>
        </div>
        <Space orientation="vertical" style={{ width: '100%' }} size={16}>
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
                placeholder={t('aiAssistant.yourAnswerPlaceholder')}
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
