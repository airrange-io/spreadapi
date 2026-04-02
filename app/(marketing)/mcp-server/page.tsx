import { Metadata } from 'next';
import '../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import FAQSchema from '@/components/seo/FAQSchema';
import Link from 'next/link';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getMCPServerTranslations } from '@/lib/translations/marketing';

export const dynamic = 'force-static';

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
  const t = getMCPServerTranslations(locale);
  const prefix = locale === 'en' ? '' : `/${locale}`;

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
      <FAQSchema faqs={t.faq.items.map(item => ({ question: item.question, answer: item.answer }))} />

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
                                <div>{t.hero.subheading}</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                {t.hero.title} <span className="text-color-primary">{t.hero.titleHighlight}</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              {t.hero.description}
                            </p>
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <Link href="/app" className="button-primary" style={{
                                display: 'inline-flex', alignItems: 'center', padding: '0.75rem 2rem',
                                backgroundColor: '#9333EA', color: 'white', borderRadius: '8px',
                                textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
                              }}>
                                {t.hero.ctaPrimary}
                              </Link>
                              <Link href={`${prefix}/how-excel-api-works`} style={{
                                display: 'inline-flex', alignItems: 'center', padding: '0.75rem 2rem',
                                border: '2px solid #E8E0FF', borderRadius: '8px',
                                textDecoration: 'none', fontWeight: 600, fontSize: '1rem', color: '#0a0a0a',
                              }}>
                                {t.hero.ctaSecondary}
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
                            {t.problem.title} <span className="text-color-primary">{t.problem.titleHighlight}</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            {t.problem.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                        <h3 style={{ color: '#DC2626', marginBottom: '0.75rem', fontSize: '1.25rem' }}>{t.problem.withoutMcp.title}</h3>
                        <p style={{ color: '#7F1D1D', lineHeight: 1.7 }}>
                          &ldquo;{t.problem.withoutMcp.question}&rdquo;
                        </p>
                        <p style={{ marginTop: '1rem', fontWeight: 600, color: '#DC2626' }}>
                          {t.problem.withoutMcp.result}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#991B1B', marginTop: '0.5rem' }}>
                          {t.problem.withoutMcp.note}
                        </p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                        <h3 style={{ color: '#16A34A', marginBottom: '0.75rem', fontSize: '1.25rem' }}>{t.problem.withMcp.title}</h3>
                        <p style={{ color: '#14532D', lineHeight: 1.7 }}>
                          {t.problem.withMcp.description}
                        </p>
                        <p style={{ marginTop: '1rem', fontWeight: 600, color: '#16A34A' }}>
                          {t.problem.withMcp.result}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.5rem' }}>
                          {t.problem.withMcp.note}
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
                            {t.whatIsMcp.title} <span className="text-color-primary">{t.whatIsMcp.titleHighlight}</span> {t.whatIsMcp.titleSuffix}
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            {t.whatIsMcp.description1}
                          </p>
                          <p className="text-size-medium" style={{ marginTop: '1rem' }}>
                            {t.whatIsMcp.description2}
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
                            <p className="text-size-medium"><strong>{t.whatIsMcp.point1}</strong> {t.whatIsMcp.point1Suffix}</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <p className="text-size-medium"><strong>{t.whatIsMcp.point2}</strong> {t.whatIsMcp.point2Suffix}</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <p className="text-size-medium"><strong>{t.whatIsMcp.point3}</strong> {t.whatIsMcp.point3Suffix}</p>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div style={{ backgroundColor: '#F8F6FE', borderRadius: '16px', padding: '2.5rem', position: 'relative' }}>
                          {/* MCP Architecture Diagram */}
                          <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label={t.whatIsMcp.diagramLabel}>
                            {/* AI Assistants */}
                            <rect x="20" y="20" width="140" height="50" rx="10" fill="#fff" stroke="#9333EA" strokeWidth="2"/>
                            <text x="90" y="50" textAnchor="middle" fill="#9333EA" fontSize="14" fontWeight="600">{t.whatIsMcp.diagramAiLabel}</text>

                            {/* Arrow down */}
                            <path d="M90 70 L90 110" stroke="#9333EA" strokeWidth="2" strokeDasharray="6,3"/>
                            <path d="M85 105 L90 115 L95 105" fill="#9333EA"/>
                            <text x="130" y="95" fill="#6B7280" fontSize="11">{t.whatIsMcp.diagramProtocol}</text>

                            {/* SpreadAPI MCP Server */}
                            <rect x="20" y="120" width="360" height="60" rx="12" fill="#9333EA" fillOpacity="0.1" stroke="#9333EA" strokeWidth="2"/>
                            <text x="200" y="147" textAnchor="middle" fill="#9333EA" fontSize="15" fontWeight="700">{t.whatIsMcp.diagramServer}</text>
                            <text x="200" y="167" textAnchor="middle" fill="#7C3AED" fontSize="11">{t.whatIsMcp.diagramServerDetail}</text>

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
                            <text x="100" y="237" textAnchor="middle" fill="#16A34A" fontSize="11" fontWeight="600">{t.whatIsMcp.diagramLoan}</text>
                            <text x="60" y="260" fill="#6B7280" fontSize="10">PMT(rate, n, pv)</text>
                            <text x="60" y="275" fill="#6B7280" fontSize="10">IRR(values)</text>
                            <text x="60" y="290" fill="#6B7280" fontSize="10">NPV(rate, ...)</text>

                            <rect x="180" y="220" width="120" height="80" rx="8" fill="#fff" stroke="#F59E0B" strokeWidth="2"/>
                            <rect x="180" y="220" width="120" height="24" rx="8" fill="#F59E0B" fillOpacity="0.1"/>
                            <text x="240" y="237" textAnchor="middle" fill="#D97706" fontSize="11" fontWeight="600">{t.whatIsMcp.diagramPricing}</text>
                            <text x="200" y="260" fill="#6B7280" fontSize="10">VLOOKUP(...)</text>
                            <text x="200" y="275" fill="#6B7280" fontSize="10">IF(tier, ...)</text>
                            <text x="200" y="290" fill="#6B7280" fontSize="10">SUMIFS(...)</text>

                            {/* Lock icon */}
                            <rect x="325" y="240" width="50" height="50" rx="25" fill="#9333EA" fillOpacity="0.1"/>
                            <path d="M350 255 L350 260 M342 260 L358 260 L358 275 L342 275 Z" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            <circle cx="350" cy="268" r="2" fill="#9333EA"/>
                            <text x="350" y="290" textAnchor="middle" fill="#7C3AED" fontSize="9">{t.whatIsMcp.diagramPrivate1}</text>
                            <text x="350" y="300" textAnchor="middle" fill="#7C3AED" fontSize="9">{t.whatIsMcp.diagramPrivate2}</text>
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
                              <div>{t.setup.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.setup.title} <span className="text-color-primary">{t.setup.titleHighlight}</span> {t.setup.titleSuffix}
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="workflow-steps">
                      <div className="workflow-step">
                        <div className="workflow-step-number">1</div>
                        <div className="workflow-step-content">
                          <h3>{t.setup.step1Title}</h3>
                          <p>{t.setup.step1Desc}</p>
                        </div>
                      </div>

                      <div className="workflow-connector"></div>

                      <div className="workflow-step">
                        <div className="workflow-step-number">2</div>
                        <div className="workflow-step-content">
                          <h3>{t.setup.step2Title}</h3>
                          <p>{t.setup.step2Desc}</p>
                        </div>
                      </div>

                      <div className="workflow-connector"></div>

                      <div className="workflow-step">
                        <div className="workflow-step-number">3</div>
                        <div className="workflow-step-content">
                          <h3>{t.setup.step3Title}</h3>
                          <p>{t.setup.step3Desc}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-align-center" style={{ marginTop: '3rem' }}>
                      <Link href="/app" className="button-primary" style={{
                        display: 'inline-flex', alignItems: 'center', padding: '0.75rem 2rem',
                        backgroundColor: '#9333EA', color: 'white', borderRadius: '8px',
                        textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
                      }}>
                        {t.setup.cta}
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
                            {t.useCases.title} <span className="text-color-primary">{t.useCases.titleHighlight}</span> {t.useCases.titleSuffix}
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            {t.useCases.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.useCases.financial}</h3>
                        <p className="text-size-medium">{t.useCases.financialDesc}</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.useCases.pricing}</h3>
                        <p className="text-size-medium">{t.useCases.pricingDesc}</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.useCases.engineering}</h3>
                        <p className="text-size-medium">{t.useCases.engineeringDesc}</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.useCases.tax}</h3>
                        <p className="text-size-medium">{t.useCases.taxDesc}</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.useCases.sales}</h3>
                        <p className="text-size-medium">{t.useCases.salesDesc}</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.useCases.validation}</h3>
                        <p className="text-size-medium">{t.useCases.validationDesc}</p>
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
                            {t.comparison.title} <span className="text-color-primary">{t.comparison.titleHighlight}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F3F0FF' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}>{t.comparison.feature}</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}>{t.comparison.traditional}</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #E8E0FF', color: '#9333EA' }}>{t.comparison.mcp}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>{t.comparison.setupTime}</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>{t.comparison.setupTraditional}</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF', fontWeight: 600, color: '#16A34A' }}>{t.comparison.setupMcp}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>{t.comparison.codeRequired}</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>{t.comparison.codeTraditional}</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF', fontWeight: 600, color: '#16A34A' }}>{t.comparison.codeMcp}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>{t.comparison.aiDiscovery}</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>{t.comparison.discoveryTraditional}</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF', fontWeight: 600, color: '#16A34A' }}>{t.comparison.discoveryMcp}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>{t.comparison.worksWith}</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF' }}>{t.comparison.worksTraditional}</td>
                            <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F0FF', fontWeight: 600, color: '#16A34A' }}>{t.comparison.worksMcp}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '1rem 1.5rem' }}>{t.comparison.maintenance}</td>
                            <td style={{ padding: '1rem 1.5rem' }}>{t.comparison.maintenanceTraditional}</td>
                            <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#16A34A' }}>{t.comparison.maintenanceMcp}</td>
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
                            {t.claudeExample.title} <span className="text-color-primary">{t.claudeExample.titleHighlight}</span> {t.claudeExample.titleSuffix}
                          </h2>
                        </div>
                        <p className="text-size-medium">
                          {t.claudeExample.description}
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
                              <p className="text-size-medium">{t.claudeExample.point1}</p>
                            </div>
                            <div className="feature-keypoint-list-item">
                              <div className="check-icon-wrapper">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                  <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                                  <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <p className="text-size-medium">{t.claudeExample.point2}</p>
                            </div>
                            <div className="feature-keypoint-list-item">
                              <div className="check-icon-wrapper">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                  <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                                  <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <p className="text-size-medium">{t.claudeExample.point3}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div style={{ backgroundColor: '#F8F6FE', borderRadius: '16px', padding: '1.5rem' }}>
                          <div style={{ marginBottom: '1.25rem' }}>
                            <p style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{t.claudeExample.youAsk}</p>
                            <p style={{ backgroundColor: '#fff', padding: '0.875rem', borderRadius: '8px', borderLeft: '3px solid #9333EA', fontSize: '0.9rem' }}>
                              &ldquo;{t.claudeExample.question}&rdquo;
                            </p>
                          </div>
                          <div style={{ marginBottom: '1.25rem' }}>
                            <p style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{t.claudeExample.claudeCalls}</p>
                            <pre style={{ backgroundColor: '#1E1E2E', color: '#CDD6F4', padding: '0.875rem', borderRadius: '8px', fontSize: '0.8rem', overflow: 'auto', margin: 0 }}>
{`spreadapi.execute({
  loan_amount: 300000,
  interest_rate: 0.045,
  years: 30
})`}
                            </pre>
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{t.claudeExample.claudeResponds}</p>
                            <p style={{ backgroundColor: '#F0FDF4', padding: '0.875rem', borderRadius: '8px', borderLeft: '3px solid #16A34A', fontSize: '0.9rem' }}>
                              &ldquo;{t.claudeExample.response}&rdquo;
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
                        <h2>{t.learnMore.title}</h2>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                      <Link href={`${prefix}/blog/mcp-protocol-excel-developers-guide`} style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF', transition: 'border-color 0.2s' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t.learnMore.devGuide}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>{t.learnMore.devGuideDesc}</p>
                      </Link>
                      <Link href={`${prefix}/blog/claude-desktop-excel-integration-complete-guide`} style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF', transition: 'border-color 0.2s' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t.learnMore.claudeGuide}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>{t.learnMore.claudeGuideDesc}</p>
                      </Link>
                      <Link href={`${prefix}/excel-to-api`} style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF', transition: 'border-color 0.2s' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t.learnMore.excelToApi}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>{t.learnMore.excelToApiDesc}</p>
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
                        <h2>{t.faq.title}</h2>
                      </div>
                    </div>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                      {t.faq.items.map((faq, index) => (
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
                      {t.cta.title}
                    </h2>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
                      {t.cta.description}
                    </p>
                    <Link href="/app" style={{
                      display: 'inline-flex', alignItems: 'center', padding: '1rem 2.5rem',
                      backgroundColor: '#fff', color: '#9333EA', borderRadius: '8px',
                      textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem',
                    }}>
                      {t.cta.button}
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
