import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../apps/api/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cosmostream',
});

async function checkCategories() {
  try {
    const result = await pool.query(`
      SELECT id, title, category, difficulty, s3_key
      FROM videos
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('📊 Video Categories Check:\n');

    for (const video of result.rows) {
      console.log(`Title: ${video.title}`);
      console.log(`  ID: ${video.id}`);
      console.log(`  Category: "${video.category}"`);
      console.log(`  Difficulty: "${video.difficulty}"`);
      console.log(`  S3 Key: ${video.s3_key}`);
      console.log('---');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

checkCategories();
