'use client';

import React, { useState } from 'react';
import './product.css';

const ProductPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [ctaEmail, setCtaEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log('Email submitted:', email);
  };

  const handleCtaEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle CTA email submission
    console.log('CTA Email submitted:', ctaEmail);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    // Security & Compliance
    {
      question: 'How secure is SpreadAPI? Can AI see my proprietary formulas?',
      answer: 'Your Excel files stay on our secure servers and are never sent to AI providers. You control exactly what AI can access through granular permissions. Hide sensitive formulas while exposing only the inputs and outputs you choose. All data is encrypted and automatically deleted after processing.'
    },
    {
      question: 'How does SpreadAPI work with AI assistants like Claude?',
      answer: 'SpreadAPI provides an MCP (Model Context Protocol) server that AI assistants can connect to. Once connected, the AI can call your Excel calculations as functions, read designated areas, and even modify values or formulas within the permissions you set. It\'s like giving AI a secure API to your spreadsheets.'
    },
    {
      question: 'Can I use my existing Excel files without modifications?',
      answer: 'Yes! Upload your Excel file as-is. SpreadAPI works with your existing formulas, macros, and complex calculations. Simply define which cells are inputs, which are outputs, and optionally create editable areas for AI interaction. No need to rebuild your business logic.'
    },

    // Capabilities & Features
    {
      question: 'What kind of Excel calculations can SpreadAPI handle?',
      answer: 'SpreadAPI handles everything from simple formulas to complex financial models with thousands of calculations, pivot tables, and multi-sheet dependencies. We support XLSX files up to 5MB after optimization - we automatically remove unused data to ensure lightning-fast performance.'
    },
    {
      question: 'What are Editable Areas and how do they work?',
      answer: 'Editable Areas let you define specific ranges in your spreadsheet that AI can access. Set granular permissions: read-only for outputs, write access for inputs, or even allow formula modifications. For example, let AI experiment with different scenarios in a "sandbox" area while keeping your core model protected.'
    },
    {
      question: 'How do I integrate SpreadAPI with my existing systems?',
      answer: 'SpreadAPI offers multiple integration options: REST API for any programming language, MCP server for AI assistants, webhooks for real-time updates, and pre-built integrations with Zapier, Make, and n8n. Use our SDKs for Python, JavaScript, and other languages to get started in minutes.'
    },
    {
      question: 'What happens when my Excel file is updated?',
      answer: 'Simply upload the new version, and SpreadAPI automatically updates your API. All existing integrations continue working if the inputs/outputs remain the same. You can version your APIs, test changes in staging, and roll back if needed. Perfect for evolving business logic.'
    },
    {
      question: 'How fast are the calculations?',
      answer: 'Most calculations complete in under 100ms. Complex models with thousands of formulas typically process in 1-2 seconds. SpreadAPI uses intelligent caching and optimized calculation engines to ensure your AI assistants get instant responses, making real-time interactions smooth and natural.'
    },

    // Use Cases
    {
      question: 'What are the most common use cases?',
      answer: 'Popular uses include: AI-powered quote generation using pricing spreadsheets, financial advisors running client scenarios, automated reporting from Excel dashboards, resource optimization with constraint models, and letting AI assistants work with complex business rules without coding them from scratch.'
    },
    {
      question: 'Can SpreadAPI handle real-time calculations?',
      answer: 'Absolutely! SpreadAPI processes requests in real-time with sub-second response times. Your AI assistant can iterate through hundreds of scenarios, update values, and get instant results. Perfect for interactive experiences like sales conversations, financial planning sessions, or optimization tasks.'
    },

    // Technical & Privacy
    {
      question: 'Do you store my Excel files?',
      answer: 'Your Excel files are encrypted and stored only for the duration of your service. Files are processed in memory, cached for performance, and automatically purged based on your retention settings. You can delete your data anytime. We never access your files except to process API requests.'
    },
    {
      question: 'Is SpreadAPI GDPR/SOC 2 compliant?',
      answer: 'Yes! SpreadAPI is hosted in Frankfurt, Europe, ensuring compliance for European customers. All data is encrypted in transit and at rest. You maintain full control over data retention and can delete your data anytime. Your spreadsheets never leave our secure European servers.'
    },
    {
      question: 'Can I try SpreadAPI for free?',
      answer: 'Yes! Start with our free tier: create up to 3 APIs, 1000 calculations per month, and test all features including AI integration. No credit card required. Our paid plans start at $29/month for unlimited APIs and 100k calculations. Enterprise plans include dedicated support and custom limits.'
    },
    {
      question: 'Why not just rebuild the Excel logic in code?',
      answer: 'Excel represents years of refined business logic that\'s constantly evolving. Rebuilding means bugs, maintenance, and keeping two systems in sync. SpreadAPI lets you use Excel as the single source of truth while making it accessible to AI and automation. Update the spreadsheet, and your API updates automatically.'
    }
  ];

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
          <nav className="navbar-component">
            <div className="navbar-container">
              <a href="/" className="navbar-logo-link">
                <img src="/icons/logo-full.svg" alt="SpreadAPI" className="navbar-logo" />
              </a>

              <div className="navbar-menu">
                <a href="#feature" className="navbar-link">Features</a>
                <a href="#benefits" className="navbar-link">Benefits</a>
                <a href="#faq" className="navbar-link">Faqs</a>
              </div>

              <div className="navbar-button-wrapper">
                <a href="#cta" className="button hide-mobile-portrait">Get Started</a>
                <button
                  className="navbar-menu-button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <div className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
                    <div className="menu-icon-line-top"></div>
                    <div className="menu-icon-line-center">
                      <div className="menu-icon-line-center-inner"></div>
                    </div>
                    <div className="menu-icon-line-bottom"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="mobile-menu">
                <nav className="mobile-nav">
                  <a href="#feature" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
                  <a href="#benefits" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
                  <a href="#faq" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Faqs</a>
                  <a href="#cta" className="button w-button" onClick={() => setMobileMenuOpen(false)}>Get Started</a>
                </nav>
              </div>
            )}
          </nav>

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
                              <form onSubmit={handleEmailSubmit} className="waitlist-form-signup">
                                <input
                                  className="form-input is-waitlist"
                                  maxLength={256}
                                  name="email"
                                  placeholder="name@email.com"
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required
                                />
                                <input type="submit" className="button" value="Get Early Access" />
                              </form>
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

            {/* FAQ Section */}
            <section id="faq" className="section-home-faq">
              <div className="padding-global">
                <div className="container-small">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Faqs</div>
                            </div>
                          </div>
                          <div className="margin-bottom margin-small">
                            <h2>Your Questions Answered</h2>
                          </div>
                          <p className="text-size-medium">Everything you need to know about turning Excel into AI-powered APIs. Can't find what you're looking for? Reach out to our team for personalized assistance.</p>
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
                                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                            <h2 className="text-color-white">Ready to Turn Your Spreadsheets Into AI-Powered APIs?</h2>
                          </div>
                          <p className="text-size-medium text-color-white">Join forward-thinking companies using SpreadAPI to bridge Excel and AI. Start with our free tier and transform your spreadsheets in minutes.</p>
                        </div>
                      </div>
                      <div className="margin-top margin-medium">
                        <div className="waitlist-form-wrapper">
                          <form onSubmit={handleCtaEmailSubmit} className="waitlist-form">
                            <div className="waitlist-form-signup">
                              <input
                                className="form-input is-waitlist"
                                maxLength={256}
                                name="email-2"
                                placeholder="Enter your email"
                                type="email"
                                value={ctaEmail}
                                onChange={(e) => setCtaEmail(e.target.value)}
                                required
                              />
                              <input type="submit" className="button button-white" value="Get Started Free" />
                            </div>
                            <div className="margin-top margin-xsmall">
                              <div className="text-size-tiny text-color-white">
                                I Accept the <a href="https://www.airrange.io/terms" className="text-link text-color-white">Terms of Service</a>.
                              </div>
                            </div>
                          </form>
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
          <footer className="footer">
          </footer>
        </div>
      </div>
    </>
  );
};

export default ProductPage;