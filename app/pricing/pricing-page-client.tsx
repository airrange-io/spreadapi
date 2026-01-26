'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/product/Footer';
import '../(marketing)/product.css';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getPricingTranslations } from '@/lib/translations/marketing';

interface PricingPageClientProps {
  locale?: SupportedLocale;
}

export default function PricingPageClient({ locale = 'en' }: PricingPageClientProps) {
  const t = getPricingTranslations(locale);
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const checkIcon = (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="pricing" locale={locale} />

          <main className="main-wrapper">
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
                                <div>{t.header.subheading}</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                {t.header.title} <span className="text-color-primary">{t.header.titleHighlight}</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '600px', margin: '0 auto' }}>
                              {t.header.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Pricing Plans */}
            <section style={{ padding: '80px 20px', background: '#f8f9fa' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '30px',
                  marginTop: '60px'
                }}>
                  {/* FREE Plan */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '40px 30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937' }}>{t.free.name}</h3>
                    <div style={{ marginBottom: '30px' }}>
                      <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937' }}>{t.free.price}</span>
                      <span style={{ fontSize: '18px', color: '#6b7280' }}>{t.perMonth}</span>
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '30px', minHeight: '50px' }}>
                      {t.free.description}
                    </p>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '0 0 30px 0',
                      flex: 1
                    }}>
                      {t.free.features.map((feature, i) => (
                        <li key={i} style={{ padding: '10px 0', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {checkIcon}
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a href="/app" style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '12px 24px',
                      background: '#f3f4f6',
                      color: '#1f2937',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      border: '1px solid #e5e7eb'
                    }}>
                      {t.free.cta}
                    </a>
                  </div>

                  {/* PRO Plan */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '40px 30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '2px solid #9333EA',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#9333EA',
                      color: 'white',
                      padding: '4px 20px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {t.pro.badge}
                    </div>
                    <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937' }}>{t.pro.name}</h3>
                    <div style={{ marginBottom: '30px' }}>
                      <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937' }}>{t.pro.price}</span>
                      <span style={{ fontSize: '18px', color: '#6b7280' }}>{t.perMonth}</span>
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '30px', minHeight: '50px' }}>
                      {t.pro.description}
                    </p>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '0 0 30px 0',
                      flex: 1
                    }}>
                      {t.pro.features.map((feature, i) => (
                        <li key={i} style={{ padding: '10px 0', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {checkIcon}
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a href="/app" style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '12px 24px',
                      background: '#9333EA',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}>
                      {t.pro.cta}
                    </a>
                  </div>

                  {/* PREMIUM Plan */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '40px 30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937' }}>{t.premium.name}</h3>
                    <div style={{ marginBottom: '30px' }}>
                      <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937' }}>{t.premium.price}</span>
                      <span style={{ fontSize: '18px', color: '#6b7280' }}>{t.perMonth}</span>
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '30px', minHeight: '50px' }}>
                      {t.premium.description}
                    </p>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '0 0 30px 0',
                      flex: 1
                    }}>
                      {t.premium.features.map((feature, i) => (
                        <li key={i} style={{ padding: '10px 0', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {checkIcon}
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a href="/app" style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '12px 24px',
                      background: '#1f2937',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}>
                      {t.premium.cta}
                    </a>
                  </div>
                </div>

                {/* Add-ons */}
                <div style={{ marginTop: '80px' }}>
                  <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '40px', color: '#1f2937' }}>
                    {t.addons.title}
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                  }}>
                    {/* Extra 10K Calls */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '30px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      <div>
                        <h4 style={{ fontSize: '18px', color: '#1f2937', marginBottom: '6px' }}>{t.addons.extra10k.title}</h4>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{t.addons.extra10k.description}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{t.addons.extra10k.price}</span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{t.perMo}</span>
                      </div>
                    </div>

                    {/* 1M Calls */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '30px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      <div>
                        <h4 style={{ fontSize: '18px', color: '#1f2937', marginBottom: '6px' }}>{t.addons.million.title}</h4>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{t.addons.million.description}</p>
                      </div>
                      <a href="mailto:info@airrange.io" style={{
                        display: 'inline-block',
                        padding: '8px 20px',
                        background: '#f3f4f6',
                        color: '#1f2937',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        border: '1px solid #e5e7eb',
                        alignSelf: 'flex-start'
                      }}>
                        {t.addons.contactSales}
                      </a>
                    </div>

                    {/* On-Premises */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '30px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      <div>
                        <h4 style={{ fontSize: '18px', color: '#1f2937', marginBottom: '6px' }}>{t.addons.onPremises.title}</h4>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                          {t.addons.onPremises.description}{' '}
                          <a href={`${prefix}/on-premises`} style={{ color: '#9333EA', textDecoration: 'underline' }}>{t.addons.onPremises.learnMore}</a>
                        </p>
                      </div>
                      <a href="mailto:info@airrange.io" style={{
                        display: 'inline-block',
                        padding: '8px 20px',
                        background: '#f3f4f6',
                        color: '#1f2937',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        border: '1px solid #e5e7eb',
                        alignSelf: 'flex-start'
                      }}>
                        {t.addons.contactSales}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Enterprise Section */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '80px',
                  padding: '40px',
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ fontSize: '28px', marginBottom: '20px', color: '#1f2937' }}>
                    {t.enterprise.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
                    {t.enterprise.description}
                  </p>
                  <a href="mailto:info@airrange.io" style={{
                    display: 'inline-block',
                    padding: '14px 32px',
                    background: '#9333EA',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'all 0.2s ease'
                  }}>
                    {t.enterprise.cta}
                  </a>
                </div>
              </div>
            </section>
          </main>

          <Footer locale={locale} currentPath="/pricing" />
        </div>
      </div>
    </>
  );
}
