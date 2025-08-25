'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Spin, Result, Button, Card, Typography } from 'antd';
import { DownloadOutlined, FileTextOutlined, ClockCircleOutlined, PrinterOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';

const { Title, Text, Paragraph } = Typography;

// Dynamically import the PDF viewer to avoid SSR issues
const PDFViewer = dynamic(() => import('./pdf-viewer'), { 
  ssr: false,
  loading: () => <Spin size="large" />
});

interface PrintJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  pdfUrl?: string;
  expiresAt: string;
  error?: string;
}

export default function PrintPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  const [status, setStatus] = useState<PrintJobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    checkJobStatus();
  }, [jobId]);

  const checkJobStatus = async () => {
    try {
      const response = await fetch(`/api/print/jobs/${jobId}/status`);
      
      if (response.status === 404) {
        setError('Print job not found. The link may be invalid or expired.');
        setLoading(false);
        return;
      }
      
      if (response.status === 410) {
        const data = await response.json();
        setStatus({ ...data, status: 'expired' });
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to check print job status');
      }
      
      const data: PrintJobStatus = await response.json();
      setStatus(data);
      setLoading(false);
      
      // If status is pending, show the PDF viewer
      if (data.status === 'pending') {
        // Don't auto-generate, let user click the button
      }
    } catch (err) {
      console.error('Error checking job status:', err);
      setError('Failed to load print job. Please try again.');
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      // Get the print job data
      const response = await fetch(`/api/print/${jobId}/data`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get print data');
      }
      
      const jobData = await response.json();
      
      // Open the service viewer page with the inputs as query params
      // This will show the spreadsheet with the calculated values
      const queryParams = new URLSearchParams();
      
      // Add all inputs as query parameters for the service viewer
      Object.entries(jobData.inputs).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      // Open service viewer page in new tab for printing
      const serviceUrl = `/service/${jobData.serviceId}?${queryParams.toString()}`;
      window.open(serviceUrl, '_blank');
      
      // Update status
      setStatus(prev => prev ? { ...prev, status: 'completed' } : null);
      setGenerating(false);
      
      // Show message about printing
      setError(null);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      setGenerating(false);
    }
  };

  const formatExpiryTime = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const hoursLeft = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
    
    if (hoursLeft === 0) {
      const minutesLeft = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60)));
      return `${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}`;
    }
    
    return `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Card style={{ textAlign: 'center', padding: '2rem' }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: '1rem' }}>Loading print job...</Paragraph>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Result
          status="error"
          title="Print Job Error"
          subTitle={error}
          extra={[
            <Button key="home" href="/">
              Go to Home
            </Button>
          ]}
        />
      </div>
    );
  }

  if (status?.status === 'expired') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Result
          status="warning"
          title="Print Link Expired"
          subTitle="This print link has expired. Print links are valid for 24 hours. Please generate a new one."
          extra={[
            <Button key="home" href="/">
              Go to Home
            </Button>
          ]}
        />
      </div>
    );
  }

  if (generating) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Card style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
          <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '1rem' }} />
          <Title level={3}>Generating PDF</Title>
          <Spin size="large" style={{ marginTop: '1rem' }} />
          <Paragraph style={{ marginTop: '1rem' }}>
            Your PDF report is being generated. This may take a few moments...
          </Paragraph>
        </Card>
      </div>
    );
  }

  if (status?.status === 'completed') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Result
          status="success"
          title="Report Opened"
          subTitle="Your calculation results have been opened in a new tab. Use your browser's Print function (Ctrl+P / Cmd+P) to save as PDF."
          extra={[
            <Button 
              key="open-again" 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={generatePDF}
            >
              Open Results Again
            </Button>,
            <Button key="home" href="/">
              Go to Home
            </Button>
          ]}
        />
      </div>
    );
  }

  if (status?.status === 'failed') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Result
          status="error"
          title="PDF Generation Failed"
          subTitle={status.error || 'Failed to generate PDF. Please try again.'}
          extra={[
            <Button key="retry" type="primary" onClick={generatePDF}>
              Retry
            </Button>,
            <Button key="home" href="/">
              Go to Home
            </Button>
          ]}
        />
      </div>
    );
  }

  // Redirect directly to service page with inputs for pending status
  if (status?.status === 'pending') {
    // Get the print job data and redirect to service page
    if (typeof window !== 'undefined') {
      fetch(`/api/print/${jobId}/data`)
        .then(res => res.json())
        .then(data => {
          const queryParams = new URLSearchParams();
          Object.entries(data.inputs).forEach(([key, value]) => {
            queryParams.append(key, String(value));
          });
          // Add print mode flag to show print-friendly version
          queryParams.append('printMode', 'true');
          window.location.href = `/service/${data.serviceId}?${queryParams.toString()}`;
        });
    }
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Spin size="large" tip="Loading spreadsheet..." />
      </div>
    );
  }

  // Default state - should not reach here normally
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ textAlign: 'center', padding: '2rem', maxWidth: '500px' }}>
        <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '1rem' }} />
        <Title level={3}>SpreadAPI Calculation Report</Title>
        
        <Paragraph>
          Loading your report...
        </Paragraph>
        
        {status && (
          <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            <Text type="secondary">
              <ClockCircleOutlined /> This link expires in {formatExpiryTime(status.expiresAt)}
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
}