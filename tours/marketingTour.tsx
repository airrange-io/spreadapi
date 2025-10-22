/**
 * Marketing Page Tour
 * Shows first-time visitors that they can explore without logging in
 */

import type { TourDefinition } from '@/lib/tourManager';

export const MARKETING_TOUR_ID = 'marketing-welcome-tour';

export const marketingTour: TourDefinition = {
  id: MARKETING_TOUR_ID,
  name: 'Welcome to SpreadAPI',
  route: '/',
  steps: [
    {
      title: 'Try SpreadAPI Without Signing Up!',
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            Click <strong>"Get Started"</strong> to see SpreadAPI in action.
          </p>
          <p style={{ margin: 0 }}>
            You can <strong>explore demo services, test APIs, and see the workbook editor</strong> — all without creating an account!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
  ],
};
