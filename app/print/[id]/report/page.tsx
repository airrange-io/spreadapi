'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Table, Typography, Card, Button, Spin, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import styles from './report.module.css';

const { Title, Text, Paragraph } = Typography;

interface ReportData {
  serviceId: string;
  inputs: Record<string, any>;
  outputs?: any[];
  metadata?: {
    title?: string;
    description?: string;
  };
  printSettings?: {
    orientation?: string;
  };
}

export default function ReportPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [calculationResults, setCalculationResults] = useState<any>(null);

  useEffect(() => {
    loadReportData();
  }, [jobId]);

  const loadReportData = async () => {
    try {
      // Get print job data
      const dataResponse = await fetch(`/api/print/${jobId}/data`);
      if (!dataResponse.ok) {
        throw new Error('Failed to load print job');
      }
      
      const data = await dataResponse.json();
      setReportData(data);
      
      // Execute the calculation to get results
      const queryParams = new URLSearchParams();
      queryParams.append('api', data.serviceId);
      Object.entries(data.inputs).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      
      const calcResponse = await fetch(`/api/getresults?${queryParams.toString()}`);
      if (calcResponse.ok) {
        const results = await calcResponse.json();
        setCalculationResults(results);
      }
      
      setLoading(false);
      
      // Auto-show print dialog after a short delay
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (error) {
      console.error('Error loading report:', error);
      message.error('Failed to load report data');
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="default" tip="Loading report..." />
      </div>
    );
  }

  if (!reportData || !calculationResults) {
    return (
      <div className={styles.errorContainer}>
        <Card>
          <Title level={4}>Error Loading Report</Title>
          <Paragraph>Unable to load the report data. Please try again.</Paragraph>
        </Card>
      </div>
    );
  }

  // Format inputs for display
  const inputData = calculationResults.inputs?.map((input: any) => ({
    key: input.alias,
    parameter: input.alias || input.name,
    value: input.value,
    type: 'Input'
  })) || [];

  // Format outputs for display
  const outputData = calculationResults.outputs?.map((output: any) => ({
    key: output.alias,
    parameter: output.alias || output.name,
    value: output.value,
    type: 'Output'
  })) || [];

  const allData = [...inputData, ...outputData];

  return (
    <div className={styles.reportContainer}>
      {/* Print button - hidden when printing */}
      <div className={styles.printControls}>
        <Button 
          type="primary" 
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          size="large"
        >
          Print Report (Ctrl+P)
        </Button>
      </div>

      {/* Report content */}
      <div className={styles.reportContent}>
        {/* Header */}
        <div className={styles.reportHeader}>
          <Title level={2}>
            {reportData.metadata?.title || 'SpreadAPI Calculation Report'}
          </Title>
          {reportData.metadata?.description && (
            <Paragraph>{reportData.metadata.description}</Paragraph>
          )}
          <Text type="secondary">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </Text>
        </div>

        {/* Calculation Results Table */}
        <div className={styles.section}>
          <Title level={3}>Calculation Results</Title>
          <Table
            dataSource={allData}
            pagination={false}
            bordered
            size="middle"
          >
            <Table.Column 
              title="Parameter" 
              dataIndex="parameter" 
              key="parameter"
              width="40%"
            />
            <Table.Column 
              title="Value" 
              dataIndex="value" 
              key="value"
              render={(value: any) => {
                if (typeof value === 'number') {
                  return value.toLocaleString('en-US', { 
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 0
                  });
                }
                return value;
              }}
            />
            <Table.Column 
              title="Type" 
              dataIndex="type" 
              key="type"
              width="20%"
            />
          </Table>
        </div>

        {/* Footer */}
        <div className={styles.reportFooter}>
          <Text type="secondary">
            This report was generated by SpreadAPI • {window.location.hostname}
          </Text>
        </div>
      </div>
    </div>
  );
}