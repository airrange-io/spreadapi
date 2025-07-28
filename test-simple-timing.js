// Simple timing test to isolate the bottleneck

const startTime = Date.now();
const timings = [];

function logTiming(step) {
  const elapsed = Date.now() - startTime;
  timings.push({ step, elapsed });
  console.log(`[${elapsed}ms] ${step}`);
}

async function test() {
  logTiming('Start');
  
  // Test 1: Redis connection
  try {
    logTiming('Before Redis import');
    const redis = require('./lib/redis').default;
    logTiming('After Redis import');
    
    await redis.ping();
    logTiming('After Redis ping');
  } catch (e) {
    console.log('Redis error:', e.message);
  }
  
  // Test 2: SpreadJS module loading
  try {
    logTiming('Before SpreadJS require');
    const spreadjs = require('./lib/spreadjs-server');
    logTiming('After SpreadJS require');
    
    spreadjs.initializeSpreadJS();
    logTiming('After SpreadJS init');
    
    const wb = spreadjs.createWorkbook();
    logTiming('After create workbook');
  } catch (e) {
    console.log('SpreadJS error:', e.message);
  }
  
  // Test 3: Simple HTTP request
  try {
    logTiming('Before fetch');
    const response = await fetch('http://localhost:3000/api/health');
    logTiming('After fetch');
  } catch (e) {
    console.log('Fetch error:', e.message);
  }
  
  console.log('\nTotal time:', Date.now() - startTime, 'ms');
  console.log('\nBreakdown:');
  for (let i = 1; i < timings.length; i++) {
    const diff = timings[i].elapsed - timings[i-1].elapsed;
    console.log(`  ${timings[i-1].step} -> ${timings[i].step}: ${diff}ms`);
  }
}

test().catch(console.error);