'use server';

import { revalidateTag } from 'next/cache';
import redis from '@/lib/redis';

const TEST_USER_ID = 'test1234';

export async function deleteServiceAction(serviceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if service exists
    const serviceData = await redis.hGetAll(`service:${serviceId}`);
    if (!serviceData || Object.keys(serviceData).length === 0) {
      return { success: false, error: 'Service not found' };
    }
    
    // Verify ownership
    if (serviceData.userId !== TEST_USER_ID) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Check if published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (isPublished) {
      return { success: false, error: 'Cannot delete published service. Unpublish first.' };
    }
    
    // Delete service
    await redis.del(`service:${serviceId}`);
    
    // Remove from user's services index
    await redis.hDel(`user:${TEST_USER_ID}:services`, serviceId);
    
    // Revalidate the services cache
    revalidateTag('services');
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteServiceAction:', error);
    return { success: false, error: 'Failed to delete service' };
  }
}

export async function revalidateServices() {
  revalidateTag('services');
}