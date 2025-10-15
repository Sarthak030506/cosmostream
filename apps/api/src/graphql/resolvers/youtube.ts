import { Context } from '../../context';
import { GraphQLError } from 'graphql';
import { getYouTubeSyncService } from '../../services/youtube-sync';
import { getYouTubeService } from '../../services/youtube';

export const youtubeResolvers = {
  Query: {
    /**
     * Get YouTube sync status for a category or all categories
     */
    async youtubeSyncStatus(
      _: any,
      { categoryId }: { categoryId?: string },
      { db, user }: Context
    ) {
      // Require authentication
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Only admins and creators can view sync status
      if (user.role !== 'admin' && user.role !== 'creator') {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (categoryId) {
        // Get status for specific category
        const result = await db.query(
          `SELECT
            ycm.category_id,
            cc.name as category_name,
            ycm.last_sync_at,
            EXTRACT(EPOCH FROM (NOW() - COALESCE(ycm.last_sync_at, '1970-01-01'::TIMESTAMP WITH TIME ZONE))) / 3600 as hours_since_sync,
            (SELECT COUNT(*) FROM content_items WHERE category_id = ycm.category_id AND source_type = 'youtube') as video_count,
            ycm.sync_enabled
           FROM youtube_category_mappings ycm
           INNER JOIN content_categories cc ON ycm.category_id = cc.id
           WHERE ycm.category_id = $1`,
          [categoryId]
        );

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
      } else {
        // Get overall sync status
        const result = await db.query(
          `SELECT
            COUNT(*) as total_categories,
            SUM(CASE WHEN sync_enabled THEN 1 ELSE 0 END) as enabled_categories,
            MAX(last_sync_at) as most_recent_sync,
            (SELECT SUM(video_count) FROM youtube_content_stats) as total_videos
           FROM youtube_category_mappings`
        );

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
    async youtubeSyncJobs(
      _: any,
      { limit = 20 }: { limit?: number },
      { user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (user.role !== 'admin' && user.role !== 'creator') {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const syncService = getYouTubeSyncService();
      const jobs = await syncService.getRecentSyncJobs(limit);

      return jobs;
    },

    /**
     * Get YouTube API quota usage
     */
    async youtubeQuotaUsage(_: any, __: any, { user }: Context) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (user.role !== 'admin') {
        throw new GraphQLError('Not authorized - admin only', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const youtubeService = getYouTubeService();
      const quota = await youtubeService.getQuotaUsage();

      return {
        ...quota,
        date: new Date().toISOString().split('T')[0],
      };
    },

    /**
     * Get YouTube category mapping configuration
     */
    async youtubeCategoryMapping(
      _: any,
      { categoryId }: { categoryId: string },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (user.role !== 'admin') {
        throw new GraphQLError('Not authorized - admin only', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const result = await db.query(
        `SELECT * FROM youtube_category_mappings WHERE category_id = $1`,
        [categoryId]
      );

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
    async syncYouTubeCategory(
      _: any,
      { categoryId, limit }: { categoryId: string; limit?: number },
      { user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (user.role !== 'admin') {
        throw new GraphQLError('Not authorized - admin only', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const syncService = getYouTubeSyncService();
      const result = await syncService.syncCategory(categoryId);

      return result;
    },

    /**
     * Sync all enabled YouTube categories (sequential)
     */
    async syncAllYouTubeCategories(
      _: any,
      { limit }: { limit?: number },
      { user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (user.role !== 'admin') {
        throw new GraphQLError('Not authorized - admin only', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const syncService = getYouTubeSyncService();
      const results = await syncService.syncAllCategories(limit);

      return results;
    },

    /**
     * Sync YouTube categories in parallel (3-5x faster)
     */
    async syncAllYouTubeCategoriesParallel(
      _: any,
      { limit, concurrency = 3 }: { limit?: number; concurrency?: number },
      { user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (user.role !== 'admin') {
        throw new GraphQLError('Not authorized - admin only', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const syncService = getYouTubeSyncService();
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
    async importYouTubeVideo(
      _: any,
      { videoId, categoryId }: { videoId: string; categoryId: string },
      { user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (user.role !== 'admin') {
        throw new GraphQLError('Not authorized - admin only', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const syncService = getYouTubeSyncService();
      await syncService.importSingleVideo(videoId, categoryId);

      return true;
    },

    /**
     * Update YouTube category mapping keywords and channels
     */
    async updateYouTubeCategoryMapping(
      _: any,
      {
        categoryId,
        keywords,
        channels,
      }: { categoryId: string; keywords: string[]; channels: string[] },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (user.role !== 'admin') {
        throw new GraphQLError('Not authorized - admin only', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await db.query(
        `UPDATE youtube_category_mappings
         SET search_keywords = $1, channel_ids = $2, updated_at = NOW()
         WHERE category_id = $3`,
        [keywords, channels, categoryId]
      );

      const result = await db.query(
        `SELECT * FROM youtube_category_mappings WHERE category_id = $1`,
        [categoryId]
      );

      return result.rows[0];
    },

    /**
     * Blacklist a YouTube channel
     */
    async blacklistYouTubeChannel(
      _: any,
      { channelId, reason }: { channelId: string; reason: string },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (user.role !== 'admin') {
        throw new GraphQLError('Not authorized - admin only', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Get channel name from YouTube if possible
      try {
        const youtubeService = getYouTubeService();
        const channelInfo = await youtubeService.getChannelInfo(channelId);

        await db.query(
          `INSERT INTO youtube_channel_blacklist (channel_id, channel_name, reason, blacklisted_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (channel_id) DO UPDATE
           SET reason = $3, blacklisted_by = $4`,
          [channelId, channelInfo?.title || 'Unknown', reason, user.id]
        );
      } catch (error) {
        // If we can't get channel info, just blacklist with unknown name
        await db.query(
          `INSERT INTO youtube_channel_blacklist (channel_id, channel_name, reason, blacklisted_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (channel_id) DO UPDATE
           SET reason = $3, blacklisted_by = $4`,
          [channelId, 'Unknown', reason, user.id]
        );
      }

      return true;
    },

    /**
     * Blacklist a YouTube video
     */
    async blacklistYouTubeVideo(
      _: any,
      { videoId, reason }: { videoId: string; reason: string },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (user.role !== 'admin') {
        throw new GraphQLError('Not authorized - admin only', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Get video title from YouTube if possible
      try {
        const youtubeService = getYouTubeService();
        const videos = await youtubeService.getVideoDetails([videoId]);

        await db.query(
          `INSERT INTO youtube_video_blacklist (youtube_video_id, video_title, reason, blacklisted_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (youtube_video_id) DO UPDATE
           SET reason = $3, blacklisted_by = $4`,
          [videoId, videos[0]?.title || 'Unknown', reason, user.id]
        );
      } catch (error) {
        await db.query(
          `INSERT INTO youtube_video_blacklist (youtube_video_id, video_title, reason, blacklisted_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (youtube_video_id) DO UPDATE
           SET reason = $3, blacklisted_by = $4`,
          [videoId, 'Unknown', reason, user.id]
        );
      }

      return true;
    },
  },

  // Type resolvers
  YouTubeCategoryMapping: {
    categoryId(parent: any) {
      return parent.category_id;
    },

    async category(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        'SELECT * FROM content_categories WHERE id = $1',
        [parent.category_id]
      );
      return result.rows[0] || null;
    },

    searchKeywords(parent: any) {
      return parent.search_keywords || [];
    },

    channelIds(parent: any) {
      return parent.channel_ids || [];
    },

    qualityThreshold(parent: any) {
      return parent.quality_threshold;
    },

    syncEnabled(parent: any) {
      return parent.sync_enabled;
    },

    syncFrequency(parent: any) {
      return parent.sync_frequency;
    },

    maxVideosPerSync(parent: any) {
      return parent.max_videos_per_sync;
    },

    lastSyncAt(parent: any) {
      return parent.last_sync_at;
    },

    createdAt(parent: any) {
      return parent.created_at;
    },

    updatedAt(parent: any) {
      return parent.updated_at;
    },
  },

  YouTubeSyncJob: {
    categoryId(parent: any) {
      return parent.category_id;
    },

    categoryName(parent: any) {
      return parent.category_name;
    },

    jobType(parent: any) {
      return parent.job_type;
    },

    videosFetched(parent: any) {
      return parent.videos_fetched || 0;
    },

    videosImported(parent: any) {
      return parent.videos_imported || 0;
    },

    videosSkipped(parent: any) {
      return parent.videos_skipped || 0;
    },

    videosFailed(parent: any) {
      return parent.videos_failed || 0;
    },

    quotaCost(parent: any) {
      return parent.quota_cost || 0;
    },

    durationSeconds(parent: any) {
      return parent.duration_seconds;
    },

    errorMessage(parent: any) {
      return parent.error_message;
    },

    startedAt(parent: any) {
      return parent.started_at;
    },

    completedAt(parent: any) {
      return parent.completed_at;
    },

    createdAt(parent: any) {
      return parent.created_at;
    },
  },

  YouTubeSyncStatus: {
    categoryId(parent: any) {
      return parent.category_id;
    },

    categoryName(parent: any) {
      return parent.category_name;
    },

    lastSyncAt(parent: any) {
      return parent.last_sync_at;
    },

    hoursSinceSync(parent: any) {
      return parent.hours_since_sync ? parseFloat(parent.hours_since_sync) : null;
    },

    videoCount(parent: any) {
      return parseInt(parent.video_count || '0', 10);
    },

    syncEnabled(parent: any) {
      return parent.sync_enabled !== false;
    },
  },
};
