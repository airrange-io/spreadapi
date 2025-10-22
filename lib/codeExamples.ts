/**
 * Code example generators for API integration
 * Extracted from IntegrationExamples.tsx for better organization and lazy loading
 */

export interface CodeExampleParams {
  serviceId: string;
  serviceName?: string;
  requireToken?: boolean;
  parameterValues?: Record<string, any>;
  inputs?: any[];
  outputs?: any[];
}

/**
 * Build V1 API URL with query parameters
 */
function buildV1Url(params: CodeExampleParams): string {
  const { serviceId, parameterValues = {}, requireToken } = params;
  const baseUrl = `https://spreadapi.io/api/v1/services/${serviceId}/execute`;
  const urlParams = new URLSearchParams();

  Object.entries(parameterValues).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.append(key, String(value));
    }
  });

  if (requireToken) {
    urlParams.append('token', 'YOUR_TOKEN_HERE');
  }

  return `${baseUrl}?${urlParams.toString()}`;
}

export function generateCurlExample(params: CodeExampleParams): string {
  const { serviceId, requireToken, parameterValues = {} } = params;
  const v1Url = buildV1Url(params);
  const paramsObj = JSON.stringify(parameterValues, null, 2);

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
}

export function generateJavaScriptExample(params: CodeExampleParams): string {
  const { serviceId, requireToken, parameterValues = {} } = params;
  const v1Url = buildV1Url(params);
  const paramsObj = JSON.stringify(parameterValues, null, 2);

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
}

export function generatePythonExample(params: CodeExampleParams): string {
  const { serviceId, requireToken, parameterValues = {} } = params;
  const v1Url = buildV1Url(params);
  const paramsObj = JSON.stringify(parameterValues, null, 2);

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
}

export function generateNodeJSExample(params: CodeExampleParams): string {
  const { serviceId, requireToken, parameterValues = {} } = params;
  const v1Url = buildV1Url(params);
  const paramsObj = JSON.stringify(parameterValues, null, 2);

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
}

export function generatePHPExample(params: CodeExampleParams): string {
  const { serviceId, requireToken, parameterValues = {} } = params;
  const v1Url = buildV1Url(params);
  const paramsObj = JSON.stringify(parameterValues, null, 2);

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
    echo "Results: \\n";
    foreach ($data['outputs'] as $key => $value) {
        echo "$key: $value\\n";
    }
} else {
    echo "Error: HTTP $httpCode\\n";
    echo $response;
}`;
}

export function generateExcelExample(params: CodeExampleParams): string {
  const { serviceId, requireToken, parameterValues = {} } = params;
  const v1Url = buildV1Url(params);

  const paramsList = Object.entries(parameterValues)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `"&${key}=" & ${key.toUpperCase()}`)
    .join(' & ');

  return `// Excel Integration Examples

// Method 1: WEBSERVICE Function (Excel 2013+)
// For single output value, use plain text format:
=WEBSERVICE("https://spreadapi.io/api/v1/services/${serviceId}/execute?${Object.entries(parameterValues).map(([k,v]) => `${k}=${v}`).join('&')}${requireToken ? '&token=YOUR_TOKEN_HERE' : ''}&_format=plain")

// Dynamic with cell references (assuming A1=${Object.values(parameterValues)[0] || 'value1'}, B1=${Object.values(parameterValues)[1] || 'value2'}, etc.):
=WEBSERVICE("https://spreadapi.io/api/v1/services/${serviceId}/execute?" ${paramsList ? '& ' + paramsList : ''} ${requireToken ? '& "&token=YOUR_TOKEN_HERE"' : ''} & "&_format=plain")

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
}

export function generateGoogleSheetsExample(params: CodeExampleParams): string {
  const { serviceId, requireToken, parameterValues = {} } = params;
  const v1Url = buildV1Url(params);

  return `// Google Sheets Integration

// Method 1: IMPORTDATA Function (for CSV format)
=IMPORTDATA("https://spreadapi.io/api/v1/services/${serviceId}/execute?${Object.entries(parameterValues).map(([k,v]) => `${k}=${v}`).join('&')}${requireToken ? '&token=YOUR_TOKEN_HERE' : ''}&_format=csv")

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
}

export function generatePostmanExample(params: CodeExampleParams): string {
  const { serviceId, requireToken, parameterValues = {} } = params;
  const v1Url = buildV1Url(params);
  const paramsObj = JSON.stringify(parameterValues, null, 2);

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
}

export function generateStandaloneUIHTML(params: CodeExampleParams): string {
  const { serviceId, serviceName, requireToken, parameterValues = {}, outputs = [] } = params;

  const inputFields = Object.entries(parameterValues)
    .map(([key, value]) => {
      const inputType = typeof value === 'number' ? 'number' : 'text';
      return `        <div class="form-group">
          <label for="${key}">${key.charAt(0).toUpperCase() + key.slice(1)}:</label>
          <input type="${inputType}" id="${key}" name="${key}" value="${value}" ${inputType === 'number' ? 'step="any"' : ''}>
        </div>`;
    })
    .join('\n');

  const jsInputs = Object.keys(parameterValues)
    .map(key => `        ${key}: document.getElementById('${key}').value`)
    .join(',\n');

  // Create output format map for formatting
  const outputFormats = outputs.reduce((acc: any, output: any) => {
    if (output.formatString) {
      acc[output.name] = output.formatString;
    }
    return acc;
  }, {});
  const outputFormatsJson = JSON.stringify(outputFormats);

  const resultFields = Object.keys(parameterValues).length > 0
    ? `// Handle both array and object output formats
        const outputsArray = Array.isArray(data.outputs) ? data.outputs : Object.entries(data.outputs).map(([k, v]) => ({name: k, value: v}));

        outputsArray.forEach((output) => {
          const row = document.createElement('div');
          row.className = 'result-row';

          // Extract output name and value
          const outputName = output.name || 'result';
          const label = output.title || output.name || outputName;
          const rawValue = output.value !== undefined ? output.value : output;

          // Apply formatting if available
          const displayValue = formatOutput(outputName, rawValue);

          row.innerHTML = \\\`
            <span class="result-label">\\\${label}:</span>
            <span class="result-value">\\\${displayValue}</span>
          \\\`;
          content.appendChild(row);
        });`
    : `content.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${serviceName || serviceId} Calculator</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 32px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h1 {
      font-size: 24px;
      color: #333;
      margin-bottom: 24px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      color: #555;
      font-size: 14px;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 15px;
      margin-bottom: 16px;
    }

    input:focus {
      outline: none;
      border-color: #502D80;
    }

    button {
      width: 100%;
      padding: 12px;
      background: #502D80;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
    }

    button:hover { background: #3d2260; }
    button:disabled { background: #ccc; cursor: not-allowed; }

    .results {
      margin-top: 24px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 6px;
      display: none;
    }

    .results.show { display: block; }

    .results h2 {
      font-size: 16px;
      color: #333;
      margin-bottom: 12px;
    }

    .result-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .result-row:last-child { border-bottom: none; }

    .result-value {
      font-weight: 600;
      color: #502D80;
    }

    .error {
      margin-top: 16px;
      padding: 12px;
      background: #fee;
      color: #c33;
      border-radius: 6px;
      display: none;
    }

    .error.show { display: block; }

    .meta {
      margin-top: 12px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${serviceName || serviceId}</h1>

    <form id="form">
${inputFields}
      <button type="submit" id="btn">Calculate</button>
    </form>

    <div class="error" id="error"></div>

    <div class="results" id="results">
      <h2>Results</h2>
      <div id="content"></div>
      <div class="meta">
        <span id="time"></span> •
        <a href="https://spreadapi.io" target="_blank" style="color: #502D80; text-decoration: none;">SpreadAPI</a>
      </div>
    </div>
  </div>

  <script>
    const form = document.getElementById('form');
    const btn = document.getElementById('btn');
    const results = document.getElementById('results');
    const content = document.getElementById('content');
    const error = document.getElementById('error');
    const time = document.getElementById('time');

    // Output format strings for each parameter
    const outputFormats = ${outputFormatsJson};

    // Format output values based on formatString
    function formatOutput(outputName, value) {
      if (typeof value !== 'number' || !outputFormats[outputName]) {
        return value;
      }

      const formatStr = outputFormats[outputName].trim();

      // Handle percentage formats: "0.00%", "0.0%"
      if (formatStr.includes('%')) {
        const decimals = (formatStr.match(/\\\\.0+/)?.[0].length || 1) - 1;
        return value.toFixed(decimals) + '%';
      }

      // Handle date format
      if (formatStr.toLowerCase() === 'date') {
        return new Date(value).toLocaleDateString();
      }

      // Parse the format string for currency/unit symbols and decimal places
      // Examples: "€#,##0.00", "$#,##0.00", "#,##0.0 kg", "#,##0 units"
      const prefixMatch = formatStr.match(/^([^#0,.\\\\s]+)/);
      const suffixMatch = formatStr.match(/([^#0,.\\\\s]+)$/);
      const decimalMatch = formatStr.match(/\\\\.0+/);
      const hasThousands = formatStr.includes(',');

      const decimals = decimalMatch ? decimalMatch[0].length - 1 : 0;
      const prefix = prefixMatch ? prefixMatch[1] : '';
      const suffix = suffixMatch && !prefixMatch ? suffixMatch[1] : '';

      // Format the number
      const formattedNum = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: hasThousands
      }).format(value);

      return prefix + formattedNum + suffix;
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      error.classList.remove('show');
      results.classList.remove('show');
      btn.disabled = true;
      btn.textContent = 'Calculating...';

      try {
        const res = await fetch('https://spreadapi.io/api/v1/services/${serviceId}/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'${requireToken ? ", 'Authorization': 'Bearer YOUR_TOKEN_HERE'" : ''} },
          body: JSON.stringify({
            inputs: {
${jsInputs}
            }
          })
        });

        if (!res.ok) throw new Error(\\\`Error: \\\${res.status}\\\`);

        const data = await res.json();
        content.innerHTML = '';

        ${resultFields}

        if (data.metadata) {
          time.textContent = \\\`\\\${data.metadata.executionTime}ms\\\`;
        }

        results.classList.add('show');

      } catch (err) {
        error.textContent = err.message;
        error.classList.add('show');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Calculate';
      }
    };
  </script>
</body>
</html>`;
}

/**
 * Get code example by language
 */
export function getCodeExample(language: string, params: CodeExampleParams): string {
  switch (language) {
    case 'curl':
      return generateCurlExample(params);
    case 'javascript':
      return generateJavaScriptExample(params);
    case 'python':
      return generatePythonExample(params);
    case 'nodejs':
      return generateNodeJSExample(params);
    case 'php':
      return generatePHPExample(params);
    case 'excel':
      return generateExcelExample(params);
    case 'googlesheets':
      return generateGoogleSheetsExample(params);
    case 'postman':
      return generatePostmanExample(params);
    case 'standalone':
      return generateStandaloneUIHTML(params);
    default:
      return '';
  }
}

/**
 * Get description for each language integration
 */
export function getLanguageDescription(language: string): string {
  const descriptions: Record<string, string> = {
    curl: 'Use cURL commands to test the API from the command line. Perfect for quick testing and debugging.',
    javascript: 'Integrate with JavaScript using the Fetch API. Works in modern browsers and supports both GET and POST requests.',
    python: 'Python integration using the popular requests library. Includes session management for multiple requests.',
    nodejs: 'Node.js examples using both axios and native fetch (Node.js 18+). Includes error handling patterns.',
    php: 'PHP integration with cURL for robust HTTP requests. Includes error handling and response parsing.',
    excel: 'Excel integration using WEBSERVICE function, Power Query, and VBA. Multiple approaches for different use cases.',
    googlesheets: 'Google Sheets integration using IMPORTDATA function and custom Apps Script functions.',
    postman: 'Import and test your API in Postman. Includes environment setup and test scripts.',
  };
  return descriptions[language] || 'Code example for API integration.';
}
