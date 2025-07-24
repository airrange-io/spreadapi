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
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Overview */}
          <div>
            <Title level={4}>Overview</Title>
            <Paragraph>
              SpreadAPI turns your spreadsheets into powerful APIs that can be called by applications, AI assistants,
              or integrated into workflows. Your spreadsheet becomes a calculation engine that accepts inputs and returns outputs.
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
                Input parameters are values that users or applications provide when calling your service.
                Think of them as function arguments - you define which cells should receive these values.
              </Paragraph>
              <ul>
                <li>Select any cell in your spreadsheet</li>
                <li>Click "Add as Input" to make it a parameter</li>
                <li>Give it a meaningful name (e.g., "interest_rate", "loan_amount")</li>
                <li>Set validation rules (min/max values, required/optional)</li>
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
                Output parameters are the calculated results from your spreadsheet. These are the values
                returned when someone calls your API.
              </Paragraph>
              <ul>
                <li>Select cells containing formulas or results</li>
                <li>Click "Add as Output"</li>
                <li>Name your outputs (e.g., "monthly_payment", "total_interest")</li>
                <li>Can be single cells or ranges (like tables)</li>
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
                Editable areas are special regions that AI assistants can interact with directly.
                Unlike input/output parameters, these allow AI to read and modify multiple cells,
                including formulas.
              </Paragraph>
              <ul>
                <li>Select a range of cells (e.g., A1:D10)</li>
                <li>Click "Add as Editable Area"</li>
                <li>Set permissions (read-only, edit values, edit formulas)</li>
                <li>AI can experiment, analyze, and transform data within these areas</li>
              </ul>
            </div>
          </div>

          {/* How It Flows */}
          <div>
            <Title level={4}>The API Flow</Title>
            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
              <ol style={{ marginBottom: 0 }}>
                <li><strong>API Call Received</strong>: Your service receives a request with input values</li>
                <li><strong>Inputs Applied</strong>: Values are placed into the designated input cells</li>
                <li><strong>Calculation</strong>: Spreadsheet formulas automatically recalculate</li>
                <li><strong>Outputs Collected</strong>: Results are read from output cells</li>
                <li><strong>Response Sent</strong>: Calculated values are returned as JSON</li>
              </ol>
            </div>
          </div>

          {/* Example */}
          <div>
            <Title level={4}>Example: Loan Calculator</Title>
            <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 8 }}>
              <Paragraph style={{ marginBottom: 8 }}>
                <strong>Inputs:</strong>
              </Paragraph>
              <ul style={{ marginLeft: 20, marginBottom: 12 }}>
                <li>Cell B2: loan_amount (e.g., 200000)</li>
                <li>Cell B3: interest_rate (e.g., 0.045)</li>
                <li>Cell B4: years (e.g., 30)</li>
              </ul>

              <Paragraph style={{ marginBottom: 8 }}>
                <strong>Spreadsheet Formula:</strong>
              </Paragraph>
              <code style={{ display: 'block', marginBottom: 12, padding: 8, background: '#fff' }}>
                Cell E2: =PMT(B3/12, B4*12, -B2)
              </code>

              <Paragraph style={{ marginBottom: 8 }}>
                <strong>Output:</strong>
              </Paragraph>
              <ul style={{ marginLeft: 20, marginBottom: 12 }}>
                <li>Cell E2: monthly_payment (returns: 1013.37)</li>
              </ul>

              <Paragraph style={{ marginBottom: 0 }}>
                <strong>API Call:</strong>
              </Paragraph>
              <pre style={{ marginTop: 8, marginBottom: 0 }}>
                {`GET /api/getresults?api=loan_calc&loan_amount=200000&interest_rate=0.045&years=30

Response:
{
  "outputs": {
    "monthly_payment": 1013.37
  }
}`}
              </pre>
            </div>
          </div>

          {/* Publishing and Using */}
          <div>
            <Title level={4}>Publishing Your Service</Title>
            <Paragraph>
              Once you've defined your parameters:
            </Paragraph>
            <ol>
              <li>Click "Publish Service" to make it available</li>
              <li>Get your unique API endpoint</li>
              <li>Share with developers or configure for AI assistants</li>
              <li>Enable MCP integration for Claude and other AI tools</li>
            </ol>
          </div>

          {/* AI Integration */}
          <div>
            <Title level={4}>AI Assistant Integration (MCP)</Title>
            <Paragraph>
              When you enable MCP (Model Context Protocol), AI assistants like Claude can:
            </Paragraph>
            <ul>
              <li>Discover your available services automatically</li>
              <li>Call your API with natural language requests</li>
              <li>Work with editable areas to experiment and analyze</li>
              <li>Create complex workflows combining multiple services</li>
            </ul>
            <Alert
              message="Pro Tip"
              description="Editable areas are perfect for AI assistants to perform what-if analysis, data cleaning, or formula generation without affecting your main calculations."
              type="info"
              style={{ marginTop: 16 }}
            />
          </div>

          {/* Best Practices */}
          <div>
            <Title level={4}>Best Practices</Title>
            <ul>
              <li><strong>Clear Naming</strong>: Use descriptive names for parameters (not "input1")</li>
              <li><strong>Validation</strong>: Set min/max values to prevent errors</li>
              <li><strong>Documentation</strong>: Add descriptions to help users understand each parameter</li>
              <li><strong>Error Handling</strong>: Use IFERROR() in formulas for robustness</li>
              <li><strong>Test First</strong>: Try your API before publishing</li>
              <li><strong>AI Context</strong>: Provide clear descriptions for AI to understand your service</li>
            </ul>
          </div>
        </Space>
      </div>
    </Modal>
  );
};

export default HowItWorksModal;