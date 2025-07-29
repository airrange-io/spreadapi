import Link from 'next/link';
import React from 'react';

interface RelatedPost {
  slug: string;
  title: string;
  category: string;
  excerpt?: string;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  currentSlug: string;
}

export default function RelatedPosts({ posts, currentSlug }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="related-posts">
      <h2 className="related-posts-title">Related Articles</h2>
      <div className="related-posts-grid">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="related-post-card"
          >
            <div className="related-post-category">{post.category}</div>
            <h3 className="related-post-title">{post.title}</h3>
            {post.excerpt && (
              <p className="related-post-excerpt">{post.excerpt}</p>
            )}
            <span className="related-post-link">
              Read more
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .related-posts {
          margin-top: 4rem;
          padding-top: 3rem;
          border-top: 1px solid #e5e7eb;
        }

        .related-posts-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 2rem;
          text-align: center;
        }

        .related-posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .related-post-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          text-decoration: none;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .related-post-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border-color: #9333EA;
        }

        .related-post-category {
          color: #9333EA;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .related-post-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
        }

        .related-post-excerpt {
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .related-post-link {
          color: #9333EA;
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: auto;
        }

        .related-post-card:hover .related-post-link {
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .related-posts {
            margin-top: 3rem;
            padding-top: 2rem;
          }

          .related-posts-title {
            font-size: 1.5rem;
          }

          .related-posts-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}