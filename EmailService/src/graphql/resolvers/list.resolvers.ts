/**
 * List (Subscriber) Resolvers
 * Handles subscribe/unsubscribe operations
 */

import { z } from 'zod';
import { Subscriber, type ISubscriber } from '../../models';
import { requireAdmin, type GraphQLContext } from '../context';
import { generateUnsubscribeToken, verifyUnsubscribeToken } from '../../services/delivery';
import { logger } from '../../config';

// Input validation schemas
const emailSchema = z.string().email().toLowerCase().trim();

const subscribeInputSchema = z.object({
  email: emailSchema,
  tags: z.array(z.string()).optional(),
});

export const listResolvers = {
  Query: {
    /**
     * Get subscriber by email (admin only)
     */
    subscriber: async (
      _parent: unknown,
      { email }: { email: string },
      ctx: GraphQLContext
    ): Promise<ISubscriber | null> => {
      requireAdmin(ctx);

      const validated = emailSchema.parse(email);
      return Subscriber.findOne({ email: validated }).exec();
    },

    /**
     * List subscribers (admin only)
     */
    subscribers: async (
      _parent: unknown,
      args: { status?: string; limit?: number; offset?: number },
      ctx: GraphQLContext
    ): Promise<ISubscriber[]> => {
      requireAdmin(ctx);

      const filter: Record<string, unknown> = {};
      if (args.status) {
        filter.status = args.status;
      }

      return Subscriber.find(filter)
        .sort({ createdAt: -1 })
        .skip(args.offset || 0)
        .limit(args.limit || 50)
        .exec();
    },

    /**
     * Count subscribers (admin only)
     */
    subscriberCount: async (
      _parent: unknown,
      { status }: { status?: string },
      ctx: GraphQLContext
    ): Promise<number> => {
      requireAdmin(ctx);

      const filter: Record<string, unknown> = {};
      if (status) {
        filter.status = status;
      }

      return Subscriber.countDocuments(filter).exec();
    },
  },

  Mutation: {
    /**
     * Subscribe an email to the mailing list
     */
    subscribe: async (
      _parent: unknown,
      { input }: { input: { email: string; tags?: string[] } },
      _ctx: GraphQLContext
    ): Promise<ISubscriber> => {
      // Validate input
      const validated = subscribeInputSchema.parse(input);

      // Check if subscriber exists
      const existing = await Subscriber.findOne({ email: validated.email }).exec();

      if (existing) {
        // If suppressed, reject (unless admin - TODO: add admin override)
        if (existing.status === 'SUPPRESSED') {
          throw new Error('This email address has been suppressed and cannot be resubscribed');
        }

        // Resubscribe if unsubscribed
        if (existing.status === 'UNSUBSCRIBED') {
          existing.status = 'SUBSCRIBED';
          if (validated.tags) {
            existing.tags = [...new Set([...existing.tags, ...validated.tags])];
          }
          await existing.save();

          logger.info({ email: validated.email }, 'Subscriber resubscribed');
          return existing;
        }

        // Already subscribed - update tags if provided
        if (validated.tags && validated.tags.length > 0) {
          existing.tags = [...new Set([...existing.tags, ...validated.tags])];
          await existing.save();
        }

        return existing;
      }

      // Create new subscriber
      const unsubToken = generateUnsubscribeToken(validated.email);
      const subscriber = await Subscriber.create({
        email: validated.email,
        status: 'SUBSCRIBED',
        tags: validated.tags || [],
        unsubTokenHash: unsubToken, // Store the HMAC token (it's derived, not random)
      });

      logger.info({ email: validated.email }, 'New subscriber created');

      return subscriber;
    },

    /**
     * Unsubscribe using a token from email
     */
    unsubscribeByToken: async (
      _parent: unknown,
      { token, email }: { token: string; email: string },
      _ctx: GraphQLContext
    ): Promise<boolean> => {
      const validated = emailSchema.parse(email);

      // Verify the token
      if (!verifyUnsubscribeToken(validated, token)) {
        throw new Error('Invalid unsubscribe token');
      }

      // Find and update subscriber
      const result = await Subscriber.updateOne(
        { email: validated },
        { $set: { status: 'UNSUBSCRIBED' } }
      );

      if (result.modifiedCount === 0) {
        // Subscriber not found, but don't reveal this
        logger.warn({ email: validated }, 'Unsubscribe attempted for unknown email');
      } else {
        logger.info({ email: validated }, 'Subscriber unsubscribed');
      }

      return true;
    },

    /**
     * Suppress a subscriber (admin only)
     */
    suppressSubscriber: async (
      _parent: unknown,
      { email }: { email: string },
      ctx: GraphQLContext
    ): Promise<boolean> => {
      requireAdmin(ctx);

      const validated = emailSchema.parse(email);

      const result = await Subscriber.updateOne(
        { email: validated },
        { $set: { status: 'SUPPRESSED' } }
      );

      if (result.modifiedCount > 0) {
        logger.info({ email: validated }, 'Subscriber suppressed by admin');
      }

      return result.modifiedCount > 0;
    },

    /**
     * Reactivate a suppressed subscriber (admin only)
     */
    reactivateSubscriber: async (
      _parent: unknown,
      { email }: { email: string },
      ctx: GraphQLContext
    ): Promise<boolean> => {
      requireAdmin(ctx);

      const validated = emailSchema.parse(email);

      const result = await Subscriber.updateOne(
        { email: validated, status: 'SUPPRESSED' },
        { $set: { status: 'SUBSCRIBED' } }
      );

      if (result.modifiedCount > 0) {
        logger.info({ email: validated }, 'Subscriber reactivated by admin');
      }

      return result.modifiedCount > 0;
    },
  },

  // Type resolvers
  Subscriber: {
    id: (subscriber: ISubscriber) => subscriber._id.toString(),
  },
};
