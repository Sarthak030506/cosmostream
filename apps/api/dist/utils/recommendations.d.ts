/**
 * Content Recommendation System Utilities
 * Provides algorithms for personalizing content based on user astronomy level
 */
export type AstronomyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all';
interface ContentItem {
    id: string;
    title: string;
    difficulty_level: DifficultyLevel;
    tags: string[];
    engagement_score: number;
    view_count: number;
    created_at: Date;
    category_id: string;
}
interface UserAstronomyProfile {
    astronomy_level: AstronomyLevel;
    interests: string[];
    preferred_topics: string[];
}
/**
 * Map user's astronomy level to suitable content difficulty levels
 * Returns array of difficulty levels ranked by suitability
 */
export declare function getSuitableDifficultyLevels(astronomyLevel: AstronomyLevel): {
    difficulty: DifficultyLevel;
    weight: number;
}[];
/**
 * Calculate recommendation score for a content item based on user profile
 * Higher score = better match
 */
export declare function calculateRecommendationScore(content: ContentItem, userProfile: UserAstronomyProfile, userFollowedCategories?: string[]): number;
/**
 * Generate SQL WHERE clause for difficulty level filtering
 */
export declare function buildDifficultyFilter(astronomyLevel: AstronomyLevel): string;
/**
 * Build SQL CASE statement for difficulty match scoring
 */
export declare function buildDifficultyScoreCase(astronomyLevel: AstronomyLevel): string;
/**
 * Generate diversity in recommendations
 * Ensures variety across categories and content types
 */
export declare function diversifyRecommendations<T extends {
    category_id: string;
    contentType?: string;
}>(items: T[], limit: number): T[];
/**
 * Calculate time-decay factor for trending content
 * Recent content gets higher boost
 */
export declare function calculateTimeDecay(createdAt: Date, halfLifeDays?: number): number;
/**
 * Calculate trending score
 * Combines engagement with recency
 */
export declare function calculateTrendingScore(engagementScore: number, viewCount: number, createdAt: Date): number;
/**
 * Build interest match SQL fragment
 */
export declare function buildInterestMatchFragment(interests: string[]): string;
/**
 * Priority levels for content display
 */
export declare enum ContentPriority {
    CRITICAL = "critical",// Featured, urgent news
    HIGH = "high",// Trending, popular
    NORMAL = "normal",// Regular content
    LOW = "low"
}
/**
 * Determine content priority based on various factors
 */
export declare function determineContentPriority(engagementScore: number, viewCount: number, daysSinceCreation: number, isFeatured?: boolean): ContentPriority;
export {};
//# sourceMappingURL=recommendations.d.ts.map