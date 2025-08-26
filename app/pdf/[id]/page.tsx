'use client';

import dynamic from 'next/dynamic';

// Dynamically import the PDF generator component with no SSR
const PDFGenerator = dynamic(
  () => import('./PDFGeneratorClient'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <div>Loading PDF generator...</div>
      </div>
    )
  }
);

export default function PDFGeneratorPage() {
  return <PDFGenerator />;
}