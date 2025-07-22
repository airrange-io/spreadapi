// Utility to safely revalidate services cache
export async function revalidateServicesCache() {
  try {
    if (typeof window === 'undefined') {
      // Only import on server side
      const { revalidateTag } = await import('next/cache');
      revalidateTag('services');
      console.log('Services cache revalidated');
    }
  } catch (error) {
    // Revalidation might not be available in all contexts
    console.log('Revalidation skipped:', error.message);
  }
}