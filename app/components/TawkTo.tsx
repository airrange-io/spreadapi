'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}

interface TawkToProps {
  propertyId?: string;
  widgetId?: string;
}

export const TawkTo: React.FC<TawkToProps> = ({
  propertyId,
  widgetId
}) => {
  useEffect(() => {
    if (!propertyId || !widgetId) return;

    // Check if script is already in the DOM
    const existingScript = document.getElementById('tawk-script');
    if (existingScript) {
      if (window.Tawk_API?.showWidget) {
        window.Tawk_API.showWidget();
      }
      return () => {
        if (window.Tawk_API?.hideWidget) {
          window.Tawk_API.hideWidget();
        }
      };
    }

    // Delay loading by 5 seconds
    const timeoutId = setTimeout(() => {
      // Initialize Tawk API
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      // Load the script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      script.id = 'tawk-script';

      document.head.appendChild(script);
    }, 5000);

    // Hide widget when navigating away
    return () => {
      clearTimeout(timeoutId);
      if (window.Tawk_API?.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, [propertyId, widgetId]);

  return null;
};

export default TawkTo;
