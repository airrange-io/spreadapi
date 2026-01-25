import { Metadata } from 'next';
import WhyAIFailsClient from './why-ai-fails-client';

export const metadata: Metadata = {
  title: 'Why AI Fails at Excel Math | SpreadAPI',
  description: 'Discover why AI struggles with spreadsheet calculations and how SpreadAPI solves this by combining AI conversation with Excel precision.',
  keywords: 'ai excel calculations, llm math errors, ai spreadsheet problems, excel api accuracy',
  openGraph: {
    title: 'Why AI Can\'t Do Your Excel Math',
    description: 'AI hallucinates. Excel calculates. See the difference and why it matters for your business.',
    type: 'website',
    url: 'https://spreadapi.io/why-ai-fails-at-math',
  },
  alternates: {
    canonical: 'https://spreadapi.io/why-ai-fails-at-math',
    languages: {
      'en': 'https://spreadapi.io/why-ai-fails-at-math',
      'de': 'https://spreadapi.io/de/why-ai-fails-at-math',
      'x-default': 'https://spreadapi.io/why-ai-fails-at-math',
    },
  },
};

export default function WhyAIFailsAtMathPage() {
  return <WhyAIFailsClient />;
}