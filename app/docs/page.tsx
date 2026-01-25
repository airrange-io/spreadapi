import { Metadata } from 'next';
import DocsPageClient from './docs-page-client';

export const metadata: Metadata = {
  title: 'API Documentation - SpreadAPI | Excel API Docs',
  description: 'Complete API documentation for SpreadAPI. Learn how to integrate Excel calculations into your applications with our REST API.',
  keywords: 'excel api documentation, spreadsheet api docs, excel rest api reference, api integration guide',
  openGraph: {
    title: 'SpreadAPI Documentation - Excel API Reference',
    description: 'Complete API documentation for integrating Excel calculations into your apps.',
    type: 'website',
    url: 'https://spreadapi.io/docs',
  },
};

export default function DocsPage() {
  return <DocsPageClient />;
}