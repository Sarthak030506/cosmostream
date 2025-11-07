/**
 * Engagement Scoring Utilities
 * Calculates and tracks user engagement with content
 */
/**
 * Calculate weighted engagement score
 * Formula: (upvotes * 3) + (shares * 5) + (bookmarks * 2) - (downvotes * 2) + (views * 0.1)
 */
export declare function calculateEngagementScore(upvotes: number, downvotes: number, shares: number, bookmarks: number, views: number): number;
/**
 * Calculate vote score (net positive/negative sentiment)
 */
export declare function calculateVoteScore(upvotes: number, downvotes: number): number;
/**
 * Calculate engagement rate (percentage of viewers who engaged)
 */
export declare function calculateEngagementRate(totalEngagements: number, totalViews: number): number;
/**
 * Calculate virality coefficient
 * Measures how likely content is to be shared
 */
export declare function calculateViralityCoefficient(shares: number, views: number): number;
/**
 * Calculate content quality score (0-100)
 * Based on engagement patterns
 */
export declare function calculateQualityScore(upvotes: number, downvotes: number, bookmarks: number, views: number): number;
/**
 * Engagement velocity - how fast content is gaining engagement
 * Returns engagements per day
 */
export declare function calculateEngagementVelocity(totalEngagements: number, daysSinceCreation: number): number;
/**
 * Predict future engagement based on current trajectory
 */
export declare function predictFutureEngagement(currentEngagement: number, velocity: number, daysAhead: number, decayFactor?: number): number;
/**
 * Category for engagement level
 */
export declare enum EngagementLevel {
    VIRAL = "viral",// Exceptional engagement
    HIGH = "high",// Above average
    MODERATE = "moderate",// Average
    LOW = "low",// Below average
    MINIMAL = "minimal"
}
/**
 * Classify content by engagement level
 */
export declare function classifyEngagementLevel(engagementScore: number, viewCount: number): EngagementLevel;
/**
 * Calculate share-worthiness score
 * Predicts likelihood that users will share this content
 */
export declare function calculateShareWorthiness(title: string, description: string, tags: string[], currentShares: number, currentViews: number): number;
/**
 * Generate engagement insights for content creators
 */
export interface EngagementInsights {
    score: number;
    level: EngagementLevel;
    qualityScore: number;
    viralityCoefficient: number;
    velocity: number;
    predictedScore7Days: number;
    recommendations: string[];
}
export declare function generateEngagementInsights(upvotes: number, downvotes: number, shares: number, bookmarks: number, views: number, daysSinceCreation: number): EngagementInsights;
/**
 * Calculate community health score based on voting patterns
 */
export declare function calculateCommunityHealthScore(totalUpvotes: number, totalDownvotes: number, totalPosts: number): number;
//# sourceMappingURL=engagement.d.ts.map