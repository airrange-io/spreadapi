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
            These are <strong>demo services</strong> you can explore to get a good impression of how SpreadAPI works.
          </p>
          <p style={{ margin: 0 }}>
            Click on a service name to see the parameters, workbook, API endpoints, and web apps in action.
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
    },
    {
      title: 'Connect to AI Systems',
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            The <strong>MCP</strong> button shows you how to integrate your services with <strong>ChatGPT</strong> and <strong>Claude Desktop</strong>.
          </p>
          <p style={{ margin: 0 }}>
            Create your tokens and enable AI systems to reliably calculate even complex models!
          </p>
        </div>
      ),
      placement: 'bottom',
    }
  ],
};
