import { Metadata } from 'next';
import '../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import FAQSchema from '@/components/seo/FAQSchema';
import Link from 'next/link';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getExcelToApiTranslations } from '@/lib/translations/marketing';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Excel to API — Convert Spreadsheets to REST APIs in Minutes | SpreadAPI',
  description: 'Turn any Excel spreadsheet into a REST API. No coding required. Upload your .xlsx file, define inputs and outputs, and get a live API endpoint in minutes. Free tier available.',
  keywords: 'excel to api, excel api, convert excel to api, turn excel into api, spreadsheet to rest api, excel rest api, xlsx to api, excel web service, spreadsheet api',
  openGraph: {
    title: 'Excel to API: Turn Any Spreadsheet Into a REST API',
    description: 'Convert Excel spreadsheets to REST APIs in minutes. No coding. Upload, define, publish.',
    type: 'article',
    url: 'https://spreadapi.io/excel-to-api',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.io/api/og?title=Excel%20to%20API&description=Convert%20spreadsheets%20to%20REST%20APIs%20in%20minutes',
      width: 1200,
      height: 630,
      alt: 'Excel to API - SpreadAPI',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Excel to API — Convert Spreadsheets to REST APIs',
    description: 'Turn any Excel spreadsheet into a REST API in minutes. No coding required.',
    site: '@spreadapi',
  },
  alternates: {
    canonical: 'https://spreadapi.io/excel-to-api',
    languages: {
      'en': 'https://spreadapi.io/excel-to-api',
      'de': 'https://spreadapi.io/de/excel-to-api',
      'x-default': 'https://spreadapi.io/excel-to-api',
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

interface ExcelToApiPageProps {
  locale?: SupportedLocale;
}

export function ExcelToApiContent({ locale = 'en' }: ExcelToApiPageProps) {
  const t = getExcelToApiTranslations(locale);
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Convert an Excel Spreadsheet to a REST API",
    "description": "Turn any Excel file into a live REST API endpoint in 3 steps using SpreadAPI.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Upload your Excel file",
        "text": "Upload your .xlsx spreadsheet to SpreadAPI. All formulas, VLOOKUP, and calculations are preserved.",
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Define inputs and outputs",
        "text": "Select which cells accept input parameters and which cells return calculated results. Name them for your API.",
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Publish and call your API",
        "text": "Click publish. Your spreadsheet is now a live REST API. Send JSON requests and receive calculated results in 50-200ms.",
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
        "name": "Excel to API",
        "item": "https://spreadapi.io/excel-to-api",
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
          <Navigation currentPage="excel-to-api" locale={locale} />

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

            {/* The Problem */}
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                        <h3 style={{ color: '#DC2626', fontSize: '1.1rem', marginBottom: '0.75rem' }}>{t.problem.rewrite.title}</h3>
                        <p style={{ color: '#7F1D1D', fontSize: '0.95rem', lineHeight: 1.7 }}>
                          {t.problem.rewrite.description}
                        </p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                        <h3 style={{ color: '#DC2626', fontSize: '1.1rem', marginBottom: '0.75rem' }}>{t.problem.googleSheets.title}</h3>
                        <p style={{ color: '#7F1D1D', fontSize: '0.95rem', lineHeight: 1.7 }}>
                          {t.problem.googleSheets.description}
                        </p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                        <h3 style={{ color: '#DC2626', fontSize: '1.1rem', marginBottom: '0.75rem' }}>{t.problem.msGraph.title}</h3>
                        <p style={{ color: '#7F1D1D', fontSize: '0.95rem', lineHeight: 1.7 }}>
                          {t.problem.msGraph.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* The Solution: Step by Step */}
            <section id="how-it-works" className="section-home-workflow">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.howItWorks.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.howItWorks.title} <span className="text-color-primary">{t.howItWorks.titleHighlight}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="workflow-steps">
                      <div className="workflow-step">
                        <div className="workflow-step-number">1</div>
                        <div className="workflow-step-content">
                          <h3>{t.howItWorks.step1Title}</h3>
                          <p>{t.howItWorks.step1Desc}</p>
                        </div>
                      </div>

                      <div className="workflow-connector"></div>

                      <div className="workflow-step">
                        <div className="workflow-step-number">2</div>
                        <div className="workflow-step-content">
                          <h3>{t.howItWorks.step2Title}</h3>
                          <p>{t.howItWorks.step2Desc}</p>
                        </div>
                      </div>

                      <div className="workflow-connector"></div>

                      <div className="workflow-step">
                        <div className="workflow-step-number">3</div>
                        <div className="workflow-step-content">
                          <h3>{t.howItWorks.step3Title}</h3>
                          <p>{t.howItWorks.step3Desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Code Example */}
            <section className="section-home-feature" style={{ backgroundColor: '#F8F6FE' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <h2>
                            <span className="text-color-primary">{t.codeExample.title}</span> {t.codeExample.titleSuffix}
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            {t.codeExample.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ backgroundColor: '#1E1E2E', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#313244', color: '#CDD6F4', fontSize: '0.8rem', fontWeight: 600 }}>
                          {t.codeExample.requestLabel}
                        </div>
                        <pre style={{ padding: '1.5rem', color: '#CDD6F4', fontSize: '0.875rem', overflow: 'auto', margin: 0 }}>
{`curl -X GET \\
  "https://spreadapi.io/api/v1
    /services/loan_calc/execute" \\
  -d '{
    "loan_amount": 300000,
    "interest_rate": 0.045,
    "years": 30
  }'`}
                        </pre>
                      </div>

                      <div style={{ backgroundColor: '#1E1E2E', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#313244', color: '#CDD6F4', fontSize: '0.8rem', fontWeight: 600 }}>
                          {t.codeExample.responseLabel}
                        </div>
                        <pre style={{ padding: '1.5rem', color: '#CDD6F4', fontSize: '0.875rem', overflow: 'auto', margin: 0 }}>
{`{
  "outputs": {
    "monthly_payment": 1520.06,
    "total_interest": 247220.13,
    "total_paid": 547220.13
  },
  "metadata": {
    "executionTime": 12
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Comparison Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <h2>
                          {t.comparison.title} <span className="text-color-primary">{t.comparison.titleHighlight}</span>
                        </h2>
                      </div>
                    </div>

                    <div style={{ maxWidth: '900px', margin: '0 auto', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F3F0FF' }}>
                            {t.comparison.columns.map((col, i) => (
                              <th key={i} style={{ padding: '1rem', textAlign: i === 0 ? 'left' : 'center', fontWeight: 600, borderBottom: '2px solid #E8E0FF', ...(i === 1 ? { color: '#9333EA' } : {}) }}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {t.comparison.rows.map((row, i) => (
                            <tr key={i}>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F0FF', fontWeight: 500 }}>{row[0]}</td>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F0FF', textAlign: 'center', fontWeight: 600, color: '#16A34A' }}>{row[1]}</td>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F0FF', textAlign: 'center', color: '#6B7280' }}>{row[2]}</td>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F0FF', textAlign: 'center', color: '#6B7280' }}>{row[3]}</td>
                              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F0FF', textAlign: 'center', color: '#6B7280' }}>{row[4]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="text-align-center" style={{ marginTop: '2rem' }}>
                      <p className="text-size-medium" style={{ color: '#6B7280' }}>
                        {t.comparison.detailLink} <Link href={`${prefix}/vs/google-sheets-api`} style={{ color: '#9333EA', textDecoration: 'underline' }}>{t.comparison.detailLinkText}</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Who Uses This */}
            <section className="section-home-feature" style={{ backgroundColor: '#F8F6FE' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <h2>{t.whoUsesThis.title} <span className="text-color-primary">{t.whoUsesThis.titleHighlight}</span>?</h2>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.whoUsesThis.finance}</h3>
                        <p className="text-size-medium">{t.whoUsesThis.financeDesc}</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.whoUsesThis.developers}</h3>
                        <p className="text-size-medium">{t.whoUsesThis.developersDesc}</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.whoUsesThis.noCode}</h3>
                        <p className="text-size-medium">{t.whoUsesThis.noCodeDesc}</p>
                      </div>
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

            {/* Related Pages */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-medium">
                    <div className="margin-bottom margin-medium">
                      <div className="text-align-center">
                        <h2>{t.related.title}</h2>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                      <Link href={`${prefix}/mcp-server`} style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t.related.mcpServer}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>{t.related.mcpServerDesc}</p>
                      </Link>
                      <Link href={`${prefix}/how-excel-api-works`} style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t.related.howItWorks}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>{t.related.howItWorksDesc}</p>
                      </Link>
                      <Link href={`${prefix}/stop-rewriting-excel-in-code`} style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t.related.stopRewriting}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>{t.related.stopRewritingDesc}</p>
                      </Link>
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

          <Footer locale={locale} currentPath="/excel-to-api" />
        </div>
      </div>
    </>
  );
}

export default function ExcelToApiPage() {
  return <ExcelToApiContent />;
}
