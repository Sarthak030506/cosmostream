/**
 * News Sync Cron Job
 * Automatically fetches and imports news articles from Spaceflight News API
 * Default schedule: Every 30 minutes
 */
import { Pool } from 'pg';
import winston from 'winston';
declare class NewsSyncCronJob {
    private db;
    private logger;
    private config;
    private cronTask;
    private isRunning;
    constructor(db: Pool, logger: winston.Logger);
    /**
     * Start the cron job
     */
    start(): void;
    /**
     * Stop the cron job
     */
    stop(): void;
    /**
     * Run the sync process
     */
    runSync(): Promise<void>;
    /**
     * Create a new sync job record
     */
    private createSyncJob;
    /**
     * Update sync job status
     */
    private updateSyncJobStatus;
    /**
     * Complete sync job with results
     */
    private completeSyncJob;
    /**
     * Manually trigger a sync (useful for testing or manual operations)
     */
    triggerManualSync(): Promise<void>;
    /**
     * Get current status
     */
    getStatus(): {
        enabled: boolean;
        schedule: string;
        isRunning: boolean;
        articlesPerRun: number;
    };
    /**
     * Get recent sync history
     */
    getSyncHistory(limit?: number): Promise<any[]>;
}
export declare function initNewsSyncCronJob(db: Pool, logger: winston.Logger): NewsSyncCronJob;
export declare function getNewsSyncCronJob(): NewsSyncCronJob;
export default NewsSyncCronJob;
//# sourceMappingURL=news-sync-cron.d.ts.map