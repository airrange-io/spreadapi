import React from 'react';
import { App } from 'antd';
import ServicePageClient from './ServicePageClient';
import type { Metadata } from 'next';

interface ServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

// Preload critical SpreadJS resources
export async function generateMetadata(): Promise<Metadata> {
  return {
    other: {
      // Preload critical SpreadJS chunks
      'link:0': '<link rel="modulepreload" href="/_next/static/chunks/spread-sheets.js" />',
      'link:1': '<link rel="preload" as="style" href="/_next/static/css/spread-sheets.css" />',
      'link:2': '<link rel="prefetch" href="/_next/static/chunks/spread-sheets-designer.js" />',
    }
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { id: serviceId } = await params;
  
  return (
    <App>
      <ServicePageClient serviceId={serviceId} />
    </App>
  );
}