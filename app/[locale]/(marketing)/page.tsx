import { Metadata } from 'next';
import ProductPageClient from '@/(marketing)/product-page-client';
import FAQSchema from '@/components/seo/FAQSchema';
import { productFAQs } from '@/data/faq';
import { SupportedLocale } from '@/lib/translations/blog-helpers';

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Only German is actively translated for now
export async function generateStaticParams() {
  return [
    { locale: 'de' },
    // { locale: 'fr' },  // Coming soon
    // { locale: 'es' },  // Coming soon
  ];
}

// Localized metadata for each language
const localeMetadata = {
  de: {
    title: 'SpreadAPI - Excel-Tabellen in leistungsstarke APIs verwandeln',
    description: 'Verwandeln Sie Excel-Dateien sofort in REST-APIs. Keine Programmierung nötig. Perfekt für KI-Integration mit ChatGPT, Claude und mehr.',
    keywords: 'excel api, tabellenkalkulation api, excel zu api, excel webservice, excel rest api, excel berechnung api, mcp excel, ki excel integration',
    ogTitle: 'SpreadAPI - Excel zur API in Sekunden',
    ogDescription: 'Verwandeln Sie Ihre Excel-Tabellen in leistungsstarke REST-APIs. KI-bereit mit MCP-Unterstützung.',
    ogAlt: 'SpreadAPI - Excel zu API Plattform',
  },
  en: {
    title: 'SpreadAPI - Transform Excel Spreadsheets into Powerful APIs',
    description: 'Turn your Excel files into REST APIs instantly. No coding required. Perfect for AI integration with ChatGPT, Claude, and more.',
    keywords: 'excel api, spreadsheet api, excel to api, spreadsheet web service, excel rest api, excel calculation api, mcp excel, ai excel integration',
    ogTitle: 'SpreadAPI - Excel to API in Seconds',
    ogDescription: 'Transform your Excel spreadsheets into powerful REST APIs. AI-ready with MCP support.',
    ogAlt: 'SpreadAPI - Excel to API Platform',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale as keyof typeof localeMetadata] || localeMetadata.en;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      type: 'website',
      url: `https://spreadapi.com/${locale}`,
      siteName: 'SpreadAPI',
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      images: [{
        url: 'https://spreadapi.com/api/og?title=Transform%20Excel%20into%20APIs&description=No%20coding%20required.%20AI-ready%20with%20MCP%20support.',
        width: 1200,
        height: 630,
        alt: meta.ogAlt,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.ogTitle,
      description: meta.ogDescription,
      site: '@spreadapi',
      images: ['https://spreadapi.com/api/og?title=Transform%20Excel%20into%20APIs&description=No%20coding%20required.%20AI-ready%20with%20MCP%20support.'],
    },
    alternates: {
      canonical: `https://spreadapi.com/${locale}`,
      languages: {
        'en': 'https://spreadapi.com/',
        'de': 'https://spreadapi.com/de',
        // fr and es removed until translations are ready
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleProductPage({ params }: PageProps) {
  const { locale } = await params;
  const typedLocale = locale as SupportedLocale;

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SpreadAPI",
    "url": "https://spreadapi.com",
    "logo": "https://spreadapi.com/icons/logo-full.svg",
    "sameAs": [
      "https://twitter.com/spreadapi",
      "https://github.com/spreadapi"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "team@airrange.io",
      "contactType": "customer support",
      "availableLanguage": ["en", "de"]
    }
  };

  // Product schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SpreadAPI",
    "applicationCategory": "DeveloperApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "description": "Transform Excel spreadsheets into REST APIs instantly. Perfect for AI integration.",
    "softwareVersion": "1.0",
    "operatingSystem": "Web",
    "url": `https://spreadapi.com/${locale}`,
    "screenshot": "https://spreadapi.com/api/og?title=SpreadAPI%20Dashboard",
    "featureList": [
      "Excel to API conversion",
      "MCP Protocol support",
      "AI integration ready",
      "Real-time calculations",
      "Secure cloud storage",
      "No file uploads required"
    ],
    "creator": {
      "@type": "Organization",
      "name": "Airrange.io"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <FAQSchema faqs={productFAQs} />
      <ProductPageClient locale={typedLocale} />
    </>
  );
}
