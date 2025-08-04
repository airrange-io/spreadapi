import React from 'react';
import { supportedLocales } from '@/lib/translations/blog-helpers';
import { getSlugTranslations } from '@/lib/translations/slug-mapping';

interface HreflangTagsProps {
  currentLocale: string;
  currentSlug?: string;
  isBlogList?: boolean;
}

export default function HreflangTags({ currentLocale, currentSlug, isBlogList }: HreflangTagsProps) {
  const getHreflangUrl = (locale: string): string => {
    if (isBlogList) {
      return locale === 'en' 
        ? `https://spreadapi.io/blog` 
        : `https://spreadapi.io/blog/${locale}`;
    }
    
    if (currentSlug) {
      const translations = getSlugTranslations(currentSlug);
      const translatedSlug = translations[locale] || currentSlug;
      
      return locale === 'en'
        ? `https://spreadapi.io/blog/${translatedSlug}`
        : `https://spreadapi.io/blog/${locale}/${translatedSlug}`;
    }
    
    return '';
  };
  
  // Get available locales for this content
  const availableLocales = currentSlug 
    ? Object.keys(getSlugTranslations(currentSlug))
    : supportedLocales;
  
  return (
    <>
      {availableLocales.map(locale => {
        const url = getHreflangUrl(locale);
        if (!url) return null;
        
        const hreflangLocale = locale === 'en' ? 'en' : locale;
        
        return (
          <link
            key={locale}
            rel="alternate"
            hrefLang={hreflangLocale}
            href={url}
          />
        );
      })}
      {/* x-default for international users */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={getHreflangUrl('en')}
      />
    </>
  );
}