// Quick script to test YouTube sync
import dotenv from 'dotenv';
dotenv.config();

import { pool } from './src/db/index.ts';
import { logger } from './src/utils/logger.ts';
import { initYouTubeService } from './src/services/youtube.ts';
import { initYouTubeSyncService } from './src/services/youtube-sync.ts';
import { initYouTubeContentFilter } from './src/utils/youtube-filters.ts';

async function testSync() {
  try {
    console.log('🔧 Initializing services...');

    // Initialize services
    initYouTubeService(pool, logger);
    initYouTubeContentFilter(logger);
    const syncService = initYouTubeSyncService(pool, logger);

    console.log('✅ Services initialized');
    console.log('🚀 Starting sync for "What Is Space?" category...');

    // Sync the "What Is Space?" category
    const result = await syncService.syncCategory('43912adb-fed7-4348-9250-eb04694b7567');

    console.log('\n✅ Sync completed!');
    console.log('-------------------');
    console.log(`Category: ${result.categoryName}`);
    console.log(`Videos Fetched: ${result.videosFetched}`);
    console.log(`Videos Imported: ${result.videosImported}`);
    console.log(`Videos Skipped: ${result.videosSkipped}`);
    console.log(`Videos Failed: ${result.videosFailed}`);
    console.log(`Quota Used: ${result.quotaCost}`);
    console.log(`Duration: ${result.durationSeconds}s`);

    if (result.errors.length > 0) {
      console.log('\n⚠️ Errors:');
      result.errors.forEach(err => console.log(`  - ${err}`));
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

testSync();
