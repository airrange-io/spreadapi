'use client';

import React, { useMemo, useState } from 'react';
import {
  Modal,
  Button,
  Space,
  Input,
  Form,
  Select,
  Segmented,
  Table,
  Tag,
  Switch,
  Typography,
  Alert,
  Tooltip,
  Empty,
  Collapse,
  App,
} from 'antd';
import {
  DatabaseOutlined,
  ApiOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

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
  id: string;                          // stable uuid
  tableName: string;                   // sheet tab / formula name
  storageMode: StorageMode;            // remote (default) or snapshot (Pro)
  source: DataSourceConfig;
  // Optional column metadata — used ONLY when the user customized displayNames
  // or types in the modal. If absent, SpreadJS auto-generates columns from
  // whatever the fetch returns.
  columns?: DataSourceColumn[];
  // Snapshot-mode fields
  webhookToken?: string;               // per-source secret for external refresh
  maxRows?: number;                    // cap on snapshot refresh writes (default 5000)
  createdAt?: string;
  updatedAt?: string;
}

interface DataSourceModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Save handler. The modal does NOT persist rows — that's the parent's job.
   *
   * - `freshRows`: if the user clicked "Fetch preview" in this session, these
   *   are the just-fetched rows. Used by the parent for:
   *     - Snapshot mode: seed Redis on create (POST to /api/datasource/:sid/:srcid)
   *     - Remote mode: nothing — SpreadJS will re-fetch via the remote.read fn
   *   `undefined` when the user edited a setting without re-fetching (common for
   *   display-name changes on Snapshot sources — don't overwrite Redis with a
   *   stale sample).
   */
  onSave: (
    definition: DataSourceDefinition,
    options?: { freshRows?: Record<string, unknown>[] },
  ) => void;
  initialValue?: DataSourceDefinition | null;
  existingTableNames?: string[];
}

interface PreviewResponse {
  ok: boolean;
  error?: string;
  stage?: string;
  rows?: Record<string, unknown>[];
  columns?: { name: string; dataType: ColumnDataType }[];
  totalRowsFetched?: number;
}

const PURPLE = '#9233E9';

// Preview-row options the user can pick from. "all" maps to the server-side
// cap (10 000 rows). Keeping the values numeric (with 0 as sentinel for "all")
// lets the UI pass them directly to the preview endpoint.
const PREVIEW_ROW_OPTIONS = [
  { value: 10,    label: '10 rows' },
  { value: 50,    label: '50 rows' },
  { value: 200,   label: '200 rows' },
  { value: 1000,  label: '1 000 rows' },
  { value: 10000, label: 'All (max 10 000)' },
];
const DEFAULT_PREVIEW_ROWS = 10;

const DATA_TYPE_OPTIONS: { value: ColumnDataType; label: string }[] = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
];

const SOURCE_TYPE_OPTIONS: { value: DataSourceType; label: string; icon: React.ReactNode; tip: string }[] = [
  {
    value: 'json',
    label: 'JSON URL',
    icon: <FileTextOutlined />,
    tip: 'A publicly reachable URL that returns JSON (an array, or an object containing one).',
  },
  {
    value: 'rest',
    label: 'REST API',
    icon: <ApiOutlined />,
    tip: 'Any HTTP endpoint: choose a method, add headers, optionally a request body.',
  },
  {
    value: 'csv',
    label: 'CSV URL',
    icon: <FileTextOutlined />,
    tip: 'A URL that returns CSV text (e.g. a published Google Sheet).',
  },
];

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

function LabelWithTip({ label, tip }: { label: string; tip: string }) {
  return (
    <Space size={6}>
      <span>{label}</span>
      <Tooltip title={tip}>
        <InfoCircleOutlined style={{ color: '#9ca3af', fontSize: 12 }} />
      </Tooltip>
    </Space>
  );
}

const DataSourceModal: React.FC<DataSourceModalProps> = ({
  open,
  onClose,
  onSave,
  initialValue,
  existingTableNames = [],
}) => {
  const { notification } = App.useApp();

  const isEdit = !!initialValue;

  const [type, setType] = useState<DataSourceType>('json');
  const [url, setUrl] = useState('');
  const [jsonPath, setJsonPath] = useState('');
  const [method, setMethod] = useState<RestSource['method']>('GET');
  const [headersText, setHeadersText] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [csvHasHeader, setCsvHasHeader] = useState(true);
  const [csvDelimiter, setCsvDelimiter] = useState(',');
  const [tableName, setTableName] = useState('');
  const [tableNameTouched, setTableNameTouched] = useState(false);
  const [previewRowCount, setPreviewRowCount] = useState<number>(DEFAULT_PREVIEW_ROWS);
  const [maxRefreshRows, setMaxRefreshRows] = useState<number>(5000);
  const [storageMode, setStorageMode] = useState<StorageMode>('remote');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<DataSourceColumn[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  // True once the user clicks "Fetch preview" in this session. Drives whether
  // we push these rows to Redis on save (edits without re-fetch must preserve
  // the existing Redis dataset).
  const [didFetchInSession, setDidFetchInSession] = useState(false);

  const hasPreview = columns.length > 0;

  React.useEffect(() => {
    if (!open) return;
    if (initialValue) {
      setType(initialValue.source.type);
      setUrl(initialValue.source.url);
      const s: any = initialValue.source;
      setJsonPath(s.jsonPath ?? '');
      setMethod(initialValue.source.type === 'rest' ? (s.method ?? 'GET') : 'GET');
      setHeadersText(
        initialValue.source.type === 'rest' && s.headers
          ? Object.entries(s.headers as Record<string, string>).map(([k, v]) => `${k}: ${v}`).join('\n')
          : '',
      );
      setRequestBody(initialValue.source.type === 'rest' ? (s.requestBody ?? '') : '');
      setCsvHasHeader(initialValue.source.type === 'csv' ? (s.hasHeader ?? true) : true);
      setCsvDelimiter(initialValue.source.type === 'csv' ? (s.delimiter ?? ',') : ',');
      setTableName(initialValue.tableName);
      setTableNameTouched(true);
      setColumns(initialValue.columns || []);
      // No sampleRows in v4 — user must click "Fetch preview" to see data
      // in the modal. Editor shows live data via the remote.read function.
      setRows([]);
      setTotalRows(0);
      setError(null);
      setPreviewRowCount(DEFAULT_PREVIEW_ROWS);
      setMaxRefreshRows(initialValue.maxRows ?? 5000);
      setStorageMode(initialValue.storageMode || 'remote');
      setDidFetchInSession(false);
    } else {
      resetAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValue]);

  const resetAll = () => {
    setType('json');
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
    setMaxRefreshRows(5000);
    setPreviewRowCount(DEFAULT_PREVIEW_ROWS);
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

  const buildRequestPayload = () => {
    if (!url.trim()) return { error: 'URL is required' };

    // How many rows the preview endpoint should return. "All" = 10 000 via the
    // sentinel value in PREVIEW_ROW_OPTIONS.
    const requestedPreviewRows = previewRowCount || DEFAULT_PREVIEW_ROWS;

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

    if (type === 'json') {
      return {
        payload: {
          type,
          url: url.trim(),
          jsonPath: jsonPath.trim() || undefined,
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

  const handlePreview = async () => {
    setError(null);
    const built = buildRequestPayload();
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
      if (!tableNameTouched) {
        setTableName(defaultTableNameFromUrl(url));
      }
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

    // Did the user customize any column (displayName or type)?
    // If so, pass the column metadata. Otherwise omit — SpreadJS will
    // auto-generate from whatever the remote.read fn returns.
    const hasCustomization = columns.some(
      (c) => (c.displayName && c.displayName !== c.name) || (c.dataType && c.dataType !== 'string'),
    );

    const definition: DataSourceDefinition = {
      // Preserve id + token across edits; parent generates them on create.
      id: initialValue?.id ?? '',
      webhookToken: initialValue?.webhookToken ?? '',
      maxRows: storageMode === 'snapshot' ? maxRefreshRows : undefined,
      createdAt: initialValue?.createdAt ?? now,
      updatedAt: now,
      tableName: name,
      storageMode,
      source: built.payload as unknown as DataSourceConfig,
      ...(hasCustomization ? { columns } : {}),
    };

    onSave(
      definition,
      // Parent uses freshRows only for Snapshot mode (seed Redis on create / explicit refresh).
      // Remote mode ignores freshRows — SpreadJS re-fetches via the remote.read fn anyway.
      didFetchInSession ? { freshRows: rows } : undefined,
    );
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
      width: '36%',
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
        <LabelWithTip
          label="Type"
          tip="How this column is treated in formulas. Text is always safe; Number/Date enables math and sorting."
        />
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

  return (
    <Modal
      title={
        <Space>
          <DatabaseOutlined style={{ color: PURPLE }} />
          <span>{isEdit ? 'Edit data source' : 'Add data source'}</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      width={880}
      centered
      destroyOnHidden
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
            style={{ background: PURPLE, borderColor: PURPLE }}
          >
            {isEdit ? 'Save changes' : 'Add table'}
          </Button>
        </Tooltip>,
      ]}
    >
      <Space orientation="vertical" style={{ width: '100%' }} size={20}>
        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Pull live data from an external source. The schema and a small sample are stored with the workbook, so
            you can build formulas against real columns. The live data is fetched again every time the service is
            executed.
          </Text>
        </div>

        {/* Storage mode — defines what we do with the data after fetching it */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Storage mode</Text>
          <Segmented
            block
            value={storageMode}
            onChange={(v) => setStorageMode(v as StorageMode)}
            options={[
              {
                value: 'remote',
                label: (
                  <Tooltip
                    title="We fetch your URL directly when your service runs, with a short server-side cache. Ideal for data that updates on a predictable schedule — nightly exports, published spreadsheets, public catalogs. Zero setup."
                    mouseEnterDelay={0.3}
                  >
                    <Space size={6}>
                      <ThunderboltOutlined />
                      <span>Remote (live fetch)</span>
                    </Space>
                  </Tooltip>
                ),
              },
              {
                value: 'snapshot',
                label: (
                  <Tooltip
                    title="We cache your data on our side. Trigger refreshes via our webhook — connect Zapier, Power Automate, Pipedream, dbt or any automation tool. Your service stays up when your upstream is down; scales to high traffic without hammering your source."
                    mouseEnterDelay={0.3}
                  >
                    <Space size={6}>
                      <DatabaseOutlined />
                      <span>Snapshot on SpreadAPI</span>
                    </Space>
                  </Tooltip>
                ),
              },
            ]}
          />
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
            {storageMode === 'remote'
              ? 'Data is fetched live from your URL on every service call (cached briefly).'
              : 'Data is cached on SpreadAPI. Update it via webhook from your automation tools or manually.'}
          </Text>
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Source type</Text>
          <Segmented
            block
            value={type}
            onChange={(v) => {
              setType(v as DataSourceType);
              setColumns([]);
              setRows([]);
              setTotalRows(0);
              setError(null);
            }}
            options={SOURCE_TYPE_OPTIONS.map((o) => ({
              value: o.value,
              label: (
                <Tooltip title={o.tip} mouseEnterDelay={0.3}>
                  <Space size={6}>
                    {o.icon}
                    <span>{o.label}</span>
                  </Space>
                </Tooltip>
              ),
            }))}
          />
        </div>

        <Form layout="vertical" component="div" requiredMark={false}>
          <Form.Item
            label={
              <LabelWithTip
                label="URL"
                tip={
                  type === 'csv'
                    ? 'Full URL to a CSV file. For Google Sheets, use File > Share > Publish to the web > .csv.'
                    : 'Full URL, including protocol. Must be reachable from the public internet.'
                }
              />
            }
            required
            style={{ marginBottom: 12 }}
          >
            <Input
              prefix={<LinkOutlined style={{ color: '#9ca3af' }} />}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/customers"
              onPressEnter={handlePreview}
              allowClear
            />
          </Form.Item>

          {type === 'rest' && (
            <>
              <Space size="middle" align="start" style={{ width: '100%' }} wrap>
                <Form.Item label="Method" style={{ marginBottom: 12, minWidth: 140 }}>
                  <Select
                    value={method}
                    onChange={(v) => setMethod(v)}
                    style={{ width: 140 }}
                    options={[
                      { value: 'GET', label: 'GET' },
                      { value: 'POST', label: 'POST' },
                      { value: 'PUT', label: 'PUT' },
                      { value: 'DELETE', label: 'DELETE' },
                    ]}
                  />
                </Form.Item>
              </Space>
              <Form.Item
                label={
                  <LabelWithTip
                    label="Headers"
                    tip={'One header per line, format "Name: value". Examples: Accept: application/json, X-Api-Version: 2.'}
                  />
                }
                style={{ marginBottom: 12 }}
              >
                <Input.TextArea
                  value={headersText}
                  onChange={(e) => setHeadersText(e.target.value)}
                  placeholder={'Accept: application/json\nX-Api-Version: 2'}
                  rows={3}
                />
              </Form.Item>
              {method !== 'GET' && (
                <Form.Item
                  label={
                    <LabelWithTip
                      label="Request body"
                      tip={'Sent as-is. If no Content-Type header is provided, application/json is used.'}
                    />
                  }
                  style={{ marginBottom: 12 }}
                >
                  <Input.TextArea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder='{"filter":"active"}'
                    rows={3}
                  />
                </Form.Item>
              )}
            </>
          )}

          {(type === 'json' || type === 'rest') && (
            <Form.Item
              label={
                <LabelWithTip
                  label="Path to array (optional)"
                  tip={'If the response wraps the array in an object, point to it with dot notation. Leave empty to auto-detect common wrappers like "data", "results", "items".'}
                />
              }
              style={{ marginBottom: 12 }}
            >
              <Input
                value={jsonPath}
                onChange={(e) => setJsonPath(e.target.value)}
                placeholder="data.results"
              />
            </Form.Item>
          )}

          {type === 'csv' && (
            <Space size="large" align="center" wrap style={{ marginBottom: 8 }}>
              <Form.Item
                label={
                  <LabelWithTip
                    label="First row is header"
                    tip={'If enabled, the first row supplies column names. Otherwise columns are named col_1, col_2, …'}
                  />
                }
                style={{ marginBottom: 0 }}
              >
                <Switch checked={csvHasHeader} onChange={setCsvHasHeader} />
              </Form.Item>
              <Form.Item label="Delimiter" style={{ marginBottom: 0 }}>
                <Select
                  value={csvDelimiter}
                  onChange={setCsvDelimiter}
                  style={{ width: 160 }}
                  options={[
                    { value: ',', label: 'Comma (,)' },
                    { value: ';', label: 'Semicolon (;)' },
                    { value: '\t', label: 'Tab' },
                    { value: '|', label: 'Pipe (|)' },
                  ]}
                />
              </Form.Item>
            </Space>
          )}

          <Collapse
            ghost
            size="small"
            style={{ marginTop: 4 }}
            items={[
              {
                key: 'advanced',
                label: <Text strong style={{ fontSize: 12, color: '#6b4fb8' }}>Advanced</Text>,
                children: (
                  <Space size="large" align="start" wrap>
                    <Form.Item
                      label={
                        <LabelWithTip
                          label="Preview rows"
                          tip={'How many rows to fetch when testing the source in the editor. Use a larger value when you want to verify formulas against real data. The full set is stored separately and served at runtime — your service config stays small regardless.'}
                        />
                      }
                      style={{ marginBottom: 0, minWidth: 200 }}
                    >
                      <Select
                        value={previewRowCount}
                        onChange={setPreviewRowCount}
                        options={PREVIEW_ROW_OPTIONS}
                        style={{ width: 200 }}
                      />
                    </Form.Item>
                    {storageMode === 'snapshot' && (
                      <Form.Item
                        label={
                          <LabelWithTip
                            label="Max rows per refresh"
                            tip={'Hard cap on rows stored when the webhook refreshes this source. Protects against unexpectedly large upstream responses. Default 5 000.'}
                          />
                        }
                        style={{ marginBottom: 0, minWidth: 200 }}
                      >
                        <Select
                          value={maxRefreshRows}
                          onChange={setMaxRefreshRows}
                          options={[
                            { value: 500,    label: '500' },
                            { value: 1000,   label: '1 000' },
                            { value: 5000,   label: '5 000 (default)' },
                            { value: 10000,  label: '10 000' },
                            { value: 50000,  label: '50 000' },
                            { value: 100000, label: '100 000' },
                          ]}
                          style={{ width: 200 }}
                        />
                      </Form.Item>
                    )}
                  </Space>
                ),
              },
            ]}
          />
        </Form>

        <div
          style={{
            padding: 12,
            background: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: 8,
          }}
        >
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Tooltip title="Fetches up to 10 rows to verify the source works and to infer column types. No data is saved yet.">
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={loading}
                onClick={handlePreview}
                disabled={!url.trim()}
                style={{ background: PURPLE, borderColor: PURPLE }}
              >
                Fetch preview
              </Button>
            </Tooltip>
            {totalRows > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Fetched {totalRows} row{totalRows === 1 ? '' : 's'}, showing first {rows.length}.
              </Text>
            )}
          </Space>
          {error && (
            <Alert
              type="error"
              showIcon
              message={error}
              style={{ marginTop: 12 }}
            />
          )}
        </div>

        {hasPreview ? (
          <>
            <Form.Item
              label={
                <LabelWithTip
                  label="Table name"
                  tip={'Used as the sheet tab and as the table identifier in formulas. Letters, digits and underscores only.'}
                />
              }
              required
              style={{ marginBottom: 0 }}
            >
              <Input
                value={tableName}
                onChange={(e) => {
                  setTableName(e.target.value);
                  setTableNameTouched(true);
                }}
                placeholder="customers"
              />
            </Form.Item>

            <div>
              <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>Columns</Title>
              <Table
                size="small"
                rowKey="name"
                dataSource={columns}
                columns={schemaTableColumns}
                pagination={false}
                bordered
              />
            </div>

            <div>
              <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
                Preview <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>(first {rows.length} rows)</Text>
              </Title>
              <Table
                size="small"
                rowKey="__rowId"
                dataSource={rows.map((r, i) => ({ ...r, __rowId: `row-${i}` }))}
                columns={previewTableColumns}
                pagination={false}
                scroll={{ x: true }}
                bordered
              />
            </div>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Fill in the URL and click <b>Fetch preview</b> to see columns and sample rows.
              </Text>
            }
            style={{ padding: '16px 0' }}
          />
        )}
      </Space>
    </Modal>
  );
};

export default DataSourceModal;
