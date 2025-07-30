'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
import RelatedPosts from '@/components/blog/RelatedPosts';
import TableOfContents from '@/components/blog/TableOfContents';
import Navigation from '@/components/Navigation';
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
  locale?: string;
}

export default function BlogPostClient({ post, relatedPosts = [], locale = 'en' }: BlogPostClientProps) {
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
    let html = content;
    const idCounts: { [key: string]: number } = {};
    
    // Replace code blocks first (```language\ncode```)
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });
    
    // Replace inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Replace headings with IDs (# ## ###)
    html = html.replace(/^(#{1,3})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      let id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      
      // Make IDs unique by adding a counter if duplicate
      if (idCounts[id]) {
        idCounts[id]++;
        id = `${id}-${idCounts[id]}`;
      } else {
        idCounts[id] = 1;
      }
      
      return `<h${level} id="${id}">${text}</h${level}>`;
    });
    
    // Replace bold text (**text**)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Replace italic text (*text*) - more careful regex
    html = html.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    
    // Replace blockquotes (> text)
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Replace unordered lists (- item)
    html = html.replace(/((?:^[\s]*[-*]\s+.+$\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(item => 
        `<li>${item.replace(/^[\s]*[-*]\s+/, '')}</li>`
      ).join('\n');
      return `<ul>\n${items}\n</ul>`;
    });
    
    // Replace ordered lists (1. item)
    html = html.replace(/((?:^[\s]*\d+\.\s+.+$\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(item => 
        `<li>${item.replace(/^[\s]*\d+\.\s+/, '')}</li>`
      ).join('\n');
      return `<ol>\n${items}\n</ol>`;
    });
    
    // Replace horizontal rules (---)
    html = html.replace(/^---$/gm, '<hr />');
    
    // Handle paragraphs - split by double newlines
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(para => {
      // Don't wrap if it's already a block element
      if (para.match(/^<(h[1-6]|ul|ol|pre|blockquote|hr)/)) {
        return para;
      }
      // Convert single newlines to <br> within paragraphs
      para = para.replace(/\n/g, '<br />');
      return `<p>${para}</p>`;
    }).join('\n\n');
    
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
        
        @media (max-width: 1024px) {
          .blog-post-container {
            grid-template-columns: 1fr !important;
          }
          .blog-post-sidebar {
            display: none !important;
          }
        }
        
        @media (max-width: 768px) {
          .blog-post-content {
            padding: 24px 20px !important;
            border-radius: 8px !important;
            margin: 0 16px !important;
          }
          .blog-post-hero h1 {
            font-size: 1.75rem !important;
            line-height: 1.3 !important;
          }
          .blog-post-hero {
            padding: 40px 0 40px !important;
          }
          .blog-post-layout {
            padding: 40px 0 !important;
          }
          .blog-post-container {
            padding: 0 !important;
          }
          .navbar-container {
            padding: 1rem !important;
          }
          .breadcrumb-container {
            padding: 0 1rem !important;
          }
          .blog-post-meta {
            font-size: 13px !important;
            flex-wrap: wrap !important;
          }
          .blog-post-category {
            font-size: 11px !important;
            padding: 8px 20px !important;
          }
        }
        
        /* Override table of contents scrollbar */
        .table-of-contents {
          overflow-y: visible !important;
          max-height: none !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }
        
        /* Hide scrollbar on all browsers */
        .blog-post-sidebar::-webkit-scrollbar,
        .table-of-contents::-webkit-scrollbar {
          display: none !important;
        }
        
        .blog-post-sidebar,
        .table-of-contents {
          -ms-overflow-style: none !important;  /* IE and Edge */
          scrollbar-width: none !important;  /* Firefox */
        }
        
        /* Hover effect for breadcrumb links */
        .breadcrumb-link:hover {
          color: #7C3AED !important;
          text-decoration: underline !important;
        }
      `}</style>

      {/* Navigation */}
      <Navigation currentPage="blog" locale={locale} showLanguageSwitcher={true} />

      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" aria-label="Breadcrumb" style={{
        backgroundColor: '#F9FAFB',
        padding: '20px 0',
        borderBottom: '1px solid #E5E7EB',
        marginBottom: 0
      }}>
        <div className="breadcrumb-container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <ol className="breadcrumb-list" style={{
            display: 'flex',
            alignItems: 'center',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <li className="breadcrumb-item" style={{ fontSize: '14px' }}>
              <Link href="/" className="breadcrumb-link" style={{ 
                color: '#9333EA', 
                textDecoration: 'none', 
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}>Home</Link>
            </li>
            <li className="breadcrumb-separator" style={{ color: '#9CA3AF', fontSize: '14px' }}>/</li>
            <li className="breadcrumb-item" style={{ fontSize: '14px' }}>
              <Link href={locale === 'en' ? '/blog' : `/blog/${locale}`} className="breadcrumb-link" style={{ 
                color: '#9333EA', 
                textDecoration: 'none', 
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}>Blog</Link>
            </li>
            <li className="breadcrumb-separator" style={{ color: '#9CA3AF', fontSize: '14px' }}>/</li>
            <li className="breadcrumb-item active" aria-current="page" style={{ 
              fontSize: '14px',
              color: '#4B5563',
              fontWeight: '500',
              maxWidth: '400px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {post.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Blog Post Hero */}
      <div className="blog-post-hero" style={{
        background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
        color: 'white',
        padding: '60px 0 50px',
        marginTop: 0,
        marginBottom: 0
      }}>
        <div className="blog-post-hero-content" style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 2rem',
          textAlign: 'center'
        }}>
          <div className="blog-post-category" style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: '10px 24px',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>{post.category}</div>
          <h1 className="blog-post-title" style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>{post.title}</h1>
          <div className="blog-post-meta" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            fontSize: '15px',
            opacity: '0.9'
          }}>
            <span>{post.author}</span>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </div>

      {/* Blog Post Content with TOC */}
      <div className="blog-post-layout" style={{
        backgroundColor: '#F9FAFB',
        padding: '60px 0',
        minHeight: '100vh'
      }}>
        <div className="blog-post-container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '3rem',
          alignItems: 'start'
        }}>
          <article className="blog-post-content" style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
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
          <aside className="blog-post-sidebar" style={{
            position: 'sticky',
            top: '100px',
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'hidden'
          }}>
            <div style={{ overflowY: 'hidden' }}>
              <TableOfContents content={post.content} />
            </div>
          </aside>
        </div>
      </div>

      {/* Navigation */}
      <div className="blog-nav" style={{
        backgroundColor: '#F9FAFB',
        padding: '40px 0 60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
        <Link href="/blog" className="blog-nav-link">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Blog
        </Link>
        </div>
      </div>
    </div>
  );
}