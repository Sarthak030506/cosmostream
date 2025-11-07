import { GraphQLScalarType } from 'graphql';
export declare const resolvers: {
    DateTime: GraphQLScalarType<Date, any>;
    JSON: GraphQLScalarType<any, any>;
    Query: {
        latestNews(_: any, { limit, offset }: {
            limit?: number;
            offset?: number;
        }, { user, db }: import("../../context").Context): Promise<{
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
        featuredNews(_: any, __: any, { user, db }: import("../../context").Context): Promise<{
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
        newsByCategory(_: any, { categorySlug, limit, offset }: {
            categorySlug: string;
            limit?: number;
            offset?: number;
        }, { user, db }: import("../../context").Context): Promise<{
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
        searchNews(_: any, { query, limit, offset }: {
            query: string;
            limit?: number;
            offset?: number;
        }, { user, db }: import("../../context").Context): Promise<{
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
        users(_: any, { search, limit, offset }: {
            search?: string;
            limit?: number;
            offset?: number;
        }, { user, db }: import("../../context").Context): Promise<{
            items: {
                id: any;
                email: any;
                name: any;
                role: any;
                createdAt: any;
            }[];
            hasMore: boolean;
            totalCount: number;
        }>;
        videoAnalytics(_: any, { videoId, timeRange }: {
            videoId: string;
            timeRange?: string;
        }, { db, user }: import("../../context").Context): Promise<{
            videoId: string;
            totalViews: any;
            uniqueViews: number;
            watchTime: number;
            avgViewDuration: number;
            completionRate: number;
        }>;
        realtimeAnalytics(_: any, { videoId }: {
            videoId: string;
        }, { db, user }: import("../../context").Context): Promise<{
            videoId: string;
            currentViewers: number;
            viewsLast24h: number;
            viewsLastHour: number;
            avgCompletionLast24h: number;
        }>;
        youtubeSyncStatus(_: any, { categoryId }: {
            categoryId?: string;
        }, { db, user }: import("../../context").Context): Promise<any>;
        youtubeSyncJobs(_: any, { limit }: {
            limit?: number;
        }, { user }: import("../../context").Context): Promise<any[]>;
        youtubeQuotaUsage(_: any, __: any, { user }: import("../../context").Context): Promise<{
            date: string;
            used: number;
            remaining: number;
            limit: number;
        }>;
        youtubeCategoryMapping(_: any, { categoryId }: {
            categoryId: string;
        }, { db, user }: import("../../context").Context): Promise<any>;
        myCreatorAnalytics(_: any, { timeRange }: {
            timeRange?: string;
        }, { db, user }: import("../../context").Context): Promise<{
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
        categories(_: any, { parentId, difficultyLevel, featured, limit, offset, }: {
            parentId?: string;
            difficultyLevel?: string;
            featured?: boolean;
            limit?: number;
            offset?: number;
        }, { db }: import("../../context").Context): Promise<any[]>;
        category(_: any, { id, slug }: {
            id?: string;
            slug?: string;
        }, { db }: import("../../context").Context): Promise<any>;
        categoryStats(_: any, __: any, { db }: import("../../context").Context): Promise<{
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
        }, { db, user }: import("../../context").Context): Promise<any>;
        discoverContent(_: any, { filters, sortBy, limit, offset, }: {
            filters?: any;
            sortBy?: string;
            limit?: number;
            offset?: number;
        }, { db, user }: import("../../context").Context): Promise<{
            items: any[];
            hasMore: boolean;
            totalCount: number;
        }>;
        searchContent(_: any, { query: searchQuery, filters, limit, offset, }: {
            query: string;
            filters?: any;
            limit?: number;
            offset?: number;
        }, { db, user }: import("../../context").Context): Promise<{
            items: any[];
            hasMore: boolean;
            totalCount: number;
        }>;
        recommendedForMe(_: any, { limit }: {
            limit?: number;
        }, { db, user }: import("../../context").Context): Promise<any[]>;
        trendingContent(_: any, { limit }: {
            limit?: number;
        }, { db }: import("../../context").Context): Promise<any[]>;
        myAstronomyProfile(_: any, __: any, { db, user }: import("../../context").Context): Promise<any>;
        userAstronomyProfile(_: any, { userId }: {
            userId: string;
        }, { db }: import("../../context").Context): Promise<any>;
        myFollowedCategories(_: any, __: any, { db, user }: import("../../context").Context): Promise<any[]>;
        myBookmarkedContent(_: any, { limit, offset }: {
            limit?: number;
            offset?: number;
        }, { db, user }: import("../../context").Context): Promise<any[]>;
        course(_: any, { id }: any, { db }: import("../../context").Context): Promise<any>;
        courses(_: any, { limit, offset }: any, { db }: import("../../context").Context): Promise<any[]>;
        thread(_: any, { id }: any, { db }: import("../../context").Context): Promise<any>;
        threads(_: any, { category, limit, offset }: any, { db }: import("../../context").Context): Promise<any[]>;
        video(_: any, { id }: any, { db }: import("../../context").Context): Promise<any>;
        myVideos(_: any, { status, limit, offset }: any, { user, db }: import("../../context").Context): Promise<{
            items: any[];
            hasMore: boolean;
            totalCount: number;
        }>;
        videos(_: any, { limit, offset, category, tags }: any, { db }: import("../../context").Context): Promise<any[]>;
        searchVideos(_: any, { query, limit, offset }: any, { db }: import("../../context").Context): Promise<any[]>;
        me(_: any, __: any, { user, db }: import("../../context").Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        user(_: any, { id }: any, { db }: import("../../context").Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
    };
    Mutation: {
        updateUserRole(_: any, { userId, role }: {
            userId: string;
            role: string;
        }, { user, db }: import("../../context").Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        deleteUser(_: any, { userId }: {
            userId: string;
        }, { user, db }: import("../../context").Context): Promise<boolean>;
        trackVideoView(_: any, { input }: {
            input: any;
        }, { db, user }: import("../../context").Context): Promise<boolean>;
        trackVideoEvent(_: any, { input }: {
            input: any;
        }, { db, user }: import("../../context").Context): Promise<boolean>;
        syncYouTubeCategory(_: any, { categoryId, limit }: {
            categoryId: string;
            limit?: number;
        }, { user }: import("../../context").Context): Promise<import("../../services/youtube-sync").SyncResult>;
        syncAllYouTubeCategories(_: any, { limit }: {
            limit?: number;
        }, { user }: import("../../context").Context): Promise<import("../../services/youtube-sync").SyncResult[]>;
        syncAllYouTubeCategoriesParallel(_: any, { limit, concurrency }: {
            limit?: number;
            concurrency?: number;
        }, { user }: import("../../context").Context): Promise<{
            success: boolean;
            totalCategories: number;
            results: import("../../services/youtube-sync").SyncResult[];
        }>;
        importYouTubeVideo(_: any, { videoId, categoryId }: {
            videoId: string;
            categoryId: string;
        }, { user }: import("../../context").Context): Promise<boolean>;
        updateYouTubeCategoryMapping(_: any, { categoryId, keywords, channels, }: {
            categoryId: string;
            keywords: string[];
            channels: string[];
        }, { db, user }: import("../../context").Context): Promise<any>;
        blacklistYouTubeChannel(_: any, { channelId, reason }: {
            channelId: string;
            reason: string;
        }, { db, user }: import("../../context").Context): Promise<boolean>;
        blacklistYouTubeVideo(_: any, { videoId, reason }: {
            videoId: string;
            reason: string;
        }, { db, user }: import("../../context").Context): Promise<boolean>;
        setAstronomyLevel(_: any, { level, interests, preferredTopics, }: {
            level: string;
            interests?: string[];
            preferredTopics?: string[];
        }, { db, user }: import("../../context").Context): Promise<any>;
        updateAstronomyProfile(_: any, { level, interests, preferredTopics, }: {
            level?: string;
            interests?: string[];
            preferredTopics?: string[];
        }, { db, user }: import("../../context").Context): Promise<any>;
        followCategory(_: any, { categoryId }: {
            categoryId: string;
        }, { db, user }: import("../../context").Context): Promise<boolean>;
        unfollowCategory(_: any, { categoryId }: {
            categoryId: string;
        }, { db, user }: import("../../context").Context): Promise<boolean>;
        bookmarkContent(_: any, { contentItemId, note, folder, }: {
            contentItemId: string;
            note?: string;
            folder?: string;
        }, { db, user }: import("../../context").Context): Promise<boolean>;
        removeBookmark(_: any, { contentItemId }: {
            contentItemId: string;
        }, { db, user }: import("../../context").Context): Promise<boolean>;
        voteContent(_: any, { contentItemId, value }: {
            contentItemId: string;
            value: number;
        }, { db, user }: import("../../context").Context): Promise<any>;
        removeVote(_: any, { contentItemId }: {
            contentItemId: string;
        }, { db, user }: import("../../context").Context): Promise<any>;
        shareContent(_: any, { contentItemId, platform }: {
            contentItemId: string;
            platform: string;
        }, { db, user }: import("../../context").Context): Promise<boolean>;
        recordContentView(_: any, { contentItemId, viewDuration, completed, }: {
            contentItemId: string;
            viewDuration?: number;
            completed?: boolean;
        }, { db, user }: import("../../context").Context): Promise<boolean>;
        createContentItem(_: any, { input }: {
            input: any;
        }, { db, user }: import("../../context").Context): Promise<any>;
        createSubscription(_: any, { tier }: any, { user, db }: import("../../context").Context): Promise<any>;
        cancelSubscription(_: any, __: any, { user, db }: import("../../context").Context): Promise<boolean>;
        createCourse(_: any, { title, description }: any, { user, db }: import("../../context").Context): Promise<any>;
        addModuleToCourse(_: any, { courseId, title, videoIds }: any, { user, db }: import("../../context").Context): Promise<any>;
        enrollInCourse(_: any, { courseId }: any, { user, db }: import("../../context").Context): Promise<boolean>;
        createThread(_: any, { title, category, tags, content }: any, { user, db }: import("../../context").Context): Promise<any>;
        createPost(_: any, { threadId, content }: any, { user, db }: import("../../context").Context): Promise<any>;
        votePost(_: any, { postId, value }: any, { user, db }: import("../../context").Context): Promise<any>;
        requestUploadUrl(_: any, { title, description, tags, category, difficulty }: any, { user, db }: import("../../context").Context): Promise<{
            uploadUrl: string;
            videoId: string;
        }>;
        requestThumbnailUploadUrl(_: any, { videoId }: any, { user, db }: import("../../context").Context): Promise<{
            uploadUrl: string;
            videoId: any;
        }>;
        completeVideoUpload(_: any, { videoId, fileSize }: any, { user, db }: import("../../context").Context): Promise<any>;
        updateVideo(_: any, { id, title, description, tags, category, difficulty, thumbnailUrl }: any, { user, db }: import("../../context").Context): Promise<any>;
        deleteVideo(_: any, { id }: any, { user, db }: import("../../context").Context): Promise<boolean>;
        updateProfile(_: any, { name, bio, avatar }: any, { user, db }: import("../../context").Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        applyForCreator(_: any, { credentials }: any, { user, db }: import("../../context").Context): Promise<{
            verified: boolean;
            approvalStatus: string;
            credentials: any;
            subscriberCount: number;
            totalViews: number;
        }>;
        signup(_: any, { email, password, name }: any, { db }: import("../../context").Context): Promise<{
            token: string;
            refreshToken: string;
            user: {
                id: any;
                email: any;
                name: any;
                role: any;
                createdAt: any;
            };
        }>;
        login(_: any, { email, password }: any, { db }: import("../../context").Context): Promise<{
            token: string;
            refreshToken: string;
            user: {
                id: any;
                email: any;
                name: any;
                role: any;
                createdAt: any;
            };
        }>;
        refreshToken(_: any, { refreshToken }: any, { db }: import("../../context").Context): Promise<{
            token: string;
            refreshToken: string;
            user: {
                id: any;
                email: any;
                name: any;
                role: any;
                createdAt: any;
            };
        }>;
        requestPasswordReset(_: any, { email }: {
            email: string;
        }, { db }: import("../../context").Context): Promise<{
            success: boolean;
            message: string;
        }>;
        resetPassword(_: any, { token, newPassword }: {
            token: string;
            newPassword: string;
        }, { db }: import("../../context").Context): Promise<{
            success: boolean;
            message: string;
        }>;
    };
    User: {
        profile(parent: any, _: any, { db }: import("../../context").Context): Promise<any>;
        creatorProfile(parent: any, _: any, { db }: import("../../context").Context): Promise<{
            verified: any;
            approvalStatus: any;
            credentials: any;
            subscriberCount: number;
            totalViews: number;
        }>;
    };
    Video: {
        status(parent: any): any;
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
        completedAt(parent: any): any;
        thumbnailUrl(parent: any): any;
        manifestUrl(parent: any): any;
        fileSize(parent: any): any;
        processingProgress(parent: any): any;
        errorMessage(parent: any): any;
        creator(parent: any, _: any, { db }: import("../../context").Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
    };
    Thread: {
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
        creator(parent: any, _: any, { db }: import("../../context").Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        posts(parent: any, _: any, { db }: import("../../context").Context): Promise<any[]>;
    };
    Post: {
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
        isExpertAnswer(parent: any): any;
        thread(parent: any, _: any, { db }: import("../../context").Context): Promise<any>;
        author(parent: any, _: any, { db }: import("../../context").Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
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
        parentCategory(parent: any, _: any, { db }: import("../../context").Context): Promise<any>;
        subCategories(parent: any, _: any, { db }: import("../../context").Context): Promise<any[]>;
        isFollowing(parent: any, _: any, { db, user }: import("../../context").Context): Promise<boolean>;
        featuredContent(parent: any, _: any, { db }: import("../../context").Context): Promise<any[]>;
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
        category(parent: any, _: any, { db }: import("../../context").Context): Promise<any>;
        author(parent: any, _: any, { db }: import("../../context").Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        video(parent: any, _: any, { db }: import("../../context").Context): Promise<any>;
    };
    UserAstronomyProfile: {
        astronomyLevel(parent: any): any;
        onboardingCompleted(parent: any): any;
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
        user(parent: any, _: any, { db }: import("../../context").Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        followedCategoriesCount(parent: any, _: any, { db }: import("../../context").Context): Promise<number>;
        bookmarkedContentCount(parent: any, _: any, { db }: import("../../context").Context): Promise<number>;
    };
    CreatorAnalytics: {
        contentByCategory(parent: any, _: any, { db }: import("../../context").Context): Promise<any[]>;
        audienceLevel(parent: any): any;
        viewsOverTime(parent: any): any;
        engagementOverTime(parent: any): any;
    };
    YouTubeCategoryMapping: {
        categoryId(parent: any): any;
        category(parent: any, _: any, { db }: import("../../context").Context): Promise<any>;
        searchKeywords(parent: any): any;
        channelIds(parent: any): any;
        qualityThreshold(parent: any): any;
        syncEnabled(parent: any): any;
        syncFrequency(parent: any): any;
        maxVideosPerSync(parent: any): any;
        lastSyncAt(parent: any): any;
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
    };
    YouTubeSyncJob: {
        categoryId(parent: any): any;
        categoryName(parent: any): any;
        jobType(parent: any): any;
        videosFetched(parent: any): any;
        videosImported(parent: any): any;
        videosSkipped(parent: any): any;
        videosFailed(parent: any): any;
        quotaCost(parent: any): any;
        durationSeconds(parent: any): any;
        errorMessage(parent: any): any;
        startedAt(parent: any): any;
        completedAt(parent: any): any;
        createdAt(parent: any): any;
    };
    YouTubeSyncStatus: {
        categoryId(parent: any): any;
        categoryName(parent: any): any;
        lastSyncAt(parent: any): any;
        hoursSinceSync(parent: any): number;
        videoCount(parent: any): number;
        syncEnabled(parent: any): boolean;
    };
    VideoAnalytics: {
        retentionCurve(parent: any, _: any, { db }: import("../../context").Context): Promise<{
            timestamp: any;
            viewerPercentage: number;
            viewerCount: number;
            dropOffCount: number;
        }[]>;
        trafficSources(parent: any, _: any, { db }: import("../../context").Context): Promise<{
            source: any;
            views: number;
            uniqueViewers: number;
            percentage: number;
            avgCompletion: number;
        }[]>;
        deviceStats(parent: any, _: any, { db }: import("../../context").Context): Promise<{
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
        viewsByDate(parent: any, _: any, { db }: import("../../context").Context): Promise<{
            date: any;
            value: number;
        }[]>;
        topCountries(parent: any, _: any, { db }: import("../../context").Context): Promise<{
            country: any;
            views: number;
            percentage: number;
        }[]>;
    };
};
//# sourceMappingURL=index.d.ts.map