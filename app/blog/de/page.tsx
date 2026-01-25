import React from 'react';
import { Metadata } from 'next';
import BlogClient from '../BlogClient';
import { getSortedPostsData } from '@/lib/blog';
import '../blog.css';

export const metadata: Metadata = {
  title: 'SpreadAPI Blog - Excel API Integration Einblicke',
  description: 'Excel trifft KI: Technische Einblicke, Tutorials und Best Practices für die Entwicklung intelligenter Tabellenkalkulationsanwendungen mit SpreadAPI.',
  openGraph: {
    title: 'SpreadAPI Blog - Excel API Integration Einblicke',
    description: 'Excel trifft KI: Technische Einblicke, Tutorials und Best Practices für die Entwicklung intelligenter Tabellenkalkulationsanwendungen.',
    type: 'website',
    locale: 'de_DE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpreadAPI Blog',
    description: 'Excel trifft KI: Technische Einblicke und Tutorials',
  },
  alternates: {
    canonical: '/blog/de',
    languages: {
      'en': '/blog',
      'de': '/blog/de',
      'fr': '/blog/fr',
      'es': '/blog/es',
    }
  }
};

const categoryTranslations: Record<string, string> = {
  'All': 'Alle',
  'Technical Guide': 'Technischer Leitfaden',
  'AI Integration': 'KI-Integration',
  'MCP Protocol': 'MCP-Protokoll',
  'Performance': 'Leistung',
  'Tutorial': 'Tutorial',
  'Industry Solution': 'Branchenlösung',
  'Comparison': 'Vergleich'
};

export default function GermanBlogPage() {
  const posts = getSortedPostsData('de');
  
  // Get unique categories from posts
  const uniqueCategories = Array.from(new Set(posts.map(post => post.category)));
  
  // Keep original categories for filtering
  const categoriesForFilter = ['All', ...uniqueCategories];
  
  // Translate categories for display
  const translatedCategories = categoriesForFilter.map(cat => {
    return categoryTranslations[cat] || cat;
  });
  
  // Create reverse mapping for filtering
  const reverseCategoryMapping: Record<string, string> = {};
  categoriesForFilter.forEach((cat, index) => {
    reverseCategoryMapping[translatedCategories[index]] = cat;
  });

  return (
    <BlogClient
      posts={posts}
      categories={translatedCategories}
      categoryMapping={reverseCategoryMapping}
      locale="de"
    />
  );
}