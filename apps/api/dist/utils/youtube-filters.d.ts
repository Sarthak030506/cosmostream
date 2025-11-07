import { YouTubeVideo, YouTubeChannel } from '../services/youtube';
import winston from 'winston';
export interface QualityThreshold {
    min_views: number;
    min_likes_ratio: number;
    min_subscribers: number;
    content_rating: 'family_friendly' | 'all';
}
export interface FilterResult {
    passed: boolean;
    reason?: string;
    score: number;
}
export declare class YouTubeContentFilter {
    private logger;
    constructor(logger: winston.Logger);
    /**
     * Check if video passes quality thresholds
     */
    checkVideoQuality(video: YouTubeVideo, threshold: QualityThreshold): FilterResult;
    /**
     * Check if channel passes quality thresholds
     */
    checkChannelQuality(channel: YouTubeChannel, threshold: QualityThreshold): Promise<FilterResult>;
    /**
     * Detect spam indicators in text
     */
    private detectSpam;
    /**
     * Detect inappropriate content for family-friendly filter
     */
    private detectInappropriateContent;
    /**
     * Calculate quality score based on checks
     */
    private calculateScore;
    /**
     * Filter a list of videos by quality thresholds
     */
    filterVideos(videos: YouTubeVideo[], threshold: QualityThreshold): {
        passed: YouTubeVideo[];
        failed: {
            video: YouTubeVideo;
            result: FilterResult;
        }[];
    };
    /**
     * Calculate engagement score for a video (0-100)
     * This can be used to rank videos by quality
     */
    calculateEngagementScore(video: YouTubeVideo): number;
    /**
     * Deduplicate videos (e.g., same video from different searches)
     */
    deduplicateVideos(videos: YouTubeVideo[]): YouTubeVideo[];
    /**
     * Sort videos by engagement score
     */
    sortByEngagement(videos: YouTubeVideo[]): YouTubeVideo[];
}
export declare function initYouTubeContentFilter(logger: winston.Logger): YouTubeContentFilter;
export declare function getYouTubeContentFilter(): YouTubeContentFilter;
export default YouTubeContentFilter;
//# sourceMappingURL=youtube-filters.d.ts.map