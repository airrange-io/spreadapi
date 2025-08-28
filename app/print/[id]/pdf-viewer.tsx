'use client';

import { useEffect, useState, useRef } from 'react';
import { Spin, Card, Typography, Button, message } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface PDFViewerProps {
  jobId: string;
}

export default function PDFViewer({ jobId }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetchJobData();
  }, [jobId]);

  const fetchJobData = async () => {
    try {
      const response = await fetch(`/api/print/${jobId}/data`);
      
      if (!response.ok) {
        throw new Error('Failed to load print job data');
      }
      
      const data = await response.json();
      setJobData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching job data:', err);
      setError('Failed to load print job');
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Focus the iframe and trigger print
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDirectPrint = () => {
    // Use window.print() for direct printing
    window.print();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="default" tip="Loading report..." />
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Card>
          <Title level={4}>Error</Title>
          <Paragraph>{error || 'Failed to load report'}</Paragraph>
        </Card>
      </div>
    );
  }

  // Build the service URL with inputs
  const queryParams = new URLSearchParams();
  Object.entries(jobData.inputs).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  const serviceUrl = `/service/${jobData.serviceId}?${queryParams.toString()}&printMode=true`;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Print controls */}
      <div style={{ 
        padding: '1rem', 
        background: '#fff', 
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
      className="no-print">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {jobData.metadata?.title || 'Calculation Report'}
          </Title>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Print / Save as PDF
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            onClick={() => {
              // Open in new window for manual save
              window.open(serviceUrl, '_blank');
            }}
          >
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Embedded service viewer */}
      <iframe
        ref={iframeRef}
        src={serviceUrl}
        style={{ 
          width: '100%', 
          flex: 1, 
          border: 'none',
          background: '#f0f2f5'
        }}
        title="Report Preview"
        onLoad={() => {
          // Auto-trigger print dialog after iframe loads
          setTimeout(() => {
            message.info('Use Ctrl+P (or Cmd+P on Mac) to print or save as PDF');
          }, 1000);
        }}
      />

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          iframe {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
          }
        }
      `}</style>
    </div>
  );
}