import { getSlugTranslations, getOriginalSlug } from './slug-mapping';

export type SupportedLocale = 'en' | 'de' | 'fr' | 'es';

export const supportedLocales: SupportedLocale[] = ['en', 'de', 'fr', 'es'];

export const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español'
};

export function isValidLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}

// Get the correct blog URL for a given slug and locale
export function getBlogUrl(slug: string, locale: SupportedLocale = 'en'): string {
  const translations = getSlugTranslations(slug);
  const translatedSlug = translations[locale] || slug;
  
  if (locale === 'en') {
    return `/blog/${translatedSlug}`;
  }
  return `/blog/${locale}/${translatedSlug}`;
}

// Get all alternate language URLs for a blog post
export function getBlogAlternates(slug: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  const translations = getSlugTranslations(slug);
  
  supportedLocales.forEach(locale => {
    if (translations[locale]) {
      alternates[locale] = getBlogUrl(slug, locale);
    }
  });
  
  return alternates;
}

// Get the blog list URL for a locale
export function getBlogListUrl(locale: SupportedLocale = 'en'): string {
  return locale === 'en' ? '/blog' : `/blog/${locale}`;
}

// Format date according to locale
export function formatDate(date: string, locale: SupportedLocale): string {
  const dateObj = new Date(date);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
    es: 'es-ES'
  };
  
  return dateObj.toLocaleDateString(localeMap[locale], options);
}

// Get reading time text for locale
export function getReadingTimeText(minutes: number, locale: SupportedLocale): string {
  const translations: Record<SupportedLocale, string> = {
    en: `${minutes} min read`,
    de: `${minutes} Min. Lesezeit`,
    fr: `${minutes} min de lecture`,
    es: `${minutes} min de lectura`
  };
  
  return translations[locale];
}