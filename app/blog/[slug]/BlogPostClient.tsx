'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
import RelatedPosts from '@/components/blog/RelatedPosts';
import TableOfContents from '@/components/blog/TableOfContents';
import '../blog.css';

interface RelatedPost {
  slug: string;
  title: string;
  category: string;
  excerpt?: string;
}

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts?: RelatedPost[];
}

export default function BlogPostClient({ post, relatedPosts = [] }: BlogPostClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Generate structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: 'https://spreadapi.com'
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://spreadapi.com/blog/${post.slug}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'SpreadAPI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://spreadapi.com/logo.png'
      }
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
    wordCount: post.content.split(' ').length,
    image: {
      '@type': 'ImageObject',
      url: `https://spreadapi.com/api/og?title=${encodeURIComponent(post.title)}`,
      width: 1200,
      height: 630
    }
  };

  // Convert markdown-style formatting to HTML with heading IDs
  const formatContent = (content: string) => {
    // Add IDs to headings for TOC navigation
    let html = content.replace(/\n/g, '<br />');
    
    // Replace headings with IDs
    html = html.replace(/^(#{2,3})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return `<h${level} id="${id}">${text}</h${level}>`;
    });
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <style jsx global>{`
        .product-page,
        .product-page * {
          font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      {/* Navigation */}
      <nav className="navbar-component">
        <div className="navbar-container">
          <a href="/" className="navbar-logo-link">
            <img src="/icons/logo-full.svg" alt="SpreadAPI" className="navbar-logo" />
          </a>

          <div className="navbar-menu">
            <a href="/product" className="navbar-link">Features</a>
            <a href="/product#benefits" className="navbar-link">Benefits</a>
            <a href="/blog" className="navbar-link active">Blog</a>
            <a href="/product#faq" className="navbar-link">FAQs</a>
          </div>

          <div className="navbar-button-wrapper">
            <a href="/product#cta" className="button hide-mobile-portrait">Get Started</a>
            <button
              className="navbar-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="menu-icon-line-top"></div>
                <div className="menu-icon-line-center">
                  <div className="menu-icon-line-center-inner"></div>
                </div>
                <div className="menu-icon-line-bottom"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <nav className="mobile-nav">
              <a href="/product" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="/product#benefits" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
              <a href="/blog" className="navbar-link active" onClick={() => setMobileMenuOpen(false)}>Blog</a>
              <a href="/product#faq" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>FAQs</a>
              <a href="/product#cta" className="button w-button" onClick={() => setMobileMenuOpen(false)}>Get Started</a>
            </nav>
          </div>
        )}
      </nav>

      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <div className="breadcrumb-container">
          <ol className="breadcrumb-list">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-separator">/</li>
            <li className="breadcrumb-item">
              <Link href="/blog">Blog</Link>
            </li>
            <li className="breadcrumb-separator">/</li>
            <li className="breadcrumb-item active" aria-current="page">
              {post.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Blog Post Hero */}
      <div className="blog-post-hero">
        <div className="blog-post-hero-content">
          <div className="blog-post-category">{post.category}</div>
          <h1 className="blog-post-title">{post.title}</h1>
          <div className="blog-post-meta">
            <span>{post.author}</span>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </div>

      {/* Blog Post Content with TOC */}
      <div className="blog-post-layout">
        <div className="blog-post-container">
          <article className="blog-post-content">
            {formatContent(post.content)}
            
            {/* Tags */}
            <div className="blog-tags">
              {post.tags.map((tag: string) => (
                <Link key={tag} href={`/blog?tag=${tag}`} className="blog-tag">
                  {tag}
                </Link>
              ))}
            </div>
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <RelatedPosts posts={relatedPosts} currentSlug={post.slug} />
            )}
          </article>
          
          {/* Table of Contents - Desktop only */}
          <aside className="blog-post-sidebar">
            <TableOfContents content={post.content} />
          </aside>
        </div>
      </div>

      {/* Navigation */}
      <div className="blog-nav">
        <Link href="/blog" className="blog-nav-link">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Blog
        </Link>
      </div>
    </div>
  );
}