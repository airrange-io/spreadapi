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
      title: 'Welcome to SpreadAPI! 👋',
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            These are <strong>demo services</strong> you can explore to get a good impression of how SpreadAPI works.
          </p>
          <p style={{ margin: 0 }}>
            Click on any demo service to see the workbook, API endpoints, and web apps in action.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      title: 'Create Your First Service 🚀',
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            Click <strong>"New Service"</strong> to create your first calculation service.
          </p>
          <p style={{ margin: 0 }}>
            Just log in to get started - <strong>no subscription needed!</strong>
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      title: 'Connect to AI Systems 🤖',
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            The <strong>MCP button</strong> shows you how to integrate SpreadAPI with <strong>ChatGPT</strong> and <strong>Claude Desktop</strong>.
          </p>
          <p style={{ margin: 0 }}>
            Create the tokens you need to connect and enable AI systems to reliably calculate even complex models using your spreadsheets!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      title: 'Chat with Your Services 💬',
      description: (
        <div>
          <p style={{ marginBottom: 12 }}>
            Use the <strong>Chat button</strong> to interact directly with your services.
          </p>
          <p style={{ margin: 0 }}>
            No MCP installation needed - just chat naturally with your calculation services!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
  ],
};
