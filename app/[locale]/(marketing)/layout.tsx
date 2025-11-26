import { SupportedLocale } from '@/lib/translations/blog-helpers';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// Generate static params for supported locales (excluding 'en' which is at root)
export function generateStaticParams() {
  return [
    { locale: 'de' },
    { locale: 'fr' },
    { locale: 'es' },
  ];
}

export default async function LocaleMarketingLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  const validLocales: SupportedLocale[] = ['de', 'fr', 'es'];
  if (!validLocales.includes(locale as SupportedLocale)) {
    // This shouldn't happen due to generateStaticParams, but just in case
    return null;
  }

  return <>{children}</>;
}
