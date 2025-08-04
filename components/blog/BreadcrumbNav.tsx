import React from 'react';
import Link from 'next/link';

interface BreadcrumbNavProps {
  title: string;
  locale?: string;
}

export default function BreadcrumbNav({ title, locale = 'en' }: BreadcrumbNavProps) {
  const blogText = locale === 'de' ? 'Blog' : 
                   locale === 'es' ? 'Blog' : 
                   locale === 'fr' ? 'Blog' : 'Blog';
  
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <div className="breadcrumb-container">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item">
            <Link href="/">Home</Link>
          </li>
          <li className="breadcrumb-separator">›</li>
          <li className="breadcrumb-item">
            <Link href="/blog">{blogText}</Link>
          </li>
          <li className="breadcrumb-separator">›</li>
          <li className="breadcrumb-item active" aria-current="page">
            {title}
          </li>
        </ol>
      </div>
    </nav>
  );
}