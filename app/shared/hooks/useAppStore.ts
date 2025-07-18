import { useEffect } from 'react';
import { appStore } from '@/stores/AppStore';

// Custom hook to handle AppStore lifecycle
export function useAppStore() {
  useEffect(() => {
    // Initialize client-side functionality
    appStore.initializeClient();
    
    // Cleanup function to remove event listeners when component unmounts
    return () => {
      appStore.cleanup();
    };
  }, []);

  return appStore;
}