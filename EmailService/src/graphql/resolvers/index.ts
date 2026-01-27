/**
 * Resolvers Index
 * Combines all resolvers and custom scalars
 */

import { GraphQLDateTime } from './scalars';
import { authResolvers } from './auth.resolvers';
import { listResolvers } from './list.resolvers';
import { campaignResolvers } from './campaign.resolvers';

// Merge all resolvers
export const resolvers = {
  // Custom scalars
  DateTime: GraphQLDateTime,

  // Queries
  Query: {
    // Health check
    health: () => true,

    // List queries
    ...listResolvers.Query,

    // Campaign queries
    ...campaignResolvers.Query,
  },

  // Mutations
  Mutation: {
    // Auth mutations
    ...authResolvers.Mutation,

    // List mutations
    ...listResolvers.Mutation,

    // Campaign mutations
    ...campaignResolvers.Mutation,
  },

  // Type resolvers
  Subscriber: listResolvers.Subscriber,
  Campaign: campaignResolvers.Campaign,
};
