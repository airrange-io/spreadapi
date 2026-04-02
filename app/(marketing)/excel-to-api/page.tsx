import { Metadata } from 'next';
import '../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import FAQSchema from '@/components/seo/FAQSchema';
import Link from 'next/link';

export const dynamic = 'force-static';

const excelToApiFAQs = [
  {
    question: 'How do I convert an Excel spreadsheet to an API?',
    answer: 'Upload your Excel file to SpreadAPI, define which cells are inputs and outputs, and click publish. Your spreadsheet is now available as a REST API endpoint that accepts JSON requests and returns calculated results.',
  },
  {
    question: 'Does SpreadAPI support all Excel formulas?',
    answer: 'SpreadAPI supports most Excel formulas including VLOOKUP, INDEX/MATCH, SUMIFS, financial functions (PMT, IRR, NPV), statistical functions, and complex nested formulas. Pivot tables and charts are also supported.',
  },
  {
    question: 'How is this different from Google Sheets API?',
    answer: 'Google Sheets API requires a Google account, has rate limits of 60 requests/minute, and requires you to rebuild your spreadsheets in Google Sheets format. SpreadAPI works with native Excel files, responds in 50-200ms, and supports complex Excel-only features like Power Query references.',
  },
  {
    question: 'Can I use my existing Excel files without modification?',
    answer: 'Yes. Upload your .xlsx file as-is. SpreadAPI runs your formulas server-side using a full Excel-compatible engine. No need to rewrite formulas or restructure your spreadsheet.',
  },
  {
    question: 'What about Microsoft Graph Excel API?',
    answer: 'Microsoft Graph requires an Office 365 subscription, Azure AD setup, and complex OAuth flows. Response times are typically 2-5 seconds. SpreadAPI is a simpler alternative: upload, define parameters, publish. No Microsoft account needed, 50-200ms response times.',
  },
  {
    question: 'Is there a free tier?',
    answer: 'Yes. The free tier includes 1 service (spreadsheet API) with up to 1,000 API calls per month. No credit card required to get started.',
  },
];

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

export default function ExcelToApiPage() {
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
      <FAQSchema faqs={excelToApiFAQs} />

      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="excel-to-api" locale="en" />

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
                                <div>No Coding Required</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                Excel to API: Turn Any Spreadsheet Into a <span className="text-color-primary">REST API</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              Your Excel spreadsheet already has the business logic. SpreadAPI turns it into a production-ready REST API — no developers needed, no formulas to rewrite, no accuracy to lose.
                            </p>
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <Link href="/app" className="button-primary" style={{
                                display: 'inline-flex', alignItems: 'center', padding: '0.75rem 2rem',
                                backgroundColor: '#9333EA', color: 'white', borderRadius: '8px',
                                textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
                              }}>
                                Convert Your Excel — Free
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

            {/* The Problem */}
            <section className="section-home-feature" style={{ backgroundColor: '#F8F6FE' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <h2>
                            The Problem: Excel Logic <span className="text-color-primary">Trapped in Spreadsheets</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            Your team spent months building complex Excel models — pricing calculators, financial projections, engineering formulas. Now your app needs those calculations. The traditional options are painful:
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                        <h3 style={{ color: '#DC2626', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Rewrite in Code</h3>
                        <p style={{ color: '#7F1D1D', fontSize: '0.95rem', lineHeight: 1.7 }}>
                          Weeks of developer time. Formulas get mistranslated. Business users can&apos;t update the logic without a code release.
                        </p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                        <h3 style={{ color: '#DC2626', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Google Sheets API</h3>
                        <p style={{ color: '#7F1D1D', fontSize: '0.95rem', lineHeight: 1.7 }}>
                          Requires rebuilding in Google Sheets. 60 req/min rate limit. 2-5 second response times. Missing Excel-only features.
                        </p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                        <h3 style={{ color: '#DC2626', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Microsoft Graph</h3>
                        <p style={{ color: '#7F1D1D', fontSize: '0.95rem', lineHeight: 1.7 }}>
                          Azure AD setup, complex OAuth, Office 365 subscription. Slow responses. Overkill for calculation APIs.
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
                              <div>3 Steps, 5 Minutes</div>
                            </div>
                          </div>
                          <h2>
                            How to Convert <span className="text-color-primary">Excel to API</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="workflow-steps">
                      <div className="workflow-step">
                        <div className="workflow-step-number">1</div>
                        <div className="workflow-step-content">
                          <h3>Upload Your .xlsx File</h3>
                          <p>Drag and drop your Excel file. SpreadAPI loads it into a server-side Excel engine that supports all formulas, VLOOKUP, INDEX/MATCH, pivot tables, and more. No conversion, no compatibility issues.</p>
                        </div>
                      </div>

                      <div className="workflow-connector"></div>

                      <div className="workflow-step">
                        <div className="workflow-step-number">2</div>
                        <div className="workflow-step-content">
                          <h3>Define Inputs &amp; Outputs</h3>
                          <p>Select cells that accept parameters (e.g., loan_amount, interest_rate) and cells that return results (e.g., monthly_payment, total_interest). SpreadAPI auto-generates a typed API schema.</p>
                        </div>
                      </div>

                      <div className="workflow-connector"></div>

                      <div className="workflow-step">
                        <div className="workflow-step-number">3</div>
                        <div className="workflow-step-content">
                          <h3>Publish &amp; Call Your API</h3>
                          <p>One click to publish. Your spreadsheet is now a live REST API. Call it from any language, any framework, any automation tool. Response time: 50-200ms.</p>
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
                            <span className="text-color-primary">Call Your API</span> From Anywhere
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            Your Excel API works with any HTTP client. Here&apos;s a loan calculator example:
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ backgroundColor: '#1E1E2E', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#313244', color: '#CDD6F4', fontSize: '0.8rem', fontWeight: 600 }}>
                          Request
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
                          Response (50-200ms)
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
                          SpreadAPI vs. <span className="text-color-primary">Alternatives</span>
                        </h2>
                      </div>
                    </div>

                    <div style={{ maxWidth: '900px', margin: '0 auto', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F3F0FF' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}></th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, borderBottom: '2px solid #E8E0FF', color: '#9333EA' }}>SpreadAPI</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}>Rewrite in Code</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}>Google Sheets</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}>MS Graph</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ['Setup time', '5 min', 'Weeks', 'Hours', 'Days'],
                            ['Uses your Excel file', 'Yes', 'No', 'No', 'Partially'],
                            ['Response time', '50-200ms', 'Varies', '2-5s', '2-5s'],
                            ['Rate limits', 'Generous', 'Custom', '60/min', '10,000/day'],
                            ['Formula accuracy', '100%', 'Risk of errors', '~95%', '100%'],
                            ['AI/MCP ready', 'Yes', 'Manual', 'No', 'No'],
                            ['Business users can update', 'Yes', 'No', 'Yes', 'Yes'],
                          ].map((row, i) => (
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
                        Want a detailed comparison? See <Link href="/vs/google-sheets-api" style={{ color: '#9333EA', textDecoration: 'underline' }}>SpreadAPI vs Google Sheets API</Link>
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
                        <h2>Who Converts <span className="text-color-primary">Excel to API</span>?</h2>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Finance Teams</h3>
                        <p className="text-size-medium">Pricing models, loan calculators, risk assessments. Keep the logic in Excel where analysts maintain it, expose results via API.</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Developers</h3>
                        <p className="text-size-medium">Skip weeks of formula rewriting. Get a REST API with typed inputs/outputs, OpenAPI spec, and batch execution support.</p>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>No-Code Builders</h3>
                        <p className="text-size-medium">Connect Excel calculations to Zapier, Make, n8n, or Bubble. Add powerful business logic to any automation workflow.</p>
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
                        <h2>Frequently Asked Questions</h2>
                      </div>
                    </div>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                      {excelToApiFAQs.map((faq, index) => (
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
                      Your Excel Already Works. Make It an API.
                    </h2>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
                      Upload your spreadsheet, define inputs and outputs, publish. Takes 5 minutes.
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

          <Footer locale="en" currentPath="/excel-to-api" />
        </div>
      </div>
    </>
  );
}
