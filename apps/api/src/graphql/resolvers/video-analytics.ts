import { Context } from '../../context';
import { GraphQLError } from 'graphql';
import crypto from 'crypto';

export const videoAnalyticsResolvers = {
  Query: {
    async videoAnalytics(
      _: any,
      { videoId, timeRange = 'LAST_30_DAYS' }: { videoId: string; timeRange?: string },
      { db, user }: Context
    ) {
      // Check if video exists and user has permission to view analytics
      const videoResult = await db.query(
        'SELECT creator_id FROM videos WHERE id = $1',
        [videoId]
      );

      if (videoResult.rows.length === 0) {
        throw new GraphQLError('Video not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Only creator or admin can view detailed analytics
      if (user && (videoResult.rows[0].creator_id === user.id || user.role === 'admin')) {
        // Calculate date range
        let startDate = new Date();
        switch (timeRange) {
          case 'LAST_7_DAYS':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'LAST_30_DAYS':
            startDate.setDate(startDate.getDate() - 30);
            break;
          case 'LAST_90_DAYS':
            startDate.setDate(startDate.getDate() - 90);
            break;
          case 'ALL_TIME':
            startDate = new Date('2020-01-01');
            break;
        }

        // Get summary statistics using the database function
        const summaryResult = await db.query(
          `SELECT * FROM get_video_analytics_summary($1, $2, CURRENT_DATE)`,
          [videoId, startDate.toISOString().split('T')[0]]
        );

        const summary = summaryResult.rows[0];

        return {
          videoId,
          totalViews: parseInt(summary.total_views || 0),
          uniqueViews: parseInt(summary.unique_views || 0),
          watchTime: parseInt(summary.total_watch_time || 0),
          avgViewDuration: parseFloat(summary.avg_view_duration || 0),
          completionRate: parseFloat(summary.avg_completion_rate || 0),
        };
      }

      // Public analytics (limited data)
      const viewsResult = await db.query(
        'SELECT views FROM videos WHERE id = $1',
        [videoId]
      );

      return {
        videoId,
        totalViews: viewsResult.rows[0]?.views || 0,
        uniqueViews: 0,
        watchTime: 0,
        avgViewDuration: 0,
        completionRate: 0,
      };
    },

    async realtimeAnalytics(
      _: any,
      { videoId }: { videoId: string },
      { db, user }: Context
    ) {
      // Check permission
      const videoResult = await db.query(
        'SELECT creator_id FROM videos WHERE id = $1',
        [videoId]
      );

      if (videoResult.rows.length === 0) {
        throw new GraphQLError('Video not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (!user || (videoResult.rows[0].creator_id !== user.id && user.role !== 'admin')) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Get realtime analytics from the view
      const realtimeResult = await db.query(
        'SELECT * FROM video_realtime_analytics WHERE video_id = $1',
        [videoId]
      );

      const realtime = realtimeResult.rows[0] || {
        views_last_24h: 0,
        unique_viewers_last_24h: 0,
        views_last_hour: 0,
        avg_completion_last_24h: 0,
      };

      // Count current viewers (viewed in last 5 minutes and didn't complete)
      const currentViewersResult = await db.query(
        `SELECT COUNT(DISTINCT session_id) as current_viewers
         FROM video_views
         WHERE video_id = $1
           AND last_heartbeat_at >= NOW() - INTERVAL '5 minutes'
           AND completion_percentage < 95`,
        [videoId]
      );

      return {
        videoId,
        currentViewers: parseInt(currentViewersResult.rows[0].current_viewers || 0),
        viewsLast24h: parseInt(realtime.views_last_24h || 0),
        viewsLastHour: parseInt(realtime.views_last_hour || 0),
        avgCompletionLast24h: parseFloat(realtime.avg_completion_last_24h || 0),
      };
    },
  },

  Mutation: {
    async trackVideoView(
      _: any,
      { input }: { input: any },
      { db, user }: Context
    ) {
      try {
        // Hash IP address for privacy (if available from request context)
        const ipHash = crypto.createHash('sha256').update('anonymous').digest('hex');

        // Insert or update video view
        await db.query(
          `INSERT INTO video_views (
            video_id, session_id, user_id, device_type, browser, operating_system,
            screen_resolution, traffic_source, referrer_url, utm_source, utm_medium,
            utm_campaign, user_agent, ip_address_hash
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (session_id, video_id)
          DO UPDATE SET last_heartbeat_at = CURRENT_TIMESTAMP`,
          [
            input.videoId,
            input.sessionId,
            input.userId || user?.id || null,
            input.deviceType,
            input.browser,
            input.operatingSystem,
            input.screenResolution,
            input.trafficSource,
            input.referrerUrl,
            input.utmSource,
            input.utmMedium,
            input.utmCampaign,
            input.userAgent,
            ipHash,
          ]
        );

        // Increment video view count
        await db.query(
          'UPDATE videos SET views = views + 1 WHERE id = $1',
          [input.videoId]
        );

        return true;
      } catch (error) {
        console.error('Error tracking video view:', error);
        return false;
      }
    },

    async trackVideoEvent(
      _: any,
      { input }: { input: any },
      { db, user }: Context
    ) {
      try {
        // Insert video event
        await db.query(
          `INSERT INTO video_events (
            video_id, session_id, user_id, event_type, video_timestamp, event_data
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            input.videoId,
            input.sessionId,
            input.userId || user?.id || null,
            input.eventType,
            input.videoTimestamp,
            JSON.stringify(input.eventData || {}),
          ]
        );

        // Update view record with watch duration and completion if event is session_end or complete
        if (input.eventType === 'session_end' || input.eventType === 'complete') {
          const watchDuration = input.eventData?.totalWatchTime || input.videoTimestamp;
          const completionPercentage = input.eventData?.completionPercentage || 0;

          await db.query(
            `UPDATE video_views
             SET watch_duration = $1,
                 completion_percentage = $2,
                 completed_at = CASE WHEN $3 = 'complete' THEN CURRENT_TIMESTAMP ELSE completed_at END,
                 last_heartbeat_at = CURRENT_TIMESTAMP
             WHERE session_id = $4 AND video_id = $5`,
            [watchDuration, completionPercentage, input.eventType, input.sessionId, input.videoId]
          );
        }

        // Update heartbeat for active sessions
        if (['play', 'pause', 'seek'].includes(input.eventType)) {
          await db.query(
            `UPDATE video_views
             SET last_heartbeat_at = CURRENT_TIMESTAMP
             WHERE session_id = $1 AND video_id = $2`,
            [input.sessionId, input.videoId]
          );
        }

        return true;
      } catch (error) {
        console.error('Error tracking video event:', error);
        return false;
      }
    },
  },

  VideoAnalytics: {
    async retentionCurve(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        `SELECT timestamp_seconds, viewer_percentage, viewer_count, drop_off_count
         FROM video_retention
         WHERE video_id = $1
         ORDER BY timestamp_seconds ASC`,
        [parent.videoId]
      );

      return result.rows.map((row: any) => ({
        timestamp: row.timestamp_seconds,
        viewerPercentage: parseFloat(row.viewer_percentage),
        viewerCount: parseInt(row.viewer_count),
        dropOffCount: parseInt(row.drop_off_count),
      }));
    },

    async trafficSources(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        `SELECT traffic_source, COUNT(*) as view_count,
                COUNT(DISTINCT user_id) as unique_viewers,
                AVG(completion_percentage) as avg_completion
         FROM video_views
         WHERE video_id = $1
           AND started_at >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY traffic_source
         ORDER BY view_count DESC`,
        [parent.videoId]
      );

      const totalViews = result.rows.reduce((sum: number, row: any) => sum + parseInt(row.view_count), 0);

      return result.rows.map((row: any) => ({
        source: row.traffic_source || 'direct',
        views: parseInt(row.view_count),
        uniqueViewers: parseInt(row.unique_viewers || 0),
        percentage: totalViews > 0 ? (parseInt(row.view_count) / totalViews) * 100 : 0,
        avgCompletion: parseFloat(row.avg_completion || 0),
      }));
    },

    async deviceStats(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        `SELECT device_type, browser, operating_system, COUNT(*) as count
         FROM video_views
         WHERE video_id = $1
           AND started_at >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY device_type, browser, operating_system`,
        [parent.videoId]
      );

      const deviceTotals = {
        desktop: 0,
        mobile: 0,
        tablet: 0,
      };

      const browserMap = new Map<string, number>();
      const osMap = new Map<string, number>();
      let totalViews = 0;

      result.rows.forEach((row: any) => {
        const count = parseInt(row.count);
        totalViews += count;

        const deviceType = row.device_type || 'desktop';
        if (deviceType in deviceTotals) {
          deviceTotals[deviceType as keyof typeof deviceTotals] += count;
        }

        if (row.browser) {
          browserMap.set(row.browser, (browserMap.get(row.browser) || 0) + count);
        }

        if (row.operating_system) {
          osMap.set(row.operating_system, (osMap.get(row.operating_system) || 0) + count);
        }
      });

      const browsers = Array.from(browserMap.entries())
        .map(([browser, count]) => ({
          browser,
          count,
          percentage: totalViews > 0 ? (count / totalViews) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      const operatingSystems = Array.from(osMap.entries())
        .map(([os, count]) => ({
          os,
          count,
          percentage: totalViews > 0 ? (count / totalViews) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        desktop: deviceTotals.desktop,
        mobile: deviceTotals.mobile,
        tablet: deviceTotals.tablet,
        browsers,
        operatingSystems,
      };
    },

    async viewsByDate(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        `SELECT DATE(started_at) as date, COUNT(*) as value
         FROM video_views
         WHERE video_id = $1
           AND started_at >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY DATE(started_at)
         ORDER BY date ASC`,
        [parent.videoId]
      );

      return result.rows.map((row: any) => ({
        date: row.date,
        value: parseInt(row.value),
      }));
    },

    async topCountries(parent: any, _: any, { db }: Context) {
      const result = await db.query(
        `SELECT country, COUNT(*) as view_count
         FROM video_views
         WHERE video_id = $1
           AND country IS NOT NULL
           AND started_at >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY country
         ORDER BY view_count DESC
         LIMIT 10`,
        [parent.videoId]
      );

      const totalViews = result.rows.reduce((sum: number, row: any) => sum + parseInt(row.view_count), 0);

      return result.rows.map((row: any) => ({
        country: row.country,
        views: parseInt(row.view_count),
        percentage: totalViews > 0 ? (parseInt(row.view_count) / totalViews) * 100 : 0,
      }));
    },
  },
};
