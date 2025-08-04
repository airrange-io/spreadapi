# Claude AI Assistant Memo

## Blog Article Creation Checklist

When creating or debugging blog articles, **ALWAYS** check these critical settings:

### 1. Content Container Overflow Prevention
```css
.blog-post-content {
  minWidth: 0;        /* Critical for grid layouts */
  overflow: hidden;   /* Prevents content from breaking layout */
  overflow-wrap: break-word;
  word-wrap: break-word;
}
```

### 2. Media and Code Block Constraints
```css
/* Ensure all media respects container width */
.blog-post-content img,
.blog-post-content iframe,
.blog-post-content video,
.blog-post-content table,
.blog-post-content pre {
  max-width: 100%;
  height: auto;
}

.blog-post-content code {
  word-break: break-word;
}
```

### 3. Grid Layout Requirements
- When using CSS Grid with sidebar (TOC), the main content column MUST have `minWidth: 0`
- Without this, content can expand beyond its designated column and hide the sidebar
- This is a common CSS Grid gotcha that breaks layouts

### 4. Table of Contents Visibility
- TOC requires 3+ headings (h2/h3) to display
- TOC is hidden on screens < 1024px (by design)
- If TOC isn't showing on desktop, check:
  1. Content overflow (most common issue)
  2. Browser console for JavaScript errors
  3. Correct number of headings in content

### 5. Testing New Articles
1. Check multiple viewport sizes (mobile, tablet, desktop)
2. Verify TOC appears on desktop (>1024px)
3. Ensure no horizontal scrolling
4. Test with long code blocks and URLs
5. Verify images don't break layout

## Common Issues and Solutions

**Problem**: TOC not visible on desktop
**Solution**: Check if content is overflowing - add `minWidth: 0` to content container

**Problem**: Article content is cut off on right side
**Solution**: Content is breaking grid layout - add overflow constraints

**Problem**: Long URLs or code breaking layout
**Solution**: Add `word-break: break-word` to code elements

## Commands to Run After Creating Articles

```bash
# Lint and typecheck
npm run lint
npm run typecheck

# Test build
npm run build
```

---
Last updated: 2025-08-04
Context: Fixed TOC visibility issue in claude-desktop-excel-integration-complete-guide article