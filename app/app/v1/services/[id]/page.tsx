import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import redis from '@/lib/redis';
import WebAppClient from './WebAppClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

// Simple German translations for error pages
const translations = {
  en: {
    accessDenied: 'Access Denied',
    noToken: 'No access token provided',
    notEnabled: 'Web App Not Enabled',
    enableInSettings: 'Please enable web app in Settings and click Save.',
    invalidToken: 'Invalid Token',
    checkUrl: 'Please check your URL or regenerate the token.'
  },
  de: {
    accessDenied: 'Zugriff verweigert',
    noToken: 'Kein Zugriffstoken angegeben',
    notEnabled: 'Web-App nicht aktiviert',
    enableInSettings: 'Bitte aktivieren Sie die Web-App in den Einstellungen und klicken Sie auf Speichern.',
    invalidToken: 'Ungültiges Token',
    checkUrl: 'Bitte überprüfen Sie Ihre URL oder generieren Sie das Token neu.'
  }
};

function getTranslations(acceptLanguage: string | null) {
  const lang = acceptLanguage?.toLowerCase().includes('de') ? 'de' : 'en';
  return translations[lang];
}

// Server Component - Pre-fetch data for faster initial load
export default async function WebAppPage({ params, searchParams }: PageProps) {
  const { id: serviceId } = await params;
  const { token } = await searchParams;

  // Get user's language from Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  const t = getTranslations(acceptLanguage);

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
          <div style={{ color: '#ff4d4f', marginBottom: '8px', fontWeight: 600 }}>{t.accessDenied}</div>
          <div style={{ color: '#666' }}>{t.noToken}</div>
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
            <div style={{ color: '#ff4d4f', marginBottom: '8px', fontWeight: 600 }}>{t.notEnabled}</div>
            <div style={{ color: '#666' }}>{t.enableInSettings}</div>
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
            <div style={{ color: '#ff4d4f', marginBottom: '8px', fontWeight: 600 }}>{t.invalidToken}</div>
            <div style={{ color: '#666' }}>{t.checkUrl}</div>
          </div>
        </div>
      );
    }

    // Parse inputs and outputs
    const inputs = JSON.parse(serviceData.inputs || '[]');
    const outputs = JSON.parse(serviceData.outputs || '[]');

    // Detect user's language from Accept-Language header
    const userLanguage = acceptLanguage?.toLowerCase().includes('de') ? 'de' : 'en';

    const serviceInfo = {
      name: serviceData.name || 'Calculation Service',
      description: serviceData.description || '',
      inputs,
      outputs,
      webAppConfig: serviceData.webAppConfig || ''
    };

    // Pass pre-fetched data and language to client component
    return <WebAppClient serviceId={serviceId} serviceData={serviceInfo} initialLanguage={userLanguage} />;
  } catch (error) {
    console.error('Error loading web app:', error);
    notFound();
  }
}

// Enable static optimization
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Don't cache (token-based access)
