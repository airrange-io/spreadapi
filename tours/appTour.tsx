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
            This is your <strong>service dashboard</strong> where all your Excel APIs will appear.
          </p>
          <p style={{ margin: 0 }}>
            Each service lets you expose Excel workbook calculations as API endpoints.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      title: 'Create Your Own Service',
      description: (
        <div>
          <p style={{ margin: 0 }}>
            Click here to create your first API.
          </p>
          <p style={{ margin: 0, marginBottom: 12 }}>
            No subscription needed! Just log in to get started.
          </p>
        </div>
      ),
      placement: 'bottom',
    }
  ],
};
