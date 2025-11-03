/**
 * Video Statistics Checker
 * Shows current state of videos in the database
 */

import dotenv from 'dotenv';
dotenv.config();

import { pool } from '../src/db';

async function getVideoStats() {
  console.log('📊 CosmoStream Video Statistics\n');
  console.log('═'.repeat(60));

  // Total videos
  const totalResult = await pool.query('SELECT COUNT(*) as count FROM videos');
  console.log(`\n📹 Total Videos: ${totalResult.rows[0].count}`);

  // Videos by status
  const statusResult = await pool.query(`
    SELECT status, COUNT(*) as count
    FROM videos
    GROUP BY status
    ORDER BY count DESC
  `);

  console.log('\n📊 Videos by Status:');
  statusResult.rows.forEach(row => {
    console.log(`   ${row.status}: ${row.count}`);
  });

  // Videos by category (top 15)
  const categoryResult = await pool.query(`
    SELECT
      cc.name as category,
      COUNT(v.id) as video_count
    FROM content_categories cc
    LEFT JOIN videos v ON v.category = cc.slug
    WHERE v.id IS NOT NULL
    GROUP BY cc.name
    ORDER BY video_count DESC
    LIMIT 15
  `);

  console.log('\n🏆 Top 15 Categories by Video Count:');
  categoryResult.rows.forEach((row, index) => {
    console.log(`   ${index + 1}. ${row.category}: ${row.video_count} videos`);
  });

  // Categories without videos
  const emptyResult = await pool.query(`
    SELECT COUNT(DISTINCT cc.id) as count
    FROM content_categories cc
    INNER JOIN youtube_category_mappings ycm ON cc.id = ycm.category_id
    LEFT JOIN videos v ON v.category = cc.slug
    WHERE v.id IS NULL
  `);

  console.log(`\n❌ Mapped Categories with 0 Videos: ${emptyResult.rows[0].count}`);

  // Total views
  const viewsResult = await pool.query('SELECT SUM(views) as total FROM videos');
  console.log(`\n👀 Total Views: ${viewsResult.rows[0].total || 0}`);

  // Recent imports
  const recentResult = await pool.query(`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as count
    FROM videos
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `);

  if (recentResult.rows.length > 0) {
    console.log('\n📅 Recent Imports (Last 7 Days):');
    recentResult.rows.forEach(row => {
      console.log(`   ${row.date}: ${row.count} videos`);
    });
  }

  // YouTube sync jobs
  const syncResult = await pool.query(`
    SELECT
      DATE(completed_at) as date,
      COUNT(*) as jobs,
      SUM((result->>'videosImported')::int) as videos_imported
    FROM youtube_sync_jobs
    WHERE completed_at > NOW() - INTERVAL '7 days'
    GROUP BY DATE(completed_at)
    ORDER BY date DESC
  `);

  if (syncResult.rows.length > 0) {
    console.log('\n🔄 Recent YouTube Syncs (Last 7 Days):');
    syncResult.rows.forEach(row => {
      console.log(`   ${row.date}: ${row.jobs} jobs, ${row.videos_imported || 0} videos`);
    });
  }

  console.log('\n' + '═'.repeat(60) + '\n');

  await pool.end();
}

getVideoStats().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
