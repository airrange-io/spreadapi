import { Metadata } from 'next';
import '../product/product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import AIIntegrationStyles from './ai-integration-styles';

export const metadata: Metadata = {
  title: 'AI Security & Control - SpreadAPI | Enterprise-Grade Protection',
  description: 'Control exactly what AI assistants can access in your Excel files. Granular permissions, MCP protocol support, enterprise-grade security.',
  keywords: 'ai security excel, spreadsheet access control, mcp protocol security, ai data privacy, excel api security, granular permissions',
  openGraph: {
    title: 'AI Security & Control - Protect Your Excel Data',
    description: 'Enterprise-grade security for AI-Excel integration. Control access at the cell level.',
    type: 'article',
    url: 'https://spreadapi.com/ai-security-control',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.com/api/og?title=AI%20Security%20%26%20Control&description=Enterprise%20security%20for%20Excel%20AI%20integration',
      width: 1200,
      height: 630,
      alt: 'AI Security & Control - SpreadAPI',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Security & Control - SpreadAPI',
    description: 'Enterprise security for AI-Excel integration. Granular access control.',
  },
};

export default function AISecurityControlPage() {
  return (
    <>
      <link rel="stylesheet" href="/fonts/satoshi-fixed.css" />
      <div className="product-page">
        <AIIntegrationStyles />

        <div className="page-wrapper">
          {/* Navigation */}
          <Navigation currentPage="ai-security-control" />

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
                                <div>AI Security & Enterprise Control</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                Control What AI Sees in Excel:<br />
                                <span className="text-color-primary">Granular Access with MCP Protocol</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              SpreadAPI enables Claude, ChatGPT, and other AI assistants to work with your Excel spreadsheets through secure Model Context Protocol (MCP) integration. 
                              Get 100% accurate AI calculations while controlling exactly what AI can access. Define specific cells and ranges—your proprietary formulas and sensitive data stay private.
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
                            Unlike giving AI full access to your spreadsheets, SpreadAPI's MCP integration lets you control exactly what AI can see and modify. 
                            Grant access to specific cells or ranges while keeping formulas, proprietary logic, and sensitive data completely private. 
                            AI gets the calculation power it needs without seeing your entire spreadsheet.
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
                              <div className="permission-item allowed">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Read Cell Values
                              </div>
                              <div className="permission-item allowed">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Execute Calculations
                              </div>
                              <div className="permission-item denied">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                                  <path d="M14 6L6 14M6 6L14 14" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                View Formulas
                              </div>
                              <div className="permission-item denied">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                                  <path d="M14 6L6 14M6 6L14 14" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Access Full Sheet
                              </div>
                              <div className="permission-item allowed">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Batch Processing
                              </div>
                              <div className="permission-item denied">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                                  <path d="M14 6L6 14M6 6L14 14" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Modify Structure
                              </div>
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
                          <a href="/product#cta" className="button" style={{
                            background: 'white',
                            color: '#1a1a1a',
                            padding: '16px 32px',
                            fontSize: '18px',
                            fontWeight: '600',
                            minWidth: '200px',
                            border: 'none'
                          }}>Start Free Trial</a>
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

