import { Metadata } from 'next';
import { AutomationCalculationsContent } from '@/(marketing)/automation-calculations/page';
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
    title: 'Wenn Ihre Automatisierung rechnen muss | SpreadAPI',
    description: 'Zapier bewegt Daten. Make löst Aktionen aus. Aber wer rechnet? Fügen Sie Excel-Berechnungen zu Ihren Automatisierungen hinzu – ohne Code.',
  },
  en: {
    title: 'When Your Automation Needs to Think | SpreadAPI',
    description: 'Zapier moves data. Make triggers actions. But who does the math? Add Excel-powered calculations to your automations without code.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale as keyof typeof localeMetadata] || localeMetadata.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://spreadapi.com/${locale}/automation-calculations`,
      languages: {
        'en': 'https://spreadapi.com/automation-calculations',
        'de': 'https://spreadapi.com/de/automation-calculations',
      },
    },
  };
}

export default async function LocaleAutomationCalculationsPage({ params }: PageProps) {
  const { locale } = await params;
  return <AutomationCalculationsContent locale={locale as SupportedLocale} />;
}
