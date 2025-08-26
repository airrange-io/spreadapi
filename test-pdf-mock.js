#!/usr/bin/env node

// Mock test to verify PDF generation client works
// This directly tests the PDF client without needing a real service

const http = require('http');
const crypto = require('crypto');

async function testPDFClient() {
  console.log('Testing PDF Client Generation Flow...\n');
  
  // Create mock spreadsheet JSON data
  const mockSpreadJSON = {
    version: "18.1.3",
    sheetCount: 1,
    activeSheetIndex: 0,
    sheets: {
      Sheet1: {
        name: "Sheet1",
        rowCount: 20,
        columnCount: 10,
        data: {
          dataTable: {
            0: { 
              0: { value: "PDF Generation Test" },
              1: { value: "Date:" },
              2: { value: new Date().toLocaleDateString() }
            },
            2: {
              0: { value: "Item" },
              1: { value: "Quantity" },
              2: { value: "Price" },
              3: { value: "Total" }
            },
            3: {
              0: { value: "Product A" },
              1: { value: 10 },
              2: { value: 25.50 },
              3: { value: 255.00, formula: "=B4*C4" }
            },
            4: {
              0: { value: "Product B" },
              1: { value: 5 },
              2: { value: 15.75 },
              3: { value: 78.75, formula: "=B5*C5" }
            },
            5: {
              0: { value: "Product C" },
              1: { value: 8 },
              2: { value: 32.00 },
              3: { value: 256.00, formula: "=B6*C6" }
            },
            7: {
              0: { value: "TOTAL" },
              3: { value: 589.75, formula: "=SUM(D4:D6)" }
            }
          }
        },
        // Set column widths
        columns: [
          { size: 120 },
          { size: 80 },
          { size: 80 },
          { size: 100 }
        ]
      }
    }
  };

  // Generate a PDF ID
  const pdfId = crypto.randomBytes(8).toString('hex');
  
  console.log('1. Mock PDF Data:');
  console.log('   PDF ID:', pdfId);
  console.log('   Service Name: Test Report');
  console.log('   Data includes: Test spreadsheet with 3 products\n');
  
  // Store mock data directly (bypassing the prepare endpoint)
  console.log('2. To test the PDF client directly:');
  console.log('   a) First, we need to store the mock data in Redis');
  console.log('   b) Then navigate to the PDF generation URL\n');
  
  console.log('3. Manual test steps:');
  console.log(`   - Store this data with key: pdf:${pdfId}`);
  console.log(`   - Navigate to: http://localhost:3000/pdf/${pdfId}`);
  console.log('   - Check browser console for generation logs');
  console.log('   - Verify PDF downloads with content\n');
  
  // Try to call the data endpoint to verify it exists
  const testDataUrl = `http://localhost:3000/api/pdf/${pdfId}/data`;
  console.log('4. Testing data endpoint:');
  console.log(`   URL: ${testDataUrl}\n`);
  
  // Return the mock data for manual testing
  return {
    pdfId,
    mockData: {
      spreadJSON: mockSpreadJSON,
      serviceName: 'Test Report',
      serviceId: 'test',
      inputs: { test: true },
      timestamp: Date.now()
    }
  };
}

// Helper to store data in Redis via a test endpoint
async function storeMockData(pdfId, data) {
  const storeData = JSON.stringify({
    pdfId,
    data
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/pdf/test-store',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': storeData.length
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`Failed to store: ${responseData}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(storeData);
    req.end();
  });
}

// Run the test
testPDFClient()
  .then((result) => {
    console.log('✅ Mock data prepared!');
    console.log('\n📋 Mock Data to Store in Redis:');
    console.log(JSON.stringify(result.mockData, null, 2));
    
    console.log('\n🔗 After storing in Redis, test at:');
    console.log(`   http://localhost:3000/pdf/${result.pdfId}`);
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });