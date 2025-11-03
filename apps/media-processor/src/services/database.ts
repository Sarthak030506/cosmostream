import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../utils/logger';

// Load environment variables before creating pool
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../api/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cosmostream',
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

export async function createContentItemForVideo(videoId: string) {
  try {
    // Get video details
    const videoResult = await pool.query(
      `SELECT id, title, description, creator_id, tags, category, difficulty
       FROM videos WHERE id = $1`,
      [videoId]
    );

    if (videoResult.rows.length === 0) {
      throw new Error(`Video ${videoId} not found`);
    }

    const video = videoResult.rows[0];

    // Get or create default category if video doesn't have one
    let categoryId = video.category;

    if (!categoryId) {
      // Try to find a default "Videos" category
      const categoryResult = await pool.query(
        `SELECT id FROM content_categories WHERE slug = 'videos' LIMIT 1`
      );

      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      } else {
        // Create a default category if it doesn't exist
        const newCategoryResult = await pool.query(
          `INSERT INTO content_categories (name, slug, difficulty_level, age_group)
           VALUES ('Videos', 'videos', 'all', 'all')
           RETURNING id`
        );
        categoryId = newCategoryResult.rows[0].id;
      }
    }

    // Check if content item already exists for this video
    const existingContent = await pool.query(
      `SELECT id FROM content_items WHERE video_id = $1`,
      [videoId]
    );

    if (existingContent.rows.length > 0) {
      logger.info(`Content item already exists for video ${videoId}`);
      return existingContent.rows[0].id;
    }

    // Create content item
    const result = await pool.query(
      `INSERT INTO content_items (
        title, description, category_id, author_id, content_type,
        difficulty_level, age_group, tags, video_id, source_type
      )
      VALUES ($1, $2, $3, $4, 'video', $5, 'all', $6, $7, 'native')
      RETURNING id`,
      [
        video.title,
        video.description || '',
        categoryId,
        video.creator_id,
        video.difficulty || 'beginner',
        video.tags || [],
        videoId,
      ]
    );

    logger.info(`Created content item ${result.rows[0].id} for video ${videoId}`);
    return result.rows[0].id;
  } catch (error) {
    logger.error('Error creating content item:', error);
    throw error;
  }
}
