import { seoKeywords, getFocusKeywords } from './seo-keywords';

export interface TranslatedBlogPost {
  // Basic Info
  slug: string;
  locale: string;
  
  // Content
  title: string;
  excerpt: string;
  content: string;
  
  // SEO Optimized Fields
  seoTitle: string;           // 50-60 chars with keywords
  seoDescription: string;     // 150-160 chars with keywords
  keywords: string[];         // Focus keywords for this post
  
  // Meta Data
  author: string;
  date: string;
  lastModified: string;
  readingTime: number;
  
  // Categorization
  category: string;
  tags: string[];
  
  // Internal Linking
  relatedSlugs: string[];     // Slugs in same language
  
  // Schema.org Data
  schemaKeywords: string[];   // All relevant keywords for schema
}

// Translation template generator
export function createTranslationTemplate(
  originalPost: any,
  targetLocale: string,
  translatedSlug: string
): Partial<TranslatedBlogPost> {
  const keywords = getFocusKeywords(originalPost.slug, targetLocale);
  
  return {
    slug: translatedSlug,
    locale: targetLocale,
    keywords: keywords,
    schemaKeywords: [...keywords, ...seoKeywords[targetLocale].secondary],
    date: originalPost.date,
    lastModified: new Date().toISOString(),
    author: originalPost.author,
    category: originalPost.category,
    // Tags will be translated
    // relatedSlugs will be updated after all translations exist
  };
}

// SEO content guidelines for translators
export const translationGuidelines = {
  de: {
    titleLength: { min: 50, max: 60, note: 'German allows longer compound words' },
    descriptionLength: { min: 150, max: 160 },
    keywordDensity: '2-3% for primary keywords',
    notes: [
      'Use "Sie" (formal) for professional content',
      'Compound words are SEO-friendly in German',
      'Include umlauts (ä, ö, ü) naturally'
    ]
  },
  fr: {
    titleLength: { min: 50, max: 60 },
    descriptionLength: { min: 150, max: 160 },
    keywordDensity: '2-3% for primary keywords',
    notes: [
      'Use "vous" (formal) for professional content',
      'Avoid anglicisms where French terms exist',
      'Include accents properly (é, è, à, ç)'
    ]
  },
  es: {
    titleLength: { min: 50, max: 60 },
    descriptionLength: { min: 150, max: 160 },
    keywordDensity: '2-3% for primary keywords',
    notes: [
      'Use "usted" (formal) for professional content',
      'Consider regional variations (Spain vs Latin America)',
      'Include tildes and ñ properly'
    ]
  }
};

// Validate SEO optimization of translated content
export function validateSEOOptimization(post: TranslatedBlogPost): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const guidelines = translationGuidelines[post.locale];
  
  // Check title length
  if (post.seoTitle.length < guidelines.titleLength.min) {
    issues.push(`Title too short (${post.seoTitle.length} chars, min: ${guidelines.titleLength.min})`);
  }
  if (post.seoTitle.length > guidelines.titleLength.max) {
    issues.push(`Title too long (${post.seoTitle.length} chars, max: ${guidelines.titleLength.max})`);
  }
  
  // Check description length
  if (post.seoDescription.length < guidelines.descriptionLength.min) {
    issues.push(`Description too short (${post.seoDescription.length} chars)`);
  }
  if (post.seoDescription.length > guidelines.descriptionLength.max) {
    issues.push(`Description too long (${post.seoDescription.length} chars)`);
  }
  
  // Check keyword presence in title
  const titleLower = post.seoTitle.toLowerCase();
  const hasKeywordInTitle = post.keywords.some(kw => 
    titleLower.includes(kw.toLowerCase())
  );
  if (!hasKeywordInTitle) {
    issues.push('No focus keyword found in title');
  }
  
  // Check keyword presence in description
  const descLower = post.seoDescription.toLowerCase();
  const hasKeywordInDesc = post.keywords.some(kw => 
    descLower.includes(kw.toLowerCase())
  );
  if (!hasKeywordInDesc) {
    issues.push('No focus keyword found in description');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}