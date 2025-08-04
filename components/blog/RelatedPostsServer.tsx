import Link from 'next/link';
import React from 'react';

interface RelatedPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  currentSlug: string;
}

// Server component - all content is SEO-friendly
export default function RelatedPostsServer({ posts, currentSlug }: RelatedPostsProps) {
  const filteredPosts = posts.filter(post => post.slug !== currentSlug).slice(0, 3);

  if (filteredPosts.length === 0) {
    return null;
  }

  return (
    <section className="related-posts-section" style={{
      backgroundColor: '#f9fafb',
      padding: '4rem 0',
      marginTop: '4rem'
    }}>
      <div className="related-posts-container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '2rem',
          textAlign: 'center',
          color: '#1f2937'
        }}>Related Articles</h2>
        
        <div className="related-posts-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {filteredPosts.map((post) => (
            <article key={post.slug} className="related-post-card" style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Link 
                href={`/blog/${post.slug}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: '#1f2937',
                  lineHeight: 1.4
                }}>{post.title}</h3>
                
                {post.excerpt && (
                  <p style={{
                    color: '#6b7280',
                    lineHeight: 1.6,
                    marginBottom: '1rem',
                    flex: 1
                  }}>{post.excerpt}</p>
                )}
                
                {(post.date || post.readTime) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.875rem',
                    color: '#9ca3af',
                    marginTop: 'auto'
                  }}>
                    {post.date && (
                      <>
                        <time>{new Date(post.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</time>
                        {post.readTime && <span>•</span>}
                      </>
                    )}
                    {post.readTime && <span>{post.readTime}</span>}
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>
      </div>

    </section>
  );
}