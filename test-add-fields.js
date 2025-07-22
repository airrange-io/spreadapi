// Quick script to add the new fields to test without republishing
const Redis = require('redis');

async function addTestFields() {
  const redis = Redis.createClient({
    password: "I6j6oL7lwqJAHejOb4CDzv8DdQ9a1Q9J",
    socket: {
      host: "redis-10011.c250.eu-central-1-1.ec2.redns.redis-cloud.com",
      port: 10011
    }
  });
  
  await redis.connect();
  
  const serviceId = 'test1234_mdctzfumgsds0';
  
  // Add test inputs/outputs
  await redis.hSet(`service:${serviceId}:published`, {
    inputs: JSON.stringify([
      {
        name: "principal",
        type: "number",
        description: "Initial investment amount",
        mandatory: true,
        min: 0
      },
      {
        name: "rate",
        type: "number", 
        description: "Annual interest rate (as percentage)",
        mandatory: true,
        min: 0,
        max: 100
      },
      {
        name: "years",
        type: "number",
        description: "Investment period in years",
        mandatory: true,
        min: 0
      }
    ]),
    outputs: JSON.stringify([
      {
        name: "finalAmount",
        type: "number",
        description: "Final amount after compound interest"
      },
      {
        name: "totalInterest",
        type: "number",
        description: "Total interest earned"
      }
    ]),
    aiDescription: "Calculate compound interest on an investment over time",
    aiUsageExamples: JSON.stringify([
      "Calculate compound interest for $1000 at 5% for 10 years",
      "What will my $5000 investment be worth after 20 years at 7% interest?"
    ]),
    aiTags: JSON.stringify(["finance", "investment", "calculator", "compound interest"]),
    category: "finance"
  });
  
  console.log('✅ Added new fields to published service');
  
  await redis.disconnect();
}

addTestFields().catch(console.error);