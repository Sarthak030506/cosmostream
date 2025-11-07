"use strict";
/**
 * News Sync Service
 * Synchronizes news articles from external APIs to the database
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNewsSyncService = initNewsSyncService;
exports.getNewsSyncService = getNewsSyncService;
const spaceflight_news_1 = require("./spaceflight-news");
class NewsSyncService {
    db;
    logger;
    spaceflightService;
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.spaceflightService = (0, spaceflight_news_1.getSpaceflightNewsService)();
    }
    /**
     * Sync latest news articles
     */
    async syncLatestNews(limit = 50) {
        const startTime = Date.now();
        const result = {
            articlesFetched: 0,
            articlesImported: 0,
            articlesSkipped: 0,
            articlesFailed: 0,
            durationSeconds: 0,
            errors: [],
        };
        try {
            this.logger.info(`Starting news sync (limit: ${limit})`);
            // Fetch articles from Spaceflight News API
            const articles = await this.spaceflightService.fetchLatestArticles(limit);
            result.articlesFetched = articles.length;
            this.logger.info(`Fetched ${articles.length} articles from Spaceflight News API`);
            // Import each article
            for (const article of articles) {
                try {
                    const imported = await this.importNewsArticle(article);
                    if (imported) {
                        result.articlesImported++;
                    }
                    else {
                        result.articlesSkipped++;
                    }
                }
                catch (error) {
                    result.articlesFailed++;
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    result.errors.push(`Failed to import "${article.title}": ${errorMsg}`);
                    this.logger.error(`Failed to import article "${article.title}":`, error);
                }
            }
            // Update sync timestamp for source
            await this.updateSourceSyncTime('spaceflight-news-api');
            result.durationSeconds = Math.round((Date.now() - startTime) / 1000);
            this.logger.info(`News sync completed: ${result.articlesImported} imported, ${result.articlesSkipped} skipped, ${result.articlesFailed} failed`);
            return result;
        }
        catch (error) {
            result.durationSeconds = Math.round((Date.now() - startTime) / 1000);
            const errorMsg = error instanceof Error ? error.message : String(error);
            result.errors.push(errorMsg);
            this.logger.error('News sync failed:', error);
            throw error;
        }
    }
    /**
     * Import a single news article into the database
     */
    async importNewsArticle(article) {
        // Check if article already exists (by source URL)
        const existingArticle = await this.db.query('SELECT id FROM content_items WHERE source_url = $1', [article.sourceUrl]);
        if (existingArticle.rows.length > 0) {
            this.logger.debug(`Article already exists: "${article.title}"`);
            return false; // Skipped
        }
        // Get category ID
        const categoryId = await this.getCategoryIdBySlug(article.category || 'breaking-news');
        // Get or create system user for news articles
        const authorId = await this.getOrCreateSystemUser();
        // Get source ID
        const sourceId = await this.getSourceIdByName('spaceflight-news-api');
        // Insert article into content_items table
        await this.db.query(`INSERT INTO content_items (
        title,
        description,
        body_markdown,
        category_id,
        author_id,
        content_type,
        difficulty_level,
        age_group,
        tags,
        media_urls,
        source_url,
        source_id,
        published_at,
        engagement_score,
        view_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`, [
            article.title,
            article.summary,
            article.summary, // Use summary as body for now
            categoryId,
            authorId,
            'news',
            'beginner', // News articles are accessible to all levels
            'all', // News is for all age groups
            article.tags,
            JSON.stringify({ thumbnail: article.imageUrl }),
            article.sourceUrl,
            sourceId,
            article.publishedAt,
            article.featured ? 100 : 0, // Featured articles get higher engagement score
            0,
        ]);
        this.logger.info(`Imported article: "${article.title}"`);
        return true; // Imported
    }
    /**
     * Get category ID by slug
     */
    async getCategoryIdBySlug(slug) {
        const result = await this.db.query('SELECT id FROM content_categories WHERE slug = $1', [slug]);
        if (result.rows.length === 0) {
            // Fall back to "breaking-news" if category not found
            const fallbackResult = await this.db.query('SELECT id FROM content_categories WHERE slug = $1', ['breaking-news']);
            if (fallbackResult.rows.length > 0) {
                return fallbackResult.rows[0].id;
            }
            throw new Error(`Category not found: ${slug}`);
        }
        return result.rows[0].id;
    }
    /**
     * Get or create system user for news bot
     */
    async getOrCreateSystemUser() {
        const email = 'news-bot@cosmostream.internal';
        // Check if user exists
        const existingUser = await this.db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return existingUser.rows[0].id;
        }
        // Create system user
        const newUser = await this.db.query(`INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`, [email, 'system', 'CosmoStream News Bot', 'creator']);
        this.logger.info('Created system user for news bot');
        return newUser.rows[0].id;
    }
    /**
     * Get source ID by name
     */
    async getSourceIdByName(name) {
        const result = await this.db.query('SELECT id FROM news_sources WHERE name = $1', [name]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0].id;
    }
    /**
     * Update source last synced timestamp
     */
    async updateSourceSyncTime(sourceName) {
        await this.db.query('UPDATE news_sources SET last_synced_at = NOW(), updated_at = NOW() WHERE name = $1', [sourceName]);
    }
    /**
     * Remove duplicate articles (same title or URL)
     */
    async deduplicateArticles() {
        const result = await this.db.query(`
      WITH duplicates AS (
        SELECT
          id,
          ROW_NUMBER() OVER (
            PARTITION BY source_url
            ORDER BY created_at DESC
          ) as rn
        FROM content_items
        WHERE content_type = 'news' AND source_url IS NOT NULL
      )
      DELETE FROM content_items
      WHERE id IN (SELECT id FROM duplicates WHERE rn > 1)
      RETURNING id
    `);
        const deletedCount = result.rowCount || 0;
        if (deletedCount > 0) {
            this.logger.info(`Removed ${deletedCount} duplicate news articles`);
        }
        return deletedCount;
    }
    /**
     * Get sync statistics
     */
    async getSyncStats() {
        const totalArticles = await this.db.query("SELECT COUNT(*) as count FROM content_items WHERE content_type = 'news'");
        const lastSync = await this.db.query('SELECT MAX(last_synced_at) as last_sync FROM news_sources WHERE sync_enabled = TRUE');
        const recentSyncs = await this.db.query(`SELECT
        status,
        articles_fetched,
        articles_imported,
        articles_skipped,
        started_at,
        completed_at
       FROM news_sync_jobs
       ORDER BY created_at DESC
       LIMIT 10`);
        return {
            totalArticles: parseInt(totalArticles.rows[0].count),
            lastSync: lastSync.rows[0].last_sync,
            recentSyncs: recentSyncs.rows,
        };
    }
}
// Singleton instance
let newsSyncService = null;
function initNewsSyncService(db, logger) {
    if (!newsSyncService) {
        newsSyncService = new NewsSyncService(db, logger);
    }
    return newsSyncService;
}
function getNewsSyncService() {
    if (!newsSyncService) {
        throw new Error('NewsSyncService not initialized');
    }
    return newsSyncService;
}
exports.default = NewsSyncService;
//# sourceMappingURL=news-sync.js.map