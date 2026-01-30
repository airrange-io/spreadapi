import { Metadata } from 'next';
import '../../product.css';
import Footer from '@/components/product/Footer';
import Navigation from '@/components/Navigation';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Enterprise Technical Whitepaper | SpreadAPI',
  description: 'Technical documentation for SpreadAPI On-Premises deployment. Architecture, security model, deployment options, and compliance checklist for enterprise IT teams.',
  keywords: 'spreadapi whitepaper, enterprise excel api, on-premises deployment guide, data compliance excel',
  openGraph: {
    title: 'SpreadAPI Enterprise Technical Whitepaper',
    description: 'Complete technical documentation for on-premises deployment.',
    type: 'article',
    url: 'https://spreadapi.io/on-premises/whitepaper',
  },
};

export default function WhitepaperPage() {
  return (
    <>
      <div className="product-page">
        <div className="page-wrapper">
          <Navigation currentPage="on-premises" />

          <main className="main-wrapper">
            {/* Header */}
            <header style={{ background: 'linear-gradient(135deg, #502D80 0%, #7c3aed 100%)', padding: '80px 0' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div style={{ maxWidth: '800px' }}>
                    <div style={{
                      display: 'inline-block',
                      background: 'rgba(255,255,255,0.2)',
                      padding: '6px 16px',
                      borderRadius: '100px',
                      fontSize: '14px',
                      color: 'white',
                      marginBottom: '20px'
                    }}>
                      Technical Documentation
                    </div>
                    <h1 style={{ color: 'white', fontSize: '42px', marginBottom: '16px', lineHeight: '1.2' }}>
                      SpreadAPI Enterprise:<br />On-Premises Deployment Guide
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', lineHeight: '1.6' }}>
                      Technical documentation for enterprise IT architecture teams evaluating
                      SpreadAPI for regulated environments.
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Table of Contents */}
            <section style={{ background: '#f8f9fa', padding: '40px 0' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div style={{ maxWidth: '800px' }}>
                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', marginBottom: '16px' }}>Contents</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {[
                        '1. The Business Problem',
                        '2. Architecture Overview',
                        '3. On-Premises Deployment',
                        '4. Data Flow & Compliance',
                        '5. Security Model',
                        '6. Deployment Options',
                        '7. Technical Specifications',
                        '8. Compliance Checklist',
                      ].map((item, i) => (
                        <a key={i} href={`#section-${i + 1}`} style={{ color: '#9333EA', textDecoration: 'none', fontSize: '15px' }}>
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Content */}
            <article style={{ padding: '60px 0' }}>
              <div className="padding-global">
                <div className="container-large">
                  <div style={{ maxWidth: '800px' }}>

                    {/* Section 1 */}
                    <section id="section-1" style={{ marginBottom: '60px' }}>
                      <h2 style={{ fontSize: '28px', marginBottom: '24px', color: '#1f2937' }}>1. The Business Problem</h2>

                      <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>Excel: The Enterprise&apos;s Hidden Business Logic Layer</h3>
                      <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '20px' }}>
                        Large organizations rely on Excel for critical business calculations. These spreadsheets
                        encode years of business knowledge, regulatory requirements, and edge-case handling.
                        They are trusted, audited, and battle-tested.
                      </p>

                      <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#374151' }}>Domain</th>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#374151' }}>Examples</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ['Tax & Compliance', 'VAT calculations, tax residency rules, transfer pricing models'],
                              ['Financial Services', 'Loan amortization, risk scoring, portfolio valuations'],
                              ['Insurance', 'Premium calculations, actuarial models, claims processing'],
                              ['Consulting', 'Fee calculations, resource pricing, engagement scoping'],
                              ['Manufacturing', 'Bill of materials, cost rollups, margin calculations'],
                            ].map(([domain, examples], i) => (
                              <tr key={i}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>{domain}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#666' }}>{examples}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>The Challenge: Scaling Excel Logic</h3>
                      <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '16px' }}>
                        Excel works well for individual analysts but fails when you need to embed calculations
                        in web applications, process thousands of calculations per minute, or integrate with
                        automation workflows.
                      </p>
                      <p style={{ color: '#666', lineHeight: '1.8' }}>
                        <strong>Traditional solutions</strong> require rewriting Excel logic in code—a process that
                        takes months, introduces calculation discrepancies, and creates maintenance burden.
                      </p>
                    </section>

                    {/* Section 2 */}
                    <section id="section-2" style={{ marginBottom: '60px' }}>
                      <h2 style={{ fontSize: '28px', marginBottom: '24px', color: '#1f2937' }}>2. Architecture Overview</h2>

                      <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>
                        SpreadAPI consists of two deployment models:
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '24px' }}>
                          <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>Cloud (spreadapi.io)</h4>
                          <ul style={{ color: '#666', fontSize: '14px', paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
                            <li>Multi-tenant SaaS</li>
                            <li>Managed infrastructure</li>
                            <li>Data stored in our cloud</li>
                            <li>Suitable for non-sensitive workloads</li>
                          </ul>
                        </div>
                        <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '24px', border: '2px solid #bbf7d0' }}>
                          <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#166534' }}>On-Premises (Runtime)</h4>
                          <ul style={{ color: '#166534', fontSize: '14px', paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
                            <li>Single-tenant, your infrastructure</li>
                            <li>Docker/Kubernetes deployment</li>
                            <li>Data never leaves your network</li>
                            <li>Full data sovereignty</li>
                          </ul>
                        </div>
                      </div>

                      <div style={{ background: '#f8f6fe', borderRadius: '12px', padding: '24px' }}>
                        <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#5b21b6' }}>Core Technology</h4>
                        <p style={{ color: '#666', lineHeight: '1.8', margin: 0 }}>
                          SpreadAPI is powered by <strong>an enterprise-grade Excel engine</strong>, supporting
                          <strong> 500+ Excel functions</strong> including modern array functions (XLOOKUP, FILTER,
                          SORT, UNIQUE, SEQUENCE, LET, LAMBDA). It handles complex dependencies and processes
                          calculations in milliseconds.
                        </p>
                      </div>
                    </section>

                    {/* Section 3 */}
                    <section id="section-3" style={{ marginBottom: '60px' }}>
                      <h2 style={{ fontSize: '28px', marginBottom: '24px', color: '#1f2937' }}>3. On-Premises Deployment</h2>

                      <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>
                        SpreadAPI Runtime is a lightweight, self-contained calculation server designed for
                        on-premises deployment. It executes Excel-based services within your infrastructure,
                        ensuring complete data isolation.
                      </p>

                      <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                          <tbody>
                            {[
                              ['Deployment', 'Docker container or Node.js application'],
                              ['Storage', 'Local file system (no external database required)'],
                              ['Network', 'No outbound connections required'],
                              ['Updates', 'Manual container updates (you control the schedule)'],
                              ['Scaling', 'Horizontal scaling via container orchestration'],
                            ].map(([feature, desc], i) => (
                              <tr key={i}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: '500', width: '140px' }}>{feature}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#666' }}>{desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Section 4 */}
                    <section id="section-4" style={{ marginBottom: '60px' }}>
                      <h2 style={{ fontSize: '28px', marginBottom: '24px', color: '#1f2937' }}>4. Data Flow & Compliance Architecture</h2>

                      <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>The Zero-Cloud-Storage Workflow</h3>
                      <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>
                        For maximum compliance, SpreadAPI supports a workflow where no sensitive data ever
                        touches external infrastructure:
                      </p>

                      <div style={{ marginBottom: '24px' }}>
                        {[
                          { step: '1', title: 'Build in Browser', desc: 'Import Excel, define inputs/outputs, test calculations. Everything stays in browser memory.' },
                          { step: '2', title: 'Export Package', desc: 'Click "Export for Runtime" to download a JSON file containing your service configuration.' },
                          { step: '3', title: 'Deploy Internally', desc: 'Run SpreadAPI Runtime on your servers. Upload the service package. Your API is live—internally.' },
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%', background: '#9333EA',
                              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: '600', fontSize: '14px', flexShrink: 0
                            }}>{item.step}</div>
                            <div>
                              <strong style={{ color: '#374151' }}>{item.title}</strong>
                              <p style={{ color: '#666', margin: '4px 0 0', fontSize: '14px' }}>{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '24px', border: '1px solid #fecaca' }}>
                        <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#991b1b' }}>Enterprise Mode: Disabled Cloud Storage</h4>
                        <p style={{ color: '#666', lineHeight: '1.8', margin: 0 }}>
                          For organizations requiring absolute assurance, we offer <strong>Enterprise Mode</strong> where
                          the &quot;Save to Cloud&quot; functionality is completely disabled. Even accidental data
                          leakage is architecturally impossible.
                        </p>
                      </div>
                    </section>

                    {/* Section 5 */}
                    <section id="section-5" style={{ marginBottom: '60px' }}>
                      <h2 style={{ fontSize: '28px', marginBottom: '24px', color: '#1f2937' }}>5. Security Model</h2>

                      <div style={{ marginBottom: '24px' }}>
                        {[
                          { title: 'Network Isolation', desc: 'Runs entirely within your network perimeter. No required outbound internet connectivity. Compatible with air-gapped environments.' },
                          { title: 'Container Isolation', desc: 'Runs in isolated Docker container. Minimal attack surface (Node.js runtime only). No database dependencies.' },
                          { title: 'Calculation Isolation', desc: 'Each calculation runs in isolated context. No shared state between requests. Memory cleared after each execution.' },
                          { title: 'API Security', desc: 'Optional authentication (API keys, OAuth, custom). Rate limiting per endpoint. Request/response logging.' },
                        ].map((item, i) => (
                          <div key={i} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '20px', marginBottom: '12px' }}>
                            <h4 style={{ fontSize: '16px', marginBottom: '8px', color: '#374151' }}>Layer {i + 1}: {item.title}</h4>
                            <p style={{ color: '#666', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
                          </div>
                        ))}
                      </div>

                      <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>What Data is Stored?</h3>
                      <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#374151' }}>Data Type</th>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#374151' }}>Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ['Service definitions', 'Local JSON files'],
                              ['Workbook data', 'Local JSON files'],
                              ['Request logs', 'Local log files (configurable)'],
                              ['Calculation cache', 'In-memory only (cleared on restart)'],
                              ['Input/output values', 'NOT stored (processed, not persisted)'],
                            ].map(([type, location], i) => (
                              <tr key={i}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>{type}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#666' }}>{location}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Section 6 */}
                    <section id="section-6" style={{ marginBottom: '60px' }}>
                      <h2 style={{ fontSize: '28px', marginBottom: '24px', color: '#1f2937' }}>6. Deployment Options</h2>

                      <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>Docker Deployment (Recommended)</h3>
                      <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                        <pre style={{ margin: 0, color: '#e5e5e5', fontSize: '13px', fontFamily: 'monospace', overflow: 'auto' }}>
{`# Pull the image
docker pull spreadapi/runtime:latest

# Create directories
mkdir -p services logs

# Start the container
docker run -d -p 3001:3001 \\
  -v ./services:/app/services \\
  -v ./logs:/app/logs \\
  spreadapi/runtime:latest

# Verify health
curl http://localhost:3001/api/health`}
                        </pre>
                      </div>

                      <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>Cloud Platform Options</h3>
                      <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                          <tbody>
                            {[
                              ['Azure', 'Azure Container Instances or AKS'],
                              ['AWS', 'ECS Fargate or EKS'],
                              ['GCP', 'Cloud Run or GKE'],
                            ].map(([platform, service], i) => (
                              <tr key={i}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: '500', width: '100px' }}>{platform}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#666' }}>{service}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p style={{ color: '#666', fontSize: '13px', marginTop: '12px', marginBottom: 0 }}>
                          All major cloud providers support Docker containers within your private VPC/VNet,
                          ensuring data never traverses public networks.
                        </p>
                      </div>
                    </section>

                    {/* Section 7 */}
                    <section id="section-7" style={{ marginBottom: '60px' }}>
                      <h2 style={{ fontSize: '28px', marginBottom: '24px', color: '#1f2937' }}>7. Technical Specifications</h2>

                      <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>API Endpoints</h3>
                      <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#374151' }}>Endpoint</th>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#374151' }}>Method</th>
                              <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #e5e7eb', color: '#374151' }}>Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ['/api/health', 'GET', 'Health check and version info'],
                              ['/api/services', 'GET', 'List deployed services'],
                              ['/api/services/{id}', 'GET', 'Service metadata and schema'],
                              ['/api/execute/{id}', 'GET/POST', 'Execute calculation'],
                              ['/api/upload', 'POST', 'Deploy new service package'],
                            ].map(([endpoint, method, desc], i) => (
                              <tr key={i}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: '13px' }}>{endpoint}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{method}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#666' }}>{desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>Supported Excel Features</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                        {[
                          ['Math & Trig', 'SUM, SUMIF, SUMIFS, SUMPRODUCT, ROUND...'],
                          ['Statistical', 'AVERAGE, MEDIAN, STDEV, PERCENTILE...'],
                          ['Financial', 'NPV, IRR, PMT, FV, PV, RATE, XNPV, XIRR'],
                          ['Lookup', 'VLOOKUP, HLOOKUP, INDEX, MATCH, XLOOKUP'],
                          ['Array Functions', 'FILTER, SORT, UNIQUE, SEQUENCE, SORTBY'],
                          ['Dynamic Arrays', 'LET, LAMBDA, spill ranges'],
                        ].map(([category, funcs], i) => (
                          <div key={i} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
                            <strong style={{ fontSize: '14px', color: '#374151' }}>{category}</strong>
                            <p style={{ color: '#666', fontSize: '13px', margin: '4px 0 0' }}>{funcs}</p>
                          </div>
                        ))}
                      </div>

                      <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>Performance</h3>
                      <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                          <tbody>
                            {[
                              ['Cold start (first calculation)', '200-500ms'],
                              ['Warm calculation', '10-50ms'],
                              ['Complex workbook (1000+ formulas)', '50-200ms'],
                              ['Memory per service', '~10-50MB'],
                            ].map(([metric, value], i) => (
                              <tr key={i}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#666' }}>{metric}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: '500', textAlign: 'right' }}>{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Section 8 */}
                    <section id="section-8" style={{ marginBottom: '60px' }}>
                      <h2 style={{ fontSize: '28px', marginBottom: '24px', color: '#1f2937' }}>8. Compliance Checklist</h2>

                      <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '24px', border: '1px solid #bbf7d0', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#166534' }}>IT Security Review Checklist</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {[
                            ['Data Residency', 'All data stored on your infrastructure'],
                            ['Data in Transit', 'Internal network only (HTTPS optional)'],
                            ['Data at Rest', 'Your encryption, your policies'],
                            ['Access Control', 'Integrates with your IAM'],
                            ['Audit Logging', 'Configurable request logging'],
                            ['External Dependencies', 'None - runs fully offline'],
                            ['Vendor Access', 'Zero vendor access to your data'],
                            ['Network Isolation', 'No outbound connections required'],
                          ].map(([req, compliance], i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span style={{ fontWeight: '500', color: '#374151', minWidth: '160px' }}>{req}</span>
                              <span style={{ color: '#666', fontSize: '14px' }}>{compliance}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#374151' }}>Supporting Your Compliance Requirements</h3>
                        <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '16px' }}>
                          SpreadAPI Runtime&apos;s on-premises architecture is designed to fit within your existing
                          compliance framework. The Runtime has no external dependencies, no outbound connections,
                          and stores no data outside your network.
                        </p>
                        <p style={{ color: '#666', lineHeight: '1.8', margin: 0, fontSize: '14px', fontStyle: 'italic' }}>
                          Note: SpreadAPI Runtime is a software component that runs in your infrastructure.
                          Compliance certification is your organization&apos;s responsibility based on your overall
                          security posture.
                        </p>
                      </div>
                    </section>

                    {/* Contact */}
                    <section style={{ background: 'linear-gradient(135deg, #f8f6fe 0%, #e8e0ff 100%)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#374151' }}>Ready to Get Started?</h3>
                      <p style={{ color: '#666', marginBottom: '24px' }}>
                        Contact us to discuss your enterprise requirements.
                      </p>
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="mailto:team@airrange.io?subject=SpreadAPI Enterprise Inquiry" style={{
                          background: '#9333EA',
                          color: 'white',
                          padding: '14px 28px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '15px'
                        }}>
                          Contact Sales
                        </a>
                        <a href="/on-premises" style={{
                          padding: '14px 28px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '15px',
                          border: '2px solid #9333EA',
                          color: '#9333EA'
                        }}>
                          Back to Overview
                        </a>
                      </div>
                    </section>

                  </div>
                </div>
              </div>
            </article>
          </main>

          <Footer currentPath="/on-premises/whitepaper" />
        </div>
      </div>
    </>
  );
}
