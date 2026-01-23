'use client';

import { useState, useEffect } from 'react';

interface Service {
  serviceId: string;
  name: string;
  title: string;
  description: string;
  inputCount: number;
  outputCount: number;
  uploadedAt: string | null;
}

interface LogEntry {
  timestamp: string;
  serviceId: string;
  status: string;
  executionTime: number;
  cached: boolean;
  errorCode?: string;
}

interface Analytics {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgExecutionTime: number;
}

export default function Dashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [servicesRes, logsRes, analyticsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/logs?limit=20'),
        fetch('/api/logs/analytics'),
      ]);

      const servicesData = await servicesRes.json();
      const logsData = await logsRes.json();
      const analyticsData = await analyticsRes.json();

      setServices(servicesData.services || []);
      setLogs(logsData.logs || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    const form = e.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      setUploading(false);
      return;
    }

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
        form.reset();
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

  const handleDelete = async (serviceId: string) => {
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>SpreadAPI Runtime</h1>
          <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>Self-hosted calculation engine</p>
        </div>
        <a href="/api/health" target="_blank" style={{ color: '#0070f3', textDecoration: 'none', fontSize: '14px' }}>
          Health Check →
        </a>
      </header>

      {/* Stats */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
          <StatCard label="Total Requests" value={analytics.totalRequests} />
          <StatCard label="Success" value={analytics.successCount} color="#10b981" />
          <StatCard label="Errors" value={analytics.errorCount} color="#ef4444" />
          <StatCard label="Avg Time" value={`${analytics.avgExecutionTime}ms`} />
        </div>
      )}

      {/* Message */}
      {message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '6px',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Left: Services */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Services ({services.length})</h2>

          {/* Upload Form */}
          <form onSubmit={handleUpload} style={{
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '2px dashed #ddd',
          }}>
            <input
              type="file"
              accept=".json"
              style={{ marginBottom: '10px', display: 'block' }}
            />
            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Service JSON'}
            </button>
          </form>

          {/* Service List */}
          {loading ? (
            <p style={{ color: '#666' }}>Loading...</p>
          ) : services.length === 0 ? (
            <p style={{ color: '#666' }}>No services uploaded yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {services.map((service) => (
                <div key={service.serviceId} style={{
                  padding: '15px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #eee',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px', fontSize: '16px' }}>{service.title}</h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{service.serviceId}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(service.serviceId)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  {service.description && (
                    <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#555' }}>{service.description}</p>
                  )}
                  <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '12px', color: '#888' }}>
                    <span>{service.inputCount} inputs</span>
                    <span>{service.outputCount} outputs</span>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px' }}>
                    <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>
                      /api/execute/{service.serviceId}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Logs */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Recent Requests</h2>
          {logs.length === 0 ? (
            <p style={{ color: '#666' }}>No requests yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {logs.map((log, i) => (
                <div key={i} style={{
                  padding: '10px 12px',
                  backgroundColor: '#fff',
                  borderRadius: '6px',
                  border: '1px solid #eee',
                  fontSize: '13px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>{log.serviceId}</span>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      backgroundColor: log.status === 'success' ? '#d1fae5' : '#fee2e2',
                      color: log.status === 'success' ? '#065f46' : '#991b1b',
                    }}>
                      {log.status}
                    </span>
                  </div>
                  <div style={{ marginTop: '5px', color: '#888', fontSize: '11px', display: 'flex', gap: '10px' }}>
                    <span>{log.executionTime}ms</span>
                    {log.cached && <span>cached</span>}
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      padding: '15px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: '1px solid #eee',
    }}>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 600, color: color || '#111' }}>{value}</div>
    </div>
  );
}
