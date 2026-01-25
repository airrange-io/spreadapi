import { Metadata } from 'next';
import '../product.css';
import './how-excel-api-works.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';
import { SupportedLocale } from '@/lib/translations/blog-helpers';
import { getHowItWorksTranslations } from '@/lib/translations/marketing';

export const metadata: Metadata = {
  title: 'How Excel API Works - SpreadAPI | Transform Spreadsheets to APIs',
  description: 'Learn how SpreadAPI transforms your Excel spreadsheets into powerful REST APIs. No coding required. Perfect for AI integration with ChatGPT and Claude.',
  keywords: 'how excel api works, spreadsheet to api conversion, excel rest api tutorial, excel api integration guide, mcp excel integration',
  openGraph: {
    title: 'How SpreadAPI Works - Excel to API in Minutes',
    description: 'Transform your Excel spreadsheets into REST APIs instantly. Learn the simple 3-step process.',
    type: 'article',
    url: 'https://spreadapi.io/how-excel-api-works',
    siteName: 'SpreadAPI',
    images: [{
      url: 'https://spreadapi.io/api/og?title=How%20Excel%20API%20Works&description=Transform%20spreadsheets%20to%20APIs%20in%203%20simple%20steps',
      width: 1200,
      height: 630,
      alt: 'How SpreadAPI Works',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How SpreadAPI Works - Excel to API',
    description: 'Transform Excel spreadsheets into REST APIs. No coding required.',
  },
  alternates: {
    canonical: 'https://spreadapi.io/how-excel-api-works',
    languages: {
      'en': 'https://spreadapi.io/how-excel-api-works',
      'de': 'https://spreadapi.io/de/how-excel-api-works',
      'x-default': 'https://spreadapi.io/how-excel-api-works',
    },
  },
};

interface HowItWorksContentProps {
  locale?: SupportedLocale;
}

export function HowItWorksContent({ locale = 'en' }: HowItWorksContentProps) {
  const t = getHowItWorksTranslations(locale);

  return (
    <>
      <link rel="stylesheet" href="/fonts/satoshi-fixed.css" />
      <div className="product-page">

      <div className="page-wrapper">
        {/* Navigation */}
        <Navigation currentPage="how-excel-api-works" locale={locale} />

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
                              <div>{t.hero.subheading}</div>
                            </div>
                          </div>
                          <div className="margin-bottom margin-small">
                            <h1>
                              {t.hero.title}
                            </h1>
                          </div>
                          <p className="text-size-medium" style={{ maxWidth: '680px', margin: '0 auto' }}>
                            {t.hero.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="header-image-wrapper">
                      <div className="header-illustration">
                        <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="800" height="400" fill="#F8F6FE"/>
                          {/* Spreadsheet on left */}
                          <rect x="50" y="100" width="300" height="200" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
                          <rect x="70" y="120" width="260" height="30" fill="#F8F6FE"/>
                          <rect x="70" y="160" width="80" height="30" fill="#E6F4FF"/>
                          <rect x="160" y="160" width="80" height="30" fill="#F8F6FE"/>
                          <rect x="250" y="160" width="80" height="30" fill="#F8F6FE"/>
                          <rect x="70" y="200" width="80" height="30" fill="#F8F6FE"/>
                          <rect x="160" y="200" width="80" height="30" fill="#E6F4FF"/>
                          <rect x="250" y="200" width="80" height="30" fill="#F8F6FE"/>
                          <rect x="70" y="240" width="80" height="30" fill="#F8F6FE"/>
                          <rect x="160" y="240" width="80" height="30" fill="#F8F6FE"/>
                          <rect x="250" y="240" width="80" height="30" fill="#FFE4E1"/>

                          {/* Arrow */}
                          <path d="M370 200 L430 200" stroke="#9333EA" strokeWidth="3" strokeDasharray="5,5"/>
                          <path d="M420 190 L430 200 L420 210" stroke="#9333EA" strokeWidth="3" fill="none"/>

                          {/* API on right */}
                          <rect x="450" y="100" width="300" height="200" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2"/>
                          <rect x="470" y="120" width="260" height="40" fill="#F8F6FE"/>
                          <text x="600" y="145" textAnchor="middle" fill="#0a0a0a" fontSize="16" fontWeight="500">API Endpoint</text>
                          <rect x="470" y="180" width="260" height="100" rx="4" fill="#F8F6FE"/>
                          <text x="490" y="210" fill="#5a5a5a" fontSize="14">{"{"}</text>
                          <text x="510" y="230" fill="#5a5a5a" fontSize="14">"inputs": [...],</text>
                          <text x="510" y="250" fill="#5a5a5a" fontSize="14">"outputs": [...]</text>
                          <text x="490" y="270" fill="#5a5a5a" fontSize="14">{"}"}</text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Overview Section */}
          <section id="overview" className="section-home-feature">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="feature-component">
                    <div className="feature-content-wrapper">
                      <div className="margin-bottom margin-small">
                        <h2>
                          <span className="text-color-primary">{t.overview.title1}</span> {t.overview.title2}
                        </h2>
                      </div>
                      <div className="margin-bottom margin-medium">
                        <p className="text-size-medium">
                          {t.overview.description}
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
                          <p className="text-size-medium">{t.overview.point1}</p>
                        </div>
                        <div className="feature-keypoint-list-item">
                          <div className="check-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-size-medium">{t.overview.point2}</p>
                        </div>
                        <div className="feature-keypoint-list-item">
                          <div className="check-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M7 12L10 15L17 8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-size-medium">{t.overview.point3}</p>
                        </div>
                      </div>
                    </div>
                    <div className="feature-image-wrapper">
                      <div className="feature-image-placeholder">
                        <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="600" height="400" fill="#F8F6FE" rx="12"/>
                          <rect x="40" y="40" width="520" height="320" rx="8" fill="white" stroke="#E8E0FF" strokeWidth="2"/>

                          {/* Upload area */}
                          <rect x="100" y="100" width="400" height="200" rx="8" fill="#F8F6FE" stroke="#E8E0FF" strokeWidth="2" strokeDasharray="8,4"/>
                          <circle cx="300" cy="180" r="30" fill="#9333EA" fillOpacity="0.2"/>
                          <path d="M300 165 L300 195 M285 180 L315 180" stroke="#9333EA" strokeWidth="3" strokeLinecap="round"/>
                          <text x="300" y="240" textAnchor="middle" fill="#5a5a5a" fontSize="16">{t.overview.imageAlt}</text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Three Core Concepts */}
          <section id="concepts" className="section-home-concepts">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="margin-bottom margin-large">
                    <div className="text-align-center">
                      <div className="max-width-large align-center">
                        <div className="margin-bottom margin-xsmall">
                          <div className="subheading">
                            <div>{t.concepts.subheading}</div>
                          </div>
                        </div>
                        <h2>
                          {t.concepts.title1} <span className="text-color-primary">{t.concepts.title2}</span>
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="concepts-grid">
                    {/* Input Parameters */}
                    <div className="concept-card">
                      <div className="concept-icon-wrapper">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="60" height="60" rx="12" fill="#E6F4FF"/>
                          <path d="M20 30 L30 30 M30 30 L40 20 M30 30 L40 40" stroke="#1890ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3>{t.concepts.input.title}</h3>
                      <p className="text-size-medium">
                        {t.concepts.input.description}
                      </p>
                      <div className="concept-example">
                        <code>
                          {t.concepts.input.example.split('\n').map((line, i) => (
                            <span key={i}>{line}<br/></span>
                          ))}
                        </code>
                      </div>
                    </div>

                    {/* Output Parameters */}
                    <div className="concept-card">
                      <div className="concept-icon-wrapper">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="60" height="60" rx="12" fill="#E6FFE6"/>
                          <path d="M40 30 L30 30 M30 30 L20 20 M30 30 L20 40" stroke="#52c41a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3>{t.concepts.output.title}</h3>
                      <p className="text-size-medium">
                        {t.concepts.output.description}
                      </p>
                      <div className="concept-example">
                        <code>
                          {t.concepts.output.example.split('\n').map((line, i) => (
                            <span key={i}>{line}<br/></span>
                          ))}
                        </code>
                      </div>
                    </div>

                    {/* Editable Areas */}
                    <div className="concept-card">
                      <div className="concept-icon-wrapper">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="60" height="60" rx="12" fill="#FFF4E6"/>
                          <rect x="15" y="15" width="30" height="30" rx="4" fill="none" stroke="#fa8c16" strokeWidth="2.5"/>
                          <rect x="20" y="20" width="8" height="8" fill="#fa8c16" fillOpacity="0.3"/>
                          <rect x="32" y="20" width="8" height="8" fill="#fa8c16" fillOpacity="0.3"/>
                          <rect x="20" y="32" width="8" height="8" fill="#fa8c16" fillOpacity="0.3"/>
                          <rect x="32" y="32" width="8" height="8" fill="#fa8c16" fillOpacity="0.3"/>
                        </svg>
                      </div>
                      <h3>{t.concepts.editable.title}</h3>
                      <p className="text-size-medium">
                        {t.concepts.editable.description}
                      </p>
                      <div className="concept-example">
                        <code>
                          {t.concepts.editable.example.split('\n').map((line, i) => (
                            <span key={i}>{line}<br/></span>
                          ))}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Workflow Section */}
          <section id="workflow" className="section-home-workflow">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="margin-bottom margin-large">
                    <div className="text-align-center">
                      <div className="max-width-large align-center">
                        <div className="margin-bottom margin-xsmall">
                          <div className="subheading">
                            <div>{t.workflow.subheading}</div>
                          </div>
                        </div>
                        <h2>
                          {t.workflow.title1} <span className="text-color-primary">{t.workflow.title2}</span> {t.workflow.title3}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="workflow-steps">
                    <div className="workflow-step">
                      <div className="workflow-step-number">1</div>
                      <div className="workflow-step-content">
                        <h3>{t.workflow.step1.title}</h3>
                        <p>{t.workflow.step1.description}</p>
                      </div>
                    </div>

                    <div className="workflow-connector"></div>

                    <div className="workflow-step">
                      <div className="workflow-step-number">2</div>
                      <div className="workflow-step-content">
                        <h3>{t.workflow.step2.title}</h3>
                        <p>{t.workflow.step2.description}</p>
                      </div>
                    </div>

                    <div className="workflow-connector"></div>

                    <div className="workflow-step">
                      <div className="workflow-step-number">3</div>
                      <div className="workflow-step-content">
                        <h3>{t.workflow.step3.title}</h3>
                        <p>{t.workflow.step3.description}</p>
                      </div>
                    </div>

                    <div className="workflow-connector"></div>

                    <div className="workflow-step">
                      <div className="workflow-step-number">4</div>
                      <div className="workflow-step-content">
                        <h3>{t.workflow.step4.title}</h3>
                        <p>{t.workflow.step4.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* API Flow Diagram */}
                  <div className="margin-top margin-xlarge">
                    <div className="api-flow-card">
                      <h3 className="text-align-center margin-bottom margin-medium">{t.workflow.flowTitle}</h3>
                      <div className="api-flow-diagram">
                        <div className="api-flow-item" data-step="1">
                          <div className="api-flow-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M24 14V34M24 34L16 26M24 34L32 26" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <rect x="14" y="10" width="20" height="4" rx="2" fill="#9333EA" fillOpacity="0.5"/>
                            </svg>
                          </div>
                          <h4>{t.workflow.flow1.title}</h4>
                          <p>{t.workflow.flow1.description}</p>
                        </div>
                        <div className="api-flow-item" data-step="2">
                          <div className="api-flow-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <rect x="12" y="12" width="24" height="24" rx="3" stroke="#9333EA" strokeWidth="2"/>
                              <path d="M18 20H30M18 24H30M18 28H26" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M32 32L36 36" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <h4>{t.workflow.flow2.title}</h4>
                          <p>{t.workflow.flow2.description}</p>
                        </div>
                        <div className="api-flow-item" data-step="3">
                          <div className="api-flow-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M28 14L20 24H28L20 34" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="24" cy="24" r="11" stroke="#9333EA" strokeWidth="2" strokeDasharray="3 3"/>
                            </svg>
                          </div>
                          <h4>{t.workflow.flow3.title}</h4>
                          <p>{t.workflow.flow3.description}</p>
                        </div>
                        <div className="api-flow-item" data-step="4">
                          <div className="api-flow-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                              <path d="M24 34V14M24 14L16 22M24 14L32 22" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <rect x="14" y="34" width="20" height="4" rx="2" fill="#9333EA" fillOpacity="0.5"/>
                            </svg>
                          </div>
                          <h4>{t.workflow.flow4.title}</h4>
                          <p>{t.workflow.flow4.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Example Section */}
          <section className="section-home-example">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="feature-component reverse">
                    <div className="feature-image-wrapper">
                      <div className="code-example-wrapper">
                        <div className="code-example-header">
                          <span>{t.example.requestLabel}</span>
                        </div>
                        <pre className="code-example">
{`GET /api/v1/services/loan_calc/execute
  ?loan_amount=200000
  &interest_rate=0.045
  &years=30`}
                        </pre>
                        <div className="code-example-header" style={{ marginTop: '20px' }}>
                          <span>{t.example.responseLabel}</span>
                        </div>
                        <pre className="code-example">
{`{
  "serviceId": "loan_calc",
  "inputs": {
    "loan_amount": 200000,
    "interest_rate": 0.045,
    "years": 30
  },
  "outputs": {
    "monthly_payment": 1013.37,
    "total_interest": 164813.42,
    "total_paid": 364813.42
  },
  "metadata": {
    "executionTime": 12,
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1"
  }
}`}
                        </pre>
                      </div>
                    </div>
                    <div className="feature-content-wrapper">
                      <div className="margin-bottom margin-small">
                        <h2>
                          <span className="text-color-primary">{t.example.title1}</span> {t.example.title2}
                        </h2>
                      </div>
                      <div className="margin-bottom margin-medium">
                        <p className="text-size-medium">
                          {t.example.description}
                        </p>
                      </div>
                      <div className="feature-list">
                        <div className="feature-item">
                          <div className="feature-item-icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M20 12 L20 28 M12 20 L28 20" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="feature-item-content-wrapper">
                            <div className="margin-bottom margin-xsmall">
                              <h3 className="heading-style-h5">{t.example.inputCells}</h3>
                            </div>
                            <p className="text-size-medium">{t.example.inputCellsExample}</p>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-item-icon-wrapper">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="40" height="40" rx="8" fill="#9333EA" fillOpacity="0.1"/>
                              <path d="M14 20 L18 24 L26 16" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="feature-item-content-wrapper">
                            <div className="margin-bottom margin-xsmall">
                              <h3 className="heading-style-h5">{t.example.excelFormula}</h3>
                            </div>
                            <p className="text-size-medium">=PMT(B3/12, B4*12, -B2)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI Integration Section */}
          <section id="ai-integration" className="section-home-ai">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-large">
                  <div className="margin-bottom margin-large">
                    <div className="text-align-center">
                      <div className="max-width-large align-center">
                        <div className="margin-bottom margin-xsmall">
                          <div className="subheading">
                            <div>{t.aiIntegration.subheading}</div>
                          </div>
                        </div>
                        <h2>
                          {t.aiIntegration.title1} <span className="text-color-primary">{t.aiIntegration.title2}</span>
                        </h2>
                        <p className="text-size-medium margin-top margin-small">
                          {t.aiIntegration.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ai-features-grid">
                    <div className="ai-feature-card">
                      <div className="ai-feature-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                          <circle cx="20" cy="20" r="8" stroke="#9333EA" strokeWidth="2.5"/>
                          <path d="M26 26L34 34" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round"/>
                          <path d="M16 20H24M20 16V24" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <h3>{t.aiIntegration.feature1.title}</h3>
                      <p>{t.aiIntegration.feature1.description}</p>
                    </div>
                    <div className="ai-feature-card">
                      <div className="ai-feature-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                          <rect x="10" y="14" width="28" height="20" rx="10" stroke="#9333EA" strokeWidth="2.5"/>
                          <path d="M38 24L38 30C38 32 36 34 34 34L28 34L24 38L24 34" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="18" cy="24" r="1.5" fill="#9333EA"/>
                          <circle cx="24" cy="24" r="1.5" fill="#9333EA"/>
                          <circle cx="30" cy="24" r="1.5" fill="#9333EA"/>
                        </svg>
                      </div>
                      <h3>{t.aiIntegration.feature2.title}</h3>
                      <p>{t.aiIntegration.feature2.description}</p>
                    </div>
                    <div className="ai-feature-card">
                      <div className="ai-feature-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                          <rect x="12" y="24" width="6" height="12" rx="1" fill="#9333EA"/>
                          <rect x="21" y="18" width="6" height="18" rx="1" fill="#9333EA" fillOpacity="0.7"/>
                          <rect x="30" y="12" width="6" height="24" rx="1" fill="#9333EA" fillOpacity="0.5"/>
                          <path d="M10 10L10 38L38 38" stroke="#9333EA" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <h3>{t.aiIntegration.feature3.title}</h3>
                      <p>{t.aiIntegration.feature3.description}</p>
                    </div>
                    <div className="ai-feature-card">
                      <div className="ai-feature-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="48" height="48" rx="8" fill="#9333EA" fillOpacity="0.1" />
                          <path d="M24 14C18.5 14 14 18.5 14 24C14 29.5 18.5 34 24 34" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round"/>
                          <path d="M24 34C29.5 34 34 29.5 34 24C34 18.5 29.5 14 24 14" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round"/>
                          <path d="M20 18L24 14L28 18M28 30L24 34L20 30" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3>{t.aiIntegration.feature4.title}</h3>
                      <p>{t.aiIntegration.feature4.description}</p>
                    </div>
                  </div>

                  <div className="ai-example-card margin-top margin-xlarge">
                    <h3>{t.aiIntegration.exampleTitle}</h3>
                    <div className="ai-conversation">
                      <div className="ai-message user">
                        <strong>{t.aiIntegration.exampleUser}</strong> {t.aiIntegration.exampleUserText}
                      </div>
                      <div className="ai-message assistant">
                        <strong>{t.aiIntegration.exampleAssistant}</strong> {t.aiIntegration.exampleAssistantText}
                        <div className="ai-code">
                          {t.aiIntegration.exampleCalling}<br/>
                          → loan_amount: 300000<br/>
                          → interest_rate: 0.045<br/>
                          → years: 30
                        </div>
                        <strong>{t.aiIntegration.exampleResult}</strong> {t.aiIntegration.exampleResultText}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Best Practices Section */}
          <section className="section-home-practices">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="practices-component">
                    <div className="practices-content-wrapper">
                      <div className="margin-bottom margin-small">
                        <h2>
                          <span className="text-color-primary">{t.bestPractices.title1}</span> {t.bestPractices.title2}
                        </h2>
                      </div>
                      <div className="practices-list">
                        <div className="practice-item">
                          <div className="practice-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <strong>{t.bestPractices.practice1.label}</strong> {t.bestPractices.practice1.text}
                          </div>
                        </div>
                        <div className="practice-item">
                          <div className="practice-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <strong>{t.bestPractices.practice2.label}</strong> {t.bestPractices.practice2.text}
                          </div>
                        </div>
                        <div className="practice-item">
                          <div className="practice-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <strong>{t.bestPractices.practice3.label}</strong> {t.bestPractices.practice3.text}
                          </div>
                        </div>
                        <div className="practice-item">
                          <div className="practice-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <strong>{t.bestPractices.practice4.label}</strong> {t.bestPractices.practice4.text}
                          </div>
                        </div>
                        <div className="practice-item">
                          <div className="practice-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <strong>{t.bestPractices.practice5.label}</strong> {t.bestPractices.practice5.text}
                          </div>
                        </div>
                        <div className="practice-item">
                          <div className="practice-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <strong>{t.bestPractices.practice6.label}</strong> {t.bestPractices.practice6.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer locale={locale} currentPath="/how-excel-api-works" />
      </div>
    </div>
    </>
  );
}

export default function HowItWorksPage() {
  return <HowItWorksContent />;
}
