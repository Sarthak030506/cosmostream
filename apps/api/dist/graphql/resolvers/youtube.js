"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeResolvers = void 0;
const graphql_1 = require("graphql");
const youtube_sync_1 = require("../../services/youtube-sync");
const youtube_1 = require("../../services/youtube");
exports.youtubeResolvers = {
    Query: {
        /**
         * Get YouTube sync status for a category or all categories
         */
        async youtubeSyncStatus(_, { categoryId }, { db, user }) {
            // Require authentication
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            // Only admins and creators can view sync status
            if (user.role !== 'admin' && user.role !== 'creator') {
                throw new graphql_1.GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            if (categoryId) {
                // Get status for specific category
                const result = await db.query(`SELECT
            ycm.category_id,
            cc.name as category_name,
            ycm.last_sync_at,
            EXTRACT(EPOCH FROM (NOW() - COALESCE(ycm.last_sync_at, '1970-01-01'::TIMESTAMP WITH TIME ZONE))) / 3600 as hours_since_sync,
            (SELECT COUNT(*) FROM content_items WHERE category_id = ycm.category_id AND source_type = 'youtube') as video_count,
            ycm.sync_enabled
           FROM youtube_category_mappings ycm
           INNER JOIN content_categories cc ON ycm.category_id = cc.id
           WHERE ycm.category_id = $1`, [categoryId]);
                if (result.rows.length === 0) {
                    return {
                        categoryId,
                        categoryName: null,
                        lastSyncAt: null,
                        hoursSinceSync: null,
                        videoCount: 0,
                        syncEnabled: false,
                    };
                }
                return result.rows[0];
            }
            else {
                // Get overall sync status
                const result = await db.query(`SELECT
            COUNT(*) as total_categories,
            SUM(CASE WHEN sync_enabled THEN 1 ELSE 0 END) as enabled_categories,
            MAX(last_sync_at) as most_recent_sync,
            (SELECT COUNT(*) FROM content_items WHERE source_type = 'youtube') as total_videos
           FROM youtube_category_mappings`);
                const row = result.rows[0];
                return {
                    categoryId: null,
                    categoryName: 'All Categories',
                    lastSyncAt: row.most_recent_sync,
                    hoursSinceSync: row.most_recent_sync
                        ? (Date.now() - new Date(row.most_recent_sync).getTime()) / (1000 * 60 * 60)
                        : null,
                    videoCount: parseInt(row.total_videos || '0', 10),
                    syncEnabled: true,
                };
            }
        },
        /**
         * Get recent YouTube sync jobs
         */
        async youtubeSyncJobs(_, { limit = 20 }, { user }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            if (user.role !== 'admin' && user.role !== 'creator') {
                throw new graphql_1.GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            const syncService = (0, youtube_sync_1.getYouTubeSyncService)();
            const jobs = await syncService.getRecentSyncJobs(limit);
            return jobs;
        },
        /**
         * Get YouTube API quota usage
         */
        async youtubeQuotaUsage(_, __, { user }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            if (user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized - admin only', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            const youtubeService = (0, youtube_1.getYouTubeService)();
            const quota = await youtubeService.getQuotaUsage();
            return {
                ...quota,
                date: new Date().toISOString().split('T')[0],
            };
        },
        /**
         * Get YouTube category mapping configuration
         */
        async youtubeCategoryMapping(_, { categoryId }, { db, user }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            if (user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized - admin only', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            const result = await db.query(`SELECT * FROM youtube_category_mappings WHERE category_id = $1`, [categoryId]);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        },
    },
    Mutation: {
        /**
         * Sync YouTube videos for a specific category
         */
        async syncYouTubeCategory(_, { categoryId, limit }, { user }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            if (user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized - admin only', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            const syncService = (0, youtube_sync_1.getYouTubeSyncService)();
            const result = await syncService.syncCategory(categoryId);
            return result;
        },
        /**
         * Sync all enabled YouTube categories (sequential)
         */
        async syncAllYouTubeCategories(_, { limit }, { user }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            if (user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized - admin only', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            const syncService = (0, youtube_sync_1.getYouTubeSyncService)();
            const results = await syncService.syncAllCategories(limit);
            return results;
        },
        /**
         * Sync YouTube categories in parallel (3-5x faster)
         */
        async syncAllYouTubeCategoriesParallel(_, { limit, concurrency = 3 }, { user }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            if (user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized - admin only', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            const syncService = (0, youtube_sync_1.getYouTubeSyncService)();
            const results = await syncService.syncAllCategoriesParallel(limit, concurrency);
            return {
                success: true,
                totalCategories: results.length,
                results,
            };
        },
        /**
         * Import a specific YouTube video
         */
        async importYouTubeVideo(_, { videoId, categoryId }, { user }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            if (user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized - admin only', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            const syncService = (0, youtube_sync_1.getYouTubeSyncService)();
            await syncService.importSingleVideo(videoId, categoryId);
            return true;
        },
        /**
         * Update YouTube category mapping keywords and channels
         */
        async updateYouTubeCategoryMapping(_, { categoryId, keywords, channels, }, { db, user }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            if (user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized - admin only', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            await db.query(`UPDATE youtube_category_mappings
         SET search_keywords = $1, channel_ids = $2, updated_at = NOW()
         WHERE category_id = $3`, [keywords, channels, categoryId]);
            const result = await db.query(`SELECT * FROM youtube_category_mappings WHERE category_id = $1`, [categoryId]);
            return result.rows[0];
        },
        /**
         * Blacklist a YouTube channel
         */
        async blacklistYouTubeChannel(_, { channelId, reason }, { db, user }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            if (user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized - admin only', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            // Get channel name from YouTube if possible
            try {
                const youtubeService = (0, youtube_1.getYouTubeService)();
                const channelInfo = await youtubeService.getChannelInfo(channelId);
                await db.query(`INSERT INTO youtube_channel_blacklist (channel_id, channel_name, reason, blacklisted_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (channel_id) DO UPDATE
           SET reason = $3, blacklisted_by = $4`, [channelId, channelInfo?.title || 'Unknown', reason, user.id]);
            }
            catch (error) {
                // If we can't get channel info, just blacklist with unknown name
                await db.query(`INSERT INTO youtube_channel_blacklist (channel_id, channel_name, reason, blacklisted_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (channel_id) DO UPDATE
           SET reason = $3, blacklisted_by = $4`, [channelId, 'Unknown', reason, user.id]);
            }
            return true;
        },
        /**
         * Blacklist a YouTube video
         */
        async blacklistYouTubeVideo(_, { videoId, reason }, { db, user }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            if (user.role !== 'admin') {
                throw new graphql_1.GraphQLError('Not authorized - admin only', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }
            // Get video title from YouTube if possible
            try {
                const youtubeService = (0, youtube_1.getYouTubeService)();
                const videos = await youtubeService.getVideoDetails([videoId]);
                await db.query(`INSERT INTO youtube_video_blacklist (youtube_video_id, video_title, reason, blacklisted_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (youtube_video_id) DO UPDATE
           SET reason = $3, blacklisted_by = $4`, [videoId, videos[0]?.title || 'Unknown', reason, user.id]);
            }
            catch (error) {
                await db.query(`INSERT INTO youtube_video_blacklist (youtube_video_id, video_title, reason, blacklisted_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (youtube_video_id) DO UPDATE
           SET reason = $3, blacklisted_by = $4`, [videoId, 'Unknown', reason, user.id]);
            }
            return true;
        },
    },
    // Type resolvers
    YouTubeCategoryMapping: {
        categoryId(parent) {
            return parent.category_id;
        },
        async category(parent, _, { db }) {
            const result = await db.query('SELECT * FROM content_categories WHERE id = $1', [parent.category_id]);
            return result.rows[0] || null;
        },
        searchKeywords(parent) {
            return parent.search_keywords || [];
        },
        channelIds(parent) {
            return parent.channel_ids || [];
        },
        qualityThreshold(parent) {
            return parent.quality_threshold;
        },
        syncEnabled(parent) {
            return parent.sync_enabled;
        },
        syncFrequency(parent) {
            return parent.sync_frequency;
        },
        maxVideosPerSync(parent) {
            return parent.max_videos_per_sync;
        },
        lastSyncAt(parent) {
            return parent.last_sync_at;
        },
        createdAt(parent) {
            return parent.created_at;
        },
        updatedAt(parent) {
            return parent.updated_at;
        },
    },
    YouTubeSyncJob: {
        categoryId(parent) {
            return parent.category_id;
        },
        categoryName(parent) {
            return parent.category_name;
        },
        jobType(parent) {
            return parent.job_type;
        },
        videosFetched(parent) {
            return parent.videos_fetched || 0;
        },
        videosImported(parent) {
            return parent.videos_imported || 0;
        },
        videosSkipped(parent) {
            return parent.videos_skipped || 0;
        },
        videosFailed(parent) {
            return parent.videos_failed || 0;
        },
        quotaCost(parent) {
            return parent.quota_cost || 0;
        },
        durationSeconds(parent) {
            return parent.duration_seconds;
        },
        errorMessage(parent) {
            return parent.error_message;
        },
        startedAt(parent) {
            return parent.started_at;
        },
        completedAt(parent) {
            return parent.completed_at;
        },
        createdAt(parent) {
            return parent.created_at;
        },
    },
    YouTubeSyncStatus: {
        categoryId(parent) {
            return parent.category_id;
        },
        categoryName(parent) {
            return parent.category_name;
        },
        lastSyncAt(parent) {
            return parent.last_sync_at;
        },
        hoursSinceSync(parent) {
            return parent.hours_since_sync ? parseFloat(parent.hours_since_sync) : null;
        },
        videoCount(parent) {
            return parseInt(parent.video_count || '0', 10);
        },
        syncEnabled(parent) {
            return parent.sync_enabled !== false;
        },
    },
};
//# sourceMappingURL=youtube.js.map