"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoResolvers = void 0;
const graphql_1 = require("graphql");
const s3_1 = require("../../services/s3");
const uuid_1 = require("uuid");
const video_queue_1 = require("../../services/video-queue");
exports.videoResolvers = {
    Query: {
        async video(_, { id }, { db }) {
            const result = await db.query(`SELECT id, title, description, creator_id, status, thumbnail_url,
                manifest_url, duration, file_size, processing_progress, error_message,
                tags, category, difficulty, views, likes,
                created_at, updated_at, completed_at
         FROM videos WHERE id = $1`, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        },
        async myVideos(_, { status = 'ALL', limit = 20, offset = 0 }, { user, db }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
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
            const params = [user.id];
            let paramCount = 2;
            if (status !== 'ALL') {
                query += ` AND status = $${paramCount++}`;
                params.push(status.toLowerCase());
            }
            // Get total count
            let countQuery = `SELECT COUNT(*) FROM videos WHERE creator_id = $1`;
            const countParams = [user.id];
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
        async videos(_, { limit = 20, offset = 0, category, tags }, { db }) {
            let query = `
        SELECT id, title, description, creator_id, status, thumbnail_url,
               manifest_url, duration, tags, category, difficulty, views, likes,
               created_at, updated_at
        FROM videos
        WHERE status = 'ready'
      `;
            const params = [];
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
        async searchVideos(_, { query, limit = 20, offset = 0 }, { db }) {
            // Simplified search - in production use Elasticsearch
            const result = await db.query(`SELECT id, title, description, creator_id, status, thumbnail_url,
                manifest_url, duration, tags, category, difficulty, views, likes,
                created_at, updated_at
         FROM videos
         WHERE status = 'ready'
           AND (title ILIKE $1 OR description ILIKE $1 OR $2 = ANY(tags))
         ORDER BY views DESC
         LIMIT $3 OFFSET $4`, [`%${query}%`, query, limit, offset]);
            return result.rows;
        },
    },
    Mutation: {
        async requestUploadUrl(_, { title, description, tags, category, difficulty }, { user, db }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            // All authenticated users can upload videos
            const videoId = (0, uuid_1.v4)();
            const key = `uploads/${user.id}/${videoId}/original.mp4`;
            // Generate presigned URL (1 hour expiry)
            const uploadUrl = await (0, s3_1.generatePresignedUploadUrl)(key, 3600);
            // Create video record
            await db.query(`INSERT INTO videos (id, title, description, creator_id, status, tags, category, difficulty, s3_key)
         VALUES ($1, $2, $3, $4, 'uploading', $5, $6, $7, $8)`, [videoId, title, description || '', user.id, tags || [], category, difficulty, key]);
            return {
                uploadUrl,
                videoId,
            };
        },
        async requestThumbnailUploadUrl(_, { videoId }, { user, db }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            // Check ownership
            const videoCheck = await db.query('SELECT creator_id FROM videos WHERE id = $1', [videoId]);
            if (videoCheck.rows.length === 0) {
                throw new graphql_1.GraphQLError('Video not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            if (videoCheck.rows[0].creator_id !== user.id && user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            const key = `thumbnails/${user.id}/${videoId}/custom-thumbnail.jpg`;
            const uploadUrl = await (0, s3_1.generatePresignedUploadUrl)(key, 1800, 'image/jpeg');
            return {
                uploadUrl,
                videoId,
            };
        },
        async completeVideoUpload(_, { videoId, fileSize }, { user, db }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            // Check ownership
            const videoCheck = await db.query('SELECT creator_id, s3_key FROM videos WHERE id = $1', [videoId]);
            if (videoCheck.rows.length === 0) {
                throw new graphql_1.GraphQLError('Video not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            if (videoCheck.rows[0].creator_id !== user.id) {
                throw new graphql_1.GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            // Update video with file size and mark as ready for processing
            await db.query(`UPDATE videos
         SET file_size = $1, status = 'processing', processing_progress = 0, updated_at = NOW()
         WHERE id = $2`, [fileSize, videoId]);
            // Add video to processing queue
            console.log(`📹 Adding video ${videoId} to processing queue...`);
            const job = await (0, video_queue_1.addVideoToProcessingQueue)({
                videoId: videoId,
                s3Key: videoCheck.rows[0].s3_key,
                priority: 10,
            });
            console.log(`✅ Video ${videoId} added to queue:`, job ? `Job ID ${job.id}` : 'Queue unavailable');
            // Return updated video
            const result = await db.query(`SELECT id, title, description, creator_id, status, thumbnail_url,
                manifest_url, duration, file_size, processing_progress, error_message,
                tags, category, difficulty, views, likes,
                created_at, updated_at, completed_at
         FROM videos WHERE id = $1`, [videoId]);
            return result.rows[0];
        },
        async updateVideo(_, { id, title, description, tags, category, difficulty, thumbnailUrl }, { user, db }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            // Check ownership
            const videoCheck = await db.query('SELECT creator_id FROM videos WHERE id = $1', [id]);
            if (videoCheck.rows.length === 0) {
                throw new graphql_1.GraphQLError('Video not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            if (videoCheck.rows[0].creator_id !== user.id && user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            const updates = [];
            const values = [];
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
            await db.query(`UPDATE videos SET ${updates.join(', ')} WHERE id = $${paramCount}`, values);
            const result = await db.query(`SELECT id, title, description, creator_id, status, thumbnail_url,
                manifest_url, duration, file_size, processing_progress, error_message,
                tags, category, difficulty, views, likes,
                created_at, updated_at, completed_at
         FROM videos WHERE id = $1`, [id]);
            return result.rows[0];
        },
        async deleteVideo(_, { id }, { user, db }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            const videoCheck = await db.query('SELECT creator_id FROM videos WHERE id = $1', [id]);
            if (videoCheck.rows.length === 0) {
                throw new graphql_1.GraphQLError('Video not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            if (videoCheck.rows[0].creator_id !== user.id && user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            await db.query('DELETE FROM videos WHERE id = $1', [id]);
            return true;
        },
    },
    Video: {
        status(parent) {
            // Convert database lowercase status to GraphQL enum uppercase
            return parent.status.toUpperCase();
        },
        createdAt(parent) {
            return parent.created_at;
        },
        updatedAt(parent) {
            return parent.updated_at;
        },
        completedAt(parent) {
            return parent.completed_at;
        },
        thumbnailUrl(parent) {
            return parent.thumbnail_url;
        },
        manifestUrl(parent) {
            return parent.manifest_url;
        },
        fileSize(parent) {
            return parent.file_size;
        },
        processingProgress(parent) {
            return parent.processing_progress;
        },
        errorMessage(parent) {
            return parent.error_message;
        },
        async creator(parent, _, { db }) {
            const result = await db.query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [parent.creator_id]);
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
//# sourceMappingURL=video.js.map