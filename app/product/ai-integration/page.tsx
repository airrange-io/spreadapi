'use client';

import React, { useState } from 'react';
import '../product.css';
import Footer from '@/components/product/Footer';

const AIIntegrationPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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
                <a href="/product/ai-integration" className="navbar-link">AI Integration</a>
                <a href="/product/editable-areas" className="navbar-link">Editable Areas</a>
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
                  <a href="/product/ai-integration" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>AI Integration</a>
                  <a href="/product/editable-areas" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Editable Areas</a>
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
                                <div>Excel AI Integration with Model Context Protocol (MCP)</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                Connect AI to Excel Spreadsheets Securely:<br />
                                <span className="text-color-primary">Zero Data Upload with MCP Integration</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              SpreadAPI enables Claude, ChatGPT, and other AI assistants to work with your Excel spreadsheets through secure Model Context Protocol (MCP) integration. 
                              Get 100% accurate AI calculations without uploading files or exposing proprietary formulas—your Excel logic stays private while AI delivers powerful automation.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="header-image-wrapper">
                        <div className="code-example-wrapper">
                          <pre className="code-block">
{`// Claude asks your spreadsheet to calculate
const result = await claude.use_mcp_tool({
  server: "spreadapi",
  tool: "calculate_pricing",
  arguments: {
    quantity: 1000,
    customer_type: "enterprise",
    discount_code: "VOLUME20"
  }
});

// Returns: { total: 45000, discount: 9000, unit_price: 45 }
// 100% accurate, using YOUR Excel formulas`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Security Feature Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            Protect Excel Formulas from AI: <span className="text-color-primary">Enterprise-Grade Security</span> for Spreadsheets
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            Unlike traditional AI-Excel integrations requiring full file uploads, SpreadAPI's revolutionary MCP approach keeps your data secure. 
                            AI assistants send calculation requests to your local API while your Excel formulas, proprietary business logic, and confidential algorithms 
                            remain completely private. Enable powerful AI spreadsheet automation without sacrificing intellectual property or data security.
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
                            <p className="text-size-medium">Formulas Never Exposed to AI</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-size-medium">Zero Cloud Upload Required</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-size-medium">European Infrastructure Compliance</p>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div className="security-diagram">
                          <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="600" height="400" fill="#F8F6FE" rx="12" />
                            {/* AI Assistant Box */}
                            <rect x="40" y="150" width="140" height="100" rx="8" fill="#E8E0FF" stroke="#9333EA" strokeWidth="2" />
                            <text x="110" y="190" textAnchor="middle" fill="#9333EA" fontSize="14" fontWeight="600">AI Assistant</text>
                            <text x="110" y="210" textAnchor="middle" fill="#666" fontSize="12">(Claude)</text>
                            
                            {/* Arrow */}
                            <path d="M180 200 L240 200" stroke="#9333EA" strokeWidth="2" markerEnd="url(#arrowhead)" />
                            <text x="210" y="190" textAnchor="middle" fill="#666" fontSize="11">MCP Request</text>
                            
                            {/* SpreadAPI Box */}
                            <rect x="240" y="150" width="140" height="100" rx="8" fill="#F0E1FF" stroke="#9333EA" strokeWidth="2" />
                            <text x="310" y="190" textAnchor="middle" fill="#9333EA" fontSize="14" fontWeight="600">SpreadAPI</text>
                            <text x="310" y="210" textAnchor="middle" fill="#666" fontSize="12">(Your Server)</text>
                            
                            {/* Arrow */}
                            <path d="M380 200 L440 200" stroke="#9333EA" strokeWidth="2" markerEnd="url(#arrowhead)" />
                            <text x="410" y="190" textAnchor="middle" fill="#666" fontSize="11">Calculate</text>
                            
                            {/* Excel Box */}
                            <rect x="440" y="150" width="140" height="100" rx="8" fill="#E8FFE8" stroke="#4CAF50" strokeWidth="2" />
                            <text x="510" y="190" textAnchor="middle" fill="#4CAF50" fontSize="14" fontWeight="600">Your Excel</text>
                            <text x="510" y="210" textAnchor="middle" fill="#666" fontSize="12">(Secure)</text>
                            
                            {/* Lock Icon */}
                            <circle cx="510" cy="230" r="15" fill="#4CAF50" fillOpacity="0.2" />
                            <path d="M505 225v5a1 1 0 001 1h8a1 1 0 001-1v-5m-10 0v-2a5 5 0 0110 0v2m-10 0h10" stroke="#4CAF50" strokeWidth="1.5" fill="none" />
                            
                            <defs>
                              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#9333EA" />
                              </marker>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Architecture Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component reverse">
                      <div className="feature-image-wrapper">
                        <div className="architecture-diagram">
                          <div className="architecture-card">
                            <h4>Granular Permission System</h4>
                            <div className="permission-grid">
                              <div className="permission-item allowed">✓ Read Cell Values</div>
                              <div className="permission-item allowed">✓ Execute Calculations</div>
                              <div className="permission-item denied">✗ View Formulas</div>
                              <div className="permission-item denied">✗ Access Full Sheet</div>
                              <div className="permission-item allowed">✓ Batch Processing</div>
                              <div className="permission-item denied">✗ Modify Structure</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            Excel AI Permissions: <span className="text-color-primary">Cell-Level Access Control</span> for Maximum Security
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            SpreadAPI's granular permission system lets you define exactly what AI can access in your Excel files. Control AI permissions at the cell level—
                            specify which formulas AI can read, which cells it can modify, and which data remains hidden. This precision ensures AI assistants get the 
                            computational access they need while protecting your sensitive business logic and proprietary calculations.
                          </p>
                        </div>
                        <div className="feature-list">
                          <div className="feature-item">
                            <div className="feature-item-icon-wrapper">
                              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M20 14v6m0 4h.01M12 20a8 8 0 1116 0 8 8 0 01-16 0z" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div className="feature-item-content-wrapper">
                              <div className="margin-bottom margin-xsmall">
                                <h3 className="heading-style-h5">Zero Hallucination Guarantee</h3>
                              </div>
                              <p className="text-size-medium">AI can't make up numbers when it's calling your actual Excel formulas. Every calculation is deterministic, traceable, and 100% accurate.</p>
                            </div>
                          </div>
                          <div className="feature-item">
                            <div className="feature-item-icon-wrapper">
                              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M16 20l4 4 8-8m-8 12a8 8 0 110-16 8 8 0 010 16z" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div className="feature-item-content-wrapper">
                              <div className="margin-bottom margin-xsmall">
                                <h3 className="heading-style-h5">Audit Trail Everything</h3>
                              </div>
                              <p className="text-size-medium">Every AI request is logged with inputs, outputs, and timestamps. Perfect for compliance, debugging, and understanding AI behavior patterns.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Installation Section */}
            <section className="section-home-installation">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="align-center">
                        <div className="max-width-large">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Quick Start</div>
                            </div>
                          </div>
                          <div className="text-align-center">
                            <h2>
                              Quick Excel AI Setup: <span className="text-color-primary">Connect Claude & ChatGPT</span> in 5 Minutes
                            </h2>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="installation-steps">
                      <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Step 1: Install SpreadAPI MCP Server for AI Integration</h3>
                        <pre className="code-snippet">npm install @spreadapi/mcp-server</pre>
                        <p>Configure SpreadAPI Model Context Protocol server to enable AI-Excel connectivity</p>
                      </div>
                      <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>Step 2: Connect AI Assistant to Excel API Endpoint</h3>
                        <pre className="code-snippet">{`{
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["@spreadapi/mcp-server"],
      "env": {
        "SPREADAPI_URL": "https://your-instance.com"
      }
    }
  }
}`}</pre>
                        <p>Link Claude, ChatGPT, or other AI tools to your secure SpreadAPI Excel endpoint</p>
                      </div>
                      <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Step 3: Enable AI-Powered Excel Calculations</h3>
                        <pre className="code-snippet">Claude: "Calculate pricing for 500 units"</pre>
                        <p>AI assistants automatically discover and execute Excel formulas through secure MCP tools</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Use Cases Section */}
            <section className="section-home-usecases">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="align-center">
                        <div className="max-width-large">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Real-World Applications</div>
                            </div>
                          </div>
                          <div className="text-align-center">
                            <h2>
                              AI Excel Use Cases: <span className="text-color-primary">Automate Spreadsheet Workflows</span> with MCP
                            </h2>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="usecase-grid">
                      <div className="usecase-card">
                        <div className="usecase-icon">
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="12" fill="#9333EA" fillOpacity="0.1" />
                            <path d="M24 14v20m-8-8h16" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                        <h3>Bulk Excel Processing: AI Handles Thousands of Calculations</h3>
                        <p>Enable AI to process thousands of Excel calculations simultaneously. Handle bulk operations like customer quote generation, financial modeling, and data analysis at scale—all using your existing spreadsheet formulas.</p>
                        <div className="usecase-code">
                          <pre>{`// Process 10,000 quotes in seconds
const results = await claude.batch_calculate({
  tool: "pricing_calculator",
  data: customerList
});`}</pre>
                        </div>
                      </div>
                      <div className="usecase-card">
                        <div className="usecase-icon">
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="12" fill="#9333EA" fillOpacity="0.1" />
                            <path d="M16 24l6 6 12-12" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <h3>AI-Powered Scenario Analysis for Excel Models</h3>
                        <p>Let AI explore complex Excel scenarios instantly. Analyze margin impacts, forecast variations, and business model changes with 100% accuracy using your actual spreadsheet formulas—no approximations or errors.</p>
                        <div className="usecase-code">
                          <pre>{`// Scenario analysis
for (let increase = 5; increase <= 15; increase++) {
  const impact = await analyze_scenario({
    cost_increase: increase
  });
}`}</pre>
                        </div>
                      </div>
                      <div className="usecase-card">
                        <div className="usecase-icon">
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="12" fill="#9333EA" fillOpacity="0.1" />
                            <path d="M14 16h20v16H14zm0 8h20M22 16v16" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <h3>Automated Excel Reports with AI Intelligence</h3>
                        <p>Transform Excel data into professional reports automatically. AI generates financial summaries, KPI dashboards, and custom analytics using your spreadsheet calculations—maintaining accuracy while saving hours of manual work.</p>
                        <div className="usecase-code">
                          <pre>{`// Generate monthly report
const report = await claude.generate_report({
  template: "financial_summary",
  period: "2024-Q1"
});`}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Benefits Section */}
            <section className="section-home-benefits">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="align-center">
                        <div className="max-width-large">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Why Engineers Love It</div>
                            </div>
                          </div>
                          <div className="text-align-center">
                            <h2>
                              Built for <span className="text-color-primary">Scale & Reliability</span>
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
                              <path d="M20 12v8l4 2m-4 6a8 8 0 100-16 8 8 0 000 16z" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>Sub-100ms Latency</h3>
                        </div>
                        <p>Intelligent caching and optimized calculation engine ensure AI gets instant responses, even for complex models.</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M12 20h16m-8-8v16" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>Horizontal Scaling</h3>
                        </div>
                        <p>Handle millions of AI requests with our cloud-native architecture. Auto-scales based on demand.</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <circle cx="20" cy="20" r="8" stroke="#9333EA" strokeWidth="1.5" />
                              <path d="M20 16v4l2 2" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>99.99% Uptime</h3>
                        </div>
                        <p>Enterprise-grade reliability with redundancy, failover, and comprehensive monitoring built-in.</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M16 20l4 4 8-8" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>SOC 2 Compliant</h3>
                        </div>
                        <p>Security isn't an afterthought. Encrypted at rest, in transit, with comprehensive audit logging.</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M14 26l6-12 6 12m-10-4h8" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>Multi-AI Support</h3>
                        </div>
                        <p>Works with Claude, ChatGPT, Gemini, and any MCP-compatible AI assistant. Future-proof integration.</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M20 28v-8m0 0l-4 4m4-4l4 4m-4-12v.01" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>Self-Hosted Option</h3>
                        </div>
                        <p>Deploy on your infrastructure for ultimate control. Docker, Kubernetes, or bare metal—your choice.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="section-home-cta">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="home-cta-component">
                      <div className="text-align-center">
                        <div className="max-width-xlarge">
                          <div className="margin-bottom margin-small">
                            <h2 className="text-color-white">Ready to Give AI Superpowers?</h2>
                          </div>
                          <p className="text-size-medium text-color-white">
                            Join innovative teams using SpreadAPI to bridge the gap between AI and Excel. 
                            Start with our free tier and see the magic happen in minutes.
                          </p>
                        </div>
                      </div>
                      <div className="margin-top margin-medium">
                        <div className="cta-button-group">
                          <a href="/product#cta" className="button button-white">Start Free Trial</a>
                          <a href="https://github.com/spreadapi/mcp-server" className="button button-secondary">View on GitHub</a>
                        </div>
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

export default AIIntegrationPage;