'use client';

import React, { useEffect, useState } from 'react';
import { Select, Spin, Typography } from 'antd';
import type { PipedreamComponent } from '@/lib/pipedream/types';

const { Text } = Typography;

interface Props {
  appSlug: string;
  value: string | null;
  onChange: (actionId: string | null, component: PipedreamComponent | null) => void;
}

// Lists action-type components for the selected app. On first load, if the
// providers registry suggests a default action (e.g. google_sheets → list-
// sheet-values), auto-select it. User can still pick any other.
const ActionPicker: React.FC<Props> = ({ appSlug, value, onChange }) => {
  const [components, setComponents] = useState<PipedreamComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [defaultActionId, setDefaultActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!appSlug) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const url = new URL('/api/datasource/pipedream/components', window.location.origin);
        url.searchParams.set('app', appSlug);
        const res = await fetch(url.toString());
        const data = await res.json();
        if (cancelled) return;
        if (data?.ok) {
          setComponents(data.components || []);
          setDefaultActionId(data.defaultActionId || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appSlug]);

  // Auto-pick the default action when nothing is selected yet.
  useEffect(() => {
    if (value || !defaultActionId) return;
    const component = components.find((c) => c.key === defaultActionId);
    if (component) onChange(component.key, component);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultActionId, components, value]);

  return (
    <Select
      showSearch
      value={value || undefined}
      onChange={(v) => {
        const component = components.find((c) => c.key === v) || null;
        onChange((v as string) || null, component);
      }}
      loading={loading}
      placeholder={loading ? 'Loading actions…' : 'Pick an action'}
      notFoundContent={loading ? <Spin size="small" /> : 'No actions available for this app'}
      style={{ width: '100%' }}
      filterOption={(input, option) =>
        String(option?.label || '').toLowerCase().includes(input.toLowerCase())
      }
      options={components.map((c) => ({
        value: c.key,
        label: (
          <div>
            <div style={{ fontWeight: 500 }}>{c.name}</div>
            {c.description && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {c.description}
              </Text>
            )}
          </div>
        ),
      })) as any}
    />
  );
};

export default ActionPicker;
