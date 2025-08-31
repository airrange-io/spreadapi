'use server';

import { revalidateTag } from 'next/cache';
import redis from '@/lib/redis';
import { cookies } from 'next/headers';

export async function deleteServiceAction(serviceId: string, userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user ID from cookies or parameter
    // Note: In production, this should be verified with proper authentication
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Check if service exists
    const serviceData = await redis.hGetAll(`service:${serviceId}`);
    if (!serviceData || Object.keys(serviceData).length === 0) {
      return { success: false, error: 'Service not found' };
    }
    
    // Verify ownership
    if (serviceData.userId !== userId) {
      return { success: false, error: 'Unauthorized - you can only delete your own services' };
    }
    
    // Check if published
    const isPublished = await redis.exists(`service:${serviceId}:published`);
    if (isPublished) {
      return { success: false, error: 'Cannot delete published service. Unpublish first.' };
    }
    
    // Delete service
    await redis.del(`service:${serviceId}`);
    
    // Remove from user's services index
    await redis.hDel(`user:${userId}:services`, serviceId);
    
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