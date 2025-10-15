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
  score: number; // 0-100 quality score
}

// Spam keywords to filter out
const SPAM_KEYWORDS = [
  'click here',
  'subscribe now',
  'limited time',
  'make money',
  'get rich',
  'free money',
  'miracle',
  'secret revealed',
  'doctors hate',
  'one weird trick',
  'shocking',
  'you won\'t believe',
];

// Inappropriate keywords for family-friendly content
const INAPPROPRIATE_KEYWORDS = [
  // Add keywords as needed for content moderation
  // This is a basic example - expand based on your needs
];

// Minimum video duration (in seconds) - filter out very short videos
const MIN_VIDEO_DURATION = 60; // 1 minute

// Maximum video duration (in seconds) - filter out extremely long videos
const MAX_VIDEO_DURATION = 7200; // 2 hours

export class YouTubeContentFilter {
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  /**
   * Check if video passes quality thresholds
   */
  checkVideoQuality(
    video: YouTubeVideo,
    threshold: QualityThreshold
  ): FilterResult {
    const checks: { name: string; passed: boolean; weight: number }[] = [];

    // Check view count
    checks.push({
      name: 'view_count',
      passed: video.viewCount >= threshold.min_views,
      weight: 20,
    });

    // Check likes ratio
    const totalEngagement = video.likeCount;
    const likesRatio = totalEngagement > 0 ? 1 : 0; // Simplified since YouTube removed dislikes
    checks.push({
      name: 'likes_ratio',
      passed: likesRatio >= threshold.min_likes_ratio || video.likeCount > 100,
      weight: 15,
    });

    // Check video duration
    const durationValid =
      video.durationSeconds >= MIN_VIDEO_DURATION &&
      video.durationSeconds <= MAX_VIDEO_DURATION;
    checks.push({
      name: 'duration',
      passed: durationValid,
      weight: 10,
    });

    // Check for spam in title/description
    const hasSpam = this.detectSpam(video.title + ' ' + video.description);
    checks.push({
      name: 'no_spam',
      passed: !hasSpam,
      weight: 25,
    });

    // Check for inappropriate content (if family_friendly is required)
    if (threshold.content_rating === 'family_friendly') {
      const hasInappropriate = this.detectInappropriateContent(
        video.title + ' ' + video.description
      );
      checks.push({
        name: 'family_friendly',
        passed: !hasInappropriate,
        weight: 30,
      });
    }

    // Calculate quality score
    const score = this.calculateScore(checks);

    // Determine if video passes
    const failedChecks = checks.filter((c) => !c.passed);
    if (failedChecks.length > 0) {
      return {
        passed: false,
        reason: `Failed checks: ${failedChecks.map((c) => c.name).join(', ')}`,
        score,
      };
    }

    return {
      passed: true,
      score,
    };
  }

  /**
   * Check if channel passes quality thresholds
   */
  async checkChannelQuality(
    channel: YouTubeChannel,
    threshold: QualityThreshold
  ): Promise<FilterResult> {
    const checks: { name: string; passed: boolean; weight: number }[] = [];

    // Check subscriber count
    checks.push({
      name: 'subscriber_count',
      passed: channel.subscriberCount >= threshold.min_subscribers,
      weight: 40,
    });

    // Check video count (should have decent amount of content)
    checks.push({
      name: 'video_count',
      passed: channel.videoCount >= 10,
      weight: 20,
    });

    // Check for spam in channel name/description
    const hasSpam = this.detectSpam(channel.title + ' ' + channel.description);
    checks.push({
      name: 'no_spam',
      passed: !hasSpam,
      weight: 20,
    });

    // Check average views per video
    const avgViews = channel.viewCount / Math.max(channel.videoCount, 1);
    checks.push({
      name: 'engagement',
      passed: avgViews >= 1000,
      weight: 20,
    });

    // Calculate quality score
    const score = this.calculateScore(checks);

    const failedChecks = checks.filter((c) => !c.passed);
    if (failedChecks.length > 0) {
      return {
        passed: false,
        reason: `Failed checks: ${failedChecks.map((c) => c.name).join(', ')}`,
        score,
      };
    }

    return {
      passed: true,
      score,
    };
  }

  /**
   * Detect spam indicators in text
   */
  private detectSpam(text: string): boolean {
    const lowerText = text.toLowerCase();

    // Check for spam keywords
    for (const keyword of SPAM_KEYWORDS) {
      if (lowerText.includes(keyword)) {
        this.logger.debug(`Spam keyword detected: ${keyword}`);
        return true;
      }
    }

    // Check for excessive capitalization (more than 50% of letters are capitals)
    const letters = text.replace(/[^a-zA-Z]/g, '');
    if (letters.length > 20) {
      const capitals = text.replace(/[^A-Z]/g, '').length;
      const ratio = capitals / letters.length;
      if (ratio > 0.5) {
        this.logger.debug('Excessive capitalization detected');
        return true;
      }
    }

    // Check for excessive exclamation marks
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 5) {
      this.logger.debug('Excessive exclamation marks detected');
      return true;
    }

    // Check for suspicious URL patterns
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlPattern) || [];
    if (urls.length > 3) {
      this.logger.debug('Too many URLs detected');
      return true;
    }

    return false;
  }

  /**
   * Detect inappropriate content for family-friendly filter
   */
  private detectInappropriateContent(text: string): boolean {
    const lowerText = text.toLowerCase();

    for (const keyword of INAPPROPRIATE_KEYWORDS) {
      if (lowerText.includes(keyword)) {
        this.logger.debug(`Inappropriate keyword detected: ${keyword}`);
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate quality score based on checks
   */
  private calculateScore(
    checks: { name: string; passed: boolean; weight: number }[]
  ): number {
    const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
    const passedWeight = checks
      .filter((c) => c.passed)
      .reduce((sum, check) => sum + check.weight, 0);

    return Math.round((passedWeight / totalWeight) * 100);
  }

  /**
   * Filter a list of videos by quality thresholds
   */
  filterVideos(
    videos: YouTubeVideo[],
    threshold: QualityThreshold
  ): { passed: YouTubeVideo[]; failed: { video: YouTubeVideo; result: FilterResult }[] } {
    const passed: YouTubeVideo[] = [];
    const failed: { video: YouTubeVideo; result: FilterResult }[] = [];

    for (const video of videos) {
      const result = this.checkVideoQuality(video, threshold);
      if (result.passed) {
        passed.push(video);
      } else {
        failed.push({ video, result });
        this.logger.debug(
          `Video "${video.title}" filtered out: ${result.reason} (score: ${result.score})`
        );
      }
    }

    return { passed, failed };
  }

  /**
   * Calculate engagement score for a video (0-100)
   * This can be used to rank videos by quality
   */
  calculateEngagementScore(video: YouTubeVideo): number {
    // Factors:
    // - View count (normalized, log scale)
    // - Like count (normalized, log scale)
    // - Comment count (normalized, log scale)
    // - Recency (newer is better)

    const viewScore = Math.min(Math.log10(video.viewCount + 1) * 10, 40);
    const likeScore = Math.min(Math.log10(video.likeCount + 1) * 5, 30);
    const commentScore = Math.min(Math.log10(video.commentCount + 1) * 3, 20);

    // Recency score (videos in last 30 days get bonus)
    const daysSincePublished =
      (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 10 - daysSincePublished / 30);

    return Math.round(viewScore + likeScore + commentScore + recencyScore);
  }

  /**
   * Deduplicate videos (e.g., same video from different searches)
   */
  deduplicateVideos(videos: YouTubeVideo[]): YouTubeVideo[] {
    const seen = new Set<string>();
    const unique: YouTubeVideo[] = [];

    for (const video of videos) {
      if (!seen.has(video.id)) {
        seen.add(video.id);
        unique.push(video);
      }
    }

    return unique;
  }

  /**
   * Sort videos by engagement score
   */
  sortByEngagement(videos: YouTubeVideo[]): YouTubeVideo[] {
    return videos
      .map((video) => ({
        video,
        score: this.calculateEngagementScore(video),
      }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.video);
  }
}

// Singleton instance
let filterInstance: YouTubeContentFilter | null = null;

export function initYouTubeContentFilter(logger: winston.Logger): YouTubeContentFilter {
  if (!filterInstance) {
    filterInstance = new YouTubeContentFilter(logger);
  }
  return filterInstance;
}

export function getYouTubeContentFilter(): YouTubeContentFilter {
  if (!filterInstance) {
    throw new Error('YouTubeContentFilter not initialized');
  }
  return filterInstance;
}

export default YouTubeContentFilter;
