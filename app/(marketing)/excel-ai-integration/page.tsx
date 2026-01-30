import { Metadata } from 'next';
import '../product.css';
import './excel-ai-integration.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getAIIntegrationTranslations, getHomepageTranslations } from '@/lib/translations/marketing';
import Link from 'next/link';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Excel AI Integration - SpreadAPI | Connect ChatGPT & Claude to Excel',
  description: 'Give AI assistants Excel superpowers. Let ChatGPT and Claude use your spreadsheet calculations for accurate quotes, financial modeling, and business automation.',
  keywords: 'excel ai integration, chatgpt excel, claude excel, mcp protocol, ai spreadsheet automation, excel api for ai',
  openGraph: {
    title: 'Give AI Assistants Excel Superpowers - SpreadAPI',
    description: 'Connect ChatGPT and Claude to your Excel calculations. Enable accurate, reproducible results.',
    type: 'article',
    url: 'https://spreadapi.io/excel-ai-integration',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.io/api/og?title=Excel%20AI%20Integration&description=Give%20AI%20assistants%20Excel%20superpowers',
      width: 1200,
      height: 630,
      alt: 'Excel AI Integration with SpreadAPI',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Excel + AI = Superpowers - SpreadAPI',
    description: 'Connect AI assistants to Excel calculations. Accurate, reproducible results.',
  },
  alternates: {
    canonical: 'https://spreadapi.io/excel-ai-integration',
    languages: {
      'en': 'https://spreadapi.io/excel-ai-integration',
      'de': 'https://spreadapi.io/de/excel-ai-integration',
      'x-default': 'https://spreadapi.io/excel-ai-integration',
    },
  },
};

interface AIIntegrationContentProps {
  locale?: SupportedLocale;
}

export function AIIntegrationContent({ locale = 'en' }: AIIntegrationContentProps) {
  const t = getAIIntegrationTranslations(locale);
  const homepageT = getHomepageTranslations(locale);

  return (
    <>
      <div className="product-page">

        <div className="page-wrapper">
          {/* Navigation */}
          <Navigation currentPage="excel-ai-integration" locale={locale} />

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
                          </div>
                        </div>
                      </div>
                      <div className="header-image-wrapper">
                        <div className="header-illustration">
                          <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="800" height="400" rx="8" fill="#F8F6FE"/>

                            {/* AI Chat Bubble on left */}
                            <rect x="50" y="120" width="200" height="160" rx="16" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
                            <circle cx="90" cy="160" r="20" fill="#9333EA" fillOpacity="0.15"/>
                            <text x="90" y="166" textAnchor="middle" fill="#9333EA" fontSize="20" fontWeight="600">AI</text>
                            <rect x="125" y="150" width="100" height="8" rx="4" fill="#E8E0FF"/>
                            <rect x="125" y="165" width="70" height="8" rx="4" fill="#E8E0FF"/>
                            <text x="80" y="215" fill="#666" fontSize="12">Quote for 500 units</text>
                            <text x="80" y="231" fill="#666" fontSize="12">with 15% volume</text>
                            <text x="80" y="247" fill="#666" fontSize="12">discount?</text>
                            <polygon points="50,250 30,270 70,250" fill="white" stroke="#E8E0FF" strokeWidth="2"/>

                            {/* Arrow 1 */}
                            <path d="M270 200 L310 200" stroke="#9333EA" strokeWidth="3" strokeDasharray="5,5"/>
                            <path d="M300 190 L310 200 L300 210" stroke="#9333EA" strokeWidth="3" fill="none"/>

                            {/* Spreadsheet in middle */}
                            <rect x="330" y="100" width="180" height="200" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
                            <rect x="345" y="115" width="150" height="24" fill="#F8F6FE"/>
                            <text x="420" y="132" textAnchor="middle" fill="#666" fontSize="11" fontWeight="500">Product Pricing.xlsx</text>
                            <rect x="345" y="150" width="50" height="20" fill="#E6F4FF"/>
                            <rect x="400" y="150" width="95" height="20" fill="#F8F6FE"/>
                            <text x="355" y="164" fill="#333" fontSize="10">Price</text>
                            <text x="440" y="164" textAnchor="middle" fill="#333" fontSize="10">$49.90</text>
                            <rect x="345" y="175" width="50" height="20" fill="#E6F4FF"/>
                            <rect x="400" y="175" width="95" height="20" fill="#F8F6FE"/>
                            <text x="355" y="189" fill="#333" fontSize="10">Qty</text>
                            <text x="440" y="189" textAnchor="middle" fill="#333" fontSize="10">500</text>
                            <rect x="345" y="200" width="50" height="20" fill="#E6F4FF"/>
                            <rect x="400" y="200" width="95" height="20" fill="#F8F6FE"/>
                            <text x="355" y="214" fill="#333" fontSize="10">Disc.</text>
                            <text x="440" y="214" textAnchor="middle" fill="#333" fontSize="10">15%</text>
                            <rect x="345" y="235" width="150" height="24" fill="#D4EDDA"/>
                            <text x="360" y="251" fill="#28a745" fontSize="10" fontWeight="500">=B1*B2*(1-B3)</text>
                            <rect x="345" y="264" width="150" height="24" fill="#F8F6FE"/>
                            <text x="420" y="280" textAnchor="middle" fill="#9333EA" fontSize="12" fontWeight="600">$21,207.50</text>

                            {/* Arrow 2 */}
                            <path d="M530 200 L570 200" stroke="#9333EA" strokeWidth="3" strokeDasharray="5,5"/>
                            <path d="M560 190 L570 200 L560 210" stroke="#9333EA" strokeWidth="3" fill="none"/>

                            {/* Result with checkmark on right */}
                            <rect x="590" y="120" width="160" height="160" rx="16" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
                            <circle cx="670" cy="170" r="28" fill="#D4EDDA"/>
                            <path d="M656 170 L665 179 L684 160" stroke="#28a745" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            <text x="670" y="220" textAnchor="middle" fill="#333" fontSize="13" fontWeight="600">$21,207.50</text>
                            <text x="670" y="242" textAnchor="middle" fill="#666" fontSize="11">Exact calculation</text>
                            <text x="670" y="258" textAnchor="middle" fill="#666" fontSize="11">No hallucination</text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Technical Differentiators Section */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="text-align-center">
                      <div className="margin-bottom margin-xsmall">
                        <div className="subheading">
                          <div>{homepageT.differentiators.subheading}</div>
                        </div>
                      </div>
                      <div className="margin-bottom margin-large">
                        <h2>{homepageT.differentiators.title1} <span className="text-color-primary">{homepageT.differentiators.title2}</span></h2>
                        <p style={{ fontSize: '18px', color: '#666666', marginTop: '20px', marginBottom: '0', maxWidth: '800px', margin: '20px auto 0' }}>
                          {homepageT.differentiators.description}
                        </p>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '30px',
                        maxWidth: '1000px',
                        margin: '0 auto',
                        textAlign: 'left'
                      }}>
                        <div style={{
                          background: 'white',
                          padding: '30px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ marginBottom: '15px' }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 6V14L20 20" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx="14" cy="14" r="10" stroke="#9333EA" strokeWidth="1.5" />
                              <path d="M10 24L8 26M18 24L20 26" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{homepageT.differentiators.card1.title}</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            {homepageT.differentiators.card1.text}
                          </p>
                        </div>

                        <div style={{
                          background: 'white',
                          padding: '30px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ marginBottom: '15px' }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 9C11.2386 9 9 11.2386 9 14C9 16.7614 11.2386 19 14 19C16.7614 19 19 16.7614 19 14C19 11.2386 16.7614 9 14 9Z" stroke="#9333EA" strokeWidth="1.5" />
                              <path d="M14 4V7M14 21V24M24 14H21M7 14H4M21.07 6.93L19 9M9 19L6.93 21.07M21.07 21.07L19 19M9 9L6.93 6.93" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{homepageT.differentiators.card2.title}</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            {homepageT.differentiators.card2.text}
                          </p>
                        </div>

                        <div style={{
                          background: 'white',
                          padding: '30px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ marginBottom: '15px' }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16 4L10 14H18L12 24" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{homepageT.differentiators.card3.title}</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            {homepageT.differentiators.card3.text}
                          </p>
                        </div>

                        <div style={{
                          background: 'white',
                          padding: '30px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ marginBottom: '15px' }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="6" y="12" width="16" height="12" rx="2" stroke="#9333EA" strokeWidth="1.5" />
                              <path d="M10 12V8C10 5.79086 11.7909 4 14 4C16.2091 4 18 5.79086 18 8V12" stroke="#9333EA" strokeWidth="1.5" />
                              <circle cx="14" cy="17" r="1.5" fill="#9333EA" />
                              <path d="M14 18.5V20" stroke="#9333EA" strokeWidth="1.5" />
                            </svg>
                          </div>
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{homepageT.differentiators.card4.title}</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            {homepageT.differentiators.card4.text}
                          </p>
                        </div>

                        <div style={{
                          background: 'white',
                          padding: '30px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ marginBottom: '15px' }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="8" y="10" width="12" height="10" rx="2" stroke="#9333EA" strokeWidth="1.5" />
                              <circle cx="11" cy="13" r="1" fill="#9333EA" />
                              <circle cx="17" cy="13" r="1" fill="#9333EA" />
                              <path d="M11 17H17" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M14 6V10M10 6L14 6M18 6L14 6" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M6 15H8M20 15H22" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{homepageT.differentiators.card5.title}</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            {homepageT.differentiators.card5.text}
                          </p>
                        </div>

                        <div style={{
                          background: 'white',
                          padding: '30px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ marginBottom: '15px' }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 4C8.477 4 4 8.477 4 14C4 19.523 8.477 24 14 24C19.523 24 24 19.523 24 14" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M14 14L20 8M20 8H16M20 8V12" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx="14" cy="14" r="2" fill="#9333EA" />
                            </svg>
                          </div>
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{homepageT.differentiators.card6.title}</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            {homepageT.differentiators.card6.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Editable Areas Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component reverse">
                      <div className="feature-image-wrapper">
                        <div className="feature-image-placeholder" style={{
                          background: '#F8F6FE',
                          borderRadius: '12px',
                          padding: '30px',
                          height: '400px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg viewBox="0 0 500 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="10" y="10" width="480" height="320" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2" />
                            <rect x="10" y="10" width="480" height="40" fill="#F8F6FE" rx="8" />
                            <line x1="90" y1="10" x2="90" y2="50" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="170" y1="10" x2="170" y2="50" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="250" y1="10" x2="250" y2="50" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="330" y1="10" x2="330" y2="50" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="410" y1="10" x2="410" y2="50" stroke="#E8E0FF" strokeWidth="1" />
                            <text x="50" y="35" textAnchor="middle" fill="#6B7280" fontSize="14">A</text>
                            <text x="130" y="35" textAnchor="middle" fill="#6B7280" fontSize="14">B</text>
                            <text x="210" y="35" textAnchor="middle" fill="#6B7280" fontSize="14">C</text>
                            <text x="290" y="35" textAnchor="middle" fill="#6B7280" fontSize="14">D</text>
                            <text x="370" y="35" textAnchor="middle" fill="#6B7280" fontSize="14">E</text>
                            <text x="450" y="35" textAnchor="middle" fill="#6B7280" fontSize="14">F</text>
                            <rect x="10" y="50" width="80" height="280" fill="#F8F6FE" />
                            <line x1="10" y1="90" x2="490" y2="90" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="10" y1="130" x2="490" y2="130" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="10" y1="170" x2="490" y2="170" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="10" y1="210" x2="490" y2="210" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="10" y1="250" x2="490" y2="250" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="10" y1="290" x2="490" y2="290" stroke="#E8E0FF" strokeWidth="1" />
                            <text x="50" y="75" textAnchor="middle" fill="#6B7280" fontSize="14">1</text>
                            <text x="50" y="115" textAnchor="middle" fill="#6B7280" fontSize="14">2</text>
                            <text x="50" y="155" textAnchor="middle" fill="#6B7280" fontSize="14">3</text>
                            <text x="50" y="195" textAnchor="middle" fill="#6B7280" fontSize="14">4</text>
                            <text x="50" y="235" textAnchor="middle" fill="#6B7280" fontSize="14">5</text>
                            <text x="50" y="275" textAnchor="middle" fill="#6B7280" fontSize="14">6</text>
                            <text x="50" y="315" textAnchor="middle" fill="#6B7280" fontSize="14">7</text>
                            <line x1="170" y1="50" x2="170" y2="330" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="250" y1="50" x2="250" y2="330" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="330" y1="50" x2="330" y2="330" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="410" y1="50" x2="410" y2="330" stroke="#E8E0FF" strokeWidth="1" />
                            <rect x="90" y="90" width="160" height="80" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="2" strokeDasharray="4 2" rx="4" />
                            <text x="170" y="75" textAnchor="middle" fill="#10B981" fontSize="12" fontWeight="600">AI Can Edit</text>
                            <text x="130" y="115" textAnchor="middle" fill="#1F2937" fontSize="13">Quantity</text>
                            <text x="210" y="115" textAnchor="middle" fill="#1F2937" fontSize="13">500</text>
                            <text x="130" y="155" textAnchor="middle" fill="#1F2937" fontSize="13">Discount</text>
                            <text x="210" y="155" textAnchor="middle" fill="#1F2937" fontSize="13">15%</text>
                            <rect x="250" y="210" width="240" height="80" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 2" rx="4" />
                            <text x="370" y="195" textAnchor="middle" fill="#3B82F6" fontSize="12" fontWeight="600">AI Read-Only</text>
                            <text x="290" y="235" textAnchor="middle" fill="#1F2937" fontSize="13">Total</text>
                            <text x="370" y="235" textAnchor="middle" fill="#1F2937" fontSize="13">$21,112</text>
                            <text x="290" y="275" textAnchor="middle" fill="#1F2937" fontSize="13">Tax</text>
                            <text x="370" y="275" textAnchor="middle" fill="#1F2937" fontSize="13">$1,432</text>
                            <rect x="330" y="90" width="160" height="80" fill="#6B7280" fillOpacity="0.1" rx="4" />
                            <g transform="translate(395, 120)">
                              <rect x="-8" y="-4" width="16" height="12" rx="2" stroke="#6B7280" strokeWidth="1.5" fill="none" />
                              <path d="M-5 -4V-7C-5 -9.76142 -2.76142 -12 0 -12C2.76142 -12 5 -9.76142 5 -7V-4" stroke="#6B7280" strokeWidth="1.5" fill="none" />
                              <circle cx="0" cy="2" r="1.5" fill="#6B7280" />
                            </g>
                            <text x="410" y="155" textAnchor="middle" fill="#6B7280" fontSize="11">Protected</text>
                            <g transform="translate(20, 340)">
                              <rect x="0" y="0" width="15" height="15" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="1.5" rx="2" />
                              <text x="20" y="12" fill="#374151" fontSize="12">AI can modify values</text>
                              <rect x="150" y="0" width="15" height="15" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="1.5" rx="2" />
                              <text x="170" y="12" fill="#374151" fontSize="12">AI can read only</text>
                              <rect x="280" y="0" width="15" height="15" fill="#6B7280" fillOpacity="0.1" stroke="#6B7280" strokeWidth="1.5" rx="2" />
                              <text x="300" y="12" fill="#374151" fontSize="12">No AI access</text>
                            </g>
                          </svg>
                        </div>
                      </div>
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            <span className="text-color-primary">{homepageT.editableAreas.title1}</span> {homepageT.editableAreas.title2}
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            {homepageT.editableAreas.description}
                          </p>
                        </div>
                        <div className="feature-list">
                          <div className="feature-item">
                            <div className="feature-item-icon-wrapper">
                              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M20 14C20 14 16 14 14 16C12 18 12 20 12 20C12 20 12 22 14 24C16 26 20 26 20 26M20 26C20 26 24 26 26 24C28 22 28 20 28 20C28 20 28 18 26 16C24 14 20 14 20 14" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div className="feature-item-content-wrapper">
                              <div className="margin-bottom margin-xsmall">
                                <h3 className="heading-style-h5">{homepageT.editableAreas.feature1Title}</h3>
                              </div>
                              <p className="text-size-medium">{homepageT.editableAreas.feature1Text}</p>
                            </div>
                          </div>
                          <div className="feature-item">
                            <div className="feature-item-icon-wrapper">
                              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M20 12V20L26 26M20 28C15.5817 28 12 24.4183 12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28Z" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div className="feature-item-content-wrapper">
                              <div className="margin-bottom margin-xsmall">
                                <h3 className="heading-style-h5">{homepageT.editableAreas.feature2Title}</h3>
                              </div>
                              <p className="text-size-medium">{homepageT.editableAreas.feature2Text}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pain Point Section - Why AI Struggles */}
            <section className="section-pain-point" style={{ background: '#f8f9fa', padding: '60px 0' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="text-align-center" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
                      {homepageT.painPoints.title1} <span style={{ color: '#9333EA' }}>{homepageT.painPoints.title2}</span>
                    </h2>
                    <p style={{ fontSize: '18px', color: '#666666', marginBottom: '50px' }}>
                      {homepageT.painPoints.subtitle}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                      <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        textAlign: 'left'
                      }}>
                        <div style={{ marginBottom: '15px' }}>
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 14H8M12 14H16M20 14H24" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M14 4V8M14 12V16M14 20V24" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="14" cy="14" r="3" stroke="#9333EA" strokeWidth="1.5" />
                            <path d="M11 11L17 17M17 11L11 17" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>{homepageT.painPoints.card1.title}</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          {homepageT.painPoints.card1.text}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          {homepageT.painPoints.card1.author}
                        </p>
                      </div>
                      <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        textAlign: 'left'
                      }}>
                        <div style={{ marginBottom: '15px' }}>
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="6" width="16" height="16" rx="2" stroke="#9333EA" strokeWidth="1.5" />
                            <path d="M10 10H14M10 14H12M10 18H16" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="20" cy="20" r="6" fill="white" />
                            <path d="M20 17V20M20 23V23.01" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>{homepageT.painPoints.card2.title}</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          {homepageT.painPoints.card2.text}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          {homepageT.painPoints.card2.author}
                        </p>
                      </div>
                      <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        textAlign: 'left'
                      }}>
                        <div style={{ marginBottom: '15px' }}>
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 14L12 14M12 14L16 14M12 14L12 10M12 14L12 18" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M16 10L20 10M20 10L20 14M20 10L24 6" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M16 18L20 18M20 18L20 14M20 18L24 22" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="12" cy="14" r="2" fill="#9333EA" />
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>{homepageT.painPoints.card3.title}</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          {homepageT.painPoints.card3.text}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          {homepageT.painPoints.card3.author}
                        </p>
                      </div>
                      <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        textAlign: 'left'
                      }}>
                        <div style={{ marginBottom: '15px' }}>
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="14" cy="14" r="11" stroke="#9333EA" strokeWidth="1.5" />
                            <path d="M14 7V14L18 18" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>{homepageT.painPoints.card4.title}</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          {homepageT.painPoints.card4.text}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          {homepageT.painPoints.card4.author}
                        </p>
                      </div>
                      <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        textAlign: 'left'
                      }}>
                        <div style={{ marginBottom: '15px' }}>
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="14" cy="14" r="10" stroke="#9333EA" strokeWidth="1.5" fill="none" />
                            <path d="M14 4C8.477 4 4 8.477 4 14C4 19.523 8.477 24 14 24C19.523 24 24 19.523 24 14" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                            <path d="M8 14L14 14M14 8V20" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M18 10L22 10M18 14L22 14M18 18L22 18" stroke="#9333EA" strokeWidth="1" strokeLinecap="round" />
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>{homepageT.painPoints.card5.title}</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          {homepageT.painPoints.card5.text}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          {homepageT.painPoints.card5.author}
                        </p>
                      </div>
                      <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        textAlign: 'left'
                      }}>
                        <div style={{ marginBottom: '15px' }}>
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="4" y="8" width="8" height="8" rx="1" stroke="#9333EA" strokeWidth="1.5" />
                            <rect x="16" y="8" width="8" height="8" rx="1" stroke="#9333EA" strokeWidth="1.5" />
                            <rect x="10" y="18" width="8" height="8" rx="1" stroke="#9333EA" strokeWidth="1.5" />
                            <path d="M12 12L16 12M14 16L14 18" stroke="#9333EA" strokeWidth="1.5" />
                            <circle cx="22" cy="6" r="4" fill="white" />
                            <path d="M22 4V8M20 6H24" stroke="#dc2626" strokeWidth="1.5" />
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>{homepageT.painPoints.card6.title}</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          {homepageT.painPoints.card6.text}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          {homepageT.painPoints.card6.author}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: '50px', textAlign: 'center' }}>
                      <Link href={locale === 'en' ? '/why-ai-fails-at-math' : `/${locale}/why-ai-fails-at-math`} style={{
                        fontSize: '20px',
                        color: '#9333EA',
                        textDecoration: 'none',
                        fontWeight: '600',
                        display: 'inline-block',
                        borderBottom: '2px solid #9333EA',
                        paddingBottom: '2px',
                        transition: 'all 0.2s ease'
                      }}>
                        {homepageT.painPoints.link}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Problem/Solution Section */}
            <section className="section-home-features">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            {t.gap.title1} <span className="text-color-primary">{t.gap.title2}</span>
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            {t.gap.description}
                          </p>
                        </div>
                        <div className="feature-keypoint-list">
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <span style={{ color: '#ef4444', fontSize: '20px' }}>✗</span>
                            </div>
                            <p className="text-size-medium">{t.gap.point1}</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <span style={{ color: '#ef4444', fontSize: '20px' }}>✗</span>
                            </div>
                            <p className="text-size-medium">{t.gap.point2}</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <span style={{ color: '#ef4444', fontSize: '20px' }}>✗</span>
                            </div>
                            <p className="text-size-medium">{t.gap.point3}</p>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div className="feature-image-placeholder" style={{
                          background: '#f8f9fa',
                          borderRadius: '12px',
                          padding: '40px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px'
                        }}>
                          <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>AI</div>
                              <strong>{t.gap.withoutLabel}</strong>
                            </div>
                            <p style={{ margin: 0, color: '#666' }}>{t.gap.withoutText}</p>
                            <p style={{ margin: '5px 0 0 0', color: '#ef4444', fontSize: '14px' }}>{t.gap.withoutError}</p>
                          </div>
                          <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #9333EA'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>AI</div>
                              <strong>{t.gap.withLabel}</strong>
                            </div>
                            <p style={{ margin: 0, color: '#666' }}>{t.gap.withText}</p>
                            <p style={{ margin: '5px 0 0 0', color: '#22c55e', fontSize: '14px' }}>{t.gap.withSuccess}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works */}
            <section className="section-home-process">
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
                            {t.setup.title1} <span className="text-color-primary">{t.setup.title2}</span>
                          </h2>
                        </div>
                      </div>
                    </div>
                    
                    {/* Process Steps */}
                    <div className="process-steps-container">
                      <div className="process-step-card">
                        <div className="step-number-circle">1</div>
                        <h3>{t.setup.step1.title}</h3>
                        <p>{t.setup.step1.description}</p>
                      </div>
                      <div className="process-step-card">
                        <div className="step-number-circle">2</div>
                        <h3>{t.setup.step2.title}</h3>
                        <p>{t.setup.step2.description}</p>
                      </div>
                      <div className="process-step-card">
                        <div className="step-number-circle">3</div>
                        <h3>{t.setup.step3.title}</h3>
                        <p>{t.setup.step3.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Real-World Examples */}
            <section className="section-home-examples" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.possibilities.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.possibilities.title1} <span className="text-color-primary">{t.possibilities.title2}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="examples-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                      {/* Customer Support Example */}
                      <div className="example-card" style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <div className="example-icon" style={{ marginBottom: '20px' }}>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <path d="M12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28C18.7 28 17.5 27.65 16.45 27.05L12 28L12.95 23.55C12.35 22.5 12 21.3 12 20Z" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M24 20H28C28 15.58 24.42 12 20 12" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <h3>{t.possibilities.case1.title}</h3>
                        <p style={{ marginBottom: '20px' }}>{t.possibilities.case1.intro}</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {t.possibilities.case1.points.map((point, i) => (
                            <li key={i} style={{ marginBottom: '10px' }}>✓ {point}</li>
                          ))}
                        </ul>
                        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                          {t.possibilities.case1.quote}
                        </p>
                      </div>

                      {/* Sales Team Example */}
                      <div className="example-card" style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <div className="example-icon" style={{ marginBottom: '20px' }}>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <rect x="10" y="24" width="6" height="8" rx="1" fill="#9333EA" />
                            <rect x="17" y="18" width="6" height="14" rx="1" fill="#9333EA" fillOpacity="0.7" />
                            <rect x="24" y="12" width="6" height="20" rx="1" fill="#9333EA" fillOpacity="0.5" />
                            <path d="M10 10L10 32H30" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <h3>{t.possibilities.case2.title}</h3>
                        <p style={{ marginBottom: '20px' }}>{t.possibilities.case2.intro}</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {t.possibilities.case2.points.map((point, i) => (
                            <li key={i} style={{ marginBottom: '10px' }}>✓ {point}</li>
                          ))}
                        </ul>
                        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                          {t.possibilities.case2.quote}
                        </p>
                      </div>

                      {/* Developer Example */}
                      <div className="example-card" style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <div className="example-icon" style={{ marginBottom: '20px' }}>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <rect x="8" y="12" width="24" height="16" rx="2" stroke="#9333EA" strokeWidth="1.5" />
                            <path d="M16 18L12 22L16 26" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M24 18L28 22L24 26" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 16L18 28" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <h3>{t.possibilities.case3.title}</h3>
                        <p style={{ marginBottom: '20px' }}>{t.possibilities.case3.intro}</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {t.possibilities.case3.points.map((point, i) => (
                            <li key={i} style={{ marginBottom: '10px' }}>✓ {point}</li>
                          ))}
                        </ul>
                        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                          {t.possibilities.case3.quote}
                        </p>
                      </div>

                      {/* Financial Analysis Example */}
                      <div className="example-card" style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <div className="example-icon" style={{ marginBottom: '20px' }}>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <circle cx="20" cy="20" r="10" stroke="#9333EA" strokeWidth="1.5" />
                            <path d="M20 14V26M16 17H22.5C23.33 17 24 17.67 24 18.5C24 19.33 23.33 20 22.5 20H17.5C16.67 20 16 20.67 16 21.5C16 22.33 16.67 23 17.5 23H24" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <h3>{t.possibilities.case4.title}</h3>
                        <p style={{ marginBottom: '20px' }}>{t.possibilities.case4.intro}</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {t.possibilities.case4.points.map((point, i) => (
                            <li key={i} style={{ marginBottom: '10px' }}>✓ {point}</li>
                          ))}
                        </ul>
                        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                          {t.possibilities.case4.quote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Integration Showcase */}
            <section className="section-home-integrations">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>{t.platforms.subheading}</div>
                            </div>
                          </div>
                          <h2>
                            {t.platforms.title1} <span className="text-color-primary">{t.platforms.title2}</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="integrations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', maxWidth: '800px', margin: '0 auto' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px' }}>
                          <svg height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg">
                            <title>Claude</title>
                            <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fillRule="nonzero" />
                          </svg>
                        </div>
                        <h4>{t.platforms.claude.title}</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>{t.platforms.claude.description}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                          <svg width="48" height="48" viewBox="0 0 2406 2406" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 578.4C1 259.5 259.5 1 578.4 1h1249.1c319 0 577.5 258.5 577.5 577.4V2406H578.4C259.5 2406 1 2147.5 1 1828.6V578.4z" fill="#74aa9c" />
                            <path d="M1107.3 299.1c-197.999 0-373.9 127.3-435.2 315.3L650 743.5v427.9c0 21.4 11 40.4 29.4 51.4l344.5 198.515V833.3h.1v-27.9L1372.7 604c33.715-19.52 70.44-32.857 108.47-39.828L1447.6 450.3C1361 353.5 1237.1 298.5 1107.3 299.1zm0 117.5-.6.6c79.699 0 156.3 27.5 217.6 78.4-2.5 1.2-7.4 4.3-11 6.1L952.8 709.3c-18.4 10.4-29.4 30-29.4 51.4V1248l-155.1-89.4V755.8c-.1-187.099 151.601-338.9 339-339.2z" fill="#fff" />
                            <use href="#chatgpt-a" transform="rotate(60 1203 1203)" />
                            <use href="#chatgpt-a" transform="rotate(120 1203 1203)" />
                            <use href="#chatgpt-a" transform="rotate(180 1203 1203)" />
                            <use href="#chatgpt-a" transform="rotate(240 1203 1203)" />
                            <use href="#chatgpt-a" transform="rotate(300 1203 1203)" />
                            <defs>
                              <path id="chatgpt-a" d="M1107.3 299.1c-197.999 0-373.9 127.3-435.2 315.3L650 743.5v427.9c0 21.4 11 40.4 29.4 51.4l344.5 198.515V833.3h.1v-27.9L1372.7 604c33.715-19.52 70.44-32.857 108.47-39.828L1447.6 450.3C1361 353.5 1237.1 298.5 1107.3 299.1zm0 117.5-.6.6c79.699 0 156.3 27.5 217.6 78.4-2.5 1.2-7.4 4.3-11 6.1L952.8 709.3c-18.4 10.4-29.4 30-29.4 51.4V1248l-155.1-89.4V755.8c-.1-187.099 151.601-338.9 339-339.2z" fill="#fff" />
                            </defs>
                          </svg>
                        </div>
                        <h4>{t.platforms.chatgpt.title}</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>{t.platforms.chatgpt.description}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <circle cx="24" cy="24" r="4" fill="#9333EA" />
                            <path d="M24 14V20M24 28V34M14 24H20M28 24H34" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" />
                            <path d="M17.64 17.64L21.88 21.88M26.12 26.12L30.36 30.36M30.36 17.64L26.12 21.88M21.88 26.12L17.64 30.36" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                        <h4>{t.platforms.any.title}</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>{t.platforms.any.description}</p>
                      </div>
                    </div>

                    <div style={{ marginTop: '60px', padding: '40px', background: '#f8f6fe', borderRadius: '12px' }}>
                      <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>{t.platforms.demo.title}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ marginBottom: '15px' }}>Claude Desktop + Excel = Magic</h4>
                          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px' }}>
                            <div style={{ marginBottom: '15px' }}>
                              <span style={{ color: '#666' }}>You:</span> "Calculate pricing for 500 units of PRO-001 for an enterprise customer in the US"
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                              <span style={{ color: '#9333EA' }}>Claude:</span> "I'll calculate that using your pricing model..."
                            </div>
                            <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                              Using SpreadAPI: pricing-model<br />
                              → Base price: $12,500<br />
                              → Volume discount: -$1,875<br />
                              → Enterprise tier: -$1,250<br />
                              → Final price: $9,375
                            </div>
                            <div>
                              <span style={{ color: '#9333EA' }}>Claude:</span> "The total is $9,375 including all applicable discounts."
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 style={{ marginBottom: '15px' }}>Real Excel Calculations</h4>
                          <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'start' }}>
                              <span style={{ color: '#22c55e', marginRight: '10px' }}>✓</span>
                              <div>
                                <strong>100% Accurate</strong><br />
                                <span style={{ fontSize: '14px', color: '#666' }}>Uses your actual Excel formulas</span>
                              </div>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'start' }}>
                              <span style={{ color: '#22c55e', marginRight: '10px' }}>✓</span>
                              <div>
                                <strong>Always Current</strong><br />
                                <span style={{ fontSize: '14px', color: '#666' }}>Updates when you change Excel</span>
                              </div>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'start' }}>
                              <span style={{ color: '#22c55e', marginRight: '10px' }}>✓</span>
                              <div>
                                <strong>Fully Secure</strong><br />
                                <span style={{ fontSize: '14px', color: '#666' }}>AI only sees results, not formulas</span>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Integration Guide */}
            <section id="quick-setup" className="section-home-setup" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Quick Setup</div>
                            </div>
                          </div>
                          <h2>
                            Connect Your AI Assistant in <span className="text-color-primary">3 Minutes</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            Choose your AI platform and follow the simple setup guide
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Platform Tabs */}
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                      {/* ChatGPT Section */}
                      <div style={{ marginBottom: '48px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          marginBottom: '24px',
                          paddingBottom: '16px',
                          borderBottom: '2px solid #10a37f'
                        }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="#10a37f"/>
                          </svg>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '24px' }}>ChatGPT</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Easiest setup with OAuth - no configuration files needed</p>
                          </div>
                          <span style={{
                            background: '#10a37f',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            marginLeft: 'auto'
                          }}>RECOMMENDED</span>
                        </div>

                        {/* ChatGPT Step 1 */}
                        <div style={{
                          background: 'white',
                          padding: '32px',
                          borderRadius: '12px',
                          marginBottom: '16px',
                          border: '1px solid #e8e8e8'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: '#10a37f',
                              color: 'white',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>1</div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ marginBottom: '12px', fontSize: '18px' }}>Open ChatGPT Settings</h4>
                              <p style={{ marginBottom: '16px', color: '#666', fontSize: '15px' }}>
                                In ChatGPT, click your profile icon and navigate to <strong>Settings → Apps and Connectors</strong> (or "Apps und Konnektoren" in German).
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ChatGPT Step 2 */}
                        <div style={{
                          background: 'white',
                          padding: '32px',
                          borderRadius: '12px',
                          marginBottom: '16px',
                          border: '1px solid #e8e8e8'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: '#10a37f',
                              color: 'white',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>2</div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ marginBottom: '12px', fontSize: '18px' }}>Add SpreadAPI as MCP Server</h4>
                              <p style={{ marginBottom: '16px', color: '#666', fontSize: '15px' }}>
                                Click <strong>Create</strong> to add a new connector. In the "MCP Server URL" field, paste your service URL:
                              </p>
                              <div style={{
                                background: '#f5f5f5',
                                padding: '16px',
                                borderRadius: '8px',
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                marginBottom: '16px',
                                border: '1px solid #e8e8e8',
                                wordBreak: 'break-all'
                              }}>
                                https://spreadapi.io/api/mcp/service/YOUR_SERVICE_ID
                              </div>
                              <p style={{ marginBottom: '0', color: '#666', fontSize: '14px' }}>
                                Select <strong>OAuth</strong> as authentication method, then click <strong>Create</strong>.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ChatGPT Step 3 */}
                        <div style={{
                          background: 'white',
                          padding: '32px',
                          borderRadius: '12px',
                          border: '1px solid #e8e8e8'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: '#10a37f',
                              color: 'white',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>3</div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ marginBottom: '12px', fontSize: '18px' }}>Start Using Your Excel Calculations!</h4>
                              <p style={{ marginBottom: '16px', color: '#666', fontSize: '15px' }}>
                                ChatGPT will initiate the OAuth flow. Once connected, your service appears in the connectors list. Try these prompts:
                              </p>
                              <div style={{ display: 'grid', gap: '10px' }}>
                                <div style={{
                                  background: '#e8f5e9',
                                  padding: '14px 16px',
                                  borderRadius: '8px',
                                  borderLeft: '4px solid #10a37f',
                                  fontSize: '14px'
                                }}>
                                  "What parameters does this service need?"
                                </div>
                                <div style={{
                                  background: '#e8f5e9',
                                  padding: '14px 16px',
                                  borderRadius: '8px',
                                  borderLeft: '4px solid #10a37f',
                                  fontSize: '14px'
                                }}>
                                  "Calculate the quote for 500 units with enterprise discount"
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Claude Desktop Section */}
                      <div style={{ marginBottom: '48px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          marginBottom: '24px',
                          paddingBottom: '16px',
                          borderBottom: '2px solid #D97757'
                        }}>
                          <svg height="40" viewBox="0 0 24 24" width="40" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fillRule="nonzero" />
                          </svg>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '24px' }}>Claude Desktop</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Native MCP support with automatic NPX bridge</p>
                          </div>
                        </div>

                        {/* Claude Step 1 */}
                        <div style={{
                          background: 'white',
                          padding: '32px',
                          borderRadius: '12px',
                          marginBottom: '16px',
                          border: '1px solid #e8e8e8'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: '#D97757',
                              color: 'white',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>1</div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ marginBottom: '12px', fontSize: '18px' }}>Open Claude Desktop Settings</h4>
                              <p style={{ marginBottom: '0', color: '#666', fontSize: '15px' }}>
                                Click <strong>Claude → Settings</strong> (Mac) or <strong>File → Settings</strong> (Windows), then select the <strong>Developer</strong> tab and click <strong>Edit Config</strong>.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Claude Step 2 */}
                        <div style={{
                          background: 'white',
                          padding: '32px',
                          borderRadius: '12px',
                          marginBottom: '16px',
                          border: '1px solid #e8e8e8'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: '#D97757',
                              color: 'white',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>2</div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ marginBottom: '12px', fontSize: '18px' }}>Add the SpreadAPI Configuration</h4>
                              <p style={{ marginBottom: '16px', color: '#666', fontSize: '15px' }}>
                                Add this to your <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>claude_desktop_config.json</code> file:
                              </p>
                              <pre style={{
                                background: '#1a1a1a',
                                color: '#e0e0e0',
                                padding: '20px',
                                borderRadius: '8px',
                                overflow: 'auto',
                                fontSize: '13px',
                                lineHeight: '1.6'
                              }}>
{`{
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "https://spreadapi.io/api/mcp/service/YOUR_SERVICE_ID",
        "SPREADAPI_TOKEN": "your_token_here"
      }
    }
  }
}`}
                              </pre>
                              <div style={{
                                background: '#fff4e6',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginTop: '16px',
                                fontSize: '13px',
                                color: '#ad6800',
                                border: '1px solid #ffd591'
                              }}>
                                <strong>Note:</strong> Replace <code style={{ background: '#fff', padding: '2px 4px', borderRadius: '4px' }}>YOUR_SERVICE_ID</code> with your actual service ID and <code style={{ background: '#fff', padding: '2px 4px', borderRadius: '4px' }}>your_token_here</code> with your API token from SpreadAPI.
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Claude Step 3 */}
                        <div style={{
                          background: 'white',
                          padding: '32px',
                          borderRadius: '12px',
                          border: '1px solid #e8e8e8'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: '#D97757',
                              color: 'white',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>3</div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ marginBottom: '12px', fontSize: '18px' }}>Restart and Start Using!</h4>
                              <p style={{ marginBottom: '16px', color: '#666', fontSize: '15px' }}>
                                Restart Claude Desktop. The MCP bridge downloads automatically via NPX. Your service will appear in the MCP menu. Try these prompts:
                              </p>
                              <div style={{ display: 'grid', gap: '10px' }}>
                                <div style={{
                                  background: '#fef3ed',
                                  padding: '14px 16px',
                                  borderRadius: '8px',
                                  borderLeft: '4px solid #D97757',
                                  fontSize: '14px'
                                }}>
                                  "What parameters does this service need?"
                                </div>
                                <div style={{
                                  background: '#fef3ed',
                                  padding: '14px 16px',
                                  borderRadius: '8px',
                                  borderLeft: '4px solid #D97757',
                                  fontSize: '14px'
                                }}>
                                  "Compare 3 pricing scenarios using this calculator"
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Other Platforms Section */}
                      <div style={{ marginBottom: '48px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          marginBottom: '24px',
                          paddingBottom: '16px',
                          borderBottom: '2px solid #9333EA'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: '#9333EA',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '24px' }}>Other AI Platforms & Custom Apps</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>REST API, SDKs, and MCP protocol for any integration</p>
                          </div>
                        </div>

                        <div style={{
                          background: 'white',
                          padding: '32px',
                          borderRadius: '12px',
                          border: '1px solid #e8e8e8'
                        }}>
                          <p style={{ marginBottom: '20px', color: '#666', fontSize: '15px' }}>
                            SpreadAPI works with any platform that supports REST APIs or the Model Context Protocol (MCP). Perfect for:
                          </p>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginBottom: '24px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ color: '#9333EA', fontSize: '18px' }}>✓</span>
                              <span>Custom GPTs</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ color: '#9333EA', fontSize: '18px' }}>✓</span>
                              <span>GitHub Copilot</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ color: '#9333EA', fontSize: '18px' }}>✓</span>
                              <span>Cursor IDE</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ color: '#9333EA', fontSize: '18px' }}>✓</span>
                              <span>Zapier / Make</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ color: '#9333EA', fontSize: '18px' }}>✓</span>
                              <span>n8n Workflows</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ color: '#9333EA', fontSize: '18px' }}>✓</span>
                              <span>Your own apps</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <a href="/how-excel-api-works" style={{
                              display: 'inline-block',
                              background: '#9333EA',
                              color: 'white',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontWeight: '500',
                              fontSize: '14px'
                            }}>
                              See How It Works →
                            </a>
                            <a href="/app" style={{
                              display: 'inline-block',
                              background: 'transparent',
                              color: '#9333EA',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontWeight: '500',
                              fontSize: '14px',
                              border: '1px solid #9333EA'
                            }}>
                              Get Started Free
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Getting Your Service URL */}
                      <div style={{
                        padding: '32px',
                        background: '#f0f5ff',
                        borderRadius: '12px',
                        border: '1px solid #adc6ff',
                        marginBottom: '24px'
                      }}>
                        <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
                          <span style={{ fontSize: '24px' }}>💡</span>
                          Where to Find Your Service URL & Token
                        </h4>
                        <ol style={{ marginBottom: 0, paddingLeft: '20px', fontSize: '15px', color: '#444', lineHeight: '1.8' }}>
                          <li><a href="/" style={{ color: '#502D80', fontWeight: '500' }}>Sign up for SpreadAPI</a> and upload your Excel file</li>
                          <li>Define your inputs and outputs (point-and-click, no coding)</li>
                          <li>Publish your service</li>
                          <li>Go to <strong>Agents → MCP Integration</strong> to find your service URL and generate tokens</li>
                        </ol>
                      </div>

                      {/* Troubleshooting */}
                      <div style={{
                        padding: '32px',
                        background: '#fff4e6',
                        borderRadius: '12px',
                        border: '1px solid #ffd591'
                      }}>
                        <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="#fa8c16" strokeWidth="2"/>
                            <path d="M12 7V13M12 16H12.01" stroke="#fa8c16" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Need Help?
                        </h4>
                        <div style={{ display: 'grid', gap: '12px', fontSize: '15px', color: '#666' }}>
                          <div><strong>ChatGPT connector not working?</strong> Make sure you completed the OAuth flow and your service is published</div>
                          <div><strong>Claude not finding tools?</strong> Restart Claude Desktop after adding the config</div>
                          <div><strong>Authentication error?</strong> Double-check your token is copied correctly</div>
                          <div style={{ marginTop: '8px' }}>
                            Still stuck? Email us at <a href="mailto:team@airrange.io" style={{ color: '#502D80' }}>team@airrange.io</a>
                          </div>
                        </div>
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
                            <h2 className="text-color-white">Ready to Give Your AI Excel Superpowers?</h2>
                          </div>
                          <p className="text-size-medium text-color-white">
                            Set up in minutes. See results immediately. Transform how AI works with your business data.
                          </p>
                        </div>
                      </div>
                      <div className="margin-top margin-medium">
                        <div className="text-align-center" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <a href="/" className="button" style={{
                            background: 'white',
                            color: '#1a1a1a',
                            padding: '16px 32px',
                            fontSize: '18px',
                            fontWeight: '600',
                            minWidth: '200px',
                            border: 'none'
                          }}>
                            Start Free Trial
                          </a>
                          <a href="/how-excel-api-works" className="button" style={{
                            background: 'transparent',
                            border: '2px solid white',
                            color: 'white',
                            padding: '16px 32px',
                            fontSize: '18px',
                            fontWeight: '600',
                            minWidth: '200px'
                          }}>
                            See How It Works
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section> */}

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
                              <div>Questions?</div>
                            </div>
                          </div>
                          <h2>
                            We're Here to <span className="text-color-primary">Help</span>
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div className="home-contact-component">
                      <div className="home-contact-item">
                        <p>
                          Whether you're exploring possibilities or ready to implement, we're here to help at <a href="mailto:team@airrange.io">team@airrange.io</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <Footer locale={locale} currentPath="/excel-ai-integration" />
        </div>
      </div>
    </>
  );
}

export default function AIIntegrationPage() {
  return <AIIntegrationContent />;
}