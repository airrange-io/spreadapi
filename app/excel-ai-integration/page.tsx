import { Metadata } from 'next';
import '../product/product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import AIIntegrationStyles from './ai-integration-styles';

export const metadata: Metadata = {
  title: 'Excel AI Integration - SpreadAPI | Connect ChatGPT & Claude to Excel',
  description: 'Give AI assistants Excel superpowers. Let ChatGPT and Claude use your spreadsheet calculations for accurate quotes, financial modeling, and business automation.',
  keywords: 'excel ai integration, chatgpt excel, claude excel, cursor ai excel, mcp protocol, ai spreadsheet automation, excel api for ai',
  openGraph: {
    title: 'Give AI Assistants Excel Superpowers - SpreadAPI',
    description: 'Connect ChatGPT, Claude, and Cursor to your Excel calculations. Enable accurate, reproducible results.',
    type: 'article',
    url: 'https://spreadapi.com/excel-ai-integration',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.com/api/og?title=Excel%20AI%20Integration&description=Give%20AI%20assistants%20Excel%20superpowers',
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
};

export default function AIIntegrationPage() {
  return (
    <>
      <link rel="stylesheet" href="/fonts/satoshi-fixed.css" />
      <div className="product-page">
        <AIIntegrationStyles />

        <div className="page-wrapper">
          {/* Navigation */}
          <Navigation currentPage="excel-ai-integration" />

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
                                <div>Excel meets AI</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                Give AI Assistants <span className="text-color-primary">Excel Superpowers</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              Imagine ChatGPT creating perfect quotes using your pricing spreadsheet. Or Claude analyzing scenarios 
                              with your financial models. Or Cursor writing code that uses your business calculations. 
                              SpreadAPI makes it happen—in minutes, not months.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Problem/Solution Section */}
            <section className="section-home-features">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            The AI-Excel Gap <span className="text-color-primary">Everyone Faces</span>
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            Your Excel files contain years of refined business logic. Complex pricing rules, financial models, 
                            resource calculations—all perfected over time. But when AI tries to help, it either:
                          </p>
                        </div>
                        <div className="feature-keypoint-list">
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <span style={{ color: '#ef4444', fontSize: '20px' }}>✗</span>
                            </div>
                            <p className="text-size-medium">Hallucinates numbers instead of calculating correctly</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <span style={{ color: '#ef4444', fontSize: '20px' }}>✗</span>
                            </div>
                            <p className="text-size-medium">Requires manual copy-paste of data back and forth</p>
                          </div>
                          <div className="feature-keypoint-list-item">
                            <div className="check-icon-wrapper">
                              <span style={{ color: '#ef4444', fontSize: '20px' }}>✗</span>
                            </div>
                            <p className="text-size-medium">Can't access your spreadsheet formulas at all</p>
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
                              <strong>Without SpreadAPI:</strong>
                            </div>
                            <p style={{ margin: 0, color: '#666' }}>"Based on my estimates, the price would be around $4,500..."</p>
                            <p style={{ margin: '5px 0 0 0', color: '#ef4444', fontSize: '14px' }}>❌ Wrong by $823</p>
                          </div>
                          <div style={{ 
                            background: 'white', 
                            padding: '20px', 
                            borderRadius: '8px',
                            border: '1px solid #9333EA'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>AI</div>
                              <strong>With SpreadAPI:</strong>
                            </div>
                            <p style={{ margin: 0, color: '#666' }}>"Using your pricing model, the exact price is $3,677.42"</p>
                            <p style={{ margin: '5px 0 0 0', color: '#22c55e', fontSize: '14px' }}>✓ 100% accurate, includes all discounts</p>
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
                              <div>Simple Setup</div>
                            </div>
                          </div>
                          <h2>
                            From Excel to AI-Ready in <span className="text-color-primary">3 Steps</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="process-grid">
                      <div className="process-item">
                        <div className="process-number">1</div>
                        <h3>Upload Your Excel</h3>
                        <p>Just drag and drop. Your complex pricing model, financial calculator, or planning spreadsheet—SpreadAPI handles them all.</p>
                      </div>
                      <div className="process-item">
                        <div className="process-number">2</div>
                        <h3>Define What AI Can Use</h3>
                        <p>Mark input cells (like quantity, customer type) and output cells (like final price, delivery date). Your formulas stay hidden.</p>
                      </div>
                      <div className="process-item">
                        <div className="process-number">3</div>
                        <h3>Connect Your AI</h3>
                        <p>One-click setup for Claude Desktop, ChatGPT, or Cursor. Or use our API with any AI platform. That's it—your AI now has Excel superpowers.</p>
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
                              <div>Possibilities</div>
                            </div>
                          </div>
                          <h2>
                            What Becomes <span className="text-color-primary">Possible</span>
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
                            <path d="M12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28C18.7 28 17.5 27.65 16.45 27.05L12 28L12.95 23.55C12.35 22.5 12 21.3 12 20Z" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M24 20H28C28 15.58 24.42 12 20 12" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <h3>Customer Support That Never Gets Prices Wrong</h3>
                        <p style={{ marginBottom: '20px' }}>Your support chatbot can now:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          <li style={{ marginBottom: '10px' }}>✓ Generate accurate quotes using your exact pricing rules</li>
                          <li style={{ marginBottom: '10px' }}>✓ Calculate shipping costs based on your logistics model</li>
                          <li style={{ marginBottom: '10px' }}>✓ Apply the right discounts for each customer tier</li>
                        </ul>
                        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                          "Our AI support agent now handles 80% of quote requests—with 100% accuracy"
                        </p>
                      </div>

                      {/* Sales Team Example */}
                      <div className="example-card" style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <div className="example-icon" style={{ marginBottom: '20px' }}>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <rect x="10" y="24" width="6" height="8" rx="1" fill="#9333EA"/>
                            <rect x="17" y="18" width="6" height="14" rx="1" fill="#9333EA" fillOpacity="0.7"/>
                            <rect x="24" y="12" width="6" height="20" rx="1" fill="#9333EA" fillOpacity="0.5"/>
                            <path d="M10 10L10 32H30" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <h3>Sales Teams Creating Perfect Proposals</h3>
                        <p style={{ marginBottom: '20px' }}>Empower your sales team to:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          <li style={{ marginBottom: '10px' }}>✓ Generate complex multi-product quotes instantly</li>
                          <li style={{ marginBottom: '10px' }}>✓ Run what-if scenarios during client calls</li>
                          <li style={{ marginBottom: '10px' }}>✓ Always use the latest pricing and promotions</li>
                        </ul>
                        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                          "Sales cycles reduced by 40% with instant, accurate pricing"
                        </p>
                      </div>

                      {/* Developer Example */}
                      <div className="example-card" style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <div className="example-icon" style={{ marginBottom: '20px' }}>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <rect x="8" y="12" width="24" height="16" rx="2" stroke="#9333EA" strokeWidth="1.5"/>
                            <path d="M16 18L12 22L16 26" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M24 18L28 22L24 26" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 16L18 28" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <h3>Developers Building Smarter Applications</h3>
                        <p style={{ marginBottom: '20px' }}>Let Cursor or GitHub Copilot:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          <li style={{ marginBottom: '10px' }}>✓ Use Excel calculations directly in code</li>
                          <li style={{ marginBottom: '10px' }}>✓ Generate test cases from spreadsheet logic</li>
                          <li style={{ marginBottom: '10px' }}>✓ Build UIs that match Excel workflows perfectly</li>
                        </ul>
                        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                          "No more reimplementing Excel formulas—just use the real thing"
                        </p>
                      </div>

                      {/* Financial Analysis Example */}
                      <div className="example-card" style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                        <div className="example-icon" style={{ marginBottom: '20px' }}>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <circle cx="20" cy="20" r="10" stroke="#9333EA" strokeWidth="1.5"/>
                            <path d="M20 14V26M16 17H22.5C23.33 17 24 17.67 24 18.5C24 19.33 23.33 20 22.5 20H17.5C16.67 20 16 20.67 16 21.5C16 22.33 16.67 23 17.5 23H24" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3>Financial Analysis at AI Speed</h3>
                        <p style={{ marginBottom: '20px' }}>Enable Claude or ChatGPT to:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          <li style={{ marginBottom: '10px' }}>✓ Run complex financial models instantly</li>
                          <li style={{ marginBottom: '10px' }}>✓ Generate investment scenarios with real calculations</li>
                          <li style={{ marginBottom: '10px' }}>✓ Create reports using your exact methodologies</li>
                        </ul>
                        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                          "AI can now explain AND calculate our financial projections"
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
                              <div>Universal Compatibility</div>
                            </div>
                          </div>
                          <h2>
                            Works With <span className="text-color-primary">Every AI Platform</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="integrations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', maxWidth: '800px', margin: '0 auto' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <rect x="12" y="20" width="24" height="16" rx="2" stroke="#9333EA" strokeWidth="2"/>
                            <path d="M16 32L24 26L32 32" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="18" cy="14" r="2" fill="#9333EA"/>
                            <circle cx="30" cy="14" r="2" fill="#9333EA"/>
                          </svg>
                        </div>
                        <h4>Claude Desktop</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>MCP protocol built-in</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <path d="M14 24C14 18.48 18.48 14 24 14C29.52 14 34 18.48 34 24C34 29.52 29.52 34 24 34C22.45 34 21 33.55 19.75 32.8L14 34L15.2 28.25C14.45 27 14 25.55 14 24Z" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="20" cy="24" r="1.5" fill="#9333EA"/>
                            <circle cx="24" cy="24" r="1.5" fill="#9333EA"/>
                            <circle cx="28" cy="24" r="1.5" fill="#9333EA"/>
                          </svg>
                        </div>
                        <h4>ChatGPT</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>Custom GPT ready</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <path d="M20 16L12 24L20 32" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M28 16L36 24L28 32" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 28H32" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <h4>Cursor</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>Direct integration</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                            <circle cx="24" cy="24" r="4" fill="#9333EA"/>
                            <path d="M24 14V20M24 28V34M14 24H20M28 24H34" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M17.64 17.64L21.88 21.88M26.12 26.12L30.36 30.36M30.36 17.64L26.12 21.88M21.88 26.12L17.64 30.36" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <h4>Any Platform</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>REST API & SDKs</p>
                      </div>
                    </div>

                    <div style={{ marginTop: '60px', padding: '40px', background: '#f8f6fe', borderRadius: '12px' }}>
                      <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>See It In Action</h3>
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
                              Using SpreadAPI: pricing-model<br/>
                              → Base price: $12,500<br/>
                              → Volume discount: -$1,875<br/>
                              → Enterprise tier: -$1,250<br/>
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
                                <strong>100% Accurate</strong><br/>
                                <span style={{ fontSize: '14px', color: '#666' }}>Uses your actual Excel formulas</span>
                              </div>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'start' }}>
                              <span style={{ color: '#22c55e', marginRight: '10px' }}>✓</span>
                              <div>
                                <strong>Always Current</strong><br/>
                                <span style={{ fontSize: '14px', color: '#666' }}>Updates when you change Excel</span>
                              </div>
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'start' }}>
                              <span style={{ color: '#22c55e', marginRight: '10px' }}>✓</span>
                              <div>
                                <strong>Fully Secure</strong><br/>
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

            {/* CTA Section */}
            <section id="cta" className="section-home-cta">
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
                          <a href="/" className="button button-white" style={{ 
                            padding: '16px 32px', 
                            fontSize: '18px',
                            fontWeight: '600',
                            minWidth: '200px'
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
                          Whether you're exploring possibilities or ready to implement, we're here to help at <a href="mailto:hello@airrange.io">hello@airrange.io</a>.
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
}