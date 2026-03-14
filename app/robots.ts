import { MetadataRoute } from 'next';

// Marketing pages available in multiple languages
const marketingPages = [
  '/',
  '/how-excel-api-works',
  '/stop-rewriting-excel-in-code',
  '/automation-calculations',
  '/excel-ai-integration',
  '/why-ai-fails-at-math',
  '/on-premises',
];

// Generate locale versions of marketing pages
// Only German is actively translated for now
const localeMarketingPages = ['de'].flatMap(locale =>
  marketingPages.map(page => page === '/' ? `/${locale}` : `/${locale}${page}`)
);

// All allowed marketing pages (English + localized)
const allMarketingPages = [
  ...marketingPages,
  ...localeMarketingPages,
  '/docs',
  '/pricing',
  '/blog/',
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://spreadapi.io';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/app/',        // User dashboard/app area
          '/api/',        // API endpoints
          '/auth/',       // Authentication pages
          '/_next/',      // Next.js internal
          '/admin/',      // Admin area if any
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: allMarketingPages,
        disallow: [
          '/app/',
          '/api/',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: allMarketingPages,
        disallow: [
          '/app/',
          '/api/',
        ],
      },
      {
        userAgent: 'Claude-Web',
        allow: allMarketingPages,
        disallow: [
          '/app/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
