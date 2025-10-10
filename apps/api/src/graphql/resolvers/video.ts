import { Context } from '../../context';
import { GraphQLError } from 'graphql';
import { generatePresignedUploadUrl } from '../../services/s3';
import { v4 as uuidv4 } from 'uuid';

export const videoResolvers = {
  Query: {
    async video(_: any, { id }: any, { db }: Context) {
      const result = await db.query(
        `SELECT id, title, description, creator_id, status, thumbnail_url,
                manifest_url, duration, tags, category, difficulty, views, likes,
                created_at, updated_at
         FROM videos WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
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
      { title, description, tags }: any,
      { user, db }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check if user is a creator
      const creatorCheck = await db.query(
        `SELECT approval_status FROM creator_profiles WHERE user_id = $1`,
        [user.id]
      );

      if (
        creatorCheck.rows.length === 0 ||
        creatorCheck.rows[0].approval_status !== 'approved'
      ) {
        throw new GraphQLError('Not authorized as creator', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const videoId = uuidv4();
      const key = `uploads/${user.id}/${videoId}/original.mp4`;

      // Generate presigned URL
      const uploadUrl = await generatePresignedUploadUrl(key);

      // Create video record
      await db.query(
        `INSERT INTO videos (id, title, description, creator_id, status, tags, s3_key)
         VALUES ($1, $2, $3, $4, 'uploading', $5, $6)`,
        [videoId, title, description || '', user.id, tags || [], key]
      );

      return {
        uploadUrl,
        videoId,
      };
    },

    async updateVideo(
      _: any,
      { id, title, description, tags }: any,
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

      updates.push(`updated_at = NOW()`);
      values.push(id);

      await db.query(
        `UPDATE videos SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );

      const result = await db.query(
        `SELECT id, title, description, creator_id, status, thumbnail_url,
                manifest_url, duration, tags, category, difficulty, views, likes,
                created_at, updated_at
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
      // Map snake_case to camelCase
      return parent.created_at;
    },

    updatedAt(parent: any) {
      // Map snake_case to camelCase
      return parent.updated_at;
    },

    thumbnailUrl(parent: any) {
      return parent.thumbnail_url;
    },

    manifestUrl(parent: any) {
      return parent.manifest_url;
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
