import React from 'react';

const Footer: React.FC = () => {
  return (
    <>
      {/* Footer */}
      <footer className="footer-component">
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="footer-top-wrapper">
                <div className="footer-content-grid">
                  <div className="footer-menu-column">
                    <div className="footer-menu-title">Product</div>
                    <div className="footer-menu-list">
                      <a href="/product" className="footer-link">Excel to API</a>
                      <a href="/product/how-excel-api-works" className="footer-link">How it Works</a>
                      <a href="/product/excel-ai-integration" className="footer-link">AI Integration</a>
                      <a href="/docs" className="footer-link">Documentation</a>
                      <a href="/pricing" className="footer-link">Pricing</a>
                      {/* <a href="/ai-security-control" className="footer-link">AI Security</a> */}
                    </div>
                  </div>
                  {/* Use Cases & Examples - Disabled for now
                  <div className="footer-menu-column">
                    <div className="footer-menu-title">Use Cases & Examples</div>
                    <div className="footer-menu-list">
                      <a href="https://airrange.io" className="footer-link">Sales Quote Generation</a>
                      <a href="https://airrange.io" className="footer-link">Financial Modeling</a>
                      <a href="https://airrange.io" className="footer-link">Resource Optimization</a>
                      <a href="https://airrange.io" className="footer-link">Automated Reporting</a>
                    </div>
                  </div>
                  */}
                  <div className="footer-menu-column">
                    <div className="footer-menu-title">Company</div>
                    <div className="footer-menu-list">
                      <a href="https://www.airrange.io/imprint" className="footer-link">About</a>
                      <a href="/blog" className="footer-link">Blog</a>
                      <a href="https://www.airrange.io/contact-us" className="footer-link">Contact</a>
                    </div>
                  </div>
                  <div className="footer-right-section">
                    <img src="/icons/logo-transparent.svg" alt="SpreadAPI" className="footer-right-logo" />
                    <div className="footer-description">
                      <p className="text-size-small">
                        SpreadAPI bridges the gap between Excel and AI, turning decades of business logic into secure,
                        instant APIs. Your spreadsheets become powerful calculation engines that AI can access without
                        seeing proprietary formulas. Upload, configure, and let AI handle complex calculations with 100% accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-bottom-wrapper">
                <div className="footer-legal-wrapper">
                  <div className="footer-copyright">
                    © {new Date().getFullYear()} Airrange.io. All rights reserved.
                  </div>
                  <div className="footer-legal-links">
                    <a href="https://airrange.io/privacy-policy" className="footer-legal-link">Privacy Policy</a>
                    <a href="https://airrange.io/terms" className="footer-legal-link">Terms of Service</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;