'use client';

import { useState, useEffect, useCallback } from 'react';
import { translations, type Locale } from './translations';

const LOCALE_STORAGE_KEY = 'spreadapi-locale';

/** Detect locale: stored preference → browser language → English. */
function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
  if (stored && stored in translations) return stored;
  const lang = navigator.language?.slice(0, 2) as Locale;
  return lang in translations ? lang : 'en';
}

/**
 * React hook that exposes:
 * - `t(key, params?)` – looks up a plain-string translation.
 * - `locale`          – the resolved locale (`'en' | 'de' | …`).
 * - `setLocale(l)`    – override locale and persist to localStorage.
 *
 * For JSX-heavy translations use `locale` directly with a
 * `Record<Locale, ReactNode>` pattern so each language block
 * can contain arbitrary markup.
 */
export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[locale];
      let text = dict?.[key] ?? translations.en[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replaceAll(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [locale],
  );

  return { t, locale, setLocale };
}
