import { Metadata } from 'next';
import '../../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import FAQSchema from '@/components/seo/FAQSchema';
import Link from 'next/link';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getVsGoogleSheetsTranslations } from '@/lib/translations/marketing-new-pages';

export const dynamic = 'force-static';

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

interface VsGoogleSheetsPageProps {
  locale?: SupportedLocale;
}

export default function VsGoogleSheetsPage({ locale = 'en' }: VsGoogleSheetsPageProps) {
  const t = getVsGoogleSheetsTranslations(locale);
  const prefix = locale === 'en' ? '' : `/${locale}`;

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
      <FAQSchema faqs={t.faqs} />

      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="vs" locale={locale} />

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
                        <h2>{t.quickSummary.title}</h2>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #9333EA' }}>
                        <h3 style={{ color: '#9333EA', fontSize: '1.5rem', marginBottom: '1rem' }}>{t.quickSummary.spreadapi.name}</h3>
                        <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{t.quickSummary.spreadapi.bestFor}</p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {t.quickSummary.spreadapi.pros.map((item, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#16A34A', fontWeight: 700 }}>+</span> {item}</li>
                          ))}
                          {t.quickSummary.spreadapi.cons.map((item, i) => (
                            <li key={`c${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#DC2626', fontWeight: 700 }}>-</span> {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #E8E0FF' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t.quickSummary.googleSheets.name}</h3>
                        <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{t.quickSummary.googleSheets.bestFor}</p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {t.quickSummary.googleSheets.pros.map((item, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#16A34A', fontWeight: 700 }}>+</span> {item}</li>
                          ))}
                          {t.quickSummary.googleSheets.cons.map((item, i) => (
                            <li key={`c${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span style={{ color: '#DC2626', fontWeight: 700 }}>-</span> {item}</li>
                          ))}
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
                        <h2>{t.comparison.title} <span className="text-color-primary">{t.comparison.titleHighlight}</span></h2>
                      </div>
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F3F0FF' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}>{t.comparison.headers.feature}</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, borderBottom: '2px solid #E8E0FF', color: '#9333EA' }}>{t.comparison.headers.spreadapi}</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, borderBottom: '2px solid #E8E0FF' }}>{t.comparison.headers.googleSheets}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {t.comparison.rows.map((row, i) => (
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
                        <h2>{t.pricing.title} <span className="text-color-primary">{t.pricing.titleHighlight}</span> {t.pricing.titleSuffix}</h2>
                        <p className="text-size-medium margin-top margin-small" style={{ maxWidth: '700px', margin: '1rem auto 0' }}>
                          {t.pricing.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E0FF' }}>
                        <h3 style={{ marginBottom: '1rem' }}>{t.pricing.googleSheets.name}</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: '#0a0a0a' }}>{t.pricing.googleSheets.price} <span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B7280' }}>{t.pricing.googleSheets.priceSuffix}</span></p>
                        <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#4B5563' }}>
                          {t.pricing.googleSheets.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #9333EA' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#9333EA' }}>{t.pricing.spreadapi.name}</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: '#9333EA' }}>{t.pricing.spreadapi.price} <span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B7280' }}>{t.pricing.spreadapi.priceSuffix}</span></p>
                        <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#4B5563' }}>
                          {t.pricing.spreadapi.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                          <li><Link href={`${prefix}/pricing`} style={{ color: '#9333EA' }}>{t.pricing.spreadapi.seeFullPricing}</Link></li>
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
                        <h2>{t.whenToChoose.title} <span className="text-color-primary">{t.whenToChoose.titleHighlight}</span></h2>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ padding: '2rem', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                        <h3 style={{ color: '#9333EA', marginBottom: '1rem' }}>{t.whenToChoose.spreadapi.title}</h3>
                        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#14532D' }}>
                          {t.whenToChoose.spreadapi.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ padding: '2rem', backgroundColor: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                        <h3 style={{ marginBottom: '1rem' }}>{t.whenToChoose.googleSheets.title}</h3>
                        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#1E3A5F' }}>
                          {t.whenToChoose.googleSheets.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
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
                        <h2>{t.faqTitle}</h2>
                      </div>
                    </div>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                      {t.faqs.map((faq, index) => (
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

          <Footer locale={locale} currentPath="/vs/google-sheets-api" />
        </div>
      </div>
    </>
  );
}
