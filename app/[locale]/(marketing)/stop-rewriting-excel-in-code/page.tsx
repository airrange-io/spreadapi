import { Metadata } from 'next';
import { StopRewritingExcelContent } from '@/(marketing)/stop-rewriting-excel-in-code/page';
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
    title: 'Schluss mit Excel nachprogrammieren | SpreadAPI',
    description: 'Verschwenden Sie keine Monate mehr damit, Excel in JavaScript umzuwandeln. Machen Sie Ihre Excel-Modelle sofort zu APIs. 100% Genauigkeit, keine Formelübersetzung.',
  },
  en: {
    title: 'Stop Rewriting Excel in Code | SpreadAPI',
    description: 'Stop wasting months converting Excel spreadsheets to JavaScript. Turn your Excel models into APIs instantly. 100% accuracy, zero formula translation.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale as keyof typeof localeMetadata] || localeMetadata.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://spreadapi.com/${locale}/stop-rewriting-excel-in-code`,
      languages: {
        'en': 'https://spreadapi.com/stop-rewriting-excel-in-code',
        'de': 'https://spreadapi.com/de/stop-rewriting-excel-in-code',
      },
    },
  };
}

export default async function LocaleStopRewritingExcelPage({ params }: PageProps) {
  const { locale } = await params;
  return <StopRewritingExcelContent locale={locale as SupportedLocale} />;
}
