'use client';

import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';

export function IntercomScript() {
  const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || 'vt5lp0iv';
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Don't load Intercom in development mode
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load Intercom on first user interaction or after 10 seconds (but not on mobile)
  useEffect(() => {
    // Don't load on mobile devices
    if (isMobile) return;
    // Set up interaction listener
    const handleInteraction = () => {
      setHasInteracted(true);
      setShouldLoad(true);
      // Remove listeners once triggered
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    // Add interaction listeners
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('scroll', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    // Fallback timer - load after 10 seconds even without interaction
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShouldLoad(true);
      }
    }, 10000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [hasInteracted, isMobile]);

  // Don't render on mobile or if not ready to load
  if (!shouldLoad || isMobile) return null;
  
  return (
    <>
      <Script
        id="intercom-settings"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.intercomSettings = {
              api_base: "https://api-iam.intercom.io",
              app_id: "${appId}"
            };
          `,
        }}
      />
      <Script
        src={`https://widget.intercom.io/widget/${appId}`}
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Intercom loaded after user interaction or timeout');
        }}
      />
    </>
  );
}