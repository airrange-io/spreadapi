import { Metadata } from 'next';
import { AIIntegrationContent } from '@/(marketing)/excel-ai-integration/page';
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
    title: 'Excel KI-Integration - SpreadAPI | ChatGPT & Claude mit Excel verbinden',
    description: 'Geben Sie KI-Assistenten Excel-Superkräfte. Lassen Sie ChatGPT und Claude Ihre Tabellenberechnungen nutzen.',
  },
  en: {
    title: 'Excel AI Integration - SpreadAPI | Connect ChatGPT & Claude to Excel',
    description: 'Give AI assistants Excel superpowers. Let ChatGPT and Claude use your spreadsheet calculations.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale as keyof typeof localeMetadata] || localeMetadata.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://spreadapi.com/${locale}/excel-ai-integration`,
      languages: {
        'en': 'https://spreadapi.com/excel-ai-integration',
        'de': 'https://spreadapi.com/de/excel-ai-integration',
      },
    },
  };
}

export default async function LocaleAIIntegrationPage({ params }: PageProps) {
  const { locale } = await params;
  return <AIIntegrationContent locale={locale as SupportedLocale} />;
}
