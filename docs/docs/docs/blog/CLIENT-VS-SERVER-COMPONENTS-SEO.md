# Client vs Server Components - SEO Best Practices

## The Problem with Client Components

When you use `'use client'`:
- Content is NOT rendered on the server
- Search engines see an empty div initially
- Content only appears after JavaScript loads
- This hurts SEO significantly

## The Solution: Hybrid Approach

### 1. Server Components for Content (SEO-Critical)
```tsx
// ✅ GOOD - Server component for content
export default function BlogPost({ content }) {
  return (
    <article>
      <h1>{content.title}</h1>
      <p>{content.description}</p>
      {/* All content visible to search engines */}
    </article>
  );
}
```

### 2. Client Components for Interactivity Only
```tsx
// ✅ GOOD - Client component for interaction only
'use client';
export function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>Like</button>;
}
```

### 3. Hybrid Pattern - Best of Both Worlds
```tsx
// Server component (SEO-friendly)
export default function BlogPostServer({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
      
      {/* Client component for interactivity */}
      <LikeButton postId={post.id} />
    </article>
  );
}
```

## What We Did for SpreadAPI Blog

### ✅ Server-Side Components:
1. **BlogPostServer** - All blog content
2. **TableOfContentsStatic** - TOC structure
3. **RelatedPostsServer** - Related articles
4. **Navigation** - Site navigation

### ✅ Client-Side Enhancements:
1. **TableOfContentsEnhancer** - Active section highlighting
2. **LanguageSwitcher** - Dynamic language switching
3. **ShareButtons** - Social sharing (if added)

## Rules for SEO-Friendly Components

### Always Server-Side:
- ✅ Article content
- ✅ Headings and paragraphs
- ✅ Navigation and links
- ✅ Metadata and structured data
- ✅ Images and media
- ✅ Lists and tables

### Can Be Client-Side:
- ✅ Like/reaction buttons
- ✅ Comment forms
- ✅ Search boxes
- ✅ Filters and sorting
- ✅ Analytics tracking
- ✅ Interactive animations

### Never Client-Side:
- ❌ Main content
- ❌ Important headings
- ❌ SEO-critical text
- ❌ Navigation structure
- ❌ Product information
- ❌ Pricing details

## Example: Converting Client to Server

### Before (Bad for SEO):
```tsx
'use client';
import { styled } from 'styled-jsx';

export function ProductCard({ product }) {
  return (
    <div className="card">
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <style jsx>{`...`}</style>
    </div>
  );
}
```

### After (Good for SEO):
```tsx
// Server component
export function ProductCard({ product }) {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      padding: '1rem',
      borderRadius: '8px'
    }}>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
    </div>
  );
}
```

## Key Takeaways

1. **Default to Server Components** - Only use client when necessary
2. **Content First** - All content should be server-rendered
3. **Progressive Enhancement** - Add interactivity with client components
4. **Test with JS Disabled** - Content should still be visible
5. **Check View Source** - SEO content should be in the HTML

## Testing SEO

```bash
# Check if content is server-rendered
curl https://spreadapi.io/blog/your-post | grep "your content"

# If content appears, it's SEO-friendly ✅
# If not, it's client-rendered ❌
```

Remember: Search engines are getting better at JavaScript, but server-rendered content is still king for SEO!