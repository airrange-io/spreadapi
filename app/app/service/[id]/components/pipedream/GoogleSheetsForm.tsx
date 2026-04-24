'use client';

import React, { useEffect, useState } from 'react';
import { Select, Input, Typography, Tooltip, Spin } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { PipedreamSource } from '@/lib/pipedream/types';

const { Text } = Typography;

interface Props {
  accountId: string;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}

// Provider-specific form for Google Sheets. Bypasses Pipedream's cascading
// configureProp flow (which defaults to a confusing drive → spreadsheet →
// sheet → range chain) and goes straight to the two questions that matter:
// which spreadsheet and which tab. Mirrors what listplus does in production.
//
// On save, `value` is { spreadsheetId, sheetName, range? }. Those names
// match what lib/pipedream/providers/google_sheets.backend.ts expects.
interface Spreadsheet {
  id: string;
  name: string;
}
interface SheetTab {
  title: string;
  sheetId: number;
}

const GoogleSheetsForm: React.FC<Props> = ({ accountId, value, onChange }) => {
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [sheetTabs, setSheetTabs] = useState<SheetTab[]>([]);
  const [loadingSpreadsheets, setLoadingSpreadsheets] = useState(false);
  const [loadingSheets, setLoadingSheets] = useState(false);

  const spreadsheetId = (value.spreadsheetId as string) || '';
  const sheetName = (value.sheetName as string) || '';
  const range = (value.range as string) || '';

  // Load spreadsheets once on mount.
  useEffect(() => {
    let cancelled = false;
    setLoadingSpreadsheets(true);
    (async () => {
      try {
        const url = new URL(
          '/api/datasource/pipedream/google-sheets',
          window.location.origin,
        );
        url.searchParams.set('action', 'spreadsheets');
        url.searchParams.set('accountId', accountId);
        const res = await fetch(url.toString());
        const data = await res.json();
        if (cancelled) return;
        if (data?.ok) setSpreadsheets(data.files || []);
      } finally {
        if (!cancelled) setLoadingSpreadsheets(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountId]);

  // Load sheet tabs whenever a spreadsheet is picked.
  useEffect(() => {
    if (!spreadsheetId) {
      setSheetTabs([]);
      return;
    }
    let cancelled = false;
    setLoadingSheets(true);
    (async () => {
      try {
        const url = new URL(
          '/api/datasource/pipedream/google-sheets',
          window.location.origin,
        );
        url.searchParams.set('action', 'sheets');
        url.searchParams.set('accountId', accountId);
        url.searchParams.set('spreadsheetId', spreadsheetId);
        const res = await fetch(url.toString());
        const data = await res.json();
        if (cancelled) return;
        if (data?.ok) setSheetTabs(data.sheets || []);
      } finally {
        if (!cancelled) setLoadingSheets(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountId, spreadsheetId]);

  const setSpreadsheet = (id: string | null) => {
    onChange({
      ...value,
      spreadsheetId: id || '',
      // Clear sheet when the spreadsheet changes — tab names don't carry over.
      sheetName: '',
    });
  };

  const setSheet = (name: string | null) => {
    onChange({ ...value, sheetName: name || '' });
  };

  const setRange = (r: string) => {
    onChange({ ...value, range: r });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <FieldLabel required tooltip="The spreadsheet to pull data from.">
          Spreadsheet
        </FieldLabel>
        <Select
          showSearch
          allowClear
          value={spreadsheetId || undefined}
          onChange={(v) => setSpreadsheet((v as string) || null)}
          placeholder={loadingSpreadsheets ? 'Loading your spreadsheets…' : 'Pick a spreadsheet'}
          notFoundContent={loadingSpreadsheets ? <Spin size="small" /> : 'No spreadsheets found'}
          loading={loadingSpreadsheets}
          style={{ width: '100%' }}
          filterOption={(input, option) =>
            String(option?.label || '').toLowerCase().includes(input.toLowerCase())
          }
          options={spreadsheets.map((s) => ({ value: s.id, label: s.name }))}
        />
      </div>

      {spreadsheetId && (
        <div>
          <FieldLabel required tooltip="Which tab inside the spreadsheet.">
            Sheet
          </FieldLabel>
          <Select
            showSearch
            allowClear
            value={sheetName || undefined}
            onChange={(v) => setSheet((v as string) || null)}
            placeholder={loadingSheets ? 'Loading tabs…' : 'Pick a sheet'}
            notFoundContent={loadingSheets ? <Spin size="small" /> : 'No sheets found'}
            loading={loadingSheets}
            style={{ width: '100%' }}
            options={sheetTabs.map((t) => ({ value: t.title, label: t.title }))}
          />
        </div>
      )}

      {sheetName && (
        <div>
          <FieldLabel tooltip='A1 notation, e.g. "A1:D200" or "A:Z". Leave blank to read the whole tab.'>
            Range <Text type="secondary" style={{ fontWeight: 400 }}>(optional)</Text>
          </FieldLabel>
          <Input
            value={range}
            onChange={(e) => setRange(e.target.value)}
            placeholder="A:Z"
          />
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
            The first row of the range is treated as column headers.
          </Text>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsForm;

export function isGoogleSheetsReady(value: Record<string, unknown>): boolean {
  return !!(value?.spreadsheetId && value?.sheetName);
}

export function defaultTableNameForSheet(
  source: PipedreamSource,
  sheetName: string | undefined,
): string {
  return sheetName || String(source.configuredProps?.sheetName || 'Sheet');
}

// ──────────────────────────────────────────────────────────────────────────

const FieldLabel: React.FC<{
  children: React.ReactNode;
  tooltip?: string;
  required?: boolean;
}> = ({ children, tooltip, required }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      fontWeight: 500,
      marginBottom: 4,
    }}
  >
    {required && <span style={{ color: '#ef4444' }}>*</span>}
    <span>{children}</span>
    {tooltip && (
      <Tooltip title={tooltip}>
        <InfoCircleOutlined style={{ color: '#9a9aae', fontSize: 12, cursor: 'help' }} />
      </Tooltip>
    )}
  </div>
);
