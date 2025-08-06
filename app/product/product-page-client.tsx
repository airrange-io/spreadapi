'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './product.css';
import Footer from '@/components/product/Footer';
import ProductHeader from '@/components/product/ProductHeader';
import { developerFAQs } from '@/data/developer-faq';
import Navigation from '@/components/Navigation';
import { IntercomProvider } from '../components/IntercomProvider';
import { IntercomScript } from '../components/IntercomScript';

const ProductPage: React.FC = () => {
  const [ctaEmail, setCtaEmail] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleCtaEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle CTA email submission
    console.log('CTA Email submitted:', ctaEmail);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = developerFAQs;

  return (
    <IntercomProvider>
      <link rel="stylesheet" href="/fonts/satoshi-fixed.css" />
      <div className="product-page">
        <style jsx global>{`
          .product-page,
          .product-page * {
            font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `}</style>

        <div className="page-wrapper">
          {/* Navigation */}
          <Navigation currentPage="product" />

          <main className="main-wrapper">
            {/* Hero Section */}
            <ProductHeader
              subheading="Excel as a Web Service"
              title={<>Turn Excel Into APIs.<br /><span className="text-color-primary">Let AI Talk to Spreadsheets</span></>}
              description="Transform your Excel spreadsheets into secure web services. Enable AI assistants to work with your complex calculations and business logic without hallucinations."
              primaryButtonText="Create your first free Excel API"
              primaryButtonHref="/"
              secondaryButtonText="View Documentation"
              secondaryButtonHref="/docs"
              showImage={true}
            />

            {/* Developer Hook Section */}
            <section style={{ 
              padding: '0 0 80px 0'
            }}>
              <div className="padding-global">
                <div className="container-large">
                  <div style={{ 
                    maxWidth: '700px', 
                    margin: '0 auto',
                    textAlign: 'center'
                  }}>
                    <p style={{ 
                      fontSize: '20px',
                      lineHeight: '1.6',
                      color: '#374151',
                      marginBottom: '16px'
                    }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>"Just convert this Excel to code,"</span> they said.
                    </p>
                    
                    <p style={{
                      fontSize: '18px',
                      lineHeight: '1.6',
                      color: '#6b7280',
                      marginBottom: '24px'
                    }}>
                      Six months later, you're debugging why JavaScript is off by $0.03.
                    </p>
                    
                    <Link 
                      href="/blog/stop-reimplementing-excel-business-logic-javascript"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: '#9333EA',
                        textDecoration: 'none',
                        fontSize: '16px',
                        fontWeight: '600',
                        gap: '6px',
                        borderBottom: '2px solid transparent',
                        transition: 'border-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderBottomColor = '#9333EA';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderBottomColor = 'transparent';
                      }}
                    >
                      Why developers waste months reimplementing Excel
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5 3.5L3.5 10.5M10.5 3.5V9.5M10.5 3.5H4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Pain Point Section */}
            <section className="section-pain-point" style={{ background: '#f8f9fa', padding: '60px 0' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="text-align-center" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
                      Why AI Struggles with <span style={{ color: '#9333EA' }}>Spreadsheet Math</span>
                    </h2>
                    <p style={{ fontSize: '18px', color: '#666666', marginBottom: '50px' }}>
                      AI's honest request for help
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
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>"I Can't Run Your Formulas"</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          I see your formulas and Excel's results, but I can't execute them. I work with saved values, not live calculations.
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          - Claude, ChatGPT & Gemini
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
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>"I Only Know 50-100 Functions"</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          Basic math? Sure. But Excel has hundreds more - XIRR, YIELD, array formulas? I'll miss edge cases.
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          - Claude, being honest
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
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>"My Errors Compound Fast"</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          One small mistake in cell A1? By row 1000, I'm completely off. Error propagation is my nightmare.
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          - Every AI Model
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
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>"I Take Forever to Calculate"</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          1000+ formulas? That's 2-15 minutes of dependency mapping. Excel does it in 1-2 seconds.
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          - Every AI Model
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
                            <path d="M14 4C8.477 4 4 8.477 4 14C4 19.523 8.477 24 14 24" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M16 14L24 14" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            <text x="14" y="17" textAnchor="middle" fontSize="12" fill="#9333EA">20%</text>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>"Complex Models? 20% Accuracy"</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          With 1000+ formulas, I have 20-40% chance of getting it right. SpreadAPI? Always 100%.
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          - Claude & ChatGPT
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
                        <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#1f2937' }}>"I Can't Handle Dependencies"</h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.5', marginBottom: '12px' }}>
                          Cell A depends on B, B on C... I spend most time figuring out order, not calculating.
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                          - Gemini
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: '50px', textAlign: 'center' }}>
                      <p style={{ fontSize: '20px', color: '#374151', marginBottom: '30px' }}>
                        <strong style={{ color: '#9333EA' }}>SpreadAPI:</strong> Your Excel stays Excel. AI gets exact results. Always 100% accurate.
                      </p>
                      <Link href="/product/why-ai-fails-at-math" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '14px 28px',
                        background: 'white',
                        border: '2px solid #9333EA',
                        borderRadius: '8px',
                        color: '#9333EA',
                        textDecoration: 'none',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}>
                        Here's What AI Told Us →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Feature Section 1 */}
            <section id="feature" className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            <span className="text-color-primary">AI Sales Agents</span> Creating Complex Excel Quotes
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            Your AI sales assistant can now generate accurate quotes using your actual Excel pricing models. No more approximations or hallucinations — just precise calculations from your trusted spreadsheets, accessible through a simple API.
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
                            <p className="text-size-medium">100% Accurate Calculations</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-size-medium">Your Business Logic Protected</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-size-medium">Works with Any AI Assistant</p>
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
                              I need a quote for 500 units with our enterprise discount, shipped to 3 locations in California
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
                                I've calculated your quote using our Excel pricing model:
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
                                  <span>Base Price (500 × $47.99):</span>
                                  <strong>$23,995.00</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span>Enterprise Discount (15%):</span>
                                  <strong style={{ color: '#16a34a' }}>-$3,599.25</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span>Volume Discount (500+):</span>
                                  <strong style={{ color: '#16a34a' }}>-$1,199.75</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span>CA Shipping (3 locations):</span>
                                  <strong>$485.00</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span>CA Sales Tax (7.25%):</span>
                                  <strong>$1,431.88</strong>
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
                                  <span>Total Quote:</span>
                                  <span>$21,112.88</span>
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
                                <span>Calculated by Excel in 47ms • 100% accurate</span>
                                <span style={{
                                  color: '#9333EA',
                                  textDecoration: 'none',
                                  fontSize: '11px',
                                  opacity: 0.8,
                                  cursor: 'pointer'
                                }}>
                                  Download PDF
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

            {/* Technical Differentiators Section */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="text-align-center">
                      <div className="margin-bottom margin-xsmall">
                        <div className="subheading">
                          <div>Why We're Different</div>
                        </div>
                      </div>
                      <div className="margin-bottom margin-large">
                        <h2>Give AI <span className="text-color-primary">Your Excel Superpowers</span></h2>
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
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>Predictable Every Time</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            AI gives different answers each time. But Excel? Excel actually calculates. Every. Single. Time.
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
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>500+ Excel Functions</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            VLOOKUP, XLOOKUP, array formulas, financial functions - 500+ functions work exactly as in Excel
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
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>Real-Time Calculations</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            50ms response times with intelligent caching and pre-warmed Excel engines
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
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>No Files Sent to OpenAI/Anthropic</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            Your Excel stays on SpreadAPI servers. AI only sees the specific inputs and outputs you define
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
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>AI-Ready with MCP</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            Native Model Context Protocol support for seamless ChatGPT and Claude integration
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
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>Zero Learning Curve</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            Your team keeps using Excel as always. AI gets superpowers. No training needed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Feature Section 2 */}
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
                            {/* Spreadsheet Container */}
                            <rect x="10" y="10" width="480" height="320" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2" />

                            {/* Column Headers */}
                            <rect x="10" y="10" width="480" height="40" fill="#F8F6FE" rx="8 8 0 0" />
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

                            {/* Row Numbers */}
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

                            {/* Grid Lines */}
                            <line x1="170" y1="50" x2="170" y2="330" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="250" y1="50" x2="250" y2="330" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="330" y1="50" x2="330" y2="330" stroke="#E8E0FF" strokeWidth="1" />
                            <line x1="410" y1="50" x2="410" y2="330" stroke="#E8E0FF" strokeWidth="1" />

                            {/* AI Access Area 1 - Input Area (Green) */}
                            <rect x="90" y="90" width="160" height="80" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="2" strokeDasharray="4 2" rx="4" />
                            <text x="170" y="75" textAnchor="middle" fill="#10B981" fontSize="12" fontWeight="600">AI Can Edit</text>

                            {/* Sample Data in Input Area */}
                            <text x="130" y="115" textAnchor="middle" fill="#1F2937" fontSize="13">Quantity</text>
                            <text x="210" y="115" textAnchor="middle" fill="#1F2937" fontSize="13">500</text>
                            <text x="130" y="155" textAnchor="middle" fill="#1F2937" fontSize="13">Discount</text>
                            <text x="210" y="155" textAnchor="middle" fill="#1F2937" fontSize="13">15%</text>

                            {/* AI Access Area 2 - Read-Only Area (Blue) */}
                            <rect x="250" y="210" width="240" height="80" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 2" rx="4" />
                            <text x="370" y="195" textAnchor="middle" fill="#3B82F6" fontSize="12" fontWeight="600">AI Read-Only</text>

                            {/* Sample Data in Read-Only Area */}
                            <text x="290" y="235" textAnchor="middle" fill="#1F2937" fontSize="13">Total</text>
                            <text x="370" y="235" textAnchor="middle" fill="#1F2937" fontSize="13">$21,112</text>
                            <text x="290" y="275" textAnchor="middle" fill="#1F2937" fontSize="13">Tax</text>
                            <text x="370" y="275" textAnchor="middle" fill="#1F2937" fontSize="13">$1,432</text>

                            {/* Protected Area (Gray with Lock) */}
                            <rect x="330" y="90" width="160" height="80" fill="#6B7280" fillOpacity="0.1" rx="4" />
                            <g transform="translate(395, 120)">
                              <rect x="-8" y="-4" width="16" height="12" rx="2" stroke="#6B7280" strokeWidth="1.5" fill="none" />
                              <path d="M-5 -4V-7C-5 -9.76142 -2.76142 -12 0 -12C2.76142 -12 5 -9.76142 5 -7V-4" stroke="#6B7280" strokeWidth="1.5" fill="none" />
                              <circle cx="0" cy="2" r="1.5" fill="#6B7280" />
                            </g>
                            <text x="410" y="155" textAnchor="middle" fill="#6B7280" fontSize="11">Protected</text>

                            {/* Legend */}
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
                            <span className="text-color-primary">Editable Areas</span> Give AI Controlled Access
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            Define exactly what parts of your spreadsheet AI can access. Grant read-only access to outputs, or let AI modify specific input cells or even formulas within designated areas. You stay in control while AI does the work.
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
                                <h3 className="heading-style-h5">Granular Permissions</h3>
                              </div>
                              <p className="text-size-medium">Control exactly what AI can see and modify. Set permissions for values, formulas, formatting, and structure — keeping your core business logic secure.</p>
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
                                <h3 className="heading-style-h5">Formula Intelligence</h3>
                              </div>
                              <p className="text-size-medium">AI can not only read values but understand and even optimize your Excel formulas. Enable what-if scenarios and let AI experiment within safe boundaries.</p>
                            </div>
                          </div>
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
                          <div className="tools-logo">Claude</div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo">ChatGPT</div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo">Copilot</div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo">Gemini</div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo">Excel</div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo">Zapier</div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo">n8n</div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo">Make</div>
                        </div>
                        <div className="tools-item">
                          <div className="tools-logo">API</div>
                        </div>
                      </div>
                      <div className="tools-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            Works With <span className="text-color-primary">Every AI Platform</span> and Automation Tool
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            SpreadAPI works with Claude, ChatGPT, and any AI assistant through our MCP server. Connect via REST API, webhooks, or integrate with Zapier, Make, and n8n. Your Excel calculations become accessible everywhere.
                          </p>
                        </div>
                        <a href="#cta" className="button">Start Building</a>
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
                              <div>Use Cases</div>
                            </div>
                          </div>
                          <div className="text-align-center">
                            <h2>
                              What <span className="text-color-primary">Game-Changing Technology</span> Enables
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
                          <h3>Financial Advisors</h3>
                        </div>
                        <p>Run complex what-if scenarios using actual Excel models. AI analyzes options without errors.</p>
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
                          <h3>Business Analysts</h3>
                        </div>
                        <p>Automate report generation from spreadsheet data. AI extracts insights from your calculations.</p>
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
                          <h3>AI Assistants</h3>
                        </div>
                        <p>Optimize spreadsheet formulas automatically. AI suggests improvements while preserving logic.</p>
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
                          <h3>Sales Teams</h3>
                        </div>
                        <p>Generate accurate quotes instantly. AI uses your pricing models to create perfect proposals.</p>
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
                          <h3>Operations</h3>
                        </div>
                        <p>Complex resource planning with Excel. AI optimizes allocation using your business rules.</p>
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
                          <h3>Developers</h3>
                        </div>
                        <p>Skip rebuilding Excel logic in code. Use spreadsheets as calculation engines via API.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Developer FAQ Section */}
            <section id="faq" className="section-home-faq">
              <div className="padding-global">
                <div className="container-medium">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Developer FAQ</div>
                            </div>
                          </div>
                          <div className="margin-bottom margin-small">
                            <h2>Technical Questions <span className="text-color-primary">Answered</span></h2>
                          </div>
                          <p className="text-size-medium">Deep dive into the technical details. Built by developers, for developers.</p>
                        </div>
                      </div>
                    </div>
                    <div className="faq-collection-wrapper">
                      <div className="faq-collection-list">
                        {faqItems.map((item, index) => (
                          <div key={index} className="faq-collection-item">
                            <div className="faq-accordion">
                              <div className="faq-question" onClick={() => toggleFaq(index)}>
                                <div className="heading-style-h6">{item.question}</div>
                                <svg
                                  className={`icon-1x1-small ${expandedFaq === index ? 'rotate' : ''}`}
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M12 5V19M5 12H19" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <div className={`faq-answer ${expandedFaq === index ? 'expanded' : ''}`}>
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

            {/* CTA Section */}
            <section id="cta" className="section-home-cta">
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
                          <a href="/" className="button" style={{
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
                              <div>Contact</div>
                            </div>
                          </div>
                          <h2>
                            <span className="text-color-primary">Get Started</span> in Minutes
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div className="home-contact-component">
                      <div className="home-contact-item">
                        <p>
                          Questions about SpreadAPI? We're here to help at <a href="mailto:team@airrange.io">team@airrange.io</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
      <IntercomScript />
    </IntercomProvider>
  );
};

export default ProductPage;