/**
 * Cleanup Orphaned Data Script
 * Finds and removes data that belongs to deleted users
 */

import redis from '../lib/redis.js';

async function findOrphanedServices() {
  console.log('🔍 Searching for orphaned services...');
  
  const orphaned = {
    services: [],
    tokens: [],
    analytics: []
  };
  
  try {
    // Get all service keys
    const serviceKeys = await redis.keys('service:*');
    
    for (const key of serviceKeys) {
      // Skip published/analytics keys
      if (key.includes(':published') || key.includes(':analytics')) continue;
      
      // Get service data
      const serviceData = await redis.hGetAll(key);
      const userId = serviceData.userId;
      
      if (!userId) {
        console.log(`⚠️  Service ${key} has no userId`);
        orphaned.services.push(key);
        continue;
      }
      
      // Check if user exists
      const userExists = await redis.exists(`user:${userId}`);
      if (!userExists) {
        console.log(`❌ Service ${key} belongs to non-existent user ${userId}`);
        orphaned.services.push(key);
        
        // Also mark related keys
        const serviceId = key.replace('service:', '');
        orphaned.services.push(`service:${serviceId}:published`);
        orphaned.services.push(`service:${serviceId}:analytics`);
      }
    }
    
    // Check for orphaned tokens
    const tokenKeys = await redis.keys('mcp:token:*');
    for (const key of tokenKeys) {
      const tokenData = await redis.hGetAll(key);
      const userId = tokenData.userId;
      
      if (!userId) {
        console.log(`⚠️  Token ${key} has no userId`);
        orphaned.tokens.push(key);
        continue;
      }
      
      const userExists = await redis.exists(`user:${userId}`);
      if (!userExists) {
        console.log(`❌ Token ${key} belongs to non-existent user ${userId}`);
        orphaned.tokens.push(key);
      }
    }
    
    return orphaned;
    
  } catch (error) {
    console.error('Error finding orphaned data:', error);
    throw error;
  }
}

async function cleanupOrphaned(orphaned, dryRun = true) {
  if (dryRun) {
    console.log('\n🔎 DRY RUN - No data will be deleted');
  } else {
    console.log('\n⚠️  ACTUAL RUN - Data will be deleted!');
  }
  
  console.log(`\nFound orphaned data:`);
  console.log(`- Services: ${orphaned.services.length}`);
  console.log(`- Tokens: ${orphaned.tokens.length}`);
  
  if (!dryRun && (orphaned.services.length > 0 || orphaned.tokens.length > 0)) {
    console.log('\n🗑️  Deleting orphaned data...');
    
    const multi = redis.multi();
    
    // Delete orphaned services
    orphaned.services.forEach(key => multi.del(key));
    
    // Delete orphaned tokens
    orphaned.tokens.forEach(key => multi.del(key));
    
    await multi.exec();
    
    console.log('✅ Cleanup complete!');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--execute');
  
  try {
    console.log('🚀 Starting orphaned data cleanup...\n');
    
    const orphaned = await findOrphanedServices();
    await cleanupOrphaned(orphaned, isDryRun);
    
    if (isDryRun) {
      console.log('\n💡 To actually delete orphaned data, run with --execute flag');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await redis.disconnect();
  }
}

main();