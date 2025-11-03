import { authResolvers } from './auth';
import { userResolvers } from './user';
import { videoResolvers } from './video';
import { forumResolvers } from './forum';
import { courseResolvers } from './course';
import { subscriptionResolvers } from './subscription';
import { contentResolvers } from './content';
import { analyticsResolvers } from './analytics';
import { youtubeResolvers } from './youtube';
import { videoAnalyticsResolvers } from './video-analytics';
import { adminResolvers } from './admin';
import { newsResolvers } from './news';
import { GraphQLScalarType, Kind } from 'graphql';

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      return ast;
    }
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value);
    }
    return null;
  },
});

export const resolvers = {
  DateTime: dateTimeScalar,
  JSON: jsonScalar,
  Query: {
    ...userResolvers.Query,
    ...videoResolvers.Query,
    ...forumResolvers.Query,
    ...courseResolvers.Query,
    ...contentResolvers.Query,
    ...analyticsResolvers.Query,
    ...youtubeResolvers.Query,
    ...videoAnalyticsResolvers.Query,
    ...adminResolvers.Query,
    ...newsResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...videoResolvers.Mutation,
    ...forumResolvers.Mutation,
    ...courseResolvers.Mutation,
    ...subscriptionResolvers.Mutation,
    ...contentResolvers.Mutation,
    ...youtubeResolvers.Mutation,
    ...videoAnalyticsResolvers.Mutation,
    ...adminResolvers.Mutation,
  },
  User: userResolvers.User,
  Video: videoResolvers.Video,
  Thread: forumResolvers.Thread,
  Post: forumResolvers.Post,
  ContentCategory: contentResolvers.ContentCategory,
  ContentItem: contentResolvers.ContentItem,
  UserAstronomyProfile: contentResolvers.UserAstronomyProfile,
  CreatorAnalytics: analyticsResolvers.CreatorAnalytics,
  YouTubeCategoryMapping: youtubeResolvers.YouTubeCategoryMapping,
  YouTubeSyncJob: youtubeResolvers.YouTubeSyncJob,
  YouTubeSyncStatus: youtubeResolvers.YouTubeSyncStatus,
  VideoAnalytics: videoAnalyticsResolvers.VideoAnalytics,
};
