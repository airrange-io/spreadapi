import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostData, getSortedPostsData } from '@/lib/blog';
import { getRecommendedPosts } from '@/lib/related-posts';
import BlogPostServer from './BlogPostServer';

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostData(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const url = `https://spreadapi.io/blog/${slug}`;

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.tags?.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      url,
      siteName: 'SpreadAPI',
      images: [{
        url: `https://spreadapi.io/api/og?title=${encodeURIComponent(post.title)}`,
        width: 1200,
        height: 630,
        alt: post.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      site: '@spreadapi',
      creator: '@spreadapi',
      images: [`https://spreadapi.io/api/og?title=${encodeURIComponent(post.title)}`],
    },
    alternates: {
      canonical: url,
      languages: {
        'en': url,
        'x-default': url,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    notFound();
  }

  // Get all posts and related posts
  const allPosts = getSortedPostsData();
  const relatedPosts = getRecommendedPosts(slug, allPosts, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.seoDescription || post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author,
    },
    "publisher": {
      "@type": "Organization",
      "name": "SpreadAPI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://spreadapi.io/icons/logo-full.svg",
      },
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://spreadapi.io/blog/${slug}`,
    },
    "image": `https://spreadapi.io/api/og?title=${encodeURIComponent(post.title)}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://spreadapi.io",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://spreadapi.io/blog",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://spreadapi.io/blog/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogPostServer post={post} relatedPosts={relatedPosts} />
    </>
  );
}