import { Metadata } from 'next';
import '../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getOnPremisesTranslations } from '@/lib/translations/marketing';

export const metadata: Metadata = {
  title: 'On-Premises & Enterprise | SpreadAPI',
  description: 'Deploy SpreadAPI in your own infrastructure. Full data sovereignty, zero external dependencies. Perfect for financial services, consulting firms, and regulated industries.',
  keywords: 'on-premises excel api, self-hosted spreadsheet, enterprise excel, data compliance, gdpr excel api, financial services excel',
  openGraph: {
    title: 'On-Premises & Enterprise - SpreadAPI',
    description: 'Your Excel calculations. Your infrastructure. Zero data leaves your network.',
    type: 'article',
    url: 'https://spreadapi.io/on-premises',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.io/api/og?title=On-Premises%20%26%20Enterprise&description=Your%20Excel%20calculations.%20Your%20infrastructure.',
      width: 1200,
      height: 630,
      alt: 'SpreadAPI On-Premises',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'On-Premises & Enterprise - SpreadAPI',
    description: 'Your Excel calculations. Your infrastructure. Zero data leaves your network.',
  },
  alternates: {
    canonical: 'https://spreadapi.io/on-premises',
    languages: {
      'en': 'https://spreadapi.io/on-premises',
      'de': 'https://spreadapi.io/de/on-premises',
      'x-default': 'https://spreadapi.io/on-premises',
    },
  },
};

interface OnPremisesContentProps {
  locale?: SupportedLocale;
}

export function OnPremisesContent({ locale = 'en' }: OnPremisesContentProps) {
  const t = getOnPremisesTranslations(locale);
  const whitepaperHref = locale === 'en' ? '/on-premises/whitepaper' : `/${locale}/on-premises/whitepaper`;

  return (
    <>
      <link rel="stylesheet" href="/fonts/satoshi-fixed.css" />
      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="on-premises" locale={locale} />

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
                                {t.hero.title1}<br /><span className="text-color-primary">{t.hero.title2}</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              {t.hero.description}
                            </p>
                            <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <a href="mailto:team@airrange.io?subject=SpreadAPI Enterprise Inquiry" className="button is-primary" style={{
                                background: '#502D80',
                                color: 'white',
                                padding: '14px 28px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '16px'
                              }}>
                                {t.hero.ctaPrimary}
                              </a>
                              <a href="#how-it-works" style={{
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
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Trust Badges */}
            <section style={{ background: '#f8f9fa', padding: '40px 0' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>{t.trustBadges.dataSovereignty}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>{t.trustBadges.zeroDependencies}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>{t.trustBadges.noCloud}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <path d="M8 21h8M12 17v4"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>{t.trustBadges.airGapped}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* The Problem Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.challenge.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.challenge.title1}<br /><span className="text-color-primary">{t.challenge.title2}</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            {t.challenge.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ background: '#fef2f2', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#991b1b' }}>{t.challenge.complianceRisk}</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          {t.challenge.complianceRiskDesc}
                        </p>
                      </div>
                      <div style={{ background: '#fef2f2', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#991b1b' }}>{t.challenge.monthsDev}</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          {t.challenge.monthsDevDesc}
                        </p>
                      </div>
                      <div style={{ background: '#fef2f2', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#991b1b' }}>{t.challenge.noScalability}</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          {t.challenge.noScalabilityDesc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="section-home-feature" style={{ background: '#f8f6fe' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.solution.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.solution.title1}<br /><span className="text-color-primary">{t.solution.title2}</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            {t.solution.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Architecture Diagram */}
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '2px solid #E8E0FF' }}>
                        {/* Step 1 */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '40px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#9333EA',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '20px',
                            flexShrink: 0
                          }}>1</div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>{t.solution.step1Title}</h3>
                            <p style={{ color: '#666', marginBottom: '16px' }}>
                              {t.solution.step1Desc}
                              <strong style={{ color: '#22c55e' }}>{t.solution.step1Highlight}</strong>
                            </p>
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                <path d="M22 4L12 14.01l-3-3"/>
                              </svg>
                              <span style={{ color: '#166534', fontSize: '14px' }}>{t.solution.step1Notice}</span>
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                          <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
                            <path d="M12 0v40M12 40l-8-8M12 40l8-8" stroke="#9333EA" strokeWidth="2"/>
                          </svg>
                        </div>

                        {/* Step 2 */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '40px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#9333EA',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '20px',
                            flexShrink: 0
                          }}>2</div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>{t.solution.step2Title}</h3>
                            <p style={{ color: '#666', marginBottom: '16px' }}>
                              {t.solution.step2Desc}
                              <strong style={{ color: '#22c55e' }}>{t.solution.step2Highlight}</strong>
                            </p>
                            <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#666' }}>
                              <span style={{ color: '#9333EA' }}>tax-calculator_runtime.json</span> (184 KB)
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                          <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
                            <path d="M12 0v40M12 40l-8-8M12 40l8-8" stroke="#9333EA" strokeWidth="2"/>
                          </svg>
                        </div>

                        {/* Step 3 */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#9333EA',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '20px',
                            flexShrink: 0
                          }}>3</div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>{t.solution.step3Title}</h3>
                            <p style={{ color: '#666', marginBottom: '16px' }}>
                              {t.solution.step3Desc}
                              <strong style={{ color: '#22c55e' }}>{t.solution.step3Highlight}</strong>
                            </p>
                            <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#e5e5e5' }}>
                              <div style={{ color: '#888', marginBottom: '8px' }}>{t.solution.deployComment}</div>
                              <div><span style={{ color: '#22c55e' }}>$</span> docker run -p 3001:3001 spreadapi/runtime</div>
                              <div style={{ color: '#888', marginTop: '8px' }}>{t.solution.apiReadyComment}</div>
                              <div><span style={{ color: '#9333EA' }}>http://internal.company.com:3001/api/execute/tax-calculator</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Flow Diagram */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.dataFlow.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.dataFlow.title1}<br /><span className="text-color-primary">{t.dataFlow.title2}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Visual Data Flow */}
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        borderRadius: '16px',
                        padding: '40px',
                        border: '2px solid #bbf7d0'
                      }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#166534',
                            color: 'white',
                            padding: '8px 20px',
                            borderRadius: '100px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            {t.dataFlow.badge}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'center' }}>
                          {/* Your Systems */}
                          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                              <rect x="2" y="3" width="20" height="14" rx="2"/>
                              <path d="M8 21h8M12 17v4"/>
                            </svg>
                            <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>{t.dataFlow.yourApps}</h4>
                            <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{t.dataFlow.yourAppsDesc}</p>
                          </div>

                          {/* Arrows */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="100" height="24" viewBox="0 0 100 24" fill="none">
                              <path d="M0 12h90M90 12l-8-8M90 12l-8 8" stroke="#166534" strokeWidth="2"/>
                            </svg>
                            <span style={{ fontSize: '12px', color: '#166534', fontWeight: '500' }}>{t.dataFlow.restApi}</span>
                            <svg width="100" height="24" viewBox="0 0 100 24" fill="none">
                              <path d="M100 12H10M10 12l8-8M10 12l8 8" stroke="#166534" strokeWidth="2"/>
                            </svg>
                          </div>

                          {/* SpreadAPI Runtime */}
                          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '2px solid #9333EA' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <path d="M3 9h18M9 21V9"/>
                            </svg>
                            <h4 style={{ marginBottom: '8px', fontSize: '16px', color: '#9333EA' }}>{t.dataFlow.runtime}</h4>
                            <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{t.dataFlow.runtimeDesc}</p>
                          </div>
                        </div>

                        <div style={{
                          marginTop: '32px',
                          padding: '20px',
                          background: 'rgba(255,255,255,0.7)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '48px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', color: '#166534' }}>{t.dataFlow.noExtDb}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', color: '#166534' }}>{t.dataFlow.noOutbound}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', color: '#166534' }}>{t.dataFlow.worksOffline}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Enterprise Mode Feature */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            {t.enterpriseMode.title1}<br /><span className="text-color-primary">{t.enterpriseMode.title2}</span>
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium" dangerouslySetInnerHTML={{ __html: t.enterpriseMode.desc1 }} />
                          <p className="text-size-medium" style={{ marginTop: '16px' }}>
                            {t.enterpriseMode.desc2}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.enterpriseMode.badge1}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.enterpriseMode.badge2}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.enterpriseMode.badge3}</span>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8e8e8' }}>
                          <div style={{ background: '#1a1a1a', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                            <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>{t.enterpriseMode.mockTitle}</span>
                          </div>
                          <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span style={{ color: '#166534', fontWeight: '600' }}>{t.enterpriseMode.importExcel}</span>
                              </div>
                              <span style={{ fontSize: '13px', color: '#666' }}>{t.enterpriseMode.browserMemory}</span>
                            </div>
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span style={{ color: '#166534', fontWeight: '600' }}>{t.enterpriseMode.configureTest}</span>
                              </div>
                              <span style={{ fontSize: '13px', color: '#666' }}>{t.enterpriseMode.browserMemory}</span>
                            </div>
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span style={{ color: '#166534', fontWeight: '600' }}>{t.enterpriseMode.exportRuntime}</span>
                              </div>
                              <span style={{ fontSize: '13px', color: '#666' }}>{t.enterpriseMode.downloadsDisk}</span>
                            </div>
                            <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', opacity: 0.6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path d="M6 6l8 8M14 6l-8 8" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <span style={{ color: '#991b1b', fontWeight: '600', textDecoration: 'line-through' }}>{t.enterpriseMode.saveToCloud}</span>
                              </div>
                              <span style={{ fontSize: '13px', color: '#991b1b' }}>{t.enterpriseMode.disabledLabel}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Specs */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.techSpecs.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.techSpecs.title1}<br /><span className="text-color-primary">{t.techSpecs.title2}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Deployment */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.techSpecs.deployment}</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          {t.techSpecs.deploymentItems.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>

                      {/* Performance */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.techSpecs.performance}</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          {t.techSpecs.performanceItems.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>

                      {/* Excel Compatibility */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M3 9h18M9 21V9"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.techSpecs.excelCompat}</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          {t.techSpecs.excelCompatItems.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>

                      {/* Security */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.techSpecs.security}</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          {t.techSpecs.securityItems.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>

                      {/* Requirements */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                            <rect x="4" y="4" width="16" height="16" rx="2"/>
                            <path d="M9 9h6v6H9z"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.techSpecs.requirements}</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          {t.techSpecs.requirementsItems.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>

                      {/* API */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                            <path d="M16 18L22 12L16 6M8 6L2 12L8 18"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>{t.techSpecs.restApi}</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          {t.techSpecs.restApiItems.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Use Cases */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
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
                            {t.useCases.title1}<br /><span className="text-color-primary">{t.useCases.title2}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Financial Services */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M3 9h18M9 21V9"/>
                            <path d="M15 15h.01M15 12h.01"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>{t.useCases.financial}</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{t.useCases.financialDesc}</p>
                      </div>

                      {/* Consulting Firms */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="1.5">
                            <path d="M3 3v18h18"/>
                            <path d="M18 17V9M13 17V5M8 17v-3"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>{t.useCases.consulting}</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{t.useCases.consultingDesc}</p>
                      </div>

                      {/* Healthcare */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="1.5">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>{t.useCases.healthcare}</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{t.useCases.healthcareDesc}</p>
                      </div>

                      {/* Insurance */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>{t.useCases.insurance}</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{t.useCases.insuranceDesc}</p>
                      </div>

                      {/* Manufacturing */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5">
                            <path d="M2 20h20M5 20V8l5-4 5 4v12"/>
                            <path d="M15 20v-8h5v8M10 12h.01M10 16h.01"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>{t.useCases.manufacturing}</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{t.useCases.manufacturingDesc}</p>
                      </div>

                      {/* Tax & Compliance */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>{t.useCases.tax}</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{t.useCases.taxDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Whitepaper CTA */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div style={{
                      maxWidth: '800px',
                      margin: '0 auto',
                      background: 'linear-gradient(135deg, #f8f6fe 0%, #e8e0ff 100%)',
                      borderRadius: '16px',
                      padding: '48px',
                      textAlign: 'center'
                    }}>
                      <div style={{ marginBottom: '20px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                        </svg>
                      </div>
                      <h3 style={{ marginBottom: '12px', fontSize: '24px' }}>{t.whitepaper.title}</h3>
                      <p style={{ color: '#666', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                        {t.whitepaper.description}
                      </p>
                      <a href={whitepaperHref} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 28px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '16px',
                        border: '2px solid #9333EA',
                        color: '#9333EA'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                        </svg>
                        {t.whitepaper.cta}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Final CTA */}
            <section className="section-home-cta" style={{ background: 'linear-gradient(135deg, #502D80 0%, #7c3aed 100%)' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
                      <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '36px' }}>
                        {t.finalCta.title}
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px', lineHeight: '1.6' }}>
                        {t.finalCta.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="mailto:team@airrange.io?subject=SpreadAPI Enterprise Inquiry" style={{
                          background: 'white',
                          color: '#502D80',
                          padding: '16px 32px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          {t.finalCta.ctaPrimary}
                        </a>
                        <a href="/app" style={{
                          background: 'transparent',
                          color: 'white',
                          padding: '16px 32px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px',
                          border: '2px solid white'
                        }}>
                          {t.finalCta.ctaSecondary}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <Footer locale={locale} currentPath="/on-premises" />
        </div>
      </div>
    </>
  );
}

export default function OnPremisesPage() {
  return <OnPremisesContent locale="en" />;
}
