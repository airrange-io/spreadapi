'use client';

import React, { useState } from 'react';
import '../product.css';
import Footer from '@/components/product/Footer';

const HowItWorks2Page: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <a href="/product" className="navbar-link">Overview</a>
              <a href="/product/how-it-works2" className="navbar-link">How it Works</a>
              <a href="/product#faq" className="navbar-link">FAQ</a>
            </div>
            
            <div className="navbar-button-wrapper">
              <a href="/product#cta" className="button hide-mobile-portrait">Get Started</a>
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
                <a href="/product" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Overview</a>
                <a href="/product/how-it-works2" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
                <a href="/product#faq" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <a href="/product#cta" className="button w-button" onClick={() => setMobileMenuOpen(false)}>Get Started</a>
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
                              <div>How SpreadAPI Works</div>
                            </div>
                          </div>
                          <div className="margin-bottom margin-small">
                            <h1>
                              From Excel to API in <span className="text-color-primary">3 Simple Steps</span>
                            </h1>
                          </div>
                          <p className="text-size-medium" style={{ maxWidth: '560px', margin: '0 auto' }}>
                            Transform your spreadsheets into powerful APIs that AI can understand. No coding required. Your business logic stays intact.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="header-image-wrapper">
                      <div className="header-image-placeholder">
                        <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Step 1: Upload */}
                          <rect x="50" y="100" width="200" height="200" rx="12" fill="#F8F6FE" stroke="#9333EA" strokeWidth="2"/>
                          <rect x="70" y="120" width="160" height="30" fill="#E8E0FF"/>
                          <text x="150" y="140" textAnchor="middle" fill="#9333EA" fontSize="14" fontWeight="600">EXCEL FILE</text>
                          <rect x="70" y="170" width="160" height="20" fill="#E8E0FF" opacity="0.6"/>
                          <rect x="70" y="200" width="120" height="20" fill="#E8E0FF" opacity="0.6"/>
                          <rect x="70" y="230" width="140" height="20" fill="#E8E0FF" opacity="0.6"/>
                          <rect x="70" y="260" width="100" height="20" fill="#E8E0FF" opacity="0.6"/>
                          
                          {/* Arrow 1 */}
                          <path d="M270 200 L280 200 L280 200 L370 200" stroke="#9333EA" strokeWidth="2" strokeDasharray="5,5"/>
                          <polygon points="370,195 380,200 370,205" fill="#9333EA"/>
                          
                          {/* Step 2: Configure */}
                          <rect x="400" y="100" width="200" height="200" rx="12" fill="#F8F6FE" stroke="#9333EA" strokeWidth="2"/>
                          <text x="500" y="140" textAnchor="middle" fill="#9333EA" fontSize="14" fontWeight="600">CONFIGURE</text>
                          <circle cx="450" cy="180" r="6" fill="#52C41A"/>
                          <text x="470" y="185" fill="#333" fontSize="12">Input: A1 (Price)</text>
                          <circle cx="450" cy="210" r="6" fill="#52C41A"/>
                          <text x="470" y="215" fill="#333" fontSize="12">Input: B1 (Quantity)</text>
                          <circle cx="450" cy="240" r="6" fill="#1890FF"/>
                          <text x="470" y="245" fill="#333" fontSize="12">Output: C1 (Total)</text>
                          <circle cx="450" cy="270" r="6" fill="#FF9800"/>
                          <text x="470" y="275" fill="#333" fontSize="12">AI Area: D1:D10</text>
                          
                          {/* Arrow 2 */}
                          <path d="M620 200 L630 200 L630 200 L720 200" stroke="#9333EA" strokeWidth="2" strokeDasharray="5,5"/>
                          <polygon points="720,195 730,200 720,205" fill="#9333EA"/>
                          
                          {/* Step 3: API Ready */}
                          <rect x="550" y="50" width="200" height="100" rx="12" fill="#9333EA" opacity="0.1"/>
                          <text x="650" y="80" textAnchor="middle" fill="#9333EA" fontSize="14" fontWeight="600">API ENDPOINT</text>
                          <rect x="570" y="95" width="160" height="40" rx="4" fill="#9333EA" opacity="0.2"/>
                          <text x="650" y="120" textAnchor="middle" fill="#9333EA" fontSize="12" fontFamily="monospace">POST /api/calc/abc123</text>
                          
                          {/* AI Integration */}
                          <rect x="550" y="250" width="200" height="100" rx="12" fill="#52C41A" opacity="0.1"/>
                          <text x="650" y="280" textAnchor="middle" fill="#52C41A" fontSize="14" fontWeight="600">AI READY</text>
                          <rect x="570" y="295" width="160" height="40" rx="4" fill="#52C41A" opacity="0.2"/>
                          <text x="650" y="315" textAnchor="middle" fill="#52C41A" fontSize="11">Claude, ChatGPT, APIs</text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Step 1: Upload Your Excel */}
          <section className="section-home-feature">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="feature-component">
                    <div className="feature-content-wrapper">
                      <div className="margin-bottom margin-xsmall">
                        <div className="subheading">
                          <div>Step 1</div>
                        </div>
                      </div>
                      <div className="margin-bottom margin-small">
                        <h2>
                          <span className="text-color-primary">Upload</span> Your Excel Spreadsheet
                        </h2>
                      </div>
                      <div className="margin-bottom margin-medium">
                        <p className="text-size-medium">
                          Drag and drop your Excel file - that's it. No modifications needed. Your formulas, calculations, and business logic remain untouched. SpreadAPI automatically optimizes your file for lightning-fast performance.
                        </p>
                      </div>
                      <div className="feature-keypoint-list">
                        <div className="feature-keypoint-list-item">
                          <div className="check-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-size-medium">Works with complex formulas & pivot tables</p>
                        </div>
                        <div className="feature-keypoint-list-item">
                          <div className="check-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-size-medium">Supports multi-sheet dependencies</p>
                        </div>
                        <div className="feature-keypoint-list-item">
                          <div className="check-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-size-medium">Automatic optimization (files up to 5MB)</p>
                        </div>
                      </div>
                    </div>
                    <div className="feature-image-wrapper">
                      <div className="feature-image-placeholder">
                        <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Upload area */}
                          <rect x="100" y="50" width="400" height="300" rx="20" fill="#F8F6FE" stroke="#9333EA" strokeWidth="2" strokeDasharray="10,5"/>
                          
                          {/* Upload icon */}
                          <circle cx="300" cy="150" r="40" fill="#9333EA" opacity="0.1"/>
                          <path d="M300 130 L300 170 M285 145 L300 130 L315 145" stroke="#9333EA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          
                          {/* Excel icon */}
                          <rect x="260" y="210" width="80" height="80" rx="8" fill="#107C41"/>
                          <text x="300" y="260" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">X</text>
                          
                          {/* Text */}
                          <text x="300" y="320" textAnchor="middle" fill="#666" fontSize="16">Drop your Excel file here</text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Define Parameters */}
          <section className="section-home-feature">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="feature-component reverse">
                    <div className="feature-image-wrapper">
                      <div className="feature-image-placeholder">
                        <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Spreadsheet grid */}
                          <rect x="50" y="50" width="500" height="300" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
                          
                          {/* Column headers */}
                          <rect x="50" y="50" width="100" height="30" fill="#F8F6FE"/>
                          <text x="100" y="70" textAnchor="middle" fill="#666" fontSize="14">A</text>
                          <rect x="150" y="50" width="100" height="30" fill="#F8F6FE"/>
                          <text x="200" y="70" textAnchor="middle" fill="#666" fontSize="14">B</text>
                          <rect x="250" y="50" width="100" height="30" fill="#F8F6FE"/>
                          <text x="300" y="70" textAnchor="middle" fill="#666" fontSize="14">C</text>
                          <rect x="350" y="50" width="100" height="30" fill="#F8F6FE"/>
                          <text x="400" y="70" textAnchor="middle" fill="#666" fontSize="14">D</text>
                          <rect x="450" y="50" width="100" height="30" fill="#F8F6FE"/>
                          <text x="500" y="70" textAnchor="middle" fill="#666" fontSize="14">E</text>
                          
                          {/* Input cells highlighted */}
                          <rect x="50" y="80" width="100" height="40" fill="#52C41A" opacity="0.2" stroke="#52C41A" strokeWidth="2"/>
                          <text x="100" y="105" textAnchor="middle" fill="#333" fontSize="12">Price</text>
                          
                          <rect x="150" y="80" width="100" height="40" fill="#52C41A" opacity="0.2" stroke="#52C41A" strokeWidth="2"/>
                          <text x="200" y="105" textAnchor="middle" fill="#333" fontSize="12">Quantity</text>
                          
                          {/* Output cell highlighted */}
                          <rect x="250" y="80" width="100" height="40" fill="#1890FF" opacity="0.2" stroke="#1890FF" strokeWidth="2"/>
                          <text x="300" y="105" textAnchor="middle" fill="#333" fontSize="12">=A2*B2</text>
                          
                          {/* AI Area highlighted */}
                          <rect x="350" y="80" width="200" height="160" fill="#FF9800" opacity="0.1" stroke="#FF9800" strokeWidth="2" strokeDasharray="5,5"/>
                          <text x="450" y="160" textAnchor="middle" fill="#FF9800" fontSize="14" fontWeight="600">AI Editable Area</text>
                          
                          {/* Labels */}
                          <text x="100" y="140" textAnchor="middle" fill="#52C41A" fontSize="11" fontWeight="600">INPUT</text>
                          <text x="200" y="140" textAnchor="middle" fill="#52C41A" fontSize="11" fontWeight="600">INPUT</text>
                          <text x="300" y="140" textAnchor="middle" fill="#1890FF" fontSize="11" fontWeight="600">OUTPUT</text>
                        </svg>
                      </div>
                    </div>
                    <div className="feature-content-wrapper">
                      <div className="margin-bottom margin-xsmall">
                        <div className="subheading">
                          <div>Step 2</div>
                        </div>
                      </div>
                      <div className="margin-bottom margin-small">
                        <h2>
                          <span className="text-color-primary">Define</span> Inputs, Outputs & AI Areas
                        </h2>
                      </div>
                      <div className="margin-bottom margin-medium">
                        <p className="text-size-medium">
                          Click on cells to mark them as inputs or outputs. Create "Editable Areas" where AI can safely experiment. Set granular permissions - let AI read values, modify formulas, or just observe results. You're always in control.
                        </p>
                      </div>
                      <div className="feature-list">
                        <div className="feature-item">
                          <div className="feature-item-icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#52C41A" fillOpacity="0.1"/>
                              <path d="M15 20L20 15L25 20M20 25V15" stroke="#52C41A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="feature-item-content-wrapper">
                            <div className="margin-bottom margin-xsmall">
                              <h3 className="heading-style-h5">Smart Input Detection</h3>
                            </div>
                            <p className="text-size-medium">SpreadAPI suggests likely inputs based on your formula structure. Accept or customize as needed.</p>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-item-icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#FF9800" fillOpacity="0.1"/>
                              <rect x="12" y="12" width="16" height="16" rx="2" stroke="#FF9800" strokeWidth="1.5" strokeDasharray="3,3"/>
                              <circle cx="24" cy="24" r="2" fill="#FF9800"/>
                            </svg>
                          </div>
                          <div className="feature-item-content-wrapper">
                            <div className="margin-bottom margin-xsmall">
                              <h3 className="heading-style-h5">Flexible AI Permissions</h3>
                            </div>
                            <p className="text-size-medium">Grant AI exactly the access it needs - from read-only analysis to full formula editing in designated areas.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Connect & Go */}
          <section className="section-home-feature">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="feature-component">
                    <div className="feature-content-wrapper">
                      <div className="margin-bottom margin-xsmall">
                        <div className="subheading">
                          <div>Step 3</div>
                        </div>
                      </div>
                      <div className="margin-bottom margin-small">
                        <h2>
                          <span className="text-color-primary">Connect</span> AI & Start Using
                        </h2>
                      </div>
                      <div className="margin-bottom margin-medium">
                        <p className="text-size-medium">
                          Your Excel is now a live API. Connect Claude, ChatGPT, or any AI assistant through our MCP server. Use REST APIs for your applications. Integrate with Zapier for automation. Your spreadsheet calculations are now everywhere.
                        </p>
                      </div>
                      <div className="feature-keypoint-list">
                        <div className="feature-keypoint-list-item">
                          <div className="check-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-size-medium">Instant API endpoint ready to use</p>
                        </div>
                        <div className="feature-keypoint-list-item">
                          <div className="check-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-size-medium">MCP server config for AI assistants</p>
                        </div>
                        <div className="feature-keypoint-list-item">
                          <div className="check-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-size-medium">SDKs for Python, JavaScript & more</p>
                        </div>
                      </div>
                    </div>
                    <div className="feature-image-wrapper">
                      <div className="feature-image-placeholder">
                        <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Code snippet */}
                          <rect x="50" y="50" width="500" height="300" rx="8" fill="#1a1a1a"/>
                          
                          {/* Terminal header */}
                          <rect x="50" y="50" width="500" height="30" fill="#2a2a2a"/>
                          <circle cx="70" cy="65" r="5" fill="#ff5f56"/>
                          <circle cx="90" cy="65" r="5" fill="#ffbd2e"/>
                          <circle cx="110" cy="65" r="5" fill="#27c93f"/>
                          
                          {/* Code */}
                          <text x="70" y="110" fill="#f0f0f0" fontSize="14" fontFamily="monospace">
                            <tspan x="70" dy="0">// Connect AI Assistant</tspan>
                            <tspan x="70" dy="25" fill="#9333EA">const</tspan>
                            <tspan dx="5" fill="#f0f0f0">result =</tspan>
                            <tspan dx="5" fill="#52C41A">await</tspan>
                            <tspan dx="5" fill="#f0f0f0">spreadapi.</tspan>
                            <tspan fill="#61DAFB">calc</tspan>
                            <tspan fill="#f0f0f0">(&#123;</tspan>
                          </text>
                          <text x="90" y="160" fill="#f0f0f0" fontSize="14" fontFamily="monospace">
                            <tspan x="90" dy="0" fill="#FF9800">serviceId:</tspan>
                            <tspan dx="5" fill="#98C379">"pricing_model"</tspan>
                            <tspan fill="#f0f0f0">,</tspan>
                          </text>
                          <text x="90" y="185" fill="#f0f0f0" fontSize="14" fontFamily="monospace">
                            <tspan x="90" dy="0" fill="#FF9800">inputs:</tspan>
                            <tspan dx="5" fill="#f0f0f0">&#123;</tspan>
                          </text>
                          <text x="110" y="210" fill="#f0f0f0" fontSize="14" fontFamily="monospace">
                            <tspan x="110" dy="0" fill="#FF9800">price:</tspan>
                            <tspan dx="5" fill="#D19A66">100</tspan>
                            <tspan fill="#f0f0f0">,</tspan>
                          </text>
                          <text x="110" y="235" fill="#f0f0f0" fontSize="14" fontFamily="monospace">
                            <tspan x="110" dy="0" fill="#FF9800">quantity:</tspan>
                            <tspan dx="5" fill="#D19A66">50</tspan>
                          </text>
                          <text x="90" y="260" fill="#f0f0f0" fontSize="14" fontFamily="monospace">
                            <tspan x="90" dy="0">&#125;</tspan>
                          </text>
                          <text x="70" y="285" fill="#f0f0f0" fontSize="14" fontFamily="monospace">
                            <tspan x="70" dy="0">&#125;);</tspan>
                          </text>
                          
                          {/* Result */}
                          <text x="70" y="320" fill="#5C6370" fontSize="14" fontFamily="monospace">
                            <tspan x="70" dy="0">// Output: &#123; total: 5000, tax: 500, net: 4500 &#125;</tspan>
                          </text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Real-World Example Section */}
          <section className="section-home-feature">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="margin-bottom margin-large">
                    <div className="text-align-center">
                      <div className="max-width-large align-center">
                        <div className="margin-bottom margin-xsmall">
                          <div className="subheading">
                            <div>See It In Action</div>
                          </div>
                        </div>
                        <h2>
                          Real Example: <span className="text-color-primary">AI Sales Assistant</span>
                        </h2>
                      </div>
                    </div>
                  </div>
                  
                  <div className="feature-component">
                    <div className="feature-content-wrapper">
                      <div className="margin-bottom margin-small">
                        <h3>Before SpreadAPI</h3>
                      </div>
                      <div className="margin-bottom margin-medium">
                        <p className="text-size-medium">
                          Sales reps manually calculate quotes in Excel. AI assistants can't access the pricing logic. Quotes take 2 hours and contain errors. Updates require IT involvement.
                        </p>
                      </div>
                      <div className="feature-list">
                        <div className="feature-item">
                          <div className="feature-item-icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#FF5252" fillOpacity="0.1"/>
                              <path d="M20 15V21M20 25H20.01" stroke="#FF5252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="feature-item-content-wrapper">
                            <p className="text-size-medium">70% quote accuracy</p>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-item-icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#FF5252" fillOpacity="0.1"/>
                              <circle cx="20" cy="20" r="8" stroke="#FF5252" strokeWidth="1.5"/>
                              <path d="M20 16V20L23 23" stroke="#FF5252" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="feature-item-content-wrapper">
                            <p className="text-size-medium">2 hours per quote</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="feature-content-wrapper">
                      <div className="margin-bottom margin-small">
                        <h3>After SpreadAPI</h3>
                      </div>
                      <div className="margin-bottom margin-medium">
                        <p className="text-size-medium">
                          Claude accesses the pricing Excel via SpreadAPI. Generates perfect quotes in seconds. Sales team updates Excel, API updates automatically. IT-free.
                        </p>
                      </div>
                      <div className="feature-list">
                        <div className="feature-item">
                          <div className="feature-item-icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#52C41A" fillOpacity="0.1"/>
                              <path d="M15 20L18 23L25 16" stroke="#52C41A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="feature-item-content-wrapper">
                            <p className="text-size-medium">100% quote accuracy</p>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-item-icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#52C41A" fillOpacity="0.1"/>
                              <path d="M20 12L22 16L27 17L23.5 20.5L24.5 25L20 22.5L15.5 25L16.5 20.5L13 17L18 16L20 12Z" stroke="#52C41A" strokeWidth="1.5" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="feature-item-content-wrapper">
                            <p className="text-size-medium">30 seconds per quote</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Integration Options */}
          <section className="section-home-tools">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="tools-component">
                    <div className="tools-list">
                      <div className="tools-item">
                        <div className="tools-logo">REST API</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">MCP Server</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">Webhooks</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">Python SDK</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">JavaScript</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">Zapier</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">Make</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">n8n</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">GraphQL</div>
                      </div>
                    </div>
                    <div className="tools-content-wrapper">
                      <div className="margin-bottom margin-small">
                        <h2>
                          <span className="text-color-primary">Connect</span> Any Way You Want
                        </h2>
                      </div>
                      <div className="margin-bottom margin-medium">
                        <p className="text-size-medium">
                          Whether you're building an app, automating workflows, or enabling AI assistants, SpreadAPI speaks your language. Use our REST API, connect AI via MCP, or integrate with your favorite automation tools.
                        </p>
                      </div>
                      <a href="/product#cta" className="button">Start Building</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="section-home-feature">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="margin-bottom margin-large">
                    <div className="text-align-center">
                      <div className="max-width-large align-center">
                        <div className="margin-bottom margin-xsmall">
                          <div className="subheading">
                            <div>Enterprise Security</div>
                          </div>
                        </div>
                        <h2>
                          Your Data Stays <span className="text-color-primary">Secure</span>
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="benefits-component">
                    <div className="benefits-item">
                      <div className="margin-bottom margin-medium">
                        <div className="icon-wrapper">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                            <path d="M20 12C20 12 14 14 14 20C14 26 20 28 20 28C20 28 26 26 26 20C26 14 20 12 20 12Z" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17 19L19 21L23 17" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      <div className="margin-bottom margin-xsmall">
                        <h3>European Servers</h3>
                      </div>
                      <p>Hosted in Frankfurt. Your data never leaves Europe. Full compliance for EU customers.</p>
                    </div>
                    <div className="benefits-item">
                      <div className="margin-bottom margin-medium">
                        <div className="icon-wrapper">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                            <rect x="12" y="16" width="16" height="12" rx="2" stroke="#9333EA" strokeWidth="1.5"/>
                            <path d="M16 16V14C16 12 18 10 20 10C22 10 24 12 24 14V16" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                            <circle cx="20" cy="22" r="1.5" fill="#9333EA"/>
                          </svg>
                        </div>
                      </div>
                      <div className="margin-bottom margin-xsmall">
                        <h3>End-to-End Encryption</h3>
                      </div>
                      <p>All data encrypted in transit and at rest. Your formulas stay confidential.</p>
                    </div>
                    <div className="benefits-item">
                      <div className="margin-bottom margin-medium">
                        <div className="icon-wrapper">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                            <circle cx="20" cy="20" r="8" stroke="#9333EA" strokeWidth="1.5"/>
                            <path d="M16 20L18 22L24 16" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      <div className="margin-bottom margin-xsmall">
                        <h3>Granular Control</h3>
                      </div>
                      <p>You decide what AI can see and do. Hide formulas, protect data, control access.</p>
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
                          <h2 className="text-color-white">Your Excel + AI = Unlimited Possibilities</h2>
                        </div>
                        <p className="text-size-medium text-color-white">Turn your spreadsheets into APIs in 3 minutes. No credit card required.</p>
                      </div>
                    </div>
                    <div className="margin-top margin-medium">
                      <a href="/" className="button button-white">Start Free Trial</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section> */}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
    </>
  );
};

export default HowItWorks2Page;