'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Service {
  serviceId: string;
  name: string;
  title: string;
  description: string;
  inputCount: number;
  outputCount: number;
  uploadedAt: string | null;
}

interface Analytics {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgExecutionTime: number;
}

const PRIMARY_COLOR = '#6B4C9A';
const PRIMARY_HOVER = '#5a3d87';

export default function Dashboard() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [servicesRes, analyticsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/logs/analytics'),
      ]);

      const servicesData = await servicesRes.json();
      const analyticsData = await analyticsRes.json();

      setServices(servicesData.services || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Service uploaded successfully' });
        setShowUploadModal(false);
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete service "${serviceId}"?`)) return;

    try {
      const res = await fetch(`/api/services?id=${serviceId}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Service deleted' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete service' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete service' });
    }
  };

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: PRIMARY_COLOR,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>SpreadAPI Runtime</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="/api/health"
            target="_blank"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              color: '#374151',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} />
            Health
          </a>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#fff',
              backgroundColor: PRIMARY_COLOR,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = PRIMARY_COLOR}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Upload Service
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats Cards */}
        {analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <StatCard label="Services" value={services.length} icon="grid" />
            <StatCard label="Total Requests" value={analytics.totalRequests} icon="activity" />
            <StatCard label="Success Rate" value={analytics.totalRequests > 0 ? `${Math.round((analytics.successCount / analytics.totalRequests) * 100)}%` : '—'} icon="check" color="#10b981" />
            <StatCard label="Avg Response" value={`${analytics.avgExecutionTime}ms`} icon="clock" />
          </div>
        )}

        {/* Message */}
        {message && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.6 }}>×</button>
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                backgroundColor: 'transparent',
              }}
            />
          </div>
        </div>

        {/* Services Table */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 100px 80px 50px',
            padding: '14px 20px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '12px',
            fontWeight: 600,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            <div>Name</div>
            <div>Description</div>
            <div>Inputs</div>
            <div>Outputs</div>
            <div></div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
          ) : filteredServices.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <div style={{ fontSize: '16px', color: '#374151', marginBottom: '8px' }}>No services found</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {searchQuery ? 'Try a different search term' : 'Upload a service package to get started'}
              </div>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service.serviceId}
                onClick={() => router.push(`/service/${service.serviceId}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 100px 80px 50px',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div>
                  <div style={{ color: PRIMARY_COLOR, fontWeight: 500, fontSize: '15px' }}>{service.title}</div>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{service.serviceId}</div>
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                  {service.description || <span style={{ color: '#d1d5db' }}>No description</span>}
                </div>
                <div style={{ color: '#374151', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                  {service.inputCount}
                </div>
                <div style={{ color: '#374151', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                  {service.outputCount}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <button
                    onClick={(e) => handleDelete(service.serviceId, e)}
                    style={{
                      padding: '6px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#9ca3af',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
        }} onClick={() => setShowUploadModal(false)}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '480px',
            margin: '20px',
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600 }}>Upload Service Package</h2>
            <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '14px' }}>
              Upload a JSON file exported from SpreadAPI.io
            </p>

            <div
              style={{
                border: '2px dashed #e5e7eb',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = PRIMARY_COLOR; e.currentTarget.style.backgroundColor = '#faf5ff'; }}
              onDragLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.backgroundColor = 'transparent';
                const file = e.dataTransfer.files[0];
                if (file && file.name.endsWith('.json')) handleUpload(file);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
              <div style={{ marginBottom: '12px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <div style={{ color: '#374151', fontWeight: 500, marginBottom: '4px' }}>
                {uploading ? 'Uploading...' : 'Drop file here or click to browse'}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>JSON files only</div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  color: '#374151',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color?: string }) {
  const icons: Record<string, React.ReactElement> = {
    grid: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    activity: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12" /></svg>,
    check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" /></svg>,
    clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>,
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ color: color || '#6b7280' }}>{icons[icon]}</div>
        <span style={{ fontSize: '13px', color: '#6b7280' }}>{label}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 600, color: color || '#1f2937' }}>{value}</div>
    </div>
  );
}
