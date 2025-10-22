'use client';

import React from 'react';
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
  primaryButtonRef
}: ProductHeaderProps) {
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}