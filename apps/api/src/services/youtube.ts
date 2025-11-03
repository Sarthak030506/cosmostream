import { google, youtube_v3 } from 'googleapis';
import { Pool } from 'pg';
import winston from 'winston';

// Types
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
  duration: string; // ISO 8601 format
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

interface QuotaUsage {
  cost: number;
  operation: string;
}

// Quota costs for different YouTube API operations
const QUOTA_COSTS = {
  search: 100,
  videoDetails: 1,
  channelDetails: 1,
  list: 1,
};

class YouTubeService {
  private youtube: youtube_v3.Youtube;
  private db: Pool;
  private logger: winston.Logger;
  private apiKey: string;
  private quotaLimit: number;

  constructor(db: Pool, logger: winston.Logger) {
    this.db = db;
    this.logger = logger;
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    this.quotaLimit = parseInt(process.env.YOUTUBE_QUOTA_LIMIT || '10000', 10);

    if (!this.apiKey) {
      throw new Error('YOUTUBE_API_KEY environment variable is not set');
    }

    // Initialize YouTube API client
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.apiKey,
    });
  }

  /**
   * Check if we have enough quota remaining for an operation
   */
  private async checkQuota(cost: number): Promise<boolean> {
    // Ensure today's quota record exists (auto-reset daily)
    await this.db.query(
      `INSERT INTO youtube_api_quota (date, quota_used, quota_limit)
       VALUES (CURRENT_DATE, 0, $1)
       ON CONFLICT (date) DO NOTHING`,
      [this.quotaLimit]
    );

    const result = await this.db.query(
      'SELECT get_youtube_quota_remaining() as remaining'
    );
    const remaining = parseInt(result.rows[0].remaining, 10);

    if (remaining < cost) {
      this.logger.warn(`Insufficient YouTube API quota. Need ${cost}, have ${remaining}`);
      return false;
    }

    return true;
  }

  /**
   * Track quota usage
   */
  private async trackQuota(usage: QuotaUsage): Promise<void> {
    try {
      await this.db.query(
        'SELECT increment_youtube_quota($1)',
        [usage.cost]
      );

      this.logger.info(`YouTube API quota used: ${usage.cost} for ${usage.operation}`);
    } catch (error) {
      this.logger.error('Failed to track quota usage:', error);
    }
  }

  /**
   * Check if a channel is blacklisted
   */
  private async isChannelBlacklisted(channelId: string): Promise<boolean> {
    const result = await this.db.query(
      'SELECT is_youtube_channel_blacklisted($1) as blacklisted',
      [channelId]
    );
    return result.rows[0].blacklisted;
  }

  /**
   * Check if a video is blacklisted
   */
  private async isVideoBlacklisted(videoId: string): Promise<boolean> {
    const result = await this.db.query(
      'SELECT is_youtube_video_blacklisted($1) as blacklisted',
      [videoId]
    );
    return result.rows[0].blacklisted;
  }

  /**
   * Parse ISO 8601 duration to seconds
   */
  private parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Search for videos by keywords
   */
  async searchVideosByKeywords(
    keywords: string[],
    options: SearchOptions = {}
  ): Promise<YouTubeVideo[]> {
    const query = keywords.join(' ');
    const maxResults = options.maxResults || 20;

    // Check quota before making request
    if (!(await this.checkQuota(QUOTA_COSTS.search))) {
      throw new Error('Insufficient YouTube API quota');
    }

    try {
      const searchResponse = await this.youtube.search.list({
        part: ['id', 'snippet'],
        q: query,
        type: ['video'],
        maxResults,
        order: options.order || 'relevance',
        publishedAfter: options.publishedAfter?.toISOString(),
        publishedBefore: options.publishedBefore?.toISOString(),
        videoDuration: options.videoDuration,
        safeSearch: options.safeSearch || 'moderate',
        videoEmbeddable: 'true',
        videoSyndicated: 'true',
      });

      await this.trackQuota({ cost: QUOTA_COSTS.search, operation: 'search' });

      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        return [];
      }

      // Get detailed video information
      const videoIds = searchResponse.data.items
        .map((item) => item.id?.videoId)
        .filter((id): id is string => !!id);

      return await this.getVideoDetails(videoIds);
    } catch (error) {
      this.logger.error('YouTube search error:', error);
      throw error;
    }
  }

  /**
   * Search videos by channel ID
   */
  async searchVideosByChannel(
    channelId: string,
    options: SearchOptions = {}
  ): Promise<YouTubeVideo[]> {
    const maxResults = options.maxResults || 20;

    // Check if channel is blacklisted
    if (await this.isChannelBlacklisted(channelId)) {
      this.logger.info(`Channel ${channelId} is blacklisted, skipping`);
      return [];
    }

    // Check quota
    if (!(await this.checkQuota(QUOTA_COSTS.search))) {
      throw new Error('Insufficient YouTube API quota');
    }

    try {
      const searchResponse = await this.youtube.search.list({
        part: ['id', 'snippet'],
        channelId,
        type: ['video'],
        maxResults,
        order: options.order || 'date',
        publishedAfter: options.publishedAfter?.toISOString(),
        videoEmbeddable: 'true',
        videoSyndicated: 'true',
      });

      await this.trackQuota({ cost: QUOTA_COSTS.search, operation: 'channel_search' });

      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        return [];
      }

      const videoIds = searchResponse.data.items
        .map((item) => item.id?.videoId)
        .filter((id): id is string => !!id);

      return await this.getVideoDetails(videoIds);
    } catch (error) {
      this.logger.error('YouTube channel search error:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for specific video IDs
   */
  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
    if (videoIds.length === 0) return [];

    // Filter out blacklisted videos
    const filteredIds: string[] = [];
    for (const videoId of videoIds) {
      if (!(await this.isVideoBlacklisted(videoId))) {
        filteredIds.push(videoId);
      }
    }

    if (filteredIds.length === 0) return [];

    // Check quota
    if (!(await this.checkQuota(QUOTA_COSTS.videoDetails))) {
      throw new Error('Insufficient YouTube API quota');
    }

    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: filteredIds,
      });

      await this.trackQuota({ cost: QUOTA_COSTS.videoDetails, operation: 'video_details' });

      if (!response.data.items) return [];

      return response.data.items
        .filter((item) => item.snippet && item.id)
        .map((item) => {
          const snippet = item.snippet!;
          const contentDetails = item.contentDetails!;
          const statistics = item.statistics!;

          return {
            id: item.id!,
            title: snippet.title || '',
            description: snippet.description || '',
            thumbnails: {
              default: snippet.thumbnails?.default?.url || '',
              medium: snippet.thumbnails?.medium?.url || '',
              high: snippet.thumbnails?.high?.url || '',
              standard: snippet.thumbnails?.standard?.url || undefined,
              maxres: snippet.thumbnails?.maxres?.url || undefined,
            },
            channelId: snippet.channelId || '',
            channelTitle: snippet.channelTitle || '',
            publishedAt: snippet.publishedAt || new Date().toISOString(),
            duration: contentDetails.duration || 'PT0S',
            durationSeconds: this.parseDuration(contentDetails.duration || 'PT0S'),
            viewCount: parseInt(statistics.viewCount || '0', 10),
            likeCount: parseInt(statistics.likeCount || '0', 10),
            commentCount: parseInt(statistics.commentCount || '0', 10),
            tags: snippet.tags,
            categoryId: snippet.categoryId || '',
            embedUrl: `https://www.youtube.com/embed/${item.id}`,
            watchUrl: `https://www.youtube.com/watch?v=${item.id}`,
          };
        });
    } catch (error) {
      this.logger.error('YouTube video details error:', error);
      throw error;
    }
  }

  /**
   * Get channel information
   */
  async getChannelInfo(channelId: string): Promise<YouTubeChannel | null> {
    // Check if channel is blacklisted
    if (await this.isChannelBlacklisted(channelId)) {
      this.logger.info(`Channel ${channelId} is blacklisted`);
      return null;
    }

    // Check quota
    if (!(await this.checkQuota(QUOTA_COSTS.channelDetails))) {
      throw new Error('Insufficient YouTube API quota');
    }

    try {
      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics'],
        id: [channelId],
      });

      await this.trackQuota({ cost: QUOTA_COSTS.channelDetails, operation: 'channel_details' });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const channel = response.data.items[0];
      const snippet = channel.snippet!;
      const statistics = channel.statistics!;

      return {
        id: channel.id!,
        title: snippet.title || '',
        description: snippet.description || '',
        subscriberCount: parseInt(statistics.subscriberCount || '0', 10),
        videoCount: parseInt(statistics.videoCount || '0', 10),
        viewCount: parseInt(statistics.viewCount || '0', 10),
        thumbnails: {
          default: snippet.thumbnails?.default?.url || '',
          medium: snippet.thumbnails?.medium?.url || '',
          high: snippet.thumbnails?.high?.url || '',
        },
      };
    } catch (error) {
      this.logger.error('YouTube channel info error:', error);
      throw error;
    }
  }

  /**
   * Get current quota usage for today
   */
  async getQuotaUsage(): Promise<{ used: number; remaining: number; limit: number }> {
    const result = await this.db.query(
      `SELECT quota_used, quota_limit
       FROM youtube_api_quota
       WHERE date = CURRENT_DATE`
    );

    if (result.rows.length === 0) {
      return { used: 0, remaining: this.quotaLimit, limit: this.quotaLimit };
    }

    const { quota_used, quota_limit } = result.rows[0];
    return {
      used: parseInt(quota_used, 10),
      remaining: Math.max(0, parseInt(quota_limit, 10) - parseInt(quota_used, 10)),
      limit: parseInt(quota_limit, 10),
    };
  }
}

// Singleton instance
let youtubeServiceInstance: YouTubeService | null = null;

export function initYouTubeService(db: Pool, logger: winston.Logger): YouTubeService {
  if (!youtubeServiceInstance) {
    youtubeServiceInstance = new YouTubeService(db, logger);
  }
  return youtubeServiceInstance;
}

export function getYouTubeService(): YouTubeService {
  if (!youtubeServiceInstance) {
    throw new Error('YouTube service not initialized. Call initYouTubeService first.');
  }
  return youtubeServiceInstance;
}

export default YouTubeService;
