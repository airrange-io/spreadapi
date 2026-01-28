'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
  uploadedAt?: string;
}

interface LogEntry {
  timestamp: string;
  serviceId: string;
  status: string;
  executionTime: number;
  cached: boolean;
  errorCode?: string;
}

const PRIMARY_COLOR = '#6B4C9A';
const PRIMARY_HOVER = '#5a3d87';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;

    Promise.all([
      fetch(`/api/services/${serviceId}`).then(r => r.json()),
      fetch(`/api/logs?limit=20&serviceId=${serviceId}`).then(r => r.json()),
    ]).then(([serviceData, logsData]) => {
      setService(serviceData);
      setLogs(logsData.logs || []);

      // Initialize inputs with default values
      const defaults: Record<string, string> = {};
      (serviceData.inputs || []).forEach((inp: any) => {
        defaults[inp.name] = inp.defaultValue !== undefined ? String(inp.defaultValue) : '';
      });
      setTestInputs(defaults);
    }).catch(err => {
      console.error('Failed to load service:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [serviceId]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const inputs: Record<string, any> = {};
      for (const [key, value] of Object.entries(testInputs)) {
        if (value === '') continue;
        const num = Number(value);
        if (!isNaN(num)) inputs[key] = num;
        else if (value === 'true') inputs[key] = true;
        else if (value === 'false') inputs[key] = false;
        else inputs[key] = value;
      }

      const res = await fetch(`/api/execute/${serviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs }),
      });

      const data = await res.json();
      setTestResult(data);

      // Refresh logs
      const logsRes = await fetch(`/api/logs?limit=20&serviceId=${serviceId}`);
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);
    } catch (err: any) {
      setTestResult({ error: 'Request failed', message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getGetUrl = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const params = Object.entries(testInputs)
      .filter(([_, v]) => v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return `${base}/api/execute/${serviceId}${params ? '?' + params : ''}`;
  };

  const getPostBody = () => {
    const inputs = Object.fromEntries(
      Object.entries(testInputs)
        .filter(([_, v]) => v !== '')
        .map(([k, v]) => {
          const num = Number(v);
          if (!isNaN(num)) return [k, num];
          if (v === 'true') return [k, true];
          if (v === 'false') return [k, false];
          return [k, v];
        })
    );
    return JSON.stringify({ inputs }, null, 2);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>404</div>
          <div style={{ color: '#6b7280', marginBottom: '24px' }}>Service not found</div>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: PRIMARY_COLOR,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
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
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>{service.title}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{serviceId}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
          {/* Left: Test Panel */}
          <div>
            {/* Service Info */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600 }}>Service Information</h2>
              {service.description && (
                <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '14px' }}>{service.description}</p>
              )}
              <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#6b7280' }}>
                <div><strong>{service.inputs.length}</strong> inputs</div>
                <div><strong>{service.outputs.length}</strong> outputs</div>
                {service.uploadedAt && (
                  <div>Uploaded {new Date(service.uploadedAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>

            {/* Test Inputs */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
              }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>Test Service</h3>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Input Fields */}
                {service.inputs.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px' }}>No inputs required</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {service.inputs.map((inp) => (
                      <div key={inp.name}>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: 500,
                          marginBottom: '6px',
                          color: '#374151',
                        }}>
                          {inp.title || inp.name}
                          {inp.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                          <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: '8px' }}>{inp.type}</span>
                        </label>
                        <input
                          type="text"
                          value={testInputs[inp.name] || ''}
                          onChange={(e) => setTestInputs({ ...testInputs, [inp.name]: e.target.value })}
                          placeholder={inp.defaultValue !== undefined ? `Default: ${inp.defaultValue}` : ''}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            fontSize: '14px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            transition: 'border-color 0.15s',
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = PRIMARY_COLOR}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                        />
                        {(inp.min !== undefined || inp.max !== undefined) && (
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                            {inp.min !== undefined && `Min: ${inp.min}`}
                            {inp.min !== undefined && inp.max !== undefined && ' · '}
                            {inp.max !== undefined && `Max: ${inp.max}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Execute Button */}
                <button
                  onClick={handleTest}
                  disabled={testing}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 600,
                    backgroundColor: PRIMARY_COLOR,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: testing ? 'not-allowed' : 'pointer',
                    opacity: testing ? 0.7 : 1,
                    transition: 'background-color 0.15s',
                  }}
                  onMouseOver={(e) => !testing && (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = PRIMARY_COLOR}
                >
                  {testing ? 'Executing...' : 'Execute'}
                </button>

                {/* Result */}
                {testResult && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: testResult.error ? '#dc2626' : '#059669' }}>
                      {testResult.error ? 'Error' : 'Result'}
                    </h4>
                    {testResult.error ? (
                      <div style={{
                        padding: '16px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                      }}>
                        <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: '4px' }}>{testResult.error}</div>
                        {testResult.message && <div style={{ color: '#991b1b', fontSize: '14px' }}>{testResult.message}</div>}
                      </div>
                    ) : (
                      <div style={{
                        padding: '16px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0',
                      }}>
                        {(testResult.outputs || []).map((out: any) => (
                          <div key={out.name} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0',
                            borderBottom: '1px solid #dcfce7',
                          }}>
                            <span style={{ color: '#166534', fontSize: '14px' }}>{out.title || out.name}</span>
                            <span style={{ fontWeight: 600, color: '#166534', fontSize: '16px' }}>
                              {typeof out.value === 'object' ? JSON.stringify(out.value) : String(out.value)}
                            </span>
                          </div>
                        ))}
                        {testResult.metadata && (
                          <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                            Execution: {testResult.metadata.executionTime}ms
                            {testResult.metadata.cached && ' (cached)'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* API Reference */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              marginTop: '24px',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
              }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>API Reference</h3>
              </div>

              <div style={{ padding: '24px' }}>
                {/* GET Request */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>GET</span>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Query parameters</span>
                  </div>
                  <div style={{
                    position: 'relative',
                    padding: '12px 14px',
                    paddingRight: '80px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <code style={{ fontSize: '12px', wordBreak: 'break-all', color: '#334155' }}>
                      {getGetUrl()}
                    </code>
                    <button
                      onClick={() => copyToClipboard(getGetUrl(), 'get')}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        backgroundColor: copied === 'get' ? '#d1fae5' : '#fff',
                        color: copied === 'get' ? '#059669' : '#6b7280',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {copied === 'get' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* POST Request */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>POST</span>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>JSON body</span>
                  </div>
                  <div style={{
                    position: 'relative',
                    padding: '12px 14px',
                    paddingRight: '80px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '8px',
                  }}>
                    <code style={{ fontSize: '12px', color: '#334155' }}>
                      {typeof window !== 'undefined' ? window.location.origin : ''}/api/execute/{serviceId}
                    </code>
                  </div>
                  <div style={{
                    position: 'relative',
                    padding: '12px 14px',
                    paddingRight: '80px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <pre style={{ margin: 0, fontSize: '12px', color: '#334155', whiteSpace: 'pre-wrap' }}>
                      {getPostBody()}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(getPostBody(), 'post')}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        backgroundColor: copied === 'post' ? '#d1fae5' : '#fff',
                        color: copied === 'post' ? '#059669' : '#6b7280',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {copied === 'post' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Logs */}
          <div>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              position: 'sticky',
              top: 92,
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>Recent Requests</h3>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{logs.length} logs</span>
              </div>

              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {logs.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                    No requests yet
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} style={{
                      padding: '12px 20px',
                      borderBottom: '1px solid #f3f4f6',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 500,
                          backgroundColor: log.status === 'success' ? '#d1fae5' : '#fee2e2',
                          color: log.status === 'success' ? '#059669' : '#dc2626',
                        }}>
                          {log.status}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {log.executionTime}ms
                        {log.cached && <span style={{ marginLeft: '8px', color: '#9ca3af' }}>cached</span>}
                        {log.errorCode && <span style={{ marginLeft: '8px', color: '#dc2626' }}>{log.errorCode}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Expected Outputs */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              marginTop: '24px',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
              }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>Output Schema</h3>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {service.outputs.length === 0 ? (
                  <div style={{ color: '#9ca3af', fontSize: '14px' }}>No outputs defined</div>
                ) : (
                  service.outputs.map((out) => (
                    <div key={out.name} style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>{out.title || out.name}</span>
                      <code style={{ fontSize: '12px', color: '#9ca3af' }}>{out.name}</code>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
