"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const auth_1 = require("./auth");
const user_1 = require("./user");
const video_1 = require("./video");
const forum_1 = require("./forum");
const course_1 = require("./course");
const subscription_1 = require("./subscription");
const content_1 = require("./content");
const analytics_1 = require("./analytics");
const youtube_1 = require("./youtube");
const video_analytics_1 = require("./video-analytics");
const admin_1 = require("./admin");
const news_1 = require("./news");
const graphql_1 = require("graphql");
const dateTimeScalar = new graphql_1.GraphQLScalarType({
    name: 'DateTime',
    description: 'DateTime custom scalar type',
    serialize(value) {
        return value instanceof Date ? value.toISOString() : value;
    },
    parseValue(value) {
        return new Date(value);
    },
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.STRING) {
            return new Date(ast.value);
        }
        return null;
    },
});
const jsonScalar = new graphql_1.GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize(value) {
        return value;
    },
    parseValue(value) {
        return value;
    },
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.OBJECT) {
            return ast;
        }
        if (ast.kind === graphql_1.Kind.STRING) {
            return JSON.parse(ast.value);
        }
        return null;
    },
});
exports.resolvers = {
    DateTime: dateTimeScalar,
    JSON: jsonScalar,
    Query: {
        ...user_1.userResolvers.Query,
        ...video_1.videoResolvers.Query,
        ...forum_1.forumResolvers.Query,
        ...course_1.courseResolvers.Query,
        ...content_1.contentResolvers.Query,
        ...analytics_1.analyticsResolvers.Query,
        ...youtube_1.youtubeResolvers.Query,
        ...video_analytics_1.videoAnalyticsResolvers.Query,
        ...admin_1.adminResolvers.Query,
        ...news_1.newsResolvers.Query,
    },
    Mutation: {
        ...auth_1.authResolvers.Mutation,
        ...user_1.userResolvers.Mutation,
        ...video_1.videoResolvers.Mutation,
        ...forum_1.forumResolvers.Mutation,
        ...course_1.courseResolvers.Mutation,
        ...subscription_1.subscriptionResolvers.Mutation,
        ...content_1.contentResolvers.Mutation,
        ...youtube_1.youtubeResolvers.Mutation,
        ...video_analytics_1.videoAnalyticsResolvers.Mutation,
        ...admin_1.adminResolvers.Mutation,
    },
    User: user_1.userResolvers.User,
    Video: video_1.videoResolvers.Video,
    Thread: forum_1.forumResolvers.Thread,
    Post: forum_1.forumResolvers.Post,
    ContentCategory: content_1.contentResolvers.ContentCategory,
    ContentItem: content_1.contentResolvers.ContentItem,
    UserAstronomyProfile: content_1.contentResolvers.UserAstronomyProfile,
    CreatorAnalytics: analytics_1.analyticsResolvers.CreatorAnalytics,
    YouTubeCategoryMapping: youtube_1.youtubeResolvers.YouTubeCategoryMapping,
    YouTubeSyncJob: youtube_1.youtubeResolvers.YouTubeSyncJob,
    YouTubeSyncStatus: youtube_1.youtubeResolvers.YouTubeSyncStatus,
    VideoAnalytics: video_analytics_1.videoAnalyticsResolvers.VideoAnalytics,
};
//# sourceMappingURL=index.js.map