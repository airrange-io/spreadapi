'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductHeaderProps {
  subheading?: string;
  title: React.ReactNode;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  showImage?: boolean;
  showVideo?: boolean;
  videoSubheading?: string;
  germanVideoSubheading?: string;
  englishVideoId?: string;
  germanVideoId?: string;
  locale?: string;
  primaryButtonRef?: React.RefObject<HTMLAnchorElement>;
}

export default function ProductHeader({
  subheading,
  title,
  description,
  primaryButtonText,
  primaryButtonHref = '/',
  secondaryButtonText,
  secondaryButtonHref,
  showImage = false,
  showVideo = false,
  videoSubheading = 'From Excel to API in Minutes — Power Automations, Apps & AI Agents',
  germanVideoSubheading = 'Von Excel zur API in Minuten — Automatisierung, Apps & KI-Agenten',
  englishVideoId = 'rfdcf8rpnd',
  germanVideoId = 'pi5ljxwf4o',
  locale = 'en',
  primaryButtonRef
}: ProductHeaderProps) {
  // Use German video only for 'de' locale, English for all others (en, fr, es)
  const isGerman = locale === 'de';
  const selectedVideoId = isGerman ? germanVideoId : englishVideoId;

  useEffect(() => {
    if (showVideo) {
      // Load Wistia script if not already loaded
      if (typeof window !== 'undefined' && !(window as any)._wq) {
        const script = document.createElement('script');
        script.src = 'https://fast.wistia.com/assets/external/E-v1.js';
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [showVideo]);
  return (
    <header className="section-home-header">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-large">
            <div className="home-header-component">
              <div className="margin-bottom margin-xlarge">
                <div className="text-align-center">
                  <div className="max-width-xlarge align-center">
                    {subheading && (
                      <div className="margin-bottom margin-xsmall">
                        <div className="subheading">
                          <div>{subheading}</div>
                        </div>
                      </div>
                    )}
                    <div className="margin-bottom margin-small">
                      <h1>{title}</h1>
                    </div>
                    {description && (
                      <p className="text-size-medium" style={{ maxWidth: '680px', margin: '0 auto' }}>
                        {description}
                      </p>
                    )}
                    {(primaryButtonText || secondaryButtonText) && (
                      <div className="margin-top margin-medium">
                        <div className="waitlist-form-signup" style={{ justifyContent: 'center', gap: '16px' }}>
                          {primaryButtonText && (
                            <Link href={primaryButtonHref} ref={primaryButtonRef} className="button w-button" style={{
                              width: 'auto',
                              padding: '14px 28px',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}>
                              {primaryButtonText}
                            </Link>
                          )}
                          {secondaryButtonText && (
                            <Link href={secondaryButtonHref || '/docs'} className="button" style={{ 
                              width: 'auto', 
                              padding: '14px 28px',
                              background: 'transparent',
                              border: '2px solid #9333EA',
                              color: '#9333EA',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}>
                              {secondaryButtonText}
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {showImage && (
                <div className="header-image-wrapper">
                  <div className="header-image-placeholder-2" style={{ backgroundColor: '#fdfdfd', position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px', border: '2px solid #E8E1FF' }}>
                    <Image
                      src="/images/product/product_hero.webp"
                      alt="SpreadAPI Product Dashboard"
                      width={1000}
                      height={600}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px'
                      }}
                      priority
                    />
                  </div>
                </div>
              )}

              {showVideo && (
                <div style={{ marginTop: '60px' }}>
                  <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Wistia Responsive Embed - Modern Standard (Async) Implementation */}
                    <div
                      className="wistia_responsive_padding"
                      style={{
                        padding: '56.25% 0 0 0',
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
                          className={`wistia_embed wistia_async_${selectedVideoId} videoFoam=true preload=metadata`}
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
                    {/* Subheading */}
                    <div className="margin-top margin-small" style={{ textAlign: 'center' }}>
                      <div className="subheading">
                        <div>
                          {isGerman ? germanVideoSubheading : videoSubheading}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}