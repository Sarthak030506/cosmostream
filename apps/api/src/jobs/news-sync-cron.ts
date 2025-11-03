/**
 * News Sync Cron Job
 * Automatically fetches and imports news articles from Spaceflight News API
 * Default schedule: Every 30 minutes
 */

import cron from 'node-cron';
import { Pool } from 'pg';
import winston from 'winston';
import { getNewsSyncService } from '../services/news-sync';

interface CronJobConfig {
  enabled: boolean;
  schedule: string;
  articlesPerRun: number;
}

class NewsSyncCronJob {
  private db: Pool;
  private logger: winston.Logger;
  private config: CronJobConfig;
  private cronTask: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;

  constructor(db: Pool, logger: winston.Logger) {
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
  start(): void {
    if (!this.config.enabled) {
      this.logger.info('News sync cron job is disabled');
      return;
    }

    if (this.cronTask) {
      this.logger.warn('News sync cron job is already running');
      return;
    }

    this.logger.info(`Starting news sync cron job with schedule: ${this.config.schedule}`);

    this.cronTask = cron.schedule(this.config.schedule, async () => {
      await this.runSync();
    });

    this.logger.info('News sync cron job started successfully');
  }

  /**
   * Stop the cron job
   */
  stop(): void {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
      this.logger.info('News sync cron job stopped');
    }
  }

  /**
   * Run the sync process
   */
  async runSync(): Promise<void> {
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

      const syncService = getNewsSyncService();

      // Sync news articles
      const result = await syncService.syncLatestNews(this.config.articlesPerRun);

      const duration = Math.round((Date.now() - startTime) / 1000);

      this.logger.info(
        `News sync completed: ${result.articlesImported} imported, ` +
          `${result.articlesSkipped} skipped, ` +
          `${result.articlesFailed} failed, ` +
          `${duration}s duration`
      );

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
    } catch (error) {
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
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Create a new sync job record
   */
  private async createSyncJob(): Promise<string> {
    const result = await this.db.query(
      `INSERT INTO news_sync_jobs (
        job_type,
        status,
        config
      ) VALUES ($1, $2, $3)
      RETURNING id`,
      [
        'auto_sync',
        'pending',
        JSON.stringify({
          schedule: this.config.schedule,
          articlesPerRun: this.config.articlesPerRun,
        }),
      ]
    );

    return result.rows[0].id;
  }

  /**
   * Update sync job status
   */
  private async updateSyncJobStatus(
    jobId: string,
    status: string,
    startTime: number
  ): Promise<void> {
    await this.db.query(
      `UPDATE news_sync_jobs
       SET status = $1, started_at = $2
       WHERE id = $3`,
      [status, new Date(startTime), jobId]
    );
  }

  /**
   * Complete sync job with results
   */
  private async completeSyncJob(
    jobId: string,
    data: {
      status: string;
      articlesFetched: number;
      articlesImported: number;
      articlesSkipped: number;
      articlesFailed: number;
      durationSeconds: number;
      errorMessage: string | null;
    }
  ): Promise<void> {
    await this.db.query(
      `UPDATE news_sync_jobs
       SET
         status = $1,
         articles_fetched = $2,
         articles_imported = $3,
         articles_skipped = $4,
         articles_failed = $5,
         duration_seconds = $6,
         error_message = $7,
         completed_at = NOW()
       WHERE id = $8`,
      [
        data.status,
        data.articlesFetched,
        data.articlesImported,
        data.articlesSkipped,
        data.articlesFailed,
        data.durationSeconds,
        data.errorMessage,
        jobId,
      ]
    );
  }

  /**
   * Manually trigger a sync (useful for testing or manual operations)
   */
  async triggerManualSync(): Promise<void> {
    this.logger.info('Manual news sync triggered');
    await this.runSync();
  }

  /**
   * Get current status
   */
  getStatus(): {
    enabled: boolean;
    schedule: string;
    isRunning: boolean;
    articlesPerRun: number;
  } {
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
  async getSyncHistory(limit: number = 10): Promise<any[]> {
    const result = await this.db.query(
      `SELECT
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
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
}

// Singleton instance
let cronJobInstance: NewsSyncCronJob | null = null;

export function initNewsSyncCronJob(db: Pool, logger: winston.Logger): NewsSyncCronJob {
  if (!cronJobInstance) {
    cronJobInstance = new NewsSyncCronJob(db, logger);
  }
  return cronJobInstance;
}

export function getNewsSyncCronJob(): NewsSyncCronJob {
  if (!cronJobInstance) {
    throw new Error('NewsSyncCronJob not initialized');
  }
  return cronJobInstance;
}

export default NewsSyncCronJob;
