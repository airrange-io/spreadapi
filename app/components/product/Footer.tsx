import React from 'react';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getMarketingTranslations } from '@/lib/translations/marketing';

interface FooterProps {
  locale?: SupportedLocale;
}

const Footer: React.FC<FooterProps> = ({ locale = 'en' }) => {
  const t = getMarketingTranslations(locale);
  const prefix = locale === 'en' ? '' : `/${locale}`;

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
                    <div className="footer-menu-title">{t.footer.product}</div>
                    <div className="footer-menu-list">
                      <a href={prefix || '/'} className="footer-link">{t.footer.excelToApi}</a>
                      <a href={`${prefix}/how-excel-api-works`} className="footer-link">{t.footer.howItWorks}</a>
                      <a href={`${prefix}/stop-rewriting-excel-in-code`} className="footer-link">{t.footer.forDevelopers}</a>
                      <a href={`${prefix}/automation-calculations`} className="footer-link">{t.footer.forAutomations}</a>
                      <a href={`${prefix}/excel-ai-integration`} className="footer-link">{t.footer.aiIntegration}</a>
                      <a href="/docs" className="footer-link">{t.footer.documentation}</a>
                      <a href="/pricing" className="footer-link">{t.footer.pricing}</a>
                    </div>
                  </div>
                  <div className="footer-menu-column">
                    <div className="footer-menu-title">{t.footer.company}</div>
                    <div className="footer-menu-list">
                      <a href="https://www.airrange.io/imprint" className="footer-link">{t.footer.about}</a>
                      <a href="/blog" className="footer-link">{t.footer.blog}</a>
                      <a href="https://www.airrange.io/contact-us" className="footer-link">{t.footer.contact}</a>
                    </div>
                  </div>
                  <div className="footer-right-section">
                    <img src="/icons/logo-transparent.svg" alt="SpreadAPI" className="footer-right-logo" />
                    <div className="footer-description">
                      <p className="text-size-small">
                        {t.footer.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-bottom-wrapper">
                <div className="footer-legal-wrapper">
                  <div className="footer-copyright">
                    {t.footer.copyright.replace('{year}', new Date().getFullYear().toString())}
                  </div>
                  <div className="footer-legal-links">
                    <a href="https://airrange.io/privacy-policy" className="footer-legal-link">{t.footer.privacyPolicy}</a>
                    <a href="https://airrange.io/terms" className="footer-legal-link">{t.footer.termsOfService}</a>
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
