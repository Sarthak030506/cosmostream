import { Context } from '../../context';
export declare const youtubeResolvers: {
    Query: {
        /**
         * Get YouTube sync status for a category or all categories
         */
        youtubeSyncStatus(_: any, { categoryId }: {
            categoryId?: string;
        }, { db, user }: Context): Promise<any>;
        /**
         * Get recent YouTube sync jobs
         */
        youtubeSyncJobs(_: any, { limit }: {
            limit?: number;
        }, { user }: Context): Promise<any[]>;
        /**
         * Get YouTube API quota usage
         */
        youtubeQuotaUsage(_: any, __: any, { user }: Context): Promise<{
            date: string;
            used: number;
            remaining: number;
            limit: number;
        }>;
        /**
         * Get YouTube category mapping configuration
         */
        youtubeCategoryMapping(_: any, { categoryId }: {
            categoryId: string;
        }, { db, user }: Context): Promise<any>;
    };
    Mutation: {
        /**
         * Sync YouTube videos for a specific category
         */
        syncYouTubeCategory(_: any, { categoryId, limit }: {
            categoryId: string;
            limit?: number;
        }, { user }: Context): Promise<import("../../services/youtube-sync").SyncResult>;
        /**
         * Sync all enabled YouTube categories (sequential)
         */
        syncAllYouTubeCategories(_: any, { limit }: {
            limit?: number;
        }, { user }: Context): Promise<import("../../services/youtube-sync").SyncResult[]>;
        /**
         * Sync YouTube categories in parallel (3-5x faster)
         */
        syncAllYouTubeCategoriesParallel(_: any, { limit, concurrency }: {
            limit?: number;
            concurrency?: number;
        }, { user }: Context): Promise<{
            success: boolean;
            totalCategories: number;
            results: import("../../services/youtube-sync").SyncResult[];
        }>;
        /**
         * Import a specific YouTube video
         */
        importYouTubeVideo(_: any, { videoId, categoryId }: {
            videoId: string;
            categoryId: string;
        }, { user }: Context): Promise<boolean>;
        /**
         * Update YouTube category mapping keywords and channels
         */
        updateYouTubeCategoryMapping(_: any, { categoryId, keywords, channels, }: {
            categoryId: string;
            keywords: string[];
            channels: string[];
        }, { db, user }: Context): Promise<any>;
        /**
         * Blacklist a YouTube channel
         */
        blacklistYouTubeChannel(_: any, { channelId, reason }: {
            channelId: string;
            reason: string;
        }, { db, user }: Context): Promise<boolean>;
        /**
         * Blacklist a YouTube video
         */
        blacklistYouTubeVideo(_: any, { videoId, reason }: {
            videoId: string;
            reason: string;
        }, { db, user }: Context): Promise<boolean>;
    };
    YouTubeCategoryMapping: {
        categoryId(parent: any): any;
        category(parent: any, _: any, { db }: Context): Promise<any>;
        searchKeywords(parent: any): any;
        channelIds(parent: any): any;
        qualityThreshold(parent: any): any;
        syncEnabled(parent: any): any;
        syncFrequency(parent: any): any;
        maxVideosPerSync(parent: any): any;
        lastSyncAt(parent: any): any;
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
    };
    YouTubeSyncJob: {
        categoryId(parent: any): any;
        categoryName(parent: any): any;
        jobType(parent: any): any;
        videosFetched(parent: any): any;
        videosImported(parent: any): any;
        videosSkipped(parent: any): any;
        videosFailed(parent: any): any;
        quotaCost(parent: any): any;
        durationSeconds(parent: any): any;
        errorMessage(parent: any): any;
        startedAt(parent: any): any;
        completedAt(parent: any): any;
        createdAt(parent: any): any;
    };
    YouTubeSyncStatus: {
        categoryId(parent: any): any;
        categoryName(parent: any): any;
        lastSyncAt(parent: any): any;
        hoursSinceSync(parent: any): number;
        videoCount(parent: any): number;
        syncEnabled(parent: any): boolean;
    };
};
//# sourceMappingURL=youtube.d.ts.map