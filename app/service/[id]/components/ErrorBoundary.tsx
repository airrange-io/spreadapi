'use client';

import React, { Component, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // TODO: Log to error reporting service (e.g., Sentry) in production
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px',
          padding: '20px'
        }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle={
              <>
                <p>An unexpected error occurred while rendering this view.</p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details style={{ marginTop: '10px', textAlign: 'left' }}>
                    <summary>Error details</summary>
                    <pre style={{ 
                      fontSize: '12px', 
                      background: '#f5f5f5', 
                      padding: '10px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxWidth: '600px',
                      margin: '10px auto'
                    }}>
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </>
            }
            extra={[
              <Button key="retry" type="primary" onClick={this.handleReset}>
                Try Again
              </Button>,
              <Button key="reload" onClick={this.handleReload}>
                Reload Page
              </Button>
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;