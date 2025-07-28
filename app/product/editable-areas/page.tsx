'use client';

import React, { useState } from 'react';
import '../product.css';
import Footer from '@/components/product/Footer';

const EditableAreasPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePermission, setActivePermission] = useState<string | null>(null);

  const permissions = [
    { key: 'canReadValues', label: 'Read Values', desc: 'AI sees cell values and results' },
    { key: 'canWriteValues', label: 'Write Values', desc: 'AI can update cell contents' },
    { key: 'canReadFormulas', label: 'Read Formulas', desc: 'AI understands your logic' },
    { key: 'canWriteFormulas', label: 'Write Formulas', desc: 'AI creates new calculations' },
    { key: 'canReadFormatting', label: 'Read Formatting', desc: 'AI sees visual structure' },
    { key: 'canWriteFormatting', label: 'Write Formatting', desc: 'AI applies styling' },
    { key: 'canAddRows', label: 'Add Rows', desc: 'AI expands data ranges' },
    { key: 'canDeleteRows', label: 'Delete Rows', desc: 'AI cleans up data' },
    { key: 'canModifyStructure', label: 'Modify Structure', desc: 'AI reshapes the area' }
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
                                <div>Excel AI Permissions & Editable Areas</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                Excel Editable Areas: <span className="text-color-primary">Granular AI Permissions</span><br />
                                for Secure Spreadsheet Automation
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              SpreadAPI's Editable Areas transform Excel security for AI integration. Define specific spreadsheet regions with granular permissions—control exactly 
                              what AI can read, write, or calculate. Enable powerful AI automation while maintaining complete control over sensitive formulas and confidential data.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="header-visual-wrapper">
                        <div className="editable-area-demo">
                          <div className="spreadsheet-preview">
                            <div className="sheet-header">
                              <div className="sheet-tab active">Financial Model</div>
                            </div>
                            <div className="sheet-grid">
                              <div className="area-highlight area-readonly">
                                <div className="area-label">Revenue Data (Read Only)</div>
                                <div className="cells">A1:D20</div>
                              </div>
                              <div className="area-highlight area-editable">
                                <div className="area-label">Forecast Area (AI Editable)</div>
                                <div className="cells">E1:H20</div>
                              </div>
                              <div className="area-highlight area-formula">
                                <div className="area-label">Formula Sandbox (AI Experiments)</div>
                                <div className="cells">I1:L20</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Concept Explanation Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            Excel Security Revolution: <span className="text-color-primary">Cell-Level AI Access Control</span> with Editable Areas
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            Unlike traditional AI-Excel integrations requiring full file access, SpreadAPI's Editable Areas provide surgical precision. Create secure 
                            "windows" into specific spreadsheet regions where AI can operate. Control read/write permissions at the cell level, protecting proprietary 
                            formulas while enabling AI to perform complex calculations and data transformations exactly where needed.
                          </p>
                        </div>
                        <div className="comparison-grid">
                          <div className="comparison-item old-way">
                            <h4>❌ The Old Way</h4>
                            <ul>
                              <li>Upload entire spreadsheet to AI</li>
                              <li>Expose all formulas and logic</li>
                              <li>Risk data breaches</li>
                              <li>No control over modifications</li>
                              <li>All-or-nothing access</li>
                            </ul>
                          </div>
                          <div className="comparison-item new-way">
                            <h4>✅ The SpreadAPI Way</h4>
                            <ul>
                              <li>Define specific accessible areas</li>
                              <li>Hide proprietary formulas</li>
                              <li>Maintain complete security</li>
                              <li>Granular permission control</li>
                              <li>Surgical precision access</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div className="permission-explorer">
                          <h3>Interactive Permission System</h3>
                          <p className="explorer-desc">Click to explore what each permission enables:</p>
                          <div className="permission-buttons">
                            {permissions.map((perm) => (
                              <button
                                key={perm.key}
                                className={`permission-button ${activePermission === perm.key ? 'active' : ''}`}
                                onMouseEnter={() => setActivePermission(perm.key)}
                                onMouseLeave={() => setActivePermission(null)}
                              >
                                {perm.label}
                              </button>
                            ))}
                          </div>
                          {activePermission && (
                            <div className="permission-description">
                              {permissions.find(p => p.key === activePermission)?.desc}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Use Cases Section */}
            <section className="section-home-usecases-areas">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="align-center">
                        <div className="max-width-large">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Transformative Use Cases</div>
                            </div>
                          </div>
                          <div className="text-align-center">
                            <h2>
                              AI Excel Use Cases: <span className="text-color-primary">Real-World Applications</span> of Editable Areas
                            </h2>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="usecase-showcase">
                      <div className="showcase-card">
                        <div className="showcase-header">
                          <div className="showcase-icon">📊</div>
                          <h3>AI Financial Reporting with Secure Excel Access</h3>
                        </div>
                        <div className="showcase-content">
                          <div className="area-config">
                            <div className="config-item">
                              <span className="config-label">Revenue Data</span>
                              <span className="config-value">A1:D20 - Read formulas only</span>
                            </div>
                            <div className="config-item">
                              <span className="config-label">Forecast Area</span>
                              <span className="config-value">E1:H20 - Full edit access</span>
                            </div>
                            <div className="config-item">
                              <span className="config-label">Summary</span>
                              <span className="config-value">A25:D30 - Read values only</span>
                            </div>
                          </div>
                          <p className="showcase-description">
                            Enable AI to analyze Excel financial data, create forecast models, and generate executive reports while protecting 
                            proprietary formulas. Perfect for CFOs and financial analysts needing AI assistance without exposing confidential calculations.
                          </p>
                          <div className="showcase-result">
                            <strong>Result:</strong> 90% faster financial reporting with 100% formula security
                          </div>
                        </div>
                      </div>

                      <div className="showcase-card">
                        <div className="showcase-header">
                          <div className="showcase-icon">🧹</div>
                          <h3>Automated Excel Data Cleaning with AI</h3>
                        </div>
                        <div className="showcase-content">
                          <div className="area-config">
                            <div className="config-item">
                              <span className="config-label">Raw Data</span>
                              <span className="config-value">A:Z - Read/write values</span>
                            </div>
                            <div className="config-item">
                              <span className="config-label">Validation Rules</span>
                              <span className="config-value">AA:AC - Read only</span>
                            </div>
                          </div>
                          <p className="showcase-description">
                            Let AI clean and standardize Excel data automatically. Fix inconsistencies, remove duplicates, and validate entries 
                            while preserving business rules and formulas. Transform hours of manual data preparation into minutes of AI-powered automation.
                          </p>
                          <div className="showcase-result">
                            <strong>Result:</strong> 10x faster data preparation with consistent quality
                          </div>
                        </div>
                      </div>

                      <div className="showcase-card">
                        <div className="showcase-header">
                          <div className="showcase-icon">🧮</div>
                          <h3>AI Excel Formula Generation & Optimization</h3>
                        </div>
                        <div className="showcase-content">
                          <div className="area-config">
                            <div className="config-item">
                              <span className="config-label">Input Data</span>
                              <span className="config-value">A1:C100 - Read only</span>
                            </div>
                            <div className="config-item">
                              <span className="config-label">Formula Zone</span>
                              <span className="config-value">D1:F100 - Write formulas</span>
                            </div>
                          </div>
                          <p className="showcase-description">
                            Enable AI to create and optimize complex Excel formulas automatically. Generate VLOOKUP chains, array formulas, and 
                            advanced calculations based on your data patterns—all while keeping source data and existing formulas secure.
                          </p>
                          <div className="showcase-result">
                            <strong>Result:</strong> Complex formulas in seconds, not hours
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Deep Dive */}
            <section className="section-home-technical">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component reverse">
                      <div className="feature-image-wrapper">
                        <div className="code-example-wrapper">
                          <pre className="code-block">
{`// AI discovers available areas
const areas = await claude.list_editable_areas();

// Read financial data with permission check
const revenue = await claude.read_area("revenue_data", {
  includeFormulas: true,  // ✅ Allowed
  includeFormatting: false
});

// AI generates forecast in designated area
await claude.update_areas({
  updates: [{
    areaName: "forecast_zone",
    changes: [
      { row: 1, col: 1, value: 125000 },
      { row: 1, col: 2, formula: "=B1*1.15" }
    ]
  }]
});

// Permission denied example
try {
  await claude.update_areas({
    areaName: "revenue_data",
    changes: [{ row: 1, col: 1, value: 0 }]
  });
} catch (error) {
  // "Permission denied: area is read-only"
}`}</pre>
                        </div>
                      </div>
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            Excel MCP Integration: <span className="text-color-primary">Developer-Friendly API</span> for AI Tools
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            SpreadAPI transforms each Excel editable area into a discoverable MCP tool for AI assistants. Claude, ChatGPT, and other AI platforms 
                            automatically understand available permissions and operate within defined boundaries. Security is enforced at the API protocol level—
                            no complex prompt engineering or manual configuration required for safe AI-Excel integration.
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
                                <h3 className="heading-style-h5">Automatic AI Tool Discovery for Excel Areas</h3>
                              </div>
                              <p className="text-size-medium">SpreadAPI automatically generates unique MCP tools for each Excel editable area. AI assistants discover available spreadsheet regions and understand their specific permissions without manual configuration.</p>
                            </div>
                          </div>
                          <div className="feature-item">
                            <div className="feature-item-icon-wrapper">
                              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                                <path d="M17 20v-3a3 3 0 116 0v3m-8 0h10a1 1 0 011 1v6a1 1 0 01-1 1H15a1 1 0 01-1-1v-6a1 1 0 011-1z" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div className="feature-item-content-wrapper">
                              <div className="margin-bottom margin-xsmall">
                                <h3 className="heading-style-h5">Enterprise-Grade Excel Security for AI</h3>
                              </div>
                              <p className="text-size-medium">SpreadAPI enforces Excel permissions at the API protocol level, not through AI prompts. This prevents AI from accessing restricted formulas or data, even if instructed to do so—ensuring bulletproof security.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Setup Guide Section */}
            <section className="section-home-setup">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="align-center">
                        <div className="max-width-large">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Simple Setup</div>
                            </div>
                          </div>
                          <div className="text-align-center">
                            <h2>
                              Quick Excel AI Setup: <span className="text-color-primary">Enable Editable Areas</span> in 3 Steps
                            </h2>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="setup-timeline">
                      <div className="timeline-item">
                        <div className="timeline-marker">1</div>
                        <div className="timeline-content">
                          <h3>Step 1: Select Excel Range for AI Access</h3>
                          <p>Choose specific Excel cells or ranges where AI should have access. Select individual cells, columns, rows, or complex regions—SpreadAPI supports any Excel range configuration for granular AI permissions.</p>
                          <img src="/images/select-range-demo.svg" alt="Select range demo" className="timeline-image" />
                        </div>
                      </div>
                      <div className="timeline-connector"></div>
                      <div className="timeline-item">
                        <div className="timeline-marker">2</div>
                        <div className="timeline-content">
                          <h3>Step 2: Set AI Permissions for Excel Data</h3>
                          <p>Define granular AI permissions for your Excel data: allow reading cell values, writing new data, modifying formulas, or changing structure. Combine permissions to create the perfect security profile for each use case.</p>
                          <div className="permission-preview">
                            <label className="permission-checkbox">
                              <input type="checkbox" checked readOnly /> Read cell values
                            </label>
                            <label className="permission-checkbox">
                              <input type="checkbox" checked readOnly /> Write new values
                            </label>
                            <label className="permission-checkbox">
                              <input type="checkbox" readOnly /> Modify formulas
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="timeline-connector"></div>
                      <div className="timeline-item">
                        <div className="timeline-marker">3</div>
                        <div className="timeline-content">
                          <h3>Step 3: AI Automatically Discovers Excel Areas</h3>
                          <p>Claude, ChatGPT, and other AI assistants automatically discover your Excel editable areas through MCP. They understand permissions and work within defined boundaries—enabling secure, automated spreadsheet workflows instantly.</p>
                          <div className="ai-demo-output">
                            <div className="ai-message">Claude: "I can see the revenue data in A1:D20. Let me analyze the trends and create forecasts in the designated area E1:H20..."</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="section-home-benefits">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="align-center">
                        <div className="max-width-large">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Game-Changing Benefits</div>
                            </div>
                          </div>
                          <div className="text-align-center">
                            <h2>
                              Excel AI Benefits: <span className="text-color-primary">Why Teams Choose</span> SpreadAPI Editable Areas
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
                              <path d="M20 12l2 7h7l-6 4 2 7-5-4-5 4 2-7-6-4h7l2-7z" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>10x Excel Productivity with AI Automation</h3>
                        </div>
                        <p>Transform Excel workflows with AI automation. Let AI handle repetitive calculations, data entry, and report generation while you focus on strategic decisions. Reduce hours of manual work to minutes.</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M20 28c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0 0v-8l-4-4" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>Easy Excel AI Integration - No Coding Required</h3>
                        </div>
                        <p>SpreadAPI makes AI-Excel integration simple. If you can select cells in a spreadsheet, you can create secure editable areas for AI. No programming knowledge or complex setup required.</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M15 20l5 5L28 15" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>Perfect Accuracy</h3>
                        </div>
                        <p>AI works with your actual formulas, not approximations. Every calculation is precise and traceable.</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M20 12v16m-8-8h16" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>Infinite Scalability</h3>
                        </div>
                        <p>From simple calculators to complex financial models, editable areas scale with your needs.</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M12 20h16M12 14h16M12 26h8" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>Full Audit Trail</h3>
                        </div>
                        <p>Every AI action is logged. See what changed, when, and why. Compliance teams rejoice.</p>
                      </div>
                      <div className="benefits-item">
                        <div className="margin-bottom margin-medium">
                          <div className="icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M28 20a8 8 0 01-16 0m16 0a8 8 0 00-16 0m16 0H12m8-8v16" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h3>Universal Compatibility</h3>
                        </div>
                        <p>Works with any Excel file, any AI assistant, any use case. True flexibility.</p>
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
                            <h2 className="text-color-white">Transform Your Spreadsheets Today</h2>
                          </div>
                          <p className="text-size-medium text-color-white">
                            Join innovative teams using Editable Areas to unlock AI productivity while maintaining complete control. 
                            Start with our free tier and experience the future of spreadsheet automation.
                          </p>
                        </div>
                      </div>
                      <div className="margin-top margin-medium">
                        <div className="cta-button-group">
                          <a href="/product#cta" className="button button-white">Start Free Trial</a>
                          <a href="/docs/editable-areas" className="button button-secondary">Read Documentation</a>
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

export default EditableAreasPage;