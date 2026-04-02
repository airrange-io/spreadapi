import { Metadata } from 'next';
import VsGoogleSheetsPage from '@/(marketing)/vs/google-sheets-api/page';
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
    title: 'SpreadAPI vs Google Sheets API — Preise, Funktionen & Vergleich',
    description: 'Detaillierter Vergleich von SpreadAPI und Google Sheets API. Vergleichen Sie Preise, Rate-Limits, Antwortzeiten und KI-Integration.',
    keywords: 'google sheets api kosten, google sheets api preise, spreadapi vs google sheets, tabellenkalkulation api vergleich',
  },
  en: {
    title: 'SpreadAPI vs Google Sheets API — Pricing, Features & Comparison',
    description: 'Detailed comparison of SpreadAPI and Google Sheets API. Compare pricing, rate limits, response times, and AI integration.',
    keywords: 'google sheets api cost, google sheets api pricing, spreadapi vs google sheets, spreadsheet api comparison',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale as keyof typeof localeMetadata] || localeMetadata.en;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: `https://spreadapi.io/${locale}/vs/google-sheets-api`,
      languages: {
        'en': 'https://spreadapi.io/vs/google-sheets-api',
        'de': 'https://spreadapi.io/de/vs/google-sheets-api',
      },
    },
  };
}

export default async function LocaleVsGoogleSheetsPage({ params }: PageProps) {
  const { locale } = await params;
  return <VsGoogleSheetsPage locale={(locale as SupportedLocale) || 'en'} />;
}
