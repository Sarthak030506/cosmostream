import { Context } from '../../context';
export declare const newsResolvers: {
    Query: {
        /**
         * Get latest news articles
         */
        latestNews(_: any, { limit, offset }: {
            limit?: number;
            offset?: number;
        }, { user, db }: Context): Promise<{
            items: {
                id: any;
                title: any;
                description: any;
                body_markdown: any;
                category_id: any;
                author_id: any;
                content_type: any;
                difficulty_level: any;
                age_group: any;
                tags: any;
                media_urls: any;
                video_id: any;
                engagement_score: any;
                view_count: any;
                source_url: any;
                source_id: any;
                published_at: any;
                created_at: any;
                updated_at: any;
            }[];
            hasMore: boolean;
            totalCount: number;
        }>;
        /**
         * Get featured news article (highest engagement from last 24 hours)
         */
        featuredNews(_: any, __: any, { user, db }: Context): Promise<{
            id: any;
            title: any;
            description: any;
            body_markdown: any;
            category_id: any;
            author_id: any;
            content_type: any;
            difficulty_level: any;
            age_group: any;
            tags: any;
            media_urls: any;
            video_id: any;
            engagement_score: any;
            view_count: any;
            source_url: any;
            source_id: any;
            published_at: any;
            created_at: any;
            updated_at: any;
        }>;
        /**
         * Get news by category
         */
        newsByCategory(_: any, { categorySlug, limit, offset }: {
            categorySlug: string;
            limit?: number;
            offset?: number;
        }, { user, db }: Context): Promise<{
            items: {
                id: any;
                title: any;
                description: any;
                body_markdown: any;
                category_id: any;
                author_id: any;
                content_type: any;
                difficulty_level: any;
                age_group: any;
                tags: any;
                media_urls: any;
                video_id: any;
                engagement_score: any;
                view_count: any;
                source_url: any;
                source_id: any;
                published_at: any;
                created_at: any;
                updated_at: any;
            }[];
            hasMore: boolean;
            totalCount: number;
        }>;
        /**
         * Search news articles
         */
        searchNews(_: any, { query, limit, offset }: {
            query: string;
            limit?: number;
            offset?: number;
        }, { user, db }: Context): Promise<{
            items: {
                id: any;
                title: any;
                description: any;
                body_markdown: any;
                category_id: any;
                author_id: any;
                content_type: any;
                difficulty_level: any;
                age_group: any;
                tags: any;
                media_urls: any;
                video_id: any;
                engagement_score: any;
                view_count: any;
                source_url: any;
                source_id: any;
                published_at: any;
                created_at: any;
                updated_at: any;
            }[];
            hasMore: boolean;
            totalCount: number;
        }>;
    };
};
//# sourceMappingURL=news.d.ts.map