/**
 * Campaign Resolvers
 * Handles campaign CRUD and sending operations
 */

import { z } from 'zod';
import { requireAdmin, type GraphQLContext } from '../context';
import {
  createCampaign,
  getCampaign,
  getCampaignStats,
  queueCampaignSend,
  listCampaigns,
} from '../../services/campaign';
import type { ICampaign, CampaignStatus } from '../../models';

// Input validation schemas
const campaignInputSchema = z.object({
  name: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().min(1, 'HTML content is required'),
  text: z.string().optional(),
});

const listCampaignsInputSchema = z.object({
  status: z.enum(['DRAFT', 'QUEUED', 'SENDING', 'SENT', 'FAILED']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

export const campaignResolvers = {
  Query: {
    /**
     * Get campaign by ID (admin only)
     */
    campaign: async (
      _parent: unknown,
      { id }: { id: string },
      ctx: GraphQLContext
    ): Promise<ICampaign | null> => {
      requireAdmin(ctx);
      return getCampaign(id);
    },

    /**
     * List campaigns (admin only)
     */
    campaigns: async (
      _parent: unknown,
      { input }: { input?: { status?: CampaignStatus; limit?: number; offset?: number } },
      ctx: GraphQLContext
    ): Promise<{ campaigns: ICampaign[]; total: number }> => {
      requireAdmin(ctx);

      const validated = input ? listCampaignsInputSchema.parse(input) : {};
      return listCampaigns(validated);
    },

    /**
     * Get campaign stats (admin only)
     */
    campaignStats: async (
      _parent: unknown,
      { id }: { id: string },
      ctx: GraphQLContext
    ): Promise<{ queued: number; sending: number; sent: number; failed: number; retry: number; total: number }> => {
      requireAdmin(ctx);
      return getCampaignStats(id);
    },

    /**
     * Get campaign with stats (admin only)
     */
    campaignWithStats: async (
      _parent: unknown,
      { id }: { id: string },
      ctx: GraphQLContext
    ): Promise<{ campaign: ICampaign; stats: Awaited<ReturnType<typeof getCampaignStats>> } | null> => {
      requireAdmin(ctx);

      const campaign = await getCampaign(id);
      if (!campaign) return null;

      const stats = await getCampaignStats(id);
      return { campaign, stats };
    },
  },

  Mutation: {
    /**
     * Create a new campaign (admin only)
     */
    createCampaign: async (
      _parent: unknown,
      { input }: { input: { name?: string; subject: string; html: string; text?: string } },
      ctx: GraphQLContext
    ): Promise<ICampaign> => {
      requireAdmin(ctx);

      const validated = campaignInputSchema.parse(input);
      return createCampaign(validated);
    },

    /**
     * Queue a campaign for sending (admin only)
     */
    queueCampaignSend: async (
      _parent: unknown,
      { campaignId }: { campaignId: string },
      ctx: GraphQLContext
    ): Promise<boolean> => {
      requireAdmin(ctx);
      return queueCampaignSend(campaignId);
    },
  },

  // Type resolvers
  Campaign: {
    id: (campaign: ICampaign) => campaign._id.toString(),
  },
};
