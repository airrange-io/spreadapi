import { Metadata } from 'next';
import '../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'On-Premises & Enterprise | SpreadAPI',
  description: 'Deploy SpreadAPI in your own infrastructure. Full data sovereignty, zero external dependencies. Perfect for financial services, consulting firms, and regulated industries.',
  keywords: 'on-premises excel api, self-hosted spreadsheet, enterprise excel, data compliance, gdpr excel api, financial services excel',
  openGraph: {
    title: 'On-Premises & Enterprise - SpreadAPI',
    description: 'Your Excel calculations. Your infrastructure. Zero data leaves your network.',
    type: 'article',
    url: 'https://spreadapi.com/on-premises',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.com/api/og?title=On-Premises%20%26%20Enterprise&description=Your%20Excel%20calculations.%20Your%20infrastructure.',
      width: 1200,
      height: 630,
      alt: 'SpreadAPI On-Premises',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'On-Premises & Enterprise - SpreadAPI',
    description: 'Your Excel calculations. Your infrastructure. Zero data leaves your network.',
  },
  alternates: {
    canonical: 'https://spreadapi.com/on-premises',
  },
};

export default function OnPremisesPage() {
  return (
    <>
      <link rel="stylesheet" href="/fonts/satoshi-fixed.css" />
      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="on-premises" />

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
                                <div>Enterprise & Compliance Ready</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                Your Data. <span className="text-color-primary">Your Servers.</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              Run Excel calculations on your own infrastructure. Perfect for financial services,
                              consulting firms, and any organization where data must never leave the building.
                            </p>
                            <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <a href="mailto:team@airrange.io?subject=SpreadAPI Enterprise Inquiry" className="button is-primary" style={{
                                background: '#502D80',
                                color: 'white',
                                padding: '14px 28px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '16px'
                              }}>
                                Contact Sales
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

            {/* Trust Badges */}
            <section style={{ background: '#f8f9fa', padding: '40px 0' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>Full Data Sovereignty</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>Zero External Dependencies</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>No Cloud Storage</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <path d="M8 21h8M12 17v4"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>Air-Gapped Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* The Problem Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>The Challenge</div>
                            </div>
                          </div>
                          <h2>
                            Excel Powers Your Business. <span className="text-color-primary">But It Doesn&apos;t Scale.</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            Your tax models, pricing engines, and compliance calculations live in Excel.
                            They&apos;re trusted, audited, and battle-tested. But they&apos;re stuck on individual desktops.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ background: '#fef2f2', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#991b1b' }}>Compliance Risk</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          Cloud solutions mean your sensitive data leaves your network
                        </p>
                      </div>
                      <div style={{ background: '#fef2f2', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#991b1b' }}>Months of Development</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          Rewriting Excel logic in code takes forever and introduces bugs
                        </p>
                      </div>
                      <div style={{ background: '#fef2f2', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#991b1b' }}>No Scalability</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          One spreadsheet, one user. Can&apos;t integrate with systems or automation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="section-home-feature" style={{ background: '#f8f6fe' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>The Solution</div>
                            </div>
                          </div>
                          <h2>
                            SpreadAPI Runtime: <span className="text-color-primary">100% On-Premises</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            Build your Excel services in the browser. Deploy them on your servers.
                            No data ever touches our cloud.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Architecture Diagram */}
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '2px solid #E8E0FF' }}>
                        {/* Step 1 */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '40px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#9333EA',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '20px',
                            flexShrink: 0
                          }}>1</div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>Build in Your Browser</h3>
                            <p style={{ color: '#666', marginBottom: '16px' }}>
                              Import your Excel file. Define inputs and outputs. Test calculations.
                              <strong style={{ color: '#22c55e' }}> Everything stays in your browser memory.</strong>
                            </p>
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                <path d="M22 4L12 14.01l-3-3"/>
                              </svg>
                              <span style={{ color: '#166534', fontSize: '14px' }}>No data sent to any server during development</span>
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                          <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
                            <path d="M12 0v40M12 40l-8-8M12 40l8-8" stroke="#9333EA" strokeWidth="2"/>
                          </svg>
                        </div>

                        {/* Step 2 */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '40px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#9333EA',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '20px',
                            flexShrink: 0
                          }}>2</div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>Export Service Package</h3>
                            <p style={{ color: '#666', marginBottom: '16px' }}>
                              Click &quot;Export for Runtime&quot; to download a JSON file containing your service configuration.
                              <strong style={{ color: '#22c55e' }}> The file downloads directly to your computer.</strong>
                            </p>
                            <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#666' }}>
                              <span style={{ color: '#9333EA' }}>tax-calculator_runtime.json</span> (184 KB)
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                          <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
                            <path d="M12 0v40M12 40l-8-8M12 40l8-8" stroke="#9333EA" strokeWidth="2"/>
                          </svg>
                        </div>

                        {/* Step 3 */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#9333EA',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '20px',
                            flexShrink: 0
                          }}>3</div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>Deploy to Your Infrastructure</h3>
                            <p style={{ color: '#666', marginBottom: '16px' }}>
                              Run SpreadAPI Runtime on your servers using Docker. Upload the service package.
                              <strong style={{ color: '#22c55e' }}> Your calculation API is now live—internally.</strong>
                            </p>
                            <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#e5e5e5' }}>
                              <div style={{ color: '#888', marginBottom: '8px' }}># Deploy in minutes</div>
                              <div><span style={{ color: '#22c55e' }}>$</span> docker run -p 3001:3001 spreadapi/runtime</div>
                              <div style={{ color: '#888', marginTop: '8px' }}># Your API is ready at</div>
                              <div><span style={{ color: '#9333EA' }}>http://internal.company.com:3001/api/execute/tax-calculator</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Flow Diagram */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Data Flow</div>
                            </div>
                          </div>
                          <h2>
                            Zero Data Leaves <span className="text-color-primary">Your Network</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Visual Data Flow */}
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        borderRadius: '16px',
                        padding: '40px',
                        border: '2px solid #bbf7d0'
                      }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#166534',
                            color: 'white',
                            padding: '8px 20px',
                            borderRadius: '100px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            YOUR SECURE NETWORK BOUNDARY
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'center' }}>
                          {/* Your Systems */}
                          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                              <rect x="2" y="3" width="20" height="14" rx="2"/>
                              <path d="M8 21h8M12 17v4"/>
                            </svg>
                            <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Your Applications</h4>
                            <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Web apps, ERP, CRM, internal tools</p>
                          </div>

                          {/* Arrows */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="100" height="24" viewBox="0 0 100 24" fill="none">
                              <path d="M0 12h90M90 12l-8-8M90 12l-8 8" stroke="#166534" strokeWidth="2"/>
                            </svg>
                            <span style={{ fontSize: '12px', color: '#166534', fontWeight: '500' }}>REST API</span>
                            <svg width="100" height="24" viewBox="0 0 100 24" fill="none">
                              <path d="M100 12H10M10 12l8-8M10 12l8 8" stroke="#166534" strokeWidth="2"/>
                            </svg>
                          </div>

                          {/* SpreadAPI Runtime */}
                          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '2px solid #9333EA' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <path d="M3 9h18M9 21V9"/>
                            </svg>
                            <h4 style={{ marginBottom: '8px', fontSize: '16px', color: '#9333EA' }}>SpreadAPI Runtime</h4>
                            <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Your server, Docker container</p>
                          </div>
                        </div>

                        <div style={{
                          marginTop: '32px',
                          padding: '20px',
                          background: 'rgba(255,255,255,0.7)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '48px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', color: '#166534' }}>No external database</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', color: '#166534' }}>No outbound connections</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', color: '#166534' }}>Works fully offline</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Enterprise Mode Feature */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            Enterprise Mode: <span className="text-color-primary">Disabled Cloud Save</span>
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            For organizations that need absolute assurance, we offer <strong>Enterprise Mode</strong> where
                            the &quot;Save to Cloud&quot; functionality is completely disabled.
                          </p>
                          <p className="text-size-medium" style={{ marginTop: '16px' }}>
                            Even if an employee tries to save data externally, it&apos;s architecturally impossible.
                            The button simply doesn&apos;t exist.
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>Zero trust architecture</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>Prevents accidental leaks</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '20px' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>Full audit compliance</span>
                          </div>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8e8e8' }}>
                          <div style={{ background: '#1a1a1a', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                            <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>Enterprise Mode</span>
                          </div>
                          <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span style={{ color: '#166534', fontWeight: '600' }}>Import Excel</span>
                              </div>
                              <span style={{ fontSize: '13px', color: '#666' }}>Browser memory only</span>
                            </div>
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span style={{ color: '#166534', fontWeight: '600' }}>Configure & Test</span>
                              </div>
                              <span style={{ fontSize: '13px', color: '#666' }}>Browser memory only</span>
                            </div>
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span style={{ color: '#166534', fontWeight: '600' }}>Export for Runtime</span>
                              </div>
                              <span style={{ fontSize: '13px', color: '#666' }}>Downloads to your disk</span>
                            </div>
                            <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', opacity: 0.6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path d="M6 6l8 8M14 6l-8 8" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <span style={{ color: '#991b1b', fontWeight: '600', textDecoration: 'line-through' }}>Save to Cloud</span>
                              </div>
                              <span style={{ fontSize: '13px', color: '#991b1b' }}>DISABLED in Enterprise Mode</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Specs */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Technical Specifications</div>
                            </div>
                          </div>
                          <h2>
                            Built for <span className="text-color-primary">Enterprise IT</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Deployment */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Deployment Options</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          <li>Docker container</li>
                          <li>Kubernetes / AKS / EKS / GKE</li>
                          <li>Bare metal / VM</li>
                          <li>Air-gapped environments</li>
                        </ul>
                      </div>

                      {/* Performance */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Performance</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          <li>10-50ms typical response time</li>
                          <li>Horizontal scaling supported</li>
                          <li>In-memory workbook caching</li>
                          <li>Handles 1000s of concurrent requests</li>
                        </ul>
                      </div>

                      {/* Excel Compatibility */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M3 9h18M9 21V9"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Excel Compatibility</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          <li>500+ Excel functions</li>
                          <li>XLOOKUP, FILTER, SORT, UNIQUE</li>
                          <li>LET, LAMBDA functions</li>
                          <li>Full array formula support</li>
                        </ul>
                      </div>

                      {/* Security */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Security</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          <li>No outbound connections required</li>
                          <li>Local file-based storage</li>
                          <li>Optional API authentication</li>
                          <li>Request logging & audit trail</li>
                        </ul>
                      </div>

                      {/* Requirements */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                            <rect x="4" y="4" width="16" height="16" rx="2"/>
                            <path d="M9 9h6v6H9z"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Requirements</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          <li>Node.js 18+ or Docker</li>
                          <li>256MB RAM minimum</li>
                          <li>No external database</li>
                          <li>No internet required</li>
                        </ul>
                      </div>

                      {/* API */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                            <path d="M16 18L22 12L16 6M8 6L2 12L8 18"/>
                          </svg>
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>REST API</h3>
                        <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                          <li>Standard JSON request/response</li>
                          <li>GET and POST supported</li>
                          <li>OpenAPI documentation</li>
                          <li>Health check endpoint</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Use Cases */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Use Cases</div>
                            </div>
                          </div>
                          <h2>
                            Built for <span className="text-color-primary">Regulated Industries</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Financial Services */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M3 9h18M9 21V9"/>
                            <path d="M15 15h.01M15 12h.01"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Financial Services</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Loan calculations, risk scoring, portfolio valuations</p>
                      </div>

                      {/* Consulting Firms */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="1.5">
                            <path d="M3 3v18h18"/>
                            <path d="M18 17V9M13 17V5M8 17v-3"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Consulting Firms</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Fee calculations, engagement pricing, resource models</p>
                      </div>

                      {/* Healthcare */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="1.5">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Healthcare</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Billing calculations, insurance processing, compliance</p>
                      </div>

                      {/* Insurance */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Insurance</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Premium calculations, actuarial models, claims processing</p>
                      </div>

                      {/* Manufacturing */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5">
                            <path d="M2 20h20M5 20V8l5-4 5 4v12"/>
                            <path d="M15 20v-8h5v8M10 12h.01M10 16h.01"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Manufacturing</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Bill of materials, cost rollups, margin calculations</p>
                      </div>

                      {/* Tax & Compliance */}
                      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>Tax & Compliance</h4>
                        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>VAT calculations, transfer pricing, regulatory rules</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Whitepaper CTA */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div style={{
                      maxWidth: '800px',
                      margin: '0 auto',
                      background: 'linear-gradient(135deg, #f8f6fe 0%, #e8e0ff 100%)',
                      borderRadius: '16px',
                      padding: '48px',
                      textAlign: 'center'
                    }}>
                      <div style={{ marginBottom: '20px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                        </svg>
                      </div>
                      <h3 style={{ marginBottom: '12px', fontSize: '24px' }}>Technical Whitepaper</h3>
                      <p style={{ color: '#666', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                        Get the detailed technical documentation covering architecture, security model,
                        deployment options, and compliance checklist.
                      </p>
                      <a href="/on-premises/whitepaper" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 28px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '16px',
                        border: '2px solid #9333EA',
                        color: '#9333EA'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                        </svg>
                        Read Technical Whitepaper
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Final CTA */}
            <section className="section-home-cta" style={{ background: 'linear-gradient(135deg, #502D80 0%, #7c3aed 100%)' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
                      <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '36px' }}>
                        Ready for Enterprise Excel APIs?
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px', lineHeight: '1.6' }}>
                        Let&apos;s discuss how SpreadAPI can help you scale your Excel-based business logic
                        while meeting your compliance requirements.
                      </p>
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="mailto:team@airrange.io?subject=SpreadAPI Enterprise Inquiry" style={{
                          background: 'white',
                          color: '#502D80',
                          padding: '16px 32px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          Contact Sales
                        </a>
                        <a href="/app" style={{
                          background: 'transparent',
                          color: 'white',
                          padding: '16px 32px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px',
                          border: '2px solid white'
                        }}>
                          Try Free Version
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <Footer currentPath="/on-premises" />
        </div>
      </div>
    </>
  );
}
