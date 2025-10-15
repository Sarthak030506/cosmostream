import cron from 'node-cron';
import { Pool } from 'pg';
import winston from 'winston';
import { getYouTubeSyncService } from '../services/youtube-sync';

interface CronJobConfig {
  enabled: boolean;
  schedule: string;
  categoriesPerRun: number;
}

class YouTubeSyncCronJob {
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
      enabled: process.env.YOUTUBE_SYNC_ENABLED === 'true',
      schedule: process.env.YOUTUBE_SYNC_CRON || '0 2 * * *', // Default: 2 AM daily
      categoriesPerRun: parseInt(process.env.YOUTUBE_SYNC_CATEGORIES_PER_RUN || '10', 10),
    };
  }

  /**
   * Start the cron job
   */
  start(): void {
    if (!this.config.enabled) {
      this.logger.info('YouTube sync cron job is disabled');
      return;
    }

    if (this.cronTask) {
      this.logger.warn('YouTube sync cron job is already running');
      return;
    }

    this.logger.info(
      `Starting YouTube sync cron job with schedule: ${this.config.schedule}`
    );

    this.cronTask = cron.schedule(this.config.schedule, async () => {
      await this.runSync();
    });

    this.logger.info('YouTube sync cron job started successfully');
  }

  /**
   * Stop the cron job
   */
  stop(): void {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
      this.logger.info('YouTube sync cron job stopped');
    }
  }

  /**
   * Run the sync process
   */
  async runSync(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('YouTube sync already in progress, skipping this run');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.logger.info('Starting scheduled YouTube sync');

      const syncService = getYouTubeSyncService();

      // Sync categories
      const results = await syncService.syncAllCategories(this.config.categoriesPerRun);

      // Calculate totals
      const totals = results.reduce(
        (acc, result) => ({
          videosFetched: acc.videosFetched + result.videosFetched,
          videosImported: acc.videosImported + result.videosImported,
          videosSkipped: acc.videosSkipped + result.videosSkipped,
          videosFailed: acc.videosFailed + result.videosFailed,
          quotaCost: acc.quotaCost + result.quotaCost,
        }),
        {
          videosFetched: 0,
          videosImported: 0,
          videosSkipped: 0,
          videosFailed: 0,
          quotaCost: 0,
        }
      );

      const duration = Math.round((Date.now() - startTime) / 1000);

      this.logger.info(
        `YouTube sync completed: ${results.length} categories synced, ` +
          `${totals.videosImported} videos imported, ` +
          `${totals.quotaCost} quota used, ` +
          `${duration}s duration`
      );

      // Log detailed results to database
      await this.logSyncRun({
        categoriesProcessed: results.length,
        ...totals,
        durationSeconds: duration,
        success: true,
      });
    } catch (error) {
      const duration = Math.round((Date.now() - startTime) / 1000);

      this.logger.error('YouTube sync failed:', error);

      await this.logSyncRun({
        categoriesProcessed: 0,
        videosFetched: 0,
        videosImported: 0,
        videosSkipped: 0,
        videosFailed: 0,
        quotaCost: 0,
        durationSeconds: duration,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Log sync run to database for monitoring
   */
  private async logSyncRun(data: {
    categoriesProcessed: number;
    videosFetched: number;
    videosImported: number;
    videosSkipped: number;
    videosFailed: number;
    quotaCost: number;
    durationSeconds: number;
    success: boolean;
    error?: string;
  }): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO youtube_sync_jobs (
          job_type,
          status,
          videos_fetched,
          videos_imported,
          videos_skipped,
          videos_failed,
          quota_cost,
          duration_seconds,
          error_message,
          started_at,
          completed_at,
          config
        ) VALUES (
          'full_sync',
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          NOW() - INTERVAL '1 second' * $7,
          NOW(),
          $9
        )`,
        [
          data.success ? 'completed' : 'failed',
          data.videosFetched,
          data.videosImported,
          data.videosSkipped,
          data.videosFailed,
          data.quotaCost,
          data.durationSeconds,
          data.error || null,
          JSON.stringify({
            categoriesProcessed: data.categoriesProcessed,
            schedule: this.config.schedule,
          }),
        ]
      );
    } catch (error) {
      this.logger.error('Failed to log sync run:', error);
    }
  }

  /**
   * Manually trigger a sync (useful for testing or manual operations)
   */
  async triggerManualSync(): Promise<void> {
    this.logger.info('Manual YouTube sync triggered');
    await this.runSync();
  }

  /**
   * Get current status
   */
  getStatus(): {
    enabled: boolean;
    schedule: string;
    isRunning: boolean;
    categoriesPerRun: number;
  } {
    return {
      enabled: this.config.enabled,
      schedule: this.config.schedule,
      isRunning: this.isRunning,
      categoriesPerRun: this.config.categoriesPerRun,
    };
  }
}

// Singleton instance
let cronJobInstance: YouTubeSyncCronJob | null = null;

export function initYouTubeSyncCronJob(
  db: Pool,
  logger: winston.Logger
): YouTubeSyncCronJob {
  if (!cronJobInstance) {
    cronJobInstance = new YouTubeSyncCronJob(db, logger);
  }
  return cronJobInstance;
}

export function getYouTubeSyncCronJob(): YouTubeSyncCronJob {
  if (!cronJobInstance) {
    throw new Error('YouTubeSyncCronJob not initialized');
  }
  return cronJobInstance;
}

export default YouTubeSyncCronJob;
