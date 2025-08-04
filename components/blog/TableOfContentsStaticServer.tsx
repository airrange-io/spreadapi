import React from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsStaticProps {
  content: string;
}

// Pure server component - no styled-jsx
export default function TableOfContentsStaticServer({ content }: TableOfContentsStaticProps) {
  // Extract headings at render time (server-side)
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

  if (items.length < 3) {
    // Don't show TOC for short articles
    return null;
  }

  return (
    <nav className="table-of-contents" data-toc-items={JSON.stringify(items)}>
      <h3 className="toc-title">Table of Contents</h3>
      <ul className="toc-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`toc-item toc-level-${item.level}`}
          >
            <a href={`#${item.id}`} className="toc-link">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}