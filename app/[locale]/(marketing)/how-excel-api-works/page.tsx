import { Metadata } from 'next';
import { HowItWorksContent } from '@/(marketing)/how-excel-api-works/page';
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
    title: 'So funktioniert die Excel-API - SpreadAPI | Tabellen in APIs verwandeln',
    description: 'Erfahren Sie, wie SpreadAPI Ihre Excel-Tabellen in leistungsstarke REST-APIs verwandelt. Keine Programmierung nötig.',
  },
  en: {
    title: 'How Excel API Works - SpreadAPI | Transform Spreadsheets to APIs',
    description: 'Learn how SpreadAPI transforms your Excel spreadsheets into powerful REST APIs. No coding required.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale as keyof typeof localeMetadata] || localeMetadata.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://spreadapi.io/${locale}/how-excel-api-works`,
      languages: {
        'en': 'https://spreadapi.io/how-excel-api-works',
        'de': 'https://spreadapi.io/de/how-excel-api-works',
      },
    },
  };
}

export default async function LocaleHowItWorksPage({ params }: PageProps) {
  const { locale } = await params;
  return <HowItWorksContent locale={locale as SupportedLocale} />;
}
