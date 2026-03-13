'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import '@/styles/dashboard.css';
import { Empty, Button, Spin, App } from 'antd';
import { PlusOutlined, FolderOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { deleteLocalService } from '@/lib/localServiceStorage';
import type { LocalService } from '@/lib/localServiceStorage';
import { useAuth } from '@/components/auth/AuthContext';
import { useRealtimeCallCounts } from '@/hooks/useRealtimeCallCounts';
import { ServiceCardCompact } from '@/components/ServiceCardCompact';
import { FolderCard } from '@/components/FolderCard';
import {
  listFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  addServiceToFolder,
  removeServiceFromFolder,
  getServiceFolderId,
} from '@/lib/folderStorage';
import type { Folder } from '@/lib/folderStorage';
import type { MenuProps } from 'antd';

interface Service {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'published' | 'private';
  createdAt: string;
  updatedAt: string;
  calls: number;
  lastUsed: string | null;
}

interface ServiceListProps {
  searchQuery?: string;
  viewMode?: 'grid' | 'list';
  isAuthenticated?: boolean | null;
  onServiceCount?: (count: number) => void;
  onUseSample?: () => void;
  onCreateService?: () => void;
  localServices?: LocalService[];
  onLocalServicesChange?: () => void;
  activeFolderId?: string | null;
  onFolderOpen?: (folderId: string, folderName: string) => void;
  onFolderClose?: () => void;
}

export default function ServiceList({ searchQuery = '', viewMode = 'list', isAuthenticated = null, onServiceCount, onUseSample, onCreateService, localServices, onLocalServicesChange, activeFolderId, onFolderOpen, onFolderClose }: ServiceListProps) {
  const router = useRouter();
  const { notification } = App.useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(isAuthenticated === null);
  const [clickedServiceId, setClickedServiceId] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);

  // Load folders
  useEffect(() => {
    setFolders(listFolders());
  }, []);

  const refreshFolders = useCallback(() => {
    setFolders(listFolders());
  }, []);

  // Real-time call count updates via Pusher
  const { getCallCount } = useRealtimeCallCounts({
    userId: user?.id,
    enabled: !!user?.id,
  });

  // Merge cloud services with local (private) services
  const mergedServices = useMemo(() => {
    const localList: Service[] = (localServices || []).map(ls => ({
      id: ls.id,
      name: ls.name || (ls.config as any)?.name || 'Untitled',
      description: ls.description || (ls.config as any)?.description || '',
      status: 'private' as const,
      createdAt: ls.createdAt,
      updatedAt: ls.savedAt,
      calls: 0,
      lastUsed: null,
    }));
    return [...localList, ...services].sort((a, b) => {
      const toTime = (s: Service) => new Date(s.updatedAt || s.createdAt || 0).getTime();
      return toTime(b) - toTime(a);
    });
  }, [services, localServices]);

  // Derive filtered services from mergedServices + searchQuery
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return mergedServices;
    const query = searchQuery.toLowerCase();
    return mergedServices.filter(service =>
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.id.toLowerCase().includes(query)
    );
  }, [searchQuery, mergedServices]);

  // Split services by folder assignment
  const unassignedServices = useMemo(() => {
    return filteredServices.filter(s => !getServiceFolderId(s.id));
  }, [filteredServices, folders]); // eslint-disable-line react-hooks/exhaustive-deps

  const folderServices = useCallback((folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return [];
    return filteredServices.filter(s => folder.serviceIds.includes(s.id));
  }, [filteredServices, folders]);

  const loadServices = useCallback(async () => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);

      if (isAuthenticated === false) {
        setServices([]);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      if (isAuthenticated === null) {
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      const hankoCookie = document.cookie.split('; ').find(row => row.startsWith('hanko='));
      if (!hankoCookie) {
        setServices([]);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      const response = await fetch('/api/services', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        if (response.status === 401) {
          setServices([]);
          if (isAuthenticated) {
            window.location.href = '/login';
          }
        } else {
          notification.error({ message: t('serviceList.loadFailed') });
        }
      }
    } catch (error: any) {
      if (error?.status !== 401) {
        notification.error({ message: t('serviceList.loadFailed') });
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [isAuthenticated, notification, t]);

  useEffect(() => {
    if (isAuthenticated !== null) {
      loadServices();
    }
  }, [isAuthenticated, loadServices]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'refreshServiceList') loadServices();
    };
    const handleFocus = () => {
      const lastRefresh = window.localStorage.getItem('refreshServiceList');
      if (lastRefresh) {
        window.localStorage.removeItem('refreshServiceList');
        loadServices();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadServices]);

  useEffect(() => {
    onServiceCount?.(mergedServices.length);
  }, [mergedServices.length, onServiceCount]);

  const handleDelete = useCallback(async (serviceId: string, serviceName: string) => {
    const isPrivate = (localServices || []).some(ls => ls.id === serviceId);

    if (isPrivate) {
      try {
        await deleteLocalService(serviceId);
        removeServiceFromFolder(serviceId);
        refreshFolders();
        notification.success({ message: t('serviceList.serviceDeleted', { name: serviceName }) });
        onLocalServicesChange?.();
      } catch {
        notification.error({ message: t('serviceList.deleteFailed') });
      }
      return;
    }

    try {
      const response = await fetch(`/api/services?id=${serviceId}`, { method: 'DELETE' });

      if (response.ok) {
        removeServiceFromFolder(serviceId);
        refreshFolders();
        notification.success({ message: t('serviceList.serviceDeleted', { name: serviceName }) });
        setServices(prev => prev.filter(s => s.id !== serviceId));
        loadServices();
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData?.error?.includes('published')) {
          notification.warning({
            message: t('serviceList.cannotDeletePublished'),
            description: (
              <span>
                {({ en: <>Please unpublish <strong>{serviceName}</strong> first, then try deleting again.</>, de: <>Bitte <strong>{serviceName}</strong> zuerst deaktivieren, dann erneut versuchen.</> } as Record<string, React.ReactNode>)[locale] ?? <>Please unpublish <strong>{serviceName}</strong> first, then try deleting again.</>}
              </span>
            ),
          });
        } else {
          notification.error({ message: t('serviceList.deleteFailed') });
        }
      }
    } catch {
      notification.error({ message: t('serviceList.deleteFailed') });
    }
  }, [notification, t, locale, localServices, onLocalServicesChange, loadServices, refreshFolders]);

  const handleEdit = useCallback((serviceId: string) => {
    setClickedServiceId(serviceId);
    router.push(`/app/service/${serviceId}`);
  }, [router]);

  const handleCopyId = useCallback((serviceId: string) => {
    navigator.clipboard.writeText(serviceId);
    notification.success({ message: t('serviceList.idCopied') });
  }, [notification, t]);

  const handleCopyEndpoint = useCallback((serviceId: string) => {
    const endpoint = `${window.location.origin}/api/v1/services/${serviceId}/execute`;
    navigator.clipboard.writeText(endpoint);
    notification.success({ message: t('serviceList.endpointCopied') });
  }, [notification, t]);

  const handleDuplicate = useCallback(async (serviceId: string, serviceName: string) => {
    try {
      const res = await fetch(`/api/services/${serviceId}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        notification.error({ message: data.message || t('serviceList.duplicateFailed') });
        return;
      }
      notification.success({ message: t('serviceList.duplicated', { name: serviceName }) });
      loadServices();
    } catch {
      notification.error({ message: t('serviceList.duplicateFailed') });
    }
  }, [notification, t, loadServices]);

  // Folder handlers
  const handleCreateFolder = useCallback(() => {
    createFolder(t('folders.defaultName'));
    refreshFolders();
  }, [t, refreshFolders]);

  const handleRenameFolder = useCallback((folderId: string, newName: string) => {
    renameFolder(folderId, newName);
    if (folderId === activeFolderId) {
      onFolderOpen?.(folderId, newName);
    }
    refreshFolders();
  }, [refreshFolders, activeFolderId, onFolderOpen]);

  const handleDeleteFolder = useCallback((folderId: string) => {
    deleteFolder(folderId);
    if (folderId === activeFolderId) {
      onFolderClose?.();
    }
    refreshFolders();
  }, [refreshFolders, activeFolderId, onFolderClose]);

  const handleMoveToFolder = useCallback((serviceId: string, folderId: string) => {
    addServiceToFolder(folderId, serviceId);
    refreshFolders();
  }, [refreshFolders]);

  const handleRemoveFromFolder = useCallback((serviceId: string) => {
    removeServiceFromFolder(serviceId);
    refreshFolders();
  }, [refreshFolders]);

  // Build folder menu items for a service's kebab menu
  const getFolderMenuItems = useCallback((serviceId: string): MenuProps['items'] => {
    if (folders.length === 0) return [];
    const currentFolderId = getServiceFolderId(serviceId);

    const items: MenuProps['items'] = [
      {
        key: 'folder-submenu',
        icon: <FolderOutlined />,
        label: t('folders.moveToFolder'),
        children: [
          ...folders.map(f => ({
            key: `move-to-${f.id}`,
            icon: <FolderOutlined />,
            label: f.name,
            onClick: (e: any) => {
              e.domEvent.stopPropagation();
              handleMoveToFolder(serviceId, f.id);
            },
          })),
          ...(currentFolderId ? [
            { type: 'divider' as const },
            {
              key: 'remove-from-folder',
              label: t('folders.removeFromFolder'),
              onClick: (e: any) => {
                e.domEvent.stopPropagation();
                handleRemoveFromFolder(serviceId);
              },
            },
          ] : []),
        ],
      },
    ];
    return items;
  }, [folders, t, handleMoveToFolder, handleRemoveFromFolder]);

  // Render service cards
  const renderServices = (serviceList: Service[]) => (
    <div className={viewMode === 'grid' ? 'services-grid' : 'services-list'}>
      {serviceList.map(service => {
        const realtimeCount = getCallCount(service.id);
        const displayCount = realtimeCount !== undefined ? realtimeCount : service.calls;
        return (
          <ServiceCardCompact
            key={service.id}
            service={service}
            onClick={() => handleEdit(service.id)}
            onDelete={handleDelete}
            onCopyId={handleCopyId}
            onCopyEndpoint={handleCopyEndpoint}
            onDuplicate={handleDuplicate}
            isNavigating={clickedServiceId === service.id}
            callCount={displayCount}
            locale={locale}
            folderMenuItems={getFolderMenuItems(service.id)}
          />
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '20px 0'
      }}>
        <Spin size="default" />
      </div>
    );
  }

  if (mergedServices.length === 0 && !searchQuery) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 24px 32px',
        maxWidth: '560px',
        margin: '0 auto',
      }}>
        {/* Small illustration */}
        <div style={{ maxWidth: 280, marginBottom: 24 }}>
          <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <rect width="800" height="400" fill="#F9F9FB" rx="12"/>
            <rect x="50" y="100" width="300" height="200" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
            <rect x="70" y="120" width="260" height="30" fill="#F8F6FE"/>
            <rect x="70" y="160" width="80" height="30" fill="#E6F4FF"/>
            <rect x="160" y="160" width="80" height="30" fill="#F8F6FE"/>
            <rect x="250" y="160" width="80" height="30" fill="#F8F6FE"/>
            <rect x="70" y="200" width="80" height="30" fill="#F8F6FE"/>
            <rect x="160" y="200" width="80" height="30" fill="#E6F4FF"/>
            <rect x="250" y="200" width="80" height="30" fill="#F8F6FE"/>
            <rect x="70" y="240" width="80" height="30" fill="#F8F6FE"/>
            <rect x="160" y="240" width="80" height="30" fill="#F8F6FE"/>
            <rect x="250" y="240" width="80" height="30" fill="#FFE4E1"/>
            <path d="M370 200 L430 200" stroke="#9333EA" strokeWidth="3" strokeDasharray="5,5"/>
            <path d="M420 190 L430 200 L420 210" stroke="#9333EA" strokeWidth="3" fill="none"/>
            <rect x="450" y="100" width="300" height="200" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
            <rect x="470" y="120" width="260" height="40" fill="#F8F6FE"/>
            <text x="600" y="145" textAnchor="middle" fill="#0a0a0a" fontSize="16" fontWeight="500">API Endpoint</text>
            <rect x="470" y="180" width="260" height="100" rx="4" fill="#F8F6FE"/>
            <text x="490" y="210" fill="#5a5a5a" fontSize="14">{"{"}</text>
            <text x="510" y="230" fill="#5a5a5a" fontSize="14">{'"inputs": [...],'}</text>
            <text x="510" y="250" fill="#5a5a5a" fontSize="14">{'"outputs": [...]'}</text>
            <text x="490" y="270" fill="#5a5a5a" fontSize="14">{"}"}</text>
          </svg>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#262626',
          margin: '0 0 8px',
          textAlign: 'center',
        }}>
          {t('serviceList.emptyTitle')}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 14,
          color: '#8c8c8c',
          textAlign: 'center',
          margin: '0 0 24px',
          lineHeight: '1.6',
          maxWidth: '360px',
        }}>
          {t('serviceList.emptyDescription')}
        </p>

        {/* CTA Button */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={onCreateService}
          style={{
            borderRadius: 10,
            height: 44,
            paddingLeft: 24,
            paddingRight: 24,
            fontWeight: 500,
            marginBottom: 20,
            backgroundColor: '#7B3AED',
            borderColor: '#7B3AED',
          }}
        >
          {t('serviceList.emptyCreateButton')}
        </Button>

        {/* On-premises hint */}
        <p style={{
          fontSize: 14,
          color: '#8c8c8c',
          textAlign: 'center',
          margin: 0,
          lineHeight: '1.6',
        }}>
          {t('serviceList.onPremisesHint')} <a href="/on-premises" style={{ color: '#9333EA' }}>{t('serviceList.learnMore')}</a>
        </p>
      </div>
    );
  }

  if (filteredServices.length === 0 && searchQuery) {
    return (
      <Empty
        description={t('serviceList.noApisFound', { query: searchQuery })}
        style={{ marginTop: 100 }}
      />
    );
  }

  const activeFolder = activeFolderId ? folders.find(f => f.id === activeFolderId) : null;
  const activeFolderServices = activeFolderId ? folderServices(activeFolderId) : [];

  // Inside a folder — header shows back button + name (controlled by parent)
  if (activeFolder && activeFolderId) {
    return (
      <div style={{ padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          <div className="section-label">{t('sections.yourServices')}</div>
          <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
            {activeFolderServices.length}
          </span>
        </div>
        {activeFolderServices.length > 0 ? (
          renderServices(activeFolderServices)
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('serviceList.noApisFound', { query: '' })}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0' }}>
      {/* PROJECTS section */}
      {!searchQuery && (folders.length > 0 || isAuthenticated) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 6,
            marginBottom: 8,
          }}>
            <div className="section-label">{t('folders.title')}</div>
            <Button
              type="text"
              size="small"
              onClick={handleCreateFolder}
              style={{ fontSize: 12, color: '#8c8c8c', padding: '2px 8px' }}
            >
              {t('folders.newFolder')}
            </Button>
          </div>
          {folders.length > 0 ? (
            <div className={viewMode === 'grid' ? 'projects-row' : 'projects-list'}>
              {folders.map(folder => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  serviceCount={folderServices(folder.id).length}
                  variant={viewMode === 'grid' ? 'card' : 'row'}
                  onClick={() => onFolderOpen?.(folder.id, folder.name)}
                  onRename={(name) => handleRenameFolder(folder.id, name)}
                  onDelete={() => handleDeleteFolder(folder.id)}
                  onDropService={(serviceId) => handleMoveToFolder(serviceId, folder.id)}
                />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#bfbfbf' }}>
              {t('folders.noProjectsHint')}
            </div>
          )}
        </div>
      )}

      {/* Services in folders (when searching) */}
      {searchQuery && folders.map(folder => {
        const matching = folderServices(folder.id);
        if (matching.length === 0) return null;
        return (
          <div key={folder.id} style={{ marginBottom: 20 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>{folder.name}</div>
            {renderServices(matching)}
          </div>
        );
      })}

      {/* YOUR SERVICES / UNASSIGNED section */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 8,
      }}>
        <div className="section-label">
          {folders.length > 0 && !searchQuery ? t('sections.unassigned') : t('sections.yourServices')}
        </div>
        <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
          {(searchQuery ? filteredServices : unassignedServices).length}
        </span>
      </div>
      {renderServices(searchQuery ? filteredServices.filter(s => !folders.some(f => f.serviceIds.includes(s.id))) : unassignedServices)}
    </div>
  );
}
