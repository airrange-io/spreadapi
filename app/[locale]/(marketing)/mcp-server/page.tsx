import { Metadata } from 'next';
import { MCPServerContent } from '@/(marketing)/mcp-server/page';
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
    title: 'MCP Server für Excel-Tabellen | SpreadAPI',
    description: 'Verbinden Sie KI-Assistenten wie ChatGPT und Claude mit Ihren Excel-Tabellen über MCP (Model Context Protocol). Präzise Berechnungen, keine Halluzinationen. Einrichtung in 5 Minuten.',
    keywords: 'mcp server, mcp server excel, excel mcp, mcp protokoll excel, model context protocol, chatgpt excel, claude excel, ki tabellenberechnungen, mcp integration',
  },
  en: {
    title: 'MCP Server for Excel Spreadsheets | SpreadAPI',
    description: 'Connect AI assistants like ChatGPT and Claude to your Excel spreadsheets via MCP (Model Context Protocol). Accurate calculations, no hallucinations. Setup in 5 minutes.',
    keywords: 'mcp server, mcp server excel, excel mcp, mcp protocol excel, model context protocol, chatgpt excel, claude excel, ai spreadsheet calculations, mcp integration',
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
      canonical: `https://spreadapi.io/${locale}/mcp-server`,
      languages: {
        'en': 'https://spreadapi.io/mcp-server',
        'de': 'https://spreadapi.io/de/mcp-server',
      },
    },
  };
}

export default async function LocaleMCPServerPage({ params }: PageProps) {
  const { locale } = await params;
  return <MCPServerContent locale={locale as SupportedLocale} />;
}
