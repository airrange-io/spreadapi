// Global constants for SpreadAPI

// Demo service configuration
export const DEMO_SERVICE_IDS = [
  'demoservice_mdejqoua8ptor', // Compound Interest Calculator
  'demoservice_mds0o77tr7tov'  // Orders Lookup
];

// Legacy constant for backward compatibility
export const DEMO_SERVICE_ID = DEMO_SERVICE_IDS[0];
export const DEMO_USER_ID = 'demo-user';

// Helper functions
export const isDemoService = (serviceId: string): boolean => 
  DEMO_SERVICE_IDS.includes(serviceId);

// Other constants can be added here as needed