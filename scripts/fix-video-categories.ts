import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../apps/api/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cosmostream',
});

async function fixCategories() {
  try {
    // Set all videos with UUID categories to NULL (they'll show no category badge)
    const result = await pool.query(`
      UPDATE videos
      SET category = NULL
      WHERE category ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      RETURNING id, title, category
    `);

    console.log(`✅ Fixed ${result.rowCount} videos with invalid UUID categories\n`);

    for (const video of result.rows) {
      console.log(`- ${video.title}: category set to NULL`);
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

fixCategories();
