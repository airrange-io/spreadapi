import redis from '../redis';
import type { PrintJob, CreatePrintJobParams, PrintJobStatus } from './types';

const PRINT_JOB_TTL = 24 * 60 * 60; // 24 hours in seconds
const PRINT_JOB_KEY_PREFIX = 'print:job:';
const USER_JOBS_KEY_PREFIX = 'print:user:';
const SERVICE_JOBS_KEY_PREFIX = 'print:service:';

function generateJobId(): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `pj_${timestamp}_${randomId}`;
}

export async function createPrintJob(params: CreatePrintJobParams): Promise<PrintJob> {
  const jobId = generateJobId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PRINT_JOB_TTL * 1000);

  const printJob: PrintJob = {
    id: jobId,
    serviceId: params.serviceId,
    userId: params.userId,
    inputs: params.inputs,
    token: params.token,
    status: 'pending',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    printSettings: params.printSettings || {
      orientation: 'portrait',
      fitToPage: true
    },
    metadata: params.metadata || {}
  };

  try {
    // Store the print job
    await redis.setEx(
      `${PRINT_JOB_KEY_PREFIX}${jobId}`,
      PRINT_JOB_TTL,
      JSON.stringify(printJob)
    );

    // Add to user's job set
    await redis.sAdd(`${USER_JOBS_KEY_PREFIX}${params.userId}:jobs`, jobId);
    await redis.expire(`${USER_JOBS_KEY_PREFIX}${params.userId}:jobs`, PRINT_JOB_TTL);

    // Add to service's job set
    await redis.sAdd(`${SERVICE_JOBS_KEY_PREFIX}${params.serviceId}:jobs`, jobId);
    await redis.expire(`${SERVICE_JOBS_KEY_PREFIX}${params.serviceId}:jobs`, PRINT_JOB_TTL);

    // Update daily statistics
    const dateKey = `print:stats:daily:${now.toISOString().split('T')[0]}`;
    await redis.incr(dateKey);
    await redis.expire(dateKey, 30 * 24 * 60 * 60); // 30 days

    return printJob;
  } catch (error) {
    console.error('Error creating print job:', error);
    throw new Error('Failed to create print job');
  }
}

export async function getPrintJob(jobId: string): Promise<PrintJob | null> {
  try {
    const data = await redis.get(`${PRINT_JOB_KEY_PREFIX}${jobId}`);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as PrintJob;
  } catch (error) {
    console.error('Error getting print job:', error);
    return null;
  }
}

export async function updatePrintJobStatus(
  jobId: string,
  status: PrintJob['status'],
  result?: PrintJob['result'],
  error?: string
): Promise<boolean> {
  try {
    const job = await getPrintJob(jobId);
    if (!job) {
      return false;
    }

    job.status = status;
    if (result) {
      job.result = result;
    }
    if (error) {
      job.error = error;
    }

    const ttl = await redis.ttl(`${PRINT_JOB_KEY_PREFIX}${jobId}`);
    if (ttl > 0) {
      await redis.setEx(
        `${PRINT_JOB_KEY_PREFIX}${jobId}`,
        ttl,
        JSON.stringify(job)
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating print job status:', error);
    return false;
  }
}

export async function getPrintJobStatus(jobId: string): Promise<PrintJobStatus | null> {
  const job = await getPrintJob(jobId);
  if (!job) {
    return null;
  }

  return {
    jobId: job.id,
    status: job.status,
    pdfUrl: job.result?.pdfUrl,
    expiresAt: job.expiresAt,
    error: job.error
  };
}

export async function getUserPrintJobs(userId: string): Promise<string[]> {
  try {
    const jobIds = await redis.sMembers(`${USER_JOBS_KEY_PREFIX}${userId}:jobs`);
    return jobIds;
  } catch (error) {
    console.error('Error getting user print jobs:', error);
    return [];
  }
}

export async function getServicePrintJobs(serviceId: string): Promise<string[]> {
  try {
    const jobIds = await redis.sMembers(`${SERVICE_JOBS_KEY_PREFIX}${serviceId}:jobs`);
    return jobIds;
  } catch (error) {
    console.error('Error getting service print jobs:', error);
    return [];
  }
}

export async function deletePrintJob(jobId: string): Promise<boolean> {
  try {
    const job = await getPrintJob(jobId);
    if (!job) {
      return false;
    }

    // Remove from Redis
    await redis.del(`${PRINT_JOB_KEY_PREFIX}${jobId}`);
    
    // Remove from user's job set
    await redis.sRem(`${USER_JOBS_KEY_PREFIX}${job.userId}:jobs`, jobId);
    
    // Remove from service's job set
    await redis.sRem(`${SERVICE_JOBS_KEY_PREFIX}${job.serviceId}:jobs`, jobId);
    
    return true;
  } catch (error) {
    console.error('Error deleting print job:', error);
    return false;
  }
}