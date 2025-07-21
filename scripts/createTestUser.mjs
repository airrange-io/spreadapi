import redis from '../lib/redis.js';

async function createTestUser() {
  const userId = 'test1234';
  const userData = {
    id: userId,
    email: 'test@example.com',
    name: 'Test User',
    tenantId: 'tenant1234',
    role: 'developer',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  try {
    // Create user record
    await redis.hSet(`user:${userId}`, userData);
    
    console.log(`✅ User created successfully:`);
    console.log(`   ID: ${userId}`);
    console.log(`   Tenant: ${userData.tenantId}`);
    
    // Verify by reading back
    const savedUser = await redis.hGetAll(`user:${userId}`);
    console.log('\n📋 Saved user data:', savedUser);
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await redis.quit();
  }
}

createTestUser();