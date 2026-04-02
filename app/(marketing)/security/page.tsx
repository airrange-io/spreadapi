import { Metadata } from 'next';
import '../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getSecurityTranslations } from '@/lib/translations/marketing-new-pages';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Security & Compliance | SpreadAPI',
  description: 'Learn how SpreadAPI protects your data. Built on certified infrastructure, minimal data storage, GDPR compliance, and on-premises options for regulated industries.',
  keywords: 'spreadapi security, data protection, soc 2, gdpr compliance, hipaa, enterprise security, data encryption, api security',
  openGraph: {
    title: 'Security & Compliance - SpreadAPI',
    description: 'Security-focused by design with minimal data footprint. Built on certified infrastructure, your formulas stay private.',
    type: 'article',
    url: 'https://spreadapi.io/security',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.io/api/og?title=Security%20%26%20Compliance&description=Enterprise-grade%20security%20with%20minimal%20data%20footprint',
      width: 1200,
      height: 630,
      alt: 'SpreadAPI Security & Compliance',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Security & Compliance - SpreadAPI',
    description: 'Security-focused by design. Built on certified infrastructure with minimal data footprint.',
  },
  alternates: {
    canonical: 'https://spreadapi.io/security',
    languages: {
      'en': 'https://spreadapi.io/security',
      'de': 'https://spreadapi.io/de/security',
      'x-default': 'https://spreadapi.io/security',
    },
  },
};

interface SecurityPageProps {
  locale?: SupportedLocale;
}

export function SecurityContent({ locale = 'en' }: SecurityPageProps) {
  const t = getSecurityTranslations(locale);

  return (
    <>
      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="docs" locale={locale} />

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
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>{t.trustBadges.soc2}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>{t.trustBadges.iso27001}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>{t.trustBadges.tls}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>{t.trustBadges.gdpr}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Our Approach */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.approach.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.approach.title} <span className="text-color-primary">{t.approach.titleHighlight}</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            {t.approach.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ background: '#f0fdf4', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#166534' }}>{t.approach.emailOnly.title}</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          {t.approach.emailOnly.text}
                        </p>
                      </div>
                      <div style={{ background: '#f0fdf4', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#166534' }}>{t.approach.cache.title}</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          {t.approach.cache.text}
                        </p>
                      </div>
                      <div style={{ background: '#f0fdf4', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#166534' }}>{t.approach.formulas.title}</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          {t.approach.formulas.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Infrastructure Security */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.infrastructure.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.infrastructure.title} <span className="text-color-primary">{t.infrastructure.titleHighlight}</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            {t.infrastructure.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Vercel */}
                      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 19.5h20L12 2z" fill="#000"/>
                          </svg>
                          {t.infrastructure.vercel.name}
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                          {t.infrastructure.vercel.description}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {t.infrastructure.vercel.badges.map((badge, i) => (
                            <span key={i} style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>{badge}</span>
                          ))}
                        </div>
                      </div>

                      {/* Redis */}
                      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#DC382D"/>
                          </svg>
                          {t.infrastructure.redis.name}
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                          {t.infrastructure.redis.description}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {t.infrastructure.redis.badges.map((badge, i) => (
                            <span key={i} style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>{badge}</span>
                          ))}
                        </div>
                      </div>

                      {/* Hanko */}
                      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97757" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                          </svg>
                          {t.infrastructure.hanko.name}
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                          {t.infrastructure.hanko.description}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {t.infrastructure.hanko.badges.map((badge, i) => (
                            <span key={i} style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>{badge}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Authentication & Encryption */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Authentication */}
                      <div>
                        <div className="margin-bottom margin-small">
                          <div className="subheading">
                            <div>{t.authentication.subheading}</div>
                          </div>
                        </div>
                        <h3 style={{ marginBottom: '16px' }}>{t.authentication.title} <span className="text-color-primary">{t.authentication.titleHighlight}</span></h3>
                        <p style={{ color: '#666', marginBottom: '24px' }}>
                          {t.authentication.description}
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {t.authentication.items.map((item, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                <path d="M9 12l2 2 4-4"/>
                                <circle cx="12" cy="12" r="10"/>
                              </svg>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Encryption */}
                      <div>
                        <div className="margin-bottom margin-small">
                          <div className="subheading">
                            <div>{t.encryption.subheading}</div>
                          </div>
                        </div>
                        <h3 style={{ marginBottom: '16px' }}>{t.encryption.title} <span className="text-color-primary">{t.encryption.titleHighlight}</span></h3>
                        <p style={{ color: '#666', marginBottom: '24px' }}>
                          {t.encryption.description}
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {t.encryption.items.map((item, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                <path d="M9 12l2 2 4-4"/>
                                <circle cx="12" cy="12" r="10"/>
                              </svg>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Compliance */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.compliance.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.compliance.title} <span className="text-color-primary">{t.compliance.titleHighlight}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                      {/* GDPR */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 16v-4M12 8h.01"/>
                          </svg>
                          {t.compliance.gdpr.title}
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          {t.compliance.gdpr.text}
                        </p>
                      </div>

                      {/* HIPAA */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                          </svg>
                          {t.compliance.healthcare.title}
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          {t.compliance.healthcare.text}
                        </p>
                      </div>

                      {/* SOC 2 */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="M9 12l2 2 4-4"/>
                          </svg>
                          {t.compliance.certifiedProviders.title}
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          {t.compliance.certifiedProviders.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* On-Premises Option */}
            <section className="section-home-feature" style={{ background: 'linear-gradient(135deg, #502D80 0%, #7c3aed 100%)' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
                      <div>
                        <div className="margin-bottom margin-xsmall">
                          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {t.onPremises.subheading}
                          </div>
                        </div>
                        <h2 style={{ color: 'white', marginBottom: '16px' }}>
                          {t.onPremises.title}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '24px', fontSize: '18px' }}>
                          {t.onPremises.description}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <a href="/on-premises" style={{
                            background: 'white',
                            color: '#502D80',
                            padding: '14px 28px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '16px'
                          }}>
                            {t.onPremises.ctaPrimary}
                          </a>
                          <a href="mailto:team@airrange.io?subject=Enterprise Security Inquiry" style={{
                            background: 'transparent',
                            color: 'white',
                            padding: '14px 28px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '16px',
                            border: '2px solid white'
                          }}>
                            {t.onPremises.ctaSecondary}
                          </a>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                          <div>
                            <div style={{ color: 'white', fontWeight: '600' }}>{t.onPremises.features.infrastructure.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{t.onPremises.features.infrastructure.text}</div>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2"/>
                            <path d="M8 21h8M12 17v4"/>
                          </svg>
                          <div>
                            <div style={{ color: 'white', fontWeight: '600' }}>{t.onPremises.features.airGap.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{t.onPremises.features.airGap.text}</div>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                          <div>
                            <div style={{ color: 'white', fontWeight: '600' }}>{t.onPremises.features.zeroVendor.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{t.onPremises.features.zeroVendor.text}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-medium">
                  <div className="padding-section-large">
                    <div className="text-align-center">
                      <div className="margin-bottom margin-small">
                        <h2>
                          {t.contact.title} <span className="text-color-primary">{t.contact.titleHighlight}</span>
                        </h2>
                      </div>
                      <p className="text-size-medium" style={{ marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
                        {t.contact.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="mailto:team@airrange.io?subject=Security Inquiry" style={{
                          background: '#502D80',
                          color: 'white',
                          padding: '14px 28px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          {t.contact.ctaPrimary}
                        </a>
                        <a href="/docs" style={{
                          background: 'transparent',
                          color: '#502D80',
                          padding: '14px 28px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px',
                          border: '2px solid #502D80'
                        }}>
                          {t.contact.ctaSecondary}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <Footer locale={locale} currentPath="/security" />
        </div>
      </div>
    </>
  );
}

export default function SecurityPage() {
  return <SecurityContent />;
}
