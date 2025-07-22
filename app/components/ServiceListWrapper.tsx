'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ServiceListSkeleton from './ServiceListSkeleton';

// Dynamically import the client component
const ServiceList = dynamic(() => import('./ServiceList'), {
  loading: () => <ServiceListSkeleton />,
  ssr: true
});

interface ServiceListWrapperProps {
  searchQuery?: string;
}

export default function ServiceListWrapper({ searchQuery = '' }: ServiceListWrapperProps) {
  return <ServiceList searchQuery={searchQuery} />;
}