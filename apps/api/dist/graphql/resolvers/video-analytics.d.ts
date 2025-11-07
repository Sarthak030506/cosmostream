import { Context } from '../../context';
export declare const videoAnalyticsResolvers: {
    Query: {
        videoAnalytics(_: any, { videoId, timeRange }: {
            videoId: string;
            timeRange?: string;
        }, { db, user }: Context): Promise<{
            videoId: string;
            totalViews: any;
            uniqueViews: number;
            watchTime: number;
            avgViewDuration: number;
            completionRate: number;
        }>;
        realtimeAnalytics(_: any, { videoId }: {
            videoId: string;
        }, { db, user }: Context): Promise<{
            videoId: string;
            currentViewers: number;
            viewsLast24h: number;
            viewsLastHour: number;
            avgCompletionLast24h: number;
        }>;
    };
    Mutation: {
        trackVideoView(_: any, { input }: {
            input: any;
        }, { db, user }: Context): Promise<boolean>;
        trackVideoEvent(_: any, { input }: {
            input: any;
        }, { db, user }: Context): Promise<boolean>;
    };
    VideoAnalytics: {
        retentionCurve(parent: any, _: any, { db }: Context): Promise<{
            timestamp: any;
            viewerPercentage: number;
            viewerCount: number;
            dropOffCount: number;
        }[]>;
        trafficSources(parent: any, _: any, { db }: Context): Promise<{
            source: any;
            views: number;
            uniqueViewers: number;
            percentage: number;
            avgCompletion: number;
        }[]>;
        deviceStats(parent: any, _: any, { db }: Context): Promise<{
            desktop: number;
            mobile: number;
            tablet: number;
            browsers: {
                browser: string;
                count: number;
                percentage: number;
            }[];
            operatingSystems: {
                os: string;
                count: number;
                percentage: number;
            }[];
        }>;
        viewsByDate(parent: any, _: any, { db }: Context): Promise<{
            date: any;
            value: number;
        }[]>;
        topCountries(parent: any, _: any, { db }: Context): Promise<{
            country: any;
            views: number;
            percentage: number;
        }[]>;
    };
};
//# sourceMappingURL=video-analytics.d.ts.map