import { Pool } from 'pg';
import winston from 'winston';
declare class YouTubeSyncCronJob {
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
     * Log sync run to database for monitoring
     */
    private logSyncRun;
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
        categoriesPerRun: number;
    };
}
export declare function initYouTubeSyncCronJob(db: Pool, logger: winston.Logger): YouTubeSyncCronJob;
export declare function getYouTubeSyncCronJob(): YouTubeSyncCronJob;
export default YouTubeSyncCronJob;
//# sourceMappingURL=youtube-sync-cron.d.ts.map