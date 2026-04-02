import { Metadata } from 'next';
import '../../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import FAQSchema from '@/components/seo/FAQSchema';
import Link from 'next/link';

export const dynamic = 'force-static';

const vsFAQs = [
  {
    question: 'Is SpreadAPI faster than Google Sheets API?',
    answer: 'Yes. SpreadAPI responds in 50-200ms because the Excel engine stays warm in memory. Google Sheets API typically takes 2-5 seconds per request because it needs to open the spreadsheet file for each calculation.',
  },
  {
    question: 'Can I use my existing Excel files with SpreadAPI?',
    answer: 'Yes. Upload your .xlsx file as-is. Google Sheets API requires you to first convert your spreadsheet to Google Sheets format, which can break complex formulas and Excel-specific features.',
  },
  {
    question: 'What are Google Sheets API rate limits?',
    answer: 'Google Sheets API allows 60 read requests per minute per user and 300 requests per minute per project. SpreadAPI offers significantly higher limits depending on your plan, starting from 1,000 calls/month on the free tier.',
  },
  {
    question: 'Does SpreadAPI support AI integration?',
    answer: 'Yes. SpreadAPI includes MCP (Model Context Protocol) support, allowing AI assistants like ChatGPT and Claude to call your spreadsheet calculations directly. Google Sheets API has no built-in AI integration.',
  },
  {
    question: 'Which is cheaper for spreadsheet API use?',
    answer: 'SpreadAPI offers a free tier with 1 service. Google Sheets API is free but requires a Google Cloud project and has strict rate limits. For production use, SpreadAPI\'s pricing is typically lower when you factor in the infrastructure and rate limit costs of Google Sheets.',
  },
];

export const metadata: Metadata = {
  title: 'SpreadAPI vs Google Sheets API — Pricing, Features & Comparison',
  description: 'Detailed comparison of SpreadAPI and Google Sheets API. Compare pricing, rate limits, response times, Excel support, and AI integration. Find the right spreadsheet API for your project.',
  keywords: 'google sheets api pricing, google sheets api cost, spreadapi vs google sheets, spreadsheet api comparison, google sheets api alternative, google sheets api rate limit',
  openGraph: {
    title: 'SpreadAPI vs Google Sheets API: Which Spreadsheet API Is Right for You?',
    description: 'Compare pricing, speed, features, and limitations. Side-by-side analysis for developers.',
    type: 'article',
    url: 'https://spreadapi.io/vs/google-sheets-api',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.io/api/og?title=SpreadAPI%20vs%20Google%20Sheets%20API&description=Pricing%2C%20Features%20%26%20Comparison',
      width: 1200,
      height: 630,
      alt: 'SpreadAPI vs Google Sheets API Comparison',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpreadAPI vs Google Sheets API — Full Comparison',
    description: 'Compare pricing, speed, rate limits, and features. Which spreadsheet API is best?',
    site: '@spreadapi',
  },
  alternates: {
    canonical: 'https://spreadapi.io/vs/google-sheets-api',
    languages: {
      'en': 'https://spreadapi.io/vs/google-sheets-api',
      'de': 'https://spreadapi.io/de/vs/google-sheets-api',
      'x-default': 'https://spreadapi.io/vs/google-sheets-api',
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

export default function VsGoogleSheetsPage() {
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
        "name": "SpreadAPI vs Google Sheets API",
        "item": "https://spreadapi.io/vs/google-sheets-api",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FAQSchema faqs={vsFAQs} />

      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="vs" locale="en" />

          <main className="main-wrapper">
            {/* Hero */}
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
                                <div>Comparison Guide</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                SpreadAPI vs Google Sheets API: <span className="text-color-primary">Which Is Right for You?</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              Both let you use spreadsheets programmatically. But they solve different problems in very different ways. Here&apos;s an honest comparison to help you choose.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Quick Summary */}
            <section className="section-home-feature" style={{ backgroundColor: '#F8F6FE' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <h2>Quick Summary</h2>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #9333EA' }}>
                        <h3 style={{ color: '#9333EA', fontSize: '1.5rem', marginBottom: '1rem' }}>SpreadAPI</h3>
                        <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Best for: Using Excel calculations as API endpoints</p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#16A34A', fontWeight: 700 }}>+</span> Works with native .xlsx files</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#16A34A', fontWeight: 700 }}>+</span> 50-200ms response times</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#16A34A', fontWeight: 700 }}>+</span> MCP/AI integration built-in</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#16A34A', fontWeight: 700 }}>+</span> No Google account needed</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#DC2626', fontWeight: 700 }}>-</span> No real-time collaboration</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#DC2626', fontWeight: 700 }}>-</span> No data storage (calculation only)</li>
                        </ul>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Google Sheets API</h3>
                        <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Best for: Reading/writing data in Google Sheets</p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#16A34A', fontWeight: 700 }}>+</span> Free with Google account</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#16A34A', fontWeight: 700 }}>+</span> Real-time collaboration</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#16A34A', fontWeight: 700 }}>+</span> Huge ecosystem</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#16A34A', fontWeight: 700 }}>+</span> Data read/write capability</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#DC2626', fontWeight: 700 }}>-</span> 60 req/min rate limit</li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#DC2626', fontWeight: 700 }}>-</span> 2-5 second response times</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Detailed Comparison Table */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <h2>Detailed <span className="text-color-primary">Feature Comparison</span></h2>
                      </div>
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F3F0FF' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}>Feature</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, borderBottom: '2px solid #E8E0FF', color: '#9333EA' }}>SpreadAPI</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}>Google Sheets API</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ['Response time', '50-200ms', '2-5 seconds'],
                            ['Rate limits', 'Plan-based (generous)', '60 read/min, 300/project'],
                            ['File format', 'Native .xlsx', 'Google Sheets only'],
                            ['Setup complexity', 'Upload → Publish', 'GCP project, OAuth, scopes'],
                            ['Excel formula support', 'Full (500+ functions)', 'Partial (GSheets subset)'],
                            ['VLOOKUP / INDEX-MATCH', 'Full support', 'Google Sheets version only'],
                            ['AI / MCP integration', 'Built-in', 'Not available'],
                            ['Typed API schema', 'Auto-generated', 'Manual'],
                            ['On-premises option', 'Available', 'No'],
                            ['Pricing', 'Free tier + paid plans', 'Free (with GCP quotas)'],
                            ['Authentication', 'API key', 'OAuth 2.0 (complex)'],
                            ['Batch operations', 'Yes', 'Yes'],
                          ].map((row, i) => (
                            <tr key={i}>
                              <td style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #F3F0FF', fontWeight: 500 }}>{row[0]}</td>
                              <td style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #F3F0FF', textAlign: 'center' }}>{row[1]}</td>
                              <td style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #F3F0FF', textAlign: 'center' }}>{row[2]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing Comparison */}
            <section className="section-home-feature" style={{ backgroundColor: '#F8F6FE' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <h2>Pricing: <span className="text-color-primary">Google Sheets API Cost</span> vs SpreadAPI</h2>
                        <p className="text-size-medium margin-top margin-small" style={{ maxWidth: '700px', margin: '1rem auto 0' }}>
                          Google Sheets API is technically free, but the hidden costs add up when you need production reliability.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Google Sheets API</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: '#0a0a0a' }}>$0 <span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B7280' }}>but...</span></p>
                        <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#4B5563' }}>
                          <li>60 requests/min rate limit</li>
                          <li>Need Google Cloud project</li>
                          <li>Must convert Excel to GSheets</li>
                          <li>2-5s latency per request</li>
                          <li>No SLA for free tier</li>
                          <li>Quota increases require billing</li>
                        </ul>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #9333EA' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#9333EA' }}>SpreadAPI</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: '#9333EA' }}>Free <span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B7280' }}>to start</span></p>
                        <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#4B5563' }}>
                          <li>1 service on free tier</li>
                          <li>50-200ms response time</li>
                          <li>Native Excel support</li>
                          <li>AI/MCP included</li>
                          <li>Pro plans for more services</li>
                          <li><Link href="/pricing" style={{ color: '#9333EA' }}>See full pricing</Link></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* When to Choose Which */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <h2>When to Choose <span className="text-color-primary">Which</span></h2>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                        <h3 style={{ color: '#9333EA', marginBottom: '1rem' }}>Choose SpreadAPI when:</h3>
                        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#14532D' }}>
                          <li>You need Excel formulas as an API</li>
                          <li>Speed matters (sub-200ms)</li>
                          <li>You want AI/MCP integration</li>
                          <li>You already have .xlsx files</li>
                          <li>Your team maintains logic in Excel</li>
                          <li>You need on-premises deployment</li>
                        </ul>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Choose Google Sheets API when:</h3>
                        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#1E3A5F' }}>
                          <li>You need to read/write sheet data</li>
                          <li>Real-time collaboration is key</li>
                          <li>You&apos;re already in Google Workspace</li>
                          <li>Low request volume (under 60/min)</li>
                          <li>Latency isn&apos;t critical</li>
                          <li>You need Google Drive integration</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="section-home-feature" style={{ backgroundColor: '#F8F6FE' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <h2>Frequently Asked Questions</h2>
                      </div>
                    </div>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                      {vsFAQs.map((faq, index) => (
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

            {/* CTA */}
            <section style={{ backgroundColor: '#9333EA', color: '#fff', textAlign: 'center' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem' }}>
                      Ready to Try SpreadAPI?
                    </h2>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
                      Convert your first Excel spreadsheet to an API in 5 minutes. Free, no credit card.
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

          <Footer locale="en" currentPath="/vs/google-sheets-api" />
        </div>
      </div>
    </>
  );
}
