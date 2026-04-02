import { Metadata } from 'next';
import '../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import FAQSchema from '@/components/seo/FAQSchema';
import Link from 'next/link';
import { SupportedLocale } from '@/lib/translations/blog-helpers';

export const dynamic = 'force-static';

const mcpFAQs = [
  {
    question: 'What is an MCP Server?',
    answer: 'MCP (Model Context Protocol) is an open standard that allows AI assistants like Claude and ChatGPT to connect to external tools and data sources. An MCP Server acts as a bridge, letting AI access your spreadsheet calculations in real time without hallucinating the math.',
  },
  {
    question: 'How does SpreadAPI\'s MCP Server work with Excel?',
    answer: 'SpreadAPI turns your Excel spreadsheet into an API. The MCP Server exposes that API to AI assistants. When an AI needs to calculate a loan payment, pricing quote, or financial model, it calls your actual Excel formulas instead of guessing the result.',
  },
  {
    question: 'Which AI assistants support MCP?',
    answer: 'Claude Desktop, ChatGPT (via plugins/actions), and any MCP-compatible client can connect to SpreadAPI. The protocol is open and growing — new AI tools are adding MCP support regularly.',
  },
  {
    question: 'Do I need to write code to set up MCP?',
    answer: 'No. SpreadAPI generates the MCP configuration automatically. You upload your Excel file, define inputs and outputs, and copy the MCP connection URL into your AI assistant. Setup takes under 5 minutes.',
  },
  {
    question: 'Is my Excel data safe when using MCP?',
    answer: 'Yes. The AI only sees the input/output cells you explicitly define. Your formulas, proprietary logic, and other data remain private. All communication is encrypted with TLS 1.3, and you can revoke access at any time.',
  },
  {
    question: 'What\'s the difference between MCP and a traditional API integration?',
    answer: 'A traditional API requires developers to write code to call endpoints. MCP lets AI assistants discover and use your spreadsheet calculations automatically — no code needed on the AI side. The AI understands what inputs are needed and what outputs to expect.',
  },
  {
    question: 'Can I use MCP for financial models and pricing calculators?',
    answer: 'Absolutely. MCP is ideal for any scenario where AI needs accurate calculations: loan pricing, insurance quotes, tax calculations, engineering formulas, ROI models, and more. The Excel engine guarantees precision that LLMs cannot.',
  },
  {
    question: 'How fast are MCP calculations?',
    answer: 'SpreadAPI responds in 50-200ms for most calculations. The Excel engine stays warm in memory, so there is no cold start delay. This is fast enough for real-time conversational AI use cases.',
  },
];

export const metadata: Metadata = {
  title: 'MCP Server for Excel Spreadsheets | SpreadAPI',
  description: 'Connect AI assistants like ChatGPT and Claude to your Excel spreadsheets via MCP (Model Context Protocol). Accurate calculations, no hallucinations. Setup in 5 minutes.',
  keywords: 'mcp server, mcp server excel, excel mcp, mcp protocol excel, model context protocol, chatgpt excel, claude excel, ai spreadsheet calculations, mcp integration',
  openGraph: {
    title: 'MCP Server for Excel — Connect AI to Your Spreadsheets',
    description: 'Give AI assistants access to real Excel calculations. No hallucinations, no guessing. MCP protocol with SpreadAPI.',
    type: 'article',
    url: 'https://spreadapi.io/mcp-server',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.io/api/og?title=MCP%20Server%20for%20Excel&description=Connect%20AI%20to%20your%20spreadsheet%20calculations',
      width: 1200,
      height: 630,
      alt: 'MCP Server for Excel Spreadsheets - SpreadAPI',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MCP Server for Excel — Connect AI to Your Spreadsheets',
    description: 'Give AI assistants access to real Excel calculations via MCP. No hallucinations.',
    site: '@spreadapi',
  },
  alternates: {
    canonical: 'https://spreadapi.io/mcp-server',
    languages: {
      'en': 'https://spreadapi.io/mcp-server',
      'de': 'https://spreadapi.io/de/mcp-server',
      'x-default': 'https://spreadapi.io/mcp-server',
    },
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
};

interface MCPServerContentProps {
  locale?: SupportedLocale;
}

export function MCPServerContent({ locale = 'en' }: MCPServerContentProps) {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Set Up an MCP Server for Excel",
    "description": "Connect your Excel spreadsheets to AI assistants like Claude and ChatGPT using SpreadAPI's MCP Server in 3 simple steps.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Upload your Excel file",
        "text": "Upload your Excel spreadsheet to SpreadAPI and define which cells are inputs (parameters) and which are outputs (results).",
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Publish as API with MCP enabled",
        "text": "Click publish to create your API endpoint. SpreadAPI automatically generates an MCP-compatible server configuration.",
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Connect your AI assistant",
        "text": "Copy the MCP connection URL into Claude Desktop, ChatGPT, or any MCP-compatible client. The AI can now use your spreadsheet calculations.",
      },
    ],
    "totalTime": "PT5M",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://spreadapi.io",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "MCP Server for Excel",
        "item": "https://spreadapi.io/mcp-server",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FAQSchema faqs={mcpFAQs} />

      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="mcp-server" locale={locale} />

          <main className="main-wrapper">
            {/* Hero Section */}
            <header className="section-home-header">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="home-header-component">
                      <div className="margin-bottom margin-xlarge">
                        <div className="text-align-center">
                          <div className="max-width-xlarge align-center">
                            <div className="margin-bottom margin-xsmall">
                              <div className="subheading">
                                <div>Model Context Protocol</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                MCP Server for Excel — <span className="text-color-primary">Connect AI to Your Spreadsheets</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              AI assistants hallucinate math. Excel doesn&apos;t. SpreadAPI&apos;s MCP Server lets ChatGPT, Claude, and other AI tools call your real Excel formulas — delivering accurate results every time.
                            </p>
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <Link href="/app" className="button-primary" style={{
                                display: 'inline-flex', alignItems: 'center', padding: '0.75rem 2rem',
                                backgroundColor: '#9333EA', color: 'white', borderRadius: '8px',
                                textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
                              }}>
                                Get Started Free
                              </Link>
                              <Link href="/how-excel-api-works" style={{
                                display: 'inline-flex', alignItems: 'center', padding: '0.75rem 2rem',
                                border: '2px solid #E8E0FF', borderRadius: '8px',
                                textDecoration: 'none', fontWeight: 600, fontSize: '1rem', color: '#0a0a0a',
                              }}>
                                See How It Works
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Problem Section */}
            <section className="section-home-feature" style={{ backgroundColor: '#F8F6FE' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <h2>
                            Why AI Needs an <span className="text-color-primary">MCP Server for Excel</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            Large Language Models are powerful at understanding language, but they cannot reliably execute spreadsheet formulas. When ChatGPT tries to calculate a mortgage payment or insurance premium, it guesses. Sometimes it&apos;s close. Often it&apos;s dangerously wrong.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                        <h3 style={{ color: '#DC2626', marginBottom: '0.75rem', fontSize: '1.25rem' }}>Without MCP</h3>
                        <p style={{ color: '#7F1D1D', lineHeight: 1.7 }}>
                          &ldquo;What&apos;s my monthly payment for a $300k loan at 4.5% over 30 years?&rdquo;
                        </p>
                        <p style={{ marginTop: '1rem', fontWeight: 600, color: '#DC2626' }}>
                          AI guesses: $1,520.06
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#991B1B', marginTop: '0.5rem' }}>
                          Wrong. The correct answer is $1,520.06 only if using specific amortization assumptions. Different formula implementations yield different results. The AI has no way to know which is correct.
                        </p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                        <h3 style={{ color: '#16A34A', marginBottom: '0.75rem', fontSize: '1.25rem' }}>With SpreadAPI MCP</h3>
                        <p style={{ color: '#14532D', lineHeight: 1.7 }}>
                          AI calls your Excel model via MCP. Your PMT formula runs. The exact result comes back.
                        </p>
                        <p style={{ marginTop: '1rem', fontWeight: 600, color: '#16A34A' }}>
                          Excel calculates: $1,520.06
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.5rem' }}>
                          100% accurate. Same result as your validated Excel model. Every time. Auditable. Compliant.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* What is MCP Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            What is <span className="text-color-primary">MCP</span> (Model Context Protocol)?
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            MCP is an open protocol created by Anthropic that standardizes how AI assistants connect to external tools and data sources. Think of it as a USB port for AI — a universal way to plug in capabilities.
                          </p>
                          <p className="text-size-medium" style={{ marginTop: '1rem' }}>
                            Instead of building custom integrations for each AI tool, you create one MCP Server, and any compatible AI assistant can use it. SpreadAPI automatically generates this MCP Server for every Excel spreadsheet you publish.
                          </p>
                        </div>
                        <div className="feature-keypoint-list">
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <p className="text-size-medium"><strong>Open standard</strong> — not locked to one AI vendor</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <p className="text-size-medium"><strong>Auto-discovery</strong> — AI learns what your spreadsheet can do</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <p className="text-size-medium"><strong>Secure</strong> — granular permissions, encrypted communication</p>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div style={{ backgroundColor: '#F8F6FE', borderRadius: '16px', padding: '2.5rem', position: 'relative' }}>
                          {/* MCP Architecture Diagram */}
                          <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="MCP architecture diagram showing AI assistants connecting to Excel via SpreadAPI">
                            {/* AI Assistants */}
                            <rect x="20" y="20" width="140" height="50" rx="10" fill="#fff" stroke="#9333EA" strokeWidth="2"/>
                            <text x="90" y="50" textAnchor="middle" fill="#9333EA" fontSize="14" fontWeight="600">Claude / ChatGPT</text>

                            {/* Arrow down */}
                            <path d="M90 70 L90 110" stroke="#9333EA" strokeWidth="2" strokeDasharray="6,3"/>
                            <path d="M85 105 L90 115 L95 105" fill="#9333EA"/>
                            <text x="130" y="95" fill="#6B7280" fontSize="11">MCP Protocol</text>

                            {/* SpreadAPI MCP Server */}
                            <rect x="20" y="120" width="360" height="60" rx="12" fill="#9333EA" fillOpacity="0.1" stroke="#9333EA" strokeWidth="2"/>
                            <text x="200" y="147" textAnchor="middle" fill="#9333EA" fontSize="15" fontWeight="700">SpreadAPI MCP Server</text>
                            <text x="200" y="167" textAnchor="middle" fill="#7C3AED" fontSize="11">Auto-discovery &bull; Auth &bull; Rate Limiting</text>

                            {/* Arrows down to Excel files */}
                            <path d="M100 180 L100 210" stroke="#9333EA" strokeWidth="2" strokeDasharray="6,3"/>
                            <path d="M95 205 L100 215 L105 205" fill="#9333EA"/>
                            <path d="M200 180 L200 210" stroke="#9333EA" strokeWidth="2" strokeDasharray="6,3"/>
                            <path d="M195 205 L200 215 L205 205" fill="#9333EA"/>
                            <path d="M300 180 L300 210" stroke="#9333EA" strokeWidth="2" strokeDasharray="6,3"/>
                            <path d="M295 205 L300 215 L305 205" fill="#9333EA"/>

                            {/* Excel files */}
                            <rect x="40" y="220" width="120" height="80" rx="8" fill="#fff" stroke="#16A34A" strokeWidth="2"/>
                            <rect x="40" y="220" width="120" height="24" rx="8" fill="#16A34A" fillOpacity="0.1"/>
                            <text x="100" y="237" textAnchor="middle" fill="#16A34A" fontSize="11" fontWeight="600">Loan Calculator</text>
                            <text x="60" y="260" fill="#6B7280" fontSize="10">PMT(rate, n, pv)</text>
                            <text x="60" y="275" fill="#6B7280" fontSize="10">IRR(values)</text>
                            <text x="60" y="290" fill="#6B7280" fontSize="10">NPV(rate, ...)</text>

                            <rect x="180" y="220" width="120" height="80" rx="8" fill="#fff" stroke="#F59E0B" strokeWidth="2"/>
                            <rect x="180" y="220" width="120" height="24" rx="8" fill="#F59E0B" fillOpacity="0.1"/>
                            <text x="240" y="237" textAnchor="middle" fill="#D97706" fontSize="11" fontWeight="600">Pricing Engine</text>
                            <text x="200" y="260" fill="#6B7280" fontSize="10">VLOOKUP(...)</text>
                            <text x="200" y="275" fill="#6B7280" fontSize="10">IF(tier, ...)</text>
                            <text x="200" y="290" fill="#6B7280" fontSize="10">SUMIFS(...)</text>

                            {/* Lock icon */}
                            <rect x="325" y="240" width="50" height="50" rx="25" fill="#9333EA" fillOpacity="0.1"/>
                            <path d="M350 255 L350 260 M342 260 L358 260 L358 275 L342 275 Z" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            <circle cx="350" cy="268" r="2" fill="#9333EA"/>
                            <text x="350" y="290" textAnchor="middle" fill="#7C3AED" fontSize="9">Formulas</text>
                            <text x="350" y="300" textAnchor="middle" fill="#7C3AED" fontSize="9">stay private</text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Set Up - HowTo Section */}
            <section id="setup" className="section-home-workflow" style={{ backgroundColor: '#F8F6FE' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Setup in 5 Minutes</div>
                            </div>
                          </div>
                          <h2>
                            How to Set Up an <span className="text-color-primary">MCP Server</span> for Excel
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="workflow-steps">
                      <div className="workflow-step">
                        <div className="workflow-step-number">1</div>
                        <div className="workflow-step-content">
                          <h3>Upload Your Excel File</h3>
                          <p>Upload your spreadsheet to SpreadAPI. Define which cells are inputs (the parameters AI will send) and which are outputs (the results AI will receive). Supports XLSX with formulas, VLOOKUP, pivot tables, and more.</p>
                        </div>
                      </div>

                      <div className="workflow-connector"></div>

                      <div className="workflow-step">
                        <div className="workflow-step-number">2</div>
                        <div className="workflow-step-content">
                          <h3>Publish with MCP Enabled</h3>
                          <p>Click publish. SpreadAPI creates a REST API endpoint and automatically generates an MCP-compatible server. No configuration files to write, no Docker containers to manage.</p>
                        </div>
                      </div>

                      <div className="workflow-connector"></div>

                      <div className="workflow-step">
                        <div className="workflow-step-number">3</div>
                        <div className="workflow-step-content">
                          <h3>Connect Your AI Assistant</h3>
                          <p>Copy the MCP URL into Claude Desktop, ChatGPT, or any MCP-compatible client. The AI instantly discovers your spreadsheet&apos;s capabilities and can call calculations in real time.</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-align-center" style={{ marginTop: '3rem' }}>
                      <Link href="/app" className="button-primary" style={{
                        display: 'inline-flex', alignItems: 'center', padding: '0.75rem 2rem',
                        backgroundColor: '#9333EA', color: 'white', borderRadius: '8px',
                        textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
                      }}>
                        Try It Free — No Credit Card
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Use Cases Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <h2>
                            Use Cases: When <span className="text-color-primary">AI + Excel</span> Changes Everything
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            Any scenario where AI needs to do real math is a use case for MCP + SpreadAPI.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Financial Modeling</h3>
                        <p className="text-size-medium">Loan calculators, mortgage quotes, ROI projections. AI uses your validated Excel model to give customers precise numbers — not approximations.</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Dynamic Pricing</h3>
                        <p className="text-size-medium">Insurance premiums, SaaS pricing tiers, wholesale discounts. Your pricing logic stays in Excel where your team maintains it. AI just calls it.</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Engineering Calculations</h3>
                        <p className="text-size-medium">Material stress analysis, load calculations, unit conversions. AI provides the interface, Excel provides the engineering precision.</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Tax &amp; Compliance</h3>
                        <p className="text-size-medium">Tax estimators, VAT calculators, regulatory calculations. Keep your compliance-validated spreadsheet as the single source of truth.</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Sales Quoting</h3>
                        <p className="text-size-medium">Let AI assistants generate accurate quotes by calling your Excel pricing model. No more manual lookups or copy-paste errors.</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Data Validation</h3>
                        <p className="text-size-medium">Cross-reference user inputs against your Excel models. AI validates data in real time using your business rules — no custom code needed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* MCP vs Traditional API */}
            <section className="section-home-feature" style={{ backgroundColor: '#F8F6FE' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <h2>
                            MCP vs. <span className="text-color-primary">Traditional API Integration</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F3F0FF' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}>Feature</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}>Traditional API</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #E8E0FF', color: '#9333EA' }}>MCP Server</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>Setup time</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>Hours to days</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF', fontWeight: 600, color: '#16A34A' }}>5 minutes</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>Code required</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>Custom integration code</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF', fontWeight: 600, color: '#16A34A' }}>Zero code</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>AI discovery</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>Manual documentation</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF', fontWeight: 600, color: '#16A34A' }}>Automatic</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>Works with</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>One specific AI tool</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF', fontWeight: 600, color: '#16A34A' }}>Any MCP client</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '1rem 1.5rem' }}>Maintenance</td>
                            <td style={{ padding: '1rem 1.5rem' }}>Update code when API changes</td>
                            <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#16A34A' }}>Update Excel, done</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Claude Desktop Setup Example */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            Example: <span className="text-color-primary">Claude Desktop</span> + Excel
                          </h2>
                        </div>
                        <p className="text-size-medium">
                          Here&apos;s what happens when Claude uses your Excel loan calculator via MCP. The AI asks your spreadsheet — not itself — for the answer.
                        </p>
                        <div style={{ marginTop: '2rem' }}>
                          <div className="feature-keypoint-list">
                            <div className="feature-keypoint-list-item">
                              <div className="check-icon-wrapper">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                  <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                                  <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <p className="text-size-medium">AI sends parameters to your Excel model</p>
                            </div>
                            <div className="feature-keypoint-list-item">
                              <div className="check-icon-wrapper">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                  <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                                  <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <p className="text-size-medium">Excel formulas calculate the real result</p>
                            </div>
                            <div className="feature-keypoint-list-item">
                              <div className="check-icon-wrapper">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                  <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                                  <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <p className="text-size-medium">AI presents the precise answer naturally</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div style={{ backgroundColor: '#F8F6FE', borderRadius: '16px', padding: '1.5rem' }}>
                          <div style={{ marginBottom: '1.25rem' }}>
                            <p style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.8rem', marginBottom: '0.5rem' }}>You ask Claude:</p>
                            <p style={{ backgroundColor: '#fff', padding: '0.875rem', borderRadius: '8px', borderLeft: '3px solid #9333EA', fontSize: '0.9rem' }}>
                              &ldquo;What would my monthly payment be for a $300,000 mortgage at 4.5% over 30 years?&rdquo;
                            </p>
                          </div>
                          <div style={{ marginBottom: '1.25rem' }}>
                            <p style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Claude calls your MCP Server:</p>
                            <pre style={{ backgroundColor: '#1E1E2E', color: '#CDD6F4', padding: '0.875rem', borderRadius: '8px', fontSize: '0.8rem', overflow: 'auto', margin: 0 }}>
{`spreadapi.execute({
  loan_amount: 300000,
  interest_rate: 0.045,
  years: 30
})`}
                            </pre>
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Claude responds with Excel&apos;s result:</p>
                            <p style={{ backgroundColor: '#F0FDF4', padding: '0.875rem', borderRadius: '8px', borderLeft: '3px solid #16A34A', fontSize: '0.9rem' }}>
                              &ldquo;Based on your loan calculator, your monthly payment would be <strong>$1,520.06</strong>. Over 30 years, you&apos;d pay $547,220.13 in total, of which $247,220.13 is interest.&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Related Resources */}
            <section className="section-home-feature" style={{ backgroundColor: '#F8F6FE' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-medium">
                    <div className="margin-bottom margin-medium">
                      <div className="text-align-center">
                        <h2>Learn More</h2>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                      <Link href="/blog/mcp-protocol-excel-developers-guide" style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF', transition: 'border-color 0.2s' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>MCP Protocol: Developer Guide</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Deep dive into setting up MCP with code examples and best practices.</p>
                      </Link>
                      <Link href="/blog/claude-desktop-excel-integration-complete-guide" style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF', transition: 'border-color 0.2s' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Claude Desktop + Excel Guide</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Step-by-step tutorial for connecting Claude Desktop to your spreadsheets.</p>
                      </Link>
                      <Link href="/excel-ai-integration" style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF', transition: 'border-color 0.2s' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Excel AI Integration Overview</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>See all the ways AI assistants can use your Excel calculations.</p>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <h2>Frequently Asked Questions</h2>
                      </div>
                    </div>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                      {mcpFAQs.map((faq, index) => (
                        <details key={index} style={{
                          borderBottom: '1px solid #E8E0FF',
                          padding: '1.25rem 0',
                        }}>
                          <summary style={{
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            listStyle: 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                            {faq.question}
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0, marginLeft: '1rem' }}>
                              <path d="M5 7.5L10 12.5L15 7.5" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </summary>
                          <p style={{ marginTop: '0.75rem', color: '#4B5563', lineHeight: 1.7 }}>
                            {faq.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section style={{ backgroundColor: '#9333EA', color: '#fff', textAlign: 'center' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem' }}>
                      Ready to Connect AI to Your Spreadsheets?
                    </h2>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
                      Set up your MCP Server in 5 minutes. Free tier available.
                    </p>
                    <Link href="/app" style={{
                      display: 'inline-flex', alignItems: 'center', padding: '1rem 2.5rem',
                      backgroundColor: '#fff', color: '#9333EA', borderRadius: '8px',
                      textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem',
                    }}>
                      Get Started Free
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <Footer locale={locale} currentPath="/mcp-server" />
        </div>
      </div>
    </>
  );
}

export default function MCPServerPage() {
  return <MCPServerContent />;
}
