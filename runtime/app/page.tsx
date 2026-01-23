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

interface ServiceDetail {
  serviceId: string;
  name: string;
  title: string;
  description: string;
  inputs: Array<{
    name: string;
    title: string;
    type: string;
    required: boolean;
    defaultValue?: any;
    min?: number;
    max?: number;
  }>;
  outputs: Array<{
    name: string;
    title: string;
  }>;
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

  // Test panel state
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [serviceDetail, setServiceDetail] = useState<ServiceDetail | null>(null);
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const fetchData = async () => {
    try {
      const [servicesRes, logsRes, analyticsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/logs?limit=10'),
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
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load service detail when selected
  useEffect(() => {
    if (selectedService) {
      fetch(`/api/services/${selectedService}`)
        .then(res => res.json())
        .then(data => {
          setServiceDetail(data);
          // Initialize inputs with default values
          const defaults: Record<string, string> = {};
          (data.inputs || []).forEach((inp: any) => {
            defaults[inp.name] = inp.defaultValue !== undefined ? String(inp.defaultValue) : '';
          });
          setTestInputs(defaults);
          setTestResult(null);
        })
        .catch(err => console.error('Failed to load service:', err));
    } else {
      setServiceDetail(null);
      setTestInputs({});
      setTestResult(null);
    }
  }, [selectedService]);

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
        if (selectedService === serviceId) {
          setSelectedService(null);
        }
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete service' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete service' });
    }
  };

  const handleTest = async () => {
    if (!selectedService) return;

    setTesting(true);
    setTestResult(null);

    try {
      // Convert string inputs to proper types
      const inputs: Record<string, any> = {};
      for (const [key, value] of Object.entries(testInputs)) {
        if (value === '') continue;
        // Try to parse as number
        const num = Number(value);
        if (!isNaN(num)) {
          inputs[key] = num;
        } else if (value === 'true') {
          inputs[key] = true;
        } else if (value === 'false') {
          inputs[key] = false;
        } else {
          inputs[key] = value;
        }
      }

      const res = await fetch(`/api/execute/${selectedService}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs }),
      });

      const data = await res.json();
      setTestResult(data);
      fetchData(); // Refresh logs
    } catch (err: any) {
      setTestResult({ error: 'Request failed', message: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {/* Left: Services */}
        <div>
          <h2 style={{ fontSize: '16px', marginBottom: '15px' }}>Services ({services.length})</h2>

          {/* Upload Form */}
          <form onSubmit={handleUpload} style={{
            padding: '15px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '2px dashed #ddd',
          }}>
            <input type="file" accept=".json" style={{ marginBottom: '10px', display: 'block', fontSize: '13px' }} />
            <button type="submit" disabled={uploading} style={{
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.7 : 1,
            }}>
              {uploading ? 'Uploading...' : 'Upload JSON'}
            </button>
          </form>

          {/* Service List */}
          {loading ? (
            <p style={{ color: '#666', fontSize: '13px' }}>Loading...</p>
          ) : services.length === 0 ? (
            <p style={{ color: '#666', fontSize: '13px' }}>No services yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {services.map((service) => (
                <div
                  key={service.serviceId}
                  onClick={() => setSelectedService(service.serviceId)}
                  style={{
                    padding: '12px',
                    backgroundColor: selectedService === service.serviceId ? '#e0f2fe' : '#fff',
                    borderRadius: '6px',
                    border: selectedService === service.serviceId ? '2px solid #0070f3' : '1px solid #eee',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>{service.title}</div>
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{service.serviceId}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(service.serviceId); }}
                      style={{
                        padding: '2px 6px',
                        fontSize: '11px',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#888' }}>
                    {service.inputCount} inputs · {service.outputCount} outputs
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle: Test Panel */}
        <div>
          <h2 style={{ fontSize: '16px', marginBottom: '15px' }}>Test Service</h2>

          {!selectedService ? (
            <p style={{ color: '#666', fontSize: '13px' }}>← Select a service to test</p>
          ) : !serviceDetail ? (
            <p style={{ color: '#666', fontSize: '13px' }}>Loading...</p>
          ) : (
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
              <div style={{ padding: '12px 15px', backgroundColor: '#f9fafb', borderBottom: '1px solid #eee' }}>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>{serviceDetail.title}</div>
                {serviceDetail.description && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{serviceDetail.description}</div>
                )}
              </div>

              <div style={{ padding: '15px' }}>
                {/* Inputs */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '10px', color: '#555' }}>INPUTS</div>
                  {serviceDetail.inputs.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#888' }}>No inputs defined</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {serviceDetail.inputs.map((inp) => (
                        <div key={inp.name}>
                          <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px', color: '#555' }}>
                            {inp.title || inp.name}
                            {inp.required && <span style={{ color: '#ef4444' }}> *</span>}
                            <span style={{ color: '#888', marginLeft: '5px' }}>({inp.type})</span>
                          </label>
                          <input
                            type="text"
                            value={testInputs[inp.name] || ''}
                            onChange={(e) => setTestInputs({ ...testInputs, [inp.name]: e.target.value })}
                            placeholder={inp.defaultValue !== undefined ? `Default: ${inp.defaultValue}` : ''}
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              fontSize: '13px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              boxSizing: 'border-box',
                            }}
                          />
                          {(inp.min !== undefined || inp.max !== undefined) && (
                            <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
                              {inp.min !== undefined && `Min: ${inp.min}`}
                              {inp.min !== undefined && inp.max !== undefined && ' · '}
                              {inp.max !== undefined && `Max: ${inp.max}`}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Execute Button */}
                <button
                  onClick={handleTest}
                  disabled={testing}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: testing ? 'not-allowed' : 'pointer',
                    opacity: testing ? 0.7 : 1,
                  }}
                >
                  {testing ? 'Executing...' : 'Execute'}
                </button>

                {/* Result */}
                {testResult && (
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '8px', color: '#555' }}>
                      {testResult.error ? 'ERROR' : 'OUTPUTS'}
                    </div>
                    {testResult.error ? (
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#fee2e2',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#991b1b',
                      }}>
                        <div style={{ fontWeight: 500 }}>{testResult.error}</div>
                        {testResult.message && <div style={{ marginTop: '4px' }}>{testResult.message}</div>}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(testResult.outputs || []).map((out: any) => (
                          <div key={out.name} style={{
                            padding: '8px 10px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                            <span style={{ fontSize: '12px', color: '#555' }}>{out.title || out.name}</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#065f46' }}>
                              {typeof out.value === 'object' ? JSON.stringify(out.value) : String(out.value)}
                            </span>
                          </div>
                        ))}
                        {testResult.metadata && (
                          <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
                            {testResult.metadata.executionTime}ms
                            {testResult.metadata.cached && ' · cached'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Logs */}
        <div>
          <h2 style={{ fontSize: '16px', marginBottom: '15px' }}>Recent Requests</h2>
          {logs.length === 0 ? (
            <p style={{ color: '#666', fontSize: '13px' }}>No requests yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {logs.map((log, i) => (
                <div key={i} style={{
                  padding: '8px 10px',
                  backgroundColor: '#fff',
                  borderRadius: '5px',
                  border: '1px solid #eee',
                  fontSize: '12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>{log.serviceId}</span>
                    <span style={{
                      padding: '1px 5px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      backgroundColor: log.status === 'success' ? '#d1fae5' : '#fee2e2',
                      color: log.status === 'success' ? '#065f46' : '#991b1b',
                    }}>
                      {log.status}
                    </span>
                  </div>
                  <div style={{ marginTop: '4px', color: '#888', fontSize: '10px' }}>
                    {log.executionTime}ms {log.cached && '· cached'} · {new Date(log.timestamp).toLocaleTimeString()}
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
