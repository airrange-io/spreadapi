import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import BlogClient from './BlogClient';
import { getSortedPostsData } from '@/lib/blog';
import './blog.css';

export const metadata: Metadata = {
  title: 'SpreadAPI Blog - Excel API Integration Insights',
  description: 'Excel meets AI: Technical insights, tutorials, and best practices for building intelligent spreadsheet applications with SpreadAPI.',
  openGraph: {
    title: 'SpreadAPI Blog - Excel API Integration Insights',
    description: 'Excel meets AI: Technical insights, tutorials, and best practices for building intelligent spreadsheet applications.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpreadAPI Blog',
    description: 'Excel meets AI: Technical insights and tutorials',
  },
};

export default function BlogPage() {
  const posts = getSortedPostsData();
  const categories = ['All', ...Array.from(new Set(posts.map(post => post.category)))];

  return <BlogClient posts={posts} categories={categories} />;
}