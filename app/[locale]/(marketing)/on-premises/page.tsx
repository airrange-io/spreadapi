import { Metadata } from 'next';
import { OnPremisesContent } from '@/(marketing)/on-premises/page';
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
    title: 'On-Premises & Enterprise | SpreadAPI – Ihre Infrastruktur',
    description: 'Betreiben Sie SpreadAPI auf Ihrer eigenen Infrastruktur. Volle Datensouveränität, keine externen Abhängigkeiten. Perfekt für Finanzdienstleister, Beratungsfirmen und regulierte Branchen.',
  },
  en: {
    title: 'On-Premises & Enterprise | SpreadAPI',
    description: 'Deploy SpreadAPI in your own infrastructure. Full data sovereignty, zero external dependencies. Perfect for financial services, consulting firms, and regulated industries.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale as keyof typeof localeMetadata] || localeMetadata.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://spreadapi.io/${locale}/on-premises`,
      languages: {
        'en': 'https://spreadapi.io/on-premises',
        'de': 'https://spreadapi.io/de/on-premises',
      },
    },
  };
}

export default async function LocaleOnPremisesPage({ params }: PageProps) {
  const { locale } = await params;
  return <OnPremisesContent locale={locale as SupportedLocale} />;
}
