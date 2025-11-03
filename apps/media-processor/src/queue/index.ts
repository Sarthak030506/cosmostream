import Queue from 'bull';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../utils/logger';
import { processVideoUpload } from '../processors/video';

// Ensure env is loaded
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../api/.env') });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const videoQueue = new Queue('video-processing', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export async function initializeQueue() {
  // Process video jobs
  videoQueue.process(async (job) => {
    logger.info(`Processing video job ${job.id}`, job.data);
    return processVideoUpload(job.data);
  });

  videoQueue.on('completed', (job, result) => {
    logger.info(`Job ${job.id} completed`, result);
  });

  videoQueue.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err);
  });

  logger.info('Video processing queue initialized');
}

export async function addVideoJob(data: any) {
  const job = await videoQueue.add(data, {
    priority: data.priority || 10,
  });

  logger.info(`Added video job ${job.id}`, data);
  return job;
}
