/**
 * Marketing Page Tour
 * Shows first-time visitors that they can explore without logging in
 */

import type { TourStep } from '@/lib/tourManager';
import { getTranslation, type Locale } from '@/lib/i18n';

export const MARKETING_TOUR_ID = 'marketing-welcome-tour';

export const getMarketingTourSteps = (locale: Locale): TourStep[] => {
  const t = getTranslation(locale);

  return [
    {
      title: t('tours.marketing.step1Title'),
      description: (
        <div>
          <p style={{ margin: 0 }}>
            {t('tours.marketing.step1Desc')}
          </p>
        </div>
      ),
      placement: 'bottom',
    },
  ];
};
