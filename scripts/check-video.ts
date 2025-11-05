import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../apps/api/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cosmostream',
});

async function checkVideo() {
  try {
    const result = await pool.query(`
      SELECT
        id, title, status, manifest_url, s3_key, thumbnail_url,
        created_at
      FROM videos
      WHERE id = $1
    `, ['bdaf99d3-11ad-4822-a4ea-65a02c7bbaf5']);

    if (result.rows.length === 0) {
      console.log('❌ Video not found in database');
      await pool.end();
      return;
    }

    const video = result.rows[0];

    console.log('📊 Video Database Record:');
    console.log(JSON.stringify(video, null, 2));

    console.log('\n📊 Video Status Check:');
    console.log(`- ID: ${video.id}`);
    console.log(`- Title: ${video.title}`);
    console.log(`- Status: ${video.status}`);
    console.log(`- Has manifest_url: ${!!video.manifest_url}`);
    console.log(`- manifest_url: ${video.manifest_url}`);
    console.log(`- s3_key: ${video.s3_key}`);

    if (video.status === 'ready' && video.manifest_url) {
      console.log('\n✅ Video should be playable!');
      console.log('\n🧪 Testing S3 URL with curl...');

      // Test if URL is accessible
      const { exec } = require('child_process');
      exec(`curl -I "${video.manifest_url}"`, (error: any, stdout: string) => {
        if (error) {
          console.log('❌ Curl error:', error.message);
        } else {
          console.log('Response:');
          console.log(stdout);
        }
        pool.end();
      });
    } else {
      console.log('\n❌ Video NOT playable:');
      if (video.status !== 'ready') {
        console.log(`  - Status is "${video.status}" (expected "ready")`);
      }
      if (!video.manifest_url) {
        console.log('  - manifest_url is missing');
      }
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

checkVideo();
