import { Context } from '../../context';
import { GraphQLError } from 'graphql';
import { generatePresignedUploadUrl } from '../../services/s3';
import { v4 as uuidv4 } from 'uuid';
import { addVideoToProcessingQueue } from '../../services/video-queue';

export const videoResolvers = {
  Query: {
    async video(_: any, { id }: any, { db }: Context) {
      const result = await db.query(
        `SELECT id, title, description, creator_id, status, thumbnail_url,
                manifest_url, duration, file_size, processing_progress, error_message,
                tags, category, difficulty, views, likes,
                created_at, updated_at, completed_at
         FROM videos WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    },

    async myVideos(
      _: any,
      { status = 'ALL', limit = 20, offset = 0 }: any,
      { user, db }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Build query based on status filter
      let query = `
        SELECT id, title, description, creator_id, status, thumbnail_url,
               manifest_url, duration, file_size, processing_progress, error_message,
               tags, category, difficulty, views, likes,
               created_at, updated_at, completed_at
        FROM videos
        WHERE creator_id = $1
      `;
      const params: any[] = [user.id];
      let paramCount = 2;

      if (status !== 'ALL') {
        query += ` AND status = $${paramCount++}`;
        params.push(status.toLowerCase());
      }

      // Get total count
      let countQuery = `SELECT COUNT(*) FROM videos WHERE creator_id = $1`;
      const countParams: any[] = [user.id];
      if (status !== 'ALL') {
        countQuery += ` AND status = $2`;
        countParams.push(status.toLowerCase());
      }

      const countResult = await db.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      // Get paginated results
      query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return {
        items: result.rows,
        hasMore: offset + result.rows.length < totalCount,
        totalCount,
      };
    },

    async videos(
      _: any,
      { limit = 20, offset = 0, category, tags }: any,
      { db }: Context
    ) {
      let query = `
        SELECT id, title, description, creator_id, status, thumbnail_url,
               manifest_url, duration, tags, category, difficulty, views, likes,
               created_at, updated_at
        FROM videos
        WHERE status = 'ready'
      `;
      const params: any[] = [];
      let paramCount = 1;

      if (category) {
        query += ` AND category = $${paramCount++}`;
        params.push(category);
      }

      if (tags && tags.length > 0) {
        query += ` AND tags && $${paramCount++}`;
        params.push(tags);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    },

    async searchVideos(
      _: any,
      { query, limit = 20, offset = 0 }: any,
      { db }: Context
    ) {
      // Simplified search - in production use Elasticsearch
      const result = await db.query(
        `SELECT id, title, description, creator_id, status, thumbnail_url,
                manifest_url, duration, tags, category, difficulty, views, likes,
                created_at, updated_at
         FROM videos
         WHERE status = 'ready'
           AND (title ILIKE $1 OR description ILIKE $1 OR $2 = ANY(tags))
         ORDER BY views DESC
         LIMIT $3 OFFSET $4`,
        [`%${query}%`, query, limit, offset]
      );

      return result.rows;
    },
  },

  Mutation: {
    async requestUploadUrl(
      _: any,
      { title, description, tags, category, difficulty }: any,
      { user, db }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // All authenticated users can upload videos
      const videoId = uuidv4();
      const key = `uploads/${user.id}/${videoId}/original.mp4`;

      // Generate presigned URL (1 hour expiry)
      const uploadUrl = await generatePresignedUploadUrl(key, 3600);

      // Create video record
      await db.query(
        `INSERT INTO videos (id, title, description, creator_id, status, tags, category, difficulty, s3_key)
         VALUES ($1, $2, $3, $4, 'uploading', $5, $6, $7, $8)`,
        [videoId, title, description || '', user.id, tags || [], category, difficulty, key]
      );

      return {
        uploadUrl,
        videoId,
      };
    },

    async requestThumbnailUploadUrl(
      _: any,
      { videoId }: any,
      { user, db }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check ownership
      const videoCheck = await db.query(
        'SELECT creator_id FROM videos WHERE id = $1',
        [videoId]
      );

      if (videoCheck.rows.length === 0) {
        throw new GraphQLError('Video not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (videoCheck.rows[0].creator_id !== user.id && user.role !== 'admin') {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const key = `thumbnails/${user.id}/${videoId}/custom-thumbnail.jpg`;
      const uploadUrl = await generatePresignedUploadUrl(key, 1800, 'image/jpeg');

      return {
        uploadUrl,
        videoId,
      };
    },

    async completeVideoUpload(
      _: any,
      { videoId, fileSize }: any,
      { user, db }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check ownership
      const videoCheck = await db.query(
        'SELECT creator_id, s3_key FROM videos WHERE id = $1',
        [videoId]
      );

      if (videoCheck.rows.length === 0) {
        throw new GraphQLError('Video not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (videoCheck.rows[0].creator_id !== user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Update video with file size and mark as ready for processing
      await db.query(
        `UPDATE videos
         SET file_size = $1, status = 'processing', processing_progress = 0, updated_at = NOW()
         WHERE id = $2`,
        [fileSize, videoId]
      );

      // Add video to processing queue
      console.log(`📹 Adding video ${videoId} to processing queue...`);
      const job = await addVideoToProcessingQueue({
        videoId: videoId,
        s3Key: videoCheck.rows[0].s3_key,
        priority: 10,
      });
      console.log(`✅ Video ${videoId} added to queue:`, job ? `Job ID ${job.id}` : 'Queue unavailable');

      // Return updated video
      const result = await db.query(
        `SELECT id, title, description, creator_id, status, thumbnail_url,
                manifest_url, duration, file_size, processing_progress, error_message,
                tags, category, difficulty, views, likes,
                created_at, updated_at, completed_at
         FROM videos WHERE id = $1`,
        [videoId]
      );

      return result.rows[0];
    },

    async updateVideo(
      _: any,
      { id, title, description, tags, category, difficulty, thumbnailUrl }: any,
      { user, db }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check ownership
      const videoCheck = await db.query(
        'SELECT creator_id FROM videos WHERE id = $1',
        [id]
      );

      if (videoCheck.rows.length === 0) {
        throw new GraphQLError('Video not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (videoCheck.rows[0].creator_id !== user.id && user.role !== 'admin') {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (title) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }
      if (tags) {
        updates.push(`tags = $${paramCount++}`);
        values.push(tags);
      }
      if (category) {
        updates.push(`category = $${paramCount++}`);
        values.push(category);
      }
      if (difficulty) {
        updates.push(`difficulty = $${paramCount++}`);
        values.push(difficulty);
      }
      if (thumbnailUrl) {
        updates.push(`thumbnail_url = $${paramCount++}`);
        values.push(thumbnailUrl);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      await db.query(
        `UPDATE videos SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );

      const result = await db.query(
        `SELECT id, title, description, creator_id, status, thumbnail_url,
                manifest_url, duration, file_size, processing_progress, error_message,
                tags, category, difficulty, views, likes,
                created_at, updated_at, completed_at
         FROM videos WHERE id = $1`,
        [id]
      );

      return result.rows[0];
    },

    async deleteVideo(_: any, { id }: any, { user, db }: Context) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const videoCheck = await db.query(
        'SELECT creator_id FROM videos WHERE id = $1',
        [id]
      );

      if (videoCheck.rows.length === 0) {
        throw new GraphQLError('Video not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (videoCheck.rows[0].creator_id !== user.id && user.role !== 'admin') {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await db.query('DELETE FROM videos WHERE id = $1', [id]);
      return true;
    },
  },

  Video: {
    status(parent: any) {
      // Convert database lowercase status to GraphQL enum uppercase
      return parent.status.toUpperCase();
    },

    createdAt(parent: any) {
      return parent.created_at;
    },

    updatedAt(parent: any) {
      return parent.updated_at;
    },

    completedAt(parent: any) {
      return parent.completed_at;
    },

    thumbnailUrl(parent: any) {
      return parent.thumbnail_url;
    },

    manifestUrl(parent: any) {
      return parent.manifest_url;
    },

    fileSize(parent: any) {
      return parent.file_size;
    },

    processingProgress(parent: any) {
      return parent.processing_progress;
    },

    errorMessage(parent: any) {
      return parent.error_message;
    },

    async creator(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [parent.creator_id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toUpperCase(),
        createdAt: user.created_at,
      };
    },
  },
};
