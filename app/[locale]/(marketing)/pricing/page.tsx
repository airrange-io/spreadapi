import { Metadata } from 'next';
import PricingPageClient from '@/pricing/pricing-page-client';
import { SupportedLocale } from '@/lib/translations/blog-helpers';

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Only German is actively translated for now
export async function generateStaticParams() {
  return [
    { locale: 'de' },
  ];
}

const localeMetadata = {
  de: {
    title: 'Preise - SpreadAPI | Excel-API Preispläne',
    description: 'Einfache, transparente Preise für SpreadAPI. Verwandeln Sie Ihre Excel-Dateien in APIs – ab kostenlos. Keine versteckten Gebühren.',
  },
  en: {
    title: 'Pricing - SpreadAPI | Excel API Pricing Plans',
    description: 'Simple, transparent pricing for SpreadAPI. Transform your Excel files into APIs with plans starting from free. No hidden fees.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale as keyof typeof localeMetadata] || localeMetadata.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://spreadapi.io/${locale}/pricing`,
      languages: {
        'en': 'https://spreadapi.io/pricing',
        'de': 'https://spreadapi.io/de/pricing',
      },
    },
  };
}

export default async function LocalePricingPage({ params }: PageProps) {
  const { locale } = await params;
  return <PricingPageClient locale={locale as SupportedLocale} />;
}
