'use client';

import { useEffect } from 'react';

// Client component that enhances the static TOC with interactivity
export default function TableOfContentsEnhancer() {
  useEffect(() => {
    const toc = document.querySelector('.table-of-contents');
    if (!toc) return;

    // Get TOC items from data attribute
    const tocData = toc.getAttribute('data-toc-items');
    if (!tocData) return;

    const items = JSON.parse(tocData);
    
    // Create intersection observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Remove all active classes
            document.querySelectorAll('.toc-item').forEach((item) => {
              item.classList.remove('active');
            });
            
            // Add active class to current item
            const activeLink = document.querySelector(`a[href="#${entry.target.id}"]`);
            if (activeLink) {
              activeLink.closest('.toc-item')?.classList.add('active');
            }
          }
        });
      },
      {
        rootMargin: '-20% 0% -70% 0%',
      }
    );

    // Observe all headings
    items.forEach((item: any) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    // Smooth scrolling for TOC links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('toc-link')) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href) {
          const element = document.querySelector(href);
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    toc.addEventListener('click', handleClick);

    return () => {
      observer.disconnect();
      toc.removeEventListener('click', handleClick);
    };
  }, []);

  return null; // This component only adds behavior, no UI
}