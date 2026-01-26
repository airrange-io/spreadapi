/**
 * Welcome Tour for /app route
 * Shows first-time users how to get started with SpreadAPI
 */

import type { TourDefinition } from '@/lib/tourManager';

export const APP_TOUR_ID = 'app-welcome-tour';

export const appTour: TourDefinition = {
  id: APP_TOUR_ID,
  name: 'Welcome to SpreadAPI',
  route: '/app',
  steps: [
    {
      title: 'Welcome to SpreadAPI!',
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            Watch a <strong>short video</strong> to see how SpreadAPI turns Excel workbooks into APIs,
            or try one of our <strong>sample workbooks</strong> to get hands-on right away.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      title: 'Create Your Own Service',
      description: (
        <div>
          <p style={{ margin: 0 }}>
            Ready to use your own Excel file? Click here to create a new API service.
          </p>
        </div>
      ),
      placement: 'bottom',
    }
  ],
};
