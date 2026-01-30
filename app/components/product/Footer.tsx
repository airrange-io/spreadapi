import React from 'react';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getMarketingTranslations } from '@/lib/translations/marketing';

interface FooterProps {
  locale?: SupportedLocale;
  currentPath?: string; // The current page path without locale prefix (e.g., '/how-excel-api-works')
}

// Currently only English and German are available for marketing pages
// French and Spanish translations coming soon
const languageOptions: { code: SupportedLocale; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
  // { code: 'fr', flag: '🇫🇷', label: 'FR' },
  // { code: 'es', flag: '🇪🇸', label: 'ES' },
];

const Footer: React.FC<FooterProps> = ({ locale = 'en', currentPath = '' }) => {
  const t = getMarketingTranslations(locale);
  const prefix = locale === 'en' ? '' : `/${locale}`;

  // Build the path for language switching
  const getLocalePath = (targetLocale: SupportedLocale) => {
    if (targetLocale === 'en') {
      return currentPath || '/';
    }
    return `/${targetLocale}${currentPath || ''}`;
  };

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
                      <a href={`${prefix}/on-premises`} className="footer-link">{t.footer.enterprise || 'Enterprise'}</a>
                    </div>
                  </div>
                  <div className="footer-menu-column">
                    <div className="footer-menu-title">{t.footer.resources || 'Resources'}</div>
                    <div className="footer-menu-list">
                      <a href="/docs" className="footer-link">{t.footer.documentation}</a>
                      <a href="/security" className="footer-link">{t.footer.security || 'Security'}</a>
                      <a href="/pricing" className="footer-link">{t.footer.pricing}</a>
                      <a href="/blog" className="footer-link">{t.footer.blog}</a>
                      <a href="https://spreadapi.instatus.com" className="footer-link" target="_blank" rel="noopener noreferrer">{t.footer.status || 'Status'}<span className="status-dot" aria-hidden="true"></span></a>
                    </div>
                  </div>
                  <div className="footer-menu-column">
                    <div className="footer-menu-title">{t.footer.company}</div>
                    <div className="footer-menu-list">
                      <a href="https://www.airrange.io/imprint" className="footer-link">{t.footer.about}</a>
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
                  {/* Language Switcher */}
                  <div className="footer-language-switcher">
                    {languageOptions.map((lang) => (
                      <a
                        key={lang.code}
                        href={getLocalePath(lang.code)}
                        className={`footer-language-link ${locale === lang.code ? 'active' : ''}`}
                        title={lang.label}
                      >
                        <span className="footer-language-flag">{lang.flag}</span>
                      </a>
                    ))}
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
