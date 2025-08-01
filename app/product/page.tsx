import { Metadata } from 'next';
import ProductPageClient from './product-page-client';
import FAQSchema from '@/components/seo/FAQSchema';
import { productFAQs } from '@/data/faq';

export const metadata: Metadata = {
  title: 'SpreadAPI - Transform Excel Spreadsheets into Powerful APIs',
  description: 'Turn your Excel files into REST APIs instantly. No coding required. Perfect for AI integration with ChatGPT, Claude, and more.',
  keywords: 'excel api, spreadsheet api, excel to api, spreadsheet web service, excel rest api, excel calculation api, mcp excel, ai excel integration',
  openGraph: {
    title: 'SpreadAPI - Excel to API in Seconds',
    description: 'Transform your Excel spreadsheets into powerful REST APIs. AI-ready with MCP support.',
    type: 'website',
    url: 'https://spreadapi.com/product',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.com/api/og?title=Transform%20Excel%20into%20APIs&description=No%20coding%20required.%20AI-ready%20with%20MCP%20support.',
      width: 1200,
      height: 630,
      alt: 'SpreadAPI - Excel to API Platform',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpreadAPI - Excel to API in Seconds',
    description: 'Transform your Excel spreadsheets into powerful REST APIs. AI-ready with MCP support.',
    site: '@spreadapi',
    images: ['https://spreadapi.com/api/og?title=Transform%20Excel%20into%20APIs&description=No%20coding%20required.%20AI-ready%20with%20MCP%20support.'],
  },
  alternates: {
    canonical: 'https://spreadapi.com/product',
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

export default function ProductPage() {
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
      "availableLanguage": ["en"]
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
    "url": "https://spreadapi.com",
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
      <ProductPageClient />
    </>
  );
}