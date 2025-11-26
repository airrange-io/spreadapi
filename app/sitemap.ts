import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/blog';
import { supportedLocales } from '@/lib/translations/blog-helpers';

// Marketing locales (separate from blog locales)
const marketingLocales = ['de', 'fr', 'es'] as const;

// Marketing pages that have locale versions
const localizedMarketingPages = [
  '', // homepage
  'automation-calculations',
  'stop-rewriting-excel-in-code',
  'how-excel-api-works',
  'excel-ai-integration',
  'why-ai-fails-at-math',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://spreadapi.com';
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static marketing pages (English)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/how-excel-api-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/excel-ai-integration`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/why-ai-fails-at-math`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stop-rewriting-excel-in-code`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/automation-calculations`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  sitemapEntries.push(...staticPages);

  // Add localized marketing pages
  marketingLocales.forEach(locale => {
    localizedMarketingPages.forEach(page => {
      const url = page
        ? `${baseUrl}/${locale}/${page}`
        : `${baseUrl}/${locale}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page === '' ? 0.9 : 0.7,
      });
    });
  });
  
  // Add blog list pages for each locale
  supportedLocales.forEach(locale => {
    const blogUrl = locale === 'en' 
      ? `${baseUrl}/blog`
      : `${baseUrl}/blog/${locale}`;
      
    sitemapEntries.push({
      url: blogUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    });
  });
  
  // Add all blog posts in all available languages
  supportedLocales.forEach(locale => {
    try {
      const posts = getSortedPostsData(locale);
      
      posts.forEach(post => {
        const url = locale === 'en'
          ? `${baseUrl}/blog/${post.slug}`
          : `${baseUrl}/blog/${locale}/${post.slug}`;
          
        sitemapEntries.push({
          url,
          lastModified: new Date(post.date),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      });
    } catch (error) {
      // Skip if no posts for this locale yet
      console.log(`No posts found for locale ${locale}`);
    }
  });

  return sitemapEntries;
}