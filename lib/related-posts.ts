interface RelatedPost {
  slug: string;
  title: string;
  category: string;
}

interface PostRelations {
  [key: string]: string[];
}

// Define relationships between posts based on content similarity and topic
const postRelations: PostRelations = {
  'excel-to-api-without-uploads': [
    'excel-api-vs-file-uploads',
    'excel-formulas-vs-javascript',
    'excel-api-response-times-optimization'
  ],
  'mcp-protocol-excel-developers-guide': [
    'chatgpt-excel-integration-secure',
    'building-ai-agents-excel-tutorial',
    'excel-formulas-vs-javascript'
  ],
  'chatgpt-excel-integration-secure': [
    'mcp-protocol-excel-developers-guide',
    'building-ai-agents-excel-tutorial',
    'spreadapi-vs-google-sheets-api'
  ],
  'excel-api-vs-file-uploads': [
    'excel-to-api-without-uploads',
    'excel-api-response-times-optimization',
    'spreadapi-vs-google-sheets-api'
  ],
  'building-ai-agents-excel-tutorial': [
    'mcp-protocol-excel-developers-guide',
    'chatgpt-excel-integration-secure',
    'excel-formulas-vs-javascript'
  ],
  'excel-formulas-vs-javascript': [
    'excel-to-api-without-uploads',
    'mcp-protocol-excel-developers-guide',
    'excel-api-response-times-optimization'
  ],
  'excel-api-response-times-optimization': [
    'excel-api-vs-file-uploads',
    'excel-to-api-without-uploads',
    'excel-formulas-vs-javascript'
  ],
  'excel-apis-real-estate-mortgage-calculators': [
    'excel-to-api-without-uploads',
    'excel-formulas-vs-javascript',
    'excel-api-response-times-optimization'
  ],
  'spreadapi-vs-google-sheets-api': [
    'excel-api-vs-file-uploads',
    'chatgpt-excel-integration-secure',
    'excel-to-api-without-uploads'
  ]
};

// Get related posts for a given slug
export function getRelatedPosts(currentSlug: string): string[] {
  return postRelations[currentSlug] || [];
}

// Get posts that link to a given slug (reverse lookup)
export function getPostsThatLinkTo(targetSlug: string): string[] {
  const linkingPosts: string[] = [];
  
  Object.entries(postRelations).forEach(([slug, relatedSlugs]) => {
    if (relatedSlugs.includes(targetSlug)) {
      linkingPosts.push(slug);
    }
  });
  
  return linkingPosts;
}

// Check if two posts are related
export function arePostsRelated(slug1: string, slug2: string): boolean {
  const related1 = postRelations[slug1] || [];
  const related2 = postRelations[slug2] || [];
  
  return related1.includes(slug2) || related2.includes(slug1);
}

// Get all posts in the same category
export function getPostsInCategory(posts: any[], category: string, currentSlug?: string): RelatedPost[] {
  return posts
    .filter(post => post.category === category && post.slug !== currentSlug)
    .map(post => ({
      slug: post.slug,
      title: post.title,
      category: post.category
    }));
}

// Get recommended posts based on multiple factors
export function getRecommendedPosts(
  currentSlug: string,
  allPosts: any[],
  limit: number = 3
): RelatedPost[] {
  const directlyRelated = getRelatedPosts(currentSlug);
  const currentPost = allPosts.find(p => p.slug === currentSlug);
  
  if (!currentPost) return [];
  
  const categoryPosts = getPostsInCategory(allPosts, currentPost.category, currentSlug);
  
  // Combine and prioritize: direct relations first, then category posts
  const recommendations: RelatedPost[] = [];
  
  // Add directly related posts
  directlyRelated.forEach(slug => {
    const post = allPosts.find(p => p.slug === slug);
    if (post && recommendations.length < limit) {
      recommendations.push({
        slug: post.slug,
        title: post.title,
        category: post.category
      });
    }
  });
  
  // Fill remaining slots with category posts
  categoryPosts.forEach(post => {
    if (recommendations.length < limit && !recommendations.find(r => r.slug === post.slug)) {
      recommendations.push(post);
    }
  });
  
  return recommendations.slice(0, limit);
}