/**
 * Spaceflight News API Service
 * Fetches space and astronomy news from Spaceflight News API
 * API Documentation: https://api.spaceflightnewsapi.net/v4/docs
 */
export interface SpaceflightArticle {
    id: number;
    title: string;
    url: string;
    image_url: string;
    news_site: string;
    summary: string;
    published_at: string;
    updated_at: string;
    featured: boolean;
    launches: any[];
    events: any[];
}
export interface SpaceflightApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: SpaceflightArticle[];
}
export interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    sourceUrl: string;
    sourceName: string;
    publishedAt: Date;
    tags: string[];
    category?: string;
    featured: boolean;
}
declare class SpaceflightNewsService {
    private baseUrl;
    constructor();
    /**
     * Fetch latest articles from Spaceflight News API
     */
    fetchLatestArticles(limit?: number): Promise<NewsArticle[]>;
    /**
     * Fetch a single article by ID
     */
    fetchArticleById(id: number): Promise<NewsArticle | null>;
    /**
     * Search articles by keyword
     */
    searchArticles(query: string, limit?: number): Promise<NewsArticle[]>;
    /**
     * Fetch articles published after a specific date
     */
    fetchArticlesSince(since: Date, limit?: number): Promise<NewsArticle[]>;
    /**
     * Transform API response to our internal format
     */
    private transformArticle;
    /**
     * Transform multiple articles
     */
    private transformArticles;
    /**
     * Extract tags from article based on content and metadata
     */
    private extractTags;
    /**
     * Auto-categorize article based on content
     */
    private categorizeArticle;
}
export declare function getSpaceflightNewsService(): SpaceflightNewsService;
export default SpaceflightNewsService;
//# sourceMappingURL=spaceflight-news.d.ts.map