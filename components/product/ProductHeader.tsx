'use client';

import React from 'react';
import Link from 'next/link';

interface ProductHeaderProps {
  subheading?: string;
  title: React.ReactNode;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  showImage?: boolean;
}

export default function ProductHeader({
  subheading,
  title,
  description,
  primaryButtonText,
  primaryButtonHref = '/',
  secondaryButtonText,
  secondaryButtonHref,
  showImage = false
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
                      <p className="text-size-medium" style={{ maxWidth: '650px', margin: '0 auto' }}>
                        {description}
                      </p>
                    )}
                    {(primaryButtonText || secondaryButtonText) && (
                      <div className="margin-top margin-medium">
                        <div className="waitlist-form-signup" style={{ justifyContent: 'center', gap: '16px' }}>
                          {primaryButtonText && (
                            <Link href={primaryButtonHref} className="button w-button" style={{ 
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
                  <div className="header-image-placeholder">
                    <svg viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="800" height="500" fill="#F8F6FE" />
                      <rect x="50" y="50" width="700" height="400" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2" />
                      <rect x="80" y="80" width="200" height="340" rx="4" fill="#F8F6FE" />
                      <rect x="300" y="80" width="200" height="160" rx="4" fill="#F8F6FE" />
                      <rect x="520" y="80" width="200" height="220" rx="4" fill="#F8F6FE" />
                      <rect x="300" y="260" width="200" height="160" rx="4" fill="#F8F6FE" />
                      <rect x="520" y="320" width="200" height="100" rx="4" fill="#F8F6FE" />
                    </svg>
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