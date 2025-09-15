import { Metadata } from 'next';
import '../product.css';
import './excel-ai-integration.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Excel AI Integration - SpreadAPI | Connect ChatGPT & Claude to Excel',
  description: 'Give AI assistants Excel superpowers. Let ChatGPT and Claude use your spreadsheet calculations for accurate quotes, financial modeling, and business automation.',
  keywords: 'excel ai integration, chatgpt excel, claude excel, mcp protocol, ai spreadsheet automation, excel api for ai',
  openGraph: {
    title: 'Give AI Assistants Excel Superpowers - SpreadAPI',
    description: 'Connect ChatGPT and Claude to your Excel calculations. Enable accurate, reproducible results.',
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
                              with your financial models. SpreadAPI makes it happen—in minutes, not months.
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
                    
                    {/* Process Steps */}
                    <div className="process-steps-container">
                      <div className="process-step-card">
                        <div className="step-number-circle">1</div>
                        <h3>Upload Your Excel</h3>
                        <p>Simply drag and drop your spreadsheet. SpreadAPI automatically identifies your formulas and calculations.</p>
                      </div>
                      <div className="process-step-card">
                        <div className="step-number-circle">2</div>
                        <h3>Define Parameters</h3>
                        <p>Point and click to select input cells and output ranges. No coding required—it's as easy as using Excel.</p>
                      </div>
                      <div className="process-step-card">
                        <div className="step-number-circle">3</div>
                        <h3>Connect to AI</h3>
                        <p>Add our MCP server to Claude or use our API with ChatGPT. Your AI assistant now has Excel superpowers!</p>
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
                            <path d="M12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28C18.7 28 17.5 27.65 16.45 27.05L12 28L12.95 23.55C12.35 22.5 12 21.3 12 20Z" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M24 20H28C28 15.58 24.42 12 20 12" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
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
                            <rect x="10" y="24" width="6" height="8" rx="1" fill="#9333EA" />
                            <rect x="17" y="18" width="6" height="14" rx="1" fill="#9333EA" fillOpacity="0.7" />
                            <rect x="24" y="12" width="6" height="20" rx="1" fill="#9333EA" fillOpacity="0.5" />
                            <path d="M10 10L10 32H30" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
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
                            <rect x="8" y="12" width="24" height="16" rx="2" stroke="#9333EA" strokeWidth="1.5" />
                            <path d="M16 18L12 22L16 26" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M24 18L28 22L24 26" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 16L18 28" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <h3>Developers Building Smarter Applications</h3>
                        <p style={{ marginBottom: '20px' }}>Let GitHub Copilot and AI coding assistants:</p>
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
                            <circle cx="20" cy="20" r="10" stroke="#9333EA" strokeWidth="1.5" />
                            <path d="M20 14V26M16 17H22.5C23.33 17 24 17.67 24 18.5C24 19.33 23.33 20 22.5 20H17.5C16.67 20 16 20.67 16 21.5C16 22.33 16.67 23 17.5 23H24" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

                    <div className="integrations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', maxWidth: '800px', margin: '0 auto' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px' }}>
                          <svg height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg">
                            <title>Claude</title>
                            <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fillRule="nonzero" />
                          </svg>
                        </div>
                        <h4>Claude Desktop</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>MCP protocol built-in</p>
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
                        <h4>ChatGPT</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>Custom GPT ready</p>
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

            {/* MCP Installation Guide */}
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
                            Connect Claude Desktop in <span className="text-color-primary">5 Minutes</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            Follow these simple steps to give Claude access to your Excel calculations
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                      {/* Step 1 */}
                      <div style={{ 
                        background: 'white', 
                        padding: '40px', 
                        borderRadius: '16px',
                        marginBottom: '24px',
                        border: '1px solid #e8e8e8'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#502D80',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}>1</div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '24px' }}>Create Your SpreadAPI Account</h3>
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '16px' }}>
                              Sign up for free and upload your Excel file. Define inputs and outputs with simple point-and-click.
                            </p>
                            <a href="/" className="button is-primary" style={{
                              display: 'inline-block',
                              background: '#502D80',
                              color: 'white',
                              padding: '12px 24px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontWeight: '600'
                            }}>
                              Get Started Free →
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div style={{ 
                        background: 'white', 
                        padding: '40px', 
                        borderRadius: '16px',
                        marginBottom: '24px',
                        border: '1px solid #e8e8e8'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#502D80',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}>2</div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '24px' }}>Generate Your API Token</h3>
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '16px' }}>
                              In SpreadAPI, click the <strong>MCP</strong> button in the top toolbar (next to "New Service"). This opens the MCP Integration modal where you can create tokens.
                            </p>
                            <div style={{
                              background: '#f0f0f0',
                              padding: '16px',
                              borderRadius: '8px',
                              marginBottom: '16px'
                            }}>
                              <strong>Where to find it:</strong>
                              <ol style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                                <li>Go to your SpreadAPI dashboard</li>
                                <li>Look for the <strong>MCP</strong> button in the top toolbar</li>
                                <li>Click it to open the MCP Integration modal</li>
                              </ol>
                            </div>
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '16px' }}>
                              In the modal, generate a new token:
                            </p>
                            <div style={{
                              background: '#f8f6fe',
                              padding: '16px',
                              borderRadius: '8px',
                              fontFamily: 'monospace',
                              fontSize: '14px',
                              color: '#666'
                            }}>
                              <strong>Token name:</strong> Claude Desktop<br />
                              <strong>Services:</strong> ✓ All published services
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div style={{ 
                        background: 'white', 
                        padding: '40px', 
                        borderRadius: '16px',
                        marginBottom: '24px',
                        border: '1px solid #e8e8e8'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#502D80',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}>3</div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '24px' }}>Configure Claude Desktop</h3>
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '16px' }}>
                              Open the configuration file in Claude Desktop:
                            </p>
                            <div style={{
                              background: '#f0f0f0',
                              padding: '20px',
                              borderRadius: '8px',
                              marginBottom: '20px'
                            }}>
                              <ol style={{ marginTop: 0, marginBottom: 0, paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '12px' }}>
                                  Open Claude Desktop
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                  Click on <strong>Claude → Settings</strong> (Mac) or <strong>File → Settings</strong> (Windows)
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                  Select <strong>Developer</strong> tab
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                  Click <strong>Edit Config</strong> button
                                </li>
                              </ol>
                            </div>
                            <p style={{ marginBottom: '12px', color: '#666', fontSize: '16px' }}>
                              Add this configuration to the file (replace YOUR_TOKEN with your actual token):
                            </p>
                            <pre style={{
                              background: '#1a1a1a',
                              color: '#e0e0e0',
                              padding: '20px',
                              borderRadius: '8px',
                              overflow: 'auto',
                              fontSize: '14px',
                              lineHeight: '1.6'
                            }}>
{`{
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_URL": "https://spreadapi.com/api/mcp/v1",
        "SPREADAPI_TOKEN": "YOUR_TOKEN"
      }
    }
  }
}`}
                            </pre>
                            <div style={{
                              background: '#e6f7ff',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              marginTop: '16px',
                              fontSize: '14px',
                              color: '#0050b3'
                            }}>
                              <strong>Note:</strong> Using "npx" means the MCP bridge will be automatically downloaded when Claude starts. No manual installation needed!
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div style={{ 
                        background: 'white', 
                        padding: '40px', 
                        borderRadius: '16px',
                        border: '1px solid #e8e8e8'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#502D80',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}>4</div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '24px' }}>Start Using Excel in Claude!</h3>
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '16px' }}>
                              Restart Claude Desktop and try these example prompts:
                            </p>
                            <div style={{ display: 'grid', gap: '12px' }}>
                              <div style={{
                                background: '#e6f7ff',
                                padding: '16px',
                                borderRadius: '8px',
                                borderLeft: '4px solid #1890ff'
                              }}>
                                "What Excel calculations can you help me with?"
                              </div>
                              <div style={{
                                background: '#e6f7ff',
                                padding: '16px',
                                borderRadius: '8px',
                                borderLeft: '4px solid #1890ff'
                              }}>
                                "Calculate the monthly payment for a $300,000 loan"
                              </div>
                              <div style={{
                                background: '#e6f7ff',
                                padding: '16px',
                                borderRadius: '8px',
                                borderLeft: '4px solid #1890ff'
                              }}>
                                "Help me analyze different pricing scenarios"
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Troubleshooting */}
                      <div style={{ 
                        marginTop: '48px',
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
                          <div><strong>Claude not finding tools?</strong> Make sure you restarted Claude Desktop after adding the config</div>
                          <div><strong>Authentication error?</strong> Double-check your token is copied correctly</div>
                          <div><strong>Services not published?</strong> Go to SpreadAPI and publish your services first</div>
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
          <Footer />
        </div>
      </div>
    </>
  );
}