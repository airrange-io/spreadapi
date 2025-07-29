'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
import '../blog.css';

interface BlogPostClientProps {
  post: BlogPost;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Convert markdown-style formatting to HTML
  const formatContent = (content: string) => {
    // For simplicity, we'll just render the content as-is
    // In production, you'd use a proper markdown parser
    return <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />;
  };

  return (
    <div className="product-page">
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

      {/* Blog Post Content */}
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
      </article>

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