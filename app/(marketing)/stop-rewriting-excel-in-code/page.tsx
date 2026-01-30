import { Metadata } from 'next';
import '../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getStopRewritingTranslations } from '@/lib/translations/marketing';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Stop Rewriting Excel in Code | SpreadAPI',
  description: 'Stop wasting months converting Excel spreadsheets to JavaScript. Turn your Excel models into APIs instantly. 100% accuracy, zero formula translation.',
  keywords: 'excel to code, convert excel to javascript, excel api, spreadsheet to code, excel business logic, stop reimplementing excel',
  openGraph: {
    title: 'Stop Rewriting Excel in Code - SpreadAPI',
    description: 'Your spreadsheet already works. Turn it into an API in minutes — not months.',
    type: 'article',
    url: 'https://spreadapi.io/stop-rewriting-excel-in-code',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.io/api/og?title=Stop%20Rewriting%20Excel%20in%20Code&description=Your%20spreadsheet%20already%20works.%20Turn%20it%20into%20an%20API.',
      width: 1200,
      height: 630,
      alt: 'Stop Rewriting Excel in Code',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stop Rewriting Excel in Code',
    description: 'Your spreadsheet already works. Turn it into an API in minutes — not months.',
  },
  alternates: {
    canonical: 'https://spreadapi.io/stop-rewriting-excel-in-code',
    languages: {
      'en': 'https://spreadapi.io/stop-rewriting-excel-in-code',
      'de': 'https://spreadapi.io/de/stop-rewriting-excel-in-code',
      'x-default': 'https://spreadapi.io/stop-rewriting-excel-in-code',
    },
  },
};

interface StopRewritingExcelContentProps {
  locale?: SupportedLocale;
}

export function StopRewritingExcelContent({ locale = 'en' }: StopRewritingExcelContentProps) {
  const t = getStopRewritingTranslations(locale);

  return (
    <>
      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="stop-rewriting-excel-in-code" locale={locale} />

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
                                {t.hero.title1} <span className="text-color-primary">{t.hero.title2}</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              {t.hero.description}
                            </p>
                            <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                              <a href="/app" className="button is-primary" style={{
                                flex: '1 1 auto',
                                textAlign: 'center',
                                background: '#502D80',
                                color: 'white',
                                padding: '14px 28px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '16px'
                              }}>
                                {t.hero.cta}
                              </a>
                              <a href="#how-it-works" style={{
                                flex: '1 1 auto',
                                textAlign: 'center',
                                padding: '14px 28px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '16px',
                                border: '2px solid #502D80',
                                color: '#502D80'
                              }}>
                                {t.hero.ctaSecondary}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="header-image-wrapper">
                        <div className="header-illustration">
                          <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="800" height="400" rx="8" fill="#F8F6FE"/>

                            {/* Excel spreadsheet on left */}
                            <rect x="50" y="120" width="180" height="160" rx="12" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
                            <rect x="65" y="135" width="150" height="22" fill="#F8F6FE"/>
                            <text x="140" y="150" textAnchor="middle" fill="#666" fontSize="10" fontWeight="500">Your Excel</text>
                            <rect x="65" y="168" width="150" height="16" fill="#E6F4FF"/>
                            <rect x="65" y="188" width="150" height="16" fill="#F8F6FE"/>
                            <rect x="65" y="208" width="150" height="16" fill="#E6F4FF"/>
                            <rect x="65" y="228" width="150" height="16" fill="#D4EDDA"/>
                            <text x="140" y="240" textAnchor="middle" fill="#28a745" fontSize="9">=formulas</text>
                            <text x="140" y="265" textAnchor="middle" fill="#28a745" fontSize="10" fontWeight="500">It works ✓</text>

                            {/* Arrow 1 */}
                            <path d="M250 200 L310 200" stroke="#9333EA" strokeWidth="3" strokeDasharray="5,5"/>
                            <path d="M300 190 L310 200 L300 210" stroke="#9333EA" strokeWidth="3" fill="none"/>

                            {/* Middle: Code rewrite crossed out */}
                            <rect x="330" y="130" width="140" height="140" rx="12" fill="white" stroke="#FFCDD2" strokeWidth="2"/>
                            <text x="400" y="160" textAnchor="middle" fill="#666" fontSize="10">Rewrite in code?</text>
                            <rect x="355" y="175" width="90" height="12" fill="#f5f5f5" rx="2"/>
                            <rect x="355" y="192" width="70" height="12" fill="#f5f5f5" rx="2"/>
                            <rect x="355" y="209" width="80" height="12" fill="#f5f5f5" rx="2"/>
                            <rect x="355" y="226" width="60" height="12" fill="#f5f5f5" rx="2"/>

                            {/* Red X */}
                            <line x1="345" y1="145" x2="455" y2="255" stroke="#F44336" strokeWidth="4" strokeLinecap="round"/>
                            <line x1="455" y1="145" x2="345" y2="255" stroke="#F44336" strokeWidth="4" strokeLinecap="round"/>

                            {/* Arrow 2 */}
                            <path d="M490 200 L550 200" stroke="#9333EA" strokeWidth="3" strokeDasharray="5,5"/>
                            <path d="M540 190 L550 200 L540 210" stroke="#9333EA" strokeWidth="3" fill="none"/>

                            {/* Right: Simple API */}
                            <rect x="570" y="120" width="180" height="160" rx="12" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
                            <text x="660" y="150" textAnchor="middle" fill="#666" fontSize="10" fontWeight="500">Just call the API</text>

                            <rect x="590" y="165" width="140" height="50" fill="#F8F6FE" rx="6"/>
                            <text x="660" y="185" textAnchor="middle" fill="#9333EA" fontSize="10" fontFamily="monospace">GET /api/calc</text>
                            <text x="660" y="202" textAnchor="middle" fill="#666" fontSize="9">?input=value</text>

                            <rect x="590" y="225" width="140" height="35" fill="#D4EDDA" rx="6"/>
                            <text x="660" y="248" textAnchor="middle" fill="#28a745" fontSize="11" fontWeight="500">→ Result ✓</text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* The Scenario Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            <span className="text-color-primary">{t.scenario.title1}</span>{t.scenario.title2}
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            {t.scenario.description1}
                          </p>
                          <p className="text-size-medium" style={{ marginTop: '16px' }}>
                            {t.scenario.description2}
                          </p>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div style={{
                          background: '#f8f9fa',
                          borderRadius: '12px',
                          padding: '32px',
                        }}>
                          <div style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            marginBottom: '16px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>PM</div>
                              <strong>{t.scenario.pmTitle}</strong>
                            </div>
                            <p style={{ margin: 0, color: '#333', fontStyle: 'italic' }}>
                              {t.scenario.pmText}
                            </p>
                          </div>
                          <div style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Dev</div>
                              <strong>{t.scenario.devTitle}</strong>
                            </div>
                            <p style={{ margin: 0, color: '#666' }}>
                              {t.scenario.devText}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Why It's Hard Section */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.complexity.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.complexity.title1} <span className="text-color-primary">{t.complexity.title2}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Formula Translation */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.complexity.card1.title}</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          {t.complexity.card1.description}
                        </p>
                        <div style={{ background: '#f8f8f8', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
                          <div style={{ color: '#666', marginBottom: '8px' }}>{t.complexity.card1.excelLabel}</div>
                          <code>=IF(B2&gt;1000, VLOOKUP(A2,Table,3)*0.9, VLOOKUP(A2,Table,2))</code>
                          <div style={{ color: '#666', marginTop: '12px', marginBottom: '8px' }}>{t.complexity.card1.jsLabel}</div>
                          <code style={{ color: '#dc2626' }}>{t.complexity.card1.jsCode}</code>
                        </div>
                      </div>

                      {/* Hidden Dependencies */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V8.625M13.5 3L19 8.625M13.5 3V8.625H19" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 13H15M9 17H12" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.complexity.card2.title}</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          {t.complexity.card2.description}
                        </p>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          {t.complexity.card2.list.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Excel-Specific Functions */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 3H5C3.89543 3 3 3.89543 3 5V9M9 3V7C9 8.10457 8.10457 9 7 9H3M9 3H15M3 9V15M21 9V5C21 3.89543 20.1046 3 19 3H15M21 9H17C15.8954 9 15 8.10457 15 7V3M21 9V15M3 15V19C3 20.1046 3.89543 21 5 21H9M3 15H7C8.10457 15 9 15.8954 9 17V21M21 15V19C21 20.1046 20.1046 21 19 21H15M21 15H17C15.8954 15 15 15.8954 15 17V21M9 21H15" stroke="#2563eb" strokeWidth="2"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.complexity.card3.title}</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          {t.complexity.card3.description}
                        </p>
                        <div style={{ background: '#f8f8f8', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
                          <code>=WORKDAY(TODAY(), 10, Holidays)</code>
                          <div style={{ color: '#666', marginTop: '8px', fontSize: '11px' }}>
                            {t.complexity.card3.note}
                          </div>
                        </div>
                      </div>

                      {/* The 1000 Formulas Problem */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="#db2777" strokeWidth="2"/>
                            <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="#db2777" strokeWidth="2"/>
                            <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="#db2777" strokeWidth="2"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.complexity.card4.title}</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          {t.complexity.card4.description}
                        </p>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          <strong>{locale === 'de' ? 'Echtes Beispiel:' : 'Real example:'}</strong> {t.complexity.card4.example}
                        </div>
                      </div>

                      {/* Edge Cases */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#9333ea" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.complexity.card5.title}</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          {t.complexity.card5.description}
                        </p>
                        <div style={{ fontSize: '14px', color: '#dc2626' }}>
                          {t.complexity.card5.warning}
                        </div>
                      </div>

                      {/* The Sync Problem */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.complexity.card6.title}</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          {t.complexity.card6.description}
                        </p>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {t.complexity.card6.cycle}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* The Real Cost Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.cost.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.cost.title1} <span className="text-color-primary">{t.cost.title2}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ background: '#fef2f2', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>{t.cost.stat1.value}</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>{t.cost.stat1.label}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{t.cost.stat1.description}</div>
                      </div>
                      <div style={{ background: '#fef2f2', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>{t.cost.stat2.value}</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>{t.cost.stat2.label}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{t.cost.stat2.description}</div>
                      </div>
                      <div style={{ background: '#fef2f2', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>{t.cost.stat3.value}</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>{t.cost.stat3.label}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{t.cost.stat3.description}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* The Insight / Solution Section */}
            <section id="how-it-works" className="section-home-feature" style={{ background: '#f8f6fe' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            {t.solution.title1} <span className="text-color-primary">{t.solution.title2}</span>
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium" style={{ fontSize: '20px', lineHeight: '1.6' }}>
                            {t.solution.description1}
                          </p>
                          <p className="text-size-medium" style={{ marginTop: '20px', fontSize: '20px', lineHeight: '1.6' }}>
                            <strong>{t.solution.description2}</strong>
                          </p>
                          <p className="text-size-medium" style={{ marginTop: '20px' }}>
                            {t.solution.description3}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.solution.badge1}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.solution.badge2}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.solution.badge3}</span>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8e8e8' }}>
                          <div style={{ background: '#1a1a1a', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                            <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>Before vs After</span>
                          </div>
                          <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '20px' }}>
                              <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>{t.solution.beforeLabel}</div>
                              <pre style={{ background: '#f8f8f8', padding: '12px', borderRadius: '6px', fontSize: '11px', overflow: 'auto', margin: 0, color: '#666' }}>
{`// 500+ lines trying to match Excel
class PricingCalculator {
  calculatePrice(product, qty, region) {
    // Implement VLOOKUP...
    // Handle discount tiers...
    // Apply regional rules...
    // Match Excel rounding...
    // Still doesn't match exactly
  }
}`}
                              </pre>
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600', marginBottom: '8px' }}>{t.solution.afterLabel}</div>
                              <pre style={{ background: '#f0fdf4', padding: '12px', borderRadius: '6px', fontSize: '11px', overflow: 'auto', margin: 0, border: '1px solid #bbf7d0' }}>
{`const price = await fetch(
  'https://spreadapi.io/api/v1/services/pricing/execute',
  { body: JSON.stringify({ product, qty, region }) }
).then(r => r.json());`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Separation of Concerns Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.separation.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.separation.title1} <span className="text-color-primary">{t.separation.title2}</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            {t.separation.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                      <div style={{ background: '#e8f5e9', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3H10V10H3V3ZM14 3H21V10H14V3ZM14 14H21V21H14V14ZM3 14H10V21H3V14Z" stroke="#22c55e" strokeWidth="2"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>{t.separation.role1.title}</h3>
                        <p style={{ color: '#166534', fontSize: '15px', marginBottom: '16px' }}>
                          {t.separation.role1.description}
                        </p>
                        <div style={{ fontSize: '13px', color: '#666', background: 'white', padding: '12px', borderRadius: '8px' }}>
                          {t.separation.role1.note}
                        </div>
                      </div>

                      <div style={{ background: '#e0e7ff', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>{t.separation.role2.title}</h3>
                        <p style={{ color: '#3730a3', fontSize: '15px', marginBottom: '16px' }}>
                          {t.separation.role2.description}
                        </p>
                        <div style={{ fontSize: '13px', color: '#666', background: 'white', padding: '12px', borderRadius: '8px' }}>
                          {t.separation.role2.note}
                        </div>
                      </div>

                      <div style={{ background: '#fef3c7', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21M20 8V14M23 11H17M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7Z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>{t.separation.role3.title}</h3>
                        <p style={{ color: '#92400e', fontSize: '15px', marginBottom: '16px' }}>
                          {t.separation.role3.description}
                        </p>
                        <div style={{ fontSize: '13px', color: '#666', background: 'white', padding: '12px', borderRadius: '8px' }}>
                          {t.separation.role3.note}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Who Benefits Section */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.benefits.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.benefits.title1} <span className="text-color-primary">{t.benefits.title2}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', maxWidth: '1100px', margin: '0 auto' }}>
                      {/* For Developers */}
                      <div style={{ background: 'white', padding: '36px', borderRadius: '16px', border: '1px solid #e8e8e8' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ background: '#e0e7ff', padding: '8px', borderRadius: '8px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          {t.benefits.developers.title}
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {[t.benefits.developers.point1, t.benefits.developers.point2, t.benefits.developers.point3, t.benefits.developers.point4].map((point, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 3 ? '16px' : 0 }}>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                                <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* For No-Code Builders */}
                      <div style={{ background: 'white', padding: '36px', borderRadius: '16px', border: '1px solid #e8e8e8' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ background: '#fce7f3', padding: '8px', borderRadius: '8px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          {t.benefits.nocode.title}
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {[t.benefits.nocode.point1, t.benefits.nocode.point2, t.benefits.nocode.point3, t.benefits.nocode.point4].map((point, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 3 ? '16px' : 0 }}>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                                <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </li>
                          ))}
                        </ul>
                      </div>
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
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.useCases.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.useCases.title1} <span className="text-color-primary">{t.useCases.title2}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                      {t.useCases.cases.map((item, index) => (
                        <div key={index} style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                          <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>{item.title}</h4>
                          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ / Objections Section */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <h2>
                            {t.faq.title1} <span className="text-color-primary">{t.faq.title2}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                      {t.faq.questions.map((item, index) => (
                        <div key={index} style={{ background: 'white', padding: '28px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e8e8e8' }}>
                          <h4 style={{ marginBottom: '12px', fontSize: '18px', color: '#333' }}>{item.q}</h4>
                          <p style={{ color: '#666', margin: 0, fontSize: '15px', lineHeight: '1.6' }}>{item.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Final CTA Section */}
            <section className="section-home-cta" style={{ background: 'linear-gradient(135deg, #502D80 0%, #7c3aed 100%)' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
                      <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '36px' }}>
                        {t.cta.title}
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px', lineHeight: '1.6' }}>
                        {t.cta.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="/app" style={{
                          background: 'white',
                          color: '#502D80',
                          padding: '16px 32px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          {t.cta.button}
                        </a>
                        <a href="/how-excel-api-works" style={{
                          background: 'transparent',
                          color: 'white',
                          padding: '16px 32px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px',
                          border: '2px solid white'
                        }}>
                          {t.cta.buttonSecondary}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <Footer locale={locale} currentPath="/stop-rewriting-excel-in-code" />
        </div>
      </div>
    </>
  );
}

export default function StopRewritingExcelPage() {
  return <StopRewritingExcelContent />;
}
