/**
 * Service Detail Tour for Demo Services
 * Shows users how to work with the workbook and create API parameters
 */

import type { TourStep } from '@/lib/tourManager';
import { getTranslation, type Locale } from '@/lib/i18n';

export const SERVICE_DETAIL_TOUR_ID = 'service-detail-tour';

export const getServiceDetailTourSteps = (locale: Locale): TourStep[] => {
  const t = getTranslation(locale);

  return [
    {
      title: t('tours.detail.step1Title'),
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            {({ en: <>These are the input and output parameters for your service API. Each parameter is linked to a specific area in your workbook. When the service is called, the <strong>input parameters</strong> are written into your workbook, triggering a recalculation.</>, de: <>Dies sind die Ein- und Ausgabeparameter f&#252;r Ihre Service-API. Jeder Parameter ist mit einem bestimmten Bereich in Ihrer Arbeitsmappe verkn&#252;pft. Beim Aufruf des Service werden die <strong>Eingabeparameter</strong> in Ihre Arbeitsmappe geschrieben und eine Neuberechnung ausgel&#246;st.</> } as Record<string, React.ReactNode>)[locale] ?? <>These are the input and output parameters for your service API. Each parameter is linked to a specific area in your workbook. When the service is called, the <strong>input parameters</strong> are written into your workbook, triggering a recalculation.</>}
          </p>
          <p style={{ margin: 0 }}>
            {({ en: <>After the recalculation, the <strong>output parameters</strong> — defined as cell references — are returned by the service. Outputs can include single cells or entire ranges.</>, de: <>Nach der Neuberechnung werden die <strong>Ausgabeparameter</strong> — definiert als Zellverweise — vom Service zur&#252;ckgegeben. Ausgaben k&#246;nnen einzelne Zellen oder ganze Bereiche umfassen.</> } as Record<string, React.ReactNode>)[locale] ?? <>After the recalculation, the <strong>output parameters</strong> — defined as cell references — are returned by the service. Outputs can include single cells or entire ranges.</>}
          </p>
        </div>
      ),
      placement: 'right',
    },
    {
      title: t('tours.detail.step2Title'),
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            {t('tours.detail.step2Desc')}
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      title: t('tours.detail.step3Title'),
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            {t('tours.detail.step3Desc1')}
          </p>
          <p style={{ margin: 0 }}>
            {t('tours.detail.step3Desc2')}
          </p>
        </div>
      ),
      placement: 'top',
    },
  ];
};
