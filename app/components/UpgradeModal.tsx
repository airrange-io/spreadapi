'use client';

import React from 'react';
import { Modal, Typography, Button } from 'antd';
import { CrownOutlined, CheckOutlined } from '@ant-design/icons';
import { type LicenseType } from '@/lib/licensing';

const { Title, Text } = Typography;

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentLicense: LicenseType;
  title?: string;
}

const STRIPE_LINKS = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_LINK || '',
  premium: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_LINK || '',
  extraCalls10k: process.env.NEXT_PUBLIC_STRIPE_EXTRA_CALLS_10K_LINK || '',
};

interface PlanConfig {
  key: string;
  name: string;
  price: string;
  color: string;
  features: string[];
  stripeLink: string;
  buttonLabel: string;
}

const allPlans: Record<string, PlanConfig> = {
  free: {
    key: 'free',
    name: 'Free',
    price: '€0',
    color: '#8c8c8c',
    features: ['1 API', '100 calls/month', '1 MB file size'],
    stripeLink: '',
    buttonLabel: 'Select',
  },
  pro: {
    key: 'pro',
    name: 'Pro',
    price: '€99',
    color: '#722ed1',
    features: ['3 APIs', '1,000 calls/month', '3 MB file size'],
    stripeLink: STRIPE_LINKS.pro,
    buttonLabel: 'Select',
  },
  premium: {
    key: 'premium',
    name: 'Premium',
    price: '€299',
    color: '#d48806',
    features: ['Unlimited APIs', '10,000 calls/month', '25 MB file size'],
    stripeLink: STRIPE_LINKS.premium,
    buttonLabel: 'Select',
  },
  extraCalls: {
    key: 'extraCalls',
    name: '+10K Calls',
    price: '€79',
    color: '#1890ff',
    features: ['Additional 10,000 API calls per month'],
    stripeLink: STRIPE_LINKS.extraCalls10k,
    buttonLabel: 'Add',
  },
};

interface PlanCardProps {
  plan: PlanConfig;
  isCurrent: boolean;
  isDowngrade: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, isCurrent, isDowngrade, onSelect }: PlanCardProps) {
  const disabled = isDowngrade && !isCurrent;
  const isClickable = !isCurrent && !disabled;

  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      {/* Current Plan indicator outside card */}
      {isCurrent && (
        <div style={{
          position: 'absolute',
          top: -10,
          left: 16,
          background: plan.color,
          color: '#fff',
          fontSize: 11,
          fontWeight: 600,
          padding: '2px 10px',
          borderRadius: 4,
          zIndex: 1,
        }}>
          CURRENT PLAN
        </div>
      )}

      <div
        onClick={isClickable ? onSelect : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '20px 24px',
          borderRadius: 12,
          border: isCurrent ? `2px solid ${plan.color}` : '1px solid #e8e8e8',
          background: isCurrent ? `${plan.color}06` : disabled ? '#fafafa' : '#fff',
          opacity: disabled ? 0.45 : 1,
          gap: 24,
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (isClickable) {
            e.currentTarget.style.borderColor = plan.color;
            e.currentTarget.style.background = `${plan.color}08`;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (isClickable) {
            e.currentTarget.style.borderColor = '#e8e8e8';
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {/* Price - fixed width, left aligned */}
        <div style={{ width: 70, flexShrink: 0, textAlign: 'center' }}>
          <div style={{
            fontSize: 26,
            fontWeight: 700,
            color: disabled ? '#bfbfbf' : '#262626',
            lineHeight: 1,
          }}>
            {plan.price}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>month</div>
        </div>

        {/* Name + Features */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 600,
            fontSize: 16,
            color: disabled ? '#bfbfbf' : plan.color,
            marginBottom: 6,
          }}>
            {plan.name}
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 16px',
          }}>
            {plan.features.map((feature, i) => (
              <span
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 13,
                  color: disabled ? '#bfbfbf' : '#595959',
                }}
              >
                <CheckOutlined style={{
                  color: disabled ? '#d9d9d9' : plan.color,
                  fontSize: 11,
                }} />
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpgradeModal({
  open,
  onClose,
  currentLicense,
  title,
}: UpgradeModalProps) {
  const handleSelect = (stripeLink: string) => {
    if (stripeLink) {
      window.open(stripeLink, '_blank');
    }
  };

  const defaultTitle = 'Upgrade Your Plan';

  const licenseOrder: LicenseType[] = ['free', 'pro', 'premium'];
  const currentIndex = licenseOrder.indexOf(currentLicense);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      centered
      styles={{
        body: { padding: '28px 32px' }
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <CrownOutlined style={{ fontSize: 36, color: '#faad14', marginBottom: 8 }} />
        <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
          {title || defaultTitle}
        </Title>
      </div>

      {/* Plans */}
      <div style={{ marginBottom: 8 }}>
        <PlanCard
          plan={allPlans.free}
          isCurrent={currentLicense === 'free'}
          isDowngrade={currentIndex > 0}
          onSelect={() => {}}
        />
        <PlanCard
          plan={allPlans.pro}
          isCurrent={currentLicense === 'pro'}
          isDowngrade={currentIndex > 1}
          onSelect={() => handleSelect(allPlans.pro.stripeLink)}
        />
        <PlanCard
          plan={allPlans.premium}
          isCurrent={currentLicense === 'premium'}
          isDowngrade={false}
          onSelect={() => handleSelect(allPlans.premium.stripeLink)}
        />
      </div>

      {/* Add-ons (disabled for now) */}
      <div style={{ marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, marginBottom: 10, display: 'block' }}>
          ADD-ONS
        </Text>
        <PlanCard
          plan={allPlans.extraCalls}
          isCurrent={false}
          isDowngrade={true}
          onSelect={() => {}}
        />
      </div>
    </Modal>
  );
}
