import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>SpreadAPI</h1>
      <p>API Service is running</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Tools</h2>
        <ul>
          <li><Link href="/api-tester">API Service Tester</Link></li>
          <li><Link href="/api/cache-stats">Cache Statistics</Link></li>
          <li><Link href="/api/diagnose-cache">Cache Diagnostics</Link></li>
        </ul>
      </div>
    </main>
  )
}