# Custom Multilingual Implementation for SpreadAPI

## 🌍 URL Structure
```
/product          (English - default)
/product/de       (German)
/product/fr       (French)
/product/it       (Italian)
/product/es       (Spanish)

/blog            (English only initially)
/api/docs        (English only initially)
```

## 🏗️ Custom Implementation (Without Next.js i18n)

### 1. Dynamic Route Structure
```
/app/
  └── product/
      ├── page.tsx              (English default)
      └── [locale]/
          └── page.tsx          (Localized versions)
```

### 2. Translation Management Options

#### Option A: JSON-based (Simple)
```typescript
// translations/product.ts
export const translations = {
  en: {
    hero: {
      title: "Transform Excel into APIs",
      subtitle: "No coding required"
    }
  },
  de: {
    hero: {
      title: "Excel in APIs verwandeln",
      subtitle: "Keine Programmierung erforderlich"
    }
  }
}
```

#### Option B: CMS-based (Scalable)
- Use a headless CMS (Contentful, Strapi)
- Manage translations in a UI
- API-based content delivery

#### Option C: Markdown/MDX Files
```
/content/product/
  ├── en.mdx
  ├── de.mdx
  ├── fr.mdx
  └── it.mdx
```

### 3. Implementation Example

```typescript
// app/product/[locale]/page.tsx
import { Metadata } from 'next';
import ProductPageClient from '../product-page-client';
import { getTranslations } from '@/lib/translations';
import { notFound } from 'next/navigation';

const SUPPORTED_LOCALES = ['de', 'fr', 'it', 'es'];

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale: locale,
  }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  const t = await getTranslations(params.locale);
  
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `https://spreadapi.com/product/${params.locale}`,
      languages: {
        'en': 'https://spreadapi.com/product',
        'de': 'https://spreadapi.com/product/de',
        'fr': 'https://spreadapi.com/product/fr',
        'it': 'https://spreadapi.com/product/it',
        'es': 'https://spreadapi.com/product/es',
      }
    },
  };
}

export default async function LocalizedProductPage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  if (!SUPPORTED_LOCALES.includes(params.locale)) {
    notFound();
  }

  const translations = await getTranslations(params.locale);
  
  return <ProductPageClient translations={translations} locale={params.locale} />;
}
```

### 4. Language Switcher Component

```typescript
// components/LanguageSwitcher.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', path: '/product' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', path: '/product/de' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', path: '/product/fr' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', path: '/product/it' },
  { code: 'es', name: 'Español', flag: '🇪🇸', path: '/product/es' },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLang = languages.find(lang => 
    pathname === lang.path || pathname.startsWith(lang.path + '/')
  ) || languages[0];

  return (
    <div className="language-switcher">
      <button className="current-language">
        {currentLang.flag} {currentLang.name}
      </button>
      <div className="language-dropdown">
        {languages.map((lang) => (
          <Link 
            key={lang.code} 
            href={lang.path}
            className={lang.code === currentLang.code ? 'active' : ''}
          >
            {lang.flag} {lang.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### 5. SEO Implementation

```typescript
// Add hreflang tags in layout or page
<link rel="alternate" hreflang="en" href="https://spreadapi.com/product" />
<link rel="alternate" hreflang="de" href="https://spreadapi.com/product/de" />
<link rel="alternate" hreflang="fr" href="https://spreadapi.com/product/fr" />
<link rel="alternate" hreflang="it" href="https://spreadapi.com/product/it" />
<link rel="alternate" hreflang="es" href="https://spreadapi.com/product/es" />
<link rel="alternate" hreflang="x-default" href="https://spreadapi.com/product" />
```

## 🎯 Benefits of This Approach

1. **Clean URLs**: `/product` remains the default English path
2. **Flexibility**: Use any translation system you prefer
3. **SEO Friendly**: Clear language indicators in URL
4. **Progressive**: Start with key pages, expand later
5. **Simple**: No complex i18n configuration

## 🚀 Quick Implementation Steps

1. Create `/app/product/[locale]/page.tsx`
2. Set up translation files or CMS
3. Add language switcher to header
4. Implement hreflang tags
5. Update sitemap to include all languages

Would you like me to implement this structure now?