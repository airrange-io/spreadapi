'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supportedLocales, localeNames, getBlogUrl, isValidLocale } from '@/lib/translations/blog-helpers';
import { getSlugTranslations } from '@/lib/translations/slug-mapping';

interface LanguageSwitcherProps {
  currentLocale: string;
  currentSlug?: string;
}

export default function LanguageSwitcher({ currentLocale, currentSlug }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Determine if we're on a blog post or blog list page
  const isBlogPost = currentSlug !== undefined;
  
  // Get available languages for current post
  const availableLocales = isBlogPost && currentSlug
    ? Object.keys(getSlugTranslations(currentSlug))
    : supportedLocales;
  
  const handleLocaleChange = (newLocale: string) => {
    if (!isValidLocale(newLocale)) return;
    
    if (isBlogPost && currentSlug) {
      // Get the translated slug for the new locale
      const translations = getSlugTranslations(currentSlug);
      const translatedSlug = translations[newLocale] || currentSlug;
      
      // Navigate to translated blog post
      if (newLocale === 'en') {
        window.location.href = `/blog/${translatedSlug}`;
      } else {
        window.location.href = `/blog/${newLocale}/${translatedSlug}`;
      }
    } else {
      // Navigate to blog list in new language
      window.location.href = newLocale === 'en' ? '/blog' : `/blog/${newLocale}`;
    }
    
    setIsOpen(false);
  };
  
  return (
    <div className="language-switcher">
      <button
        className="language-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 2C12.2091 4.20914 13.3637 7.20914 13.3637 10C13.3637 12.7909 12.2091 15.7909 10 18C7.79086 15.7909 6.63636 12.7909 6.63636 10C6.63636 7.20914 7.79086 4.20914 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{localeNames[currentLocale as keyof typeof localeNames] || 'English'}</span>
        <svg 
          className={`chevron ${isOpen ? 'open' : ''}`} 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {availableLocales.map(locale => (
            <button
              key={locale}
              className={`language-option ${locale === currentLocale ? 'active' : ''}`}
              onClick={() => handleLocaleChange(locale)}
              disabled={locale === currentLocale}
            >
              {localeNames[locale as keyof typeof localeNames]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}