'use client';

import React, { useState } from 'react';
import './product.css';

const ProductPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [ctaEmail, setCtaEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log('Email submitted:', email);
  };

  const handleCtaEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle CTA email submission
    console.log('CTA Email submitted:', ctaEmail);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    // Security & Compliance
    {
      question: 'Werden meine Daten an ChatGPT oder andere KI-Dienste gesendet?',
      answer: 'Nein, niemals! Ihre Daten verlassen niemals unsere sichere Umgebung. Wir senden nur Befehle wie "E-Mail-Format validieren" an die KI, nicht Ihre tatsächlichen Daten. Die KI liefert uns die Verarbeitungsregeln, die wir dann lokal auf Ihre Daten anwenden.'
    },
    {
      question: 'Wie funktioniert die KI-Verarbeitung ohne meine Daten zu sehen?',
      answer: 'Wir analysieren die Struktur Ihrer Daten (Spalten, Muster) in unserem sicheren Speicher. Dann fragen wir die KI nach Verarbeitungsregeln (z.B. "Wie validiere ich E-Mail-Formate?"). Die KI antwortet mit Regeln, die wir auf Ihre Daten anwenden - ohne dass die KI jemals Ihre echten Daten sieht.'
    },
    {
      question: 'Werden meine Daten zum Training von KI-Modellen verwendet?',
      answer: 'Niemals! Wir haben Enterprise-Vereinbarungen mit allen KI-Anbietern, die Training explizit verbieten. Zudem erreichen Ihre Daten die KI-Dienste gar nicht erst, da wir nur Befehle senden.'
    },
    
    // Capabilities & Features
    {
      question: 'Was kann List+ mit meinen Daten machen?',
      answer: 'List+ bietet intelligente Datenverarbeitung: Automatische Bereinigung (Duplikate entfernen, Formate standardisieren), KI-gestützte Validierung (E-Mails, Telefonnummern, Adressen), Datenanreicherung (fehlende Informationen ergänzen), und vieles mehr - alles ohne Ihre Daten an externe KI-Dienste zu senden.'
    },
    {
      question: 'Was sind Workflows und wie funktionieren sie?',
      answer: 'Workflows sind automatisierte Datenverarbeitungsprozesse, die Sie selbst erstellen können. Zum Beispiel: "Bereinige alle E-Mail-Adressen → Entferne Duplikate → Standardisiere Firmennamen → Exportiere als CSV". Einmal erstellt, können Sie diese Workflows immer wieder auf neue Daten anwenden.'
    },
    {
      question: 'Kann ich List+ mit meinen bestehenden Tools verbinden?',
      answer: 'Ja! List+ unterstützt MCP (Model Context Protocol) Server, wodurch Sie Daten direkt aus Ihren bestehenden Systemen wie CRM, ERP oder Datenbanken verarbeiten können. Die Daten werden temporär in unserem sicheren Speicher verarbeitet und dann zurück in Ihr System geschrieben.'
    },
    {
      question: 'Welche Datenquellen kann ich verwenden?',
      answer: 'List+ unterstützt verschiedene Formate und Quellen: CSV, Excel, JSON-Dateien, direkte API-Verbindungen zu CRM-Systemen (HubSpot, Salesforce), Datenbanken über MCP-Server, und manuelle Dateneingabe. Sie können Dateien einfach per Drag & Drop hochladen.'
    },
    {
      question: 'Wie groß können die Datensätze sein, die ich verarbeiten kann?',
      answer: 'List+ ist für große Datensätze optimiert. Wir verarbeiten problemlos Tabellen mit über 100.000 Zeilen. Dank unserer Memory-Only-Architektur und optimierten Hash-Speicherung bleiben selbst große Datensätze blitzschnell bearbeitbar.'
    },
    
    // Use Cases
    {
      question: 'Welche konkreten Probleme löst List+?',
      answer: 'Typische Anwendungsfälle: E-Mail-Listen bereinigen (ungültige Adressen entfernen), Kundendaten standardisieren (einheitliche Schreibweisen), Duplikate intelligent zusammenführen, Lead-Scoring und Kategorisierung, Compliance-Prüfungen (DSGVO-konforme Daten identifizieren), und Datenqualität verbessern.'
    },
    {
      question: 'Kann ich List+ für Echtzeit-Datenverarbeitung nutzen?',
      answer: 'Ja! Über unsere API können Sie Daten in Echtzeit verarbeiten. Zum Beispiel: Neue Leads aus Ihrem CRM werden automatisch validiert, angereichert und kategorisiert, bevor sie in Ihr System zurückgeschrieben werden - alles in wenigen Sekunden.'
    },
    
    // Technical & Privacy
    {
      question: 'Wo werden meine Daten während der Verarbeitung gespeichert?',
      answer: 'Ausschließlich im Arbeitsspeicher (Redis RAM) - niemals auf Festplatten! Nach maximal 1 Stunde werden die Daten automatisch aus dem Speicher gelöscht. Für dauerhafte Listen können Sie optional unseren verschlüsselten Blob-Storage nutzen.'
    },
    {
      question: 'Erfüllt List+ die DSGVO/GDPR-Anforderungen?',
      answer: 'Ja, vollständig! Recht auf Vergessenwerden (automatisches Löschen), Datenminimierung, klare Zweckbindung, Security by Design mit Verschlüsselung, und vollständige Audit-Logs sind implementiert. Wir sind SOC 2 Type II konform.'
    },
    {
      question: 'Kann ich List+ kostenlos testen?',
      answer: 'Ja! Sie können List+ ohne Registrierung ausprobieren. Erstellen Sie bis zu 3 Listen und testen Sie alle Grundfunktionen. Für erweiterte Features wie KI-Verarbeitung, Workflows und API-Zugriff ist eine kostenlose Registrierung erforderlich.'
    },
    {
      question: 'Was unterscheidet List+ von Excel oder Google Sheets?',
      answer: 'List+ ist speziell für Datenverarbeitung mit KI entwickelt: Intelligente Datenbereinigung statt manueller Formeln, automatische Workflows statt Copy-Paste, sichere Verarbeitung sensibler Daten, API-Integration für automatisierte Prozesse, und Team-Kollaboration mit granularen Berechtigungen.'
    }
  ];

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
        {/* Navigation */}
        <nav className="navbar-component">
          <div className="navbar-container">
            <a href="/" className="navbar-logo-link">
              <img src="/icons/logo-full.svg" alt="List+" className="navbar-logo" />
            </a>
            
            <div className="navbar-menu">
              <a href="#feature" className="navbar-link">Features</a>
              <a href="#benefits" className="navbar-link">Benefits</a>
              <a href="#faq" className="navbar-link">Faqs</a>
            </div>
            
            <div className="navbar-button-wrapper">
              <a href="#cta" className="button hide-mobile-portrait">Join waitlist</a>
              <button 
                className="navbar-menu-button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <div className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
                  <div className="menu-icon-line-top"></div>
                  <div className="menu-icon-line-center">
                    <div className="menu-icon-line-center-inner"></div>
                  </div>
                  <div className="menu-icon-line-bottom"></div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <nav className="mobile-nav">
                <a href="#feature" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#benefits" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
                <a href="#faq" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Faqs</a>
                <a href="#cta" className="button w-button" onClick={() => setMobileMenuOpen(false)}>Join waitlist</a>
              </nav>
            </div>
          )}
        </nav>

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
                              <div>Instant Data Intelligence</div>
                            </div>
                          </div>
                          <div className="margin-bottom margin-small">
                            <h1>
                              Connect. Enrich With AI.<br />
                              <span className="text-color-primary">Your Data, Only Better</span>
                            </h1>
                          </div>
                          <p className="text-size-medium" style={{ maxWidth: '560px', margin: '0 auto' }}>Connect to your SaaS tools, databases, and outbound data — apply AI to analyze, enrich, and streamline every process.</p>
                          <div className="margin-top margin-medium">
                            <form onSubmit={handleEmailSubmit} className="waitlist-form-signup">
                              <input 
                                className="form-input is-waitlist" 
                                maxLength={256} 
                                name="email" 
                                placeholder="name@email.com" 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                              />
                              <input type="submit" className="button" value="Join waitlist" />
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="header-image-wrapper">
                      <div className="header-image-placeholder">
                        <svg viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="800" height="500" fill="#F8F6FE"/>
                          <rect x="50" y="50" width="700" height="400" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
                          <rect x="80" y="80" width="200" height="340" rx="4" fill="#F8F6FE"/>
                          <rect x="300" y="80" width="200" height="160" rx="4" fill="#F8F6FE"/>
                          <rect x="520" y="80" width="200" height="220" rx="4" fill="#F8F6FE"/>
                          <rect x="300" y="260" width="200" height="160" rx="4" fill="#F8F6FE"/>
                          <rect x="520" y="320" width="200" height="100" rx="4" fill="#F8F6FE"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Feature Section 1 */}
          <section id="feature" className="section-home-feature">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="feature-component">
                    <div className="feature-content-wrapper">
                      <div className="margin-bottom margin-small">
                        <h2>
                          <span className="text-color-primary">Simplify Project Management</span> with Intuitive Task Management
                        </h2>
                      </div>
                      <div className="margin-bottom margin-medium">
                        <p className="text-size-medium">
                          Effortlessly manage tasks, deadlines, and priorities with our user-friendly task management system. Assign responsibilities, track progress, and ensure every team member stays on top of their game.
                        </p>
                      </div>
                      <div className="feature-keypoint-list">
                        <div className="feature-keypoint-list-item">
                          <div className="check-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-size-medium">Streamline Tasks Effortlessly</p>
                        </div>
                        <div className="feature-keypoint-list-item">
                          <div className="check-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-size-medium">Intuitive Task Assignment</p>
                        </div>
                        <div className="feature-keypoint-list-item">
                          <div className="check-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-size-medium">Track Progress Seamlessly</p>
                        </div>
                      </div>
                    </div>
                    <div className="feature-image-wrapper">
                      <div className="feature-image-placeholder">
                        <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="600" height="400" fill="#F8F6FE" rx="12"/>
                          <rect x="40" y="40" width="520" height="320" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
                          <rect x="70" y="70" width="460" height="40" rx="4" fill="#F8F6FE"/>
                          <rect x="70" y="130" width="140" height="80" rx="4" fill="#F8F6FE"/>
                          <rect x="230" y="130" width="140" height="80" rx="4" fill="#F8F6FE"/>
                          <rect x="390" y="130" width="140" height="80" rx="4" fill="#F8F6FE"/>
                          <rect x="70" y="230" width="140" height="80" rx="4" fill="#F8F6FE"/>
                          <rect x="230" y="230" width="140" height="80" rx="4" fill="#F8F6FE"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Section 2 */}
          <section className="section-home-feature">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="feature-component reverse">
                    <div className="feature-image-wrapper">
                      <div className="feature-image-placeholder">
                        <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="600" height="400" fill="#E6F4FF" rx="12"/>
                          <rect x="40" y="40" width="520" height="320" rx="8" fill="white" stroke="#B3E0FF" strokeWidth="2"/>
                          <circle cx="100" cy="100" r="20" fill="#E6F4FF"/>
                          <circle cx="500" cy="100" r="20" fill="#E6F4FF"/>
                          <rect x="70" y="140" width="460" height="180" rx="8" fill="#F0F9FF"/>
                          <rect x="90" y="160" width="420" height="40" rx="4" fill="#E6F4FF"/>
                          <rect x="90" y="220" width="320" height="20" rx="4" fill="#E6F4FF"/>
                          <rect x="90" y="250" width="280" height="20" rx="4" fill="#E6F4FF"/>
                          <rect x="90" y="280" width="360" height="20" rx="4" fill="#E6F4FF"/>
                        </svg>
                      </div>
                    </div>
                    <div className="feature-content-wrapper">
                      <div className="margin-bottom margin-small">
                        <h2>
                          <span className="text-color-primary">Revolutionize</span> Team Communication and Collaboration
                        </h2>
                      </div>
                      <div className="margin-bottom margin-medium">
                        <p className="text-size-medium">
                          Our software brings your team together in one unified platform, enabling seamless collaboration, real-time updates, and effortless file sharing.
                        </p>
                      </div>
                      <div className="feature-list">
                        <div className="feature-item">
                          <div className="feature-item-icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M20 14C20 14 16 14 14 16C12 18 12 20 12 20C12 20 12 22 14 24C16 26 20 26 20 26M20 26C20 26 24 26 26 24C28 22 28 20 28 20C28 20 28 18 26 16C24 14 20 14 20 14" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="feature-item-content-wrapper">
                            <div className="margin-bottom margin-xsmall">
                              <h3 className="heading-style-h5">Real-time Collaboration</h3>
                            </div>
                            <p className="text-size-medium">Empower your team to work together in real-time, facilitating instant communication and fostering collaboration.</p>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-item-icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M20 12V20L26 26M20 28C15.5817 28 12 24.4183 12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28Z" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="feature-item-content-wrapper">
                            <div className="margin-bottom margin-xsmall">
                              <h3 className="heading-style-h5">Seamless Communication</h3>
                            </div>
                            <p className="text-size-medium">Break down communication barriers and create a seamless flow of information, ensuring everyone stays connected and aligned.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tools Section */}
          <section className="section-home-tools">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="tools-component">
                    <div className="tools-list">
                      <div className="tools-item">
                        <div className="tools-logo">Slack</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">Google Drive</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">Dropbox</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">Figma</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">List+</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">Notion</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">Teams</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">Google</div>
                      </div>
                      <div className="tools-item">
                        <div className="tools-logo">Meta</div>
                      </div>
                    </div>
                    <div className="tools-content-wrapper">
                      <div className="margin-bottom margin-small">
                        <h2>
                          Connect <span className="text-color-primary">Your Favorite Tools</span> for Effortless Workflow
                        </h2>
                      </div>
                      <div className="margin-bottom margin-medium">
                        <p className="text-size-medium">
                          Seamlessly integrate with popular tools like Slack, Trello, and Google Drive to streamline your workflow. Eliminate data silos and enjoy a cohesive project management ecosystem that works harmoniously.
                        </p>
                      </div>
                      <a href="#cta" className="button">Join waitlist</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section id="benefits" className="section-home-benefits">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="margin-bottom margin-large">
                    <div className="align-center">
                      <div className="max-width-large">
                        <div className="margin-bottom margin-xsmall">
                          <div className="subheading">
                            <div>Benefits</div>
                          </div>
                        </div>
                        <div className="text-align-center">
                          <h2>
                            Unlock the <span className="text-color-primary">Power of Project </span>Management Reinvented
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="benefits-component">
                    <div className="benefits-item">
                      <div className="margin-bottom margin-medium">
                        <div className="icon-wrapper">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                            <rect x="12" y="16" width="16" height="4" rx="2" fill="#9333EA"/>
                            <rect x="12" y="22" width="16" height="4" rx="2" fill="#9333EA"/>
                            <rect x="12" y="10" width="16" height="4" rx="2" fill="#9333EA"/>
                          </svg>
                        </div>
                      </div>
                      <div className="margin-bottom margin-xsmall">
                        <h3>Boost Productivity</h3>
                      </div>
                      <p>Unleash your team's potential and skyrocket productivity.</p>
                    </div>
                    <div className="benefits-item">
                      <div className="margin-bottom margin-medium">
                        <div className="icon-wrapper">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                            <circle cx="20" cy="20" r="8" stroke="#9333EA" strokeWidth="1.5"/>
                            <circle cx="14" cy="14" r="2" fill="#9333EA"/>
                            <circle cx="26" cy="14" r="2" fill="#9333EA"/>
                            <circle cx="14" cy="26" r="2" fill="#9333EA"/>
                            <circle cx="26" cy="26" r="2" fill="#9333EA"/>
                          </svg>
                        </div>
                      </div>
                      <div className="margin-bottom margin-xsmall">
                        <h3>Enhance Collaboration</h3>
                      </div>
                      <p>Break down communication barriers and foster a culture of collaboration.</p>
                    </div>
                    <div className="benefits-item">
                      <div className="margin-bottom margin-medium">
                        <div className="icon-wrapper">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                            <circle cx="20" cy="20" r="8" stroke="#9333EA" strokeWidth="1.5"/>
                            <path d="M20 16V20L23 23" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </div>
                      <div className="margin-bottom margin-xsmall">
                        <h3>Meet Deadlines</h3>
                      </div>
                      <p>Say goodbye to missed deadlines and late deliveries.</p>
                    </div>
                    <div className="benefits-item">
                      <div className="margin-bottom margin-medium">
                        <div className="icon-wrapper">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                            <rect x="12" y="24" width="16" height="4" rx="2" fill="#9333EA"/>
                            <rect x="16" y="20" width="8" height="4" rx="2" fill="#9333EA"/>
                            <rect x="18" y="16" width="4" height="4" rx="2" fill="#9333EA"/>
                          </svg>
                        </div>
                      </div>
                      <div className="margin-bottom margin-xsmall">
                        <h3>Gain Insights</h3>
                      </div>
                      <p>Harness the power of data analytics to gain valuable insights into your projects.</p>
                    </div>
                    <div className="benefits-item">
                      <div className="margin-bottom margin-medium">
                        <div className="icon-wrapper">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                            <rect x="10" y="18" width="8" height="12" rx="2" fill="#9333EA"/>
                            <rect x="16" y="14" width="8" height="16" rx="2" fill="#9333EA"/>
                            <rect x="22" y="10" width="8" height="20" rx="2" fill="#9333EA"/>
                          </svg>
                        </div>
                      </div>
                      <div className="margin-bottom margin-xsmall">
                        <h3>Scale Your Success</h3>
                      </div>
                      <p>Seamlessly manage multiple projects, accommodate a growing team.</p>
                    </div>
                    <div className="benefits-item">
                      <div className="margin-bottom margin-medium">
                        <div className="icon-wrapper">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                            <path d="M12 26L20 18L28 26" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 18V10" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </div>
                      <div className="margin-bottom margin-xsmall">
                        <h3>Grow with Confidence</h3>
                      </div>
                      <p>Confidently scale your operations while maintaining efficiency.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="section-home-testimonials">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="margin-bottom margin-large">
                    <div className="text-align-center">
                      <div className="max-width-medium align-center">
                        <div className="margin-bottom margin-xsmall">
                          <div className="subheading">
                            <div>Testimonials</div>
                          </div>
                        </div>
                        <div className="margin-bottom margin-small">
                          <h2>
                            Hear What <span className="text-color-primary">Our Customers</span> Have to Say
                          </h2>
                        </div>
                        <p className="text-size-medium">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      </div>
                    </div>
                  </div>
                  <div className="testimonials-component">
                    <div className="testimonials-item">
                      <div className="testimonial-content">
                        <div className="margin-bottom margin-medium">
                          <div className="heading-style-h5">"Our team has been using various project management tools for years, but List+ has truly revolutionized our workflow. The intuitive interface, seamless collaboration features, and robust task management capabilities have elevated our productivity to new heights."</div>
                        </div>
                      </div>
                      <div className="testimonial-author-wrapper">
                        <div className="testimonial-author-image-wrapper">
                          <div className="testimonial-author-image"></div>
                        </div>
                        <div className="testimonial-author-content-wrapper">
                          <p className="heading-style-h6">Michael Brown</p>
                          <p>Company</p>
                        </div>
                      </div>
                    </div>
                    <div className="testimonials-item">
                      <div className="testimonial-content">
                        <div className="margin-bottom margin-medium">
                          <div className="heading-style-h5">"I've tried numerous project management tools in the past, but none have come close to the efficiency and simplicity of List+. The clean and intuitive design, combined with powerful features like Gantt charts and resource allocation, have made a significant impact on our project success. I highly recommend it!"</div>
                        </div>
                      </div>
                      <div className="testimonial-author-wrapper">
                        <div className="testimonial-author-image-wrapper">
                          <div className="testimonial-author-image"></div>
                        </div>
                        <div className="testimonial-author-content-wrapper">
                          <p className="heading-style-h6">Lisa Rodriguez</p>
                          <p>Company</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="section-home-faq">
            <div className="padding-global">
              <div className="container-small">
                <div className="padding-section-large">
                  <div className="margin-bottom margin-large">
                    <div className="text-align-center">
                      <div className="max-width-large">
                        <div className="margin-bottom margin-xsmall">
                          <div className="subheading">
                            <div>Faqs</div>
                          </div>
                        </div>
                        <div className="margin-bottom margin-small">
                          <h2>Your Questions Answered</h2>
                        </div>
                        <p className="text-size-medium">Find answers to commonly asked questions about our project management tool below. If you have any additional inquiries, please feel free to reach out to our support team for further assistance.</p>
                      </div>
                    </div>
                  </div>
                  <div className="faq-collection-wrapper">
                    <div className="faq-collection-list">
                      {faqItems.map((item, index) => (
                        <div key={index} className="faq-collection-item">
                          <div className="faq-accordion">
                            <div className="faq-question" onClick={() => toggleFaq(index)}>
                              <div className="heading-style-h6">{item.question}</div>
                              <svg 
                                className={`icon-1x1-small ${expandedFaq === index ? 'rotate' : ''}`} 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className={`faq-answer ${expandedFaq === index ? 'expanded' : ''}`}>
                              <div className="margin-bottom margin-small">
                                <p>{item.answer}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section id="cta" className="section-home-cta">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="home-cta-component">
                    <div className="text-align-center">
                      <div className="max-width-xlarge">
                        <div className="margin-bottom margin-small">
                          <h2 className="text-color-white">Join the Waitlist for Exclusive Early Access!</h2>
                        </div>
                        <p className="text-size-medium text-color-white">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. </p>
                      </div>
                    </div>
                    <div className="margin-top margin-medium">
                      <div className="waitlist-form-wrapper">
                        <form onSubmit={handleCtaEmailSubmit} className="waitlist-form">
                          <div className="waitlist-form-signup">
                            <input 
                              className="form-input is-waitlist" 
                              maxLength={256} 
                              name="email-2" 
                              placeholder="Enter your email" 
                              type="email" 
                              value={ctaEmail}
                              onChange={(e) => setCtaEmail(e.target.value)}
                              required 
                            />
                            <input type="submit" className="button button-white" value="Sign up" />
                          </div>
                          <div className="margin-top margin-xsmall">
                            <div className="text-size-tiny text-color-white">
                              I Accept the <a href="/terms-of-service" className="text-link text-color-white">Terms of Service</a>.
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="section-home-contact">
            <div className="padding-global">
              <div className="container-medium">
                <div className="padding-section-large">
                  <div className="margin-bottom margin-large">
                    <div className="text-align-center">
                      <div className="max-width-large align-center">
                        <div className="margin-bottom margin-xsmall">
                          <div className="subheading">
                            <div>Contact</div>
                          </div>
                        </div>
                        <h2>
                          <span className="text-color-primary">Stay Informed</span> with Insider Updates and Sneak Peeks
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="home-contact-component">
                    <div className="home-contact-item">
                      <div className="margin-bottom margin-small">
                        <div className="home-contact-icon-wrapper">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                            <rect x="10" y="14" width="20" height="14" rx="2" stroke="#9333EA" strokeWidth="1.5"/>
                            <path d="M10 16L20 22L30 16" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          <h3>Email</h3>
                        </div>
                      </div>
                      <p>
                        If you have any questions, please feel free to contact us at <a href="mailto:hello@listplus.ai">hello@listplus.ai</a>.
                      </p>
                    </div>
                    {/* <div className="home-contact-item">
                      <div className="margin-bottom margin-small">
                        <div className="home-contact-icon-wrapper">
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                            <path d="M30 12.5C28.5 11 26.5 10 24 10C19 10 15 14 15 19C15 24 19 28 24 28C28 28 29 26 29 26" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M25 17C25 17 22.5 20 20 17" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <h3>LinkedIn</h3>
                        </div>
                      </div>
                      <p>
                        Follow us on LinkedIn <a href="https://www.linkedin.com/company/List+" target="_blank">List+</a> for any news and product updates.
                      </p>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="padding-global">
            <div className="container-large">
              <div className="footer-component">
                <div className="padding-section-medium">
                  <div>
                    <div className="footer-top-wrapper">
                      <div className="footer-link-list">
                        <a href="#feature" className="footer-link">Features</a>
                        <a href="#benefits" className="footer-link">Benefits</a>
                        <a href="#faq" className="footer-link">Faqs</a>
                        <a href="/contact" className="footer-link">Contact</a>
                      </div>
                      <a href="/" className="footer-logo-link">
                        <img src="/logo-text.svg" alt="List+" className="footer-logo" />
                      </a>
                      <div className="footer-social-list">
                        <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
                        <a href="/terms-of-service" className="footer-link">Terms of Service</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
};

export default ProductPage;