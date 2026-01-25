import React from 'react';
import { Metadata } from 'next';
import BlogClient from '../BlogClient';
import { getSortedPostsData } from '@/lib/blog';
import '../blog.css';

export const metadata: Metadata = {
  title: 'Blog SpreadAPI - Perspectivas de Integración API Excel',
  description: 'Excel se encuentra con la IA: Perspectivas técnicas, tutoriales y mejores prácticas para construir aplicaciones de hojas de cálculo inteligentes con SpreadAPI.',
  openGraph: {
    title: 'Blog SpreadAPI - Perspectivas de Integración API Excel',
    description: 'Excel se encuentra con la IA: Perspectivas técnicas, tutoriales y mejores prácticas para construir aplicaciones de hojas de cálculo inteligentes.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog SpreadAPI',
    description: 'Excel se encuentra con la IA: Perspectivas técnicas y tutoriales',
  },
  alternates: {
    canonical: '/blog/es',
    languages: {
      'en': '/blog',
      'de': '/blog/de',
      'fr': '/blog/fr',
      'es': '/blog/es',
    }
  }
};

const categoryTranslations: Record<string, string> = {
  'All': 'Todos',
  'Technical Guide': 'Guía Técnica',
  'AI Integration': 'Integración IA',
  'MCP Protocol': 'Protocolo MCP',
  'Performance': 'Rendimiento',
  'Tutorial': 'Tutorial',
  'Industry Solution': 'Solución Industrial',
  'Comparison': 'Comparación'
};

export default function SpanishBlogPage() {
  const posts = getSortedPostsData('es');
  
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
      locale="es"
    />
  );
}