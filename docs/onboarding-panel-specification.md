# Onboarding Panel & Template Selector - Implementation Specification

This document describes the onboarding panel component from SpreadAPI that can be adapted for other projects.

---

## Overview

The onboarding panel is a fixed-position bottom bar showing 3 action cards for new users. It includes:
1. **Watch Video Card** - Opens a video modal
2. **Use a Sample/Template Card** - Opens a template selector modal
3. **How it Works Card** - Links to a homepage/docs

The panel is shown conditionally (e.g., when user has < 7 items) and disappears when user is actively searching.

---

## 1. State Variables Required

```tsx
// Video modal
const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

// Template modal
const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
const [loadedTemplates, setLoadedTemplates] = useState<Template[]>([]);

// Optional: for tour/onboarding refs
const onboardingCardsRef = useRef<HTMLDivElement>(null);
const watchVideoCardRef = useRef<HTMLDivElement>(null);
const useSampleCardRef = useRef<HTMLDivElement>(null);
```

---

## 2. Template Data Structure

```typescript
// lib/templates.ts
export interface Template {
  id: string;
  name: { en: string; de: string };        // Localized names
  description: { en: string; de: string }; // Localized descriptions
  fileUrl: string;                          // URL to the template file
  // Add any project-specific fields here
}

export const templates: Template[] = [
  {
    id: 'template-1',
    name: { en: 'Template Name', de: 'Vorlagenname' },
    description: { en: 'Description here', de: 'Beschreibung hier' },
    fileUrl: 'https://your-storage.com/template.xlsx',
  },
  // ... more templates
];
```

---

## 3. Lazy Loading Templates (Performance Optimization)

Only load template data when the modal opens:

```tsx
useEffect(() => {
  if (!isTemplateModalOpen || loadedTemplates.length > 0) return;
  import('@/lib/templates').then(({ templates }) => {
    setLoadedTemplates(templates);
  });
}, [isTemplateModalOpen, loadedTemplates.length]);
```

---

## 4. Onboarding Panel JSX Structure

```tsx
{/* Visibility condition: show when few items exist and no search active */}
{!searchQuery && itemCount < 7 && (
  <div style={{
    position: 'fixed',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '700px',
    zIndex: 1
  }}>
    <div ref={onboardingCardsRef} style={{
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    }}>

      {/* Card 1: Watch Video */}
      <div
        ref={watchVideoCardRef}
        onClick={() => setIsVideoModalOpen(true)}
        style={{
          background: 'white',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px 20px',
          cursor: 'pointer',
          color: '#262626',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: '1 1 0',
          minWidth: '140px',
          maxWidth: '220px',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(80, 45, 128, 0.15)';
          e.currentTarget.style.borderColor = '#502D80';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.borderColor = '#e8e8e8';
        }}
      >
        {/* Icon/Thumbnail */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <PlayCircleOutlined style={{ fontSize: '14px', color: '#722ed1' }} />
        </div>
        {/* Text */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
            Watch Video
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            5 min tutorial
          </div>
        </div>
      </div>

      {/* Card 2: Use a Sample/Template */}
      <div
        ref={useSampleCardRef}
        onClick={() => setIsTemplateModalOpen(true)}
        style={{
          background: 'white',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px 20px',
          cursor: 'pointer',
          color: '#262626',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: '1 1 0',
          minWidth: '140px',
          maxWidth: '220px',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(80, 45, 128, 0.15)';
          e.currentTarget.style.borderColor = '#502D80';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.borderColor = '#e8e8e8';
        }}
      >
        {/* Icon */}
        <div style={{
          width: '32px',
          height: '32px',
          background: '#f9f0ff',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {/* Grid icon (or use FileOutlined, AppstoreOutlined, etc.) */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#722ed1" strokeWidth="2" fill="none"/>
            <line x1="3" y1="12" x2="21" y2="12" stroke="#722ed1" strokeWidth="2"/>
            <line x1="12" y1="3" x2="12" y2="21" stroke="#722ed1" strokeWidth="2"/>
          </svg>
        </div>
        {/* Text */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
            Use a Sample
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Test immediately
          </div>
        </div>
      </div>

      {/* Card 3: How it Works (link to homepage) */}
      <a
        href="/how-it-works"
        className="how-it-works-card"
        style={{
          background: 'white',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px 20px',
          textDecoration: 'none',
          color: '#262626',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: '1 1 0',
          minWidth: '140px',
          maxWidth: '220px',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(80, 45, 128, 0.15)';
          e.currentTarget.style.borderColor = '#502D80';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.borderColor = '#e8e8e8';
        }}
      >
        {/* Icon */}
        <div style={{
          width: '32px',
          height: '32px',
          background: '#e6f7ff',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z" fill="#1890ff"/>
            <rect x="11" y="4" width="2" height="16" rx="1" fill="#1890ff"/>
          </svg>
        </div>
        {/* Text */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
            How it Works
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            See in action
          </div>
        </div>
      </a>

    </div>
  </div>
)}
```

---

## 5. Responsive CSS (Hide 3rd Card on Small Screens)

```css
/* In global styles or styled-jsx */
@media (max-width: 732px) {
  .how-it-works-card { display: none !important; }
}
```

---

## 6. Template Selector Modal

Using Ant Design Modal:

```tsx
import { Modal, Spin } from 'antd';
import { FileOutlined, ArrowRightOutlined } from '@ant-design/icons';

// Template selection handler
const handleTemplateSelect = useCallback(async (template: Template) => {
  setIsTemplateModalOpen(false);

  // Your logic here:
  // - Download template file
  // - Create new item from template
  // - Navigate to new item

  console.log('Selected template:', template);
}, [/* dependencies */]);

// Modal JSX
<Modal
  open={isTemplateModalOpen}
  onCancel={() => setIsTemplateModalOpen(false)}
  footer={null}
  width={640}
  centered
  title="Choose a Sample"
>
  <p style={{ color: '#8c8c8c', margin: '4px 0 20px' }}>
    Pick a template to get started quickly
  </p>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {/* Loading state */}
    {loadedTemplates.length === 0 && (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="small" />
      </div>
    )}

    {/* Template list */}
    {loadedTemplates.map((template) => (
      <div
        key={template.id}
        onClick={() => handleTemplateSelect(template)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid #f0f0f0',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          background: '#fff',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#faf5ff';
          e.currentTarget.style.borderColor = '#d3adf7';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(79, 45, 127, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.borderColor = '#f0f0f0';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Icon */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: '#f9f0ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <FileOutlined style={{ fontSize: '22px', color: '#722ed1' }} />
        </div>

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: '#262626' }}>
            {template.name[locale] ?? template.name.en}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#8c8c8c',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {template.description[locale] ?? template.description.en}
          </div>
        </div>

        {/* Arrow */}
        <ArrowRightOutlined style={{ fontSize: '14px', color: '#d9d9d9', flexShrink: 0 }} />
      </div>
    ))}
  </div>
</Modal>
```

---

## 7. Video Modal (Optional)

For Wistia videos:

```tsx
// Load Wistia script when modal opens
useEffect(() => {
  if (isVideoModalOpen && typeof window !== 'undefined' && !(window as any)._wq) {
    const script = document.createElement('script');
    script.src = 'https://fast.wistia.com/assets/external/E-v1.js';
    script.async = true;
    document.head.appendChild(script);
  }
}, [isVideoModalOpen]);

// Modal JSX
<Modal
  open={isVideoModalOpen}
  onCancel={() => setIsVideoModalOpen(false)}
  footer={null}
  width={900}
  centered
  styles={{ body: { padding: 0 } }}
>
  <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
    <div style={{ height: '100%', left: 0, position: 'absolute', top: 0, width: '100%' }}>
      <div
        className={`wistia_embed wistia_async_YOUR_VIDEO_ID videoFoam=true`}
        style={{ height: '100%', position: 'relative', width: '100%' }}
      >
        &nbsp;
      </div>
    </div>
  </div>
</Modal>
```

For YouTube/other providers, adjust accordingly.

---

## 8. Color Scheme Reference

| Element | Color |
|---------|-------|
| Primary purple | `#722ed1` |
| Dark purple (hover border) | `#502D80` |
| Light purple bg | `#f9f0ff` |
| Hover bg | `#faf5ff` |
| Light border | `#d3adf7` |
| Blue accent | `#1890ff` |
| Blue bg | `#e6f7ff` |
| Text primary | `#262626` |
| Text secondary | `#8c8c8c` |
| Border default | `#e8e8e8` / `#f0f0f0` |

---

## 9. Key Design Patterns

1. **Hover effects**: Cards lift up (`translateY(-2px)`) and show shadow on hover
2. **Fixed positioning**: Panel stays at bottom regardless of scroll
3. **Responsive**: 3rd card hides on narrow screens, cards wrap on mobile
4. **Lazy loading**: Templates only load when modal opens
5. **Localization ready**: Template names/descriptions support multiple languages
6. **Consistent spacing**: 12px gap between cards, 16px padding inside cards

---

## 10. Dependencies

- **Ant Design** (Modal, Spin) - or equivalent modal component
- **Icons**: PlayCircleOutlined, FileOutlined, ArrowRightOutlined (or equivalent)
- **React hooks**: useState, useEffect, useCallback, useRef

---

## Adaptation Notes

When adapting for another project:

1. **Replace template data** with your project's templates/samples
2. **Adjust colors** to match your brand (search/replace the purple hex codes)
3. **Change visibility condition** (`itemCount < 7`) to match your logic
4. **Update links** (e.g., `/how-it-works` to your actual docs URL)
5. **Customize icons** per card based on your content
6. **Modify `handleTemplateSelect`** to match your item creation flow
