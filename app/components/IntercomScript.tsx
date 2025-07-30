'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export function IntercomScript() {
  const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || 'vt5lp0iv';
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Delay loading scripts by 3 seconds
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) return null;
  
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
          console.log('Intercom loaded after 3 second delay');
        }}
      />
    </>
  );
}