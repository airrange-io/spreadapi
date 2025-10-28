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
      title: "Try SpreadAPI - It's Free to Get Started!",
      description: (
        <div>
          <p style={{ margin: 0 }}>
            Create your free SpreadAPI account to explore demo services, test APIs, and use the workbook editor — no credit card required!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
  ],
};
