"use strict";
/**
 * Spaceflight News API Service
 * Fetches space and astronomy news from Spaceflight News API
 * API Documentation: https://api.spaceflightnewsapi.net/v4/docs
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpaceflightNewsService = getSpaceflightNewsService;
const axios_1 = __importDefault(require("axios"));
const SPACEFLIGHT_API_BASE_URL = process.env.SPACEFLIGHT_NEWS_API_URL || 'https://api.spaceflightnewsapi.net/v4';
class SpaceflightNewsService {
    baseUrl;
    constructor() {
        this.baseUrl = SPACEFLIGHT_API_BASE_URL;
    }
    /**
     * Fetch latest articles from Spaceflight News API
     */
    async fetchLatestArticles(limit = 50) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/articles`, {
                params: {
                    limit,
                    ordering: '-published_at', // Most recent first
                },
                timeout: 10000,
            });
            return this.transformArticles(response.data.results);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Spaceflight News API error: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Fetch a single article by ID
     */
    async fetchArticleById(id) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/articles/${id}`, {
                timeout: 10000,
            });
            return this.transformArticle(response.data);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
    /**
     * Search articles by keyword
     */
    async searchArticles(query, limit = 20) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/articles`, {
                params: {
                    limit,
                    search: query,
                    ordering: '-published_at',
                },
                timeout: 10000,
            });
            return this.transformArticles(response.data.results);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Spaceflight News API search error: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Fetch articles published after a specific date
     */
    async fetchArticlesSince(since, limit = 100) {
        try {
            const isoDate = since.toISOString();
            const response = await axios_1.default.get(`${this.baseUrl}/articles`, {
                params: {
                    limit,
                    published_at_gte: isoDate,
                    ordering: '-published_at',
                },
                timeout: 10000,
            });
            return this.transformArticles(response.data.results);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Spaceflight News API error: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Transform API response to our internal format
     */
    transformArticle(article) {
        return {
            id: article.id.toString(),
            title: article.title,
            summary: article.summary,
            imageUrl: article.image_url,
            sourceUrl: article.url,
            sourceName: article.news_site,
            publishedAt: new Date(article.published_at),
            tags: this.extractTags(article),
            category: this.categorizeArticle(article),
            featured: article.featured,
        };
    }
    /**
     * Transform multiple articles
     */
    transformArticles(articles) {
        return articles.map((article) => this.transformArticle(article));
    }
    /**
     * Extract tags from article based on content and metadata
     */
    extractTags(article) {
        const tags = new Set();
        // Add source as tag
        tags.add(article.news_site.toLowerCase());
        // Extract from launches
        if (article.launches && article.launches.length > 0) {
            tags.add('launch');
            tags.add('mission');
        }
        // Extract from events
        if (article.events && article.events.length > 0) {
            tags.add('event');
        }
        // Featured articles
        if (article.featured) {
            tags.add('featured');
        }
        // Common space keywords
        const lowerTitle = article.title.toLowerCase();
        const lowerSummary = article.summary.toLowerCase();
        const combined = `${lowerTitle} ${lowerSummary}`;
        const keywordMap = {
            'nasa': ['nasa'],
            'spacex': ['spacex'],
            'esa': ['esa', 'european space agency'],
            'roscosmos': ['roscosmos', 'russia'],
            'isro': ['isro', 'india'],
            'mars': ['mars', 'martian'],
            'moon': ['moon', 'lunar'],
            'iss': ['iss', 'international space station', 'space station'],
            'hubble': ['hubble', 'hst'],
            'jwst': ['jwst', 'james webb', 'webb telescope'],
            'exoplanet': ['exoplanet', 'extrasolar planet'],
            'black hole': ['black hole'],
            'galaxy': ['galaxy', 'galaxies'],
            'asteroid': ['asteroid'],
            'comet': ['comet'],
            'meteor': ['meteor', 'meteorite'],
            'telescope': ['telescope'],
            'rocket': ['rocket'],
            'satellite': ['satellite'],
        };
        for (const [tag, keywords] of Object.entries(keywordMap)) {
            if (keywords.some((keyword) => combined.includes(keyword))) {
                tags.add(tag);
            }
        }
        return Array.from(tags);
    }
    /**
     * Auto-categorize article based on content
     */
    categorizeArticle(article) {
        const lowerTitle = article.title.toLowerCase();
        const lowerSummary = article.summary.toLowerCase();
        const combined = `${lowerTitle} ${lowerSummary}`;
        // Breaking news keywords
        if (combined.includes('breaking') ||
            combined.includes('urgent') ||
            combined.includes('just now') ||
            article.featured) {
            return 'breaking-news';
        }
        // Launches and missions
        if ((article.launches && article.launches.length > 0) ||
            combined.includes('launch') ||
            combined.includes('mission') ||
            combined.includes('spacecraft') ||
            combined.includes('rover')) {
            return 'mission-updates';
        }
        // Discoveries
        if (combined.includes('discover') ||
            combined.includes('found') ||
            combined.includes('detect') ||
            combined.includes('exoplanet') ||
            combined.includes('black hole') ||
            combined.includes('new planet')) {
            return 'discoveries';
        }
        // Research and papers
        if (combined.includes('research') ||
            combined.includes('study') ||
            combined.includes('paper') ||
            combined.includes('scientists')) {
            return 'research-papers';
        }
        // Astronomical events
        if (combined.includes('eclipse') ||
            combined.includes('meteor shower') ||
            combined.includes('alignment') ||
            combined.includes('comet') ||
            (article.events && article.events.length > 0)) {
            return 'astronomical-events';
        }
        // Telescopes
        if (combined.includes('telescope') ||
            combined.includes('observatory') ||
            combined.includes('hubble') ||
            combined.includes('webb') ||
            combined.includes('jwst')) {
            return 'telescopes-observatories';
        }
        // Technology
        if (combined.includes('technology') ||
            combined.includes('innovation') ||
            combined.includes('satellite') ||
            combined.includes('propulsion')) {
            return 'technology-innovation';
        }
        // Space industry
        if (combined.includes('commercial') ||
            combined.includes('industry') ||
            combined.includes('startup') ||
            combined.includes('funding') ||
            combined.includes('policy')) {
            return 'space-industry';
        }
        // Default to breaking news
        return 'breaking-news';
    }
}
// Singleton instance
let spaceflightNewsService = null;
function getSpaceflightNewsService() {
    if (!spaceflightNewsService) {
        spaceflightNewsService = new SpaceflightNewsService();
    }
    return spaceflightNewsService;
}
exports.default = SpaceflightNewsService;
//# sourceMappingURL=spaceflight-news.js.map