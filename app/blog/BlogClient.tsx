'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
import LanguageSwitcher from '@/components/blog/LanguageSwitcher';
import Navigation from '@/components/Navigation';
import './blog.css';

interface BlogClientProps {
  posts: BlogPost[];
  categories: string[];
  locale?: string;
  categoryMapping?: Record<string, string>; // Maps display names to actual categories
}

export default function BlogClient({ posts, categories, locale = 'en', categoryMapping }: BlogClientProps) {
  // Use the first category as the default (which should be 'All' or its translation)
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'All');

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
        @media (max-width: 768px) {
          .blog-hero h1 {
            font-size: 2.5rem !important;
          }
          .blog-hero p {
            font-size: 1rem !important;
          }
          .blog-hero {
            padding: 60px 0 50px !important;
          }
        }
      `}</style>

      {/* Navigation */}
      <Navigation currentPage="blog" locale={locale} showLanguageSwitcher={true} />

      {/* Hero Section */}
      <div className="blog-hero" style={{
        background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
        color: 'white',
        padding: '100px 0 80px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: 'white'
          }}>SpreadAPI Blog</h1>
          <p style={{
            fontSize: '1.25rem',
            lineHeight: '1.6',
            opacity: '0.95',
            maxWidth: '600px',
            margin: '0 auto',
            color: 'white'
          }}>Excel meets AI: Technical insights, tutorials, and best practices for building intelligent spreadsheet applications</p>
        </div>
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