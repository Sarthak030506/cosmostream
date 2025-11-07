import { Pool } from 'pg';
import winston from 'winston';
export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnails: {
        default: string;
        medium: string;
        high: string;
        standard?: string;
        maxres?: string;
    };
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    duration: string;
    durationSeconds: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    tags?: string[];
    categoryId: string;
    embedUrl: string;
    watchUrl: string;
}
export interface YouTubeChannel {
    id: string;
    title: string;
    description: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    thumbnails: {
        default: string;
        medium: string;
        high: string;
    };
}
export interface SearchOptions {
    maxResults?: number;
    order?: 'date' | 'rating' | 'relevance' | 'title' | 'viewCount';
    publishedAfter?: Date;
    publishedBefore?: Date;
    videoDuration?: 'short' | 'medium' | 'long' | 'any';
    safeSearch?: 'moderate' | 'none' | 'strict';
}
declare class YouTubeService {
    private youtube;
    private db;
    private logger;
    private apiKey;
    private quotaLimit;
    constructor(db: Pool, logger: winston.Logger);
    /**
     * Check if we have enough quota remaining for an operation
     */
    private checkQuota;
    /**
     * Track quota usage
     */
    private trackQuota;
    /**
     * Check if a channel is blacklisted
     */
    private isChannelBlacklisted;
    /**
     * Check if a video is blacklisted
     */
    private isVideoBlacklisted;
    /**
     * Parse ISO 8601 duration to seconds
     */
    private parseDuration;
    /**
     * Search for videos by keywords
     */
    searchVideosByKeywords(keywords: string[], options?: SearchOptions): Promise<YouTubeVideo[]>;
    /**
     * Search videos by channel ID
     */
    searchVideosByChannel(channelId: string, options?: SearchOptions): Promise<YouTubeVideo[]>;
    /**
     * Get detailed information for specific video IDs
     */
    getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]>;
    /**
     * Get channel information
     */
    getChannelInfo(channelId: string): Promise<YouTubeChannel | null>;
    /**
     * Get current quota usage for today
     */
    getQuotaUsage(): Promise<{
        used: number;
        remaining: number;
        limit: number;
    }>;
}
export declare function initYouTubeService(db: Pool, logger: winston.Logger): YouTubeService;
export declare function getYouTubeService(): YouTubeService;
export default YouTubeService;
//# sourceMappingURL=youtube.d.ts.map