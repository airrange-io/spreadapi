import React from 'react';
import { Metadata } from 'next';
import BlogClient from '../BlogClient';
import { getSortedPostsData } from '@/lib/blog';
import '../blog.css';

export const metadata: Metadata = {
  title: 'Blog SpreadAPI - Insights sur l\'intégration API Excel',
  description: 'Excel rencontre l\'IA : Aperçus techniques, tutoriels et meilleures pratiques pour créer des applications de feuilles de calcul intelligentes avec SpreadAPI.',
  openGraph: {
    title: 'Blog SpreadAPI - Insights sur l\'intégration API Excel',
    description: 'Excel rencontre l\'IA : Aperçus techniques, tutoriels et meilleures pratiques pour créer des applications de feuilles de calcul intelligentes.',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog SpreadAPI',
    description: 'Excel rencontre l\'IA : Aperçus techniques et tutoriels',
  },
  alternates: {
    canonical: '/blog/fr',
    languages: {
      'en': '/blog',
      'de': '/blog/de',
      'fr': '/blog/fr',
      'es': '/blog/es',
    }
  }
};

const categoryTranslations: Record<string, string> = {
  'All': 'Tous',
  'Technical Guide': 'Guide Technique',
  'AI Integration': 'Intégration IA',
  'MCP Protocol': 'Protocole MCP',
  'Performance': 'Performance',
  'Tutorial': 'Tutoriel',
  'Industry Solution': 'Solution Sectorielle',
  'Comparison': 'Comparaison'
};

export default function FrenchBlogPage() {
  const posts = getSortedPostsData('fr');
  
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
      locale="fr"
    />
  );
}