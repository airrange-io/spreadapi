import { Metadata } from 'next';
import '../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Security & Compliance | SpreadAPI',
  description: 'Learn how SpreadAPI protects your data. Built on certified infrastructure, minimal data storage, GDPR compliance, and on-premises options for regulated industries.',
  keywords: 'spreadapi security, data protection, soc 2, gdpr compliance, hipaa, enterprise security, data encryption, api security',
  openGraph: {
    title: 'Security & Compliance - SpreadAPI',
    description: 'Security-focused by design with minimal data footprint. Built on certified infrastructure, your formulas stay private.',
    type: 'article',
    url: 'https://spreadapi.io/security',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.io/api/og?title=Security%20%26%20Compliance&description=Enterprise-grade%20security%20with%20minimal%20data%20footprint',
      width: 1200,
      height: 630,
      alt: 'SpreadAPI Security & Compliance',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Security & Compliance - SpreadAPI',
    description: 'Security-focused by design. Built on certified infrastructure with minimal data footprint.',
  },
  alternates: {
    canonical: 'https://spreadapi.io/security',
  },
};

export default function SecurityPage() {
  return (
    <>
      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="docs" locale="en" />

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
                                <div>Trust & Transparency</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                Your Data, <span className="text-color-primary">Protected</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              We built SpreadAPI with a simple principle: collect only what's essential, protect everything we touch, and give you full control over your data.
                            </p>
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
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>Built on SOC 2 Type 2 Infrastructure</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>ISO 27001 Certified Providers</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>TLS 1.3 Encryption</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>GDPR Compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Our Approach */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Our Philosophy</div>
                            </div>
                          </div>
                          <h2>
                            Less Data, <span className="text-color-primary">More Security</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            The best way to protect data is to not collect it in the first place. Here's what makes SpreadAPI different.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ background: '#f0fdf4', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#166534' }}>Email Only</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          We store just your email address. No names, phone numbers, addresses, or tracking data.
                        </p>
                      </div>
                      <div style={{ background: '#f0fdf4', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#166534' }}>15-Minute Cache</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          Calculation results are cached briefly for performance, then automatically deleted. We don't keep your query data.
                        </p>
                      </div>
                      <div style={{ background: '#f0fdf4', padding: '28px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                          </svg>
                        </div>
                        <h4 style={{ marginBottom: '8px', fontSize: '18px', color: '#166534' }}>Formulas Stay Private</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          Your Excel formulas are never exposed. The API returns results only—your business logic remains yours.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Infrastructure Security */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Infrastructure</div>
                            </div>
                          </div>
                          <h2>
                            Built on <span className="text-color-primary">Trusted Foundations</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small">
                            We chose infrastructure providers with rigorous security certifications so you benefit from their enterprise-grade security controls.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Vercel */}
                      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 19.5h20L12 2z" fill="#000"/>
                          </svg>
                          Vercel
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                          Application hosting with global edge network. Enterprise hosting available for customers with stricter requirements.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>SOC 2 Type 2</span>
                          <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>ISO 27001</span>
                          <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>GDPR</span>
                        </div>
                      </div>

                      {/* Redis */}
                      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#DC382D"/>
                          </svg>
                          Redis Cloud
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                          Database for metadata and caching
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>SOC 2 Type 2</span>
                          <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>ISO 27001</span>
                          <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>ISO 27017</span>
                          <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>ISO 27018</span>
                        </div>
                      </div>

                      {/* Hanko */}
                      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97757" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                          </svg>
                          Hanko
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                          Passwordless authentication
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>FIDO Alliance</span>
                          <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>FIDO2 Certified</span>
                          <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>Open Source</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Authentication & Encryption */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Authentication */}
                      <div>
                        <div className="margin-bottom margin-small">
                          <div className="subheading">
                            <div>Authentication</div>
                          </div>
                        </div>
                        <h3 style={{ marginBottom: '16px' }}>Phishing-Proof <span className="text-color-primary">Login</span></h3>
                        <p style={{ color: '#666', marginBottom: '24px' }}>
                          We use passkeys instead of passwords. Your credentials are stored on your device, not our servers—making phishing attacks impossible.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                              <path d="M9 12l2 2 4-4"/>
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                            <span>No passwords to steal or guess</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                              <path d="M9 12l2 2 4-4"/>
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                            <span>Passkeys only work on legitimate domains</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                              <path d="M9 12l2 2 4-4"/>
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                            <span>Cryptographically secure, device-bound</span>
                          </li>
                        </ul>
                      </div>

                      {/* Encryption */}
                      <div>
                        <div className="margin-bottom margin-small">
                          <div className="subheading">
                            <div>Encryption</div>
                          </div>
                        </div>
                        <h3 style={{ marginBottom: '16px' }}>Protected <span className="text-color-primary">Everywhere</span></h3>
                        <p style={{ color: '#666', marginBottom: '24px' }}>
                          Your data is encrypted in transit and at rest. API tokens are hashed—we never store the actual values.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                              <path d="M9 12l2 2 4-4"/>
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                            <span>TLS 1.3 for all connections</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                              <path d="M9 12l2 2 4-4"/>
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                            <span>AES-256 encryption at rest</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                              <path d="M9 12l2 2 4-4"/>
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                            <span>SHA-256 hashed API tokens</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Compliance */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Compliance</div>
                            </div>
                          </div>
                          <h2>
                            Meeting <span className="text-color-primary">Your Requirements</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                      {/* GDPR */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 16v-4M12 8h.01"/>
                          </svg>
                          GDPR
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          Full GDPR compliance with data minimization, right to erasure, and data portability. DPA available upon request.
                        </p>
                      </div>

                      {/* HIPAA */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                          </svg>
                          Healthcare & Regulated Industries
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          Need HIPAA? We offer Enterprise hosting on HIPAA-ready infrastructure, or On-Premises deployment in your own compliant environment.
                        </p>
                      </div>

                      {/* SOC 2 */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e8e8e8' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="M9 12l2 2 4-4"/>
                          </svg>
                          Certified Providers
                        </h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                          All our infrastructure providers (Vercel, Redis Cloud) maintain SOC 2 Type 2 and ISO 27001 certifications with annual third-party audits.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* On-Premises Option */}
            <section className="section-home-feature" style={{ background: 'linear-gradient(135deg, #502D80 0%, #7c3aed 100%)' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
                      <div>
                        <div className="margin-bottom margin-xsmall">
                          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Maximum Control
                          </div>
                        </div>
                        <h2 style={{ color: 'white', marginBottom: '16px' }}>
                          Need Complete Data Sovereignty?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '24px', fontSize: '18px' }}>
                          Deploy SpreadAPI Runtime in your own infrastructure. Zero external connections, air-gap compatible for runtime execution, no vendor access to your data.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <a href="/on-premises" style={{
                            background: 'white',
                            color: '#502D80',
                            padding: '14px 28px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '16px'
                          }}>
                            Learn About On-Premises
                          </a>
                          <a href="mailto:team@airrange.io?subject=Enterprise Security Inquiry" style={{
                            background: 'transparent',
                            color: 'white',
                            padding: '14px 28px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '16px',
                            border: '2px solid white'
                          }}>
                            Contact Enterprise Team
                          </a>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                          <div>
                            <div style={{ color: 'white', fontWeight: '600' }}>Your Infrastructure</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Data never leaves your network</div>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2"/>
                            <path d="M8 21h8M12 17v4"/>
                          </svg>
                          <div>
                            <div style={{ color: 'white', fontWeight: '600' }}>Air-Gap Ready Runtime</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>No internet connection required for execution</div>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                          <div>
                            <div style={{ color: 'white', fontWeight: '600' }}>Zero Vendor Access</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Full control, full privacy</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-medium">
                  <div className="padding-section-large">
                    <div className="text-align-center">
                      <div className="margin-bottom margin-small">
                        <h2>
                          Questions About <span className="text-color-primary">Security?</span>
                        </h2>
                      </div>
                      <p className="text-size-medium" style={{ marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
                        We're happy to discuss your specific requirements, provide compliance documentation, or arrange a security review.
                      </p>
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="mailto:team@airrange.io?subject=Security Inquiry" style={{
                          background: '#502D80',
                          color: 'white',
                          padding: '14px 28px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          Contact Security Team
                        </a>
                        <a href="/docs" style={{
                          background: 'transparent',
                          color: '#502D80',
                          padding: '14px 28px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px',
                          border: '2px solid #502D80'
                        }}>
                          View Documentation
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <Footer locale="en" currentPath="/security" />
        </div>
      </div>
    </>
  );
}
