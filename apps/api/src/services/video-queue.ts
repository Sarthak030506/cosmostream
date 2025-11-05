import Queue from 'bull';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Check if Redis is available - ALWAYS true since we have Redis running
const hasRedis = true; // Force enable since Redis is always running in Docker

// Initialize video processing queue (same queue as media-processor)
export const videoQueue = hasRedis
  ? new Queue('video-processing', REDIS_URL, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    })
  : null;

export async function addVideoToProcessingQueue(data: {
  videoId: string;
  s3Key: string;
  priority?: number;
}) {
  // Development mode: Skip queue if Redis is not configured
  if (!hasRedis || !videoQueue) {
    console.warn(
      '⚠️  Redis not configured. Video processing queue skipped in development mode.'
    );
    console.log(
      `📹 Video ${data.videoId} would be added to processing queue in production.`
    );
    return null;
  }

  // Production mode: Add to Bull queue
  const job = await videoQueue.add(data, {
    priority: data.priority || 10,
  });

  console.log(`✅ Added video ${data.videoId} to processing queue (Job ID: ${job.id})`);
  return job;
}
