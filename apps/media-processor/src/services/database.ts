import { Pool } from 'pg';
import { logger } from '../utils/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function updateVideoStatus(videoId: string, status: string) {
  try {
    await pool.query(
      'UPDATE videos SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, videoId]
    );
    logger.info(`Updated video ${videoId} status to ${status}`);
  } catch (error) {
    logger.error('Database error:', error);
    throw error;
  }
}

export async function updateVideoMetadata(videoId: string, metadata: any) {
  try {
    const { manifestUrl, duration, thumbnailUrl } = metadata;
    await pool.query(
      `UPDATE videos
       SET manifest_url = $1, duration = $2, thumbnail_url = $3, status = 'ready', updated_at = NOW()
       WHERE id = $4`,
      [manifestUrl, duration, thumbnailUrl, videoId]
    );
    logger.info(`Updated video ${videoId} metadata`);
  } catch (error) {
    logger.error('Database error:', error);
    throw error;
  }
}
