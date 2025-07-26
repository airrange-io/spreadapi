'use client';

import React from 'react';
import { Tabs, Button, Typography, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface IntegrationExamplesProps {
  serviceId: string;
  requireToken?: boolean;
  parameterValues?: Record<string, any>;
}

const IntegrationExamples: React.FC<IntegrationExamplesProps> = ({
  serviceId,
  requireToken,
  parameterValues = {}
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  };

  const buildUrl = () => {
    const baseUrl = 'https://spreadapi.io/api/getresults';
    
    const params = new URLSearchParams();
    params.append('id', serviceId);
    
    Object.entries(parameterValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    if (requireToken) {
      params.append('token', 'YOUR_TOKEN_HERE');
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  const fullUrl = buildUrl();

  const getCodeExample = (language: string) => {
    switch (language) {
      case 'javascript':
        return `// JavaScript Fetch API
const response = await fetch('${fullUrl}');
const data = await response.json();
console.log(data);`;

      case 'python':
        return `# Python with requests
import requests

response = requests.get('${fullUrl}')
data = response.json()
print(data)`;

      case 'curl':
        return `# cURL command
curl "${fullUrl}"`;

      case 'nodejs':
        return `// Node.js with axios
const axios = require('axios');

const response = await axios.get('${fullUrl}');
console.log(response.data);`;

      case 'php':
        return `// PHP with cURL
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL => '${fullUrl}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`;

      case 'postman':
        return `// Postman Configuration
// 1. Create a new GET request
// 2. Set URL: ${fullUrl}
// 3. No headers required unless using authentication
// 4. Click "Send" to execute

// For authenticated requests:
// Add header: Authorization: Bearer YOUR_TOKEN
// Or use query parameter: ?token=YOUR_TOKEN`;

      case 'excel':
        return `// Excel Power Query
// 1. In Excel, go to Data > Get Data > From Other Sources > From Web
// 2. Enter URL: ${fullUrl}
// 3. Click OK and follow the import wizard

// Alternative using VBA:
Sub GetAPIData()
    Dim httpRequest As Object
    Set httpRequest = CreateObject("MSXML2.XMLHTTP")
    
    httpRequest.Open "GET", "${fullUrl}", False
    httpRequest.send
    
    ' Parse JSON response
    MsgBox httpRequest.responseText
End Sub`;

      default:
        return '';
    }
  };

  const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => (
    <div style={{ position: 'relative' }}>
      <Button
        icon={<CopyOutlined />}
        size="small"
        onClick={() => copyToClipboard(code)}
        style={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
      >
        Copy
      </Button>
      <pre style={{
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: '16px',
        paddingTop: '40px',
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '13px',
        lineHeight: '1.5',
        margin: 0
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );

  const tabItems = [
    {
      key: 'javascript',
      label: 'JavaScript',
      children: <CodeBlock language="javascript" code={getCodeExample('javascript')} />
    },
    {
      key: 'python',
      label: 'Python',
      children: <CodeBlock language="python" code={getCodeExample('python')} />
    },
    {
      key: 'curl',
      label: 'cURL',
      children: <CodeBlock language="bash" code={getCodeExample('curl')} />
    },
    {
      key: 'nodejs',
      label: 'Node.js',
      children: <CodeBlock language="javascript" code={getCodeExample('nodejs')} />
    },
    {
      key: 'php',
      label: 'PHP',
      children: <CodeBlock language="php" code={getCodeExample('php')} />
    },
    {
      key: 'postman',
      label: 'Postman',
      children: <CodeBlock language="text" code={getCodeExample('postman')} />
    },
    {
      key: 'excel',
      label: 'Excel',
      children: <CodeBlock language="vb" code={getCodeExample('excel')} />
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Code examples for integrating this API into your applications. 
          {requireToken && ' Remember to replace YOUR_TOKEN_HERE with your actual API token.'}
        </Text>
      </div>
      <Tabs 
        items={tabItems} 
        size="small"
        style={{ marginTop: 8 }}
      />
    </div>
  );
};

export default IntegrationExamples;