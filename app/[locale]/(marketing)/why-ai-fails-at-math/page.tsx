import { Metadata } from 'next';
import WhyAIFailsClient from '@/(marketing)/why-ai-fails-at-math/why-ai-fails-client';
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
    title: 'Why AI Fails at Excel Math | SpreadAPI',
    description: 'Discover why AI struggles with spreadsheet calculations and how SpreadAPI solves this by combining AI conversation with Excel precision.',
    alternates: {
      canonical: `https://spreadapi.com/${locale}/why-ai-fails-at-math`,
      languages: {
        'en': 'https://spreadapi.com/why-ai-fails-at-math',
        'de': 'https://spreadapi.com/de/why-ai-fails-at-math',
        'fr': 'https://spreadapi.com/fr/why-ai-fails-at-math',
        'es': 'https://spreadapi.com/es/why-ai-fails-at-math',
      },
    },
  };
}

export default async function LocaleWhyAIFailsAtMathPage({ params }: PageProps) {
  const { locale } = await params;
  return <WhyAIFailsClient locale={locale as SupportedLocale} />;
}
