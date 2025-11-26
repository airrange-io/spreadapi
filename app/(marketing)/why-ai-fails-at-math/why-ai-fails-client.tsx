'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/product/Footer';
import ProductHeader from '@/components/product/ProductHeader';
import '../product.css';
import { SupportedLocale } from '@/lib/translations/blog-helpers';

interface WhyAIFailsClientProps {
  locale?: SupportedLocale;
}

export default function WhyAIFailsClient({ locale = 'en' }: WhyAIFailsClientProps) {
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
          /* Fix navigation padding */
          .navigation-container {
            padding: 1rem 2rem !important;
          }
        `}</style>

        <div className="page-wrapper">
          <Navigation currentPage="product" locale={locale} />

          <main className="main-wrapper">
            {/* Hero Section */}
            <ProductHeader
              subheading="AI Confessions"
              title={<>🤖 "Why We Can't Do <span className="text-color-primary">Excel"</span></>}
              description="An Honest Conversation with AI About Spreadsheets"
              primaryButtonText="Try SpreadAPI Instead"
              primaryButtonHref="/"
              secondaryButtonText="← Back to Product"
              secondaryButtonHref="/product"
            />

            {/* The Confession Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    {/* Chat Interface */}
                    <div style={{ 
                      maxWidth: '800px',
                      margin: '0 auto',
                      background: '#f3f4f6',
                      borderRadius: '16px',
                      padding: '40px'
                    }}>
                      {/* Human Message */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'flex-end',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            background: '#7c3aed',
                            color: 'white',
                            padding: '12px 20px',
                            borderRadius: '18px 18px 4px 18px',
                            maxWidth: '450px'
                          }}>
                            <p style={{ margin: 0, fontSize: '16px', color: 'white' }}>
                              "I have a complex Excel with 1000+ formulas. Can you recalculate if I change 5 variables?"
                            </p>
                          </div>
                        </div>
                        <p style={{ textAlign: 'right', fontSize: '14px', color: '#374151', margin: 0 }}>
                          Human
                        </p>
                      </div>

                      {/* AI Response 1 */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            background: 'white',
                            padding: '12px 20px',
                            borderRadius: '18px 18px 18px 4px',
                            maxWidth: '500px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}>
                            <p style={{ margin: 0, fontSize: '16px' }}>
                              "I can try, but honestly? With 1000+ formulas, I'd need 2-15 minutes and would probably get it wrong."
                            </p>
                          </div>
                        </div>
                        <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                          AI (Claude)
                        </p>
                      </div>

                      {/* Human Message 2 */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'flex-end',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            background: '#7c3aed',
                            color: 'white',
                            padding: '12px 20px',
                            borderRadius: '18px 18px 4px 18px',
                            maxWidth: '400px'
                          }}>
                            <p style={{ margin: 0, fontSize: '16px', color: 'white' }}>
                              "Wait, you can't just run the Excel formulas?"
                            </p>
                          </div>
                        </div>
                        <p style={{ textAlign: 'right', fontSize: '14px', color: '#374151', margin: 0 }}>
                          Human
                        </p>
                      </div>

                      {/* AI Confession */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '18px 18px 18px 4px',
                            maxWidth: '600px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}>
                            <p style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
                              "No, I can't actually run Excel formulas. When you upload a spreadsheet, I see the formulas and saved values, but I can't execute them. I'd have to recreate the logic myself.
                            </p>
                            <p style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
                              With complex dependencies (A depends on B, B on C...), I spend most time figuring out calculation order. My success rate? Maybe 20-40% for complex models.
                            </p>
                            <p style={{ margin: 0, fontSize: '16px', fontStyle: 'italic' }}>
                              I only know about 50-100 Excel functions out of 500+. XIRR? YIELD? Array formulas? I'm mostly guessing."
                            </p>
                          </div>
                        </div>
                        <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                          AI
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Success Rate Section */}
            <section className="section-home-feature" style={{ background: '#f3f4f6' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="text-align-center margin-bottom margin-large">
                      <h2>AI's Success Rate <span className="text-color-primary">Reality Check</span></h2>
                    </div>
                    
                    <div style={{ 
                      maxWidth: '700px', 
                      margin: '0 auto 60px', 
                      padding: '40px', 
                      background: 'white', 
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                      <h3 style={{ marginBottom: '30px', fontSize: '24px', color: '#1f2937', textAlign: 'center' }}>
                        🎲 My Realistic Success Rates
                      </h3>
                      <div style={{ marginBottom: '25px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
                          <div>
                            <p style={{ color: '#4b5563', fontSize: '18px', marginBottom: '5px' }}>Simple spreadsheet (50-100 formulas)</p>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Basic calculations, straightforward logic</p>
                          </div>
                          <span style={{ color: '#059669', fontWeight: '700', fontSize: '24px' }}>80-90%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
                          <div>
                            <p style={{ color: '#4b5563', fontSize: '18px', marginBottom: '5px' }}>Complex model (1000+ formulas)</p>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Dependencies, array formulas, financial functions</p>
                          </div>
                          <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '24px' }}>20-40%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <p style={{ color: '#4b5563', fontSize: '18px', marginBottom: '5px' }}>SpreadAPI (any complexity)</p>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Actual Excel engine, perfect accuracy</p>
                          </div>
                          <span style={{ color: '#7c3aed', fontWeight: '700', fontSize: '24px' }}>100%</span>
                        </div>
                      </div>
                      <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '12px', marginTop: '30px' }}>
                        <p style={{ fontSize: '16px', color: '#4b5563', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
                          "I'll get trends right, but exact precision? Doubtful. Error propagation is my nightmare."
                        </p>
                        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginTop: '10px', margin: '10px 0 0 0' }}>
                          - Every AI Model
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Truth Table Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="text-align-center margin-bottom margin-large">
                      <h2>The AI <span className="text-color-primary">Truth Table</span></h2>
                    </div>

                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '40px',
                        marginBottom: '60px'
                      }}>
                        {/* When AI Calculates */}
                        <div style={{ 
                          background: 'white',
                          padding: '40px',
                          borderRadius: '16px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                          <h3 style={{ marginBottom: '30px', color: '#1f2937' }}>
                            When you upload Excel to me:
                          </h3>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#6b7280', marginRight: '12px', fontSize: '20px', lineHeight: '1', display: 'block' }}>✗</span>
                              <span style={{ color: '#374151', lineHeight: '1.5' }}>I see formulas but can't execute them</span>
                            </li>
                            <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#6b7280', marginRight: '12px', fontSize: '20px', lineHeight: '1', display: 'block' }}>✗</span>
                              <span style={{ color: '#374151', lineHeight: '1.5' }}>I only know 50-100 of 500+ functions</span>
                            </li>
                            <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#6b7280', marginRight: '12px', fontSize: '20px', lineHeight: '1', display: 'block' }}>✗</span>
                              <span style={{ color: '#374151', lineHeight: '1.5' }}>I need 2-15 minutes for complex sheets</span>
                            </li>
                            <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#6b7280', marginRight: '12px', fontSize: '20px', lineHeight: '1', display: 'block' }}>✗</span>
                              <span style={{ color: '#374151', lineHeight: '1.5' }}>20-40% accuracy on 1000+ formulas</span>
                            </li>
                            <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#6b7280', marginRight: '12px', fontSize: '20px', lineHeight: '1', display: 'block' }}>✗</span>
                              <span style={{ color: '#374151', lineHeight: '1.5' }}>Errors compound through dependencies</span>
                            </li>
                          </ul>
                          <div style={{ 
                            marginTop: '30px',
                            padding: '20px',
                            background: '#f3f4f6',
                            borderRadius: '12px',
                            textAlign: 'center'
                          }}>
                            <p style={{ margin: 0, fontSize: '18px', fontStyle: 'italic', color: '#4b5563' }}>
                              "I work with saved values, not live calculations"
                            </p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#374151' }}>- Claude</p>
                          </div>
                        </div>

                        {/* When Excel Calculates */}
                        <div style={{ 
                          background: 'white',
                          padding: '40px',
                          borderRadius: '16px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                          <h3 style={{ marginBottom: '30px', color: '#7c3aed' }}>
                            When SpreadAPI calculates:
                          </h3>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#7c3aed', marginRight: '12px', fontSize: '20px', lineHeight: '1', display: 'block' }}>✓</span>
                              <span style={{ color: '#374151', lineHeight: '1.5' }}>Executes actual Excel formulas</span>
                            </li>
                            <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#7c3aed', marginRight: '12px', fontSize: '20px', lineHeight: '1', display: 'block' }}>✓</span>
                              <span style={{ color: '#374151', lineHeight: '1.5' }}>Supports 500+ Excel functions</span>
                            </li>
                            <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#7c3aed', marginRight: '12px', fontSize: '20px', lineHeight: '1', display: 'block' }}>✓</span>
                              <span style={{ color: '#374151', lineHeight: '1.5' }}>Returns results in milliseconds</span>
                            </li>
                            <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#7c3aed', marginRight: '12px', fontSize: '20px', lineHeight: '1', display: 'block' }}>✓</span>
                              <span style={{ color: '#374151', lineHeight: '1.5' }}>100% accuracy, any complexity</span>
                            </li>
                            <li style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#7c3aed', marginRight: '12px', fontSize: '20px', lineHeight: '1', display: 'block' }}>✓</span>
                              <span style={{ color: '#374151', lineHeight: '1.5' }}>Your formulas stay protected</span>
                            </li>
                          </ul>
                          <div style={{ 
                            marginTop: '30px',
                            padding: '20px',
                            background: '#f3f1ff',
                            borderRadius: '12px',
                            textAlign: 'center'
                          }}>
                            <p style={{ margin: 0, fontSize: '18px', fontStyle: 'italic', color: '#6d28d9' }}>
                              "Finally, AI can use real Excel calculations"
                            </p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#374151' }}>- Your Business</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Real AI Limitations Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="text-align-center margin-bottom margin-large">
                      <h2>Real AI Limitations <span className="text-color-primary">(In Our Own Words)</span></h2>
                    </div>

                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '30px'
                      }}>
                        {/* Confession 1 */}
                        <div style={{ 
                          background: 'white',
                          padding: '30px',
                          borderRadius: '16px',
                          textAlign: 'center',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ 
                            width: '60px',
                            height: '60px',
                            background: '#f3f1ff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                          }}>
                            <span style={{ fontSize: '24px' }}>⏱️</span>
                          </div>
                          <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>"I'm Impossibly Slow"</h3>
                          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4b5563' }}>
                            Give me 1000 formulas? That's 2-15 minutes of me trying to understand dependencies. Excel? 1-2 seconds.
                          </p>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '15px', fontStyle: 'italic' }}>- Every AI Model</p>
                        </div>

                        {/* Confession 2 */}
                        <div style={{ 
                          background: 'white',
                          padding: '30px',
                          borderRadius: '16px',
                          textAlign: 'center',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ 
                            width: '60px',
                            height: '60px',
                            background: '#f3f1ff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                          }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="8" r="4" stroke="#7c3aed" strokeWidth="1.5" fill="none"/>
                              <path d="M8 8C8 8 9 4 12 4C15 4 16 8 16 8" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M12 12V16M10 14H14" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
                              <circle cx="10" cy="16" r="0.5" fill="#7c3aed"/>
                              <circle cx="14" cy="16" r="0.5" fill="#7c3aed"/>
                            </svg>
                          </div>
                          <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>"I Can't Execute Formulas"</h3>
                          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4b5563' }}>
                            When you upload Excel, I see your formulas and saved values, but I can't run them. I'd have to recreate everything.
                          </p>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '15px', fontStyle: 'italic' }}>- Claude</p>
                        </div>

                        {/* Confession 3 */}
                        <div style={{ 
                          background: 'white',
                          padding: '30px',
                          borderRadius: '16px',
                          textAlign: 'center',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ 
                            width: '60px',
                            height: '60px',
                            background: '#f3f1ff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                          }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="9" stroke="#7c3aed" strokeWidth="1.5"/>
                              <path d="M12 16V16.01" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M12 13C12 11 13 10 13 9C13 7.895 12.105 7 11 7C9.895 7 9 7.895 9 9" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>"I'm Function-Illiterate"</h3>
                          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4b5563' }}>
                            I only know 50-100 Excel functions out of 500+. XIRR? YIELD? Array formulas? I'm just guessing what they do.
                          </p>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '15px', fontStyle: 'italic' }}>- ChatGPT & Claude</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Solution Section */}
            <section className="section-home-feature" style={{ background: '#f3f4f6' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="text-align-center margin-bottom margin-large">
                      <h2>The SpreadAPI Solution <span className="text-color-primary">(As Explained by AI)</span></h2>
                    </div>

                    <div style={{ 
                      maxWidth: '800px',
                      margin: '0 auto',
                      background: 'white',
                      borderRadius: '16px',
                      padding: '40px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                      {/* AI Explaining SpreadAPI */}
                      <div style={{ marginBottom: '30px' }}>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '20px'
                        }}>
                          <div style={{ 
                            width: '48px',
                            height: '48px',
                            background: '#e9d5ff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '15px'
                          }}>
                            <span style={{ fontSize: '24px' }}>🤖</span>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600 }}>Claude</p>
                            <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>AI Assistant</p>
                          </div>
                        </div>
                        
                        <div style={{ 
                          background: '#f3f4f6',
                          padding: '24px',
                          borderRadius: '12px',
                          fontSize: '16px',
                          lineHeight: '1.8'
                        }}>
                          <p style={{ margin: '0 0 16px 0' }}>
                            SpreadAPI lets us work together perfectly: I handle the conversation, Excel handles the calculations. You get AI's flexibility with Excel's precision.
                          </p>
                          <p style={{ margin: 0, fontStyle: 'italic' }}>
                            It's not about replacing Excel with AI. It's about letting each of us do what we do best.\"
                          </p>
                        </div>
                      </div>

                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px'
                      }}>
                        <div style={{ 
                          background: '#7c3aed',
                          padding: '20px',
                          borderRadius: '12px',
                          textAlign: 'center'
                        }}>
                          <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '32px', lineHeight: '1' }}>🤖</span>
                          </div>
                          <h4 style={{ margin: '0 0 10px 0', color: 'white' }}>I Talk to Humans</h4>
                          <p style={{ margin: 0, fontSize: '14px', color: 'white', opacity: 0.9 }}>
                            Natural language, context understanding, helpful explanations
                          </p>
                        </div>
                        
                        <div style={{ 
                          background: '#7c3aed',
                          padding: '20px',
                          borderRadius: '12px',
                          textAlign: 'center'
                        }}>
                          <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="5" y="5" width="22" height="22" rx="2" stroke="white" strokeWidth="2"/>
                              <rect x="9" y="18" width="3" height="6" fill="white"/>
                              <rect x="14.5" y="14" width="3" height="10" fill="white"/>
                              <rect x="20" y="10" width="3" height="14" fill="white"/>
                            </svg>
                          </div>
                          <h4 style={{ margin: '0 0 10px 0', color: 'white' }}>Excel Does Math</h4>
                          <p style={{ margin: 0, fontSize: '14px', color: 'white', opacity: 0.9 }}>
                            Precise calculations, complex formulas, 100% accuracy
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Line Section */}
            <section className="section-home-feature">
              <div className="padding-global">
                <div className="container-large">
                  <div className="padding-section-large">
                    <div className="text-align-center margin-bottom margin-large">
                      <h2>The <span className="text-color-primary">Bottom Line</span></h2>
                    </div>

                    <div style={{ 
                      maxWidth: '900px',
                      margin: '0 auto',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      borderRadius: '16px',
                      padding: '60px',
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <div style={{ marginBottom: '30px' }}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto' }}>
                          <path d="M12 24H20L24 20L28 28L32 24H36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="8" cy="24" r="3" stroke="white" strokeWidth="2"/>
                          <circle cx="40" cy="24" r="3" stroke="white" strokeWidth="2"/>
                        </svg>
                      </div>
                      
                      <h3 style={{ fontSize: '2rem', marginBottom: '30px' }}>
                        The Truth About AI + Excel
                      </h3>
                      
                      <p style={{ fontSize: '20px', lineHeight: '1.8', marginBottom: '30px', color: 'white', opacity: 0.95 }}>
                        AI can't run Excel formulas. Can't execute functions. Takes forever.<br />
                        But with SpreadAPI? AI finally gets <strong>real Excel calculations</strong>.
                      </p>

                      <p style={{ fontSize: '18px', fontStyle: 'italic', color: 'white', opacity: 0.9 }}>
                        "Stop asking AI to fake math. Give it actual Excel.<br />
                        100% accuracy. Every time. In milliseconds."
                      </p>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '60px' }}>
                      <a href="/" className="button button-large">
                        Start Your Free Trial
                      </a>
                      <p style={{ marginTop: '20px', fontSize: '16px', color: '#374151' }}>
                        No credit card required • 1,000 free calculations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <Footer locale={locale} />
        </div>
      </div>
    </>
  );
}