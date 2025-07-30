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

  // Delay initialization by 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldInitialize(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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
  }, [shouldInitialize, appId, appStore.user.isRegistered, appStore.user.userId]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Intercom) {
      window.Intercom('update');
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.Intercom) {
        window.Intercom('shutdown');
      }
    };
  }, []);

  return <>{children}</>;
});

export const IntercomProvider = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Suspense fallback={<>{children}</>}>
      <IntercomProviderInner>{children}</IntercomProviderInner>
    </Suspense>
  );
};