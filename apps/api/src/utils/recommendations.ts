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
export function getSuitableDifficultyLevels(
  astronomyLevel: AstronomyLevel
): { difficulty: DifficultyLevel; weight: number }[] {
  switch (astronomyLevel) {
    case 'beginner':
      return [
        { difficulty: 'beginner', weight: 10 },
        { difficulty: 'all', weight: 8 },
        { difficulty: 'intermediate', weight: 3 },
        { difficulty: 'advanced', weight: 0 },
        { difficulty: 'expert', weight: 0 },
      ];

    case 'intermediate':
      return [
        { difficulty: 'intermediate', weight: 10 },
        { difficulty: 'beginner', weight: 7 },
        { difficulty: 'all', weight: 8 },
        { difficulty: 'advanced', weight: 5 },
        { difficulty: 'expert', weight: 1 },
      ];

    case 'advanced':
      return [
        { difficulty: 'advanced', weight: 10 },
        { difficulty: 'intermediate', weight: 7 },
        { difficulty: 'all', weight: 6 },
        { difficulty: 'expert', weight: 5 },
        { difficulty: 'beginner', weight: 2 },
      ];

    case 'expert':
      return [
        { difficulty: 'expert', weight: 10 },
        { difficulty: 'advanced', weight: 8 },
        { difficulty: 'all', weight: 5 },
        { difficulty: 'intermediate', weight: 3 },
        { difficulty: 'beginner', weight: 1 },
      ];

    default:
      return [{ difficulty: 'all', weight: 10 }];
  }
}

/**
 * Calculate recommendation score for a content item based on user profile
 * Higher score = better match
 */
export function calculateRecommendationScore(
  content: ContentItem,
  userProfile: UserAstronomyProfile,
  userFollowedCategories: string[] = []
): number {
  let score = 0;

  // 1. Difficulty match (0-100 points)
  const difficultyLevels = getSuitableDifficultyLevels(userProfile.astronomy_level);
  const difficultyMatch = difficultyLevels.find(
    (d) => d.difficulty === content.difficulty_level
  );
  score += (difficultyMatch?.weight || 0) * 10;

  // 2. Interest/topic match (0-50 points)
  const userTopics = [...userProfile.interests, ...userProfile.preferred_topics];
  const tagMatches = content.tags.filter((tag) =>
    userTopics.some((topic) => topic.toLowerCase() === tag.toLowerCase())
  );
  score += Math.min(tagMatches.length * 15, 50);

  // 3. Followed category bonus (0-30 points)
  if (userFollowedCategories.includes(content.category_id)) {
    score += 30;
  }

  // 4. Engagement quality (0-40 points)
  // Normalize engagement score (assuming max ~1000)
  const normalizedEngagement = Math.min(content.engagement_score / 25, 40);
  score += normalizedEngagement;

  // 5. Freshness factor (0-20 points)
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(content.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreation < 7) {
    score += 20; // Very fresh
  } else if (daysSinceCreation < 30) {
    score += 15; // Recent
  } else if (daysSinceCreation < 90) {
    score += 10; // Moderately recent
  } else {
    score += 5; // Older content
  }

  // 6. Popularity factor (0-20 points)
  const normalizedViews = Math.min(Math.log10(content.view_count + 1) * 5, 20);
  score += normalizedViews;

  return Math.round(score);
}

/**
 * Generate SQL WHERE clause for difficulty level filtering
 */
export function buildDifficultyFilter(astronomyLevel: AstronomyLevel): string {
  const suitableLevels = getSuitableDifficultyLevels(astronomyLevel);
  const levels = suitableLevels
    .filter((l) => l.weight > 0)
    .map((l) => `'${l.difficulty}'`)
    .join(', ');

  return `difficulty_level IN (${levels})`;
}

/**
 * Build SQL CASE statement for difficulty match scoring
 */
export function buildDifficultyScoreCase(astronomyLevel: AstronomyLevel): string {
  const suitableLevels = getSuitableDifficultyLevels(astronomyLevel);

  const cases = suitableLevels
    .map((l) => `WHEN difficulty_level = '${l.difficulty}' THEN ${l.weight * 10}`)
    .join('\n      ');

  return `CASE\n      ${cases}\n      ELSE 0\n    END`;
}

/**
 * Generate diversity in recommendations
 * Ensures variety across categories and content types
 */
export function diversifyRecommendations<T extends { category_id: string; contentType?: string }>(
  items: T[],
  limit: number
): T[] {
  const result: T[] = [];
  const usedCategories = new Set<string>();
  const usedTypes = new Set<string>();

  // First pass: prioritize diversity
  for (const item of items) {
    if (result.length >= limit) break;

    const categoryNew = !usedCategories.has(item.category_id);
    const typeNew = !item.contentType || !usedTypes.has(item.contentType);

    if (categoryNew || typeNew) {
      result.push(item);
      usedCategories.add(item.category_id);
      if (item.contentType) {
        usedTypes.add(item.contentType);
      }
    }
  }

  // Second pass: fill remaining slots with best remaining items
  for (const item of items) {
    if (result.length >= limit) break;
    if (!result.includes(item)) {
      result.push(item);
    }
  }

  return result;
}

/**
 * Calculate time-decay factor for trending content
 * Recent content gets higher boost
 */
export function calculateTimeDecay(createdAt: Date, halfLifeDays: number = 7): number {
  const hoursSinceCreation =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const halfLifeHours = halfLifeDays * 24;

  // Exponential decay formula: e^(-ln(2) * t / halfLife)
  return Math.exp((-Math.LN2 * hoursSinceCreation) / halfLifeHours);
}

/**
 * Calculate trending score
 * Combines engagement with recency
 */
export function calculateTrendingScore(
  engagementScore: number,
  viewCount: number,
  createdAt: Date
): number {
  const baseScore = engagementScore + viewCount * 0.1;
  const timeDecay = calculateTimeDecay(createdAt, 7);

  return Math.round(baseScore * timeDecay);
}

/**
 * Build interest match SQL fragment
 */
export function buildInterestMatchFragment(interests: string[]): string {
  if (interests.length === 0) {
    return '0';
  }

  const interestArray = interests.map((i) => `'${i.replace(/'/g, "''")}'`).join(', ');

  return `(
    SELECT COUNT(*)
    FROM unnest(tags) AS tag
    WHERE LOWER(tag) = ANY(ARRAY[${interests.map((i) => `'${i.toLowerCase().replace(/'/g, "''")}'`).join(', ')}])
  )`;
}

/**
 * Priority levels for content display
 */
export enum ContentPriority {
  CRITICAL = 'critical', // Featured, urgent news
  HIGH = 'high', // Trending, popular
  NORMAL = 'normal', // Regular content
  LOW = 'low', // Archived, older content
}

/**
 * Determine content priority based on various factors
 */
export function determineContentPriority(
  engagementScore: number,
  viewCount: number,
  daysSinceCreation: number,
  isFeatured: boolean = false
): ContentPriority {
  if (isFeatured) {
    return ContentPriority.CRITICAL;
  }

  const trendingThreshold = 100;
  const popularThreshold = 1000;

  if (daysSinceCreation < 3 && engagementScore > trendingThreshold) {
    return ContentPriority.HIGH;
  }

  if (viewCount > popularThreshold && daysSinceCreation < 30) {
    return ContentPriority.HIGH;
  }

  if (daysSinceCreation > 180) {
    return ContentPriority.LOW;
  }

  return ContentPriority.NORMAL;
}
