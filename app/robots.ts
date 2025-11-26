import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://spreadapi.com';

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
        allow: [
          '/',
          '/blog/',
          '/how-excel-api-works',
          '/stop-rewriting-excel-in-code',
          '/excel-ai-integration',
          '/why-ai-fails-at-math',
          '/docs',
          '/pricing',
        ],
        disallow: [
          '/app/',
          '/api/',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/',
          '/blog/',
          '/how-excel-api-works',
          '/stop-rewriting-excel-in-code',
          '/excel-ai-integration',
          '/why-ai-fails-at-math',
          '/docs',
          '/pricing',
        ],
        disallow: [
          '/app/',
          '/api/',
        ],
      },
      {
        userAgent: 'Claude-Web',
        allow: [
          '/',
          '/blog/',
          '/how-excel-api-works',
          '/stop-rewriting-excel-in-code',
          '/excel-ai-integration',
          '/why-ai-fails-at-math',
          '/docs',
          '/pricing',
        ],
        disallow: [
          '/app/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
