#!/usr/bin/env node

// Test script to verify PDF generation flow
// Run with: node test-pdf-generation.js

const https = require('http');

async function testPDFGeneration() {
  console.log('Testing PDF Generation Flow...\n');
  
  // Step 1: Prepare test data
  // Using a simple service for testing
  // Note: This assumes 'mortgage' service exists, update to a valid service ID
  const testData = {
    serviceId: 'mortgage',  // Update this to a valid service in your system
    inputs: {
      price: 500000,
      downpayment: 100000,
      interestrate: 4.5,
      years: 30
    }
  };

  // Step 2: Call prepare endpoint
  console.log('1. Calling /api/pdf/prepare endpoint...');
  console.log('   Service ID:', testData.serviceId);
  console.log('   Inputs:', JSON.stringify(testData.inputs, null, 2));
  
  const prepareData = JSON.stringify(testData);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/pdf/prepare',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': prepareData.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('   Response status:', res.statusCode);
          
          if (res.statusCode === 200) {
            console.log('   PDF ID:', response.pdfId);
            console.log('   Success: PDF data stored in Redis\n');
            
            // Step 3: Generate URL for PDF generation
            const pdfUrl = `http://localhost:3000/pdf/${response.pdfId}`;
            console.log('2. PDF Generation URL:');
            console.log(`   ${pdfUrl}\n`);
            
            console.log('3. To test PDF generation:');
            console.log('   - Open the URL above in your browser');
            console.log('   - The PDF should download automatically');
            console.log('   - Check that the PDF contains the calculation results\n');
            
            console.log('Test inputs were:');
            Object.entries(testData.inputs).forEach(([key, value]) => {
              console.log(`   - ${key}: ${value}`);
            });
            console.log('');
            
            resolve(response);
          } else {
            console.log('   Error:', response.error || 'Unknown error');
            reject(new Error(response.error || 'Failed to prepare PDF'));
          }
        } catch (e) {
          console.error('   Failed to parse response:', e.message);
          console.error('   Raw response:', data);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('   Request failed:', e.message);
      reject(e);
    });

    req.write(prepareData);
    req.end();
  });
}

// Run the test
testPDFGeneration()
  .then(() => {
    console.log('✅ PDF preparation test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ PDF preparation test failed:', error.message);
    process.exit(1);
  });