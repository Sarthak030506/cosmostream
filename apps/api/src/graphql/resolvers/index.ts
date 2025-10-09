import { authResolvers } from './auth';
import { userResolvers } from './user';
import { videoResolvers } from './video';
import { forumResolvers } from './forum';
import { courseResolvers } from './course';
import { subscriptionResolvers } from './subscription';
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

export const resolvers = {
  DateTime: dateTimeScalar,
  Query: {
    ...userResolvers.Query,
    ...videoResolvers.Query,
    ...forumResolvers.Query,
    ...courseResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...videoResolvers.Mutation,
    ...forumResolvers.Mutation,
    ...courseResolvers.Mutation,
    ...subscriptionResolvers.Mutation,
  },
  User: userResolvers.User,
  Video: videoResolvers.Video,
  Thread: forumResolvers.Thread,
  Post: forumResolvers.Post,
};
