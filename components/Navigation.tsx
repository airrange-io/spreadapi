'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import './Navigation.css';

const LanguageSwitcher = dynamic(() => import('@/components/blog/LanguageSwitcher'), {
  ssr: false,
});

interface NavigationProps {
  currentPage: 'product' | 'how-excel-api-works' | 'stop-rewriting-excel-in-code' | 'automation-calculations' | 'excel-ai-integration' | 'blog' | 'pricing' | 'docs';
  className?: string;
  locale?: string;
  showLanguageSwitcher?: boolean;
  getStartedRef?: React.RefObject<HTMLAnchorElement>;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, className = '', locale = 'en', showLanguageSwitcher = false, getStartedRef }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Always show language switcher on blog pages
  const shouldShowLanguageSwitcher = showLanguageSwitcher || currentPage === 'blog';

  // Critical styles to prevent FOUC - simplified approach
  const linkStyle = {
    color: '#4b5563',
    textDecoration: 'none',
    fontWeight: 400,
    fontSize: '0.9375rem',
    transition: 'color 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  // Define menu items with their labels and paths
  // All items shown on all pages (except Blog which hides on medium screens)
  const menuItems = [
    { label: 'How it Works', path: '/how-excel-api-works', key: 'how-excel-api-works', hideOnMedium: false },
    { label: 'Developers', path: '/stop-rewriting-excel-in-code', key: 'stop-rewriting-excel-in-code', hideOnMedium: false },
    { label: 'Automations', path: '/automation-calculations', key: 'automation-calculations', hideOnMedium: false },
    { label: 'AI', path: '/excel-ai-integration', key: 'excel-ai-integration', hideOnMedium: false },
    { label: 'Blog', path: '/blog', key: 'blog', hideOnMedium: true },
  ];

  // Show all menu items, highlight current page
  const visibleMenuItems = menuItems;

  return (
    <nav className={`navigation-component ${className}`}>
      <div className="navigation-container">
        <Link href="/" className="navigation-logo-link">
          <Image 
            src="/icons/logo-full.svg" 
            alt="SpreadAPI" 
            className="navigation-logo"
            width={120}
            height={32}
            priority
          />
        </Link>

        <div className="navigation-menu">
          {visibleMenuItems.map((item) => (
            <Link
              key={item.key}
              href={item.path}
              className={`navigation-link ${item.key === currentPage ? 'active' : ''} ${item.hideOnMedium ? 'hide-on-medium' : ''}`}
              style={linkStyle}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="navigation-button-wrapper">
          <div style={{ 
            marginRight: '16px',
            minWidth: '48px',
            display: shouldShowLanguageSwitcher ? 'block' : 'none'
          }}>
            <LanguageSwitcher currentLocale={locale} />
          </div>
          <Link href="/app" ref={getStartedRef} className="header-button hide-mobile-portrait">Get Started</Link>
          <button
            className="navigation-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
              <div className="menu-icon-line-top"></div>
              <div className="menu-icon-line-center"></div>
              <div className="menu-icon-line-bottom"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="navigation-mobile-menu">
          <nav className="navigation-mobile-nav">
            <Link
              href="/"
              className={`navigation-link ${currentPage === 'product' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            {visibleMenuItems.map((item) => (
              <Link
                key={item.key}
                href={item.path}
                className={`navigation-link ${item.key === currentPage ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/app"
              className="button w-button"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </nav>
  );
};

export default Navigation;