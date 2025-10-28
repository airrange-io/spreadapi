import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#9333EA' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '20px 0', color: '#333' }}>Page Not Found</h2>
      <p style={{ fontSize: '16px', margin: '10px 0 30px', color: '#666' }}>
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        style={{
          padding: '12px 24px',
          backgroundColor: '#9333EA',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '500'
        }}
      >
        Return Home
      </Link>
    </div>
  );
}
