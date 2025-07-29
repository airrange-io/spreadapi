import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getSlugTranslations, hasTranslation } from './translations/slug-mapping';

const contentDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readingTime: number;
  category: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  locale: string;
  availableTranslations: string[];
}

// Get all posts for a specific locale
export function getLocalizedPosts(locale: string = 'en'): BlogPost[] {
  const localeDir = path.join(contentDirectory, locale);
  
  if (!fs.existsSync(localeDir)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(localeDir);
  
  return fileNames
    .filter(fileName => fileName.endsWith('.json'))
    .map(fileName => {
      const slug = fileName.replace(/\.json$/, '');
      const fullPath = path.join(localeDir, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const post = JSON.parse(fileContents);
      
      // Get available translations for this post
      const originalSlug = Object.keys(getSlugTranslations(slug))[0] || slug;
      const availableTranslations = getAvailableLocales(originalSlug);
      
      return {
        ...post,
        slug,
        locale,
        availableTranslations
      };
    });
}

// Get sorted posts for a locale
export function getSortedLocalizedPosts(locale: string = 'en'): BlogPost[] {
  const allPosts = getLocalizedPosts(locale);
  
  return allPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

// Get a single post by slug and locale
export async function getLocalizedPost(slug: string, locale: string = 'en'): Promise<BlogPost | null> {
  try {
    const filePath = path.join(contentDirectory, locale, `${slug}.json`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const post = JSON.parse(fileContents);
    
    // Get available translations
    const translations = getSlugTranslations(slug);
    const availableTranslations = Object.keys(translations).filter(lang => 
      hasTranslation(Object.keys(translations)[0], lang)
    );
    
    return {
      ...post,
      slug,
      locale,
      availableTranslations
    };
  } catch (error) {
    console.error(`Error loading post ${slug} for locale ${locale}:`, error);
    return null;
  }
}

// Get all unique categories across all locales
export function getAllCategories(locale?: string): string[] {
  const locales = locale ? [locale] : ['en', 'de', 'fr', 'es'];
  const categories = new Set<string>();
  
  locales.forEach(loc => {
    const posts = getLocalizedPosts(loc);
    posts.forEach(post => {
      categories.add(post.category);
    });
  });
  
  return Array.from(categories);
}

// Get all unique tags across all locales
export function getAllTags(locale?: string): string[] {
  const locales = locale ? [locale] : ['en', 'de', 'fr', 'es'];
  const tags = new Set<string>();
  
  locales.forEach(loc => {
    const posts = getLocalizedPosts(loc);
    posts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
  });
  
  return Array.from(tags);
}

// Get posts by category for a locale
export function getPostsByCategory(category: string, locale: string = 'en'): BlogPost[] {
  const posts = getSortedLocalizedPosts(locale);
  return posts.filter(post => post.category === category);
}

// Get posts by tag for a locale
export function getPostsByTag(tag: string, locale: string = 'en'): BlogPost[] {
  const posts = getSortedLocalizedPosts(locale);
  return posts.filter(post => post.tags.includes(tag));
}

// Get translation status for all posts
export function getTranslationStatus(): Record<string, Record<string, boolean>> {
  const status: Record<string, Record<string, boolean>> = {};
  const locales = ['en', 'de', 'fr', 'es'];
  
  // Get all English posts as the base
  const englishPosts = getLocalizedPosts('en');
  
  englishPosts.forEach(post => {
    status[post.slug] = {};
    locales.forEach(locale => {
      const translatedSlug = getSlugTranslations(post.slug)?.[locale];
      if (translatedSlug) {
        const filePath = path.join(contentDirectory, locale, `${translatedSlug}.json`);
        status[post.slug][locale] = fs.existsSync(filePath);
      } else {
        status[post.slug][locale] = locale === 'en';
      }
    });
  });
  
  return status;
}

// Helper function to get available locales for a post
function getAvailableLocales(originalSlug: string): string[] {
  const translations = getSlugTranslations(originalSlug);
  const available: string[] = [];
  
  Object.entries(translations).forEach(([locale, slug]) => {
    const filePath = path.join(contentDirectory, locale, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      available.push(locale);
    }
  });
  
  return available;
}