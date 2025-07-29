import { useEffect, useRef } from 'react';

/**
 * Hook to prewarm a service when it's accessed
 * This improves the response time for the first calculation
 */
export function useServicePrewarm(serviceId: string, enabled: boolean = true) {
  const prewarmAttempted = useRef(false);
  
  useEffect(() => {
    if (!serviceId || !enabled || prewarmAttempted.current) {
      return;
    }
    
    // Mark as attempted to prevent multiple calls
    prewarmAttempted.current = true;
    
    // Prewarm the service asynchronously
    fetch(`/api/services/${serviceId}/prewarm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(response => {
      if (response.ok) {
        response.json().then(data => {
          if (data.success) {
            console.log(`[Prewarm] Service ${serviceId} prewarmed successfully${data.alreadyCached ? ' (already cached)' : ''}`);
          }
        });
      }
    }).catch(error => {
      console.error(`[Prewarm] Failed to prewarm service ${serviceId}:`, error);
    });
    
  }, [serviceId, enabled]);
  
  // Return a manual prewarm function in case it's needed
  const manualPrewarm = async (forceRefresh: boolean = false) => {
    try {
      const response = await fetch(`/api/services/${serviceId}/prewarm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceRefresh })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`[Prewarm] Manual prewarm failed for ${serviceId}:`, error);
      throw error;
    }
  };
  
  return { manualPrewarm };
}