'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/product/Footer';
import '../product/product.css';

export default function DocsPageClient() {
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
          <Navigation currentPage="docs" />
          
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
                                <div>Developer Documentation</div>
                              </div>
                            </div>
                            <div className="margin-bottom margin-small">
                              <h1>
                                SpreadAPI <span className="text-color-primary">Documentation</span>
                              </h1>
                            </div>
                            <p className="text-size-medium" style={{ maxWidth: '680px', margin: '0 auto' }}>
                              Everything you need to integrate Excel calculations into your applications. 
                              RESTful API, MCP support, and comprehensive examples.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            
            {/* Documentation content will be added here */}
            <section style={{ padding: '80px 20px', textAlign: 'center', background: '#f8f9fa' }}>
              <p style={{ fontSize: '18px', color: '#666' }}>API documentation coming soon...</p>
            </section>
          </main>
          
          <Footer />
        </div>
      </div>
    </>
  );
}