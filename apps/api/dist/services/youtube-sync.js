"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initYouTubeSyncService = initYouTubeSyncService;
exports.getYouTubeSyncService = getYouTubeSyncService;
const uuid_1 = require("uuid");
const youtube_1 = require("./youtube");
const youtube_filters_1 = require("../utils/youtube-filters");
class YouTubeSyncService {
    db;
    logger;
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    /**
     * Sync YouTube videos for a specific category
     */
    async syncCategory(categoryId) {
        const startTime = Date.now();
        const jobId = (0, uuid_1.v4)();
        const errors = [];
        // Create sync job record
        await this.createSyncJob(jobId, 'category_sync', categoryId);
        try {
            // Get category mapping
            const mapping = await this.getCategoryMapping(categoryId);
            if (!mapping) {
                throw new Error(`No YouTube mapping found for category ${categoryId}`);
            }
            this.logger.info(`Starting YouTube sync for category: ${mapping.categoryName} (${categoryId})`);
            const youtubeService = (0, youtube_1.getYouTubeService)();
            const contentFilter = (0, youtube_filters_1.getYouTubeContentFilter)();
            let allVideos = [];
            let quotaCost = 0;
            // Search by keywords
            if (mapping.searchKeywords.length > 0) {
                try {
                    const keywordVideos = await youtubeService.searchVideosByKeywords(mapping.searchKeywords, {
                        maxResults: mapping.maxVideosPerSync,
                        order: 'relevance',
                        safeSearch: mapping.qualityThreshold.content_rating === 'family_friendly' ? 'strict' : 'moderate',
                    });
                    allVideos.push(...keywordVideos);
                    quotaCost += 100; // Search quota cost
                }
                catch (error) {
                    const errorMsg = `Keyword search failed: ${error}`;
                    errors.push(errorMsg);
                    this.logger.error(errorMsg);
                }
            }
            // Search by channel IDs
            for (const channelId of mapping.channelIds) {
                try {
                    // Get channel info to verify quality
                    const channelInfo = await youtubeService.getChannelInfo(channelId);
                    if (channelInfo) {
                        const channelQuality = await contentFilter.checkChannelQuality(channelInfo, mapping.qualityThreshold);
                        if (!channelQuality.passed) {
                            this.logger.warn(`Channel ${channelInfo.title} did not pass quality check: ${channelQuality.reason}`);
                            continue;
                        }
                        // Fetch videos from this channel
                        const channelVideos = await youtubeService.searchVideosByChannel(channelId, {
                            maxResults: Math.floor(mapping.maxVideosPerSync / mapping.channelIds.length),
                            order: 'date',
                        });
                        allVideos.push(...channelVideos);
                        quotaCost += 101; // Channel info + search
                    }
                }
                catch (error) {
                    const errorMsg = `Channel ${channelId} search failed: ${error}`;
                    errors.push(errorMsg);
                    this.logger.error(errorMsg);
                }
            }
            // Deduplicate videos
            allVideos = contentFilter.deduplicateVideos(allVideos);
            // Filter videos by quality
            const { passed: qualityVideos, failed: failedVideos } = contentFilter.filterVideos(allVideos, mapping.qualityThreshold);
            this.logger.info(`Fetched ${allVideos.length} videos, ${qualityVideos.length} passed quality filters, ${failedVideos.length} filtered out`);
            // Sort by engagement and limit
            const sortedVideos = contentFilter.sortByEngagement(qualityVideos);
            const videosToImport = sortedVideos.slice(0, mapping.maxVideosPerSync);
            // Import videos into database using bulk import for better performance
            const bulkResult = await this.bulkImportVideos(videosToImport, categoryId);
            const imported = bulkResult.imported;
            const skipped = bulkResult.skipped;
            const failed = bulkResult.failed;
            // Update last sync time
            await this.updateLastSyncTime(categoryId);
            // Calculate duration
            const durationSeconds = Math.round((Date.now() - startTime) / 1000);
            // Update sync job
            await this.completeSyncJob(jobId, {
                status: 'completed',
                videosFetched: allVideos.length,
                videosImported: imported,
                videosSkipped: skipped,
                videosFailed: failed,
                quotaCost,
                durationSeconds,
                errorMessage: errors.length > 0 ? errors.join('; ') : null,
            });
            this.logger.info(`YouTube sync completed for ${mapping.categoryName}: ` +
                `${imported} imported, ${skipped} skipped, ${failed} failed`);
            return {
                jobId,
                categoryId,
                categoryName: mapping.categoryName,
                videosFetched: allVideos.length,
                videosImported: imported,
                videosSkipped: skipped,
                videosFailed: failed,
                quotaCost,
                durationSeconds,
                errors,
            };
        }
        catch (error) {
            // Mark job as failed
            await this.completeSyncJob(jobId, {
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    /**
     * Sync all enabled categories (sequential - legacy method)
     */
    async syncAllCategories(limit) {
        const categories = await this.getCategoriesToSync(limit);
        this.logger.info(`Starting sync for ${categories.length} categories`);
        const results = [];
        for (const category of categories) {
            try {
                const result = await this.syncCategory(category.id);
                results.push(result);
                // Add delay between categories to avoid rate limiting
                await this.delay(2000);
            }
            catch (error) {
                this.logger.error(`Failed to sync category ${category.name}:`, error);
            }
        }
        return results;
    }
    /**
     * Sync categories in parallel with concurrency control (3-5x faster)
     */
    async syncAllCategoriesParallel(limit, concurrency = 3) {
        const categories = await this.getCategoriesToSync(limit);
        this.logger.info(`Starting parallel sync for ${categories.length} categories (concurrency: ${concurrency})`);
        const results = [];
        const errors = [];
        // Process in batches
        for (let i = 0; i < categories.length; i += concurrency) {
            const batch = categories.slice(i, i + concurrency);
            this.logger.info(`Processing batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(categories.length / concurrency)}: ` +
                `${batch.map(c => c.name).join(', ')}`);
            // Sync batch in parallel
            const batchResults = await Promise.allSettled(batch.map(category => this.syncCategory(category.id)));
            // Collect results
            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                    this.logger.info(`✅ ${batch[index].name}: ${result.value.videosImported} imported`);
                }
                else {
                    const category = batch[index];
                    this.logger.error(`❌ ${category.name} failed:`, result.reason);
                    errors.push(result.reason);
                }
            });
            // Small delay between batches to avoid overwhelming the API
            if (i + concurrency < categories.length) {
                this.logger.debug(`Waiting 1s before next batch...`);
                await this.delay(1000);
            }
        }
        this.logger.info(`Parallel sync completed: ${results.length} succeeded, ${errors.length} failed`);
        return results;
    }
    /**
     * Import a single YouTube video by ID
     */
    async importSingleVideo(videoId, categoryId) {
        const youtubeService = (0, youtube_1.getYouTubeService)();
        // Get video details
        const videos = await youtubeService.getVideoDetails([videoId]);
        if (videos.length === 0) {
            throw new Error(`Video ${videoId} not found`);
        }
        const video = videos[0];
        // Import the video
        const result = await this.importVideo(video, categoryId);
        return result;
    }
    /**
     * Import a YouTube video into the database
     */
    async importVideo(video, categoryId) {
        // Check if video already exists
        const existing = await this.db.query(`SELECT id FROM content_items
       WHERE source_type = 'youtube'
         AND media_urls->>'youtube_id' = $1`, [video.id]);
        if (existing.rows.length > 0) {
            this.logger.debug(`Video ${video.title} already exists, skipping`);
            return 'skipped';
        }
        // Get a system user for author_id (or use a dedicated "YouTube Bot" user)
        // For now, we'll get the first admin user
        const adminResult = await this.db.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
        if (adminResult.rows.length === 0) {
            throw new Error('No admin user found to assign as content author');
        }
        const authorId = adminResult.rows[0].id;
        // Prepare media URLs JSON
        const mediaUrls = {
            youtube_id: video.id,
            thumbnail: video.thumbnails.high || video.thumbnails.medium || video.thumbnails.default,
            embed_url: video.embedUrl,
            watch_url: video.watchUrl,
            channel_id: video.channelId,
            channel_name: video.channelTitle,
            published_at: video.publishedAt,
            duration_seconds: video.durationSeconds,
        };
        // Extract tags (limit to 10)
        const tags = video.tags ? video.tags.slice(0, 10) : [];
        // Insert content item
        await this.db.query(`INSERT INTO content_items (
        title,
        description,
        category_id,
        author_id,
        content_type,
        difficulty_level,
        age_group,
        tags,
        media_urls,
        source_type,
        view_count,
        engagement_score
      ) VALUES ($1, $2, $3, $4, 'video', 'intermediate', 'all', $5, $6, 'youtube', $7, $8)`, [
            video.title.substring(0, 500), // Limit title length
            video.description.substring(0, 1000), // Limit description length
            categoryId,
            authorId,
            tags,
            JSON.stringify(mediaUrls),
            video.viewCount,
            Math.floor(video.viewCount / 100), // Simple engagement score based on views
        ]);
        this.logger.debug(`Imported video: ${video.title}`);
        return 'imported';
    }
    /**
     * Bulk import videos with single transaction (10-20x faster than sequential imports)
     */
    async bulkImportVideos(videos, categoryId) {
        if (videos.length === 0) {
            return { imported: 0, skipped: 0, failed: 0 };
        }
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            // 1. Get admin user ONCE
            const adminResult = await client.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
            if (adminResult.rows.length === 0) {
                throw new Error('No admin user found to assign as content author');
            }
            const authorId = adminResult.rows[0].id;
            // 2. Check existing videos in single query
            const youtubeIds = videos.map(v => v.id);
            const existingResult = await client.query(`SELECT media_urls->>'youtube_id' as youtube_id
         FROM content_items
         WHERE source_type = 'youtube'
           AND media_urls->>'youtube_id' = ANY($1)`, [youtubeIds]);
            const existingIds = new Set(existingResult.rows.map(r => r.youtube_id));
            this.logger.debug(`Found ${existingIds.size} existing videos, skipping them`);
            // 3. Filter out existing videos
            const newVideos = videos.filter(v => !existingIds.has(v.id));
            if (newVideos.length === 0) {
                await client.query('COMMIT');
                return { imported: 0, skipped: existingIds.size, failed: 0 };
            }
            // 4. Prepare arrays for bulk insert
            const titles = [];
            const descriptions = [];
            const categoryIds = [];
            const authorIds = [];
            const tagArrays = [];
            const mediaUrlsJsons = [];
            const viewCounts = [];
            const engagementScores = [];
            newVideos.forEach((video) => {
                const mediaUrls = {
                    youtube_id: video.id,
                    thumbnail: video.thumbnails.high || video.thumbnails.medium || video.thumbnails.default,
                    embed_url: video.embedUrl,
                    watch_url: video.watchUrl,
                    channel_id: video.channelId,
                    channel_name: video.channelTitle,
                    published_at: video.publishedAt,
                    duration_seconds: video.durationSeconds,
                };
                const tags = video.tags ? video.tags.slice(0, 10) : [];
                titles.push(video.title.substring(0, 500));
                descriptions.push(video.description.substring(0, 1000));
                categoryIds.push(categoryId);
                authorIds.push(authorId);
                // Convert array to PostgreSQL format: ARRAY['tag1', 'tag2']
                tagArrays.push(`{${tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}`);
                mediaUrlsJsons.push(JSON.stringify(mediaUrls));
                viewCounts.push(video.viewCount);
                engagementScores.push(Math.floor(video.viewCount / 100));
            });
            // 5. Bulk insert all new videos in single query
            await client.query(`INSERT INTO content_items (
          title, description, category_id, author_id, tags, media_urls,
          source_type, content_type, difficulty_level, age_group,
          view_count, engagement_score
        )
        SELECT
          unnest($1::text[]),
          unnest($2::text[]),
          unnest($3::uuid[]),
          unnest($4::uuid[]),
          unnest($5::text[])::text[],
          unnest($6::jsonb[]),
          'youtube',
          'video',
          'intermediate',
          'all',
          unnest($7::integer[]),
          unnest($8::integer[])`, [
                titles,
                descriptions,
                categoryIds,
                authorIds,
                tagArrays,
                mediaUrlsJsons,
                viewCounts,
                engagementScores
            ]);
            await client.query('COMMIT');
            this.logger.info(`Bulk imported ${newVideos.length} videos in single transaction`);
            return {
                imported: newVideos.length,
                skipped: existingIds.size,
                failed: 0
            };
        }
        catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Bulk import failed, rolling back transaction:', error);
            // Fallback to sequential import on bulk failure
            this.logger.info('Falling back to sequential import...');
            let imported = 0;
            let skipped = 0;
            let failed = 0;
            for (const video of videos) {
                try {
                    const result = await this.importVideo(video, categoryId);
                    if (result === 'imported') {
                        imported++;
                    }
                    else if (result === 'skipped') {
                        skipped++;
                    }
                }
                catch (err) {
                    failed++;
                    this.logger.error(`Failed to import video ${video.title}:`, err);
                }
            }
            return { imported, skipped, failed };
        }
        finally {
            client.release();
        }
    }
    /**
     * Get category mapping with search keywords and channels
     */
    async getCategoryMapping(categoryId) {
        const result = await this.db.query(`SELECT
        ycm.id,
        ycm.category_id,
        cc.name as category_name,
        ycm.search_keywords,
        ycm.channel_ids,
        ycm.quality_threshold,
        ycm.max_videos_per_sync
       FROM youtube_category_mappings ycm
       INNER JOIN content_categories cc ON ycm.category_id = cc.id
       WHERE ycm.category_id = $1 AND ycm.sync_enabled = TRUE`, [categoryId]);
        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return {
            id: row.id,
            categoryId: row.category_id,
            categoryName: row.category_name,
            searchKeywords: row.search_keywords || [],
            channelIds: row.channel_ids || [],
            qualityThreshold: row.quality_threshold,
            maxVideosPerSync: row.max_videos_per_sync,
        };
    }
    /**
     * Get categories that need syncing
     */
    async getCategoriesToSync(limit) {
        const result = await this.db.query(`SELECT category_id, category_name
       FROM get_categories_for_sync($1)`, [limit || 10]);
        return result.rows.map((row) => ({
            id: row.category_id,
            name: row.category_name,
        }));
    }
    /**
     * Update last sync time for a category
     */
    async updateLastSyncTime(categoryId) {
        await this.db.query(`UPDATE youtube_category_mappings
       SET last_sync_at = NOW()
       WHERE category_id = $1`, [categoryId]);
    }
    /**
     * Create a sync job record
     */
    async createSyncJob(jobId, jobType, categoryId) {
        await this.db.query(`INSERT INTO youtube_sync_jobs (id, job_type, category_id, status, started_at)
       VALUES ($1, $2, $3, 'running', NOW())`, [jobId, jobType, categoryId || null]);
    }
    /**
     * Complete a sync job
     */
    async completeSyncJob(jobId, data) {
        await this.db.query(`UPDATE youtube_sync_jobs
       SET status = $2,
           videos_fetched = $3,
           videos_imported = $4,
           videos_skipped = $5,
           videos_failed = $6,
           quota_cost = $7,
           duration_seconds = $8,
           error_message = $9,
           error_stack = $10,
           completed_at = NOW()
       WHERE id = $1`, [
            jobId,
            data.status,
            data.videosFetched || 0,
            data.videosImported || 0,
            data.videosSkipped || 0,
            data.videosFailed || 0,
            data.quotaCost || 0,
            data.durationSeconds || 0,
            data.errorMessage || null,
            data.errorStack || null,
        ]);
    }
    /**
     * Helper to add delay
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Get sync job status
     */
    async getSyncJobStatus(jobId) {
        const result = await this.db.query(`SELECT * FROM youtube_sync_jobs WHERE id = $1`, [jobId]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    /**
     * Get recent sync jobs
     */
    async getRecentSyncJobs(limit = 20) {
        const result = await this.db.query(`SELECT
        ysj.*,
        cc.name as category_name
       FROM youtube_sync_jobs ysj
       LEFT JOIN content_categories cc ON ysj.category_id = cc.id
       ORDER BY ysj.created_at DESC
       LIMIT $1`, [limit]);
        return result.rows;
    }
}
// Singleton instance
let syncServiceInstance = null;
function initYouTubeSyncService(db, logger) {
    if (!syncServiceInstance) {
        syncServiceInstance = new YouTubeSyncService(db, logger);
    }
    return syncServiceInstance;
}
function getYouTubeSyncService() {
    if (!syncServiceInstance) {
        throw new Error('YouTubeSyncService not initialized');
    }
    return syncServiceInstance;
}
exports.default = YouTubeSyncService;
//# sourceMappingURL=youtube-sync.js.map