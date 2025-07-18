import { useEffect, useState } from 'react';

// Hook to check if we're on the client side (after hydration)
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}