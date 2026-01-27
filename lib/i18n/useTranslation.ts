'use client';

import { useState, useEffect, useCallback } from 'react';
import { translations, type Locale } from './translations';

/** Detect browser locale, falling back to English. */
function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.slice(0, 2) as Locale;
  return lang in translations ? lang : 'en';
}

/**
 * React hook that exposes:
 * - `t(key, params?)` – looks up a plain-string translation.
 * - `locale`          – the resolved locale (`'en' | 'de' | …`).
 *
 * For JSX-heavy translations use `locale` directly with a
 * `Record<Locale, ReactNode>` pattern so each language block
 * can contain arbitrary markup.
 */
export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    setLocale(detectLocale());
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

  return { t, locale };
}
