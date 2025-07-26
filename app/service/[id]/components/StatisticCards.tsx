'use client';

import React from 'react';
import { Card, Statistic } from 'antd';
import { SwapOutlined, SafetyOutlined, FileTextOutlined } from '@ant-design/icons';

type ActiveCard = 'parameters' | 'detail' | 'tokens' | null;

interface StatisticCardsProps {
  activeCard: ActiveCard;
  inputsCount: number;
  outputsCount: number;
  tokenCount: number;
  onCardClick: (cardType: ActiveCard) => void;
}

const StatisticCards: React.FC<StatisticCardsProps> = ({
  activeCard,
  inputsCount,
  outputsCount,
  tokenCount,
  onCardClick,
}) => {
  const getCardStyle = (cardType: ActiveCard) => {
    const baseStyle = {
      flex: 1,
      cursor: 'pointer',
      padding: 6,
      borderRadius: '8px',
      borderColor: 'transparent',
      backgroundColor: activeCard === cardType ? '#E2E3E1' : '#f2f2f2',
      transition: 'all 0.2s'
    };

    if (activeCard === cardType) {
      return {
        ...baseStyle,
        backgroundColor: '#E2E3E1'
      };
    }

    return baseStyle;
  };

  const getCardBodyStyle = () => ({
    padding: '6px 12px',
    borderRadius: '8px',
  });

  const getStatisticValueStyle = (cardType: ActiveCard, originalColor: string) => {
    if (activeCard === cardType) {
      return { color: originalColor, fontSize: 18 };
    }
    return { color: '#2B2A35', fontSize: 18 };
  };

  return (
    <div style={{
      padding: '16px',
      flex: '0 0 auto'
    }}>
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <Card
          size="small"
          style={{
            ...getCardStyle('parameters'),
            flex: '0 0 calc(33.33% - 5.33px)',
          }}
          styles={{ body: getCardBodyStyle() }}
          hoverable
          onClick={() => onCardClick('parameters')}
        >
          <Statistic
            title="API Parameters"
            value={inputsCount + outputsCount}
            prefix={<SwapOutlined style={{ color: '#858585' }} />}
            valueStyle={getStatisticValueStyle('parameters', '#4F2D7F')}
            suffix={
              <span style={{ fontSize: '12px', color: '#999', fontWeight: 'normal' }}>
                {inputsCount > 0 || outputsCount > 0 ? `(${inputsCount}/${outputsCount})` : ''}
              </span>
            }
          />
        </Card>

        <Card
          size="small"
          style={{
            ...getCardStyle('tokens'),
            flex: '0 0 calc(33.33% - 5.33px)',
          }}
          styles={{ body: getCardBodyStyle() }}
          hoverable
          onClick={() => onCardClick('tokens')}
        >
          <Statistic
            title="API Test"
            value={tokenCount}
            prefix={<SafetyOutlined style={{ color: '#858585' }} />}
            valueStyle={getStatisticValueStyle('tokens', '#2B2A35')}
          />
        </Card>

        <Card
          size="small"
          style={{
            ...getCardStyle('detail'),
            flex: '0 0 calc(33.33% - 5.33px)',
          }}
          styles={{ body: getCardBodyStyle() }}
          hoverable
          onClick={() => onCardClick('detail')}
        >
          <Statistic
            title="Settings"
            value={'---'}
            prefix={<FileTextOutlined style={{ color: '#858585' }} />}
            valueStyle={getStatisticValueStyle('detail', '#4F2D7F')}
          />
        </Card>
      </div>
    </div>
  );
};

export default StatisticCards;