import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SpreadAPI - Headless Spreadsheets for AI and Automation',
  description: 'Transform your Excel spreadsheets into secure APIs that AI assistants can use. Enable Claude, ChatGPT, and other AI tools to work with your Excel calculations without hallucinations.',
  keywords: 'Excel API, AI spreadsheet integration, Excel web service, MCP server, Claude Excel, ChatGPT Excel, spreadsheet API, Excel automation',
  openGraph: {
    title: 'SpreadAPI - Turn Excel Into APIs for AI',
    description: 'Transform Excel spreadsheets into secure APIs. Let AI work with your calculations.',
    url: 'https://spreadapi.io/product',
    siteName: 'SpreadAPI',
    images: [
      {
        url: 'https://spreadapi.io/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SpreadAPI - Excel meets AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpreadAPI - Turn Excel Into APIs for AI',
    description: 'Transform Excel spreadsheets into secure APIs that AI can use.',
    images: ['https://spreadapi.io/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://spreadapi.io/product',
  },
};