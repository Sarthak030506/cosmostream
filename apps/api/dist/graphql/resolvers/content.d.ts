import { Context } from '../../context';
export declare const contentResolvers: {
    Query: {
        categories(_: any, { parentId, difficultyLevel, featured, limit, offset, }: {
            parentId?: string;
            difficultyLevel?: string;
            featured?: boolean;
            limit?: number;
            offset?: number;
        }, { db }: Context): Promise<any[]>;
        category(_: any, { id, slug }: {
            id?: string;
            slug?: string;
        }, { db }: Context): Promise<any>;
        categoryStats(_: any, __: any, { db }: Context): Promise<{
            totalCategories: number;
            byDifficulty: {
                difficulty: any;
                count: number;
            }[];
            byAgeGroup: {
                ageGroup: any;
                count: number;
            }[];
            mostPopular: any[];
        }>;
        contentItem(_: any, { id }: {
            id: string;
        }, { db, user }: Context): Promise<any>;
        discoverContent(_: any, { filters, sortBy, limit, offset, }: {
            filters?: any;
            sortBy?: string;
            limit?: number;
            offset?: number;
        }, { db, user }: Context): Promise<{
            items: any[];
            hasMore: boolean;
            totalCount: number;
        }>;
        searchContent(_: any, { query: searchQuery, filters, limit, offset, }: {
            query: string;
            filters?: any;
            limit?: number;
            offset?: number;
        }, { db, user }: Context): Promise<{
            items: any[];
            hasMore: boolean;
            totalCount: number;
        }>;
        recommendedForMe(_: any, { limit }: {
            limit?: number;
        }, { db, user }: Context): Promise<any[]>;
        trendingContent(_: any, { limit }: {
            limit?: number;
        }, { db }: Context): Promise<any[]>;
        myAstronomyProfile(_: any, __: any, { db, user }: Context): Promise<any>;
        userAstronomyProfile(_: any, { userId }: {
            userId: string;
        }, { db }: Context): Promise<any>;
        myFollowedCategories(_: any, __: any, { db, user }: Context): Promise<any[]>;
        myBookmarkedContent(_: any, { limit, offset }: {
            limit?: number;
            offset?: number;
        }, { db, user }: Context): Promise<any[]>;
    };
    Mutation: {
        setAstronomyLevel(_: any, { level, interests, preferredTopics, }: {
            level: string;
            interests?: string[];
            preferredTopics?: string[];
        }, { db, user }: Context): Promise<any>;
        updateAstronomyProfile(_: any, { level, interests, preferredTopics, }: {
            level?: string;
            interests?: string[];
            preferredTopics?: string[];
        }, { db, user }: Context): Promise<any>;
        followCategory(_: any, { categoryId }: {
            categoryId: string;
        }, { db, user }: Context): Promise<boolean>;
        unfollowCategory(_: any, { categoryId }: {
            categoryId: string;
        }, { db, user }: Context): Promise<boolean>;
        bookmarkContent(_: any, { contentItemId, note, folder, }: {
            contentItemId: string;
            note?: string;
            folder?: string;
        }, { db, user }: Context): Promise<boolean>;
        removeBookmark(_: any, { contentItemId }: {
            contentItemId: string;
        }, { db, user }: Context): Promise<boolean>;
        voteContent(_: any, { contentItemId, value }: {
            contentItemId: string;
            value: number;
        }, { db, user }: Context): Promise<any>;
        removeVote(_: any, { contentItemId }: {
            contentItemId: string;
        }, { db, user }: Context): Promise<any>;
        shareContent(_: any, { contentItemId, platform }: {
            contentItemId: string;
            platform: string;
        }, { db, user }: Context): Promise<boolean>;
        recordContentView(_: any, { contentItemId, viewDuration, completed, }: {
            contentItemId: string;
            viewDuration?: number;
            completed?: boolean;
        }, { db, user }: Context): Promise<boolean>;
        createContentItem(_: any, { input }: {
            input: any;
        }, { db, user }: Context): Promise<any>;
    };
    ContentCategory: {
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
        difficultyLevel(parent: any): any;
        ageGroup(parent: any): any;
        iconEmoji(parent: any): any;
        sortOrder(parent: any): any;
        isFeatured(parent: any): any;
        contentCount(parent: any): number;
        followerCount(parent: any): number;
        parentCategory(parent: any, _: any, { db }: Context): Promise<any>;
        subCategories(parent: any, _: any, { db }: Context): Promise<any[]>;
        isFollowing(parent: any, _: any, { db, user }: Context): Promise<boolean>;
        featuredContent(parent: any, _: any, { db }: Context): Promise<any[]>;
    };
    ContentItem: {
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
        bodyMarkdown(parent: any): any;
        contentType(parent: any): any;
        sourceType(parent: any): any;
        sourceUrl(parent: any): any;
        difficultyLevel(parent: any): any;
        ageGroup(parent: any): any;
        mediaUrls(parent: any): any;
        engagementScore(parent: any): any;
        viewCount(parent: any): any;
        upvotes(parent: any): number;
        downvotes(parent: any): number;
        shareCount(parent: any): number;
        bookmarkCount(parent: any): number;
        userVote(parent: any): any;
        isBookmarked(parent: any): any;
        category(parent: any, _: any, { db }: Context): Promise<any>;
        author(parent: any, _: any, { db }: Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        video(parent: any, _: any, { db }: Context): Promise<any>;
    };
    UserAstronomyProfile: {
        astronomyLevel(parent: any): any;
        onboardingCompleted(parent: any): any;
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
        user(parent: any, _: any, { db }: Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        followedCategoriesCount(parent: any, _: any, { db }: Context): Promise<number>;
        bookmarkedContentCount(parent: any, _: any, { db }: Context): Promise<number>;
    };
};
//# sourceMappingURL=content.d.ts.map