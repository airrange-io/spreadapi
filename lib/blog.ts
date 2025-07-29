import fs from 'fs';
import path from 'path';

const contentDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  readingTime: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}

export function getSortedPostsData(locale: string = 'en'): BlogPost[] {
  const postsDirectory = path.join(contentDirectory, locale);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }

  // Get file names under /content/blog/[locale]
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.json'))
    .map((fileName) => {
      // Remove .json from file name to get slug
      const slug = fileName.replace(/\.json$/, '');

      // Read JSON file
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const postData = JSON.parse(fileContents);

      // Calculate reading time (avg 200 words per minute)
      const wordCount = postData.content.split(/\s+/g).length;
      const readingTime = Math.ceil(wordCount / 200);

      // Combine the data with the slug
      return {
        slug,
        ...postData,
        readingTime,
      } as BlogPost;
    });
  
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostData(slug: string, locale: string = 'en'): Promise<BlogPost | null> {
  try {
    const postsDirectory = path.join(contentDirectory, locale);
    const fullPath = path.join(postsDirectory, `${slug}.json`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const postData = JSON.parse(fileContents);

    // Calculate reading time
    const wordCount = postData.content.split(/\s+/g).length;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      slug,
      ...postData,
      readingTime,
    } as BlogPost;
  } catch (error) {
    console.error(`Error loading post ${slug} for locale ${locale}:`, error);
    return null;
  }
}

export function getPostsByCategory(category: string, locale: string = 'en'): BlogPost[] {
  const allPosts = getSortedPostsData(locale);
  return allPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
}

export function getPostsByTag(tag: string, locale: string = 'en'): BlogPost[] {
  const allPosts = getSortedPostsData(locale);
  return allPosts.filter(post => 
    post.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
  );
}

export function getAllCategories(locale: string = 'en'): string[] {
  const allPosts = getSortedPostsData(locale);
  const categories = new Set(allPosts.map(post => post.category));
  return Array.from(categories);
}

export function getAllTags(locale: string = 'en'): string[] {
  const allPosts = getSortedPostsData(locale);
  const tags = new Set(allPosts.flatMap(post => post.tags));
  return Array.from(tags);
}