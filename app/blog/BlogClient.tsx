'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
import LanguageSwitcher from '@/components/blog/LanguageSwitcher';
import './blog.css';
import '../product/product.css';

interface BlogClientProps {
  posts: BlogPost[];
  categories: string[];
  locale?: string;
  categoryMapping?: Record<string, string>; // Maps display names to actual categories
}

export default function BlogClient({ posts, categories, locale = 'en', categoryMapping }: BlogClientProps) {
  // Use the first category as the default (which should be 'All' or its translation)
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if we're on the "All" category (first category in the list)
  const isAllCategory = selectedCategory === categories[0];
  
  // Get the actual category for filtering (handle translations)
  const actualCategory = categoryMapping?.[selectedCategory] || selectedCategory;
  
  const filteredPosts = isAllCategory
    ? posts 
    : posts.filter(post => post.category === actualCategory);

  return (
    <div className="blog-layout">
      <style jsx global>{`
        .blog-layout,
        .blog-layout * {
          font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      {/* Navigation */}
      <nav className="navbar-component">
        <div className="navbar-container">
          <a href={locale === 'en' ? '/product' : `/product/${locale}`} className="navbar-logo-link">
            <img src="/icons/logo-full.svg" alt="SpreadAPI" className="navbar-logo" />
          </a>

          <div className="navbar-menu">
            <a href="/product" className="navbar-link">Features</a>
            <a href="/product#benefits" className="navbar-link">Benefits</a>
            <a href="/blog" className="navbar-link active">Blog</a>
            <a href="/product#faq" className="navbar-link">FAQs</a>
          </div>

          <div className="navbar-button-wrapper">
            <LanguageSwitcher currentLocale={locale} />
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

      {/* Hero Section */}
      <div className="blog-hero">
        <h1>SpreadAPI Blog</h1>
        <p>Excel meets AI: Technical insights, tutorials, and best practices for building intelligent spreadsheet applications</p>
      </div>

      {/* Main Content */}
      <div className="blog-container">
        {/* Category Filter */}
        <div className="blog-categories">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              className={`blog-category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="blog-grid">
          {filteredPosts.map(post => (
            <Link href={locale === 'en' ? `/blog/${post.slug}` : `/blog/${locale}/${post.slug}`} key={post.slug} className="blog-card">
              <div className="blog-card-category">{post.category}</div>
              <h2 className="blog-card-title">{post.title}</h2>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <div className="blog-card-meta">
                <div className="blog-card-author">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 13C4 11 6 9 8 9C10 9 12 11 12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {post.author}
                </div>
                <div className="blog-card-date">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5 1V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M11 1V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="blog-card-reading-time">{post.readingTime} min read</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}