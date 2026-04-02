import { Metadata } from 'next';
import { ExcelToApiContent } from '@/(marketing)/excel-to-api/page';
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
    title: 'Excel zu API — Tabellen in REST APIs umwandeln | SpreadAPI',
    description: 'Verwandeln Sie jede Excel-Tabelle in eine REST API. Kein Code nötig. Laden Sie Ihre .xlsx-Datei hoch, definieren Sie Ein- und Ausgaben und erhalten Sie einen Live-API-Endpunkt.',
    keywords: 'excel zu api, excel api, tabelle zu api, excel rest api, xlsx zu api, excel webservice, tabellenkalkulation api',
  },
  en: {
    title: 'Excel to API — Turn Spreadsheets into REST APIs | SpreadAPI',
    description: 'Turn any Excel spreadsheet into a REST API. No code required. Upload your .xlsx file, define inputs and outputs, and get a live API endpoint.',
    keywords: 'excel to api, excel api, spreadsheet to api, excel rest api, xlsx to api, excel web service, spreadsheet api',
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
      canonical: `https://spreadapi.io/${locale}/excel-to-api`,
      languages: {
        'en': 'https://spreadapi.io/excel-to-api',
        'de': 'https://spreadapi.io/de/excel-to-api',
      },
    },
  };
}

export default async function LocaleExcelToApiPage({ params }: PageProps) {
  const { locale } = await params;
  return <ExcelToApiContent locale={locale as SupportedLocale} />;
}
