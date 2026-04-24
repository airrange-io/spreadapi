'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Input, InputNumber, Select, Switch, Spin, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { PipedreamComponent, PipedreamProp } from '@/lib/pipedream/types';

const { Text } = Typography;

interface Props {
  componentId: string;
  initialComponent: PipedreamComponent;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  // Hidden-by-default app prop is injected by the parent via accountId;
  // the form doesn't need to render it.
  hiddenPropNames?: Set<string>;
}

// Renders a dynamic form from a Pipedream component's configurableProps.
// Supports:
//   • basic types (string, integer, boolean)
//   • static options (dropdown)
//   • remoteOptions  → lazy-fetch from /configure-prop on focus
//   • reloadProps    → refetch the schema via /configure-prop when value changes
//
// Keeps the component schema as local state so reloadProps can replace it in
// place without remounting inputs the user has already filled in.
const ConfigurableForm: React.FC<Props> = ({
  componentId,
  initialComponent,
  value,
  onChange,
  hiddenPropNames,
}) => {
  const [component, setComponent] = useState<PipedreamComponent>(initialComponent);
  const [reloadingKey, setReloadingKey] = useState<string | null>(null);
  const [dynamicPropsId, setAsyncHandle] = useState<string | undefined>(undefined);

  // When the selected action changes externally, reset the schema.
  useEffect(() => {
    setComponent(initialComponent);
    setAsyncHandle(undefined);
  }, [initialComponent]);

  const visibleProps = useMemo(
    () =>
      (component.configurableProps || []).filter((p) =>
        !hiddenPropNames?.has(p.name) && p.type !== 'app',
      ),
    [component, hiddenPropNames],
  );

  const updateValue = useCallback(
    async (propName: string, nextValue: unknown, prop: PipedreamProp) => {
      const next = { ...value, [propName]: nextValue };
      onChange(next);

      // If the prop is flagged reloadProps, fetch an updated schema so
      // downstream props can appear/change. `dynamicPropsId` carries the
      // previous response ID so Pipedream can correlate the chain.
      if (prop.reloadProps) {
        setReloadingKey(propName);
        try {
          const res = await fetch('/api/datasource/pipedream/configure-prop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'reload',
              componentId,
              configuredProps: next,
              dynamicPropsId,
            }),
          });
          const data = await res.json();
          if (data?.ok && Array.isArray(data.configurableProps)) {
            setComponent((c) => ({ ...c, configurableProps: data.configurableProps }));
            if (data.dynamicPropsId) setAsyncHandle(data.dynamicPropsId);
          }
        } catch {
          // Silently ignore — the user can fix up the form manually.
        } finally {
          setReloadingKey(null);
        }
      }
    },
    [dynamicPropsId, componentId, onChange, value],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {visibleProps.map((prop) => (
        <PropRenderer
          key={prop.name}
          prop={prop}
          value={value[prop.name]}
          componentId={componentId}
          configuredProps={value}
          reloading={reloadingKey === prop.name}
          onChange={(v) => updateValue(prop.name, v, prop)}
        />
      ))}
      {visibleProps.length === 0 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          No additional configuration required.
        </Text>
      )}
    </div>
  );
};

export default ConfigurableForm;

// ──────────────────────────────────────────────────────────────────────────
// Single-prop renderer. Picks an input element based on prop.type + metadata.
// ──────────────────────────────────────────────────────────────────────────

interface PropRendererProps {
  prop: PipedreamProp;
  value: unknown;
  componentId: string;
  configuredProps: Record<string, unknown>;
  reloading: boolean;
  onChange: (value: unknown) => void;
}

const PropRenderer: React.FC<PropRendererProps> = ({
  prop,
  value,
  componentId,
  configuredProps,
  reloading,
  onChange,
}) => {
  const [remoteOptions, setRemoteOptions] = useState<
    Array<{ label: string; value: string | number | boolean }> | null
  >(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteTried, setRemoteTried] = useState(false);

  const fetchRemote = useCallback(async () => {
    if (!prop.remoteOptions || remoteLoading) return;
    setRemoteLoading(true);
    try {
      const res = await fetch('/api/datasource/pipedream/configure-prop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'options',
          componentId,
          propName: prop.name,
          configuredProps,
        }),
      });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.options)) {
        setRemoteOptions(data.options);
      } else {
        setRemoteOptions([]);
      }
      setRemoteTried(true);
    } finally {
      setRemoteLoading(false);
    }
  }, [componentId, configuredProps, prop.remoteOptions, prop.name, remoteLoading]);

  // For dropdowns with remoteOptions, fetch once on first focus.
  const handleFocus = () => {
    if (prop.remoteOptions && !remoteTried) fetchRemote();
  };

  const label = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
      {!prop.optional && <span style={{ color: '#ef4444' }}>*</span>}
      <span>{prop.label || prop.name}</span>
      {prop.description && (
        <Tooltip title={prop.description}>
          <InfoCircleOutlined style={{ color: '#9a9aae', fontSize: 12, cursor: 'help' }} />
        </Tooltip>
      )}
      {reloading && <Spin size="small" />}
    </div>
  );

  const hasStaticOptions = Array.isArray(prop.options) && prop.options.length > 0;
  const staticOptions = hasStaticOptions
    ? (prop.options as any[]).map((o) =>
        typeof o === 'object' ? o : { label: String(o), value: o },
      )
    : null;

  let input: React.ReactNode;
  if (prop.remoteOptions || hasStaticOptions) {
    input = (
      <Select
        showSearch
        allowClear
        value={value as any}
        onChange={(v) => onChange(v)}
        onFocus={handleFocus}
        placeholder={remoteLoading ? 'Loading…' : 'Choose'}
        loading={remoteLoading}
        options={remoteOptions || staticOptions || []}
        style={{ width: '100%' }}
        filterOption={(input, option) =>
          String(option?.label || '').toLowerCase().includes(input.toLowerCase())
        }
      />
    );
  } else if (prop.type === 'boolean') {
    input = <Switch checked={!!value} onChange={(v) => onChange(v)} />;
  } else if (prop.type === 'integer') {
    input = (
      <InputNumber
        value={(value as number) ?? undefined}
        onChange={(v) => onChange(v)}
        style={{ width: 240 }}
      />
    );
  } else if (prop.type === 'string[]') {
    input = (
      <Select
        mode="tags"
        value={(Array.isArray(value) ? value : []) as string[]}
        onChange={(v) => onChange(v)}
        placeholder="Add values, press Enter after each"
        style={{ width: '100%' }}
      />
    );
  } else {
    input = (
      <Input
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={prop.default != null ? String(prop.default) : undefined}
      />
    );
  }

  return (
    <div>
      {label}
      {input}
    </div>
  );
};
