import { Metadata } from 'next';
import '../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Stop Rewriting Excel in Code | SpreadAPI',
  description: 'Stop wasting months converting Excel spreadsheets to JavaScript. Turn your Excel models into APIs instantly. 100% accuracy, zero formula translation.',
  keywords: 'excel to code, convert excel to javascript, excel api, spreadsheet to code, excel business logic, stop reimplementing excel',
  openGraph: {
    title: 'Stop Rewriting Excel in Code - SpreadAPI',
    description: 'Your spreadsheet already works. Turn it into an API in minutes — not months.',
    type: 'article',
    url: 'https://spreadapi.com/stop-rewriting-excel-in-code',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.com/api/og?title=Stop%20Rewriting%20Excel%20in%20Code&description=Your%20spreadsheet%20already%20works.%20Turn%20it%20into%20an%20API.',
      width: 1200,
      height: 630,
      alt: 'Stop Rewriting Excel in Code',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stop Rewriting Excel in Code',
    description: 'Your spreadsheet already works. Turn it into an API in minutes — not months.',
  },
  alternates: {
    canonical: 'https://spreadapi.com/stop-rewriting-excel-in-code',
  },
};

export default function StopRewritingExcelPage() {
  return (
    <>
      <link rel="stylesheet" href="/fonts/satoshi-fixed.css" />
      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="stop-rewriting-excel-in-code" />

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
                                <div>For Developers</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                Stop Rewriting <span className="text-color-primary">Excel in Code</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              Your spreadsheet already works. Turn it into an API in minutes — not months.
                              Delete thousands of lines of formula translation code. Ship faster with 100% accuracy.
                            </p>
                            <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <a href="/app" className="button is-primary" style={{
                                background: '#502D80',
                                color: 'white',
                                padding: '14px 28px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '16px'
                              }}>
                                Try It Free
                              </a>
                              <a href="#how-it-works" style={{
                                padding: '14px 28px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '16px',
                                border: '2px solid #502D80',
                                color: '#502D80'
                              }}>
                                See How It Works
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* The Scenario Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            <span className="text-color-primary">"Just convert this Excel to code"</span>, they said.
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            We've all been there. Business hands you a spreadsheet — their pricing model,
                            financial calculator, or technical configurator. Years of refined logic in those cells.
                          </p>
                          <p className="text-size-medium" style={{ marginTop: '16px' }}>
                            "Can you just put this on the website?" they ask. It sounds simple.
                            Three months later, you're still debugging why your JavaScript doesn't match Excel.
                          </p>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div style={{
                          background: '#f8f9fa',
                          borderRadius: '12px',
                          padding: '32px',
                        }}>
                          <div style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            marginBottom: '16px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>PM</div>
                              <strong>Product Manager</strong>
                            </div>
                            <p style={{ margin: 0, color: '#333', fontStyle: 'italic' }}>
                              "It's just an Excel file with some formulas. Should be quick, right?"
                            </p>
                          </div>
                          <div style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#34a853', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Dev</div>
                              <strong>Developer (3 months later)</strong>
                            </div>
                            <p style={{ margin: 0, color: '#666' }}>
                              "The numbers are off by 0.3%. Finance says it's wrong. I've been debugging VLOOKUP edge cases for two weeks..."
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Why It's Hard Section */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>The Hidden Complexity</div>
                            </div>
                          </div>
                          <h2>
                            Why Excel-to-Code Is <span className="text-color-primary">Harder Than It Looks</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Formula Translation */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Formula Translation</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          A single Excel formula becomes dozens of lines of code. VLOOKUP alone requires
                          implementing search logic, error handling, and 1-based indexing.
                        </p>
                        <div style={{ background: '#f8f8f8', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
                          <div style={{ color: '#666', marginBottom: '8px' }}>Excel:</div>
                          <code>=IF(B2&gt;1000, VLOOKUP(A2,Table,3)*0.9, VLOOKUP(A2,Table,2))</code>
                          <div style={{ color: '#666', marginTop: '12px', marginBottom: '8px' }}>JavaScript:</div>
                          <code style={{ color: '#dc2626' }}>// 50+ lines of code...</code>
                        </div>
                      </div>

                      {/* Hidden Dependencies */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V8.625M13.5 3L19 8.625M13.5 3V8.625H19" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 13H15M9 17H12" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Hidden Dependencies</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          That formula references other sheets, named ranges, and external data sources.
                          Your code needs to recreate an entire dependency graph.
                        </p>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          <li>Cross-sheet references</li>
                          <li>Named ranges</li>
                          <li>Conditional formatting logic</li>
                          <li>Data validation rules</li>
                        </ul>
                      </div>

                      {/* Excel-Specific Functions */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 3H5C3.89543 3 3 3.89543 3 5V9M9 3V7C9 8.10457 8.10457 9 7 9H3M9 3H15M3 9V15M21 9V5C21 3.89543 20.1046 3 19 3H15M21 9H17C15.8954 9 15 8.10457 15 7V3M21 9V15M3 15V19C3 20.1046 3.89543 21 5 21H9M3 15H7C8.10457 15 9 15.8954 9 17V21M21 15V19C21 20.1046 20.1046 21 19 21H15M21 15H17C15.8954 15 15 15.8954 15 17V21M9 21H15" stroke="#2563eb" strokeWidth="2"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Excel-Specific Functions</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          WORKDAY, PMT, XIRR, SUMPRODUCT... Excel has 500+ functions.
                          Each needs a perfect JavaScript implementation.
                        </p>
                        <div style={{ background: '#f8f8f8', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
                          <code>=WORKDAY(TODAY(), 10, Holidays)</code>
                          <div style={{ color: '#666', marginTop: '8px', fontSize: '11px' }}>
                            → Weekend logic + holiday handling + date system matching
                          </div>
                        </div>
                      </div>

                      {/* The 1000 Formulas Problem */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="#db2777" strokeWidth="2"/>
                            <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="#db2777" strokeWidth="2"/>
                            <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="#db2777" strokeWidth="2"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>The 1000 Formulas Problem</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          Real business models have hundreds or thousands of interconnected formulas.
                          Translating them all while maintaining the calculation order? Nightmare.
                        </p>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          <strong>Real example:</strong> A pricing configurator with material costs,
                          volume discounts, regional adjustments, shipping, tax rules, and margin calculations.
                        </div>
                      </div>

                      {/* Edge Cases */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#9333ea" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Edge Cases & Rounding</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          Excel handles floating point math, date boundaries, and empty cells in specific ways.
                          Your code will be "close" but never exactly right.
                        </p>
                        <div style={{ fontSize: '14px', color: '#dc2626' }}>
                          "The numbers are off by 0.01% — Finance says it's wrong."
                        </div>
                      </div>

                      {/* The Sync Problem */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>The Sync Problem</h3>
                        <p style={{ color: '#666', marginBottom: '16px', fontSize: '15px' }}>
                          Business updates the Excel file every quarter. Now your code is outdated.
                          Re-translate? Every. Single. Time.
                        </p>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          <strong>The cycle:</strong> Excel changes → Code breaks → Developer fixes → Repeat forever
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* The Real Cost Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>The Real Cost</div>
                            </div>
                          </div>
                          <h2>
                            What Excel-to-Code <span className="text-color-primary">Actually Costs</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ background: '#fef2f2', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>2-6</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>Months</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Initial implementation time</div>
                      </div>
                      <div style={{ background: '#fef2f2', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>70-95%</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>Accuracy</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Edge cases always missed</div>
                      </div>
                      <div style={{ background: '#fef2f2', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>∞</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>Maintenance</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Every Excel change = more work</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* The Insight / Solution Section */}
            <section id="how-it-works" className="section-home-feature" style={{ background: '#f8f6fe' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            What If You <span className="text-color-primary">Didn't Have To?</span>
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium" style={{ fontSize: '20px', lineHeight: '1.6' }}>
                            The spreadsheet already works. The formulas are tested. The business trusts the numbers.
                          </p>
                          <p className="text-size-medium" style={{ marginTop: '20px', fontSize: '20px', lineHeight: '1.6' }}>
                            <strong>So why rewrite it?</strong>
                          </p>
                          <p className="text-size-medium" style={{ marginTop: '20px' }}>
                            With SpreadAPI, Excel <em>is</em> your calculation engine. Upload your spreadsheet,
                            define inputs and outputs, and get an API. The original formulas run — not a translation.
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>100% Accuracy</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>Minutes, Not Months</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>Zero Maintenance</span>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8e8e8' }}>
                          <div style={{ background: '#1a1a1a', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                            <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>Before vs After</span>
                          </div>
                          <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '20px' }}>
                              <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>BEFORE: Translation Nightmare</div>
                              <pre style={{ background: '#f8f8f8', padding: '12px', borderRadius: '6px', fontSize: '11px', overflow: 'auto', margin: 0, color: '#666' }}>
{`// 500+ lines trying to match Excel
class PricingCalculator {
  calculatePrice(product, qty, region) {
    // Implement VLOOKUP...
    // Handle discount tiers...
    // Apply regional rules...
    // Match Excel rounding...
    // Still doesn't match exactly
  }
}`}
                              </pre>
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600', marginBottom: '8px' }}>AFTER: 5 Lines, Perfect Accuracy</div>
                              <pre style={{ background: '#f0fdf4', padding: '12px', borderRadius: '6px', fontSize: '11px', overflow: 'auto', margin: 0, border: '1px solid #bbf7d0' }}>
{`const price = await fetch(
  'https://spreadapi.com/api/v1/services/pricing/execute',
  { body: JSON.stringify({ product, qty, region }) }
).then(r => r.json());`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Separation of Concerns Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Clean Architecture</div>
                            </div>
                          </div>
                          <h2>
                            Everyone Does <span className="text-color-primary">What They're Best At</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            The Excel expert doesn't need to learn JavaScript. The developer doesn't need to understand
                            the financial model. Business can update rules without a deployment.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                      <div style={{ background: '#e8f5e9', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3H10V10H3V3ZM14 3H21V10H14V3ZM14 14H21V21H14V14ZM3 14H10V21H3V14Z" stroke="#22c55e" strokeWidth="2"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Excel Expert</h3>
                        <p style={{ color: '#166534', fontSize: '15px', marginBottom: '16px' }}>
                          Builds and maintains the calculation model in familiar Excel
                        </p>
                        <div style={{ fontSize: '13px', color: '#666', background: 'white', padding: '12px', borderRadius: '8px' }}>
                          Updates pricing? Just save the spreadsheet. Done.
                        </div>
                      </div>

                      <div style={{ background: '#e0e7ff', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Frontend Developer</h3>
                        <p style={{ color: '#3730a3', fontSize: '15px', marginBottom: '16px' }}>
                          Consumes the API, builds the UI, focuses on user experience
                        </p>
                        <div style={{ fontSize: '13px', color: '#666', background: 'white', padding: '12px', borderRadius: '8px' }}>
                          No need to understand complex financial formulas.
                        </div>
                      </div>

                      <div style={{ background: '#fef3c7', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21M20 8V14M23 11H17M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7Z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Business Team</h3>
                        <p style={{ color: '#92400e', fontSize: '15px', marginBottom: '16px' }}>
                          Updates rules anytime — no tickets, no deployments, no waiting
                        </p>
                        <div style={{ fontSize: '13px', color: '#666', background: 'white', padding: '12px', borderRadius: '8px' }}>
                          Change pricing in Excel → Live instantly.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Who Benefits Section */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Who Benefits</div>
                            </div>
                          </div>
                          <h2>
                            Built for <span className="text-color-primary">Everyone</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', maxWidth: '1100px', margin: '0 auto' }}>
                      {/* For Developers */}
                      <div style={{ background: 'white', padding: '36px', borderRadius: '16px', border: '1px solid #e8e8e8' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ background: '#e0e7ff', padding: '8px', borderRadius: '8px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          For Developers
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span><strong>Delete thousands of lines</strong> of formula translation code</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span><strong>Stop debugging</strong> "why doesn't this match Excel?"</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span><strong>Ship faster</strong> — hours instead of months</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span><strong>Focus on the app</strong>, not formula translation</span>
                          </li>
                        </ul>
                      </div>

                      {/* For No-Code Builders */}
                      <div style={{ background: 'white', padding: '36px', borderRadius: '16px', border: '1px solid #e8e8e8' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ background: '#fce7f3', padding: '8px', borderRadius: '8px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          For No-Code Builders
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span><strong>Complex calculations</strong> without writing code</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span><strong>Connect to Webflow, Bubble, Zapier</strong> via simple API</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span><strong>Build pricing calculators</strong>, configurators, quote tools</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span><strong>No developer needed</strong> for the calculation logic</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Use Cases Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Real Examples</div>
                            </div>
                          </div>
                          <h2>
                            What People <span className="text-color-primary">Build With This</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                      {[
                        { icon: '💰', title: 'Pricing Engines', desc: 'Complex pricing with volume discounts, tiers, regions' },
                        { icon: '🏠', title: 'Mortgage Calculators', desc: 'Loan payments, amortization, what-if scenarios' },
                        { icon: '⚙️', title: 'Technical Configurators', desc: 'Product configs with dependencies and constraints' },
                        { icon: '📊', title: 'Financial Models', desc: 'NPV, IRR, cash flow projections' },
                        { icon: '🚚', title: 'Shipping Calculators', desc: 'Weight, zone, carrier logic combined' },
                        { icon: '💼', title: 'Commission Calculators', desc: 'Complex sales commission with tiers and bonuses' },
                        { icon: '📐', title: 'Engineering Calcs', desc: 'Material strength, load calculations, safety factors' },
                        { icon: '🏷️', title: 'Quote Generators', desc: 'Multi-line quotes with all business rules' },
                      ].map((item, index) => (
                        <div key={index} style={{ background: '#f8f9fa', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                          <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>{item.title}</h4>
                          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ / Objections Section */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <h2>
                            Common <span className="text-color-primary">Questions</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                      {[
                        {
                          q: '"What about performance?"',
                          a: 'First call: 100-200ms. Cached calls: <20ms. Accurate results are worth the minimal latency — and it\'s still faster than waiting 3 months for a buggy reimplementation.'
                        },
                        {
                          q: '"What if the Excel has errors?"',
                          a: 'Your reimplementation would have the same errors — plus translation bugs. At least with SpreadAPI, the numbers match what business expects. Fix once in Excel, fixed everywhere.'
                        },
                        {
                          q: '"What about version control?"',
                          a: 'SpreadAPI versions every upload. You can switch between versions via API parameter. Full audit trail of every change.'
                        },
                        {
                          q: '"Can the CFO audit it?"',
                          a: 'Yes! They can audit the actual Excel file being used — not thousands of lines of JavaScript they don\'t understand. It\'s their spreadsheet, running live.'
                        },
                      ].map((item, index) => (
                        <div key={index} style={{ background: 'white', padding: '28px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e8e8e8' }}>
                          <h4 style={{ marginBottom: '12px', fontSize: '18px', color: '#333' }}>{item.q}</h4>
                          <p style={{ color: '#666', margin: 0, fontSize: '15px', lineHeight: '1.6' }}>{item.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Final CTA Section */}
            <section className="section-home-cta" style={{ background: 'linear-gradient(135deg, #502D80 0%, #7c3aed 100%)' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
                      <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '36px' }}>
                        Ready to Stop Rewriting Excel?
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px', lineHeight: '1.6' }}>
                        Upload your spreadsheet. Get an API. Delete thousands of lines of code.
                        It really is that simple.
                      </p>
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="/app" style={{
                          background: 'white',
                          color: '#502D80',
                          padding: '16px 32px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          Try It Free
                        </a>
                        <a href="/how-excel-api-works" style={{
                          background: 'transparent',
                          color: 'white',
                          padding: '16px 32px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px',
                          border: '2px solid white'
                        }}>
                          See How It Works
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
