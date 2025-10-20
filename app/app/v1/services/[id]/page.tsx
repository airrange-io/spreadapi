import React from 'react';
import { notFound } from 'next/navigation';
import redis from '@/lib/redis';
import WebAppClient from './WebAppClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

// Server Component - Pre-fetch data for faster initial load
export default async function WebAppPage({ params, searchParams }: PageProps) {
  const { id: serviceId } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '16px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          padding: '24px 32px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ color: '#ff4d4f', marginBottom: '8px', fontWeight: 600 }}>Access Denied</div>
          <div style={{ color: '#666' }}>No access token provided</div>
        </div>
      </div>
    );
  }

  // Server-side data fetching - much faster than client-side
  try {
    const serviceData = await redis.hGetAll(`service:${serviceId}`) as unknown as Record<string, string>;

    if (!serviceData || Object.keys(serviceData).length === 0) {
      notFound();
    }

    // Validate web app is enabled and token matches (Redis returns strings)
    const webAppEnabled = serviceData.webAppEnabled === 'true';

    if (!webAppEnabled) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '16px'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            padding: '24px 32px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ color: '#ff4d4f', marginBottom: '8px', fontWeight: 600 }}>Web App Not Enabled</div>
            <div style={{ color: '#666' }}>Please enable web app in Settings and click Save.</div>
          </div>
        </div>
      );
    }

    if (serviceData.webAppToken !== token) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '16px'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            padding: '24px 32px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ color: '#ff4d4f', marginBottom: '8px', fontWeight: 600 }}>Invalid Token</div>
            <div style={{ color: '#666' }}>Please check your URL or regenerate the token.</div>
          </div>
        </div>
      );
    }

    // Parse inputs and outputs
    const inputs = JSON.parse(serviceData.inputs || '[]');
    const outputs = JSON.parse(serviceData.outputs || '[]');

    const serviceInfo = {
      name: serviceData.name || 'Calculation Service',
      description: serviceData.description || '',
      inputs,
      outputs
    };

    // Pass pre-fetched data to client component
    return <WebAppClient serviceId={serviceId} serviceData={serviceInfo} />;
  } catch (error) {
    console.error('Error loading web app:', error);
    notFound();
  }
}

// Enable static optimization
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Don't cache (token-based access)
