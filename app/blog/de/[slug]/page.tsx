import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostServer from '../../[slug]/BlogPostServer';
import { getPostData, getSortedPostsData } from '@/lib/blog';
import { getSlugTranslations } from '@/lib/translations/slug-mapping';
import RelatedPosts from '@/components/blog/RelatedPosts';
import '../../blog.css';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostData(slug, 'de');
  
  if (!post) {
    return {
      title: 'Beitrag nicht gefunden',
      description: 'Der angeforderte Blogbeitrag konnte nicht gefunden werden.'
    };
  }

  // Get translations for alternate links
  const translations = getSlugTranslations(slug);
  const alternateLinks: Record<string, string> = {};
  
  Object.entries(translations).forEach(([lang, translatedSlug]) => {
    if (lang === 'en') {
      alternateLinks[lang] = `/blog/${translatedSlug}`;
    } else {
      alternateLinks[lang] = `/blog/${lang}/${translatedSlug}`;
    }
  });

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      locale: 'de_DE',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(post.title)}`,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: [`/api/og?title=${encodeURIComponent(post.title)}`],
    },
    alternates: {
      canonical: `/blog/de/${slug}`,
      languages: alternateLinks
    }
  };
}

export async function generateStaticParams() {
  const posts = getSortedPostsData('de');
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function GermanBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostData(slug, 'de');
  
  if (!post) {
    notFound();
  }

  // Get related posts in German
  const allPosts = getSortedPostsData('de');
  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3)
    .map(p => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      excerpt: p.excerpt
    }));

  return <BlogPostServer post={post} relatedPosts={relatedPosts} locale="de" />;
}