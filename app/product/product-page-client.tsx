'use client';

import React, { useState } from 'react';
import './product.css';
import Footer from '@/components/product/Footer';
import { developerFAQs } from '@/data/developer-faq';
import Navigation from '@/components/Navigation';

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
    <>
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
                                <div>Excel as a Web Service</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                Turn Excel Into APIs.<br />
                                <span className="text-color-primary">Let AI Talk to Spreadsheets</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '560px', margin: '0 auto' }}>Transform your Excel spreadsheets into secure web services. Enable AI assistants to work with your complex calculations and business logic without hallucinations.</p>
                            <div className="margin-top margin-medium">
                              <div className="waitlist-form-signup" style={{ justifyContent: 'center', gap: '16px' }}>
                                <a href="/" className="button w-button" style={{ 
                                  width: 'auto', 
                                  padding: '14px 28px',
                                  fontSize: '16px',
                                  fontWeight: '600'
                                }}>
                                  Get Instant API Access
                                </a>
                                <a href="/docs" className="button" style={{ 
                                  width: 'auto', 
                                  padding: '14px 28px',
                                  background: 'transparent',
                                  border: '2px solid #9333EA',
                                  color: '#9333EA',
                                  fontSize: '16px',
                                  fontWeight: '600'
                                }}>
                                  View Documentation
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="header-image-wrapper">
                        <div className="header-image-placeholder">
                          <svg viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="800" height="500" fill="#F8F6FE" />
                            <rect x="50" y="50" width="700" height="400" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2" />
                            <rect x="80" y="80" width="200" height="340" rx="4" fill="#F8F6FE" />
                            <rect x="300" y="80" width="200" height="160" rx="4" fill="#F8F6FE" />
                            <rect x="520" y="80" width="200" height="220" rx="4" fill="#F8F6FE" />
                            <rect x="300" y="260" width="200" height="160" rx="4" fill="#F8F6FE" />
                            <rect x="520" y="320" width="200" height="100" rx="4" fill="#F8F6FE" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Pain Point Section */}
            <section className="section-pain-point" style={{ background: '#f8f9fa', padding: '60px 0' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="text-align-center" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>
                      Why LLMs <span style={{ color: '#ef4444' }}>Fail</span> at Excel Calculations
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginTop: '50px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="60" height="60" rx="12" fill="#9333EA" fillOpacity="0.1" />
                            <path d="M30 20V30M30 40H30.01" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="30" cy="30" r="18" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4"/>
                          </svg>
                        </div>
                        <h3 style={{ color: '#9333EA', marginBottom: '10px' }}>Hallucinated Numbers</h3>
                        <p style={{ color: '#666666', fontSize: '0.95rem' }}>
                          LLMs guess at calculations and often return completely wrong results, especially with complex formulas
                        </p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="60" height="60" rx="12" fill="#9333EA" fillOpacity="0.1" />
                            <rect x="15" y="15" width="30" height="30" rx="4" stroke="#9333EA" strokeWidth="2"/>
                            <path d="M22 25H38M22 30H38M22 35H38" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M35 40L40 45M40 45L45 40M40 45V20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 style={{ color: '#9333EA', marginBottom: '10px' }}>Lost Formulas</h3>
                        <p style={{ color: '#666666', fontSize: '0.95rem' }}>
                          File uploads only capture static values, losing all your Excel logic, formulas, and dependencies
                        </p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="60" height="60" rx="12" fill="#9333EA" fillOpacity="0.1" />
                            <path d="M35 27H25C23.8954 27 23 27.8954 23 29V39C23 40.1046 23.8954 41 25 41H35C36.1046 41 37 40.1046 37 39V29C37 27.8954 36.1046 27 35 27Z" stroke="#9333EA" strokeWidth="2"/>
                            <path d="M27 27V23C27 21.6739 27.5268 20.4021 28.4645 19.4645C29.4021 18.5268 30.6739 18 32 18C33.3261 18 34.5979 18.5268 35.5355 19.4645C36.4732 20.4021 37 21.6739 37 23V27" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"/>
                            <circle cx="30" cy="34" r="1.5" fill="#9333EA"/>
                          </svg>
                        </div>
                        <h3 style={{ color: '#9333EA', marginBottom: '10px' }}>Data Security Risk</h3>
                        <p style={{ color: '#666666', fontSize: '0.95rem' }}>
                          Uploading sensitive spreadsheets to AI providers exposes your proprietary business logic
                        </p>
                      </div>
                    </div>
                    <div style={{ marginTop: '50px', padding: '30px', background: 'rgba(147, 51, 234, 0.1)', borderRadius: '12px', border: '1px solid rgba(147, 51, 234, 0.3)' }}>
                      <h3 style={{ color: '#9333EA', marginBottom: '15px' }}>The SpreadAPI Solution</h3>
                      <p style={{ color: '#374151', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        Let LLMs handle the words, leave calculations to Excel. Your spreadsheets stay on our secure servers, 
                        never uploaded to AI providers. Real Excel engine ensures 100% accurate results every time.
                      </p>
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
                        <div className="feature-image-placeholder">
                          <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="600" height="400" fill="#F8F6FE" rx="12" />
                            <rect x="40" y="40" width="520" height="320" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2" />
                            <rect x="70" y="70" width="460" height="40" rx="4" fill="#F8F6FE" />
                            <rect x="70" y="130" width="140" height="80" rx="4" fill="#F8F6FE" />
                            <rect x="230" y="130" width="140" height="80" rx="4" fill="#F8F6FE" />
                            <rect x="390" y="130" width="140" height="80" rx="4" fill="#F8F6FE" />
                            <rect x="70" y="230" width="140" height="80" rx="4" fill="#F8F6FE" />
                            <rect x="230" y="230" width="140" height="80" rx="4" fill="#F8F6FE" />
                          </svg>
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
                        <h2>Real Excel Engine, <span className="text-color-primary">Not CSV Parsing</span></h2>
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
                              <path d="M14 9C11.2386 9 9 11.2386 9 14C9 16.7614 11.2386 19 14 19C16.7614 19 19 16.7614 19 14C19 11.2386 16.7614 9 14 9Z" stroke="#9333EA" strokeWidth="1.5"/>
                              <path d="M14 4V7M14 21V24M24 14H21M7 14H4M21.07 6.93L19 9M9 19L6.93 21.07M21.07 21.07L19 19M9 9L6.93 6.93" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>Full Excel Formula Support</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            VLOOKUP, XLOOKUP, pivot tables, array formulas - everything works exactly as in Excel
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
                              <rect x="6" y="12" width="16" height="12" rx="2" stroke="#9333EA" strokeWidth="1.5"/>
                              <path d="M10 12V8C10 5.79086 11.7909 4 14 4C16.2091 4 18 5.79086 18 8V12" stroke="#9333EA" strokeWidth="1.5"/>
                              <circle cx="14" cy="17" r="1.5" fill="#9333EA"/>
                              <path d="M14 18.5V20" stroke="#9333EA" strokeWidth="1.5"/>
                            </svg>
                          </div>
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>No File Uploads to AI</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            Your Excel files stay on our servers. AI only receives calculation results, never your data
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
                              <rect x="8" y="10" width="12" height="10" rx="2" stroke="#9333EA" strokeWidth="1.5"/>
                              <circle cx="11" cy="13" r="1" fill="#9333EA"/>
                              <circle cx="17" cy="13" r="1" fill="#9333EA"/>
                              <path d="M11 17H17" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M14 6V10M10 6L14 6M18 6L14 6" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M6 15H8M20 15H22" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
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
                              <path d="M16 4L10 14H18L12 24" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>Real-Time Calculations</h3>
                          <p style={{ color: '#6b7280', fontSize: '15px' }}>
                            50ms response times with intelligent caching and pre-warmed Excel engines
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
                        <div className="feature-image-placeholder">
                          <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="600" height="400" fill="#E6F4FF" rx="12" />
                            <rect x="40" y="40" width="520" height="320" rx="8" fill="white" stroke="#B3E0FF" strokeWidth="2" />
                            <circle cx="100" cy="100" r="20" fill="#E6F4FF" />
                            <circle cx="500" cy="100" r="20" fill="#E6F4FF" />
                            <rect x="70" y="140" width="460" height="180" rx="8" fill="#F0F9FF" />
                            <rect x="90" y="160" width="420" height="40" rx="4" fill="#E6F4FF" />
                            <rect x="90" y="220" width="320" height="20" rx="4" fill="#E6F4FF" />
                            <rect x="90" y="250" width="280" height="20" rx="4" fill="#E6F4FF" />
                            <rect x="90" y="280" width="360" height="20" rx="4" fill="#E6F4FF" />
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

            {/* Testimonials Section */}
            <section className="section-home-testimonials">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-medium align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Testimonials</div>
                            </div>
                          </div>
                          <div className="margin-bottom margin-small">
                            <h2>
                              Real Results from <span className="text-color-primary">Early Adopters</span>
                            </h2>
                          </div>
                          <p className="text-size-medium">See how companies are transforming their Excel-based processes with AI integration.</p>
                        </div>
                      </div>
                    </div>
                    <div className="testimonials-component">
                      <div className="testimonials-item">
                        <div className="testimonial-content">
                          <div className="margin-bottom margin-medium">
                            <div className="heading-style-h5">"We turned our complex pricing spreadsheet into an API that our AI sales bot uses. Quote accuracy went from 70% to 100%, and quote generation time dropped from 2 hours to 30 seconds. Game-changing doesn't even begin to describe it."</div>
                          </div>
                        </div>
                        <div className="testimonial-author-wrapper">
                          <div className="testimonial-author-image-wrapper">
                            <div className="testimonial-author-image"></div>
                          </div>
                          <div className="testimonial-author-content-wrapper">
                            <p className="heading-style-h6">Sarah Chen</p>
                            <p>VP Sales, TechCorp</p>
                          </div>
                        </div>
                      </div>
                      <div className="testimonials-item">
                        <div className="testimonial-content">
                          <div className="margin-bottom margin-medium">
                            <div className="heading-style-h5">"Our financial advisors now use Claude to run scenarios on client portfolios. The AI accesses our Excel models through SpreadAPI, ensuring calculations are always accurate. Compliance loves it because the core logic stays protected in Excel."</div>
                          </div>
                        </div>
                        <div className="testimonial-author-wrapper">
                          <div className="testimonial-author-image-wrapper">
                            <div className="testimonial-author-image"></div>
                          </div>
                          <div className="testimonial-author-content-wrapper">
                            <p className="heading-style-h6">Marcus Johnson</p>
                            <p>CTO, WealthTech Solutions</p>
                          </div>
                        </div>
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
                            Get Instant API Access
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
                          Questions about SpreadAPI? We're here to help at <a href="mailto:hello@airrange.io">hello@airrange.io</a>.
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
    </>
  );
};

export default ProductPage;