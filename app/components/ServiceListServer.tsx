import { Suspense } from 'react';
import ServiceListClient from './ServiceListClient';
import ServiceListSkeleton from './ServiceListSkeleton';

interface ServiceListServerProps {
  searchQuery?: string;
}

async function getServices() {
  // This runs on the server - use absolute URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/services`, {
      next: { 
        revalidate: 5, // Cache for 5 seconds
        tags: ['services'] // Tag for on-demand revalidation
      },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch services');
    }
    
    const data = await res.json();
    return data.services || [];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

// Server Component - runs on the server
export default async function ServiceListServer({ searchQuery = '' }: ServiceListServerProps) {
  // Fetch data on the server
  const services = await getServices();
  
  // Filter on the server if search query exists
  let filteredServices = services;
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredServices = services.filter((service: any) =>
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.id.toLowerCase().includes(query)
    );
  }
  
  // Pass the data to the client component
  return (
    <ServiceListClient 
      initialServices={filteredServices}
      allServices={services}
      initialSearchQuery={searchQuery}
    />
  );
}

// Export a wrapped version with Suspense built-in
export function ServiceListWithSuspense({ searchQuery }: ServiceListServerProps) {
  return (
    <Suspense fallback={<ServiceListSkeleton />}>
      <ServiceListServer searchQuery={searchQuery} />
    </Suspense>
  );
}