import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';
import RelatedPostsServer from '@/components/blog/RelatedPostsServer';
import TableOfContentsStaticServer from '@/components/blog/TableOfContentsStaticServer';
import TableOfContentsEnhancer from '@/components/blog/TableOfContentsEnhancer';
import Navigation from '@/components/Navigation';
import BreadcrumbNav from '@/components/blog/BreadcrumbNav';
import { BreadcrumbSchema } from '@/components/blog/BreadcrumbSchema';
import { FAQSchema, extractFAQFromContent } from '@/components/blog/FAQSchema';
import '../blog.css';

interface RelatedPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
}

interface BlogPostServerProps {
  post: BlogPost;
  relatedPosts: RelatedPost[];
  locale?: string;
}

// Format content - runs on server
function formatContent(content: string): JSX.Element {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = '';
  let listItems: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  const processListItems = () => {
    if (listItems.length > 0) {
      const ListTag = listType;
      elements.push(
        <ListTag key={elements.length}>
          {listItems.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
          ))}
        </ListTag>
      );
      listItems = [];
      inList = false;
    }
  };

  const processInlineFormatting = (text: string): string => {
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Handle links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return text;
  };

  lines.forEach((line, index) => {
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <pre key={elements.length} className={`language-${codeLanguage}`}>
            <code>{codeContent.join('\n')}</code>
          </pre>
        );
        codeContent = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        // Start code block
        processListItems();
        codeLanguage = line.slice(3).trim() || 'text';
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      return;
    }

    // Handle lists
    const unorderedMatch = line.match(/^[-*]\s+(.+)/);
    const orderedMatch = line.match(/^(\d+)\.\s+(.+)/);
    
    if (unorderedMatch) {
      if (!inList || listType !== 'ul') {
        processListItems();
        inList = true;
        listType = 'ul';
      }
      listItems.push(unorderedMatch[1]);
      return;
    } else if (orderedMatch) {
      if (!inList || listType !== 'ol') {
        processListItems();
        inList = true;
        listType = 'ol';
      }
      listItems.push(orderedMatch[2]);
      return;
    } else if (inList && line.trim() === '') {
      processListItems();
      return;
    }

    // Process any remaining list items
    if (!unorderedMatch && !orderedMatch && line.trim() !== '') {
      processListItems();
    }

    // Handle headings
    const h1Match = line.match(/^#\s+(.+)/);
    const h2Match = line.match(/^##\s+(.+)/);
    const h3Match = line.match(/^###\s+(.+)/);
    const h4Match = line.match(/^####\s+(.+)/);

    if (h1Match) {
      elements.push(<h1 key={elements.length} id={h1Match[1].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}>{h1Match[1]}</h1>);
    } else if (h2Match) {
      elements.push(<h2 key={elements.length} id={h2Match[1].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}>{h2Match[1]}</h2>);
    } else if (h3Match) {
      elements.push(<h3 key={elements.length} id={h3Match[1].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}>{h3Match[1]}</h3>);
    } else if (h4Match) {
      elements.push(<h4 key={elements.length} id={h4Match[1].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}>{h4Match[1]}</h4>);
    } else if (line.startsWith('>')) {
      // Handle blockquotes
      const quoteText = line.slice(1).trim();
      elements.push(
        <blockquote key={elements.length}>
          <p dangerouslySetInnerHTML={{ __html: processInlineFormatting(quoteText) }} />
        </blockquote>
      );
    } else if (line.startsWith('---') || line.startsWith('***')) {
      // Handle horizontal rules
      elements.push(<hr key={elements.length} />);
    } else if (line.trim() !== '') {
      // Handle regular paragraphs
      elements.push(
        <p key={elements.length} dangerouslySetInnerHTML={{ __html: processInlineFormatting(line) }} />
      );
    }
  });

  // Process any remaining list items
  processListItems();

  return <>{elements}</>;
}

export default function BlogPostServer({ post, relatedPosts, locale = 'en' }: BlogPostServerProps) {
  const faqs = extractFAQFromContent(post.content);
  
  return (
    <>
      <Navigation />
      <BreadcrumbNav title={post.title} locale={locale} />
      
      <article className="blog-post">
        <div className="blog-post-hero" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '120px 0 80px',
          marginBottom: '3rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="blog-post-hero-content" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            position: 'relative',
            zIndex: 1
          }}>
            <h1 className="blog-post-title" style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: 'white',
              marginBottom: '1.5rem',
              fontWeight: 800,
              lineHeight: 1.2
            }}>{post.title}</h1>
            
            <div className="blog-post-meta" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1.1rem'
            }}>
              <span>{post.author}</span>
              <span>•</span>
              <time>{new Date(post.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</time>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>

        <div className="blog-post-container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem 4rem',
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '3rem',
          alignItems: 'start'
        }}>
          <article className="blog-post-content" style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            minWidth: 0,
            overflow: 'hidden'
          }}>
            {formatContent(post.content)}
            
            {/* Tags */}
            <div className="blog-tags">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="blog-tag"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </article>

          <aside className="blog-post-sidebar" style={{
            position: 'sticky',
            top: '2rem',
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto'
          }}>
            <TableOfContentsStaticServer content={post.content} />
            <TableOfContentsEnhancer />
          </aside>
        </div>
      </article>

      {/* Related Posts */}
      <RelatedPostsServer posts={relatedPosts} currentSlug={post.slug} />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: [
              `https://spreadapi.io/blog/${post.slug}/og-image.png`,
              `https://spreadapi.io/blog/${post.slug}/twitter-image.png`
            ],
            author: {
              '@type': 'Person',
              name: post.author,
            },
            datePublished: post.date,
            dateModified: post.date,
            publisher: {
              '@type': 'Organization',
              name: 'SpreadAPI',
              logo: {
                '@type': 'ImageObject',
                url: 'https://spreadapi.io/logo.png',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://spreadapi.io/blog/${post.slug}`,
            },
            keywords: post.tags.join(', '),
            articleSection: post.category || 'Technology',
            wordCount: post.content.split(' ').length,
            speakable: {
              '@type': 'SpeakableSpecification',
              xpath: [
                "/html/head/title",
                "/html/head/meta[@name='description']/@content",
                "//article//h1",
                "//article//h2"
              ]
            }
          }),
        }}
      />
      
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema title={post.title} slug={post.slug} locale={locale} />
      
      {/* FAQ Schema if applicable */}
      {faqs.length > 0 && <FAQSchema faqs={faqs} />}
    </>
  );
}