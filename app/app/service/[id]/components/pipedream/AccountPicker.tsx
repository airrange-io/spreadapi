'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Select, Space, Typography, Alert, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { PipedreamAccount } from '@/lib/pipedream/types';

const { Text } = Typography;

interface Props {
  appSlug: string;
  value: string | null;
  onChange: (accountId: string | null, account: PipedreamAccount | null) => void;
}

// Lists the user's Pipedream-Connect accounts for a given app. "Connect new"
// opens the Pipedream-hosted OAuth flow in a popup window, then polls the
// accounts endpoint until the new account appears (listplus-proven pattern).
//
// Premium gate: POST /connect-token returns 403 {error:'premium_required'}
// for non-Premium users. The UI catches that and shows a gentle upgrade
// prompt instead of opening the popup.
const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 120_000;

const AccountPicker: React.FC<Props> = ({ appSlug, value, onChange }) => {
  const { notification } = App.useApp();
  const [accounts, setAccounts] = useState<PipedreamAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [premiumBlocked, setPremiumBlocked] = useState(false);
  const popupRef = useRef<Window | null>(null);

  const loadAccounts = useCallback(async (): Promise<PipedreamAccount[]> => {
    const url = new URL('/api/datasource/pipedream/accounts', window.location.origin);
    url.searchParams.set('app', appSlug);
    const res = await fetch(url.toString());
    const data = await res.json();
    if (data?.ok) {
      setAccounts(data.accounts);
      return data.accounts as PipedreamAccount[];
    }
    return [];
  }, [appSlug]);

  useEffect(() => {
    if (!appSlug) return;
    setLoading(true);
    loadAccounts().finally(() => setLoading(false));
  }, [appSlug, loadAccounts]);

  const startConnect = useCallback(async () => {
    setConnecting(true);
    setPremiumBlocked(false);
    try {
      const res = await fetch('/api/datasource/pipedream/connect-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.status === 403 && data?.error === 'premium_required') {
        setPremiumBlocked(true);
        return;
      }
      if (!data?.ok || !data.connectLinkUrl) {
        notification.error({ message: data?.error || 'Failed to start connect flow' });
        return;
      }

      const url = new URL(data.connectLinkUrl);
      url.searchParams.set('app', appSlug);
      const before = await loadAccounts();
      const existingIds = new Set(before.map((a) => a.id));

      popupRef.current = window.open(
        url.toString(),
        'pipedream-connect',
        'width=600,height=740,left=' +
          (window.screenX + (window.outerWidth - 600) / 2) +
          ',top=' +
          (window.screenY + (window.outerHeight - 740) / 2),
      );

      const started = Date.now();
      const poll = async () => {
        if (!popupRef.current || popupRef.current.closed) {
          // Popup closed by user. One last check before giving up.
          const latest = await loadAccounts();
          const freshlyAdded = latest.find((a) => !existingIds.has(a.id));
          if (freshlyAdded) {
            onChange(freshlyAdded.id, freshlyAdded);
          }
          setConnecting(false);
          return;
        }
        if (Date.now() - started > POLL_TIMEOUT_MS) {
          try { popupRef.current?.close(); } catch {}
          notification.warning({
            message: 'Connect flow timed out',
            description: 'Try again — the window was left open too long.',
          });
          setConnecting(false);
          return;
        }
        const latest = await loadAccounts();
        const freshlyAdded = latest.find((a) => !existingIds.has(a.id));
        if (freshlyAdded) {
          try { popupRef.current?.close(); } catch {}
          onChange(freshlyAdded.id, freshlyAdded);
          setConnecting(false);
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      };
      setTimeout(poll, POLL_INTERVAL_MS);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to connect';
      notification.error({ message: msg });
      setConnecting(false);
    }
  }, [appSlug, loadAccounts, notification, onChange]);

  return (
    <div>
      <Space.Compact style={{ width: '100%' }}>
        <Select
          value={value || undefined}
          onChange={(v) => {
            const account = accounts.find((a) => a.id === v) || null;
            onChange((v as string) || null, account);
          }}
          loading={loading}
          placeholder={accounts.length ? 'Pick an account' : 'No accounts connected'}
          options={accounts.map((a) => ({
            value: a.id,
            label: a.name + (a.healthy === false ? ' (reconnect needed)' : ''),
          }))}
          style={{ flex: 1 }}
          notFoundContent="No accounts connected yet"
        />
        <Button icon={<PlusOutlined />} onClick={startConnect} loading={connecting}>
          Connect new
        </Button>
      </Space.Compact>
      {premiumBlocked && (
        <Alert
          type="warning"
          showIcon
          style={{ marginTop: 8 }}
          message="Premium required"
          description="Connecting apps via Pipedream is a Premium feature. Upgrade your plan to connect new accounts."
        />
      )}
      {accounts.some((a) => a.healthy === false) && (
        <Text type="warning" style={{ display: 'block', marginTop: 6, fontSize: 11 }}>
          An account shows as unhealthy — re-run the connect flow if refreshes fail.
        </Text>
      )}
    </div>
  );
};

export default AccountPicker;
