import { redirect } from 'next/navigation';
import { SupportedLocale } from '@/lib/translations/blog-helpers';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// Generate static params for supported locales (excluding 'en' which is at root)
// Only German is actively translated for now
export function generateStaticParams() {
  return [
    { locale: 'de' },
    // { locale: 'fr' },  // Coming soon
    // { locale: 'es' },  // Coming soon
  ];
}

export default async function LocaleMarketingLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Redirect French and Spanish to English (root) - translations coming soon
  if (locale === 'fr' || locale === 'es') {
    redirect('/');
  }

  // Validate locale - only German is active
  const activeLocales: SupportedLocale[] = ['de'];
  if (!activeLocales.includes(locale as SupportedLocale)) {
    return null;
  }

  return <>{children}</>;
}
