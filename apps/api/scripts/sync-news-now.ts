/**
 * Manual News Sync Script
 * Run this to immediately fetch news articles without waiting for cron
 */

import dotenv from 'dotenv';
dotenv.config();

import { pool } from '../src/db';
import { logger } from '../src/utils/logger';
import { initNewsSyncService } from '../src/services/news-sync';

async function syncNews() {
  console.log('🚀 Starting manual news sync...\n');

  try {
    // Initialize the news sync service
    const syncService = initNewsSyncService(pool, logger);

    // Fetch and import 50 latest articles
    const result = await syncService.syncLatestNews(50);

    console.log('\n✅ News sync completed!');
    console.log('═'.repeat(50));
    console.log(`📊 Results:`);
    console.log(`  • Articles fetched: ${result.articlesFetched}`);
    console.log(`  • Articles imported: ${result.articlesImported}`);
    console.log(`  • Articles skipped: ${result.articlesSkipped}`);
    console.log(`  • Articles failed: ${result.articlesFailed}`);
    console.log(`  • Duration: ${result.durationSeconds}s`);

    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      result.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    console.log('\n✨ News articles are now available at /news page!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to sync news:', error);
    process.exit(1);
  }
}

syncNews();
