'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export function Reb2bScript() {
  const pathname = usePathname();
  
  // Define the pages where the script should load
  const allowedPaths = ['/product', '/pricing', '/blog'];
  
  // Check if current path matches or starts with any allowed path
  const shouldLoadScript = allowedPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  if (!shouldLoadScript) {
    return null;
  }
  
  return (
    <Script
      id="reb2b-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(key) {
            if (window.reb2b) return;
            window.reb2b = {loaded: true};
            var s = document.createElement("script");
            s.async = true;
            s.src = "https://ddwl4m2hdecbv.cloudfront.net/b/" + key + "/" + key + ".js.gz";
            document.getElementsByTagName("script")[0].parentNode.insertBefore(s, document.getElementsByTagName("script")[0]);
          }("R6G5YHY35D65");
        `,
      }}
    />
  );
}