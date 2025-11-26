import { Metadata } from 'next';
import { AIIntegrationContent } from '@/(marketing)/excel-ai-integration/page';
import { SupportedLocale } from '@/lib/translations/blog-helpers';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return [
    { locale: 'de' },
    { locale: 'fr' },
    { locale: 'es' },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Excel AI Integration - SpreadAPI | Connect ChatGPT & Claude to Excel',
    description: 'Give AI assistants Excel superpowers. Let ChatGPT and Claude use your spreadsheet calculations.',
    alternates: {
      canonical: `https://spreadapi.com/${locale}/excel-ai-integration`,
      languages: {
        'en': 'https://spreadapi.com/excel-ai-integration',
        'de': 'https://spreadapi.com/de/excel-ai-integration',
        'fr': 'https://spreadapi.com/fr/excel-ai-integration',
        'es': 'https://spreadapi.com/es/excel-ai-integration',
      },
    },
  };
}

export default async function LocaleAIIntegrationPage({ params }: PageProps) {
  const { locale } = await params;
  return <AIIntegrationContent locale={locale as SupportedLocale} />;
}
