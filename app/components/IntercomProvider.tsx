'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { appStore } from '@/stores/AppStore';

declare global {
  interface Window {
    Intercom: any;
    intercomSettings: any;
  }
}

const IntercomProviderInner = observer(({ children }: { children?: React.ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || 'vt5lp0iv';
  const [shouldInitialize, setShouldInitialize] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Sync initialization with script loading
  useEffect(() => {
    // Don't initialize on mobile
    if (isMobile) return;
    
    const checkIntercomLoaded = () => {
      if (typeof window !== 'undefined' && window.Intercom) {
        setShouldInitialize(true);
      }
    };

    // Check immediately in case script already loaded
    checkIntercomLoaded();

    // Set up interval to check for Intercom availability
    const interval = setInterval(checkIntercomLoaded, 500);

    // Stop checking after 15 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isMobile]);

  useEffect(() => {
    // Don't boot on mobile
    if (isMobile) return;
    
    if (shouldInitialize && typeof window !== 'undefined' && window.Intercom) {
      const bootData: any = {
        app_id: appId,
        client_type: 'spreadapi-web',
      };

      if (appStore.user.isRegistered && appStore.user.userId) {
        bootData.user_id = appStore.user.userId;
        bootData.email = appStore.user.email;
        bootData.name = appStore.user.name;
        bootData.created_at = null;
      }

      window.Intercom('boot', bootData);
    }
  }, [shouldInitialize, appId, appStore.user.isRegistered, appStore.user.userId, isMobile]);

  useEffect(() => {
    // Don't update on mobile
    if (isMobile) return;
    
    if (typeof window !== 'undefined' && window.Intercom) {
      window.Intercom('update');
    }
  }, [pathname, searchParams, isMobile]);

  useEffect(() => {
    return () => {
      // Don't shutdown on mobile (it was never initialized)
      if (isMobile) return;
      
      if (typeof window !== 'undefined' && window.Intercom) {
        window.Intercom('shutdown');
      }
    };
  }, [isMobile]);

  return <>{children}</>;
});

export const IntercomProvider = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Suspense fallback={<>{children}</>}>
      <IntercomProviderInner>{children}</IntercomProviderInner>
    </Suspense>
  );
};