'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from content
    const extractHeadings = () => {
      const headingRegex = /^(#{2,3})\s+(.+)$/gm;
      const items: TocItem[] = [];
      const idCounts: { [key: string]: number } = {};
      let match;

      while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
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
        
        items.push({ id, text, level });
      }

      setTocItems(items);
    };

    extractHeadings();
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -70% 0%',
      }
    );

    // Observe all headings
    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length < 3) {
    // Don't show TOC for short articles
    return null;
  }

  return (
    <nav className="table-of-contents">
      <h3 className="toc-title">Table of Contents</h3>
      <ul className="toc-list">
        {tocItems.map((item) => (
          <li
            key={item.id}
            className={`toc-item toc-level-${item.level} ${
              activeId === item.id ? 'active' : ''
            }`}
          >
            <a href={`#${item.id}`} className="toc-link">
              {item.text}
            </a>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .table-of-contents {
          position: sticky;
          top: 2rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          max-height: calc(100vh - 4rem);
          overflow-y: auto;
        }

        .toc-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .toc-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .toc-item {
          margin: 0;
        }

        .toc-level-3 {
          padding-left: 1.5rem;
        }

        .toc-link {
          display: block;
          padding: 0.5rem 0;
          color: #6b7280;
          text-decoration: none;
          font-size: 0.9rem;
          line-height: 1.4;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
          padding-left: 1rem;
          margin-left: -1rem;
        }

        .toc-link:hover {
          color: #9333EA;
        }

        .toc-item.active .toc-link {
          color: #9333EA;
          font-weight: 600;
          border-left-color: #9333EA;
          background: rgba(147, 51, 234, 0.05);
        }

        /* Mobile: Hide TOC */
        @media (max-width: 1024px) {
          .table-of-contents {
            display: none;
          }
        }

        /* Scrollbar styling */
        .table-of-contents::-webkit-scrollbar {
          width: 6px;
        }

        .table-of-contents::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }

        .table-of-contents::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .table-of-contents::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </nav>
  );
}