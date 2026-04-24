'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Input, Spin, Empty, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { PipedreamApp } from '@/lib/pipedream/types';

const { Text } = Typography;

interface Props {
  onSelect: (app: PipedreamApp) => void;
  initialQuery?: string;
}

// Inline visual app browser. Renders a search input and a grid of app tiles
// directly in the page (no nested modal). Used as the first step of the
// Pipedream source flow, then collapsed to a chip once an app is picked.
const PAGE_LIMIT = 60;

const AppBrowser: React.FC<Props> = ({ onSelect, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [apps, setApps] = useState<PipedreamApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    // Auto-focus the search field on first render so the user can start
    // typing immediately.
    const t = setTimeout(() => inputRef.current?.focus?.(), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const url = new URL('/api/datasource/pipedream/apps', window.location.origin);
          if (query.trim()) url.searchParams.set('q', query.trim());
          url.searchParams.set('limit', String(PAGE_LIMIT));
          const res = await fetch(url.toString());
          const data = await res.json();
          if (cancelled) return;
          if (data?.ok) {
            setApps(data.apps || []);
            setIsFallback(data.source === 'fallback');
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Input
        ref={inputRef}
        allowClear
        size="large"
        prefix={<SearchOutlined style={{ color: '#9a9aae' }} />}
        placeholder="Search by app name — Salesforce, HubSpot, Notion…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isFallback && (
        <Tag color="default" style={{ alignSelf: 'flex-start', fontSize: 10 }}>
          Pipedream search temporarily unavailable — showing local list
        </Tag>
      )}

      <div style={{ minHeight: 240 }}>
        {loading && apps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : apps.length === 0 ? (
          <Empty description="No apps match this search" style={{ padding: 24 }} />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 10,
            }}
          >
            {apps.map((app) => (
              <AppTile key={app.nameSlug} app={app} onClick={() => onSelect(app)} />
            ))}
          </div>
        )}
      </div>

      <Text type="secondary" style={{ fontSize: 11 }}>
        Powered by Pipedream Connect — 3,000+ apps available.
      </Text>
    </div>
  );
};

export default AppBrowser;

// ──────────────────────────────────────────────────────────────────────────
// One tile per app. Logo where available, coloured initial-letter avatar
// fallback so even apps without a remote logo look intentional.
// ──────────────────────────────────────────────────────────────────────────

const PALETTE: Array<[string, string]> = [
  ['#1890ff', '#096dd9'],
  ['#52c41a', '#389e0d'],
  ['#722ed1', '#531dab'],
  ['#eb2f96', '#c41d7f'],
  ['#fa8c16', '#d46b08'],
  ['#13c2c2', '#08979c'],
  ['#faad14', '#d48806'],
  ['#f5222d', '#cf1322'],
];

export function colourFor(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

const AppTile: React.FC<{ app: PipedreamApp; onClick: () => void }> = ({ app, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const [from, to] = colourFor(app.name || app.nameSlug);
  const initial = (app.name || app.nameSlug || '?').charAt(0).toUpperCase();
  const showLogo = !!app.imgSrc && !imgError;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '10px 12px',
        border: '1px solid #e9e9ef',
        borderRadius: 8,
        background: '#fff',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#9133E8';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(145, 51, 232, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e9e9ef';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: showLogo ? '#f0f0f0' : `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {showLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={app.imgSrc as string}
            alt={app.name}
            onError={() => setImgError(true)}
            style={{ width: 24, height: 24, objectFit: 'contain' }}
          />
        ) : (
          initial
        )}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: '#1a1a2e',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {app.name}
        </div>
        {app.description && (
          <div
            style={{
              fontSize: 11,
              color: '#9a9aae',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {app.description}
          </div>
        )}
      </div>
    </div>
  );
};
