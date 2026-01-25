'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/product/Footer';
import '../(marketing)/product.css';

export default function DocsPageClient() {
  return (
    <>
      <div className="product-page">
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

            {/* Documentation Content */}
            <section className="section-docs-content">
              <div className="padding-global">
                <div className="container-large">
                  <div className="docs-layout" style={{
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr',
                    gap: '60px',
                    alignItems: 'start',
                    maxWidth: '1200px',
                    margin: '0 auto'
                  }}>
                    {/* Sidebar */}
                    <aside className="docs-sidebar" style={{
                      position: 'sticky',
                      top: '100px',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      padding: '24px'
                    }}>
                      <nav>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>Getting Started</h3>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#overview" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Overview</a>
                          </li>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#quickstart" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Quick Start</a>
                          </li>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#authentication" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Authentication</a>
                          </li>
                        </ul>

                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>Core Concepts</h3>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#how-it-works" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>How It Works</a>
                          </li>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#services" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Services</a>
                          </li>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#permissions" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Permissions</a>
                          </li>
                        </ul>

                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>API Reference</h3>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#upload-excel" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Upload Excel</a>
                          </li>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#execute" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Execute Calculations</a>
                          </li>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#error-handling" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Error Handling</a>
                          </li>
                        </ul>

                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>AI Integration</h3>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#mcp-protocol" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>MCP Protocol</a>
                          </li>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#claude-setup" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Claude Setup</a>
                          </li>
                        </ul>

                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1a1a1a' }}>Resources</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#limitations" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Limitations</a>
                          </li>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#pricing" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Pricing</a>
                          </li>
                          <li style={{ marginBottom: '12px' }}>
                            <a href="#support" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Support</a>
                          </li>
                        </ul>
                      </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="docs-content">
                      {/* Overview */}
                      <section id="overview" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Overview</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          SpreadAPI turns your Excel spreadsheets into secure REST APIs. Upload your Excel file, and instantly get an API endpoint
                          that executes your formulas and returns results. Perfect for AI integration, web apps, and automation.
                        </p>

                        <div style={{
                          background: '#f3f4f6',
                          padding: '24px',
                          borderRadius: '8px',
                          marginBottom: '32px'
                        }}>
                          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Key Features</h3>
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            <li style={{ marginBottom: '8px' }}>🚀 Transform Excel files into REST APIs instantly</li>
                            <li style={{ marginBottom: '8px' }}>🤖 AI integration with MCP protocol for Claude and ChatGPT</li>
                            <li style={{ marginBottom: '8px' }}>🔒 Your formulas stay private and secure</li>
                            <li style={{ marginBottom: '8px' }}>⚡ 50-200ms response times with intelligent caching</li>
                            <li style={{ marginBottom: '8px' }}>📊 Supports complex Excel features (except VBA)</li>
                          </ul>
                        </div>
                      </section>

                      {/* Quick Start */}
                      <section id="quickstart" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Quick Start</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          Get your Excel spreadsheet running as an API in 3 simple steps.
                        </p>

                        <div style={{ marginBottom: '40px' }}>
                          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 1: Sign Up</h3>
                          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                            Create your account at <a href="https://spreadapi.io" style={{ color: '#9333EA' }}>spreadapi.io</a>.
                            Start with the free tier (100 API calls/month).
                          </p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 2: Upload Your Excel</h3>
                          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                            Create a new service and upload your .xlsx file via the dashboard. You can either upload an existing Excel file or create a new one directly in the SpreadAPI app.
                          </p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 3: Select Input and Output Cells</h3>
                          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                            Manually select which cells or areas should be inputs and outputs for your API. This gives you precise control over what data your API accepts and returns.
                          </p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 4: Publish Your Service</h3>
                          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                            After selecting your inputs and outputs, click "Publish Service" to make your API endpoint live and ready to use.
                          </p>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 5: Call Your API</h3>
                          <pre style={{
                            background: '#1a1a1a',
                            color: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            fontSize: '14px',
                            lineHeight: '1.6'
                          }}>
                            {`// JavaScript example
const response = await fetch('https://spreadapi.io/api/v1/services/my-calculator/execute', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: {
      quantity: 100,
      price: 50
    }
  })
});

const result = await response.json();
console.log(result.outputs); // Your Excel calculation results`}
                          </pre>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 6: Use with AI (Optional)</h3>
                          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                            Once your service is published, you can also use it with AI assistants through the MCP server integration.
                            This allows Claude and other AI tools to execute your Excel calculations. See the <a href="#mcp-protocol" style={{ color: '#9333EA' }}>MCP Protocol</a> section for setup instructions.
                          </p>
                        </div>
                      </section>

                      {/* Authentication */}
                      <section id="authentication" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Authentication</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          All API requests require authentication using your API key.
                        </p>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Getting Your API Key</h3>
                        <ol style={{ paddingLeft: '20px', marginBottom: '32px' }}>
                          <li style={{ marginBottom: '8px', color: '#666' }}>Log in to your SpreadAPI dashboard</li>
                          <li style={{ marginBottom: '8px', color: '#666' }}>Navigate to API Keys section</li>
                          <li style={{ marginBottom: '8px', color: '#666' }}>Create a new API key</li>
                          <li style={{ marginBottom: '8px', color: '#666' }}>Copy and store it securely</li>
                        </ol>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Using Your API Key</h3>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                          Include your API key in the Authorization header of all requests:
                        </p>
                        <pre style={{
                          background: '#1a1a1a',
                          color: '#fff',
                          padding: '20px',
                          borderRadius: '8px',
                          overflowX: 'auto',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}>
                          {`Authorization: Bearer YOUR_API_KEY`}
                        </pre>

                        <div style={{
                          background: '#FEF3C7',
                          border: '1px solid #F59E0B',
                          borderRadius: '8px',
                          padding: '16px 20px',
                          marginTop: '24px'
                        }}>
                          <p style={{ margin: 0, color: '#92400E' }}>
                            <strong>Security Tips:</strong>
                          </p>
                          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#92400E' }}>
                            <li>Never expose API keys in client-side code</li>
                            <li>Use environment variables for storing keys</li>
                            <li>Rotate keys regularly</li>
                            <li>Use different keys for development and production</li>
                          </ul>
                        </div>
                      </section>

                      {/* How It Works */}
                      <section id="how-it-works" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>How It Works</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          SpreadAPI uses an Excel-compatible calculation engine to execute your spreadsheet formulas server-side.
                          Your Excel logic stays intact and works exactly as designed.
                        </p>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>The Process</h3>
                        <ol style={{ paddingLeft: '20px', marginBottom: '32px' }}>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Upload:</strong> You upload your Excel file (.xlsx, .xls)
                          </li>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Configure:</strong> You manually select which cells are inputs and outputs
                          </li>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Publish:</strong> You publish the service to make it available
                          </li>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>API Creation:</strong> A unique endpoint is created for your spreadsheet
                          </li>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Execution:</strong> When called, the engine runs your formulas
                          </li>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Results:</strong> Calculated values are returned as JSON
                          </li>
                        </ol>

                        <div style={{
                          background: '#f3f4f6',
                          padding: '24px',
                          borderRadius: '8px'
                        }}>
                          <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Example Flow</h4>
                          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                            1. Upload: pricing-calculator.xlsx<br />
                            2. Inputs detected: B2 (quantity), B3 (discount)<br />
                            3. Outputs detected: E10 (total), E11 (unit_price)<br />
                            4. You select B2 and B3 as inputs, E10 and E11 as outputs<br />
                            5. Publish the service<br />
                            6. API endpoint: /services/pricing-calculator/execute<br />
                            7. Call with inputs → Get calculated outputs
                          </p>
                        </div>
                      </section>

                      {/* Services */}
                      <section id="services" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Services</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          Each Excel file you upload becomes a "service" - a standalone API endpoint that executes your spreadsheet calculations.
                        </p>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Service Properties</h3>
                        <ul style={{ paddingLeft: '20px', marginBottom: '32px' }}>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Name:</strong> Unique identifier for your service (e.g., "pricing-calculator")
                          </li>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Endpoint:</strong> REST API endpoint for executing calculations
                          </li>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Inputs:</strong> Cell references that accept input values
                          </li>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Outputs:</strong> Cell references that return calculated results
                          </li>
                        </ul>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Managing Services</h3>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                          You can manage your services through the dashboard:
                        </p>
                        <ul style={{ paddingLeft: '20px', color: '#666' }}>
                          <li style={{ marginBottom: '8px' }}>View all services and their usage</li>
                          <li style={{ marginBottom: '8px' }}>Update Excel files</li>
                          <li style={{ marginBottom: '8px' }}>Configure input/output mappings</li>
                          <li style={{ marginBottom: '8px' }}>Set permissions for AI access</li>
                          <li style={{ marginBottom: '8px' }}>Monitor API calls and performance</li>
                        </ul>
                      </section>

                      {/* Permissions */}
                      <section id="permissions" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Permissions</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          Control exactly what AI assistants and applications can do with your Excel data.
                        </p>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Permission Types</h3>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '16px',
                          marginBottom: '32px'
                        }}>
                          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                            <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>📖 Read Values</h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>AI can see cell values and results</p>
                          </div>
                          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                            <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>✏️ Write Values</h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>AI can update cell contents</p>
                          </div>
                          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                            <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>🔍 Read Formulas</h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>AI can see your formulas</p>
                          </div>
                          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                            <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>🛠️ Write Formulas</h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>AI can create new formulas</p>
                          </div>
                        </div>

                        <div style={{
                          background: '#E8F5E9',
                          border: '1px solid #4CAF50',
                          borderRadius: '8px',
                          padding: '16px 20px'
                        }}>
                          <p style={{ margin: 0, color: '#2E7D32' }}>
                            <strong>Best Practice:</strong> Only grant the minimum permissions needed.
                            Keep formulas hidden to protect your intellectual property.
                          </p>
                        </div>
                      </section>

                      {/* Upload Excel */}
                      <section id="upload-excel" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Create Your Excel Service</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          Upload an existing Excel file or create a new one directly in the SpreadAPI app, then define which cells or areas should be inputs and outputs.
                        </p>

                        <div style={{ marginBottom: '48px' }}>
                          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 1: Add Your Spreadsheet</h3>
                          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                            You have two options:
                          </p>
                          <ul style={{ paddingLeft: '20px', marginBottom: '32px', color: '#666' }}>
                            <li style={{ marginBottom: '8px' }}><strong>Upload existing file:</strong> Drag and drop your .xlsx or .xls file</li>
                            <li style={{ marginBottom: '8px' }}><strong>Create new:</strong> Start with a blank spreadsheet and build it in the app</li>
                          </ul>

                          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 2: Define Input Cells/Areas</h3>
                          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                            Select the cells that will receive data from API calls:
                          </p>
                          <ul style={{ paddingLeft: '20px', marginBottom: '32px', color: '#666' }}>
                            <li style={{ marginBottom: '8px' }}>Click on any cell (e.g., B2)</li>
                            <li style={{ marginBottom: '8px' }}>Click "Add as Input" button</li>
                            <li style={{ marginBottom: '8px' }}>Give it a meaningful name (e.g., "quantity", "price")</li>
                            <li style={{ marginBottom: '8px' }}>Set validation rules if needed</li>
                          </ul>

                          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 3: Define Output Cells/Areas</h3>
                          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                            Select cells containing formulas or results to return:
                          </p>
                          <ul style={{ paddingLeft: '20px', marginBottom: '32px', color: '#666' }}>
                            <li style={{ marginBottom: '8px' }}>Click on result cells (e.g., E10)</li>
                            <li style={{ marginBottom: '8px' }}>Click "Add as Output"</li>
                            <li style={{ marginBottom: '8px' }}>Name your outputs (e.g., "total", "monthly_payment")</li>
                            <li style={{ marginBottom: '8px' }}>Can select ranges for table outputs</li>
                          </ul>

                          <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 4: Publish</h3>
                          <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                            Click "Publish Service" to make your API endpoint live and ready to use.
                          </p>

                          <h4 style={{ fontSize: '16px', marginBottom: '12px', marginTop: '24px' }}>File Specifications</h4>
                          <ul style={{ paddingLeft: '20px', color: '#666' }}>
                            <li style={{ marginBottom: '8px' }}>Formats: .xlsx (Excel 2007+) or .xls (Excel 97-2003)</li>
                            <li style={{ marginBottom: '8px' }}>Maximum size: 10MB</li>
                            <li style={{ marginBottom: '8px' }}>All standard Excel formulas supported</li>
                          </ul>
                        </div>
                      </section>

                      {/* Execute Calculations */}
                      <section id="execute" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Execute Calculations</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          Execute your Excel calculations by calling your service endpoint.
                        </p>

                        <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Execute Service</h3>
                        <p style={{
                          fontFamily: 'monospace',
                          background: '#f3f4f6',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          marginBottom: '16px'
                        }}>
                          GET/POST /api/v1/services/{'{'}'service-id{'}'}/execute
                        </p>

                        <h4 style={{ fontSize: '16px', marginBottom: '12px', marginTop: '24px' }}>GET Request Example</h4>
                        <pre style={{
                          background: '#1a1a1a',
                          color: '#fff',
                          padding: '20px',
                          borderRadius: '8px',
                          overflowX: 'auto',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}>
                          {`GET /api/v1/services/pricing-calculator/execute?quantity=100&discount=0.15&customer_type=enterprise`}
                        </pre>

                        <h4 style={{ fontSize: '16px', marginBottom: '12px', marginTop: '24px' }}>POST Request Body</h4>
                        <pre style={{
                          background: '#1a1a1a',
                          color: '#fff',
                          padding: '20px',
                          borderRadius: '8px',
                          overflowX: 'auto',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}>
                          {`{
  "inputs": {
    "quantity": 100,
    "discount": 0.15,
    "customer_type": "enterprise"
  }
}`}
                        </pre>

                        <h4 style={{ fontSize: '16px', marginBottom: '12px', marginTop: '24px' }}>Response</h4>
                        <pre style={{
                          background: '#1a1a1a',
                          color: '#fff',
                          padding: '20px',
                          borderRadius: '8px',
                          overflowX: 'auto',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}>
                          {`{
  "serviceId": "pricing-calculator",
  "inputs": {
    "quantity": 100,
    "discount": 0.15,
    "customer_type": "enterprise"
  },
  "outputs": [
    {
      "type": "output",
      "name": "total",
      "value": 8500
    },
    {
      "type": "output",
      "name": "unit_price",
      "value": 85
    },
    {
      "type": "output",
      "name": "savings",
      "value": 1500
    }
  ],
  "metadata": {
    "executionTime": 23,
    "totalTime": 45,
    "timestamp": "2024-01-20T10:30:00Z",
    "version": "v1"
  }
}`}
                        </pre>

                        <h4 style={{ fontSize: '16px', marginBottom: '12px', marginTop: '24px' }}>Notes</h4>
                        <ul style={{ paddingLeft: '20px', color: '#666' }}>
                          <li style={{ marginBottom: '8px' }}>Input keys must match your configured input cells</li>
                          <li style={{ marginBottom: '8px' }}>Outputs will include all configured output cells</li>
                          <li style={{ marginBottom: '8px' }}>Results are cached for better performance</li>
                          <li style={{ marginBottom: '8px' }}>Excel errors (like #DIV/0!) are returned in the response</li>
                        </ul>
                      </section>

                      {/* Error Handling */}
                      <section id="error-handling" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Error Handling</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          SpreadAPI returns detailed error information to help you debug issues.
                        </p>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>API Errors</h3>
                        <pre style={{
                          background: '#1a1a1a',
                          color: '#fff',
                          padding: '20px',
                          borderRadius: '8px',
                          overflowX: 'auto',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          marginBottom: '24px'
                        }}>
                          {`// 400 Bad Request
{
  "error": "Invalid request",
  "message": "Request body must contain \"inputs\" object",
  "serviceId": "pricing-calculator",
  "inputs": null
}

// 404 Not Found
{
  "error": "Not found",
  "message": "Service not found or not published"
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "message": "Error details here"
}`}
                        </pre>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Excel Calculation Errors</h3>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                          When Excel formulas produce errors, they're returned in the response:
                        </p>
                        <pre style={{
                          background: '#1a1a1a',
                          color: '#fff',
                          padding: '20px',
                          borderRadius: '8px',
                          overflowX: 'auto',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}>
                          {`{
  "outputs": {
    "result": "#DIV/0!",
    "status": "#VALUE!"
  },
  "errors": {
    "result": "Division by zero in cell E10",
    "status": "Invalid value type in cell C5"
  }
}`}
                        </pre>
                      </section>

                      {/* MCP Protocol */}
                      <section id="mcp-protocol" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>MCP Protocol</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          The Model Context Protocol (MCP) enables AI assistants like Claude to interact with your Excel spreadsheets securely.
                        </p>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>What is MCP?</h3>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
                          MCP is a protocol that allows AI assistants to discover and use external tools. SpreadAPI implements MCP to let
                          AI assistants execute your Excel calculations without seeing your formulas.
                        </p>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>How It Works</h3>
                        <ol style={{ paddingLeft: '20px', marginBottom: '32px' }}>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Discovery:</strong> AI assistant discovers your available Excel services
                          </li>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Permissions:</strong> AI sees only what you've allowed (values, not formulas)
                          </li>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Execution:</strong> AI sends inputs, receives calculated outputs
                          </li>
                          <li style={{ marginBottom: '12px', color: '#666' }}>
                            <strong>Security:</strong> Your Excel logic stays on SpreadAPI servers
                          </li>
                        </ol>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Install MCP Server</h3>
                        <pre style={{
                          background: '#1a1a1a',
                          color: '#fff',
                          padding: '20px',
                          borderRadius: '8px',
                          overflowX: 'auto',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}>
                          {`npm install -g spreadapi-mcp`}
                        </pre>
                      </section>

                      {/* Claude Setup */}
                      <section id="claude-setup" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Claude Setup</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          Configure Claude Desktop to use your SpreadAPI services.
                        </p>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 1: Locate Config File</h3>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                          Find your Claude Desktop configuration file:
                        </p>
                        <ul style={{ paddingLeft: '20px', marginBottom: '24px', color: '#666' }}>
                          <li><strong>Mac:</strong> ~/Library/Application Support/Claude/claude_desktop_config.json</li>
                          <li><strong>Windows:</strong> %APPDATA%\\Claude\\claude_desktop_config.json</li>
                        </ul>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Step 2: Add SpreadAPI</h3>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                          Add this configuration to your claude_desktop_config.json:
                        </p>
                        <pre style={{
                          background: '#1a1a1a',
                          color: '#fff',
                          padding: '20px',
                          borderRadius: '8px',
                          overflowX: 'auto',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}>
                          {`{
  "mcpServers": {
    "spreadapi": {
      "command": "npx",
      "args": ["spreadapi-mcp"],
      "env": {
        "SPREADAPI_TOKEN": "YOUR_API_KEY",
        "SPREADAPI_URL": "https://spreadapi.io/api/mcp/bridge"
      }
    }
  }
}`}
                        </pre>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px', marginTop: '32px' }}>Step 3: Restart Claude</h3>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                          Restart Claude Desktop to load the configuration.
                        </p>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px', marginTop: '32px' }}>Usage Example</h3>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                          Once configured, you can ask Claude to use your Excel services:
                        </p>
                        <pre style={{
                          background: '#f3f4f6',
                          padding: '20px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          color: '#333'
                        }}>
                          {`User: "Calculate pricing for 500 units with enterprise discount"

Claude: "I'll calculate that using your pricing spreadsheet..."
[Executes pricing-calculator with quantity=500, customer_type=enterprise]

Claude: "Based on your Excel calculations:
- Unit price: $45
- Total: $22,500
- Savings: $2,500"`}
                        </pre>
                      </section>

                      {/* Limitations */}
                      <section id="limitations" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Limitations</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          SpreadAPI supports most Excel features, but there are some current limitations.
                        </p>

                        <div style={{
                          background: '#FEF3C7',
                          border: '1px solid #F59E0B',
                          borderRadius: '8px',
                          padding: '20px',
                          marginBottom: '32px'
                        }}>
                          <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#92400E' }}>Not Currently Supported:</h3>
                          <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400E' }}>
                            <li style={{ marginBottom: '8px' }}>VBA macros and custom functions</li>
                            <li style={{ marginBottom: '8px' }}>External data connections</li>
                            <li style={{ marginBottom: '8px' }}>Linked workbooks</li>
                            <li style={{ marginBottom: '8px' }}>Charts (data only, no visuals)</li>
                            <li style={{ marginBottom: '8px' }}>Excel add-ins</li>
                            <li style={{ marginBottom: '8px' }}>Files larger than 10MB</li>
                          </ul>
                        </div>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>What IS Supported</h3>
                        <ul style={{ paddingLeft: '20px', color: '#666' }}>
                          <li style={{ marginBottom: '8px' }}>✅ All standard Excel functions</li>
                          <li style={{ marginBottom: '8px' }}>✅ Array formulas and dynamic arrays</li>
                          <li style={{ marginBottom: '8px' }}>✅ Pivot tables (calculated values)</li>
                          <li style={{ marginBottom: '8px' }}>✅ Named ranges</li>
                          <li style={{ marginBottom: '8px' }}>✅ Multiple worksheets</li>
                          <li style={{ marginBottom: '8px' }}>✅ Data validation</li>
                          <li style={{ marginBottom: '8px' }}>✅ Conditional formatting (as metadata)</li>
                        </ul>
                      </section>

                      {/* Pricing */}
                      <section id="pricing" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Pricing</h2>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                          Simple, transparent pricing that scales with your usage.
                        </p>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '24px',
                          marginBottom: '32px'
                        }}>
                          <div style={{
                            background: '#f8f9fa',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Free</h3>
                            <p style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>$0<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/month</span></p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                              <li style={{ marginBottom: '8px', color: '#666' }}>✓ 1 Excel API</li>
                              <li style={{ marginBottom: '8px', color: '#666' }}>✓ 100 API calls/month</li>
                              <li style={{ marginBottom: '8px', color: '#666' }}>✓ Community support</li>
                            </ul>
                          </div>

                          <div style={{
                            background: '#f8f9fa',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '2px solid #9333EA'
                          }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Lite</h3>
                            <p style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>$29<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/month</span></p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                              <li style={{ marginBottom: '8px', color: '#666' }}>✓ 10 Excel APIs</li>
                              <li style={{ marginBottom: '8px', color: '#666' }}>✓ 10,000 API calls/month</li>
                              <li style={{ marginBottom: '8px', color: '#666' }}>✓ Priority support</li>
                              <li style={{ marginBottom: '8px', color: '#666' }}>✓ AI Integration (MCP)</li>
                            </ul>
                          </div>

                          <div style={{
                            background: '#f8f9fa',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Pro</h3>
                            <p style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>$99<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/month</span></p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                              <li style={{ marginBottom: '8px', color: '#666' }}>✓ Unlimited Excel APIs</li>
                              <li style={{ marginBottom: '8px', color: '#666' }}>✓ 100,000 API calls/month</li>
                              <li style={{ marginBottom: '8px', color: '#666' }}>✓ Premium support</li>
                              <li style={{ marginBottom: '8px', color: '#666' }}>✓ SLA guarantee</li>
                            </ul>
                          </div>
                        </div>

                        <p style={{ fontSize: '16px', color: '#666', textAlign: 'center' }}>
                          Need more? <a href="mailto:info@airrange.io" style={{ color: '#9333EA' }}>Contact us</a> for Enterprise pricing.
                        </p>
                      </section>

                      {/* Support */}
                      <section id="support" style={{ marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Support</h2>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Getting Help</h3>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '24px',
                          marginBottom: '32px'
                        }}>
                          <div style={{
                            background: '#f8f9fa',
                            padding: '24px',
                            borderRadius: '8px'
                          }}>
                            <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>📧 Email Support</h4>
                            <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>Get help from our team</p>
                            <a href="mailto:team@airrange.io" style={{ color: '#9333EA' }}>team@airrange.io</a>
                          </div>

                          <div style={{
                            background: '#f8f9fa',
                            padding: '24px',
                            borderRadius: '8px'
                          }}>
                            <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>💙 GitHub</h4>
                            <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>MCP server issues</p>
                            <a href="https://github.com/spreadapi/spreadapi-mcp" style={{ color: '#9333EA' }}>spreadapi-mcp</a>
                          </div>

                          <div style={{
                            background: '#f8f9fa',
                            padding: '24px',
                            borderRadius: '8px'
                          }}>
                            <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>📚 Documentation</h4>
                            <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>You are here!</p>
                            <a href="/docs" style={{ color: '#9333EA' }}>Read the docs</a>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Common Issues</h3>
                        <div style={{ marginBottom: '24px' }}>
                          <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>API Key Not Working</h4>
                          <ul style={{ paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
                            <li>Check for extra spaces in your API key</li>
                            <li>Ensure you're using "Bearer" prefix</li>
                            <li>Verify the key hasn't expired</li>
                          </ul>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                          <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Excel Formulas Not Working</h4>
                          <ul style={{ paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
                            <li>Check if you're using VBA (not supported)</li>
                            <li>Verify no external data connections</li>
                            <li>Ensure file is under 10MB</li>
                          </ul>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                          <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>MCP Not Connecting</h4>
                          <ul style={{ paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
                            <li>Verify SPREADAPI_TOKEN is set correctly</li>
                            <li>Check Claude Desktop is restarted</li>
                            <li>Ensure spreadapi-mcp is installed globally</li>
                          </ul>
                        </div>
                      </section>
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