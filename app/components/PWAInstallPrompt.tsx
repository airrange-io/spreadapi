'use client';

import { useEffect, useState } from 'react';
import { Button, App } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const { notification } = App.useApp();
  const { t } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [supportsPWA, setSupportsPWA] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setSupportsPWA(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      notification.success({ message: t('pwa.installSuccess') });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [notification, t]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Don't show anything if already installed or not supported
  if (isInstalled || !supportsPWA || !installPrompt) {
    return null;
  }

  return (
    <Button
      type="primary"
      icon={<AppstoreAddOutlined />}
      onClick={handleInstallClick}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {t('pwa.installApp')}
    </Button>
  );
}
