import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { rehype } from 'rehype';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content?: string;
  author: string;
  category: string;
  tags: string[];
  readingTime: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}

export function getSortedPostsData(): BlogPost[] {
  // Get file names under /content/blog
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.mdx') || fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove file extension from file name to get slug
      const slug = fileName.replace(/\.mdx?$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Calculate reading time (avg 200 words per minute)
      const wordCount = matterResult.content.split(/\s+/g).length;
      const readingTime = Math.ceil(wordCount / 200);

      // Combine the data with the slug
      return {
        slug,
        ...matterResult.data,
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

export async function getPostData(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Calculate reading time
    const wordCount = matterResult.content.split(/\s+/g).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: false })
      .process(matterResult.content);
    
    const contentHtml = processedContent.toString();

    // Apply syntax highlighting
    const highlightedContent = await rehype()
      .use(rehypePrism)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
      .process(contentHtml);

    // Combine the data with the slug and contentHtml
    return {
      slug,
      content: highlightedContent.toString(),
      ...matterResult.data,
      readingTime,
    } as BlogPost;
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    return null;
  }
}

export function getPostsByCategory(category: string): BlogPost[] {
  const allPosts = getSortedPostsData();
  return allPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
}

export function getPostsByTag(tag: string): BlogPost[] {
  const allPosts = getSortedPostsData();
  return allPosts.filter(post => 
    post.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
  );
}

export function getAllCategories(): string[] {
  const allPosts = getSortedPostsData();
  const categories = new Set(allPosts.map(post => post.category));
  return Array.from(categories);
}

export function getAllTags(): string[] {
  const allPosts = getSortedPostsData();
  const tags = new Set(allPosts.flatMap(post => post.tags));
  return Array.from(tags);
}