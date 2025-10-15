import { Context } from '../../context';
import { GraphQLError } from 'graphql';
import {
  getSuitableDifficultyLevels,
  buildDifficultyScoreCase,
  buildDifficultyFilter,
  buildInterestMatchFragment,
  diversifyRecommendations,
  calculateTrendingScore,
} from '../../utils/recommendations';

export const contentResolvers = {
  Query: {
    // ====================================
    // CATEGORY QUERIES
    // ====================================

    async categories(
      _: any,
      {
        parentId,
        difficultyLevel,
        featured,
        limit = 50,
        offset = 0,
      }: {
        parentId?: string;
        difficultyLevel?: string;
        featured?: boolean;
        limit?: number;
        offset?: number;
      },
      { db }: Context
    ) {
      let query = `
        SELECT cc.*,
          (SELECT COUNT(*) FROM content_items WHERE category_id = cc.id) as content_count,
          (SELECT COUNT(*) FROM category_follows WHERE category_id = cc.id) as follower_count
        FROM content_categories cc
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 1;

      if (parentId) {
        query += ` AND parent_category_id = $${paramCount++}`;
        params.push(parentId);
      } else if (parentId === null) {
        query += ` AND parent_category_id IS NULL`;
      }

      if (difficultyLevel) {
        query += ` AND difficulty_level = $${paramCount++}`;
        params.push(difficultyLevel.toLowerCase());
      }

      if (featured !== undefined) {
        query += ` AND is_featured = $${paramCount++}`;
        params.push(featured);
      }

      query += ` ORDER BY sort_order ASC, name ASC LIMIT $${paramCount++} OFFSET $${paramCount}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    },

    async category(
      _: any,
      { id, slug }: { id?: string; slug?: string },
      { db }: Context
    ) {
      if (!id && !slug) {
        throw new GraphQLError('Must provide either id or slug');
      }

      const query = `
        SELECT cc.*,
          (SELECT COUNT(*) FROM content_items WHERE category_id = cc.id) as content_count,
          (SELECT COUNT(*) FROM category_follows WHERE category_id = cc.id) as follower_count
        FROM content_categories cc
        WHERE ${id ? 'id = $1' : 'slug = $1'}
      `;

      const result = await db.query(query, [id || slug]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    },

    async categoryStats(_: any, __: any, { db }: Context) {
      // Total categories
      const totalResult = await db.query('SELECT COUNT(*) as count FROM content_categories');
      const totalCategories = parseInt(totalResult.rows[0].count);

      // By difficulty
      const difficultyResult = await db.query(`
        SELECT difficulty_level, COUNT(*) as count
        FROM content_categories
        GROUP BY difficulty_level
        ORDER BY count DESC
      `);

      // By age group
      const ageGroupResult = await db.query(`
        SELECT age_group, COUNT(*) as count
        FROM content_categories
        GROUP BY age_group
        ORDER BY count DESC
      `);

      // Most popular (by follower count)
      const popularResult = await db.query(`
        SELECT cc.*,
          (SELECT COUNT(*) FROM content_items WHERE category_id = cc.id) as content_count,
          (SELECT COUNT(*) FROM category_follows WHERE category_id = cc.id) as follower_count
        FROM content_categories cc
        ORDER BY follower_count DESC, content_count DESC
        LIMIT 10
      `);

      return {
        totalCategories,
        byDifficulty: difficultyResult.rows.map((row) => ({
          difficulty: row.difficulty_level.toUpperCase(),
          count: parseInt(row.count),
        })),
        byAgeGroup: ageGroupResult.rows.map((row) => ({
          ageGroup: row.age_group.toUpperCase(),
          count: parseInt(row.count),
        })),
        mostPopular: popularResult.rows,
      };
    },

    // ====================================
    // CONTENT ITEM QUERIES
    // ====================================

    async contentItem(_: any, { id }: { id: string }, { db, user }: Context) {
      const query = `
        SELECT ci.*,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = 1) as upvote_count,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = -1) as downvote_count,
          (SELECT COUNT(*) FROM content_shares WHERE content_item_id = ci.id) as share_count,
          (SELECT COUNT(*) FROM content_bookmarks WHERE content_item_id = ci.id) as bookmark_count
          ${user ? `, (SELECT value FROM content_votes WHERE content_item_id = ci.id AND user_id = $2) as user_vote` : ''}
          ${user ? `, EXISTS(SELECT 1 FROM content_bookmarks WHERE content_item_id = ci.id AND user_id = $2) as is_bookmarked` : ''}
        FROM content_items ci
        WHERE ci.id = $1
      `;

      const params = user ? [id, user.id] : [id];
      const result = await db.query(query, params);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    },

    async discoverContent(
      _: any,
      {
        filters = {},
        sortBy = 'TRENDING',
        limit = 20,
        offset = 0,
      }: {
        filters?: any;
        sortBy?: string;
        limit?: number;
        offset?: number;
      },
      { db, user }: Context
    ) {
      let query = `
        SELECT ci.*,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = 1) as upvote_count,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = -1) as downvote_count,
          (SELECT COUNT(*) FROM content_shares WHERE content_item_id = ci.id) as share_count,
          (SELECT COUNT(*) FROM content_bookmarks WHERE content_item_id = ci.id) as bookmark_count
          ${user ? `, (SELECT value FROM content_votes WHERE content_item_id = ci.id AND user_id = $${user ? '999' : '0'}) as user_vote` : ''}
          ${user ? `, EXISTS(SELECT 1 FROM content_bookmarks WHERE content_item_id = ci.id AND user_id = $${user ? '999' : '0'}) as is_bookmarked` : ''}
        FROM content_items ci
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramCount = 1;

      // Apply filters
      if (filters.categoryId) {
        query += ` AND ci.category_id = $${paramCount++}`;
        params.push(filters.categoryId);
      }

      if (filters.categorySlug) {
        query += ` AND ci.category_id = (SELECT id FROM content_categories WHERE slug = $${paramCount++})`;
        params.push(filters.categorySlug);
      }

      if (filters.difficultyLevel) {
        query += ` AND ci.difficulty_level = $${paramCount++}`;
        params.push(filters.difficultyLevel.toLowerCase());
      }

      if (filters.ageGroup) {
        query += ` AND ci.age_group = $${paramCount++}`;
        params.push(filters.ageGroup.toLowerCase());
      }

      if (filters.contentType) {
        query += ` AND ci.content_type = $${paramCount++}`;
        params.push(filters.contentType.toLowerCase());
      }

      if (filters.authorId) {
        query += ` AND ci.author_id = $${paramCount++}`;
        params.push(filters.authorId);
      }

      if (filters.tags && filters.tags.length > 0) {
        query += ` AND ci.tags && $${paramCount++}::text[]`;
        params.push(filters.tags);
      }

      // Get total count for pagination - build count query manually to match params
      let countQuery = `SELECT COUNT(*) as total FROM content_items ci WHERE 1=1`;
      let countParamNum = 1;

      if (filters.categoryId) {
        countQuery += ` AND ci.category_id = $${countParamNum++}`;
      }
      if (filters.categorySlug) {
        countQuery += ` AND ci.category_id = (SELECT id FROM content_categories WHERE slug = $${countParamNum++})`;
      }
      if (filters.difficultyLevel) {
        countQuery += ` AND ci.difficulty_level = $${countParamNum++}`;
      }
      if (filters.ageGroup) {
        countQuery += ` AND ci.age_group = $${countParamNum++}`;
      }
      if (filters.contentType) {
        countQuery += ` AND ci.content_type = $${countParamNum++}`;
      }
      if (filters.authorId) {
        countQuery += ` AND ci.author_id = $${countParamNum++}`;
      }
      if (filters.tags && filters.tags.length > 0) {
        countQuery += ` AND ci.tags && $${countParamNum++}::text[]`;
      }

      const countResult = await db.query(countQuery, params);
      const totalCount = parseInt(countResult.rows[0].total);

      // Replace user ID placeholder if user exists (BEFORE adding pagination)
      if (user) {
        query = query.replace(/\$999/g, `$${paramCount}`);
        params.push(user.id); // Only push once since $999 is reused for both user_vote and is_bookmarked
        paramCount += 1; // Increment by 1
      }

      // Apply sorting
      switch (sortBy) {
        case 'TRENDING':
          query += ` ORDER BY ci.engagement_score DESC, ci.created_at DESC`;
          break;
        case 'RECENT':
          query += ` ORDER BY ci.created_at DESC`;
          break;
        case 'POPULAR':
          query += ` ORDER BY ci.view_count DESC, ci.engagement_score DESC`;
          break;
        case 'ENGAGEMENT':
          query += ` ORDER BY ci.engagement_score DESC`;
          break;
        default:
          query += ` ORDER BY ci.created_at DESC`;
      }

      // Add pagination
      query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return {
        items: result.rows,
        hasMore: offset + limit < totalCount,
        totalCount,
      };
    },

    async searchContent(
      _: any,
      {
        query: searchQuery,
        filters = {},
        limit = 20,
        offset = 0,
      }: { query: string; filters?: any; limit?: number; offset?: number },
      { db, user }: Context
    ) {
      let query = `
        SELECT ci.*,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = 1) as upvote_count,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = -1) as downvote_count,
          (SELECT COUNT(*) FROM content_shares WHERE content_item_id = ci.id) as share_count,
          (SELECT COUNT(*) FROM content_bookmarks WHERE content_item_id = ci.id) as bookmark_count,
          ts_rank(
            to_tsvector('english', ci.title || ' ' || COALESCE(ci.description, '') || ' ' || COALESCE(ci.body_markdown, '')),
            plainto_tsquery('english', $1)
          ) as search_rank
        FROM content_items ci
        WHERE to_tsvector('english', ci.title || ' ' || COALESCE(ci.description, '') || ' ' || COALESCE(ci.body_markdown, ''))
          @@ plainto_tsquery('english', $1)
      `;

      const params: any[] = [searchQuery];
      let paramCount = 2;

      // Apply additional filters (same as discoverContent)
      if (filters.categoryId) {
        query += ` AND ci.category_id = $${paramCount++}`;
        params.push(filters.categoryId);
      }

      if (filters.difficultyLevel) {
        query += ` AND ci.difficulty_level = $${paramCount++}`;
        params.push(filters.difficultyLevel.toLowerCase());
      }

      if (filters.contentType) {
        query += ` AND ci.content_type = $${paramCount++}`;
        params.push(filters.contentType.toLowerCase());
      }

      query += ` ORDER BY search_rank DESC, ci.engagement_score DESC`;

      // Get total count
      const countQuery = query.replace(
        /SELECT ci\.\*.*FROM/s,
        'SELECT COUNT(*) as total FROM'
      );
      const countResult = await db.query(countQuery, params);
      const totalCount = parseInt(countResult.rows[0].total);

      // Add pagination
      query += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return {
        items: result.rows,
        hasMore: offset + limit < totalCount,
        totalCount,
      };
    },

    // ====================================
    // PERSONALIZED RECOMMENDATIONS
    // ====================================

    async recommendedForMe(
      _: any,
      { limit = 20 }: { limit?: number },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Get user's astronomy profile
      const profileResult = await db.query(
        'SELECT * FROM user_astronomy_profiles WHERE user_id = $1',
        [user.id]
      );

      // If no profile, return trending content
      if (profileResult.rows.length === 0) {
        const fallbackResult = await db.query(
          `SELECT ci.*,
            (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = 1) as upvote_count,
            (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = -1) as downvote_count
           FROM content_items ci
           ORDER BY ci.engagement_score DESC
           LIMIT $1`,
          [limit]
        );
        return fallbackResult.rows;
      }

      const profile = profileResult.rows[0];

      // Get followed categories
      const followedCategoriesResult = await db.query(
        'SELECT category_id FROM category_follows WHERE user_id = $1',
        [user.id]
      );
      const followedCategoryIds = followedCategoriesResult.rows.map((r) => r.category_id);

      // Build recommendation query
      const difficultyScoreCase = buildDifficultyScoreCase(profile.astronomy_level);
      const interestMatchFragment = buildInterestMatchFragment([
        ...profile.interests,
        ...profile.preferred_topics,
      ]);

      const query = `
        SELECT ci.*,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = 1) as upvote_count,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = -1) as downvote_count,
          (SELECT COUNT(*) FROM content_shares WHERE content_item_id = ci.id) as share_count,
          (SELECT COUNT(*) FROM content_bookmarks WHERE content_item_id = ci.id) as bookmark_count,
          (
            ${difficultyScoreCase}
            + ${interestMatchFragment} * 15
            + CASE WHEN ci.category_id = ANY($1::uuid[]) THEN 30 ELSE 0 END
            + LEAST(ci.engagement_score / 25.0, 40)
            + CASE
                WHEN (CURRENT_DATE - ci.created_at::date) < 7 THEN 20
                WHEN (CURRENT_DATE - ci.created_at::date) < 30 THEN 15
                WHEN (CURRENT_DATE - ci.created_at::date) < 90 THEN 10
                ELSE 5
              END
            + LEAST(LOG(ci.view_count + 1) * 5, 20)
          ) as recommendation_score
        FROM content_items ci
        WHERE ${buildDifficultyFilter(profile.astronomy_level)}
        ORDER BY recommendation_score DESC, ci.created_at DESC
        LIMIT $2
      `;

      const result = await db.query(query, [followedCategoryIds, limit * 2]);

      // Diversify recommendations
      const diversified = diversifyRecommendations(result.rows, limit);

      return diversified;
    },

    async trendingContent(_: any, { limit = 20 }: { limit?: number }, { db }: Context) {
      const query = `
        SELECT ci.*,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = 1) as upvote_count,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = -1) as downvote_count,
          (SELECT COUNT(*) FROM content_shares WHERE content_item_id = ci.id) as share_count,
          (SELECT COUNT(*) FROM content_bookmarks WHERE content_item_id = ci.id) as bookmark_count,
          (
            ci.engagement_score + ci.view_count * 0.1
          ) * EXP(-0.693 * EXTRACT(EPOCH FROM (NOW() - ci.created_at)) / (7 * 24 * 3600)) as trending_score
        FROM content_items ci
        WHERE ci.created_at > NOW() - INTERVAL '30 days'
        ORDER BY trending_score DESC
        LIMIT $1
      `;

      const result = await db.query(query, [limit]);
      return result.rows;
    },

    // ====================================
    // USER PROFILE & COLLECTIONS
    // ====================================

    async myAstronomyProfile(_: any, __: any, { db, user }: Context) {
      if (!user) {
        return null;
      }

      const result = await db.query(
        `SELECT * FROM user_astronomy_profiles WHERE user_id = $1`,
        [user.id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    },

    async userAstronomyProfile(
      _: any,
      { userId }: { userId: string },
      { db }: Context
    ) {
      const result = await db.query(
        `SELECT * FROM user_astronomy_profiles WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    },

    async myFollowedCategories(_: any, __: any, { db, user }: Context) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const result = await db.query(
        `SELECT cc.*,
          (SELECT COUNT(*) FROM content_items WHERE category_id = cc.id) as content_count,
          (SELECT COUNT(*) FROM category_follows WHERE category_id = cc.id) as follower_count
         FROM content_categories cc
         INNER JOIN category_follows cf ON cc.id = cf.category_id
         WHERE cf.user_id = $1
         ORDER BY cf.followed_at DESC`,
        [user.id]
      );

      return result.rows;
    },

    async myBookmarkedContent(
      _: any,
      { limit = 20, offset = 0 }: { limit?: number; offset?: number },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const result = await db.query(
        `SELECT ci.*,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = 1) as upvote_count,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = -1) as downvote_count,
          (SELECT COUNT(*) FROM content_shares WHERE content_item_id = ci.id) as share_count,
          (SELECT COUNT(*) FROM content_bookmarks WHERE content_item_id = ci.id) as bookmark_count,
          cb.created_at as bookmarked_at,
          cb.note as bookmark_note
         FROM content_items ci
         INNER JOIN content_bookmarks cb ON ci.id = cb.content_item_id
         WHERE cb.user_id = $1
         ORDER BY cb.created_at DESC
         LIMIT $2 OFFSET $3`,
        [user.id, limit, offset]
      );

      return result.rows;
    },
  },

  Mutation: {
    // ====================================
    // ASTRONOMY PROFILE MUTATIONS
    // ====================================

    async setAstronomyLevel(
      _: any,
      {
        level,
        interests = [],
        preferredTopics = [],
      }: { level: string; interests?: string[]; preferredTopics?: string[] },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const result = await db.query(
        `INSERT INTO user_astronomy_profiles (user_id, astronomy_level, interests, preferred_topics, onboarding_completed)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (user_id)
         DO UPDATE SET
           astronomy_level = $2,
           interests = $3,
           preferred_topics = $4,
           onboarding_completed = true,
           updated_at = NOW()
         RETURNING *`,
        [user.id, level.toLowerCase(), interests, preferredTopics]
      );

      return result.rows[0];
    },

    async updateAstronomyProfile(
      _: any,
      {
        level,
        interests,
        preferredTopics,
      }: { level?: string; interests?: string[]; preferredTopics?: string[] },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const updates: string[] = [];
      const params: any[] = [user.id];
      let paramCount = 2;

      if (level) {
        updates.push(`astronomy_level = $${paramCount++}`);
        params.push(level.toLowerCase());
      }

      if (interests) {
        updates.push(`interests = $${paramCount++}`);
        params.push(interests);
      }

      if (preferredTopics) {
        updates.push(`preferred_topics = $${paramCount++}`);
        params.push(preferredTopics);
      }

      if (updates.length === 0) {
        const result = await db.query(
          `SELECT * FROM user_astronomy_profiles WHERE user_id = $1`,
          [user.id]
        );
        return result.rows[0];
      }

      updates.push(`updated_at = NOW()`);

      const result = await db.query(
        `UPDATE user_astronomy_profiles
         SET ${updates.join(', ')}
         WHERE user_id = $1
         RETURNING *`,
        params
      );

      return result.rows[0];
    },

    // ====================================
    // SOCIAL INTERACTION MUTATIONS
    // ====================================

    async followCategory(_: any, { categoryId }: { categoryId: string }, { db, user }: Context) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      await db.query(
        `INSERT INTO category_follows (user_id, category_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, category_id) DO NOTHING`,
        [user.id, categoryId]
      );

      return true;
    },

    async unfollowCategory(
      _: any,
      { categoryId }: { categoryId: string },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      await db.query(
        `DELETE FROM category_follows
         WHERE user_id = $1 AND category_id = $2`,
        [user.id, categoryId]
      );

      return true;
    },

    async bookmarkContent(
      _: any,
      {
        contentItemId,
        note,
        folder,
      }: { contentItemId: string; note?: string; folder?: string },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      await db.query(
        `INSERT INTO content_bookmarks (user_id, content_item_id, note, folder)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, content_item_id)
         DO UPDATE SET note = $3, folder = $4`,
        [user.id, contentItemId, note, folder]
      );

      return true;
    },

    async removeBookmark(
      _: any,
      { contentItemId }: { contentItemId: string },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      await db.query(
        `DELETE FROM content_bookmarks
         WHERE user_id = $1 AND content_item_id = $2`,
        [user.id, contentItemId]
      );

      return true;
    },

    async voteContent(
      _: any,
      { contentItemId, value }: { contentItemId: string; value: number },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (value !== 1 && value !== -1) {
        throw new GraphQLError('Vote value must be 1 or -1');
      }

      // Insert or update vote
      await db.query(
        `INSERT INTO content_votes (content_item_id, user_id, value)
         VALUES ($1, $2, $3)
         ON CONFLICT (content_item_id, user_id)
         DO UPDATE SET value = $3`,
        [contentItemId, user.id, value]
      );

      // Get updated content item
      const result = await db.query(
        `SELECT ci.*,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = 1) as upvote_count,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = -1) as downvote_count,
          (SELECT COUNT(*) FROM content_shares WHERE content_item_id = ci.id) as share_count,
          (SELECT COUNT(*) FROM content_bookmarks WHERE content_item_id = ci.id) as bookmark_count,
          $2 as user_vote
         FROM content_items ci
         WHERE ci.id = $1`,
        [contentItemId, value]
      );

      return result.rows[0];
    },

    async removeVote(
      _: any,
      { contentItemId }: { contentItemId: string },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      await db.query(
        `DELETE FROM content_votes
         WHERE content_item_id = $1 AND user_id = $2`,
        [contentItemId, user.id]
      );

      // Get updated content item
      const result = await db.query(
        `SELECT ci.*,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = 1) as upvote_count,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = -1) as downvote_count
         FROM content_items ci
         WHERE ci.id = $1`,
        [contentItemId]
      );

      return result.rows[0];
    },

    async shareContent(
      _: any,
      { contentItemId, platform }: { contentItemId: string; platform: string },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      await db.query(
        `INSERT INTO content_shares (content_item_id, user_id, platform)
         VALUES ($1, $2, $3)`,
        [contentItemId, user.id, platform.toLowerCase()]
      );

      return true;
    },

    async recordContentView(
      _: any,
      {
        contentItemId,
        viewDuration = 0,
        completed = false,
      }: { contentItemId: string; viewDuration?: number; completed?: boolean },
      { db, user }: Context
    ) {
      // Record view (works for both authenticated and anonymous users)
      await db.query(
        `INSERT INTO content_views (content_item_id, user_id, view_duration, completed)
         VALUES ($1, $2, $3, $4)`,
        [contentItemId, user?.id || null, viewDuration, completed]
      );

      // Increment view count
      await db.query(
        `UPDATE content_items SET view_count = view_count + 1 WHERE id = $1`,
        [contentItemId]
      );

      return true;
    },

    // ====================================
    // CONTENT CREATION (Future use)
    // ====================================

    async createContentItem(
      _: any,
      { input }: { input: any },
      { db, user }: Context
    ) {
      if (!user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const result = await db.query(
        `INSERT INTO content_items (
          title, description, body_markdown, category_id, author_id,
          content_type, difficulty_level, age_group, tags, media_urls, video_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          input.title,
          input.description,
          input.bodyMarkdown,
          input.categoryId,
          user.id,
          input.contentType.toLowerCase(),
          input.difficultyLevel.toLowerCase(),
          input.ageGroup.toLowerCase(),
          input.tags || [],
          input.mediaUrls || {},
          input.videoId || null,
        ]
      );

      return result.rows[0];
    },
  },

  // ====================================
  // TYPE RESOLVERS
  // ====================================

  ContentCategory: {
    // Field resolvers for snake_case to camelCase
    createdAt(parent: any) {
      return parent.created_at;
    },

    updatedAt(parent: any) {
      return parent.updated_at;
    },

    difficultyLevel(parent: any) {
      return parent.difficulty_level.toUpperCase();
    },

    ageGroup(parent: any) {
      return parent.age_group.toUpperCase();
    },

    iconEmoji(parent: any) {
      return parent.icon_emoji;
    },

    sortOrder(parent: any) {
      return parent.sort_order;
    },

    isFeatured(parent: any) {
      return parent.is_featured;
    },

    contentCount(parent: any) {
      return parseInt(parent.content_count || 0);
    },

    followerCount(parent: any) {
      return parseInt(parent.follower_count || 0);
    },

    async parentCategory(parent: any, _: any, { db }: Context) {
      if (!parent.parent_category_id) return null;

      const result = await db.query(
        'SELECT * FROM content_categories WHERE id = $1',
        [parent.parent_category_id]
      );

      return result.rows[0] || null;
    },

    async subCategories(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        'SELECT * FROM content_categories WHERE parent_category_id = $1 ORDER BY sort_order, name',
        [parent.id]
      );

      return result.rows;
    },

    async isFollowing(parent: any, _: any, { db, user }: Context) {
      if (!user) return false;

      const result = await db.query(
        'SELECT 1 FROM category_follows WHERE user_id = $1 AND category_id = $2',
        [user.id, parent.id]
      );

      return result.rows.length > 0;
    },

    async featuredContent(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        `SELECT * FROM content_items
         WHERE category_id = $1
         ORDER BY engagement_score DESC, created_at DESC
         LIMIT 5`,
        [parent.id]
      );

      return result.rows;
    },
  },

  ContentItem: {
    // Field resolvers
    createdAt(parent: any) {
      return parent.created_at;
    },

    updatedAt(parent: any) {
      return parent.updated_at;
    },

    bodyMarkdown(parent: any) {
      return parent.body_markdown;
    },

    contentType(parent: any) {
      return parent.content_type.toUpperCase();
    },

    sourceType(parent: any) {
      return (parent.source_type || 'native').toUpperCase();
    },

    difficultyLevel(parent: any) {
      return parent.difficulty_level.toUpperCase();
    },

    ageGroup(parent: any) {
      return parent.age_group.toUpperCase();
    },

    mediaUrls(parent: any) {
      return parent.media_urls;
    },

    engagementScore(parent: any) {
      return parent.engagement_score || 0;
    },

    viewCount(parent: any) {
      return parent.view_count || 0;
    },

    upvotes(parent: any) {
      return parseInt(parent.upvote_count || 0);
    },

    downvotes(parent: any) {
      return parseInt(parent.downvote_count || 0);
    },

    shareCount(parent: any) {
      return parseInt(parent.share_count || 0);
    },

    bookmarkCount(parent: any) {
      return parseInt(parent.bookmark_count || 0);
    },

    userVote(parent: any) {
      return parent.user_vote || null;
    },

    isBookmarked(parent: any) {
      return parent.is_bookmarked || false;
    },

    async category(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        'SELECT * FROM content_categories WHERE id = $1',
        [parent.category_id]
      );

      return result.rows[0];
    },

    async author(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [parent.author_id]
      );

      if (result.rows.length === 0) return null;

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toUpperCase(),
        createdAt: user.created_at,
      };
    },

    async video(parent: any, _: any, { db }: Context) {
      if (!parent.video_id) return null;

      const result = await db.query('SELECT * FROM videos WHERE id = $1', [
        parent.video_id,
      ]);

      return result.rows[0] || null;
    },
  },

  UserAstronomyProfile: {
    astronomyLevel(parent: any) {
      return parent.astronomy_level.toUpperCase();
    },

    onboardingCompleted(parent: any) {
      return parent.onboarding_completed || false;
    },

    createdAt(parent: any) {
      return parent.created_at;
    },

    updatedAt(parent: any) {
      return parent.updated_at;
    },

    async user(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [parent.user_id]
      );

      if (result.rows.length === 0) return null;

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toUpperCase(),
        createdAt: user.created_at,
      };
    },

    async followedCategoriesCount(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM category_follows WHERE user_id = $1',
        [parent.user_id]
      );

      return parseInt(result.rows[0].count);
    },

    async bookmarkedContentCount(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM content_bookmarks WHERE user_id = $1',
        [parent.user_id]
      );

      return parseInt(result.rows[0].count);
    },
  },
};
