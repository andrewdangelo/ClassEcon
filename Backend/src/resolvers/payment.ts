/**
 * Payment GraphQL Resolvers
 * 
 * These resolvers proxy payment requests to the PaymentService microservice.
 * The Backend doesn't handle Stripe directly - it delegates to PaymentService.
 */

import { GraphQLError } from 'graphql';
import { PaymentServiceClient } from '../services/payment-service';
import { User } from '../models/User';

type CanonicalTier = 'FREE' | 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'SCHOOL';
type CanonicalStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELED' | 'PAST_DUE';

const PLAN_LIMITS: Record<
  CanonicalTier,
  {
    maxClasses: number | null;
    maxStudentsPerClass: number | null;
    maxStoreItems: number | null;
    maxJobs: number | null;
    customCurrency: boolean;
    analytics: boolean;
    exportData: boolean;
    prioritySupport: boolean;
  }
> = {
  FREE: {
    maxClasses: 1,
    maxStudentsPerClass: 30,
    maxStoreItems: 10,
    maxJobs: 5,
    customCurrency: false,
    analytics: false,
    exportData: false,
    prioritySupport: false,
  },
  TRIAL: {
    maxClasses: 2,
    maxStudentsPerClass: 30,
    maxStoreItems: 20,
    maxJobs: 10,
    customCurrency: true,
    analytics: true,
    exportData: true,
    prioritySupport: false,
  },
  STARTER: {
    maxClasses: 1,
    maxStudentsPerClass: 30,
    maxStoreItems: 20,
    maxJobs: 10,
    customCurrency: false,
    analytics: false,
    exportData: false,
    prioritySupport: false,
  },
  PROFESSIONAL: {
    maxClasses: 5,
    maxStudentsPerClass: null,
    maxStoreItems: 100,
    maxJobs: 50,
    customCurrency: true,
    analytics: true,
    exportData: true,
    prioritySupport: false,
  },
  SCHOOL: {
    maxClasses: null,
    maxStudentsPerClass: null,
    maxStoreItems: null,
    maxJobs: null,
    customCurrency: true,
    analytics: true,
    exportData: true,
    prioritySupport: true,
  },
};

function normalizeTier(value?: string | null): CanonicalTier {
  const tier = String(value || '').toUpperCase();
  switch (tier) {
    case 'TRIAL':
    case 'FREE_TRIAL':
      return 'TRIAL';
    case 'STARTER':
    case 'BASIC':
      return 'STARTER';
    case 'PROFESSIONAL':
    case 'PREMIUM':
      return 'PROFESSIONAL';
    case 'SCHOOL':
    case 'ENTERPRISE':
      return 'SCHOOL';
    case 'FREE':
    default:
      return 'FREE';
  }
}

function normalizeStatus(value?: string | null): CanonicalStatus {
  const status = String(value || '').toUpperCase();
  switch (status) {
    case 'TRIAL':
    case 'TRIALING':
      return 'TRIAL';
    case 'EXPIRED':
      return 'EXPIRED';
    case 'CANCELLED':
    case 'CANCELED':
      return 'CANCELED';
    case 'PAST_DUE':
      return 'PAST_DUE';
    case 'ACTIVE':
    default:
      return 'ACTIVE';
  }
}

function buildSubscriptionPlanPayload(
  user: any,
  paymentSubscription?: {
    tier: string;
    status: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId: string | null;
  } | null,
  overrides?: Partial<{
    status: CanonicalStatus;
    cancelAtPeriodEnd: boolean;
  }>
) {
  const planTier = normalizeTier(paymentSubscription?.tier || user.subscriptionTier);
  const status =
    overrides?.status || normalizeStatus(paymentSubscription?.status || user.subscriptionStatus);

  return {
    id: String(user._id),
    userId: String(user._id),
    planTier,
    status,
    limits: PLAN_LIMITS[planTier],
    isFoundingMember: Boolean(user.isFoundingMember),
    stripeCustomerId: user.stripeCustomerId || null,
    stripeSubscriptionId:
      paymentSubscription?.stripeSubscriptionId || user.stripeSubscriptionId || null,
    currentPeriodStart: paymentSubscription?.currentPeriodStart
      ? new Date(paymentSubscription.currentPeriodStart)
      : null,
    currentPeriodEnd: paymentSubscription?.currentPeriodEnd
      ? new Date(paymentSubscription.currentPeriodEnd)
      : null,
    trialEndsAt: user.trialEndsAt || null,
    cancelAtPeriodEnd:
      overrides?.cancelAtPeriodEnd ?? paymentSubscription?.cancelAtPeriodEnd ?? false,
    cancelledAt: status === 'CANCELED' ? new Date() : null,
    createdAt: user.createdAt || new Date(),
    updatedAt: new Date(),
  };
}

export const paymentResolvers = {
  Query: {
    /**
     * Get current user's subscription details
     */
    async mySubscription(_: unknown, __: unknown, context: any) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await User.findById(context.user.userId);
      if (!user) {
        throw new GraphQLError('User not found');
      }

      // Get subscription details from PaymentService if user has Stripe subscription
      let paymentSubscription = null;
      if (user.stripeSubscriptionId) {
        try {
          paymentSubscription = await PaymentServiceClient.getSubscription(context.user.userId);
        } catch (error) {
          console.error('Error fetching subscription from PaymentService:', error);
        }
      }

      return buildSubscriptionPlanPayload(user, paymentSubscription);
    },

    /**
     * Get user's invoices
     */
    async getInvoices(_: unknown, args: { limit?: number }, context: any) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const invoices = await PaymentServiceClient.getInvoices(
          context.user.userId,
          args.limit || 12
        );
        return invoices;
      } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }
    },

    /**
     * Get upcoming invoice preview
     */
    async upcomingInvoice(_: unknown, __: unknown, context: any) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        return await PaymentServiceClient.getUpcomingInvoice(context.user.userId);
      } catch (error) {
        console.error('Error fetching upcoming invoice:', error);
        return null;
      }
    },

    /**
     * Get payment methods
     */
    async myPaymentMethods(_: unknown, __: unknown, context: any) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        return await PaymentServiceClient.getPaymentMethods(context.user.userId);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        return [];
      }
    },
  },

  Mutation: {
    /**
     * Create checkout session for subscription
     */
    async createPaymentCheckout(
      _: unknown,
      args: {
        tier: string;
        interval: string;
        isFoundingMember?: boolean;
      },
      context: any
    ) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await User.findById(context.user.userId);
      if (!user) {
        throw new GraphQLError('User not found');
      }

      if (!user.email) {
        throw new GraphQLError('User email is required for checkout');
      }

      const normalizedTier = normalizeTier(args.tier);
      if (normalizedTier === 'FREE' || normalizedTier === 'TRIAL') {
        throw new GraphQLError('Cannot create checkout session for free or trial tiers');
      }

      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const session = await PaymentServiceClient.createCheckoutSession({
          userId: context.user.userId,
          email: user.email,
          tier: normalizedTier,
          interval: args.interval,
          isFoundingMember: args.isFoundingMember || user.isFoundingMember,
          successUrl: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${frontendUrl}/subscription/settings`,
        });

        return session;
      } catch (error: any) {
        console.error('Error creating checkout session:', error);
        throw new GraphQLError(
          error.response?.data?.error || 'Failed to create checkout session'
        );
      }
    },

    /**
     * Create billing portal session
     */
    async createBillingPortalSession(
      _: unknown,
      args: { returnUrl?: string },
      context: any
    ) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const returnUrl = args.returnUrl || `${frontendUrl}/subscription/settings`;

        const session = await PaymentServiceClient.createPortalSession(
          context.user.userId,
          returnUrl
        );

        return session;
      } catch (error: any) {
        console.error('Error creating portal session:', error);
        throw new GraphQLError(
          error.response?.data?.error || 'Failed to create portal session'
        );
      }
    },

    /**
     * Cancel subscription
     */
    async cancelSubscription(_: unknown, __: unknown, context: any) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        await PaymentServiceClient.cancelSubscription(context.user.userId);
        const user = await User.findById(context.user.userId);
        if (!user) {
          throw new GraphQLError('User not found');
        }
        return buildSubscriptionPlanPayload(user, null, {
          cancelAtPeriodEnd: true,
        });
      } catch (error: any) {
        console.error('Error cancelling subscription:', error);
        throw new GraphQLError(
          error.response?.data?.error || 'Failed to cancel subscription'
        );
      }
    },

    /**
     * Reactivate subscription
     */
    async reactivateSubscription(_: unknown, __: unknown, context: any) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        await PaymentServiceClient.reactivateSubscription(context.user.userId);

        const user = await User.findById(context.user.userId);
        if (!user) {
          throw new GraphQLError('User not found');
        }
        return buildSubscriptionPlanPayload(user, null, {
          cancelAtPeriodEnd: false,
        });
      } catch (error: any) {
        console.error('Error reactivating subscription:', error);
        throw new GraphQLError(
          error.response?.data?.error || 'Failed to reactivate subscription'
        );
      }
    },

    /**
     * Upgrade subscription
     */
    async upgradeSubscription(
      _: unknown,
      args: { tier: string; interval?: string },
      context: any
    ) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await User.findById(context.user.userId);
      if (!user) {
        throw new GraphQLError('User not found');
      }

      if (!user.email) {
        throw new GraphQLError('User email is required for subscription');
      }

      const normalizedTier = normalizeTier(args.tier);
      if (normalizedTier === 'FREE' || normalizedTier === 'TRIAL') {
        throw new GraphQLError('Upgrade tier must be a paid tier');
      }

      try {
        // If user has existing subscription, update it
        if (user.stripeSubscriptionId) {
          await PaymentServiceClient.updateSubscriptionTier(context.user.userId, normalizedTier);
          return {
            success: true,
            message: `Subscription upgraded to ${normalizedTier}`,
            checkoutUrl: null,
          };
        }

        // Otherwise create checkout for new subscription
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const session = await PaymentServiceClient.createCheckoutSession({
          userId: context.user.userId,
          email: user.email,
          tier: normalizedTier,
          interval: args.interval || 'monthly',
          isFoundingMember: user.isFoundingMember,
          successUrl: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${frontendUrl}/subscription/settings`,
        });

        return {
          success: false,
          message: 'Checkout required',
          checkoutUrl: session.url,
        };
      } catch (error: any) {
        console.error('Error upgrading subscription:', error);
        throw new GraphQLError(
          error.response?.data?.error || 'Failed to upgrade subscription'
        );
      }
    },

    /**
     * Legacy createCheckoutSession for backward compatibility
     */
    async createCheckoutSession(
      _: unknown,
      args: { planTier: string },
      context: any
    ) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await User.findById(context.user.userId);
      if (!user) {
        throw new GraphQLError('User not found');
      }

      if (!user.email) {
        throw new GraphQLError('User email is required for checkout');
      }

      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const normalizedTier = normalizeTier(args.planTier);
        if (normalizedTier === 'FREE' || normalizedTier === 'TRIAL') {
          throw new GraphQLError('Cannot create checkout session for free or trial tiers');
        }
        const session = await PaymentServiceClient.createCheckoutSession({
          userId: context.user.userId,
          email: user.email,
          tier: normalizedTier,
          interval: 'monthly',
          isFoundingMember: user.isFoundingMember,
          successUrl: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${frontendUrl}/subscription/settings`,
        });

        return session.url;
      } catch (error: any) {
        console.error('Error creating checkout session:', error);
        throw new GraphQLError(
          error.response?.data?.error || 'Failed to create checkout session'
        );
      }
    },
  },
};
