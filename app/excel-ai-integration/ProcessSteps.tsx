'use client';

import React from 'react';

export default function ProcessSteps() {
  return (
    <div className="process-grid" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '40px',
      marginTop: '60px'
    }}>
      <div className="process-item" style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px 32px',
        position: 'relative',
        border: '1px solid #e5e5e5',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = '#9333EA';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#e5e5e5';
      }}>
        <div className="process-number" style={{
          position: 'absolute',
          top: '-20px',
          left: '32px',
          width: '40px',
          height: '40px',
          background: '#9333EA',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
        }}>1</div>
        <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1a1a1a', marginTop: '20px' }}>Upload Your Excel</h3>
        <p style={{ color: '#666', lineHeight: '1.6' }}>Just drag and drop. Your complex pricing model, financial calculator, or planning spreadsheet—SpreadAPI handles them all.</p>
      </div>
      <div className="process-item" style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px 32px',
        position: 'relative',
        border: '1px solid #e5e5e5',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = '#9333EA';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#e5e5e5';
      }}>
        <div className="process-number" style={{
          position: 'absolute',
          top: '-20px',
          left: '32px',
          width: '40px',
          height: '40px',
          background: '#9333EA',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
        }}>2</div>
        <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1a1a1a', marginTop: '20px' }}>Define What AI Can Use</h3>
        <p style={{ color: '#666', lineHeight: '1.6' }}>Mark input cells (like quantity, customer type) and output cells (like final price, delivery date). Your formulas stay hidden.</p>
      </div>
      <div className="process-item" style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px 32px',
        position: 'relative',
        border: '1px solid #e5e5e5',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = '#9333EA';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#e5e5e5';
      }}>
        <div className="process-number" style={{
          position: 'absolute',
          top: '-20px',
          left: '32px',
          width: '40px',
          height: '40px',
          background: '#9333EA',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
        }}>3</div>
        <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1a1a1a', marginTop: '20px' }}>Connect Your AI</h3>
        <p style={{ color: '#666', lineHeight: '1.6' }}>One-click setup for Claude Desktop or ChatGPT. Or use our API with any AI platform. That's it—your AI now has Excel superpowers.</p>
      </div>
    </div>
  );
}