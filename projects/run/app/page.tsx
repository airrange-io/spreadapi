export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: '600px', margin: '0 auto', padding: '60px 20px' }}>
      <h1 style={{ fontSize: '2rem', color: '#9333EA', marginBottom: '1rem' }}>spreadapi.run</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>High-performance API endpoint for SpreadAPI services.</p>
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '2rem' }}>
        <code style={{ display: 'block', background: '#1e1e1e', color: '#e5e5e5', padding: '12px', borderRadius: '4px', fontSize: '0.9rem' }}>
          GET  https://spreadapi.run/&#123;id&#125;?param=value<br/>
          POST https://spreadapi.run/&#123;id&#125;
        </code>
      </div>
      <p style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
        100% compatible with spreadapi.io/api/v1/services/&#123;id&#125;/execute
      </p>
      <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#999' }}>
        <a href="https://spreadapi.io" style={{ color: '#9333EA' }}>spreadapi.io</a>
      </div>
    </div>
  );
}
