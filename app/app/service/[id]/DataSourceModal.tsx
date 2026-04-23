'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Modal,
  Button,
  Space,
  Input,
  Select,
  Radio,
  Table,
  Tag,
  Typography,
  Alert,
  Tooltip,
  App,
} from 'antd';
import {
  DatabaseOutlined,
  ApiOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  CopyOutlined,
  DatabaseFilled,
} from '@ant-design/icons';
import { generateParameterId } from '@/lib/generateParameterId';
import { generateWebhookToken } from '@/lib/generateWebhookToken';

const { Text } = Typography;

export type DataSourceType = 'json' | 'rest' | 'csv';
export type ColumnDataType = 'string' | 'number' | 'boolean' | 'date';

export interface DataSourceColumn {
  name: string;
  displayName?: string;
  dataType: ColumnDataType;
}

export interface JsonSource {
  type: 'json';
  url: string;
  jsonPath?: string;
}

export interface RestSource {
  type: 'rest';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  requestBody?: string;
  jsonPath?: string;
}

export interface CsvSource {
  type: 'csv';
  url: string;
  hasHeader: boolean;
  delimiter?: string;
}

export type DataSourceConfig = JsonSource | RestSource | CsvSource;

export type StorageMode = 'remote' | 'snapshot';

export interface DataSourceDefinition {
  id: string;
  tableName: string;
  storageMode: StorageMode;
  source: DataSourceConfig;
  columns?: DataSourceColumn[];
  webhookToken?: string;
  maxRows?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface DataSourceModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * `freshRows` is only passed when the user clicked "Fetch preview" in this
   * session. Parent uses it to seed Redis on Snapshot create — `undefined`
   * means "don't overwrite existing rows" (e.g. display-name-only edits).
   */
  onSave: (
    definition: DataSourceDefinition,
    options?: { freshRows?: Record<string, unknown>[] },
  ) => void;
  initialValue?: DataSourceDefinition | null;
  existingTableNames?: string[];
  serviceId?: string;
  /** When false, the Snapshot delivery mode is shown as a Premium-gated option. */
  canUseSnapshot?: boolean;
}

interface PreviewResponse {
  ok: boolean;
  error?: string;
  stage?: string;
  rows?: Record<string, unknown>[];
  columns?: { name: string; dataType: ColumnDataType }[];
  totalRowsFetched?: number;
}

/* ---------- tokens ---------- */

const TOKEN = {
  purple: '#9133E8',
  purpleSoft: '#f5efff',
  purpleSoft2: '#ede6ff',
  border: '#e9e9ef',
  text: '#1a1a2e',
  textMuted: '#6b6b85',
  textSubtle: '#9a9aae',
  bg: '#fafafc',
  sectionRule: '#eeeef2',
  green: '#16a34a',
  amber: '#f59e0b',
};

/* ---------- preview / schema options ---------- */

const PREVIEW_ROW_OPTIONS = [
  { value: 10,    label: '10 rows' },
  { value: 50,    label: '50 rows' },
  { value: 200,   label: '200 rows' },
  { value: 1000,  label: '1 000 rows' },
  { value: 10000, label: 'All (max 10 000)' },
];
const DEFAULT_PREVIEW_ROWS = 10;

const MAX_REFRESH_ROWS_OPTIONS = [
  { value: 500,    label: '500' },
  { value: 1000,   label: '1 000' },
  { value: 5000,   label: '5 000 (default)' },
  { value: 10000,  label: '10 000' },
  { value: 50000,  label: '50 000' },
  { value: 100000, label: '100 000' },
];
const DEFAULT_MAX_REFRESH_ROWS = 5000;

const DATA_TYPE_OPTIONS: { value: ColumnDataType; label: string }[] = [
  { value: 'string',  label: 'Text' },
  { value: 'number',  label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date',    label: 'Date' },
];

type SourceCardKey = 'url' | 'csv' | 'pipedream';

const SOURCE_CARDS: {
  value: SourceCardKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledReason?: string;
}[] = [
  { value: 'url',       label: 'JSON / REST API', description: 'Public JSON file or your own API', icon: <ApiOutlined /> },
  { value: 'csv',       label: 'CSV URL',   description: 'Any CSV file',                   icon: <FileTextOutlined /> },
  { value: 'pipedream', label: 'Connected apps', description: 'Salesforce, Airtable, 3k+ apps', icon: <ThunderboltOutlined />, disabled: true },
];

/* ---------- helpers ---------- */

function sanitizeTableName(raw: string): string {
  return raw.replace(/[^A-Za-z0-9_]/g, '_').replace(/^(\d)/, '_$1').slice(0, 40) || 'Table';
}

function defaultTableNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
    return sanitizeTableName(last.replace(/\.[a-z]+$/i, ''));
  } catch {
    return 'Table';
  }
}

/* ---------- small building blocks ---------- */

function SectionHeader({
  num,
  title,
  right,
}: {
  num: number | string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span
        style={{
          width: 22,
          height: 22,
          background: TOKEN.text,
          color: '#fff',
          borderRadius: '50%',
          fontSize: 11,
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {num}
      </span>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: TOKEN.text }}>{title}</h3>
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </div>
  );
}

function DisclosureLink({
  open,
  onClick,
  label,
  summary,
}: {
  open: boolean;
  onClick: () => void;
  label: string;
  summary?: string | null;
}) {
  const [hover, setHover] = useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        display: 'inline-block',
        fontSize: 12.5,
        color: TOKEN.purple,
        cursor: 'pointer',
        userSelect: 'none',
        padding: '4px 0',
        fontWeight: 500,
        textDecoration: hover || open ? 'underline' : 'none',
        textUnderlineOffset: 3,
      }}
    >
      {label}
      {summary && (
        <span style={{ fontWeight: 400, marginLeft: 6, fontSize: 11.5, color: TOKEN.textSubtle, textDecoration: 'none' }}>
          ({summary})
        </span>
      )}
    </span>
  );
}

function FieldLabel({
  children,
  tooltip,
  required,
}: {
  children: React.ReactNode;
  tooltip?: string;
  required?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
      {required && <span style={{ color: '#ef4444' }}>*</span>}
      <span>{children}</span>
      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoCircleOutlined style={{ color: TOKEN.textSubtle, fontSize: 12, cursor: 'help' }} />
        </Tooltip>
      )}
    </div>
  );
}

function SourceCard({
  card,
  active,
  onClick,
}: {
  card: (typeof SOURCE_CARDS)[number];
  active: boolean;
  onClick: () => void;
}) {
  const disabled = !!card.disabled;
  const body = (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        border: `1px solid ${active ? TOKEN.purple : TOKEN.border}`,
        background: active ? TOKEN.purpleSoft : disabled ? '#f9fafb' : '#fff',
        boxShadow: active ? `0 0 0 3px rgba(145, 51, 232, 0.08)` : 'none',
        borderRadius: 8,
        padding: '12px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.12s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: disabled ? 0.6 : 1,
        position: 'relative',
      }}
    >
      <span
        style={{
          color: active ? TOKEN.purple : TOKEN.textMuted,
          display: 'inline-flex',
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {card.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13 }}>
          <span>{card.label}</span>
          {disabled && card.disabledReason && (
            <Tag
              color="default"
              style={{
                marginInlineEnd: 0,
                marginLeft: 'auto',
                fontSize: 10,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {card.disabledReason}
            </Tag>
          )}
        </div>
        <div style={{ fontSize: 11.5, color: TOKEN.textSubtle, marginTop: 2 }}>{card.description}</div>
      </div>
    </div>
  );
  return disabled ? <Tooltip title={card.disabledReason || 'Not available'}>{body}</Tooltip> : body;
}

function WebhookBlock({ url }: { url: string }) {
  const { notification } = App.useApp();
  const curl = `curl -X POST '${url}'`;

  const onCopy = (value: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value).then(
        () => notification.success({ message: `${label} copied` }),
        () => notification.error({ message: 'Copy failed' }),
      );
    }
  };

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        background: '#fff',
        border: `1px solid ${TOKEN.border}`,
        borderRadius: 6,
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: TOKEN.textSubtle,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}
      >
        Refresh webhook URL
      </div>
      <Space.Compact style={{ width: '100%', marginBottom: 10 }}>
        <Input
          value={url}
          readOnly
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, background: TOKEN.bg }}
        />
        <Button icon={<CopyOutlined />} onClick={() => onCopy(url, 'URL')}>
          Copy
        </Button>
      </Space.Compact>

      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: TOKEN.textSubtle,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}
      >
        Example — trigger a re-fetch
      </div>
      <pre
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          padding: '10px 12px',
          background: '#1a1a2e',
          color: '#e8e8f0',
          borderRadius: 5,
          overflowX: 'auto',
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {curl}
      </pre>

      <Text type="secondary" style={{ display: 'block', fontSize: 11.5, marginTop: 10, lineHeight: 1.55 }}>
        When you update the data at your source URL, call this webhook to have SpreadAPI re-fetch it into Redis.
        Wire it into any scheduler (Zapier, Power Automate, GitHub Actions, cron, …). Protect this URL — anyone
        with the token can trigger a refresh.
      </Text>
    </div>
  );
}

/* ---------- main component ---------- */

const DataSourceModal: React.FC<DataSourceModalProps> = ({
  open,
  onClose,
  onSave,
  initialValue,
  existingTableNames = [],
  serviceId,
  canUseSnapshot = true,
}) => {
  const { notification } = App.useApp();

  const isEdit = !!initialValue;

  // Internal type: 'rest' covers both legacy 'json' sources and the merged
  // URL card. CSV stays separate because it has its own parsing options.
  const [type, setType] = useState<'rest' | 'csv'>('rest');
  const [url, setUrl] = useState('');
  const [jsonPath, setJsonPath] = useState('');
  const [method, setMethod] = useState<RestSource['method']>('GET');
  const [headersText, setHeadersText] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [csvHasHeader, setCsvHasHeader] = useState(true);
  const [csvDelimiter, setCsvDelimiter] = useState(',');

  const uiCard: SourceCardKey = type === 'csv' ? 'csv' : 'url';
  const [tableName, setTableName] = useState('');
  const [tableNameTouched, setTableNameTouched] = useState(false);
  const [previewRowCount, setPreviewRowCount] = useState<number>(DEFAULT_PREVIEW_ROWS);
  const [maxRefreshRows, setMaxRefreshRows] = useState<number>(DEFAULT_MAX_REFRESH_ROWS);
  const [storageMode, setStorageMode] = useState<StorageMode>('remote');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<DataSourceColumn[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [didFetchInSession, setDidFetchInSession] = useState(false);

  const [showRequestOptions, setShowRequestOptions] = useState(false);
  const [showColumnDefs, setShowColumnDefs] = useState(false);

  // Id + token are stable across the modal session so the webhook URL shown
  // in Snapshot mode matches what gets saved.
  const idRef = useRef<string>('');
  const tokenRef = useRef<string>('');

  const hasPreview = columns.length > 0;

  useEffect(() => {
    if (!open) return;
    if (initialValue) {
      // Legacy 'json' sources map to the URL card (type 'rest', default GET).
      const srcType = initialValue.source.type;
      setType(srcType === 'csv' ? 'csv' : 'rest');
      setUrl(initialValue.source.url);
      const s: any = initialValue.source;
      setJsonPath(s.jsonPath ?? '');
      setMethod(srcType === 'rest' ? (s.method ?? 'GET') : 'GET');
      setHeadersText(
        srcType === 'rest' && s.headers
          ? Object.entries(s.headers as Record<string, string>).map(([k, v]) => `${k}: ${v}`).join('\n')
          : '',
      );
      setRequestBody(srcType === 'rest' ? (s.requestBody ?? '') : '');
      setCsvHasHeader(srcType === 'csv' ? (s.hasHeader ?? true) : true);
      setCsvDelimiter(srcType === 'csv' ? (s.delimiter ?? ',') : ',');
      setTableName(initialValue.tableName);
      setTableNameTouched(true);
      setColumns(initialValue.columns || []);
      setRows([]);
      setTotalRows(0);
      setError(null);
      setPreviewRowCount(DEFAULT_PREVIEW_ROWS);
      setMaxRefreshRows(initialValue.maxRows ?? DEFAULT_MAX_REFRESH_ROWS);
      setStorageMode(initialValue.storageMode || 'remote');
      setDidFetchInSession(false);
      // Auto-open reveals when non-default values exist so nothing hides silently.
      const hasCustomRequest =
        srcType === 'rest' &&
        ((s.method && s.method !== 'GET') ||
          !!(s.headers && Object.keys(s.headers).length > 0) ||
          !!s.requestBody ||
          !!s.jsonPath);
      setShowRequestOptions(hasCustomRequest);
      setShowColumnDefs(false);
      idRef.current = initialValue.id || generateParameterId();
      tokenRef.current = initialValue.webhookToken || generateWebhookToken();
    } else {
      resetAll();
      idRef.current = generateParameterId();
      tokenRef.current = generateWebhookToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValue]);

  const resetAll = () => {
    setType('rest');
    setUrl('');
    setJsonPath('');
    setMethod('GET');
    setHeadersText('');
    setRequestBody('');
    setCsvHasHeader(true);
    setCsvDelimiter(',');
    setTableName('');
    setTableNameTouched(false);
    setError(null);
    setColumns([]);
    setRows([]);
    setTotalRows(0);
    setLoading(false);
    setDidFetchInSession(false);
    setStorageMode('remote');
    setMaxRefreshRows(DEFAULT_MAX_REFRESH_ROWS);
    setPreviewRowCount(DEFAULT_PREVIEW_ROWS);
    setShowRequestOptions(false);
    setShowColumnDefs(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const parseHeaders = (): Record<string, string> | { error: string } => {
    if (!headersText.trim()) return {};
    const result: Record<string, string> = {};
    for (const raw of headersText.split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      const idx = line.indexOf(':');
      if (idx < 0) return { error: `Invalid header line: "${line}"` };
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (!key) return { error: `Invalid header line: "${line}"` };
      result[key] = value;
    }
    return result;
  };

  const buildRequestPayload = (rowsOverride?: number) => {
    if (!url.trim()) return { error: 'URL is required' };
    const requestedPreviewRows = rowsOverride ?? previewRowCount ?? DEFAULT_PREVIEW_ROWS;

    if (type === 'csv') {
      return {
        payload: {
          type,
          url: url.trim(),
          hasHeader: csvHasHeader,
          delimiter: csvDelimiter || ',',
          sampleRows: requestedPreviewRows,
        },
      };
    }

    const headers = parseHeaders();
    if ('error' in headers) return { error: headers.error };
    return {
      payload: {
        type,
        url: url.trim(),
        method,
        headers,
        requestBody: method !== 'GET' && requestBody ? requestBody : undefined,
        jsonPath: jsonPath.trim() || undefined,
        sampleRows: requestedPreviewRows,
      },
    };
  };

  const handlePreview = async (rowsOverride?: number) => {
    setError(null);
    const built = buildRequestPayload(rowsOverride);
    if ('error' in built) {
      setError(built.error);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/datasource/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(built.payload),
      });
      const data = (await res.json()) as PreviewResponse;
      if (!res.ok || !data.ok) {
        setError(data.error || 'Preview failed');
        setRows([]);
        setColumns([]);
        setTotalRows(0);
        return;
      }
      const inferred: DataSourceColumn[] = (data.columns || []).map((c) => ({
        name: c.name,
        dataType: c.dataType,
      }));
      setColumns(inferred);
      setRows(data.rows || []);
      setTotalRows(data.totalRowsFetched || 0);
      setDidFetchInSession(true);
      if (!tableNameTouched) setTableName(defaultTableNameFromUrl(url));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Preview failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!hasPreview) {
      notification.error({ message: 'Fetch a preview before saving' });
      return;
    }
    const name = sanitizeTableName(tableName.trim() || defaultTableNameFromUrl(url));
    const conflictsWith = existingTableNames.some(
      (existing) => existing.toLowerCase() === name.toLowerCase() && existing !== initialValue?.tableName,
    );
    if (conflictsWith) {
      notification.error({
        message: 'Table name already in use',
        description: `"${name}" is already used by another data source in this service.`,
      });
      return;
    }
    const built = buildRequestPayload();
    if ('error' in built) {
      notification.error({ message: built.error });
      return;
    }
    const now = new Date().toISOString();

    // Only persist columns if the user actually customized something.
    const hasCustomization = columns.some(
      (c) => (c.displayName && c.displayName !== c.name) || (c.dataType && c.dataType !== 'string'),
    );

    const definition: DataSourceDefinition = {
      id: idRef.current,
      tableName: name,
      storageMode,
      source: built.payload as unknown as DataSourceConfig,
      webhookToken: storageMode === 'snapshot' ? tokenRef.current : undefined,
      maxRows: storageMode === 'snapshot' ? maxRefreshRows : undefined,
      createdAt: initialValue?.createdAt ?? now,
      updatedAt: now,
      ...(hasCustomization ? { columns } : {}),
    };

    onSave(definition, didFetchInSession ? { freshRows: rows } : undefined);
    handleClose();
  };

  const updateColumn = (index: number, patch: Partial<DataSourceColumn>) => {
    setColumns((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const schemaTableColumns = [
    {
      title: 'Source field',
      dataIndex: 'name',
      key: 'name',
      width: '32%',
      render: (name: string) => (
        <code style={{ fontSize: 12, color: '#374151' }}>{name}</code>
      ),
    },
    {
      title: 'Display name',
      key: 'displayName',
      render: (_: unknown, row: DataSourceColumn, index: number) => (
        <Input
          size="small"
          value={row.displayName ?? row.name}
          onChange={(e) => updateColumn(index, { displayName: e.target.value })}
          placeholder={row.name}
        />
      ),
    },
    {
      title: (
        <Space size={4}>
          <span>Type</span>
          <Tooltip title="How this column is treated in formulas. Text is always safe; Number/Date enables math and sorting.">
            <InfoCircleOutlined style={{ color: TOKEN.textSubtle, fontSize: 12, cursor: 'help' }} />
          </Tooltip>
        </Space>
      ),
      key: 'dataType',
      width: 150,
      render: (_: unknown, row: DataSourceColumn, index: number) => (
        <Select
          size="small"
          style={{ width: '100%' }}
          value={row.dataType}
          onChange={(v) => updateColumn(index, { dataType: v })}
          options={DATA_TYPE_OPTIONS}
        />
      ),
    },
  ];

  const previewTableColumns = useMemo(() => {
    return columns.map((c) => ({
      title: (
        <Space size={4}>
          <span>{c.displayName || c.name}</span>
          <Tag color="default" style={{ marginInlineEnd: 0, fontSize: 10 }}>{c.dataType}</Tag>
        </Space>
      ),
      dataIndex: c.name,
      key: c.name,
      ellipsis: true,
      render: (val: unknown) => {
        if (val === null || val === undefined || val === '') return <Text type="secondary">—</Text>;
        if (typeof val === 'object') return <code style={{ fontSize: 11 }}>{JSON.stringify(val)}</code>;
        return String(val);
      },
    }));
  }, [columns]);

  const webhookUrl = useMemo(() => {
    if (!serviceId || !idRef.current || !tokenRef.current) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/api/datasource/${encodeURIComponent(serviceId)}/${encodeURIComponent(idRef.current)}/refresh?token=${tokenRef.current}`;
  }, [serviceId, open, storageMode]);

  return (
    <Modal
      title={
        <Space>
          <DatabaseOutlined style={{ color: TOKEN.purple }} />
          <span>{isEdit ? 'Edit data source' : 'Add data source'}</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      width={880}
      centered
      destroyOnHidden
      styles={{ body: { height: 'calc(90vh - 160px)', overflowY: 'auto', scrollbarGutter: 'stable', paddingRight: 4 } }}
      footer={[
        <Button key="cancel" onClick={handleClose}>Cancel</Button>,
        <Tooltip
          key="save"
          title={!hasPreview ? 'Fetch a preview first to confirm the source works and columns look right.' : ''}
        >
          <Button
            type="primary"
            onClick={handleSave}
            disabled={!hasPreview}
            style={{ background: TOKEN.purple, borderColor: TOKEN.purple }}
          >
            {isEdit ? 'Save changes' : 'Add table'}
          </Button>
        </Tooltip>,
      ]}
    >
      <Text type="secondary" style={{ display: 'block', padding: '4px 0 16px', fontSize: 13, lineHeight: 1.55 }}>
        Connect an external data source to your workbook. Pick how the data is delivered at runtime, then fetch a
        preview to pin down the columns you'll use in formulas.
      </Text>

      {/* ============ Section 1: Source ============ */}
      <div style={{ padding: '4px 0 20px', borderBottom: `1px solid ${TOKEN.sectionRule}` }}>
        <SectionHeader num={1} title="Where does the data come from?" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {SOURCE_CARDS.map((card) => (
            <SourceCard
              key={card.value}
              card={card}
              active={uiCard === card.value}
              onClick={() => {
                if (card.disabled) return;
                setType(card.value === 'csv' ? 'csv' : 'rest');
                setColumns([]);
                setRows([]);
                setTotalRows(0);
                setError(null);
              }}
            />
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <FieldLabel
            required
            tooltip={
              uiCard === 'csv'
                ? 'Full URL to a CSV file. For Google Sheets: File → Share → Publish to the web → .csv.'
                : 'Full URL, including protocol. Must be reachable from the public internet.'
            }
          >
            URL
          </FieldLabel>
          <Input
            prefix={<LinkOutlined style={{ color: TOKEN.textSubtle }} />}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/customers"
            onPressEnter={() => handlePreview()}
            allowClear
          />
        </div>

        {uiCard === 'url' && (() => {
          const headerLineCount = headersText
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean).length;
          const summaryParts: string[] = [];
          if (method !== 'GET') summaryParts.push(method);
          if (headerLineCount > 0) summaryParts.push(`${headerLineCount} header${headerLineCount === 1 ? '' : 's'}`);
          if (requestBody.trim()) summaryParts.push('body');
          if (jsonPath.trim()) summaryParts.push(`path: ${jsonPath.trim()}`);
          const summary = summaryParts.length ? summaryParts.join(', ') : null;
          return (
            <>
              <DisclosureLink
                open={showRequestOptions}
                onClick={() => setShowRequestOptions((v) => !v)}
                label="Request options"
                summary={summary}
              />

              {showRequestOptions && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '12px 14px',
                    background: TOKEN.bg,
                    border: `1px solid ${TOKEN.sectionRule}`,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <FieldLabel>Method</FieldLabel>
                      <Select
                        value={method}
                        onChange={(v) => setMethod(v)}
                        style={{ width: '100%' }}
                        options={[
                          { value: 'GET', label: 'GET' },
                          { value: 'POST', label: 'POST' },
                          { value: 'PUT', label: 'PUT' },
                          { value: 'DELETE', label: 'DELETE' },
                        ]}
                      />
                    </div>
                    <div>
                      <FieldLabel tooltip='Dot-separated path if the array is nested (e.g. "data.results"). Empty auto-detects common wrappers like "data", "results", "items".'>
                        Path to array <Text type="secondary" style={{ fontWeight: 400 }}>(optional)</Text>
                      </FieldLabel>
                      <Input
                        value={jsonPath}
                        onChange={(e) => setJsonPath(e.target.value)}
                        placeholder="data.results"
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: method !== 'GET' ? 14 : 0 }}>
                    <FieldLabel tooltip="One header per line, format: Name: value">Headers</FieldLabel>
                    <Input.TextArea
                      value={headersText}
                      onChange={(e) => setHeadersText(e.target.value)}
                      placeholder={'Accept: application/json\nX-Api-Version: 2'}
                      autoSize={{ minRows: 2, maxRows: 6 }}
                    />
                  </div>
                  {method !== 'GET' && (
                    <div>
                      <FieldLabel tooltip="Sent as-is. If no Content-Type header is provided, application/json is used.">
                        Request body
                      </FieldLabel>
                      <Input.TextArea
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        placeholder='{"filter":"active"}'
                        autoSize={{ minRows: 2, maxRows: 6 }}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          );
        })()}

        {uiCard === 'csv' && (
          <div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
            <div>
              <FieldLabel tooltip="If on, the first row supplies column names. Otherwise columns are named col_1, col_2, …">
                First row is header
              </FieldLabel>
              <Radio.Group
                value={csvHasHeader}
                onChange={(e) => setCsvHasHeader(e.target.value)}
              >
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </div>
            <div>
              <FieldLabel>Delimiter</FieldLabel>
              <Select
                value={csvDelimiter}
                onChange={setCsvDelimiter}
                style={{ width: 160 }}
                options={[
                  { value: ',',  label: 'Comma (,)' },
                  { value: ';',  label: 'Semicolon (;)' },
                  { value: '\t', label: 'Tab' },
                  { value: '|',  label: 'Pipe (|)' },
                ]}
              />
            </div>
          </div>
        )}
      </div>

      {/* ============ Section 2: Delivery ============ */}
      <div style={{ padding: '20px 0', borderBottom: `1px solid ${TOKEN.sectionRule}` }}>
        <SectionHeader num={2} title="How is it delivered at runtime?" />

        <Radio.Group
          value={storageMode}
          onChange={(e) => setStorageMode(e.target.value)}
          style={{ width: '100%' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div
              onClick={() => setStorageMode('remote')}
              style={{
                border: `1px solid ${storageMode === 'remote' ? TOKEN.purple : TOKEN.border}`,
                background: storageMode === 'remote' ? TOKEN.purpleSoft : '#fff',
                boxShadow: storageMode === 'remote' ? `0 0 0 3px rgba(145, 51, 232, 0.08)` : 'none',
                borderRadius: 8,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <Radio value="remote" style={{ alignItems: 'flex-start' }}>
                <div style={{ marginLeft: 2 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ThunderboltOutlined style={{ color: TOKEN.amber }} /> Live fetch
                  </div>
                  <div style={{ fontSize: 11.5, color: TOKEN.textSubtle, lineHeight: 1.4 }}>
                    Fetch from your URL on every call, briefly cached.
                  </div>
                </div>
              </Radio>
            </div>

            <Tooltip title={!canUseSnapshot ? 'Snapshot is a Premium feature. Upgrade your plan to enable it.' : ''}>
              <div
                onClick={() => {
                  if (!canUseSnapshot && storageMode !== 'snapshot') return;
                  setStorageMode('snapshot');
                }}
                style={{
                  border: `1px solid ${storageMode === 'snapshot' ? TOKEN.purple : TOKEN.border}`,
                  background: storageMode === 'snapshot' ? TOKEN.purpleSoft : !canUseSnapshot ? '#f9fafb' : '#fff',
                  boxShadow: storageMode === 'snapshot' ? `0 0 0 3px rgba(145, 51, 232, 0.08)` : 'none',
                  borderRadius: 8,
                  padding: '12px 14px',
                  cursor: !canUseSnapshot && storageMode !== 'snapshot' ? 'not-allowed' : 'pointer',
                  opacity: !canUseSnapshot && storageMode !== 'snapshot' ? 0.65 : 1,
                  transition: 'all 0.12s ease',
                }}
              >
                <Radio value="snapshot" disabled={!canUseSnapshot && storageMode !== 'snapshot'} style={{ alignItems: 'flex-start' }}>
                  <div style={{ marginLeft: 2 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <DatabaseFilled style={{ color: TOKEN.purple }} /> Snapshot
                      {!canUseSnapshot && (
                        <Tag
                          color="gold"
                          style={{
                            marginInlineEnd: 0,
                            marginLeft: 'auto',
                            fontSize: 9.5,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            lineHeight: '16px',
                            padding: '0 6px',
                          }}
                        >
                          Premium
                        </Tag>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: TOKEN.textSubtle, lineHeight: 1.4 }}>
                      Cached on our side, refreshed on demand via webhook.
                    </div>
                  </div>
                </Radio>
              </div>
            </Tooltip>
          </div>

          {storageMode === 'snapshot' && (
            <div style={{ marginTop: 10 }}>
              {webhookUrl ? (
                <WebhookBlock url={webhookUrl} />
              ) : (
                <Alert
                  type="info"
                  showIcon
                  message="The refresh webhook URL will appear once the service is saved."
                />
              )}
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 12.5,
                  color: TOKEN.textMuted,
                }}
              >
                <Tooltip title="Hard cap on rows stored per refresh. Protects against unexpectedly large upstream responses.">
                  <span style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Max rows per refresh
                    <InfoCircleOutlined style={{ color: TOKEN.textSubtle, fontSize: 11 }} />
                  </span>
                </Tooltip>
                <Select
                  size="small"
                  value={maxRefreshRows}
                  onChange={setMaxRefreshRows}
                  options={MAX_REFRESH_ROWS_OPTIONS}
                  style={{ width: 180 }}
                />
              </div>
            </div>
          )}
        </Radio.Group>
      </div>

      {/* ============ Section 3: Preview ============ */}
      <div style={{ padding: '20px 0 4px' }}>
        <SectionHeader num={3} title="Preview your data" />

        {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}

        <div style={{ marginBottom: 14 }}>
          <FieldLabel required tooltip="Used as the sheet tab and as the table identifier in formulas. Letters, digits and underscores only.">
            Table name
          </FieldLabel>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={tableName}
              onChange={(e) => {
                setTableName(e.target.value);
                setTableNameTouched(true);
              }}
              placeholder="customers"
              onPressEnter={() => handlePreview()}
            />
            <Tooltip title="Fetches a sample to verify the source works and infer column types. No data is saved yet.">
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={loading}
                onClick={() => handlePreview()}
                disabled={!url.trim()}
                style={{ background: TOKEN.purple, borderColor: TOKEN.purple }}
              >
                Fetch Table Data
              </Button>
            </Tooltip>
          </Space.Compact>
        </div>

        {hasPreview ? (
          <>
            {rows.length > 0 && (
              <>
                <Table
                  size="small"
                  rowKey="__rowId"
                  dataSource={rows.map((r, i) => ({ ...r, __rowId: `row-${i}` }))}
                  columns={previewTableColumns}
                  pagination={false}
                  scroll={{ x: true, y: 320 }}
                  bordered
                  style={{ marginBottom: 8 }}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    flexWrap: 'wrap',
                    marginBottom: 12,
                    fontSize: 12.5,
                    color: TOKEN.textMuted,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Rows:
                    <Select
                      size="small"
                      value={previewRowCount}
                      onChange={(v) => {
                        setPreviewRowCount(v);
                        if (!loading) handlePreview(v);
                      }}
                      options={PREVIEW_ROW_OPTIONS}
                      style={{ width: 180 }}
                      disabled={loading}
                    />
                  </span>
                  {totalRows > 0 && (
                    <span style={{ marginLeft: 'auto', color: TOKEN.textSubtle }}>
                      Fetched{' '}
                      <span style={{ color: TOKEN.green, fontWeight: 600 }}>
                        {totalRows} row{totalRows === 1 ? '' : 's'}
                      </span>
                      {rows.length < totalRows && <>, showing first {rows.length}</>}
                    </span>
                  )}
                </div>

                {(() => {
                  const customizedCount = columns.filter(
                    (c) => (c.displayName && c.displayName !== c.name) || (c.dataType && c.dataType !== 'string'),
                  ).length;
                  return (
                    <>
                      <DisclosureLink
                        open={showColumnDefs}
                        onClick={() => setShowColumnDefs((v) => !v)}
                        label="Column definitions"
                        summary={customizedCount > 0 ? `${customizedCount} customized` : 'defaults from preview'}
                      />
                      {showColumnDefs && (
                        <Table
                          size="small"
                          rowKey="name"
                          dataSource={columns}
                          columns={schemaTableColumns}
                          pagination={false}
                          bordered
                          style={{ marginTop: 12 }}
                        />
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </>
        ) : (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              color: TOKEN.textSubtle,
              fontSize: 13,
              background: '#fff',
              border: `1px dashed ${TOKEN.border}`,
              borderRadius: 8,
            }}
          >
            Paste a URL above and click <b style={{ color: TOKEN.text }}>Fetch preview</b> to see your rows.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DataSourceModal;
