'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
// Using manual download instead of file-saver to avoid dependency
import { Spin, Result, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

// Import SpreadJS locally instead of CDN
import * as GC from '@mescius/spread-sheets';
import '@mescius/spread-sheets-print';
import '@mescius/spread-sheets-pdf';

const { Title, Paragraph } = Typography;

// Manual download function to avoid file-saver dependency
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function PDFGeneratorClient() {
  const params = useParams();
  const pdfId = params.id as string;
  
  const [status, setStatus] = useState<'loading' | 'generating' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    // Prevent double execution in development mode
    if (pdfId && !isGenerating) {
      setIsGenerating(true);
      generatePDF();
    }
  }, [pdfId, isGenerating]);
  
  async function generatePDF() {
    try {
      // Fetch the stored SpreadJS data
      setStatus('loading');
      const response = await fetch(`/api/pdf/${pdfId}/data`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load PDF data');
      }
      
      const { spreadJSON, serviceName } = await response.json();
      
      setStatus('generating');
      console.log('Starting PDF generation process...');
      console.log('Using local SpreadJS version');
      
      // Create a hidden container for the workbook
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '1000px';
      container.style.height = '1000px';
      document.body.appendChild(container);
      
      // Initialize workbook using imported GC
      console.log('Creating workbook...');
      const workbook = new GC.Spread.Sheets.Workbook(container);
      
      // Load the spreadsheet data
      console.log('Loading spreadsheet JSON...');
      workbook.fromJSON(spreadJSON);
      console.log('Spreadsheet data loaded');
      
      // Configure print settings for the active sheet
      const sheet = workbook.getActiveSheet();
      if (sheet) {
        console.log('Configuring print settings...');
        
        try {
          // Get or create print info
          let printInfo = sheet.printInfo();
          if (!printInfo) {
            printInfo = new GC.Spread.Sheets.Print.PrintInfo();
          }
          
          // Check if Print_Area custom name exists
          const printAreaName = sheet.getCustomName("Print_Area");
          console.log('Print_Area custom name:', printAreaName);
          
          if (!printAreaName) {
            // No existing print area, use the full worksheet dimensions
            const rowCount = sheet.getRowCount();
            const colCount = sheet.getColumnCount();
            
            console.log(`Sheet dimensions: ${rowCount} rows x ${colCount} columns`);
            
            // Use the getUsedRange to try to optimize the print area
            const usedRange = sheet.getUsedRange();
            console.log('Used range from getUsedRange():', usedRange);
            
            if (usedRange && usedRange.rowCount > 0 && usedRange.colCount > 0) {
              // Use the detected used range
              console.log('Setting print area based on used range:', usedRange);
              printInfo.rowStart(usedRange.row);
              printInfo.rowEnd(usedRange.row + usedRange.rowCount - 1);
              printInfo.columnStart(usedRange.col);
              printInfo.columnEnd(usedRange.col + usedRange.colCount - 1);
            } else {
              // Use the full worksheet as print area
              console.log('Using full worksheet as print area');
              console.log(`Setting print area to: 0-${rowCount-1} rows, 0-${colCount-1} columns`);
              
              // Set to actual sheet dimensions
              printInfo.rowStart(0);
              printInfo.rowEnd(Math.min(rowCount - 1, 999));  // Limit to reasonable size
              printInfo.columnStart(0);
              printInfo.columnEnd(Math.min(colCount - 1, 25));  // Limit to columns A-Z
            }
          } else {
            console.log('Using existing Print_Area from template:', printAreaName);
          }
          
          // Set basic page settings
          printInfo.orientation(GC.Spread.Sheets.Print.PrintPageOrientation.portrait);
          printInfo.showBorder(false);
          printInfo.showGridLine(false);
          printInfo.showColumnHeader(false);
          printInfo.showRowHeader(false);
          printInfo.centering(GC.Spread.Sheets.Print.PrintCentering.horizontal);
          
          // Set margins
          printInfo.margin({
            top: 0.75,
            bottom: 0.75,
            left: 0.7,
            right: 0.7,
            header: 0.3,
            footer: 0.3
          });
          
          // Best fit settings
          printInfo.bestFitColumns(true);
          printInfo.bestFitRows(true);
          
          // Apply the settings back to the sheet
          sheet.printInfo(printInfo);
          console.log('Print settings applied successfully');
          
        } catch (error) {
          console.error('Error configuring print settings:', error);
          // Continue with PDF generation even if print settings fail
        }
      }
      
      // Generate PDF with settings
      console.log('Calling savePDF with print settings...');
      workbook.savePDF(
        function(blob: Blob) {
          // Success - download the PDF
          const fileName = `${serviceName || 'report'}_${new Date().toISOString().split('T')[0]}.pdf`;
          downloadBlob(blob, fileName);
          
          // Clean up
          document.body.removeChild(container);
          setStatus('success');
        },
        function(error: any) {
          // Error generating PDF
          console.error('PDF generation error:', error);
          document.body.removeChild(container);
          setErrorMessage(error.message || 'Failed to generate PDF');
          setStatus('error');
        },
        {
          title: serviceName || 'Calculation Report',
          author: 'SpreadAPI',
          subject: 'Calculation Results',
          keywords: 'spreadapi, calculation, report',
          creator: 'SpreadAPI PDF Generator'
        }
      );
      
    } catch (error) {
      console.error('Error in PDF generation:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      setStatus('error');
    }
  }
  
  // Render different states
  if (status === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="default" />
          <Paragraph style={{ marginTop: '1rem' }}>Loading PDF data...</Paragraph>
        </div>
      </div>
    );
  }
  
  if (status === 'generating') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="default" />
          <Title level={3} style={{ marginTop: '1rem' }}>Generating your PDF...</Title>
          <Paragraph>This will download automatically when ready.</Paragraph>
        </div>
      </div>
    );
  }
  
  if (status === 'success') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Result
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="PDF Downloaded Successfully!"
          subTitle="Your calculation report has been saved to your downloads folder."
          extra={[
            <a key="home" href="/">Return to Home</a>
          ]}
        />
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Result
          icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          title="PDF Generation Failed"
          subTitle={errorMessage || 'Unable to generate PDF. Please try again.'}
          extra={[
            <a key="retry" href="#" onClick={(e) => { e.preventDefault(); generatePDF(); }}>
              Try Again
            </a>,
            <a key="home" href="/">Return to Home</a>
          ]}
        />
      </div>
    );
  }
  
  return null;
}