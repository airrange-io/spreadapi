// Centralized demo services configuration
import { DEMO_SERVICE_IDS } from './constants';

export interface DemoService {
  id: string;
  name: string;
  description: string;
}

export const DEMO_SERVICES: DemoService[] = [
  {
    id: DEMO_SERVICE_IDS[0], // Compound Interest Calculator
    name: 'Demo: Compound Interest Calculator',
    description: 'Try our Excel API with this interactive compound interest calculator demo.'
  },
  {
    id: DEMO_SERVICE_IDS[1], // Orders Lookup
    name: 'Demo: Orders Lookup',
    description: 'See how Excel APIs can power data lookups and searches.'
  }
];

// Helper to get demo service by ID
export const getDemoServiceById = (id: string): DemoService | undefined => {
  return DEMO_SERVICES.find(service => service.id === id);
};

// Helper to check if a service is a demo service
export const isDemoServiceId = (id: string): boolean => {
  return DEMO_SERVICE_IDS.includes(id);
};