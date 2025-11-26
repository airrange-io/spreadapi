import { Metadata } from 'next';
import '../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import { SupportedLocale } from '@/lib/translations/blog-helpers';

export const metadata: Metadata = {
  title: 'When Your Automation Needs to Think | SpreadAPI',
  description: 'Zapier moves data. Make triggers actions. But who does the math? Add Excel-powered calculations to your automations without code.',
  keywords: 'zapier calculations, make integromat math, n8n complex calculations, power automate excel, automation calculator, no-code calculations',
  openGraph: {
    title: 'When Your Automation Needs to Think - SpreadAPI',
    description: 'Add Excel-powered calculations to Zapier, Make, n8n, and Power Automate. Complex business logic without code.',
    type: 'article',
    url: 'https://spreadapi.com/automation-calculations',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.com/api/og?title=When%20Your%20Automation%20Needs%20to%20Think&description=Add%20Excel-powered%20calculations%20to%20your%20automations',
      width: 1200,
      height: 630,
      alt: 'When Your Automation Needs to Think',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'When Your Automation Needs to Think',
    description: 'Add Excel-powered calculations to Zapier, Make, n8n, and Power Automate.',
  },
  alternates: {
    canonical: 'https://spreadapi.com/automation-calculations',
    languages: {
      'en': 'https://spreadapi.com/automation-calculations',
      'de': 'https://spreadapi.com/de/automation-calculations',
      'fr': 'https://spreadapi.com/fr/automation-calculations',
      'es': 'https://spreadapi.com/es/automation-calculations',
      'x-default': 'https://spreadapi.com/automation-calculations',
    },
  },
};

interface AutomationCalculationsContentProps {
  locale?: SupportedLocale;
}

export function AutomationCalculationsContent({ locale = 'en' }: AutomationCalculationsContentProps) {
  return (
    <>
      <link rel="stylesheet" href="/fonts/satoshi-fixed.css" />
      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="automation-calculations" locale={locale} />

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
                                <div>For Automation Builders</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                When Your Automation <span className="text-color-primary">Needs to Think</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '720px', margin: '0 auto' }}>
                              Zapier moves data. Make triggers actions. But who does the math?
                              Your Excel spreadsheets can now power the complex calculations your automations can't handle.
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
                                Get Started Free
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

            {/* Platform Logos */}
            <section style={{ background: '#f8f9fa', padding: '32px 0' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Works with your favorite automation platforms</p>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '48px', flexWrap: 'wrap' }}>
                      {/* Zapier */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FF4A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="#FF4A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="#FF4A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontWeight: '600' }}>Zapier</span>
                      </div>
                      {/* Make */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#6D00CC" strokeWidth="2"/>
                          <path d="M12 6V12L16 14" stroke="#6D00CC" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span style={{ fontWeight: '600' }}>Make</span>
                      </div>
                      {/* n8n */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                          <rect x="14" y="3" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                          <rect x="3" y="14" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                          <rect x="14" y="14" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                        </svg>
                        <span style={{ fontWeight: '600' }}>n8n</span>
                      </div>
                      {/* Power Automate */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontWeight: '600' }}>Power Automate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* The Problem: The Calculation Gap */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="feature-component">
                      <div className="feature-content-wrapper">
                        <div className="margin-bottom margin-small">
                          <h2>
                            The <span className="text-color-primary">Calculation Gap</span>
                          </h2>
                        </div>
                        <div className="margin-bottom margin-medium">
                          <p className="text-size-medium">
                            Automation platforms are amazing at moving data and triggering actions.
                            But when you need to <strong>calculate</strong> something complex?
                          </p>
                          <p className="text-size-medium" style={{ marginTop: '16px' }}>
                            You hit a wall. Nested IFs that break. Formula fields that can't handle your logic.
                            Workarounds that don't scale.
                          </p>
                        </div>
                      </div>
                      <div className="feature-image-wrapper">
                        <div style={{
                          background: '#f8f9fa',
                          borderRadius: '12px',
                          padding: '32px',
                        }}>
                          <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e', marginBottom: '12px' }}>Automations are great at:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {['Triggers', 'Data movement', 'Simple IF/THEN', 'API calls', 'Notifications'].map((item, i) => (
                                <span key={i} style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '16px', fontSize: '13px' }}>{item}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '12px' }}>Automations struggle with:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {['Multi-variable pricing', 'Weighted scoring', 'Complex rules', 'Financial calcs', 'Decision trees'].map((item, i) => (
                                <span key={i} style={{ background: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: '16px', fontSize: '13px' }}>{item}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* The Aha Moments */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Sound Familiar?</div>
                            </div>
                          </div>
                          <h2>
                            When You Wish Your Automation <span className="text-color-primary">Could Think</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                      {[
                        { scenario: 'Calculate a quote with 47 pricing rules', icon: '💰' },
                        { scenario: 'Score leads using your proven Excel model', icon: '📊' },
                        { scenario: 'Determine shipping costs across 12 carriers', icon: '🚚' },
                        { scenario: 'Check if an order qualifies for custom discounts', icon: '🏷️' },
                        { scenario: 'Calculate commissions with accelerators and tiers', icon: '💼' },
                        { scenario: 'Decide reorder quantities based on 20 factors', icon: '📦' },
                      ].map((item, index) => (
                        <div key={index} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e8e8e8', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                          <span style={{ fontSize: '28px' }}>{item.icon}</span>
                          <p style={{ margin: 0, color: '#333', fontSize: '15px', lineHeight: '1.5' }}>"{item.scenario}"</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                      <p style={{ color: '#666', fontSize: '16px', fontStyle: 'italic' }}>
                        Your automation can trigger all day long — but it can't <em>think</em>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* The Solution */}
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
                            Your Spreadsheet Becomes <span className="text-color-primary">The Brain</span>
                          </h2>
                          <p className="text-size-medium margin-top margin-small" style={{ maxWidth: '700px', margin: '20px auto 0' }}>
                            You already have an Excel model that does exactly what you need.
                            SpreadAPI turns it into an API endpoint your automation can call.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Flow Diagram */}
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '1px solid #e8e8e8' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                          {/* Trigger */}
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>Trigger</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>New order, lead, etc.</div>
                          </div>

                          {/* Arrow */}
                          <svg width="40" height="24" viewBox="0 0 40 24" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M0 12H36M36 12L28 4M36 12L28 20" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>

                          {/* SpreadAPI */}
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '100px', height: '80px', borderRadius: '12px', background: 'linear-gradient(135deg, #502D80 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                              <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>SpreadAPI</span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>Calculate</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Excel does the math</div>
                          </div>

                          {/* Arrow */}
                          <svg width="40" height="24" viewBox="0 0 40 24" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M0 12H36M36 12L28 4M36 12L28 20" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>

                          {/* Result */}
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>Continue</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Use the result</div>
                          </div>
                        </div>

                        <div style={{ marginTop: '32px', textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                            The automation sends inputs → <strong>SpreadAPI runs your Excel formulas</strong> → returns the calculated result
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3 Simple Steps */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>How It Works</div>
                            </div>
                          </div>
                          <h2>
                            Three Steps to <span className="text-color-primary">Smarter Automations</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Step 1 */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#502D80', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px', fontWeight: '700' }}>1</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Upload Your Excel</h3>
                        <p style={{ color: '#666', fontSize: '15px' }}>
                          The spreadsheet you already use. Your pricing model, scoring matrix, or calculation engine.
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#502D80', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px', fontWeight: '700' }}>2</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Define Inputs & Outputs</h3>
                        <p style={{ color: '#666', fontSize: '15px' }}>
                          Tell SpreadAPI which cells receive data from your automation and which cells return results.
                        </p>
                      </div>

                      {/* Step 3 */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#502D80', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px', fontWeight: '700' }}>3</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Call from Any Platform</h3>
                        <p style={{ color: '#666', fontSize: '15px' }}>
                          Use a simple HTTP/Webhook action to call your API. Works with Zapier, Make, n8n, Power Automate, and more.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Platform-Specific Examples */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Platform Integration</div>
                            </div>
                          </div>
                          <h2>
                            Works With <span className="text-color-primary">Every Platform</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                      {/* Zapier */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '2px solid #FF4A00' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FFF4F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FF4A00" strokeWidth="2"/>
                              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#FF4A00" strokeWidth="2"/>
                            </svg>
                          </div>
                          <h3 style={{ margin: 0, fontSize: '18px' }}>Zapier</h3>
                        </div>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                          Use the <strong>Webhooks by Zapier</strong> action to call your SpreadAPI endpoint between any trigger and action.
                        </p>
                        <div style={{ background: '#f8f8f8', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
                          Trigger → Webhook (POST to SpreadAPI) → Use result in next step
                        </div>
                      </div>

                      {/* Make */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '2px solid #6D00CC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F5F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="#6D00CC" strokeWidth="2"/>
                              <path d="M12 6V12L16 14" stroke="#6D00CC" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <h3 style={{ margin: 0, fontSize: '18px' }}>Make (Integromat)</h3>
                        </div>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                          Add an <strong>HTTP module</strong> to your scenario. Route based on the calculated result using Make's powerful filters.
                        </p>
                        <div style={{ background: '#f8f8f8', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
                          Module → HTTP Request → Router (based on result)
                        </div>
                      </div>

                      {/* n8n */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '2px solid #EA4B71' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FFF0F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="3" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                              <rect x="14" y="3" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                              <rect x="3" y="14" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                              <rect x="14" y="14" width="7" height="7" rx="1" stroke="#EA4B71" strokeWidth="2"/>
                            </svg>
                          </div>
                          <h3 style={{ margin: 0, fontSize: '18px' }}>n8n</h3>
                        </div>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                          Use the <strong>HTTP Request node</strong> in your workflow. Branch logic based on SpreadAPI's calculated output.
                        </p>
                        <div style={{ background: '#f8f8f8', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
                          Node → HTTP Request → IF node (branch on result)
                        </div>
                      </div>

                      {/* Power Automate */}
                      <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '2px solid #0066FF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F0F6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <h3 style={{ margin: 0, fontSize: '18px' }}>Power Automate</h3>
                        </div>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                          Add an <strong>HTTP connector</strong> action. Use the response in conditions to drive your flow logic.
                        </p>
                        <div style={{ background: '#f8f8f8', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
                          Trigger → HTTP → Condition → Actions
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Use Case Deep Dives */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Real Use Cases</div>
                            </div>
                          </div>
                          <h2>
                            What People <span className="text-color-primary">Actually Build</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
                      {/* Dynamic Pricing */}
                      <div style={{ background: '#f8f9fa', padding: '32px', borderRadius: '16px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '16px' }}>💰</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Dynamic Pricing</h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                          E-commerce order comes in → Calculate custom price based on quantity, customer tier, active promotions, and margins → Update order with final price.
                        </p>
                        <div style={{ background: 'white', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong>Example:</strong> Shopify → Zapier → SpreadAPI (pricing engine) → Update order
                        </div>
                      </div>

                      {/* Lead Scoring */}
                      <div style={{ background: '#f8f9fa', padding: '32px', borderRadius: '16px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Lead Scoring & Routing</h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                          New lead enters CRM → Score using 50+ weighted factors from your proven model → Route to the right sales rep automatically.
                        </p>
                        <div style={{ background: 'white', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong>Example:</strong> HubSpot → n8n → SpreadAPI (scoring) → Assign owner
                        </div>
                      </div>

                      {/* Quote Generation */}
                      <div style={{ background: '#f8f9fa', padding: '32px', borderRadius: '16px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '16px' }}>📄</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Instant Quotes</h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                          Customer fills a form → Calculate complex pricing with dependencies, configurations, and discounts → Generate and send PDF quote.
                        </p>
                        <div style={{ background: 'white', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong>Example:</strong> Typeform → Make → SpreadAPI → Generate PDF → Email
                        </div>
                      </div>

                      {/* Commission Calculation */}
                      <div style={{ background: '#f8f9fa', padding: '32px', borderRadius: '16px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '16px' }}>💼</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Commission Calculation</h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                          Deal marked as won → Calculate commission with tiers, accelerators, team splits, and bonuses → Update payroll system.
                        </p>
                        <div style={{ background: 'white', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong>Example:</strong> Salesforce → Zapier → SpreadAPI → Update ADP
                        </div>
                      </div>

                      {/* Inventory Decisions */}
                      <div style={{ background: '#f8f9fa', padding: '32px', borderRadius: '16px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Smart Reordering</h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                          Daily inventory check → Calculate optimal reorder quantities considering lead times, seasonality, and cash flow → Create purchase orders.
                        </p>
                        <div style={{ background: 'white', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong>Example:</strong> Schedule → n8n → SpreadAPI → Create PO in NetSuite
                        </div>
                      </div>

                      {/* Approval Thresholds */}
                      <div style={{ background: '#f8f9fa', padding: '32px', borderRadius: '16px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '16px' }}>✅</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Smart Approvals</h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                          Expense submitted → Evaluate against budget, policy rules, and historical patterns → Auto-approve or route for human review.
                        </p>
                        <div style={{ background: 'white', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong>Example:</strong> Expensify → Power Automate → SpreadAPI → Route
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Why This Beats Alternatives */}
            <section className="section-home-feature" style={{ background: '#f8f9fa' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="margin-bottom margin-large">
                      <div className="text-align-center">
                        <div className="max-width-large align-center">
                          <div className="margin-bottom margin-xsmall">
                            <div className="subheading">
                              <div>Why SpreadAPI</div>
                            </div>
                          </div>
                          <h2>
                            Better Than <span className="text-color-primary">The Alternatives</span>
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ display: 'grid', gap: '16px' }}>
                        {/* Native Formulas */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e8e8e8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#dc2626' }}>Native Platform Formulas</h4>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Limited functions, nested IFs break, hard to maintain and debug.</p>
                          </div>
                          <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#22c55e' }}>SpreadAPI</h4>
                            <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>Full Excel power. 500+ functions. Easy to update.</p>
                          </div>
                        </div>

                        {/* Custom Code */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e8e8e8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#dc2626' }}>Custom Code / Functions</h4>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Requires a developer, expensive to build, slow to change.</p>
                          </div>
                          <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#22c55e' }}>SpreadAPI</h4>
                            <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>No code needed. Business team can update anytime.</p>
                          </div>
                        </div>

                        {/* Google Sheets */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e8e8e8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#dc2626' }}>Google Sheets Integration</h4>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Slow, rate-limited, exposes your formulas, not designed for API use.</p>
                          </div>
                          <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#22c55e' }}>SpreadAPI</h4>
                            <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>Fast (sub-100ms). Secure. Built for high-volume API calls.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="section-home-feature">
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
                          q: '"How fast is the API response?"',
                          a: 'Most calls return in under 100ms. Complex spreadsheets with many formulas may take 100-200ms. Either way, fast enough for real-time automation workflows.'
                        },
                        {
                          q: '"What if my automation runs thousands of times per day?"',
                          a: 'SpreadAPI is built for high-volume use. Our infrastructure handles millions of calculations. Check our pricing page for rate limits on each plan.'
                        },
                        {
                          q: '"Can I use Google Sheets instead of Excel?"',
                          a: 'Currently we focus on Excel files (.xlsx). You can export Google Sheets to Excel format and upload that. Native Google Sheets support is on our roadmap.'
                        },
                        {
                          q: '"Is my spreadsheet data secure?"',
                          a: 'Your spreadsheet and data are encrypted at rest and in transit. We never expose your formulas — only the results. Your intellectual property stays protected.'
                        },
                        {
                          q: '"What happens if I update the Excel file?"',
                          a: 'Upload the new version to SpreadAPI. Your API endpoint stays the same, but now uses the updated logic. No changes needed in your automations.'
                        },
                      ].map((item, index) => (
                        <div key={index} style={{ background: '#f8f9fa', padding: '28px', borderRadius: '12px', marginBottom: '16px' }}>
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
                        Give Your Automations a Brain
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px', lineHeight: '1.6' }}>
                        Stop building workarounds for complex calculations.
                        Your Excel model + SpreadAPI = smarter automations in minutes.
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
                          Get Started Free
                        </a>
                        <a href="/docs" style={{
                          background: 'transparent',
                          color: 'white',
                          padding: '16px 32px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '16px',
                          border: '2px solid white'
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

          <Footer locale={locale} currentPath="/automation-calculations" />
        </div>
      </div>
    </>
  );
}

export default function AutomationCalculationsPage() {
  return <AutomationCalculationsContent />;
}
