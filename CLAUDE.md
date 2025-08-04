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

## TypeScript Best Practices (CRITICAL FOR VERCEL DEPLOYMENT)

### Always Check Types Before Deployment
1. **Run type checking**: `npm run typecheck` before any commits
2. **Fix all TypeScript errors** before pushing to avoid Vercel build failures
3. **Test the build locally**: `npm run build` to catch errors early

### Common TypeScript Issues to Watch For

1. **Interface Conflicts**
   - Don't define the same interface in multiple files
   - Export shared interfaces from a central location (e.g., `lib/types.ts`)
   - Example: `RelatedPost` interface should be defined once and imported everywhere

2. **Property Name Consistency**
   - Check actual data structure matches TypeScript interfaces
   - Common mismatches: `readTime` vs `readingTime`, `dataType` vs `type`
   - Always verify JSON data structure matches interface definitions

3. **Required vs Optional Properties**
   - Use optional properties (`?`) when data might not exist
   - Example: `excerpt?: string` instead of `excerpt: string`
   - Be consistent across all usages of the same type

4. **Component Props**
   - Always provide required props (e.g., `<Navigation currentPage="blog" />`)
   - Check component prop interfaces before using components
   - Don't assume props are optional

### Type Checking Commands
```bash
# Check types without building
npm run typecheck

# Build locally to catch all errors
npm run build

# Run lint and typecheck together
npm run lint && npm run typecheck
```

### When Creating New Components
1. Define interfaces for all props
2. Export interfaces if they'll be used elsewhere
3. Use consistent naming conventions
4. Add JSDoc comments for complex types

### When Modifying Existing Code
1. Check if interfaces need updating
2. Run typecheck after changes
3. Update all files using modified interfaces
4. Test build locally before pushing

### Server-Side Rendering Considerations
- Use `React.ReactElement` instead of `JSX.Element` for better compatibility
- Avoid client-only features in server components
- Keep styled-jsx only in client components

## Project-Specific TypeScript Notes

### Blog System
- BlogPost interface is in `lib/blog.ts` with `readingTime` (not `readTime`)
- Related posts functionality uses different data shapes in different places
- Always check both the interface and actual JSON data

### MCP/Service Integration
- Service data often has `type` vs `dataType` inconsistencies
- Redis data might not match TypeScript interfaces
- Always validate data from external sources

### Common Vercel Build Errors
1. "Property does not exist on type" - Check interface definitions
2. "Two different types with this name exist" - Remove duplicate interfaces
3. "Type 'JSX.Element' not found" - Use React.ReactElement instead
4. "Property is missing in type" - Add required props or make optional

## IMPORTANT REMINDERS
- **Vercel's TypeScript checking is stricter than local development**
- **ALWAYS run `npm run typecheck` before pushing**
- **Fix types immediately when errors occur**
- **Don't use `any` type to bypass errors - fix the root cause**
- **Test the full build locally with `npm run build`**

---
Last updated: 2025-08-04
Context: Added TypeScript best practices after fixing multiple Vercel deployment failures due to type errors