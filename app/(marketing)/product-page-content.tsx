import React from 'react';
import Link from 'next/link';
import './product.css';
import Footer from '@/components/product/Footer';
import { developerFAQs } from '@/data/developer-faq';
import ProductHeader from '@/components/product/ProductHeader';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getHomepageTranslations } from '@/lib/translations/marketing';
import TourWrapper from './tour-wrapper';

interface ProductPageProps {
  locale?: SupportedLocale;
}

const ProductPageContent: React.FC<ProductPageProps> = ({ locale = 'en' }) => {
  const t = getHomepageTranslations(locale);

  return (
    <div className="product-page">
      <div className="page-wrapper">
        <TourWrapper locale={locale}>

          <main className="main-wrapper">
            {/* Hero Section */}
            <ProductHeader
              subheading={t.hero.subheading}
              title={<>{t.hero.title1}<br /><span className="text-color-primary">{t.hero.title2}</span></>}
              description={t.hero.description}
              secondaryButtonText={t.hero.cta}
              secondaryButtonHref="/app"
              showImage={false}
              showVideo={true}
              locale={locale}
            />

            {/* Excel API - How It Works Section */}
            <section className="section-excel-api" style={{ background: '#f8f9fa', padding: '80px 0' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="text-align-center" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
                      {t.excelApi.title1} <span style={{ color: '#9333EA' }}>{t.excelApi.title2}</span>
                    </h2>
                    <p style={{ fontSize: '18px', color: '#666666', marginBottom: '50px' }}>
                      {t.excelApi.description}
                    </p>
                  </div>

                  {/* 3 Steps */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '30px',
                    marginBottom: '50px',
                    maxWidth: '1000px',
                    margin: '0 auto 50px'
                  }}>
                    {/* Step 1 */}
                    <div style={{
                      background: 'white',
                      padding: '30px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                      textAlign: 'left'
                    }}>
                      <div style={{ marginBottom: '15px' }}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="14" cy="14" r="12" stroke="#9333EA" strokeWidth="1.5" />
                          <text x="14" y="18" textAnchor="middle" fill="#9333EA" fontSize="12" fontWeight="600">1</text>
                        </svg>
                      </div>
                      <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>{t.excelApi.step1.title}</h3>
                      <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5' }}>{t.excelApi.step1.description}</p>
                    </div>

                    {/* Step 2 */}
                    <div style={{
                      background: 'white',
                      padding: '30px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                      textAlign: 'left'
                    }}>
                      <div style={{ marginBottom: '15px' }}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="14" cy="14" r="12" stroke="#9333EA" strokeWidth="1.5" />
                          <text x="14" y="18" textAnchor="middle" fill="#9333EA" fontSize="12" fontWeight="600">2</text>
                        </svg>
                      </div>
                      <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>{t.excelApi.step2.title}</h3>
                      <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5' }}>{t.excelApi.step2.description}</p>
                    </div>

                    {/* Step 3 */}
                    <div style={{
                      background: 'white',
                      padding: '30px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                      textAlign: 'left'
                    }}>
                      <div style={{ marginBottom: '15px' }}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="14" cy="14" r="12" stroke="#9333EA" strokeWidth="1.5" />
                          <text x="14" y="18" textAnchor="middle" fill="#9333EA" fontSize="12" fontWeight="600">3</text>
                        </svg>
                      </div>
                      <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>{t.excelApi.step3.title}</h3>
                      <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5' }}>{t.excelApi.step3.description}</p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '40px',
                    marginBottom: '40px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#9333EA' }}>{t.excelApi.stat1.value}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{t.excelApi.stat1.label}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#9333EA' }}>{t.excelApi.stat2.value}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{t.excelApi.stat2.label}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#9333EA' }}>{t.excelApi.stat3.value}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{t.excelApi.stat3.label}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#9333EA' }}>{t.excelApi.stat4.value}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{t.excelApi.stat4.label}</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ textAlign: 'center' }}>
                    <Link
                      href="/how-excel-api-works"
                      style={{
                        color: '#9333EA',
                        fontSize: '16px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {t.excelApi.cta}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Solution Bridge Section */}
            <section className="section-solution-bridge" style={{ background: '#F3F3FD', padding: '80px 0' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="text-align-center" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
                      {t.solution.title1} <span style={{ color: '#9333EA' }}>{t.solution.title2}</span>
                    </h2>
                    <p style={{ fontSize: '18px', color: '#666666', marginBottom: '30px', lineHeight: '1.6' }}>
                      {t.solution.description}
                    </p>
                    <Link
                      href={locale === 'en' ? '/excel-ai-integration' : `/${locale}/excel-ai-integration`}
                      style={{
                        color: '#9333EA',
                        fontSize: '16px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {t.solution.link}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* In Action Subheading */}
            <div className="padding-global" style={{ paddingTop: '60px', paddingBottom: '20px' }}>
              <div className="container-large">
                <div className="text-align-center">
                  <div className="subheading">
                    <div>{t.inAction}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Section 1 */}
            <section id="feature" className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large" style={{ paddingTop: '0' }}>
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            <span className="text-color-primary">{t.feature1.title1}</span> {t.feature1.title2}
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            {t.feature1.description}
                          </p>
                        </div>
                        <div className="feature-keypoint-list">
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-size-medium">{t.feature1.point1}</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-size-medium">{t.feature1.point2}</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-size-medium">{t.feature1.point3}</p>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div className="feature-image-placeholder" style={{
                          background: 'white',
                          borderRadius: '12px',
                          padding: '30px',
                          height: '450px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          overflow: 'auto',
                          border: '2px solid #E8E0FF'
                        }}>
                          {/* Customer Message */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{
                              background: '#9333EA',
                              color: 'white',
                              padding: '12px 16px',
                              borderRadius: '18px 18px 4px 18px',
                              maxWidth: '85%',
                              fontSize: '14px'
                            }}>
                              {t.feature1.chatCustomer}
                            </div>
                          </div>

                          {/* AI Response */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#E8E0FF',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#9333EA',
                              fontWeight: 'bold'
                            }}>AI</div>
                            <div style={{
                              background: '#F8F6FE',
                              padding: '16px',
                              borderRadius: '4px 18px 18px 18px',
                              maxWidth: '90%',
                              fontSize: '14px'
                            }}>
                              <div style={{ marginBottom: '12px', color: '#374151' }}>
                                {t.feature1.chatAI}
                              </div>
                              <div style={{
                                background: 'white',
                                border: '1px solid #E8E0FF',
                                borderRadius: '8px',
                                padding: '12px',
                                fontSize: '13px',
                                fontFamily: 'monospace'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span>{t.feature1.basePrice}</span>
                                  <strong>{locale === 'de' ? '23.995,00 €' : '$23,995.00'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span>{t.feature1.enterpriseDiscount}</span>
                                  <strong style={{ color: '#16a34a' }}>{locale === 'de' ? '-3.599,25 €' : '-$3,599.25'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span>{t.feature1.volumeDiscount}</span>
                                  <strong style={{ color: '#16a34a' }}>{locale === 'de' ? '-1.199,75 €' : '-$1,199.75'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span>{t.feature1.shipping}</span>
                                  <strong>{locale === 'de' ? '485,00 €' : '$485.00'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span>{t.feature1.salesTax}</span>
                                  <strong>{locale === 'de' ? '3.719,39 €' : '$1,431.88'}</strong>
                                </div>
                                <div style={{
                                  borderTop: '1px solid #E8E0FF',
                                  paddingTop: '8px',
                                  marginTop: '8px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontWeight: 'bold',
                                  color: '#9333EA'
                                }}>
                                  <span>{t.feature1.totalQuote}</span>
                                  <span>{locale === 'de' ? '23.399,39 €' : '$21,112.88'}</span>
                                </div>
                              </div>
                              <div style={{
                                marginTop: '12px',
                                fontSize: '12px',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <span>{t.feature1.calcNote}</span>
                                <span style={{
                                  color: '#9333EA',
                                  textDecoration: 'none',
                                  fontSize: '11px',
                                  opacity: 0.8,
                                  cursor: 'pointer'
                                }}>
                                  {t.feature1.downloadPdf}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Duplicate AI Sales Agents Section with Reversed Layout */}
            <section className="section-home-feature" style={{ background: '#ffffff' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component reverse">
                      <div className="feature-image-wrapper">
                        <div className="feature-image-placeholder" style={{
                          background: 'white',
                          borderRadius: '12px',
                          padding: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          minHeight: '400px',
                          position: 'relative',
                          border: '2px solid #E8E0FF'
                        }}>
                          <picture>
                            <source srcSet="/images/product/workflow-example.webp" type="image/webp" />
                            <img
                              src="/images/product/workflow-example.webp"
                              alt="AI Excel Workflow Example"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                borderRadius: '8px'
                              }}
                            />
                          </picture>
                        </div>
                      </div>
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            <span className="text-color-primary">{t.feature2.title1}</span> {t.feature2.title2}
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            {t.feature2.description}
                          </p>
                        </div>
                        <div className="feature-keypoint-list">
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-size-medium">{t.feature2.point1}</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-size-medium">{t.feature2.point2}</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-size-medium">{t.feature2.point3}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Developer Liberation Section */}
            <section className="section-home-feature" style={{ background: '#ffffff' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            <span className="text-color-primary">{t.feature3.title1}</span>{t.feature3.title2}
                          </h2>
                        </div>
                        <p className="text-size-medium" style={{ marginBottom: '30px' }}>
                          {t.feature3.description}
                        </p>
                        <div className="feature-list">
                          <div className="feature-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div>
                              <strong>{t.feature3.point1Title}</strong> - {t.feature3.point1Text}
                            </div>
                          </div>
                          <div className="feature-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div>
                              <strong>{t.feature3.point2Title}</strong> - {t.feature3.point2Text}
                            </div>
                          </div>
                        </div>
                        <a href="/blog/stop-reimplementing-excel-business-logic-javascript"
                          className="text-link"
                          style={{
                            marginTop: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#9333EA',
                            fontWeight: '500',
                            textDecoration: 'none'
                          }}>
                          {t.feature3.link}
                        </a>
                      </div>
                      <div className="feature-image-wrapper">
                        <div className="feature-image-placeholder" style={{
                          background: 'white',
                          border: '1px solid #E8E0FF',
                          borderRadius: '12px',
                          padding: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          minHeight: '400px',
                          position: 'relative'
                        }}>
                          <picture>
                            <source srcSet="/images/product/dont-recode-excel.webp" type="image/webp" />
                            <source srcSet="/images/product/dont-recode-excel.png" type="image/png" />
                            <img
                              src="/images/product/dont-recode-excel.webp"
                              alt="Why Reverse Engineering Excel Fails - Don't re-code Excel, Just run Excel"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                borderRadius: '8px'
                              }}
                            />
                          </picture>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tools Section */}
            <section className="section-home-tools">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-medium">
                    <div className="tools-component">
                      <div className="tools-list">
                        <div className="tools-item">
                          <div className="tools-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg height="28" viewBox="0 0 24 24" width="28" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fillRule="nonzero" />
                            </svg>
                            <span>Claude</span>
                          </div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="#10a37f"/>
                            </svg>
                            <span>ChatGPT</span>
                          </div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <linearGradient id="copilot-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#0078D4"/>
                                  <stop offset="50%" stopColor="#5C2D91"/>
                                  <stop offset="100%" stopColor="#008272"/>
                                </linearGradient>
                              </defs>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="url(#copilot-gradient)"/>
                              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="url(#copilot-gradient)"/>
                              <circle cx="12" cy="12" r="2" fill="url(#copilot-gradient)"/>
                            </svg>
                            <span>Copilot</span>
                          </div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L8 8H4L8 14L4 20H8L12 14L16 20H20L16 14L20 8H16L12 2Z" fill="#8E75B2"/>
                              <path d="M12 2L8 8H4L8 14L12 8L12 2Z" fill="#4285F4"/>
                              <path d="M12 8L8 14L12 20L16 14L12 8Z" fill="#EA4335"/>
                              <path d="M16 8H20L16 14L12 8L16 8Z" fill="#FBBC04"/>
                              <path d="M12 14L8 14L4 20H8L12 14Z" fill="#34A853"/>
                              <path d="M12 14L16 14L20 20H16L12 14Z" fill="#EA4335"/>
                            </svg>
                            <span>Gemini</span>
                          </div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="28" height="28" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g transform="translate(5, 5)">
                                <path d="M2.2,21 L19.8,21 C21.01,21 22,20.055 22,18.9 L22,2.1 C22,0.945 21.01,0 19.8,0 L2.2,0 C0.99,0 0,0.945 0,2.1 L0,18.9 C0,20.055 0.99,21 2.2,21 Z" fill="#13874A"/>
                                <path d="M5,17 L9.34862384,10.526971 L5.3853211,4.05394191 L8.57798168,4.05394191 L10.7247706,8.15352695 C10.9449541,8.53112034 11.0550459,8.85477176 11.1100917,9.01659754 L11.1651376,9.01659754 C11.3302752,8.69294605 11.440367,8.42323653 11.6055046,8.09958504 L13.9174312,4 L16.8348624,4 L12.7614679,10.4190871 L17,17 L13.8623853,17 L11.3302752,12.4688797 C11.2201835,12.307054 11.1100917,12.0912863 11.0550459,11.8755187 L11,11.8755187 C10.9449541,12.0373444 10.8348624,12.1991701 10.7247706,12.4688797 L8.19266054,17 L5,17 Z" fill="#FFFFFF"/>
                              </g>
                            </svg>
                            <span>Excel</span>
                          </div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#FF4A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17l10 5 10-5" stroke="#FF4A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12l10 5 10-5" stroke="#FF4A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Zapier</span>
                          </div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="3" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                              <rect x="14" y="3" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                              <rect x="3" y="14" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                              <rect x="14" y="14" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                            </svg>
                            <span>n8n</span>
                          </div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="#6D00CC" strokeWidth="2"/>
                              <path d="M12 6v6l4 2" stroke="#6D00CC" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span>Make</span>
                          </div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                              <path d="M8 3H6a2 2 0 00-2 2v14a2 2 0 002 2h2" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M16 3h2a2 2 0 012 2v14a2 2 0 01-2 2h-2" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M8 12h8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span>REST API</span>
                          </div>
                        </div>
                      </div>
                      <div className="tools-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            {t.tools.title1} <span className="text-color-primary">{t.tools.title2}</span> {t.tools.title3}
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            {t.tools.description}
                          </p>
                        </div>
                        <a href="/app" className="button">{t.tools.cta}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="section-home-benefits">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="align-center">
                        <div className="max-width-large">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.useCases.subheading}</div>
                            </div>
                          </div>
                          <div className="text-align-center">
                            <h2>
                              {t.useCases.title1} <span className="text-color-primary">{t.useCases.title2}</span> {t.useCases.title3}
                            </h2>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="benefits-component">
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <rect x="12" y="16" width="16" height="4" rx="2" fill="#9333EA" />
                              <rect x="12" y="22" width="16" height="4" rx="2" fill="#9333EA" />
                              <rect x="12" y="10" width="16" height="4" rx="2" fill="#9333EA" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>{t.useCases.case1.title}</h3>
                        </div>
                        <p>{t.useCases.case1.text}</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <circle cx="20" cy="20" r="8" stroke="#9333EA" strokeWidth="1.5" />
                              <circle cx="14" cy="14" r="2" fill="#9333EA" />
                              <circle cx="26" cy="14" r="2" fill="#9333EA" />
                              <circle cx="14" cy="26" r="2" fill="#9333EA" />
                              <circle cx="26" cy="26" r="2" fill="#9333EA" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>{t.useCases.case2.title}</h3>
                        </div>
                        <p>{t.useCases.case2.text}</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <circle cx="20" cy="20" r="8" stroke="#9333EA" strokeWidth="1.5" />
                              <path d="M20 16V20L23 23" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>{t.useCases.case3.title}</h3>
                        </div>
                        <p>{t.useCases.case3.text}</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <rect x="12" y="24" width="16" height="4" rx="2" fill="#9333EA" />
                              <rect x="16" y="20" width="8" height="4" rx="2" fill="#9333EA" />
                              <rect x="18" y="16" width="4" height="4" rx="2" fill="#9333EA" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>{t.useCases.case4.title}</h3>
                        </div>
                        <p>{t.useCases.case4.text}</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <rect x="10" y="18" width="8" height="12" rx="2" fill="#9333EA" />
                              <rect x="16" y="14" width="8" height="16" rx="2" fill="#9333EA" />
                              <rect x="22" y="10" width="8" height="20" rx="2" fill="#9333EA" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>{t.useCases.case5.title}</h3>
                        </div>
                        <p>{t.useCases.case5.text}</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M12 26L20 18L28 26" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M20 18V10" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>{t.useCases.case6.title}</h3>
                        </div>
                        <p>{t.useCases.case6.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Enterprise / On-Premises Section */}
            <section className="section-home-feature" style={{ background: '#f8f6fe' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '48px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <div style={{ flex: '1 1 400px', maxWidth: '560px' }}>
                        <div className="margin-bottom margin-xsmall">
                          {/* <div className="subheading">
                            <div>Enterprise</div>
                          </div> */}
                        </div>
                        <div className="margin-bottom margin-small">
                          <h2>
                            {t.enterprise.title1}<br /><span className="text-color-primary">{t.enterprise.title2}</span>
                          </h2>
                        </div>
                        <p className="text-size-medium" style={{ color: '#555', lineHeight: '1.7' }}>
                          {t.enterprise.description}
                        </p>
                        <div style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <a href={locale === 'en' ? '/on-premises' : `/${locale}/on-premises`} className="button" style={{
                            background: '#502D80',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '15px'
                          }}>
                            {t.enterprise.cta}
                          </a>
                        </div>
                      </div>
                      <div style={{ flex: '0 0 auto' }}>
                        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="200" height="200" rx="20" fill="#f0e6ff" />
                          <rect x="50" y="70" width="100" height="70" rx="6" stroke="#9333EA" strokeWidth="2" fill="white" />
                          <rect x="60" y="82" width="80" height="6" rx="2" fill="#e9d5ff" />
                          <rect x="60" y="94" width="80" height="6" rx="2" fill="#e9d5ff" />
                          <rect x="60" y="106" width="60" height="6" rx="2" fill="#e9d5ff" />
                          <circle cx="100" cy="55" r="18" stroke="#9333EA" strokeWidth="2" fill="white" />
                          <path d="M93 55L98 60L108 50" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M70 140L70 155" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" />
                          <path d="M100 140L100 155" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" />
                          <path d="M130 140L130 155" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" />
                          <rect x="60" y="155" width="80" height="12" rx="3" stroke="#9333EA" strokeWidth="2" fill="white" />
                          <circle cx="75" cy="161" r="2.5" fill="#9333EA" />
                          <circle cx="85" cy="161" r="2.5" fill="#9333EA" />
                          <circle cx="95" cy="161" r="2.5" fill="#22c55e" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            {/* <section id="cta" className="section-home-cta">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="home-cta-component">
                      <div className="text-align-center">
                        <div className="max-width-xlarge">
                          <div className="margin-bottom margin-small">
                            <h2 className="text-color-white">Transform Excel Into APIs</h2>
                          </div>
                          <p className="text-size-medium text-color-white">
                            No credit card required. Start with our free tier and upgrade when you need more.
                          </p>
                        </div>
                      </div>
                      <div className="margin-top margin-medium">
                        <div className="text-align-center" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <a href="/app" className="button" style={{
                            background: 'white',
                            color: '#1a1a1a',
                            padding: '16px 32px',
                            fontSize: '18px',
                            fontWeight: '600',
                            minWidth: '200px',
                            border: 'none'
                          }}>
                            Create your first free Excel API
                          </a>
                          <a href="/pricing" className="button" style={{
                            background: 'transparent',
                            border: '2px solid white',
                            color: 'white',
                            padding: '16px 32px',
                            fontSize: '18px',
                            fontWeight: '600',
                            minWidth: '200px'
                          }}>
                            View Pricing
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section> */}

            {/* Developer FAQ Section - Server Rendered */}
            <section id="faq" className="section-home-faq">
              <div className="padding-global">
                <div className="container-medium">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.faq.subheading}</div>
                            </div>
                          </div>
                          <div className="margin-bottom margin-small">
                            <h2>{t.faq.title1} <span className="text-color-primary">{t.faq.title2}</span></h2>
                          </div>
                          <p className="text-size-medium">{t.faq.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="faq-collection-wrapper">
                      <div className="faq-collection-list">
                        {developerFAQs.map((item, index) => (
                          <div key={index} className="faq-collection-item">
                            <div className="faq-accordion">
                              <div className="faq-question" style={{ cursor: 'default' }}>
                                <div className="heading-style-h6">{item.question}</div>
                              </div>
                              <div className="faq-answer expanded">
                                <div className="margin-bottom margin-small">
                                  <p>{item.answer}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="section-home-contact">
              <div className="padding-global">
                <div className="container-medium">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.contact.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            <span className="text-color-primary">{t.contact.title1}</span> {t.contact.title2}
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div className="home-contact-component">
                      <div className="home-contact-item">
                        <p>
                          {t.contact.text} <a href="mailto:team@airrange.io">team@airrange.io</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <Footer locale={locale} currentPath="" />
        </TourWrapper>
      </div>
    </div>
  );
};

export default ProductPageContent;