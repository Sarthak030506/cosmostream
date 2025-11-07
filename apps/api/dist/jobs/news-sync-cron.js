"use strict";
/**
 * News Sync Cron Job
 * Automatically fetches and imports news articles from Spaceflight News API
 * Default schedule: Every 30 minutes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNewsSyncCronJob = initNewsSyncCronJob;
exports.getNewsSyncCronJob = getNewsSyncCronJob;
const node_cron_1 = __importDefault(require("node-cron"));
const news_sync_1 = require("../services/news-sync");
class NewsSyncCronJob {
    db;
    logger;
    config;
    cronTask = null;
    isRunning = false;
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        // Load configuration from environment
        this.config = {
            enabled: process.env.NEWS_SYNC_ENABLED === 'true',
            schedule: process.env.NEWS_SYNC_CRON || '*/30 * * * *', // Default: Every 30 minutes
            articlesPerRun: parseInt(process.env.NEWS_SYNC_LIMIT || '50', 10),
        };
    }
    /**
     * Start the cron job
     */
    start() {
        if (!this.config.enabled) {
            this.logger.info('News sync cron job is disabled');
            return;
        }
        if (this.cronTask) {
            this.logger.warn('News sync cron job is already running');
            return;
        }
        this.logger.info(`Starting news sync cron job with schedule: ${this.config.schedule}`);
        this.cronTask = node_cron_1.default.schedule(this.config.schedule, async () => {
            await this.runSync();
        });
        this.logger.info('News sync cron job started successfully');
    }
    /**
     * Stop the cron job
     */
    stop() {
        if (this.cronTask) {
            this.cronTask.stop();
            this.cronTask = null;
            this.logger.info('News sync cron job stopped');
        }
    }
    /**
     * Run the sync process
     */
    async runSync() {
        if (this.isRunning) {
            this.logger.warn('News sync already in progress, skipping this run');
            return;
        }
        this.isRunning = true;
        const startTime = Date.now();
        const jobId = await this.createSyncJob();
        try {
            this.logger.info('Starting scheduled news sync');
            // Update job status to running
            await this.updateSyncJobStatus(jobId, 'running', startTime);
            const syncService = (0, news_sync_1.getNewsSyncService)();
            // Sync news articles
            const result = await syncService.syncLatestNews(this.config.articlesPerRun);
            const duration = Math.round((Date.now() - startTime) / 1000);
            this.logger.info(`News sync completed: ${result.articlesImported} imported, ` +
                `${result.articlesSkipped} skipped, ` +
                `${result.articlesFailed} failed, ` +
                `${duration}s duration`);
            // Update job with results
            await this.completeSyncJob(jobId, {
                status: 'completed',
                articlesFetched: result.articlesFetched,
                articlesImported: result.articlesImported,
                articlesSkipped: result.articlesSkipped,
                articlesFailed: result.articlesFailed,
                durationSeconds: duration,
                errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null,
            });
        }
        catch (error) {
            const duration = Math.round((Date.now() - startTime) / 1000);
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('News sync failed:', error);
            await this.completeSyncJob(jobId, {
                status: 'failed',
                articlesFetched: 0,
                articlesImported: 0,
                articlesSkipped: 0,
                articlesFailed: 0,
                durationSeconds: duration,
                errorMessage,
            });
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * Create a new sync job record
     */
    async createSyncJob() {
        const result = await this.db.query(`INSERT INTO news_sync_jobs (
        job_type,
        status,
        config
      ) VALUES ($1, $2, $3)
      RETURNING id`, [
            'auto_sync',
            'pending',
            JSON.stringify({
                schedule: this.config.schedule,
                articlesPerRun: this.config.articlesPerRun,
            }),
        ]);
        return result.rows[0].id;
    }
    /**
     * Update sync job status
     */
    async updateSyncJobStatus(jobId, status, startTime) {
        await this.db.query(`UPDATE news_sync_jobs
       SET status = $1, started_at = $2
       WHERE id = $3`, [status, new Date(startTime), jobId]);
    }
    /**
     * Complete sync job with results
     */
    async completeSyncJob(jobId, data) {
        await this.db.query(`UPDATE news_sync_jobs
       SET
         status = $1,
         articles_fetched = $2,
         articles_imported = $3,
         articles_skipped = $4,
         articles_failed = $5,
         duration_seconds = $6,
         error_message = $7,
         completed_at = NOW()
       WHERE id = $8`, [
            data.status,
            data.articlesFetched,
            data.articlesImported,
            data.articlesSkipped,
            data.articlesFailed,
            data.durationSeconds,
            data.errorMessage,
            jobId,
        ]);
    }
    /**
     * Manually trigger a sync (useful for testing or manual operations)
     */
    async triggerManualSync() {
        this.logger.info('Manual news sync triggered');
        await this.runSync();
    }
    /**
     * Get current status
     */
    getStatus() {
        return {
            enabled: this.config.enabled,
            schedule: this.config.schedule,
            isRunning: this.isRunning,
            articlesPerRun: this.config.articlesPerRun,
        };
    }
    /**
     * Get recent sync history
     */
    async getSyncHistory(limit = 10) {
        const result = await this.db.query(`SELECT
        id,
        job_type,
        status,
        articles_fetched,
        articles_imported,
        articles_skipped,
        articles_failed,
        duration_seconds,
        error_message,
        started_at,
        completed_at,
        created_at
       FROM news_sync_jobs
       ORDER BY created_at DESC
       LIMIT $1`, [limit]);
        return result.rows;
    }
}
// Singleton instance
let cronJobInstance = null;
function initNewsSyncCronJob(db, logger) {
    if (!cronJobInstance) {
        cronJobInstance = new NewsSyncCronJob(db, logger);
    }
    return cronJobInstance;
}
function getNewsSyncCronJob() {
    if (!cronJobInstance) {
        throw new Error('NewsSyncCronJob not initialized');
    }
    return cronJobInstance;
}
exports.default = NewsSyncCronJob;
//# sourceMappingURL=news-sync-cron.js.map