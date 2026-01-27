/**
 * Campaign Service
 * Manages campaign lifecycle and statistics
 */

import { Campaign, DeliveryJob, type ICampaign, type CampaignStatus } from '../models';
import { enqueueCampaignEmails } from './delivery';
import { campaignLogger } from '../config';
import { Types } from 'mongoose';

/**
 * Create a new campaign
 */
export const createCampaign = async (params: {
  name?: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<ICampaign> => {
  const campaign = await Campaign.create({
    name: params.name || null,
    subject: params.subject,
    html: params.html,
    text: params.text || null,
    status: 'DRAFT',
  });

  campaignLogger.info({ campaignId: campaign._id, name: params.name }, 'Campaign created');

  return campaign;
};

/**
 * Get campaign by ID
 */
export const getCampaign = async (id: string): Promise<ICampaign | null> => {
  if (!Types.ObjectId.isValid(id)) return null;
  return Campaign.findById(id).exec();
};

/**
 * Queue a campaign for sending
 */
export const queueCampaignSend = async (campaignId: string): Promise<boolean> => {
  const campaign = await Campaign.findById(campaignId).exec();

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status !== 'DRAFT') {
    throw new Error(`Campaign cannot be queued from status: ${campaign.status}`);
  }

  // Transition to QUEUED
  campaign.status = 'QUEUED';
  await campaign.save();

  campaignLogger.info({ campaignId }, 'Campaign status changed to QUEUED');

  try {
    // Enqueue delivery jobs for all subscribers
    const count = await enqueueCampaignEmails(
      campaignId,
      campaign.subject,
      campaign.html,
      campaign.text || undefined
    );

    // Transition to SENDING
    campaign.status = 'SENDING';
    await campaign.save();

    campaignLogger.info({ campaignId, jobsEnqueued: count }, 'Campaign jobs enqueued');

    return true;
  } catch (error) {
    campaign.status = 'FAILED';
    await campaign.save();

    campaignLogger.error({ campaignId, error }, 'Failed to queue campaign');
    throw error;
  }
};

/**
 * Get campaign statistics
 */
export const getCampaignStats = async (
  campaignId: string
): Promise<{
  queued: number;
  sending: number;
  sent: number;
  failed: number;
  retry: number;
  total: number;
}> => {
  if (!Types.ObjectId.isValid(campaignId)) {
    return { queued: 0, sending: 0, sent: 0, failed: 0, retry: 0, total: 0 };
  }

  const stats = await DeliveryJob.aggregate([
    { $match: { campaignId: new Types.ObjectId(campaignId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]).exec();

  const result = {
    queued: 0,
    sending: 0,
    sent: 0,
    failed: 0,
    retry: 0,
    total: 0,
  };

  for (const stat of stats) {
    const status = stat._id.toLowerCase() as keyof typeof result;
    if (status in result) {
      result[status] = stat.count;
    }
    result.total += stat.count;
  }

  return result;
};

/**
 * Update campaign status based on job completion
 */
export const updateCampaignStatusFromJobs = async (campaignId: string): Promise<void> => {
  const stats = await getCampaignStats(campaignId);
  const campaign = await Campaign.findById(campaignId).exec();

  if (!campaign) return;

  // All jobs processed
  if (stats.queued === 0 && stats.sending === 0 && stats.retry === 0) {
    if (stats.failed > 0 && stats.sent === 0) {
      campaign.status = 'FAILED';
    } else {
      campaign.status = 'SENT';
      campaign.sentAt = new Date();
    }
    await campaign.save();

    campaignLogger.info(
      { campaignId, status: campaign.status, stats },
      'Campaign status updated'
    );
  }
};

/**
 * List campaigns with pagination
 */
export const listCampaigns = async (params: {
  status?: CampaignStatus;
  limit?: number;
  offset?: number;
}): Promise<{ campaigns: ICampaign[]; total: number }> => {
  const filter: Record<string, unknown> = {};
  if (params.status) {
    filter.status = params.status;
  }

  const [campaigns, total] = await Promise.all([
    Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip(params.offset || 0)
      .limit(params.limit || 20)
      .exec(),
    Campaign.countDocuments(filter).exec(),
  ]);

  return { campaigns, total };
};
