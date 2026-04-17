import { GraphQLError } from 'graphql';
import { SubscriptionService } from '../services/subscription.js';
import { PLAN_CONFIGS } from '../config/plans.js';

interface Context {
  userId?: string | null;
  role?: string | null;
  user?: {
    userId?: string | null;
  };
}

const TIER_MAP: Record<string, 'FREE' | 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'SCHOOL'> = {
  FREE_TRIAL: 'TRIAL',
  BASIC: 'STARTER',
  PREMIUM: 'PROFESSIONAL',
  ENTERPRISE: 'SCHOOL',
  FREE: 'FREE',
  TRIAL: 'TRIAL',
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  SCHOOL: 'SCHOOL',
};

const STATUS_MAP: Record<string, 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELED' | 'PAST_DUE'> = {
  ACTIVE: 'ACTIVE',
  TRIAL: 'TRIAL',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELED',
  CANCELED: 'CANCELED',
  PAST_DUE: 'PAST_DUE',
};

function getUserId(context: Context): string | null {
  return context.userId || context.user?.userId || null;
}

function mapTier(tier: string): 'FREE' | 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'SCHOOL' {
  return TIER_MAP[tier] || 'FREE';
}

function mapStatus(status: string): 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELED' | 'PAST_DUE' {
  return STATUS_MAP[status] || 'ACTIVE';
}

export const SubscriptionPlanResolvers = {
  Query: {
    // Get current user's subscription
    mySubscription: async (_: unknown, __: unknown, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const subscription = await SubscriptionService.getOrCreateSubscription(userId);
        return {
          ...subscription.toObject(),
          planTier: mapTier(subscription.planTier),
          status: mapStatus(subscription.status),
          isFoundingMember: false,
        };
      } catch (error) {
        console.error('Error fetching subscription:', error);
        // Fail open - return a default TRIAL subscription
        return {
          userId,
          planTier: 'TRIAL',
          status: 'TRIAL',
          limits: PLAN_CONFIGS.FREE_TRIAL.limits,
          isFoundingMember: false,
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    },

    // Get available plans
    availablePlans: async () => {
      return Object.entries(PLAN_CONFIGS).map(([tier, config]) => ({
        tier: mapTier(tier),
        name: config.name,
        price: config.price.monthly,
        billingPeriod: 'monthly',
        limits: config.limits,
        features: config.features,
        stripePriceId: config.stripeMonthlyPriceId,
      }));
    },

    // Check if user has access to a specific feature
    checkFeatureAccess: async (
      _: unknown,
      { feature }: { feature: string },
      context: Context
    ) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        // For boolean features, just check if they have it
        const subscription = await SubscriptionService.getOrCreateSubscription(userId);
        const plan = PLAN_CONFIGS[subscription.planTier];
        
        // Check if the feature is a boolean feature
        const booleanFeatures = ['customCurrency', 'analytics', 'exportData', 'prioritySupport'] as const;
        if (booleanFeatures.includes(feature as any)) {
          const hasFeature = plan.limits[feature as typeof booleanFeatures[number]];
          return {
            allowed: hasFeature,
            reason: hasFeature ? 'Feature available' : 'Upgrade required',
          };
        }

        // For numeric features, we need a classId parameter (handled by specific resolvers)
        return {
          allowed: true,
          reason: 'Feature check requires additional context',
        };
      } catch (error) {
        console.error('Error checking feature access:', error);
        // Fail open - allow access on error
        return {
          allowed: true,
          reason: 'Error checking access, allowed by default',
        };
      }
    },

    // Check if user can create a class
    canCreateClass: async (_: unknown, __: unknown, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const result = await SubscriptionService.canCreateClass(userId);
        return result;
      } catch (error) {
        console.error('Error checking class creation:', error);
        // Fail open - allow creation on error
        return {
          allowed: true,
          reason: 'Error checking limit, allowed by default',
        };
      }
    },

    // Check if user can add student to a class
    canAddStudent: async (
      _: unknown,
      { classId }: { classId: string },
      context: Context
    ) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const result = await SubscriptionService.canAddStudent(userId, classId);
        return result;
      } catch (error) {
        console.error('Error checking student addition:', error);
        // Fail open - allow addition on error
        return {
          allowed: true,
          reason: 'Error checking limit, allowed by default',
        };
      }
    },
  },

  Mutation: {
    // Create Stripe checkout session
    createCheckoutSession: async (
      _: unknown,
      { planTier }: { planTier: string },
      context: Context
    ) => {
      if (!getUserId(context)) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // TODO: Implement Stripe checkout session creation
      // This will return a Stripe checkout URL
      throw new GraphQLError('Stripe integration not yet implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' },
      });
    },

    // Cancel subscription
    cancelSubscription: async (_: unknown, __: unknown, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const subscription = await SubscriptionService.cancelSubscription(userId);
        return {
          ...subscription.toObject(),
          planTier: mapTier(subscription.planTier),
          status: mapStatus(subscription.status),
          isFoundingMember: false,
        };
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw new GraphQLError('Failed to cancel subscription');
      }
    },

    // Reactivate subscription
    reactivateSubscription: async (_: unknown, __: unknown, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const subscription = await SubscriptionService.reactivateSubscription(userId);
        return {
          ...subscription.toObject(),
          planTier: mapTier(subscription.planTier),
          status: mapStatus(subscription.status),
          isFoundingMember: false,
        };
      } catch (error) {
        console.error('Error reactivating subscription:', error);
        throw new GraphQLError('Failed to reactivate subscription');
      }
    },
  },

  SubscriptionPlan: {
    // Resolver for id field (map _id to id)
    id: (parent: any) => parent._id || parent.id,
  },
};
