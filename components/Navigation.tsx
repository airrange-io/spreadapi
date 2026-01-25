'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import './Navigation.css';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getMarketingTranslations } from '@/lib/translations/marketing';

const LanguageSwitcher = dynamic(() => import('@/components/blog/LanguageSwitcher'), {
  ssr: false,
});

interface NavigationProps {
  currentPage: 'product' | 'how-excel-api-works' | 'stop-rewriting-excel-in-code' | 'automation-calculations' | 'excel-ai-integration' | 'on-premises' | 'blog' | 'pricing' | 'docs';
  className?: string;
  locale?: string;
  showLanguageSwitcher?: boolean;
  getStartedRef?: React.RefObject<HTMLAnchorElement>;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, className = '', locale = 'en', showLanguageSwitcher = false, getStartedRef }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = getMarketingTranslations(locale as SupportedLocale);
  const prefix = locale === 'en' ? '' : `/${locale}`;

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
  // All items shown on all pages (except Enterprise which hides on medium screens)
  const menuItems = [
    { label: t.nav.howItWorks, path: `${prefix}/how-excel-api-works`, key: 'how-excel-api-works', hideOnMedium: false },
    { label: t.nav.developers, path: `${prefix}/stop-rewriting-excel-in-code`, key: 'stop-rewriting-excel-in-code', hideOnMedium: false },
    { label: t.nav.automations, path: `${prefix}/automation-calculations`, key: 'automation-calculations', hideOnMedium: false },
    { label: t.nav.ai, path: `${prefix}/excel-ai-integration`, key: 'excel-ai-integration', hideOnMedium: false },
    { label: t.nav.enterprise || 'Enterprise', path: `${prefix}/on-premises`, key: 'on-premises', hideOnMedium: true },
  ];

  // Show all menu items, highlight current page
  const visibleMenuItems = menuItems;

  return (
    <nav className={`navigation-component ${className}`}>
      <div className="navigation-container">
        <Link href={prefix || '/'} className="navigation-logo-link">
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
          <Link href="/app" ref={getStartedRef} className="header-button hide-mobile-portrait">{t.nav.getStarted}</Link>
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
              href={prefix || '/'}
              className={`navigation-link ${currentPage === 'product' ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.nav.home}
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
              {t.nav.getStarted}
            </Link>
          </nav>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
