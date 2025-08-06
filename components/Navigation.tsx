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
  currentPage: 'product' | 'how-excel-api-works' | 'excel-ai-integration' | 'blog' | 'pricing' | 'docs';
  className?: string;
  locale?: string;
  showLanguageSwitcher?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, className = '', locale = 'en', showLanguageSwitcher = false }) => {
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
  const menuItems = [
    { label: 'Overview', path: '/product', key: 'product' },
    { label: 'How it Works', path: '/product/how-excel-api-works', key: 'how-excel-api-works' },
    { label: 'AI Integration', path: '/product/excel-ai-integration', key: 'excel-ai-integration' },
    { label: 'Blog', path: '/blog', key: 'blog' },
  ];

  // Filter out the current page from the menu
  let visibleMenuItems = menuItems.filter(item => item.key !== currentPage);
  
  // Show fewer items on blog page to make room for language selector
  if (currentPage === 'blog') {
    visibleMenuItems = visibleMenuItems.filter(item => 
      item.key === 'product' || item.key === 'how-excel-api-works' || item.key === 'excel-ai-integration'
    );
  }

  return (
    <nav className={`navigation-component ${className}`}>
      <div className="navigation-container">
        <Link href="/product" className="navigation-logo-link">
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
              className="navigation-link"
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
          <Link href="/" className="header-button hide-mobile-portrait">Get Started</Link>
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
            {visibleMenuItems.map((item) => (
              <Link
                key={item.key}
                href={item.path}
                className="navigation-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
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