import { Metadata } from 'next';
import SecurityPage from '@/(marketing)/security/page';

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
    title: 'Sicherheit & Compliance | SpreadAPI',
    description: 'Erfahren Sie, wie SpreadAPI Ihre Daten schützt. Zertifizierte Infrastruktur, minimale Datenspeicherung, DSGVO-konform und On-Premises-Optionen.',
    keywords: 'spreadapi sicherheit, datenschutz, soc 2, dsgvo, enterprise sicherheit, api sicherheit, datenverschlüsselung',
  },
  en: {
    title: 'Security & Compliance | SpreadAPI',
    description: 'Learn how SpreadAPI protects your data. Built on certified infrastructure, minimal data storage, GDPR compliance, and on-premises options.',
    keywords: 'spreadapi security, data protection, soc 2, gdpr compliance, enterprise security, api security, data encryption',
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
      canonical: `https://spreadapi.io/${locale}/security`,
      languages: {
        'en': 'https://spreadapi.io/security',
        'de': 'https://spreadapi.io/de/security',
      },
    },
  };
}

export default async function LocaleSecurityPage({ params }: PageProps) {
  await params;
  return <SecurityPage />;
}
