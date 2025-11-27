import { Metadata } from 'next';
import WhyAIFailsClient from '@/(marketing)/why-ai-fails-at-math/why-ai-fails-client';
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
    title: 'Warum KI an Excel-Berechnungen scheitert | SpreadAPI',
    description: 'Erfahren Sie, warum KI bei Tabellenberechnungen Probleme hat und wie SpreadAPI dies löst – durch die Kombination von KI-Konversation mit Excel-Präzision.',
  },
  en: {
    title: 'Why AI Fails at Excel Math | SpreadAPI',
    description: 'Discover why AI struggles with spreadsheet calculations and how SpreadAPI solves this by combining AI conversation with Excel precision.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale as keyof typeof localeMetadata] || localeMetadata.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://spreadapi.com/${locale}/why-ai-fails-at-math`,
      languages: {
        'en': 'https://spreadapi.com/why-ai-fails-at-math',
        'de': 'https://spreadapi.com/de/why-ai-fails-at-math',
      },
    },
  };
}

export default async function LocaleWhyAIFailsAtMathPage({ params }: PageProps) {
  const { locale } = await params;
  return <WhyAIFailsClient locale={locale as SupportedLocale} />;
}
