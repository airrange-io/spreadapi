import { Metadata } from 'next';
import { StopRewritingExcelContent } from '@/(marketing)/stop-rewriting-excel-in-code/page';
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
    title: 'Stop Rewriting Excel in Code | SpreadAPI',
    description: 'Stop wasting months converting Excel spreadsheets to JavaScript. Turn your Excel models into APIs instantly. 100% accuracy, zero formula translation.',
    alternates: {
      canonical: `https://spreadapi.com/${locale}/stop-rewriting-excel-in-code`,
      languages: {
        'en': 'https://spreadapi.com/stop-rewriting-excel-in-code',
        'de': 'https://spreadapi.com/de/stop-rewriting-excel-in-code',
        'fr': 'https://spreadapi.com/fr/stop-rewriting-excel-in-code',
        'es': 'https://spreadapi.com/es/stop-rewriting-excel-in-code',
      },
    },
  };
}

export default async function LocaleStopRewritingExcelPage({ params }: PageProps) {
  const { locale } = await params;
  return <StopRewritingExcelContent locale={locale as SupportedLocale} />;
}
