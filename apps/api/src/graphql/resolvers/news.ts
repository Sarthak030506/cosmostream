import { Context } from '../../context';
import { GraphQLError } from 'graphql';

export const newsResolvers = {
  Query: {
    /**
     * Get latest news articles
     */
    async latestNews(
      _: any,
      { limit = 20, offset = 0 }: { limit?: number; offset?: number },
      { user, db }: Context
    ) {
      // News is publicly accessible - no authentication required

      // Query news articles
      const query = `
        SELECT
          ci.id,
          ci.title,
          ci.description,
          ci.body_markdown,
          ci.category_id,
          ci.author_id,
          ci.content_type,
          ci.difficulty_level,
          ci.age_group,
          ci.tags,
          ci.media_urls,
          ci.video_id,
          ci.engagement_score,
          ci.view_count,
          ci.source_url,
          ci.source_id,
          ci.published_at,
          ci.created_at,
          ci.updated_at
        FROM content_items ci
        WHERE ci.content_type = 'news'
        ORDER BY COALESCE(ci.published_at, ci.created_at) DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await db.query(query, [Math.min(limit, 100), offset]);

      // Get total count
      const countResult = await db.query(
        "SELECT COUNT(*) as total FROM content_items WHERE content_type = 'news'"
      );
      const totalCount = parseInt(countResult.rows[0].total);

      const items = result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        body_markdown: row.body_markdown,
        category_id: row.category_id,
        author_id: row.author_id,
        content_type: row.content_type,
        difficulty_level: row.difficulty_level,
        age_group: row.age_group,
        tags: row.tags,
        media_urls: row.media_urls,
        video_id: row.video_id,
        engagement_score: row.engagement_score,
        view_count: row.view_count,
        source_url: row.source_url,
        source_id: row.source_id,
        published_at: row.published_at || row.created_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      return {
        items,
        hasMore: offset + items.length < totalCount,
        totalCount,
      };
    },

    /**
     * Get featured news article (highest engagement from last 24 hours)
     */
    async featuredNews(_: any, __: any, { user, db }: Context) {
      // News is publicly accessible - no authentication required

      const query = `
        SELECT
          ci.id,
          ci.title,
          ci.description,
          ci.body_markdown,
          ci.category_id,
          ci.author_id,
          ci.content_type,
          ci.difficulty_level,
          ci.age_group,
          ci.tags,
          ci.media_urls,
          ci.video_id,
          ci.engagement_score,
          ci.view_count,
          ci.source_url,
          ci.source_id,
          ci.published_at,
          ci.created_at,
          ci.updated_at
        FROM content_items ci
        WHERE ci.content_type = 'news'
          AND COALESCE(ci.published_at, ci.created_at) > NOW() - INTERVAL '24 hours'
        ORDER BY ci.engagement_score DESC, ci.view_count DESC
        LIMIT 1
      `;

      const result = await db.query(query);

      if (result.rows.length === 0) {
        // Fall back to most recent if no featured in last 24h
        const fallbackQuery = `
          SELECT
            ci.id,
            ci.title,
            ci.description,
            ci.body_markdown,
            ci.category_id,
            ci.author_id,
            ci.content_type,
            ci.difficulty_level,
            ci.age_group,
            ci.tags,
            ci.media_urls,
            ci.video_id,
            ci.engagement_score,
            ci.view_count,
            ci.source_url,
            ci.source_id,
            ci.published_at,
            ci.created_at,
            ci.updated_at
          FROM content_items ci
          WHERE ci.content_type = 'news'
          ORDER BY COALESCE(ci.published_at, ci.created_at) DESC
          LIMIT 1
        `;

        const fallbackResult = await db.query(fallbackQuery);
        if (fallbackResult.rows.length === 0) {
          return null;
        }

        const row = fallbackResult.rows[0];
        return {
          id: row.id,
          title: row.title,
          description: row.description,
          body_markdown: row.body_markdown,
          category_id: row.category_id,
          author_id: row.author_id,
          content_type: row.content_type,
          difficulty_level: row.difficulty_level,
          age_group: row.age_group,
          tags: row.tags,
          media_urls: row.media_urls,
          video_id: row.video_id,
          engagement_score: row.engagement_score,
          view_count: row.view_count,
          source_url: row.source_url,
          source_id: row.source_id,
          published_at: row.published_at || row.created_at,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      }

      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        body_markdown: row.body_markdown,
        category_id: row.category_id,
        author_id: row.author_id,
        content_type: row.content_type,
        difficulty_level: row.difficulty_level,
        age_group: row.age_group,
        tags: row.tags,
        media_urls: row.media_urls,
        video_id: row.video_id,
        engagement_score: row.engagement_score,
        view_count: row.view_count,
        source_url: row.source_url,
        source_id: row.source_id,
        published_at: row.published_at || row.created_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    },

    /**
     * Get news by category
     */
    async newsByCategory(
      _: any,
      { categorySlug, limit = 20, offset = 0 }: { categorySlug: string; limit?: number; offset?: number },
      { user, db }: Context
    ) {
      // News is publicly accessible - no authentication required

      // Get category ID
      const categoryResult = await db.query(
        'SELECT id FROM content_categories WHERE slug = $1',
        [categorySlug]
      );

      if (categoryResult.rows.length === 0) {
        throw new GraphQLError('Category not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const categoryId = categoryResult.rows[0].id;

      const query = `
        SELECT
          ci.id,
          ci.title,
          ci.description,
          ci.body_markdown,
          ci.category_id,
          ci.author_id,
          ci.content_type,
          ci.difficulty_level,
          ci.age_group,
          ci.tags,
          ci.media_urls,
          ci.video_id,
          ci.engagement_score,
          ci.view_count,
          ci.source_url,
          ci.source_id,
          ci.published_at,
          ci.created_at,
          ci.updated_at
        FROM content_items ci
        WHERE ci.content_type = 'news' AND ci.category_id = $1
        ORDER BY COALESCE(ci.published_at, ci.created_at) DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await db.query(query, [categoryId, Math.min(limit, 100), offset]);

      // Get total count
      const countResult = await db.query(
        "SELECT COUNT(*) as total FROM content_items WHERE content_type = 'news' AND category_id = $1",
        [categoryId]
      );
      const totalCount = parseInt(countResult.rows[0].total);

      const items = result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        body_markdown: row.body_markdown,
        category_id: row.category_id,
        author_id: row.author_id,
        content_type: row.content_type,
        difficulty_level: row.difficulty_level,
        age_group: row.age_group,
        tags: row.tags,
        media_urls: row.media_urls,
        video_id: row.video_id,
        engagement_score: row.engagement_score,
        view_count: row.view_count,
        source_url: row.source_url,
        source_id: row.source_id,
        published_at: row.published_at || row.created_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      return {
        items,
        hasMore: offset + items.length < totalCount,
        totalCount,
      };
    },

    /**
     * Search news articles
     */
    async searchNews(
      _: any,
      { query, limit = 20, offset = 0 }: { query: string; limit?: number; offset?: number },
      { user, db }: Context
    ) {
      // News is publicly accessible - no authentication required

      const searchQuery = `
        SELECT
          ci.id,
          ci.title,
          ci.description,
          ci.body_markdown,
          ci.category_id,
          ci.author_id,
          ci.content_type,
          ci.difficulty_level,
          ci.age_group,
          ci.tags,
          ci.media_urls,
          ci.video_id,
          ci.engagement_score,
          ci.view_count,
          ci.source_url,
          ci.source_id,
          ci.published_at,
          ci.created_at,
          ci.updated_at
        FROM content_items ci
        WHERE ci.content_type = 'news'
          AND (
            ci.title ILIKE $1
            OR ci.description ILIKE $1
            OR $2 = ANY(ci.tags)
          )
        ORDER BY COALESCE(ci.published_at, ci.created_at) DESC
        LIMIT $3 OFFSET $4
      `;

      const searchPattern = `%${query}%`;
      const result = await db.query(searchQuery, [
        searchPattern,
        query.toLowerCase(),
        Math.min(limit, 100),
        offset,
      ]);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM content_items ci
        WHERE ci.content_type = 'news'
          AND (
            ci.title ILIKE $1
            OR ci.description ILIKE $1
            OR $2 = ANY(ci.tags)
          )
      `;
      const countResult = await db.query(countQuery, [searchPattern, query.toLowerCase()]);
      const totalCount = parseInt(countResult.rows[0].total);

      const items = result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        body_markdown: row.body_markdown,
        category_id: row.category_id,
        author_id: row.author_id,
        content_type: row.content_type,
        difficulty_level: row.difficulty_level,
        age_group: row.age_group,
        tags: row.tags,
        media_urls: row.media_urls,
        video_id: row.video_id,
        engagement_score: row.engagement_score,
        view_count: row.view_count,
        source_url: row.source_url,
        source_id: row.source_id,
        published_at: row.published_at || row.created_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      return {
        items,
        hasMore: offset + items.length < totalCount,
        totalCount,
      };
    },
  },
};
