/**
 * Welcome Tour for /app route
 * Shows first-time users how to get started with SpreadAPI
 */

import type { TourStep } from '@/lib/tourManager';
import { getTranslation, type Locale } from '@/lib/i18n';

export const APP_TOUR_ID = 'app-welcome-tour';

export const getAppTourSteps = (locale: Locale): TourStep[] => {
  const t = getTranslation(locale);

  return [
    {
      title: t('tours.app.step1Title'),
      description: (
        <div>
          <p style={{ margin: 0 }}>
            {({ en: <>Start with a quick <strong>5-minute walkthrough</strong>. See how to upload an Excel file, define parameters, and turn your formulas into a live API endpoint.</>, de: <>Starten Sie mit einem kurzen <strong>5-Minuten-Video</strong>. Sehen Sie, wie Sie eine Excel-Datei hochladen, Parameter definieren und Ihre Formeln in einen Live-API-Endpunkt verwandeln.</> } as Record<string, React.ReactNode>)[locale] ?? <>Start with a quick <strong>5-minute walkthrough</strong>. See how to upload an Excel file, define parameters, and turn your formulas into a live API endpoint.</>}
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      title: t('tours.app.step2Title'),
      description: (
        <div>
          <p style={{ margin: 0 }}>
            {({ en: <>Explore one of our <strong>sample workbooks</strong> — complete with pre-configured input and output parameters. A great way to see what&#39;s possible before building your own.</>, de: <>Entdecken Sie eine unserer <strong>Beispiel-Arbeitsmappen</strong> — mit vorkonfigurierten Ein- und Ausgabeparametern. Ideal, um die M&#246;glichkeiten zu erkunden, bevor Sie selbst loslegen.</> } as Record<string, React.ReactNode>)[locale] ?? <>Explore one of our <strong>sample workbooks</strong> — complete with pre-configured input and output parameters. A great way to see what&#39;s possible before building your own.</>}
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      title: t('tours.app.step3Title'),
      description: (
        <div>
          <p style={{ margin: 0 }}>
            {t('tours.app.step3Desc')}
          </p>
        </div>
      ),
      placement: 'bottom',
    }
  ];
};
