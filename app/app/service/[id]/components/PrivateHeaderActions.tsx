'use client';

import React, { useRef } from 'react';
import { Button, Space, Tooltip, Dropdown, App } from 'antd';
import { SaveOutlined, DownloadOutlined, MoreOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';
import { saveLocalService } from '@/lib/localServiceStorage';

interface PrivateHeaderActionsProps {
  serviceId: string;
  spreadInstance: any;
  workbookRef: React.RefObject<any>;
  apiConfig: any;
  hasAnyChanges: boolean;
  configHasChanges: boolean;
  workbookChangeCount: number;
  loading: boolean;
  setLoading: (v: boolean) => void;
  isMobile: boolean;
  activeView: string;

  handleExportForRuntime: () => Promise<void>;
  handleExportToExcel: () => Promise<void>;
  handleExportServicePackage: () => Promise<void>;
  handleImportExcelUpdate: () => void;

  onSaveSuccess: (savedConfig: any) => void;
  onWorkbookSaveReset: () => void;
}

export default function PrivateHeaderActions({
  serviceId,
  spreadInstance,
  workbookRef,
  apiConfig,
  hasAnyChanges,
  configHasChanges,
  workbookChangeCount,
  loading,
  setLoading,
  isMobile,
  activeView,
  handleExportForRuntime,
  handleExportToExcel,
  handleExportServicePackage,
  handleImportExcelUpdate,
  onSaveSuccess,
  onWorkbookSaveReset,
}: PrivateHeaderActionsProps) {
  const { notification, modal } = App.useApp();
  const { t } = useTranslation();
  const isSavingRef = useRef(false);

  const saveTooltip = configHasChanges && workbookChangeCount > 0
    ? t('private.saveConfigAndWorkbookTooltip')
    : t('private.saveTooltip');

  const handleLocalSave = async () => {
    if (isSavingRef.current) return;

    if (!hasAnyChanges) {
      notification.info({ message: t('private.noChanges') });
      return;
    }

    try {
      isSavingRef.current = true;
      setLoading(true);

      notification.open({ message: t('private.savingLocally'), key: 'local-save', duration: 0 });

      const workbookJSON = spreadInstance?.toJSON?.() ?? null;
      // JSON round-trip strips non-serializable values (functions, etc.)
      // that IndexedDB's structured clone algorithm cannot handle
      const cleanConfig = JSON.parse(JSON.stringify(apiConfig));
      const cleanWorkbook = workbookJSON ? JSON.parse(JSON.stringify(workbookJSON)) : null;
      await saveLocalService(serviceId, cleanConfig, cleanWorkbook);

      notification.destroy('local-save');

      onSaveSuccess({ ...apiConfig });
      onWorkbookSaveReset();

      notification.success({ message: t('private.savedLocally') });
    } catch (error: any) {
      notification.destroy('local-save');
      notification.error({
        message: t('private.saveFailed', { error: error?.message || 'Unknown error' }),
      });
    } finally {
      isSavingRef.current = false;
      setLoading(false);
    }
  };

  const handleEnterprisePublish = () => {
    modal.info({
      title: t('enterprise.publishModalTitle'),
      closable: true,
      maskClosable: true,
      content: (
        <div>
          <p>{t('enterprise.publishModalDescription')}</p>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>{t('enterprise.publishModalPrivacy')}</p>
          <ol style={{ paddingLeft: 20 }}>
            <li>{t('enterprise.publishStep1')}</li>
            <li>{t('enterprise.publishStep2')}</li>
            <li>{t('enterprise.publishStep3')}</li>
          </ol>
          <p style={{ color: '#666', fontSize: 13 }}>{t('enterprise.publishModalNote')}</p>
        </div>
      ),
      okText: t('enterprise.exportRuntimePackage'),
      okButtonProps: { disabled: !spreadInstance, icon: <DownloadOutlined /> },
      onOk: () => handleExportForRuntime(),
    });
  };

  const moreMenuItems = [
    ...(isMobile ? [
      {
        key: 'enterprise-publish',
        label: t('enterprise.exportRuntimePackage'),
        icon: <DownloadOutlined />,
        onClick: handleEnterprisePublish,
      },
      {
        type: 'divider' as const,
      },
    ] : []),
    {
      key: 'import-excel',
      label: t('service.importFromExcel'),
      icon: <FileExcelOutlined />,
      onClick: () => handleImportExcelUpdate(),
      disabled: !spreadInstance || activeView !== 'Workbook',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'export-excel',
      label: t('service.exportToExcel'),
      icon: <FileExcelOutlined />,
      onClick: () => handleExportToExcel(),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'export-package',
      label: t('service.exportServicePackage'),
      icon: <DownloadOutlined />,
      onClick: () => handleExportServicePackage(),
      disabled: !spreadInstance,
    },
    {
      key: 'export-runtime',
      label: t('service.exportForRuntime'),
      icon: <DownloadOutlined />,
      onClick: handleEnterprisePublish,
      disabled: !spreadInstance,
    },
  ];

  return (
    <Space>
      {hasAnyChanges && (
        <Tooltip title={saveTooltip}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleLocalSave}
            loading={loading}
          >
            {t('common.save')}
          </Button>
        </Tooltip>
      )}

      {!isMobile && (
        <Button
          icon={<DownloadOutlined />}
          onClick={handleEnterprisePublish}
        >
          {t('service.publish')}
        </Button>
      )}

      <Dropdown
        menu={{ items: moreMenuItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          type="text"
          icon={<MoreOutlined />}
        />
      </Dropdown>
    </Space>
  );
}
