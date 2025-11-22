'use client';

import React, { useEffect } from 'react';

interface WistiaVideoProps {
  videoId?: string;
  englishVideoId?: string;
  germanVideoId?: string;
  aspectRatio?: number; // e.g., 16/9 = 1.778, default is 16:9
}

export default function WistiaVideo({
  videoId,
  englishVideoId = 'rfdcf8rpnd',
  germanVideoId = 'pi5ljxwf4o',
  aspectRatio = 9/16 // 16:9 ratio = 56.25%
}: WistiaVideoProps) {
  // Determine which video to show based on language
  const selectedVideoId = videoId || (
    typeof navigator !== 'undefined' && navigator.language?.startsWith('de')
      ? germanVideoId
      : englishVideoId
  );

  useEffect(() => {
    // Load Wistia script if not already loaded
    if (typeof window !== 'undefined' && !window._wq) {
      const script = document.createElement('script');
      script.src = 'https://fast.wistia.com/assets/external/E-v1.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const paddingBottom = `${aspectRatio * 100}%`;

  return (
    <section style={{
      background: '#ffffff',
      padding: 0,
      paddingBottom: 60
    }}>
      <div className="padding-global">
        <div className="container-large">
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Subheading */}
            <div className="margin-bottom margin-xsmall" style={{ textAlign: 'center' }}>
              <div className="subheading">
                <div>Learn how to turn an Excel model in an API in 2 Minutes</div>
              </div>
            </div>

            {/* Wistia Responsive Embed - Modern Standard (Async) Implementation */}
            <div
              className="wistia_responsive_padding"
              style={{
                padding: `${paddingBottom} 0 0 0`,
                position: 'relative',
                border: '2px solid #E7E1FF',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <div
                className="wistia_responsive_wrapper"
                style={{
                  height: '100%',
                  left: 0,
                  position: 'absolute',
                  top: 0,
                  width: '100%'
                }}
              >
                <div
                  className={`wistia_embed wistia_async_${selectedVideoId} videoFoam=true`}
                  style={{
                    height: '100%',
                    position: 'relative',
                    width: '100%'
                  }}
                >
                  &nbsp;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Extend Window type for TypeScript
declare global {
  interface Window {
    _wq?: any;
  }
}
