'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { getSlugTranslations } from '@/lib/translations/slug-mapping';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect current language from URL
  const getCurrentLanguage = (): Language => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // Check if we're on a localized path
    if (pathSegments[0] === 'product' && pathSegments[1] && languages.some(l => l.code === pathSegments[1])) {
      return languages.find(l => l.code === pathSegments[1]) || languages[0];
    }
    
    if (pathSegments[0] === 'blog' && pathSegments[1] && languages.some(l => l.code === pathSegments[1])) {
      return languages.find(l => l.code === pathSegments[1]) || languages[0];
    }
    
    // Default to English
    return languages[0];
  };

  const currentLanguage = getCurrentLanguage();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLocalizedPath = (targetLocale: string): string => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // Handle product pages
    if (pathname.startsWith('/product')) {
      if (targetLocale === 'en') {
        return '/product';
      }
      // Remove existing locale if present
      if (pathSegments[1] && languages.some(l => l.code === pathSegments[1])) {
        pathSegments.splice(1, 1);
      }
      return `/${pathSegments[0]}/${targetLocale}`;
    }
    
    // Handle blog pages
    if (pathname.includes('/blog')) {
      // Blog listing page
      if (pathSegments.length === 1 || (pathSegments.length === 2 && languages.some(l => l.code === pathSegments[1]))) {
        return targetLocale === 'en' ? '/blog' : `/blog/${targetLocale}`;
      }
      
      // Individual blog post
      if (pathSegments.length >= 2) {
        let currentSlug = '';
        let currentLocale = 'en';
        
        // Extract current slug and locale
        if (languages.some(l => l.code === pathSegments[1])) {
          currentLocale = pathSegments[1];
          currentSlug = pathSegments[2] || '';
        } else {
          currentSlug = pathSegments[1];
        }
        
        // Find translated slug
        const translations = getSlugTranslations(currentSlug);
        if (translations && translations[targetLocale]) {
          const translatedSlug = translations[targetLocale];
          return targetLocale === 'en' 
            ? `/blog/${translatedSlug}`
            : `/blog/${targetLocale}/${translatedSlug}`;
        }
        
        // Fallback to blog listing if no translation exists
        return targetLocale === 'en' ? '/blog' : `/blog/${targetLocale}`;
      }
    }
    
    // For other pages, just switch locale
    return pathname;
  };

  const handleLanguageChange = (lang: Language) => {
    const newPath = getLocalizedPath(lang.code);
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="flag">{currentLanguage.flag}</span>
        <span className="name">{currentLanguage.name}</span>
        <svg
          className={`chevron ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${lang.code === currentLanguage.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang)}
            >
              <span className="flag">{lang.flag}</span>
              <span className="name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .language-switcher {
          position: relative;
        }

        .language-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .language-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .flag {
          font-size: 1.2rem;
          line-height: 1;
        }

        .chevron {
          transition: transform 0.2s ease;
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .language-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          z-index: 1000;
          min-width: 150px;
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          color: #1f2937;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s ease;
          text-align: left;
        }

        .language-option:hover {
          background: #f3f4f6;
        }

        .language-option.active {
          background: #f3f4f6;
          font-weight: 600;
          color: #9333EA;
        }

        /* Dark mode for non-hero sections */
        .navbar-component .language-button {
          color: #1f2937;
          border-color: #e5e7eb;
        }

        .navbar-component .language-button:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        @media (max-width: 768px) {
          .language-button .name {
            display: none;
          }
          
          .language-button {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}