import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/blog';
import { supportedLocales } from '@/lib/translations/blog-helpers';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://spreadapi.io';
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/product`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/product/how-excel-api-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/product/excel-ai-integration`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/product/editable-areas`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/product/how-it-works2`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/product/why-ai-fails-at-math`,
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
      url: `${baseUrl}/ai-security-control`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
  
  sitemapEntries.push(...staticPages);
  
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