/**
 * News Sync Service
 * Synchronizes news articles from external APIs to the database
 */
import { Pool } from 'pg';
import { NewsArticle } from './spaceflight-news';
import winston from 'winston';
export interface NewsSyncResult {
    articlesFetched: number;
    articlesImported: number;
    articlesSkipped: number;
    articlesFailed: number;
    durationSeconds: number;
    errors: string[];
}
declare class NewsSyncService {
    private db;
    private logger;
    private spaceflightService;
    constructor(db: Pool, logger: winston.Logger);
    /**
     * Sync latest news articles
     */
    syncLatestNews(limit?: number): Promise<NewsSyncResult>;
    /**
     * Import a single news article into the database
     */
    importNewsArticle(article: NewsArticle): Promise<boolean>;
    /**
     * Get category ID by slug
     */
    private getCategoryIdBySlug;
    /**
     * Get or create system user for news bot
     */
    private getOrCreateSystemUser;
    /**
     * Get source ID by name
     */
    private getSourceIdByName;
    /**
     * Update source last synced timestamp
     */
    private updateSourceSyncTime;
    /**
     * Remove duplicate articles (same title or URL)
     */
    deduplicateArticles(): Promise<number>;
    /**
     * Get sync statistics
     */
    getSyncStats(): Promise<any>;
}
export declare function initNewsSyncService(db: Pool, logger: winston.Logger): NewsSyncService;
export declare function getNewsSyncService(): NewsSyncService;
export default NewsSyncService;
//# sourceMappingURL=news-sync.d.ts.map