import React from 'react';
import ServicePageClient from './ServicePageClient';

interface ServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { id: serviceId } = await params;
  
  return <ServicePageClient serviceId={serviceId} />;
}