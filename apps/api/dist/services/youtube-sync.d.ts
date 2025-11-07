import { Pool } from 'pg';
import winston from 'winston';
import { QualityThreshold } from '../utils/youtube-filters';
export interface SyncResult {
    jobId: string;
    categoryId: string;
    categoryName: string;
    videosFetched: number;
    videosImported: number;
    videosSkipped: number;
    videosFailed: number;
    quotaCost: number;
    durationSeconds: number;
    errors: string[];
}
export interface CategoryMapping {
    id: string;
    categoryId: string;
    categoryName: string;
    searchKeywords: string[];
    channelIds: string[];
    qualityThreshold: QualityThreshold;
    maxVideosPerSync: number;
}
declare class YouTubeSyncService {
    private db;
    private logger;
    constructor(db: Pool, logger: winston.Logger);
    /**
     * Sync YouTube videos for a specific category
     */
    syncCategory(categoryId: string): Promise<SyncResult>;
    /**
     * Sync all enabled categories (sequential - legacy method)
     */
    syncAllCategories(limit?: number): Promise<SyncResult[]>;
    /**
     * Sync categories in parallel with concurrency control (3-5x faster)
     */
    syncAllCategoriesParallel(limit?: number, concurrency?: number): Promise<SyncResult[]>;
    /**
     * Import a single YouTube video by ID
     */
    importSingleVideo(videoId: string, categoryId: string): Promise<string>;
    /**
     * Import a YouTube video into the database
     */
    private importVideo;
    /**
     * Bulk import videos with single transaction (10-20x faster than sequential imports)
     */
    private bulkImportVideos;
    /**
     * Get category mapping with search keywords and channels
     */
    private getCategoryMapping;
    /**
     * Get categories that need syncing
     */
    private getCategoriesToSync;
    /**
     * Update last sync time for a category
     */
    private updateLastSyncTime;
    /**
     * Create a sync job record
     */
    private createSyncJob;
    /**
     * Complete a sync job
     */
    private completeSyncJob;
    /**
     * Helper to add delay
     */
    private delay;
    /**
     * Get sync job status
     */
    getSyncJobStatus(jobId: string): Promise<any>;
    /**
     * Get recent sync jobs
     */
    getRecentSyncJobs(limit?: number): Promise<any[]>;
}
export declare function initYouTubeSyncService(db: Pool, logger: winston.Logger): YouTubeSyncService;
export declare function getYouTubeSyncService(): YouTubeSyncService;
export default YouTubeSyncService;
//# sourceMappingURL=youtube-sync.d.ts.map