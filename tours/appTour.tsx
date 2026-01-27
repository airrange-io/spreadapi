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
      title: 'See How It Works',
      description: (
        <div>
          <p style={{ margin: 0 }}>
            Start with a quick <strong>5-minute walkthrough</strong>. See how to upload an Excel file, define parameters, and turn your formulas into a live API endpoint.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      title: 'Try a Ready-Made Example',
      description: (
        <div>
          <p style={{ margin: 0 }}>
            Explore one of our <strong>sample workbooks</strong> — complete with pre-configured input and output parameters. A great way to see what's possible before building your own.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      title: 'Build Your First API',
      description: (
        <div>
          <p style={{ margin: 0 }}>
            When you're ready, create a new service from your own Excel workbook. Upload your file, select cells as parameters, and publish your API in minutes.
          </p>
        </div>
      ),
      placement: 'bottom',
    }
  ],
};
