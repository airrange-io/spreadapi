'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/product/Footer';
import '../product/product.css';

export default function PricingPageClient() {
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
          <Navigation currentPage="pricing" />
          
          <main className="main-wrapper">
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
                                <div>Simple, Transparent Pricing</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                Choose the Plan That <span className="text-color-primary">Fits Your Needs</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '600px', margin: '0 auto' }}>
                              Start free and scale as you grow. No hidden fees, no surprises. 
                              Cancel anytime.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            
            {/* Pricing Plans */}
            <section style={{ padding: '80px 20px', background: '#f8f9fa' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '30px',
                  marginTop: '60px'
                }}>
                  {/* FREE Plan */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '40px 30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937' }}>FREE</h3>
                    <div style={{ marginBottom: '30px' }}>
                      <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937' }}>$0</span>
                      <span style={{ fontSize: '18px', color: '#6b7280' }}>/month</span>
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '30px', minHeight: '50px' }}>
                      Perfect for testing and personal projects
                    </p>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      margin: '0 0 30px 0',
                      flex: 1
                    }}>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ 1 Excel API</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ 100 API calls/month</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ Basic support</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ Community access</li>
                    </ul>
                    <a href="/" style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '12px 24px',
                      background: '#f3f4f6',
                      color: '#1f2937',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      border: '1px solid #e5e7eb'
                    }}>
                      Start Building Now
                    </a>
                  </div>

                  {/* LITE Plan */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '40px 30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '2px solid #9333EA',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#9333EA',
                      color: 'white',
                      padding: '4px 20px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Most Popular
                    </div>
                    <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937' }}>LITE</h3>
                    <div style={{ marginBottom: '30px' }}>
                      <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937' }}>$29</span>
                      <span style={{ fontSize: '18px', color: '#6b7280' }}>/month</span>
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '30px', minHeight: '50px' }}>
                      Great for small teams and growing projects
                    </p>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      margin: '0 0 30px 0',
                      flex: 1
                    }}>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ 10 Excel APIs</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ 10,000 API calls/month</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ Priority support</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ AI Integration (MCP)</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ Custom domains</li>
                    </ul>
                    <a href="/" style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '12px 24px',
                      background: '#9333EA',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}>
                      Get Instant API Access
                    </a>
                  </div>

                  {/* PRO Plan */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '40px 30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937' }}>PRO</h3>
                    <div style={{ marginBottom: '30px' }}>
                      <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937' }}>$99</span>
                      <span style={{ fontSize: '18px', color: '#6b7280' }}>/month</span>
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '30px', minHeight: '50px' }}>
                      For businesses with advanced needs
                    </p>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      margin: '0 0 30px 0',
                      flex: 1
                    }}>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ Unlimited Excel APIs</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ 100,000 API calls/month</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ Premium support</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ Advanced analytics</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ SLA guarantee</li>
                      <li style={{ padding: '10px 0', color: '#4b5563' }}>✓ Custom integrations</li>
                    </ul>
                    <a href="mailto:sales@spreadapi.com" style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '12px 24px',
                      background: '#1f2937',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}>
                      Contact Sales
                    </a>
                  </div>
                </div>

                {/* Enterprise Section */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '80px',
                  padding: '40px',
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ fontSize: '28px', marginBottom: '20px', color: '#1f2937' }}>
                    Need more? Let's talk Enterprise
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
                    Custom pricing for large organizations with specific requirements, 
                    dedicated support, and unlimited usage.
                  </p>
                  <a href="mailto:sales@spreadapi.com" style={{
                    display: 'inline-block',
                    padding: '14px 32px',
                    background: '#9333EA',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'all 0.2s ease'
                  }}>
                    Contact Sales
                  </a>
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
                            <h2 className="text-color-white">Transform Excel Into APIs</h2>
                          </div>
                          <p className="text-size-medium text-color-white">
                            No credit card required. Start with our free tier and upgrade when you need more.
                          </p>
                        </div>
                      </div>
                      <div className="margin-top margin-medium">
                        <div className="text-align-center">
                          <a href="/" className="button button-white">
                            Get Instant API Access
                          </a>
                        </div>
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