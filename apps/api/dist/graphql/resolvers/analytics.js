"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsResolvers = void 0;
const graphql_1 = require("graphql");
exports.analyticsResolvers = {
    Query: {
        async myCreatorAnalytics(_, { timeRange = 'LAST_30_DAYS' }, { db, user }) {
            // Check authentication
            if (!user) {
                throw new graphql_1.GraphQLError('Authentication required', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            // All authenticated users can access their own analytics
            // (YouTube-style: everyone can create content and see their stats)
            // Calculate time range
            let dateFilter = '';
            const now = new Date();
            switch (timeRange) {
                case 'LAST_7_DAYS':
                    dateFilter = `AND ci.created_at >= NOW() - INTERVAL '7 days'`;
                    break;
                case 'LAST_30_DAYS':
                    dateFilter = `AND ci.created_at >= NOW() - INTERVAL '30 days'`;
                    break;
                case 'LAST_90_DAYS':
                    dateFilter = `AND ci.created_at >= NOW() - INTERVAL '90 days'`;
                    break;
                case 'ALL_TIME':
                default:
                    dateFilter = '';
            }
            // Get total statistics
            const statsQuery = `
        SELECT
          COUNT(*) as total_content,
          COALESCE(SUM(ci.view_count), 0) as total_views,
          COALESCE(SUM((SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = 1)), 0) as total_upvotes,
          COALESCE(SUM((SELECT COUNT(*) FROM content_bookmarks WHERE content_item_id = ci.id)), 0) as total_bookmarks,
          COALESCE(SUM((SELECT COUNT(*) FROM content_shares WHERE content_item_id = ci.id)), 0) as total_shares
        FROM content_items ci
        WHERE ci.author_id = $1 ${dateFilter}
      `;
            const statsResult = await db.query(statsQuery, [user.id]);
            const stats = statsResult.rows[0];
            // Calculate engagement rate
            const totalInteractions = parseInt(stats.total_upvotes) +
                parseInt(stats.total_bookmarks) +
                parseInt(stats.total_shares);
            const engagementRate = parseInt(stats.total_views) > 0
                ? (totalInteractions / parseInt(stats.total_views)) * 100
                : 0;
            // Get top content
            const topContentQuery = `
        SELECT ci.*,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = 1) as upvote_count,
          (SELECT COUNT(*) FROM content_votes WHERE content_item_id = ci.id AND value = -1) as downvote_count,
          (SELECT COUNT(*) FROM content_shares WHERE content_item_id = ci.id) as share_count,
          (SELECT COUNT(*) FROM content_bookmarks WHERE content_item_id = ci.id) as bookmark_count
        FROM content_items ci
        WHERE ci.author_id = $1 ${dateFilter}
        ORDER BY ci.engagement_score DESC
        LIMIT 5
      `;
            const topContentResult = await db.query(topContentQuery, [user.id]);
            // Get views over time (last 30 days)
            const viewsOverTimeQuery = `
        SELECT
          DATE(cv.created_at) as date,
          COUNT(*) as value
        FROM content_views cv
        INNER JOIN content_items ci ON cv.content_item_id = ci.id
        WHERE ci.author_id = $1
          AND cv.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(cv.created_at)
        ORDER BY date ASC
      `;
            const viewsOverTimeResult = await db.query(viewsOverTimeQuery, [user.id]);
            // Get engagement over time (upvotes + bookmarks + shares per day, last 30 days)
            const engagementOverTimeQuery = `
        SELECT date, SUM(value) as value FROM (
          SELECT DATE(created_at) as date, COUNT(*) as value
          FROM content_votes
          WHERE content_item_id IN (SELECT id FROM content_items WHERE author_id = $1)
            AND value = 1
            AND created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)

          UNION ALL

          SELECT DATE(created_at) as date, COUNT(*) as value
          FROM content_bookmarks
          WHERE content_item_id IN (SELECT id FROM content_items WHERE author_id = $1)
            AND created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)

          UNION ALL

          SELECT DATE(created_at) as date, COUNT(*) as value
          FROM content_shares
          WHERE content_item_id IN (SELECT id FROM content_items WHERE author_id = $1)
            AND created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
        ) combined
        GROUP BY date
        ORDER BY date ASC
      `;
            const engagementOverTimeResult = await db.query(engagementOverTimeQuery, [
                user.id,
            ]);
            // Get content by category
            const contentByCategoryQuery = `
        SELECT
          ci.category_id,
          COUNT(*) as content_count,
          SUM(ci.view_count) as total_views,
          SUM(ci.engagement_score) as total_engagement
        FROM content_items ci
        WHERE ci.author_id = $1 ${dateFilter}
        GROUP BY ci.category_id
        ORDER BY total_engagement DESC
      `;
            const contentByCategoryResult = await db.query(contentByCategoryQuery, [user.id]);
            // Get audience level breakdown (by difficulty level)
            const audienceLevelQuery = `
        SELECT
          ci.difficulty_level as level,
          COUNT(*) as count
        FROM content_items ci
        WHERE ci.author_id = $1 ${dateFilter}
        GROUP BY ci.difficulty_level
        ORDER BY count DESC
      `;
            const audienceLevelResult = await db.query(audienceLevelQuery, [user.id]);
            // Calculate percentages for audience level
            const totalContentCount = parseInt(stats.total_content);
            const audienceLevelWithPercentage = audienceLevelResult.rows.map((row) => ({
                ...row,
                percentage: totalContentCount > 0 ? (parseInt(row.count) / totalContentCount) * 100 : 0,
            }));
            return {
                totalContent: parseInt(stats.total_content),
                totalViews: parseInt(stats.total_views),
                totalUpvotes: parseInt(stats.total_upvotes),
                totalBookmarks: parseInt(stats.total_bookmarks),
                totalShares: parseInt(stats.total_shares),
                engagementRate: parseFloat(engagementRate.toFixed(2)),
                topContent: topContentResult.rows,
                viewsOverTime: viewsOverTimeResult.rows,
                engagementOverTime: engagementOverTimeResult.rows,
                contentByCategory: contentByCategoryResult.rows,
                audienceLevel: audienceLevelWithPercentage,
            };
        },
    },
    CreatorAnalytics: {
        // Field resolvers
        async contentByCategory(parent, _, { db }) {
            // Resolve category objects for each category in the breakdown
            const categoriesPromises = parent.contentByCategory.map(async (item) => {
                const categoryResult = await db.query('SELECT * FROM content_categories WHERE id = $1', [item.category_id]);
                return {
                    category: categoryResult.rows[0],
                    contentCount: parseInt(item.content_count),
                    totalViews: parseInt(item.total_views),
                    totalEngagement: parseInt(item.total_engagement),
                };
            });
            return await Promise.all(categoriesPromises);
        },
        audienceLevel(parent) {
            return parent.audienceLevel.map((item) => ({
                level: item.level.toUpperCase(),
                count: parseInt(item.count),
                percentage: parseFloat(item.percentage.toFixed(2)),
            }));
        },
        viewsOverTime(parent) {
            return parent.viewsOverTime.map((item) => ({
                date: item.date,
                value: parseInt(item.value),
            }));
        },
        engagementOverTime(parent) {
            return parent.engagementOverTime.map((item) => ({
                date: item.date,
                value: parseInt(item.value),
            }));
        },
    },
};
//# sourceMappingURL=analytics.js.map