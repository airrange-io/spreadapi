'use client';

import React, { useState, useMemo } from 'react';
import { Space, Button, Skeleton, Tooltip, Modal, Tag, App } from 'antd';
import { EditOutlined, DeleteOutlined, InfoCircleOutlined, TableOutlined, LockOutlined, FunctionOutlined, ThunderboltOutlined, DatabaseOutlined, ApiOutlined, FileTextOutlined, ReloadOutlined, LinkOutlined } from '@ant-design/icons';
import type { DataSourceDefinition } from '../DataSourceModal';
import { useTranslation } from '@/lib/i18n';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableParameterItem } from './SortableParameterItem';

// Drag & Drop Configuration
const DRAG_ACTIVATION_DISTANCE_PX = 8;
export const COMPACT_LAYOUT_BREAKPOINT_PX = 380;

export interface InputDefinition {
  id: string;
  address: string;
  name: string;
  title?: string;
  row: number;
  col: number;
  type: 'number' | 'string' | 'boolean';
  value?: any;
  direction: 'input';
  mandatory?: boolean;
  min?: number;
  max?: number;
  description?: string;
  format?: 'percentage';
  formatString?: string;
  aiExamples?: string[];
  allowedValues?: string[];
  allowedValuesRange?: string;
  allowedValuesCaseSensitive?: boolean;
  defaultValue?: any;
}

export interface OutputDefinition {
  id: string;
  address: string;
  name: string;
  title?: string;
  row: number;
  col: number;
  rowCount?: number;
  colCount?: number;
  type: 'number' | 'string' | 'boolean';
  value?: any;
  direction: 'output';
  description?: string;
  aiPresentationHint?: string;
  formatString?: string;
}

export interface AreaPermissions {
  canReadValues: boolean;
  canWriteValues: boolean;
  canReadFormulas: boolean;
  canWriteFormulas: boolean;
  canReadFormatting: boolean;
  canWriteFormatting: boolean;
  canAddRows: boolean;
  canDeleteRows: boolean;
  canModifyStructure: boolean;
  allowedFormulas?: string[];
}

export interface AreaParameter {
  id?: string;
  name: string;
  address: string;
  description?: string;
  mode: 'readonly' | 'editable' | 'interactive';
  permissions: AreaPermissions;
  validation?: {
    protectedCells?: string[];
    editableColumns?: number[];
    formulaComplexityLimit?: number;
  };
  aiContext?: {
    purpose: string;
    expectedBehavior: string;
  };
}

interface ParametersSectionProps {
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  areas: AreaParameter[];
  isLoading: boolean;
  hasInitialized: boolean;
  isDemoMode?: boolean;
  panelWidth?: number;
  activeTab?: string;
  onNavigateToParameter: (param: InputDefinition | OutputDefinition) => void;
  onEditParameter: (type: 'input' | 'output', parameter: InputDefinition | OutputDefinition) => void;
  onDeleteParameter: (type: 'input' | 'output', id: string) => void;
  onEditArea: (area: AreaParameter, index: number) => void;
  onRemoveArea: (index: number) => void;
  onNavigateToArea: (area: AreaParameter) => void;
  onShowHowItWorks: () => void;
  onReorderInputs?: (newOrder: InputDefinition[]) => void;
  onReorderOutputs?: (newOrder: OutputDefinition[]) => void;
  dataSources?: DataSourceDefinition[];
  onEditDataSource?: (ds: DataSourceDefinition) => void;
  onDeleteDataSource?: (tableName: string) => void;
  serviceId?: string;
}

// Data-source list row — extracted so its hover useState lives at component scope
// and does NOT get called inside a .map() callback (Rules of Hooks).
const DataSourceRow: React.FC<{
  ds: DataSourceDefinition;
  serviceId?: string;
  typeLabel: string;
  icon: React.ReactNode;
  isDemoMode?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  cannotUndoLabel: string;
  yesLabel: string;
  noLabel: string;
}> = ({ ds, serviceId, typeLabel, icon, isDemoMode, onClick, onDelete, cannotUndoLabel, yesLabel, noLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { notification, message } = App.useApp();
  const url = ds.source.url;
  const isSnapshot = ds.storageMode === 'snapshot';

  const webhookUrl = useMemo(() => {
    if (!isSnapshot || !serviceId || !ds.id || !ds.webhookToken) return null;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/api/datasource/${encodeURIComponent(serviceId)}/${encodeURIComponent(ds.id)}/refresh?token=${encodeURIComponent(ds.webhookToken)}`;
  }, [isSnapshot, serviceId, ds.id, ds.webhookToken]);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!webhookUrl) return;
    setRefreshing(true);
    try {
      const res = await fetch(webhookUrl, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        notification.error({
          message: 'Refresh failed',
          description: data.error || `HTTP ${res.status}`,
        });
      } else {
        notification.success({
          message: 'Refreshed',
          description: `${data.rowCount ?? 0} rows loaded${data.cappedAt ? ` (capped at ${data.cappedAt})` : ''}.`,
        });
      }
    } catch (err) {
      notification.error({
        message: 'Refresh failed',
        description: err instanceof Error ? err.message : 'Network error',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyWebhook = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!webhookUrl) return;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      message.success('Webhook URL copied');
    } catch {
      message.error('Could not copy — select and copy manually');
    }
  };

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        background: hovered ? '#faf8ff' : '#f8f7fa',
        border: '1px solid #eee',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#f0eeff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{ds.tableName}</span>
            <Tag color="default" style={{ marginInlineEnd: 0, fontSize: 10, lineHeight: '16px' }}>
              {typeLabel}
            </Tag>
            <Tag
              color={isSnapshot ? 'purple' : 'default'}
              style={{ marginInlineEnd: 0, fontSize: 10, lineHeight: '16px' }}
            >
              {isSnapshot ? 'Snapshot' : 'Live'}
            </Tag>
          </div>
          <Tooltip title={url} mouseEnterDelay={0.4}>
            <div
              style={{
                fontSize: 12,
                color: '#9ca3af',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: 2,
              }}
            >
              {url}
            </div>
          </Tooltip>
        </div>

        {!isDemoMode && webhookUrl && (
          <>
            <Tooltip title="Refresh data now (re-fetches from the source URL).">
              <Button
                size="small"
                type="text"
                loading={refreshing}
                icon={<ReloadOutlined style={{ color: hovered ? '#9233E9' : '#ccc' }} />}
                style={{ opacity: hovered ? 1 : 0.4, transition: 'opacity 0.15s' }}
                onClick={handleRefresh}
              />
            </Tooltip>
            <Tooltip title="Copy webhook URL. Trigger it from Zapier / Power Automate / Pipedream / any scheduler to refresh this data.">
              <Button
                size="small"
                type="text"
                icon={<LinkOutlined style={{ color: hovered ? '#9233E9' : '#ccc' }} />}
                style={{ opacity: hovered ? 1 : 0.4, transition: 'opacity 0.15s' }}
                onClick={handleCopyWebhook}
              />
            </Tooltip>
          </>
        )}

        {!isDemoMode && onDelete && (
          <Button
            size="small"
            type="text"
            icon={<DeleteOutlined style={{ color: hovered ? '#888' : '#ccc' }} />}
            style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}
            onClick={(e) => {
              e.stopPropagation();
              Modal.confirm({
                title: `Delete "${ds.tableName}"?`,
                content: cannotUndoLabel,
                okText: yesLabel,
                cancelText: noLabel,
                okButtonProps: { danger: true },
                onOk: onDelete,
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

// Section header with count badge
const SectionHeader: React.FC<{ title: string; count: number }> = ({ title, count }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 8px 8px',
  }}>
    <span style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1.5,
      color: '#aaa',
      textTransform: 'uppercase',
    }}>
      {title}
    </span>
    {count > 0 && (
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: '#CFC8F9',
        background: '#F0EEFF',
        borderRadius: 6,
        padding: '2px 8px',
        minWidth: 22,
        textAlign: 'center',
      }}>
        {count}
      </span>
    )}
  </div>
);

const ParametersSection: React.FC<ParametersSectionProps> = ({
  inputs,
  outputs,
  areas,
  isLoading,
  hasInitialized,
  isDemoMode,
  panelWidth,
  activeTab = 'parameters',
  onNavigateToParameter,
  onEditParameter,
  onDeleteParameter,
  onEditArea,
  onRemoveArea,
  onNavigateToArea,
  onShowHowItWorks,
  onReorderInputs,
  onReorderOutputs,
  dataSources = [],
  onEditDataSource,
  onDeleteDataSource,
  serviceId,
}) => {
  const { t } = useTranslation();

  const useCompactLayout = panelWidth && panelWidth < COMPACT_LAYOUT_BREAKPOINT_PX;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleInputDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = inputs.findIndex((item) => item.id === active.id);
      const newIndex = inputs.findIndex((item) => item.id === over.id);
      onReorderInputs?.(arrayMove(inputs, oldIndex, newIndex));
    }
  };

  const handleOutputDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = outputs.findIndex((item) => item.id === active.id);
      const newIndex = outputs.findIndex((item) => item.id === over.id);
      onReorderOutputs?.(arrayMove(outputs, oldIndex, newIndex));
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'readonly': return t('params.modeReadonly');
      case 'editable': return t('params.modeEditable');
      case 'interactive': return t('params.modeInteractive');
      default: return mode;
    }
  };

  if (activeTab === 'data') {
    const sourceIcon = (type: string) => {
      if (type === 'rest') return <ApiOutlined style={{ color: '#9233E9', fontSize: 16 }} />;
      return <FileTextOutlined style={{ color: '#9233E9', fontSize: 16 }} />;
    };
    const sourceLabel = (type: string) => {
      if (type === 'rest') return 'REST';
      if (type === 'csv') return 'CSV';
      return 'JSON';
    };

    const Step: React.FC<{ n: number; title: string; desc: string }> = ({ n, title, desc }) => (
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div
          style={{
            flexShrink: 0,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#f0eeff',
            color: '#9233E9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {n}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5, marginTop: 2 }}>{desc}</div>
        </div>
      </div>
    );

    return (
      <div style={{ padding: '8px 4px' }}>
        {isLoading || !hasInitialized ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : dataSources.length === 0 ? (
          /* Rich empty state — shown when no data sources exist yet */
          <div
            style={{
              margin: '8px 0 14px',
              padding: '18px 16px',
              border: '1.5px dashed #d9d9d9',
              borderRadius: 12,
              background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#f0eeff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <DatabaseOutlined style={{ color: '#9233E9', fontSize: 20 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>Live data</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2, lineHeight: 1.4 }}>
                  Connect JSON, REST or CSV sources to your workbook.
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.55, marginTop: 14 }}>
              Great for price lists, catalogs, or any reference data that lives outside the workbook.
              A schema and a small sample are kept here; the live data is fetched on every execute.
            </div>

            <div
              style={{
                marginTop: 16,
                padding: '12px 14px',
                background: '#fafafa',
                border: '1px solid #efeff1',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  color: '#aaa',
                  textTransform: 'uppercase',
                }}
              >
                How it works
              </div>
              <Step n={1} title="Paste a URL" desc="JSON, REST API or CSV file." />
              <Step n={2} title="Preview & confirm" desc="Columns and types are detected; you can adjust." />
              <Step n={3} title="Use it in formulas" desc="VLOOKUP, INDEX/MATCH and structured refs work." />
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: 12,
                color: '#9233E9',
                fontWeight: 600,
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              Use the button below to add your first source.
            </div>
          </div>
        ) : (
          <>
            {/* Compact tip when sources already exist */}
            <div
              style={{
                margin: '8px 0 12px',
                padding: '10px 14px',
                background: '#faf8ff',
                border: '1px solid #efeaff',
                borderRadius: 10,
                fontSize: 12,
                color: '#6b4fb8',
                lineHeight: 1.5,
              }}
            >
              <b>Live data:</b> Remote sources re-fetch on every execute (server-side cache). Snapshot sources are cached on SpreadAPI and refreshed via webhook. Click a row to edit, hover for actions.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {dataSources.map((ds) => (
                <DataSourceRow
                  key={ds.id || ds.tableName}
                  ds={ds}
                  serviceId={serviceId}
                  typeLabel={sourceLabel(ds.source.type)}
                  icon={sourceIcon(ds.source.type)}
                  isDemoMode={isDemoMode}
                  onClick={onEditDataSource ? () => onEditDataSource(ds) : undefined}
                  onDelete={onDeleteDataSource ? () => onDeleteDataSource(ds.tableName) : undefined}
                  cannotUndoLabel={t('params.cannotUndo')}
                  yesLabel={t('common.yes')}
                  noLabel={t('common.no')}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (activeTab === 'areas') {
    // KI-Bereiche tab
    return (
      <div style={{ padding: '8px 4px' }}>
        {isLoading || !hasInitialized ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : (
          <>
            {/* Info box with dashed border */}
            {areas.length === 0 && (
              <div style={{
                margin: '8px 0 16px',
                padding: '14px 16px',
                border: '1.5px dashed #d9d9d9',
                borderRadius: 10,
                background: '#fafafa',
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 4 }}>
                  {t('params.aiAreasInfoTitle')}
                </div>
                <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
                  {t('params.aiAreasInfoDesc')}
                </div>
              </div>
            )}

            {/* Area cards */}
            {areas.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {areas.map((area, index) => {
                  const [areaHovered, setAreaHovered] = useState(false);
                  return (
                    <div
                      key={area.id || index}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: areaHovered ? '#faf8ff' : '#f8f7fa',
                        border: '1px solid #eee',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => onNavigateToArea(area)}
                      onMouseEnter={() => setAreaHovered(true)}
                      onMouseLeave={() => setAreaHovered(false)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Lightning icon */}
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: '#fff8e6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <ThunderboltOutlined style={{ color: '#faad14', fontSize: 16 }} />
                        </div>

                        {/* Name and address */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{area.name}</div>
                          <div style={{ fontSize: 12, color: '#aaa' }}>{area.address}</div>
                        </div>

                        {/* Delete button */}
                        {!isDemoMode && (
                          <Button
                            size="small"
                            type="text"
                            icon={<DeleteOutlined style={{ color: areaHovered ? '#888' : '#ccc' }} />}
                            style={{ opacity: areaHovered ? 1 : 0, transition: 'opacity 0.15s' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              Modal.confirm({
                                title: t('params.deleteArea'),
                                content: t('params.cannotUndo'),
                                okText: t('common.yes'),
                                cancelText: t('common.no'),
                                okButtonProps: { danger: true },
                                onOk: () => onRemoveArea(index),
                              });
                            }}
                          />
                        )}
                      </div>

                      {/* Description */}
                      {area.description && (
                        <div style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: '#888',
                          lineHeight: 1.5,
                          paddingLeft: 42,
                        }}>
                          {area.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Parameters tab (default)
  return (
    <div style={{ padding: '0 4px' }}>
      {/* Input Parameters */}
      <SectionHeader title={t('params.inputParameters')} count={inputs.length} />
      {isLoading || !hasInitialized ? (
        <Skeleton active paragraph={{ rows: 2 }} style={{ padding: '0 8px' }} />
      ) : inputs.length === 0 ? (
        <div style={{ color: '#aaa', padding: '8px 8px 16px', fontSize: 13 }}>
          {t('params.emptyInputHint')}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleInputDragEnd}>
          <SortableContext items={inputs.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {inputs.map((input) => (
                <SortableParameterItem
                  key={input.id}
                  parameter={input}
                  type="input"
                  isDemoMode={isDemoMode}
                  useCompactLayout={useCompactLayout}
                  onNavigate={() => onNavigateToParameter(input)}
                  onEdit={() => onEditParameter('input', input)}
                  onDelete={() => onDeleteParameter('input', input.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Output Parameters */}
      <SectionHeader title={t('params.outputParameters')} count={outputs.length} />
      {isLoading || !hasInitialized ? (
        <Skeleton active paragraph={{ rows: 2 }} style={{ padding: '0 8px' }} />
      ) : outputs.length === 0 ? (
        <div style={{ color: '#aaa', padding: '8px 8px 16px', fontSize: 13 }}>
          {t('params.emptyOutputHint')}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleOutputDragEnd}>
          <SortableContext items={outputs.map(o => o.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {outputs.map((output) => (
                <SortableParameterItem
                  key={output.id}
                  parameter={output}
                  type="output"
                  isDemoMode={isDemoMode}
                  useCompactLayout={useCompactLayout}
                  onNavigate={() => onNavigateToParameter(output)}
                  onEdit={() => onEditParameter('output', output)}
                  onDelete={() => onDeleteParameter('output', output.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div style={{ padding: '8px 8px 16px' }}>
        <Button
          type="link"
          size="small"
          icon={<InfoCircleOutlined />}
          onClick={onShowHowItWorks}
          style={{ padding: 0, fontSize: 12, color: '#9233E9' }}
        >
          {t('params.howItWorks')}
        </Button>
      </div>
    </div>
  );
};

export default ParametersSection;
