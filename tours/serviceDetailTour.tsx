/**
 * Service Detail Tour for Demo Services
 * Shows users how to work with the workbook and create API parameters
 */

import type { TourDefinition } from '@/lib/tourManager';

export const SERVICE_DETAIL_TOUR_ID = 'service-detail-tour';

export const serviceDetailTour: TourDefinition = {
  id: SERVICE_DETAIL_TOUR_ID,
  name: 'Service Detail Walkthrough',
  route: '/app/service/[id]',
  steps: [
    {
      title: 'Input & Output Parameters',
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            These are the input and output parameters for your service API.
            Each parameter is linked to a specific area in your workbook.
            When the service is called, the <strong>input parameters</strong> are written into your workbook, triggering a recalculation.
          </p>
          <p style={{ margin: 0 }}>
            After the recalculation, the <strong>output parameters</strong> — defined as cell references — are returned by the service.
            Outputs can include single cells or entire ranges.
          </p>
        </div>
      ),
      placement: 'right',
    },
    {
      title: 'Create a Parameter',
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            To create a parameter, select any cell or range in your workbook.
            If the selection is a formula or a cell range, it’s automatically set as an Output.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      title: 'Explore More Features 🔍',
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            Use the page switcher to test your API, create simple web apps, and review your service usage.
          </p>
          <p style={{ margin: 0 }}>
            These options become available once your service is published.
          </p>
        </div>
      ),
      placement: 'top',
    },
  ],
};
