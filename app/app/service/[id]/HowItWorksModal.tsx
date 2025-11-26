'use client';

import React from 'react';
import { Modal, Button, Typography, Space, Alert } from 'antd';
import { InfoCircleOutlined, SwapOutlined, FileTextOutlined, TableOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined />
          <span>How SpreadAPI Works</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Got it!
        </Button>
      ]}
      centered
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Space orientation="vertical" style={{ width: '100%' }} size="large">
          {/* Overview */}
          <div>
            <Title level={4}>Overview</Title>
            <Paragraph>
              SpreadAPI transforms your spreadsheets into intelligent APIs and AI-powered calculation engines.
              Your spreadsheet becomes a living service that can accept inputs, perform complex calculations,
              and even allow AI to explore and modify data structures for advanced analysis.
            </Paragraph>
          </div>

          {/* Three Core Concepts */}
          <div>
            <Title level={4}>Three Core Concepts</Title>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <Space>
                  <SwapOutlined style={{ color: '#1890ff' }} />
                  1. Input Parameters
                </Space>
              </Title>
              <Paragraph>
                Input parameters are specific values that users or applications provide when calling your service.
                Think of them as function arguments - fixed entry points for data.
              </Paragraph>
              <ul style={{ paddingLeft: 24 }}>
                <li>Select any cell that should receive user input</li>
                <li>Click "Add as Input" to make it a parameter</li>
                <li>Give it a meaningful name (e.g., "interest_rate", "loan_amount")</li>
                <li>Set validation rules (min/max values, required/optional)</li>
                <li>Perfect for: single values, configuration options, user-provided data</li>
              </ul>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <Space>
                  <FileTextOutlined style={{ color: '#52c41a' }} />
                  2. Output Parameters
                </Space>
              </Title>
              <Paragraph>
                Output parameters are the calculated results that your API returns. These are the final
                values after all spreadsheet formulas have been calculated.
              </Paragraph>
              <ul style={{ paddingLeft: 24 }}>
                <li>Select cells containing formulas or calculated results</li>
                <li>Click "Add as Output"</li>
                <li>Name your outputs clearly (e.g., "monthly_payment", "total_interest")</li>
                <li>Can be single cells or ranges for tables/arrays</li>
                <li>Perfect for: calculation results, summary statistics, generated reports</li>
              </ul>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>
                <Space>
                  <TableOutlined style={{ color: '#fa8c16' }} />
                  3. Editable Areas (For AI)
                </Space>
              </Title>
              <Paragraph>
                Editable areas are intelligent spreadsheet regions that AI can explore, understand, and modify.
                Unlike simple parameters, areas preserve the spreadsheet's structure - formulas, relationships, and data patterns.
                AI can discover what's in an area and intelligently manipulate it.
              </Paragraph>
              <ul style={{ paddingLeft: 24 }}>
                <li>Select a meaningful range (e.g., a tax table, parameter grid, or data structure)</li>
                <li>Click "Add as Editable Area" and name it descriptively</li>
                <li>Set granular permissions (read values, write values, read/write formulas)</li>
                <li>AI automatically understands the area's purpose from its content</li>
                <li>Perfect for: lookup tables, configuration grids, what-if scenarios, data transformation</li>
              </ul>
              <Alert
                message="Key Insight"
                description="Areas let AI discover and work with your spreadsheet's intelligence. Instead of hardcoding every parameter, AI can explore a tax rate table, modify assumptions in a financial model, or adjust lookup values to test scenarios."
                type="success"
                style={{ marginTop: 8 }}
              />
            </div>
          </div>

          {/* How It Flows */}
          <div>
            <Title level={4}>The API Flow</Title>
            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
              <ol style={{ paddingLeft: 24, marginBottom: 0 }}>
                <li><strong>API Call Received</strong>: Your service receives a request with input values</li>
                <li><strong>Inputs Applied</strong>: Values are placed into the designated input cells</li>
                <li><strong>Calculation</strong>: Spreadsheet formulas automatically recalculate</li>
                <li><strong>Outputs Collected</strong>: Results are read from output cells</li>
                <li><strong>Response Sent</strong>: Calculated values are returned as JSON</li>
              </ol>
            </div>
          </div>

          {/* Examples */}
          <div>
            <Title level={4}>Example 1: Simple Loan Calculator (Parameters Only)</Title>
            <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>Inputs:</strong> loan_amount (B2), interest_rate (B3), years (B4)
              </Paragraph>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>Formula:</strong> Cell E2: =PMT(B3/12, B4*12, -B2)
              </Paragraph>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>Output:</strong> monthly_payment (E2)
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                <strong>API Call:</strong> <code>GET /api/v1/services/loan_calc?loan_amount=200000&interest_rate=0.045&years=30</code>
              </Paragraph>
            </div>

            <Title level={4}>Example 2: Tax Calculator with Editable Areas</Title>
            <div style={{ background: '#f0f5ff', padding: 16, borderRadius: 8 }}>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>Input Parameter:</strong> income (Cell B2)
              </Paragraph>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>Editable Area: "tax_brackets" (A10:C20)</strong>
              </Paragraph>
              <div style={{ background: '#fff', padding: 8, marginBottom: 8, borderRadius: 4 }}>
                <pre style={{ margin: 0, fontSize: 12 }}>
{`  A         B           C
10 Min      Max         Rate
11 0        10,000      10%
12 10,001   40,000      12%
13 40,001   85,000      22%
14 85,001   163,000     24%`}
                </pre>
              </div>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>AI Capabilities:</strong>
              </Paragraph>
              <ul style={{ paddingLeft: 24, marginBottom: 8 }}>
                <li>Read the tax brackets to understand the structure</li>
                <li>Modify rates to test different tax policies</li>
                <li>Add or remove brackets for scenario testing</li>
                <li>Update thresholds to see impact on calculations</li>
              </ul>
              <Paragraph style={{ marginBottom: 0 }}>
                <strong>AI Query Example:</strong> "What if we increased the top tax rate to 30%?"
              </Paragraph>
              <Alert
                message="AI automatically modifies cell C14 to 30%, recalculates, and shows the impact"
                type="info"
                style={{ marginTop: 8 }}
              />
            </div>
          </div>

          {/* Area vs Parameters */}
          <div>
            <Title level={4}>When to Use Areas vs Parameters</Title>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#f6ffed', padding: 16, borderRadius: 8 }}>
                <Title level={5}>Use Parameters When:</Title>
                <ul style={{ paddingLeft: 24, marginBottom: 0 }}>
                  <li>You have specific, known inputs</li>
                  <li>Values are single cells</li>
                  <li>Structure is fixed</li>
                  <li>Traditional API usage</li>
                  <li>Example: loan_amount, interest_rate</li>
                </ul>
              </div>
              <div style={{ background: '#fff7e6', padding: 16, borderRadius: 8 }}>
                <Title level={5}>Use Areas When:</Title>
                <ul style={{ paddingLeft: 24, marginBottom: 0 }}>
                  <li>You have tables or data structures</li>
                  <li>AI needs to explore/discover</li>
                  <li>Scenarios require flexibility</li>
                  <li>What-if analysis needed</li>
                  <li>Example: tax tables, pricing grids</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Publishing and Using */}
          <div>
            <Title level={4}>Publishing Your Service</Title>
            <Paragraph>
              Once you've defined your parameters:
            </Paragraph>
            <ol style={{ paddingLeft: 24 }}>
              <li>Click "Publish Service" to make it available</li>
              <li>Get your unique API endpoint</li>
              <li>Share with developers or configure for AI assistants</li>
              <li>Enable MCP integration for Claude and other AI tools</li>
            </ol>
          </div>

          {/* Making Your Service AI-Friendly */}
          <div>
            <Title level={4}>🤖 Making Your Service AI-Friendly</Title>
            <Alert
              message="Key to AI Success: Descriptions and Context"
              description="The more context you provide, the better AI can understand and use your service. Think of it as training your AI assistant."
              type="success"
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: 16 }}
            />
            
            <Title level={5}>Essential AI Context Fields</Title>
            <div style={{ marginBottom: 16 }}>
              <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 8, marginBottom: 12 }}>
                <Title level={5} style={{ marginTop: 0 }}>For Parameters (Inputs/Outputs):</Title>
                <ul style={{ paddingLeft: 24, marginBottom: 0 }}>
                  <li><strong>Title:</strong> Human-readable name (e.g., "Annual Interest Rate")</li>
                  <li><strong>Description:</strong> Explain what it is and provide examples
                    <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                      ✅ Good: "Annual interest rate as decimal (e.g., 0.05 for 5%, 0.075 for 7.5%)"<br/>
                      ❌ Poor: "interest rate"
                    </div>
                  </li>
                  <li><strong>Format hints:</strong> Specify units, ranges, formats
                    <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                      Examples: "USD currency", "percentage as decimal", "date in YYYY-MM-DD"
                    </div>
                  </li>
                </ul>
              </div>
              
              <div style={{ background: '#fff7e6', padding: 16, borderRadius: 8 }}>
                <Title level={5} style={{ marginTop: 0 }}>For Editable Areas:</Title>
                <ul style={{ paddingLeft: 24, marginBottom: 0 }}>
                  <li><strong>Description:</strong> What does this area contain?
                    <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                      Example: "Tax bracket table with income thresholds and rates"
                    </div>
                  </li>
                  <li><strong>AI Purpose:</strong> How should AI use this area?
                    <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                      Example: "Modify tax rates to test different policy scenarios"
                    </div>
                  </li>
                  <li><strong>Expected Behavior:</strong> What should AI do/not do?
                    <div style={{ marginLeft: 20, marginTop: 4, fontSize: 12, color: '#666' }}>
                      Example: "Keep rates between 0-50%, maintain progressive structure"
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <Title level={5}>Real Example: Mortgage Calculator</Title>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, fontSize: 13, fontFamily: 'monospace' }}>
              <strong>Input: loan_amount</strong><br/>
              Title: "Loan Principal Amount"<br/>
              Description: "Total loan amount in USD (e.g., 250000 for $250k home loan)"<br/>
              Min: 10000, Max: 10000000<br/>
              <br/>
              <strong>Input: interest_rate</strong><br/>
              Title: "Annual Interest Rate"<br/>
              Description: "Yearly interest as decimal (0.045 = 4.5%, 0.0525 = 5.25%)"<br/>
              Format: percentage<br/>
              <br/>
              <strong>Area: rate_adjustments</strong><br/>
              Description: "Interest rate adjustment table by credit score"<br/>
              AI Purpose: "Modify to test different lending scenarios"<br/>
              Expected: "Maintain realistic spreads, higher scores = lower rates"
            </div>

            <Alert
              message="Pro Tip: Think Like You're Training a New Employee"
              description="Write descriptions as if you're explaining to a smart colleague who doesn't know your specific domain. Include examples of valid values, explain abbreviations, and clarify any business logic."
              type="info"
              style={{ marginTop: 16 }}
            />
          </div>

          {/* AI Integration */}
          <div>
            <Title level={4}>AI Assistant Integration (MCP)</Title>
            <Paragraph>
              MCP (Model Context Protocol) enables AI assistants to become intelligent spreadsheet operators:
            </Paragraph>
            <ul style={{ paddingLeft: 24 }}>
              <li><strong>Service Discovery:</strong> AI automatically finds and understands your services</li>
              <li><strong>Natural Language:</strong> "Calculate my mortgage payment for $300k at 5%"</li>
              <li><strong>Intelligent Exploration:</strong> AI reads areas to understand your data structures</li>
              <li><strong>Dynamic Modification:</strong> AI modifies lookup tables, parameters, and formulas</li>
              <li><strong>What-If Analysis:</strong> "Show me if tax rates increased by 2%"</li>
              <li><strong>Complex Workflows:</strong> Combine multiple services and areas</li>
            </ul>
            <Alert
              message="Power User Tip"
              description="Create a 'scenarios' area where AI can save and compare different parameter sets. Or make your entire assumptions section an editable area so AI can perform comprehensive sensitivity analysis."
              type="success"
              style={{ marginTop: 16 }}
            />
          </div>

          {/* Best Practices */}
          <div>
            <Title level={4}>Best Practices</Title>
            
            <div style={{ background: '#e6fffb', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <Title level={5} style={{ marginTop: 0, color: '#006d75' }}>
                🌟 #1 Rule: Write Descriptions for Everything!
              </Title>
              <Paragraph style={{ marginBottom: 8 }}>
                The difference between a good API and a GREAT AI-powered service is documentation:
              </Paragraph>
              <ul style={{ paddingLeft: 24, marginBottom: 0 }}>
                <li>Every parameter needs a description with examples</li>
                <li>Every area needs purpose and expected behavior</li>
                <li>Include units, formats, and valid ranges</li>
                <li>Write like you're training a new team member</li>
              </ul>
            </div>
            
            <ul style={{ paddingLeft: 24 }}>
              <li><strong>Clear Naming</strong>: Use descriptive names ("tax_rate" not "input1")</li>
              <li><strong>Rich Descriptions</strong>: Include examples in every description field</li>
              <li><strong>Smart Validation</strong>: Set min/max values and mark optional parameters</li>
              <li><strong>Area Design</strong>: Create logical areas (entire tax table, not random cells)</li>
              <li><strong>AI Context</strong>: Fill in ALL AI context fields (purpose, expected behavior)</li>
              <li><strong>Error Handling</strong>: Use IFERROR() and data validation in formulas</li>
              <li><strong>Permission Strategy</strong>: Be thoughtful about what AI can modify</li>
              <li><strong>Test Scenarios</strong>: Try both API calls and AI interactions</li>
              <li><strong>Examples in Descriptions</strong>: "Interest rate as decimal (0.05 = 5%)" is better than "Interest rate"</li>
            </ul>
            <Alert
              message="Golden Rule"
              description="Design your areas as you would explain them to a colleague: 'This is our tax table', 'These are the configuration parameters', 'This grid calculates the results'. AI will understand and work with them intelligently."
              type="warning"
              style={{ marginTop: 16 }}
            />
          </div>
        </Space>
      </div>
    </Modal>
  );
};

export default HowItWorksModal;