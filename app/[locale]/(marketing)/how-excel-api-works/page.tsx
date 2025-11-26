import { Metadata } from 'next';
import { HowItWorksContent } from '@/(marketing)/how-excel-api-works/page';
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
    title: 'How Excel API Works - SpreadAPI | Transform Spreadsheets to APIs',
    description: 'Learn how SpreadAPI transforms your Excel spreadsheets into powerful REST APIs. No coding required.',
    alternates: {
      canonical: `https://spreadapi.com/${locale}/how-excel-api-works`,
      languages: {
        'en': 'https://spreadapi.com/how-excel-api-works',
        'de': 'https://spreadapi.com/de/how-excel-api-works',
        'fr': 'https://spreadapi.com/fr/how-excel-api-works',
        'es': 'https://spreadapi.com/es/how-excel-api-works',
      },
    },
  };
}

export default async function LocaleHowItWorksPage({ params }: PageProps) {
  const { locale } = await params;
  return <HowItWorksContent locale={locale as SupportedLocale} />;
}
