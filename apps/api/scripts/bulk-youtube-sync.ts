/**
 * Bulk YouTube Video Sync Script
 * Syncs thousands of videos across all mapped categories
 *
 * Usage:
 *   npx ts-node scripts/bulk-youtube-sync.ts [options]
 *
 * Options:
 *   --all              Sync all categories
 *   --category <slug>  Sync specific category
 *   --limit <number>   Max videos per category (default: 50)
 *   --parallel <number> Number of categories to sync in parallel (default: 3)
 */

import dotenv from 'dotenv';
dotenv.config();

import { pool } from '../src/db';
import { logger } from '../src/utils/logger';
import { initYouTubeSyncService } from '../src/services/youtube-sync';
import { initYouTubeService } from '../src/services/youtube';

type YouTubeSyncService = ReturnType<typeof initYouTubeSyncService>;

interface SyncOptions {
  all?: boolean;
  category?: string;
  limit?: number;
  parallel?: number;
}

function parseArgs(): SyncOptions {
  const args = process.argv.slice(2);
  const options: SyncOptions = {
    limit: 50,
    parallel: 3,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--all':
        options.all = true;
        break;
      case '--category':
        options.category = args[++i];
        break;
      case '--limit':
        options.limit = parseInt(args[++i]);
        break;
      case '--parallel':
        options.parallel = parseInt(args[++i]);
        break;
    }
  }

  return options;
}

async function getAllMappedCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
  const result = await pool.query(`
    SELECT DISTINCT
      cc.id,
      cc.name,
      cc.slug
    FROM content_categories cc
    INNER JOIN youtube_category_mappings ycm ON cc.id = ycm.category_id
    ORDER BY cc.name
  `);

  return result.rows;
}

async function getCategoryBySlug(slug: string): Promise<{ id: string; name: string; slug: string } | null> {
  const result = await pool.query(
    `
    SELECT cc.id, cc.name, cc.slug
    FROM content_categories cc
    INNER JOIN youtube_category_mappings ycm ON cc.id = ycm.category_id
    WHERE cc.slug = $1
    `,
    [slug]
  );

  return result.rows[0] || null;
}

async function updateCategoryMaxVideos(categoryId: string, maxVideos: number) {
  await pool.query(
    'UPDATE youtube_category_mappings SET max_videos_per_sync = $1 WHERE category_id = $2',
    [maxVideos, categoryId]
  );
}

async function syncCategoryWithRetry(
  syncService: YouTubeSyncService,
  categoryId: string,
  categoryName: string,
  retries: number = 3
): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await syncService.syncCategory(categoryId);
      return result;
    } catch (error) {
      if (attempt === retries) {
        logger.error(`Failed to sync ${categoryName} after ${retries} attempts:`, error);
        return {
          categoryId,
          categoryName,
          error: error instanceof Error ? error.message : String(error),
        };
      }
      logger.warn(`Retry ${attempt}/${retries} for ${categoryName}`);
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}

async function syncInBatches(
  syncService: YouTubeSyncService,
  categories: Array<{ id: string; name: string; slug: string }>,
  batchSize: number
) {
  const results = [];

  for (let i = 0; i < categories.length; i += batchSize) {
    const batch = categories.slice(i, i + batchSize);

    console.log(`\n🔄 Syncing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(categories.length / batchSize)}`);
    console.log(`   Categories: ${batch.map(c => c.name).join(', ')}`);

    const batchPromises = batch.map(category =>
      syncCategoryWithRetry(syncService, category.id, category.name)
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Progress update
    const totalImported = results.reduce((sum, r) => sum + (r.videosImported || 0), 0);
    const totalFetched = results.reduce((sum, r) => sum + (r.videosFetched || 0), 0);
    console.log(`   ✅ Batch complete. Total: ${totalImported} imported / ${totalFetched} fetched`);

    // Rate limiting pause between batches
    if (i + batchSize < categories.length) {
      console.log('   ⏸️  Cooling down for 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return results;
}

async function main() {
  console.log('🚀 CosmoStream Bulk YouTube Sync\n');
  console.log('═'.repeat(60));

  const options = parseArgs();

  console.log('\n📋 Options:');
  console.log(`   All categories: ${options.all ? 'Yes' : 'No'}`);
  if (options.category) console.log(`   Specific category: ${options.category}`);
  console.log(`   Max videos per category: ${options.limit}`);
  console.log(`   Parallel syncs: ${options.parallel}`);
  console.log('\n' + '═'.repeat(60) + '\n');

  try {
    // Initialize services
    initYouTubeService();
    const syncService = initYouTubeSyncService(pool, logger);
    let categories: Array<{ id: string; name: string; slug: string }>;

    if (options.category) {
      // Sync specific category
      const category = await getCategoryBySlug(options.category);
      if (!category) {
        console.error(`❌ Category with slug "${options.category}" not found or has no YouTube mapping`);
        process.exit(1);
      }
      categories = [category];
    } else if (options.all) {
      // Sync all categories
      categories = await getAllMappedCategories();
    } else {
      console.error('❌ Please specify --all or --category <slug>');
      process.exit(1);
    }

    console.log(`📊 Found ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'} to sync\n`);

    // Update max videos limit temporarily
    for (const category of categories) {
      await updateCategoryMaxVideos(category.id, options.limit!);
    }

    const startTime = Date.now();
    const results = await syncInBatches(syncService, categories, options.parallel!);
    const duration = Math.round((Date.now() - startTime) / 1000);

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('✅ Bulk Sync Complete!\n');
    console.log('📊 Summary:');
    console.log(`   Duration: ${duration}s (${Math.round(duration / 60)}min)`);
    console.log(`   Categories processed: ${results.length}`);

    const totalFetched = results.reduce((sum, r) => sum + (r.videosFetched || 0), 0);
    const totalImported = results.reduce((sum, r) => sum + (r.videosImported || 0), 0);
    const totalSkipped = results.reduce((sum, r) => sum + (r.videosSkipped || 0), 0);
    const totalFailed = results.reduce((sum, r) => sum + (r.videosFailed || 0), 0);
    const totalErrors = results.filter(r => r.error).length;

    console.log(`   Videos fetched: ${totalFetched}`);
    console.log(`   Videos imported: ${totalImported}`);
    console.log(`   Videos skipped: ${totalSkipped}`);
    console.log(`   Videos failed: ${totalFailed}`);
    console.log(`   Categories with errors: ${totalErrors}`);

    // Top performing categories
    console.log('\n🏆 Top 10 Categories by Videos Imported:');
    const topCategories = results
      .filter(r => !r.error)
      .sort((a, b) => (b.videosImported || 0) - (a.videosImported || 0))
      .slice(0, 10);

    topCategories.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.categoryName}: ${result.videosImported} videos`);
    });

    // Errors
    if (totalErrors > 0) {
      console.log('\n⚠️  Categories with Errors:');
      results.filter(r => r.error).forEach(result => {
        console.log(`   ❌ ${result.categoryName}: ${result.error}`);
      });
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✨ All done! Videos are now available in the database.');
    console.log('\n💡 To view imported videos, visit: http://localhost:3000/discover\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Bulk sync failed:', error);
    process.exit(1);
  }
}

main();
