'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface NavigationProps {
  currentPage: 'product' | 'how-excel-api-works' | 'excel-ai-integration' | 'blog' | 'pricing' | 'docs';
  className?: string;
  locale?: string;
  showLanguageSwitcher?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, className = '', locale = 'en', showLanguageSwitcher = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define menu items with their labels and paths
  const menuItems = [
    { label: 'Overview', path: '/product', key: 'product' },
    { label: 'How it Works', path: '/how-excel-api-works', key: 'how-excel-api-works' },
    { label: 'AI Integration', path: '/excel-ai-integration', key: 'excel-ai-integration' },
    { label: 'Blog', path: '/blog', key: 'blog' },
    { label: 'Pricing', path: '/pricing', key: 'pricing' },
    { label: 'Docs', path: '/docs', key: 'docs' },
  ];

  // Filter out the current page from the menu
  const visibleMenuItems = menuItems.filter(item => item.key !== currentPage);

  return (
    <nav className={`navbar-component ${className}`}>
      <div className="navbar-container">
        <Link href="/product" className="navbar-logo-link">
          <img src="/icons/logo-full.svg" alt="SpreadAPI" className="navbar-logo" />
        </Link>

        <div className="navbar-menu">
          {visibleMenuItems.map((item) => (
            <Link key={item.key} href={item.path} className="navbar-link">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="navbar-button-wrapper">
          {showLanguageSwitcher && (
            <div style={{ marginRight: '16px' }}>
              {/* LanguageSwitcher would be imported and used here */}
            </div>
          )}
          <Link href="/product#cta" className="button hide-mobile-portrait">Get Started</Link>
          <button
            className="navbar-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
              <div className="menu-icon-line-top"></div>
              <div className="menu-icon-line-center">
                <div className="menu-icon-line-center-inner"></div>
              </div>
              <div className="menu-icon-line-bottom"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            {visibleMenuItems.map((item) => (
              <Link
                key={item.key}
                href={item.path}
                className="navbar-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/product#cta"
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