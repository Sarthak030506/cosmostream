import { Context } from '../../context';
export declare const analyticsResolvers: {
    Query: {
        myCreatorAnalytics(_: any, { timeRange }: {
            timeRange?: string;
        }, { db, user }: Context): Promise<{
            totalContent: number;
            totalViews: number;
            totalUpvotes: number;
            totalBookmarks: number;
            totalShares: number;
            engagementRate: number;
            topContent: any[];
            viewsOverTime: any[];
            engagementOverTime: any[];
            contentByCategory: any[];
            audienceLevel: any[];
        }>;
    };
    CreatorAnalytics: {
        contentByCategory(parent: any, _: any, { db }: Context): Promise<any[]>;
        audienceLevel(parent: any): any;
        viewsOverTime(parent: any): any;
        engagementOverTime(parent: any): any;
    };
};
//# sourceMappingURL=analytics.d.ts.map