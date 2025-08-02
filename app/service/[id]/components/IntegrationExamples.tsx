'use client';

import React from 'react';
import { Tabs, Button, Typography, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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

  // New v1 API URL
  const buildV1Url = () => {
    const baseUrl = `https://spreadapi.io/api/v1/services/${serviceId}/execute`;
    const params = new URLSearchParams();
    
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
  const v1Url = buildV1Url();

  const getCodeExample = (language: string) => {
    const paramsObj = JSON.stringify(parameterValues, null, 2);
    const hasParams = Object.keys(parameterValues).some(key => parameterValues[key] !== undefined && parameterValues[key] !== null && parameterValues[key] !== '');
    
    switch (language) {
      case 'javascript':
        return `// JavaScript Fetch API Examples

// Method 1: GET Request (Simple, good for Excel/browser)
const response = await fetch('${v1Url}');
const data = await response.json();
console.log(data);

// Method 2: POST Request (Recommended for applications)
const postResponse = await fetch('https://spreadapi.io/api/v1/services/${serviceId}/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',${requireToken ? "\n    'Authorization': 'Bearer YOUR_TOKEN_HERE'" : ''}
  },
  body: JSON.stringify({
    inputs: ${paramsObj}
  })
});
const postData = await postResponse.json();
console.log(postData);

// Response format:
// {
//   "serviceId": "${serviceId}",
//   "inputs": ${paramsObj},
//   "outputs": {
//     "result1": 123.45,
//     "result2": "calculated value"
//   },
//   "metadata": {
//     "executionTime": 45,
//     "timestamp": "2024-01-15T10:30:00Z"
//   }
// }`;

      case 'python':
        return `# Python with requests library
import requests
import json

# Method 1: GET Request (Simple)
response = requests.get('${v1Url}')
data = response.json()
print(data)

# Method 2: POST Request (Recommended)
url = 'https://spreadapi.io/api/v1/services/${serviceId}/execute'
headers = {
    'Content-Type': 'application/json'${requireToken ? ",\n    'Authorization': 'Bearer YOUR_TOKEN_HERE'" : ''}
}
payload = {
    'inputs': ${paramsObj}
}

post_response = requests.post(url, headers=headers, json=payload)
post_data = post_response.json()
print(json.dumps(post_data, indent=2))

# Using session for multiple requests
session = requests.Session()
session.headers.update(headers)

# Execute multiple calculations
for value in [100, 200, 300]:
    payload['inputs']['amount'] = value
    response = session.post(url, json=payload)
    print(f"Result for {value}: {response.json()['outputs']}")`;

      case 'curl':
        return `# cURL Command Examples

# Method 1: GET Request
curl "${v1Url}"

# Method 2: POST Request with JSON body
curl -X POST https://spreadapi.io/api/v1/services/${serviceId}/execute \\
  -H "Content-Type: application/json" \\${requireToken ? "\n  -H \"Authorization: Bearer YOUR_TOKEN_HERE\" \\\\" : ''}
  -d '{
    "inputs": ${paramsObj}
  }'

# Pretty print the response
curl -X POST https://spreadapi.io/api/v1/services/${serviceId}/execute \\
  -H "Content-Type: application/json" \\${requireToken ? "\n  -H \"Authorization: Bearer YOUR_TOKEN_HERE\" \\\\" : ''}
  -d '{"inputs": ${paramsObj}}' | json_pp

# Save response to file
curl -X POST https://spreadapi.io/api/v1/services/${serviceId}/execute \\
  -H "Content-Type: application/json" \\${requireToken ? "\n  -H \"Authorization: Bearer YOUR_TOKEN_HERE\" \\\\" : ''}
  -d '{"inputs": ${paramsObj}}' \\
  -o response.json`;

      case 'nodejs':
        return `// Node.js Examples

// Using axios
const axios = require('axios');

// Method 1: GET Request
const getResponse = await axios.get('${v1Url}');
console.log(getResponse.data);

// Method 2: POST Request
const postResponse = await axios.post(
  'https://spreadapi.io/api/v1/services/${serviceId}/execute',
  {
    inputs: ${paramsObj}
  },
  {
    headers: {
      'Content-Type': 'application/json'${requireToken ? ",\n      'Authorization': 'Bearer YOUR_TOKEN_HERE'" : ''}
    }
  }
);
console.log(postResponse.data);

// Using native fetch (Node.js 18+)
const response = await fetch('https://spreadapi.io/api/v1/services/${serviceId}/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'${requireToken ? ",\n    'Authorization': 'Bearer YOUR_TOKEN_HERE'" : ''}
  },
  body: JSON.stringify({
    inputs: ${paramsObj}
  })
});
const data = await response.json();
console.log(data);

// Error handling example
try {
  const response = await axios.post(url, payload, config);
  console.log('Success:', response.data.outputs);
} catch (error) {
  console.error('Error:', error.response?.data || error.message);
}`;

      case 'php':
        return `// PHP Examples

// Method 1: GET Request
$url = '${v1Url}';
$response = file_get_contents($url);
$data = json_decode($response, true);
print_r($data);

// Method 2: POST Request with cURL
$curl = curl_init();

$payload = json_encode([
    'inputs' => ${paramsObj}
]);

curl_setopt_array($curl, [
    CURLOPT_URL => 'https://spreadapi.io/api/v1/services/${serviceId}/execute',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json'${requireToken ? ",\n        'Authorization: Bearer YOUR_TOKEN_HERE'" : ''}
    ],
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($httpCode == 200) {
    $data = json_decode($response, true);
    echo "Results: \n";
    foreach ($data['outputs'] as $key => $value) {
        echo "$key: $value\n";
    }
} else {
    echo "Error: HTTP $httpCode\n";
    echo $response;
}`;

      case 'postman':
        return `// Postman Configuration

// Method 1: GET Request
// 1. Create a new GET request
// 2. Set URL: ${v1Url}
// 3. Click "Send" to execute

// Method 2: POST Request (Recommended)
// 1. Create a new POST request
// 2. Set URL: https://spreadapi.io/api/v1/services/${serviceId}/execute
// 3. Go to "Body" tab
// 4. Select "raw" and "JSON"
// 5. Enter the following JSON:
{
  "inputs": ${paramsObj}
}
// 6. Headers tab (automatically adds Content-Type: application/json)${requireToken ? "\n// 7. Add Authorization header: Bearer YOUR_TOKEN_HERE" : ''}
// 8. Click "Send"

// Environment Variables Setup:
// 1. Create environment variables:
//    - baseUrl: https://spreadapi.io/api/v1
//    - serviceId: ${serviceId}${requireToken ? "\n//    - token: YOUR_TOKEN_HERE" : ''}
// 2. Use in requests: {{baseUrl}}/services/{{serviceId}}/execute

// Pre-request Script Example:
pm.environment.set("timestamp", new Date().toISOString());

// Tests Example:
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});
pm.test("Response has outputs", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('outputs');
});`;

      case 'excel':
        const paramsList = Object.entries(parameterValues)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => `"&${key}=" & ${key.toUpperCase()}`)
          .join(' & ');
          
        return `// Excel Integration Examples

// Method 1: WEBSERVICE Function (Excel 2013+)
// For single output value, use plain text format:
=WEBSERVICE("https://spreadapi.io/api/v1/services/${serviceId}/execute?${Object.entries(parameterValues).map(([k,v]) => `${k}=${v}`).join('&')}&_format=plain")

// Dynamic with cell references (assuming A1=${Object.values(parameterValues)[0] || 'value1'}, B1=${Object.values(parameterValues)[1] || 'value2'}, etc.):
=WEBSERVICE("https://spreadapi.io/api/v1/services/${serviceId}/execute?" ${paramsList ? '& ' + paramsList : ''} & "&_format=plain")

// Method 2: Power Query (Recommended for complex data)
// 1. Data > Get Data > From Other Sources > From Web
// 2. URL: ${v1Url}
// 3. Transform data as needed

// Power Query M Code:
let
    Source = Json.Document(
        Web.Contents(
            "https://spreadapi.io/api/v1/services/${serviceId}/execute",
            [
                Query = [${Object.entries(parameterValues).map(([k,v]) => `${k}="${v}"`).join(', ')}]
            ]
        )
    ),
    Outputs = Source[outputs]
in
    Outputs

// Method 3: VBA Macro
Sub ExecuteSpreadAPI()
    Dim http As Object
    Dim json As Object
    Dim url As String
    
    Set http = CreateObject("MSXML2.XMLHTTP")
    url = "${v1Url}"
    
    http.Open "GET", url, False
    http.send
    
    ' Parse JSON and put results in cells
    ' Requires JSON parser library or manual parsing
    If http.Status = 200 Then
        Range("A1").Value = "Success"
        Range("B1").Value = http.responseText
    Else
        Range("A1").Value = "Error: " & http.Status
    End If
End Sub

// Method 4: Using FILTERXML for parsing (creative workaround)
// First, get JSON response in A1:
=WEBSERVICE("${v1Url}")
// Then extract specific values (requires some JSON-to-XML transformation)`;

      case 'googlesheets':
        return `// Google Sheets Integration

// Method 1: IMPORTDATA Function (for CSV format)
=IMPORTDATA("https://spreadapi.io/api/v1/services/${serviceId}/execute?${Object.entries(parameterValues).map(([k,v]) => `${k}=${v}`).join('&')}&_format=csv")

// Method 2: Custom Google Apps Script Function
// Go to Extensions > Apps Script and add this code:

/**
 * Execute SpreadAPI service
 * @param {string} serviceId The service ID
 * @param {...} args Parameter names and values
 * @return {Array} The calculation results
 * @customfunction
 */
function SPREADAPI(serviceId, ...args) {
  // Build parameters from alternating name/value pairs
  const params = {};
  for (let i = 0; i < args.length; i += 2) {
    if (i + 1 < args.length) {
      params[args[i]] = args[i + 1];
    }
  }
  
  // Build URL
  const baseUrl = 'https://spreadapi.io/api/v1/services/';
  const url = baseUrl + serviceId + '/execute';
  
  // Make POST request
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify({ inputs: params })${requireToken ? ",\n    'headers': { 'Authorization': 'Bearer YOUR_TOKEN_HERE' }" : ''}
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
    
    // Return as 2D array for spreadsheet
    const outputs = data.outputs || {};
    return Object.entries(outputs).map(([key, value]) => [key, value]);
  } catch (error) {
    return [['Error', error.toString()]];
  }
}

// Usage in cell:
=SPREADAPI("${serviceId}"${Object.entries(parameterValues).map(([k,v]) => `, "${k}", ${typeof v === 'string' ? `"${v}"` : v}`).join('')})

// Method 3: IMPORTJSON Custom Function (install from GitHub)
// First install: https://github.com/bradjasper/ImportJSON
// Then use:
=ImportJSON("${v1Url}", "/outputs", "noHeaders")`;

      default:
        return '';
    }
  };

  const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
    // Map language names to syntax highlighter language identifiers
    const languageMap: Record<string, string> = {
      'vb': 'vbnet',
      'text': 'plaintext',
      'curl': 'bash'
    };
    
    const highlighterLanguage = languageMap[language] || language;
    
    return (
      <div style={{ position: 'relative' }}>
        <Button
          icon={<CopyOutlined />}
          size="small"
          onClick={() => copyToClipboard(code)}
          style={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
        >
          Copy
        </Button>
        <SyntaxHighlighter
          language={highlighterLanguage}
          style={vs2015}
          customStyle={{
            padding: '16px',
            paddingTop: '40px',
            borderRadius: '6px',
            fontSize: '13px',
            lineHeight: '1.5',
            margin: 0
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  };

  const tabItems = [
    {
      key: 'curl',
      label: 'cURL',
      children: <CodeBlock language="bash" code={getCodeExample('curl')} />
    },
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
      key: 'excel',
      label: 'Excel',
      children: <CodeBlock language="vb" code={getCodeExample('excel')} />
    },
    {
      key: 'googlesheets',
      label: 'Google Sheets',
      children: <CodeBlock language="javascript" code={getCodeExample('googlesheets')} />
    },
    {
      key: 'postman',
      label: 'Postman',
      children: <CodeBlock language="text" code={getCodeExample('postman')} />
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Code examples for integrating this service using the SpreadAPI v1 REST API. 
          Both GET (simple) and POST (recommended) methods are supported.
          {requireToken && ' Remember to replace YOUR_TOKEN_HERE with your actual API token.'}
        </Text>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <strong>GET method:</strong> Best for Excel, browser testing, and simple integrations<br/>
            <strong>POST method:</strong> Recommended for applications, supports complex data and better error handling
          </Text>
        </div>
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