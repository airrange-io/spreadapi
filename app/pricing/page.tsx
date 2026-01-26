import { Metadata } from 'next';
import PricingPageClient from './pricing-page-client';

export const metadata: Metadata = {
  title: 'Pricing - SpreadAPI | Excel API Pricing Plans',
  description: 'Simple, transparent pricing for SpreadAPI. Transform your Excel files into APIs with plans starting from free. No hidden fees.',
  keywords: 'excel api pricing, spreadsheet api cost, excel web service pricing, api pricing plans',
  openGraph: {
    title: 'SpreadAPI Pricing - Simple Plans for Every Need',
    description: 'Transform Excel into APIs with transparent pricing. Free tier available.',
    type: 'website',
    url: 'https://spreadapi.io/pricing',
  },
  alternates: {
    canonical: 'https://spreadapi.io/pricing',
    languages: {
      'en': 'https://spreadapi.io/pricing',
      'de': 'https://spreadapi.io/de/pricing',
    },
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
