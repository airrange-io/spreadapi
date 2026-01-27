/**
 * Non-hook translation helper for use outside React components
 * (e.g. tour-step factories, utility functions).
 *
 * Usage:
 *   const t = getTranslation(locale);
 *   t('tours.app.step1Title');
 */
import { translations, type Locale } from './translations';

export function getTranslation(locale: Locale) {
  return (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[locale];
    let text = dict?.[key] ?? translations.en[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replaceAll(`{${k}}`, String(v));
      });
    }
    return text;
  };
}
