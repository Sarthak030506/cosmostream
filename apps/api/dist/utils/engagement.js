"use strict";
/**
 * Engagement Scoring Utilities
 * Calculates and tracks user engagement with content
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementLevel = void 0;
exports.calculateEngagementScore = calculateEngagementScore;
exports.calculateVoteScore = calculateVoteScore;
exports.calculateEngagementRate = calculateEngagementRate;
exports.calculateViralityCoefficient = calculateViralityCoefficient;
exports.calculateQualityScore = calculateQualityScore;
exports.calculateEngagementVelocity = calculateEngagementVelocity;
exports.predictFutureEngagement = predictFutureEngagement;
exports.classifyEngagementLevel = classifyEngagementLevel;
exports.calculateShareWorthiness = calculateShareWorthiness;
exports.generateEngagementInsights = generateEngagementInsights;
exports.calculateCommunityHealthScore = calculateCommunityHealthScore;
/**
 * Calculate weighted engagement score
 * Formula: (upvotes * 3) + (shares * 5) + (bookmarks * 2) - (downvotes * 2) + (views * 0.1)
 */
function calculateEngagementScore(upvotes, downvotes, shares, bookmarks, views) {
    const score = upvotes * 3 + shares * 5 + bookmarks * 2 - downvotes * 2 + Math.floor(views * 0.1);
    // Ensure score is never negative
    return Math.max(score, 0);
}
/**
 * Calculate vote score (net positive/negative sentiment)
 */
function calculateVoteScore(upvotes, downvotes) {
    return upvotes - downvotes;
}
/**
 * Calculate engagement rate (percentage of viewers who engaged)
 */
function calculateEngagementRate(totalEngagements, totalViews) {
    if (totalViews === 0)
        return 0;
    return Math.round((totalEngagements / totalViews) * 10000) / 100; // Return as percentage with 2 decimals
}
/**
 * Calculate virality coefficient
 * Measures how likely content is to be shared
 */
function calculateViralityCoefficient(shares, views) {
    if (views === 0)
        return 0;
    return Math.round((shares / views) * 10000) / 100; // Return as percentage
}
/**
 * Calculate content quality score (0-100)
 * Based on engagement patterns
 */
function calculateQualityScore(upvotes, downvotes, bookmarks, views) {
    const totalVotes = upvotes + downvotes;
    if (totalVotes === 0 && views === 0)
        return 50; // Neutral for new content
    // Upvote ratio (0-50 points)
    const upvoteRatio = totalVotes > 0 ? (upvotes / totalVotes) * 50 : 25;
    // Bookmark rate (0-30 points)
    const bookmarkRate = views > 0 ? Math.min((bookmarks / views) * 1000, 30) : 0;
    // Engagement depth (0-20 points)
    const engagementDepth = views > 0 ? Math.min((totalVotes / views) * 200, 20) : 0;
    const score = upvoteRatio + bookmarkRate + engagementDepth;
    return Math.round(Math.min(Math.max(score, 0), 100));
}
/**
 * Engagement velocity - how fast content is gaining engagement
 * Returns engagements per day
 */
function calculateEngagementVelocity(totalEngagements, daysSinceCreation) {
    if (daysSinceCreation === 0)
        return totalEngagements; // First day
    return Math.round((totalEngagements / daysSinceCreation) * 100) / 100;
}
/**
 * Predict future engagement based on current trajectory
 */
function predictFutureEngagement(currentEngagement, velocity, daysAhead, decayFactor = 0.95 // Engagement typically slows over time
) {
    let predicted = currentEngagement;
    for (let day = 1; day <= daysAhead; day++) {
        const dailyIncrease = velocity * Math.pow(decayFactor, day - 1);
        predicted += dailyIncrease;
    }
    return Math.round(predicted);
}
/**
 * Category for engagement level
 */
var EngagementLevel;
(function (EngagementLevel) {
    EngagementLevel["VIRAL"] = "viral";
    EngagementLevel["HIGH"] = "high";
    EngagementLevel["MODERATE"] = "moderate";
    EngagementLevel["LOW"] = "low";
    EngagementLevel["MINIMAL"] = "minimal";
})(EngagementLevel || (exports.EngagementLevel = EngagementLevel = {}));
/**
 * Classify content by engagement level
 */
function classifyEngagementLevel(engagementScore, viewCount) {
    const engagementRate = viewCount > 0 ? engagementScore / viewCount : 0;
    if (engagementRate > 5 || (engagementScore > 500 && viewCount > 100)) {
        return EngagementLevel.VIRAL;
    }
    if (engagementRate > 2 || (engagementScore > 200 && viewCount > 50)) {
        return EngagementLevel.HIGH;
    }
    if (engagementRate > 0.5 || engagementScore > 50) {
        return EngagementLevel.MODERATE;
    }
    if (engagementScore > 10) {
        return EngagementLevel.LOW;
    }
    return EngagementLevel.MINIMAL;
}
/**
 * Calculate share-worthiness score
 * Predicts likelihood that users will share this content
 */
function calculateShareWorthiness(title, description, tags, currentShares, currentViews) {
    let score = 0;
    // Title engagement factors
    const titleWords = title.split(' ').length;
    if (titleWords >= 6 && titleWords <= 12)
        score += 15; // Optimal length
    if (title.includes('?'))
        score += 10; // Questions engage
    if (/^\d+/.test(title))
        score += 10; // Lists/numbers attract attention
    if (title.toLowerCase().includes('discover') || title.toLowerCase().includes('amazing')) {
        score += 5;
    }
    // Description quality
    if (description && description.length > 100 && description.length < 300)
        score += 10;
    // Tag relevance
    score += Math.min(tags.length * 3, 15);
    // Current performance
    const shareRate = currentViews > 0 ? (currentShares / currentViews) * 100 : 0;
    score += Math.min(shareRate * 10, 30);
    return Math.round(Math.min(score, 100));
}
function generateEngagementInsights(upvotes, downvotes, shares, bookmarks, views, daysSinceCreation) {
    const score = calculateEngagementScore(upvotes, downvotes, shares, bookmarks, views);
    const level = classifyEngagementLevel(score, views);
    const qualityScore = calculateQualityScore(upvotes, downvotes, bookmarks, views);
    const viralityCoefficient = calculateViralityCoefficient(shares, views);
    const velocity = calculateEngagementVelocity(upvotes + shares + bookmarks, daysSinceCreation);
    const predictedScore7Days = predictFutureEngagement(score, velocity, 7);
    const recommendations = [];
    // Generate recommendations
    if (qualityScore < 50) {
        recommendations.push('Consider improving content quality or relevance');
    }
    if (viralityCoefficient < 1) {
        recommendations.push('Add share-worthy elements (visuals, surprising facts, clear value)');
    }
    if (views > 100 && upvotes + downvotes < views * 0.05) {
        recommendations.push('Encourage user feedback and interaction');
    }
    if (bookmarks < views * 0.02) {
        recommendations.push('Make content more reference-worthy (add detailed guides, resources)');
    }
    if (daysSinceCreation > 7 && velocity < 1) {
        recommendations.push('Promote content through featured placement or announcements');
    }
    return {
        score,
        level,
        qualityScore,
        viralityCoefficient,
        velocity,
        predictedScore7Days,
        recommendations,
    };
}
/**
 * Calculate community health score based on voting patterns
 */
function calculateCommunityHealthScore(totalUpvotes, totalDownvotes, totalPosts) {
    if (totalPosts === 0)
        return 50; // Neutral
    const votingRate = (totalUpvotes + totalDownvotes) / totalPosts;
    const positivityRatio = totalUpvotes + totalDownvotes > 0
        ? totalUpvotes / (totalUpvotes + totalDownvotes)
        : 0.5;
    // Higher voting rate = more engaged community (0-50 points)
    const engagementScore = Math.min(votingRate * 25, 50);
    // Positive ratio should be high but not 100% (0-50 points)
    // 80-90% positive is ideal
    let positivityScore = 0;
    if (positivityRatio >= 0.8 && positivityRatio <= 0.95) {
        positivityScore = 50;
    }
    else if (positivityRatio >= 0.7 && positivityRatio < 0.8) {
        positivityScore = 40;
    }
    else if (positivityRatio >= 0.6) {
        positivityScore = 30;
    }
    else {
        positivityScore = 10;
    }
    return Math.round(engagementScore + positivityScore);
}
//# sourceMappingURL=engagement.js.map