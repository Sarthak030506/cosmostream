#!/usr/bin/env ts-node

/**
 * Reprocess Stuck Videos Script
 *
 * This script finds videos stuck in "processing" status and manually
 * adds them to the Bull queue for processing.
 *
 * Usage: npx ts-node scripts/reprocess-stuck-videos.ts
 */

import { Pool } from 'pg';
import Queue from 'bull';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from API
dotenv.config({ path: path.join(__dirname, '../apps/api/.env') });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cosmostream';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const pool = new Pool({ connectionString: DATABASE_URL });
const videoQueue = new Queue('video-processing', REDIS_URL);

async function main() {
  console.log('🔍 Finding stuck videos...\n');

  // Find videos stuck in processing
  const result = await pool.query(`
    SELECT id, title, s3_key, created_at
    FROM videos
    WHERE status = 'processing'
    ORDER BY created_at DESC
  `);

  const stuckVideos = result.rows;

  if (stuckVideos.length === 0) {
    console.log('✅ No stuck videos found! All videos are processing correctly.\n');
    await pool.end();
    await videoQueue.close();
    return;
  }

  console.log(`Found ${stuckVideos.length} stuck video(s):\n`);

  for (const video of stuckVideos) {
    console.log(`📹 ${video.title}`);
    console.log(`   ID: ${video.id}`);
    console.log(`   S3 Key: ${video.s3_key}`);
    console.log(`   Uploaded: ${video.created_at}`);
    console.log();
  }

  console.log('➕ Adding videos to processing queue...\n');

  for (const video of stuckVideos) {
    try {
      const job = await videoQueue.add({
        videoId: video.id,
        s3Key: video.s3_key,
        priority: 10,
      });

      console.log(`✅ Added "${video.title}" to queue (Job ID: ${job.id})`);
    } catch (error: any) {
      console.error(`❌ Failed to add "${video.title}":`, error.message);
    }
  }

  console.log('\n✨ Done! Videos are now in the processing queue.');
  console.log('📊 Check the queue status with: docker exec cosmostream-redis redis-cli LLEN bull:video-processing:waiting\n');

  await pool.end();
  await videoQueue.close();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
