/**
 * Stripe Subscription GraphQL Resolvers
 * 
 * GraphQL resolvers for Stripe subscription management
 */

import { GraphQLError } from 'graphql';
import { StripeService } from '../services/stripe';
import { User } from '../models/User';

export const stripeSubscriptionResolvers = {
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

      // Get Stripe subscription if available
      let stripeSubscription = null;
      if (user.stripeSubscriptionId) {
        stripeSubscription = await StripeService.getSubscription(user._id);
      }

      return {
        tier: user.subscriptionTier,
        status: user.subscriptionStatus,
        expiresAt: user.subscriptionExpiresAt,
        trialEndsAt: user.trialEndsAt,
        isFoundingMember: user.isFoundingMember,
        cancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end || false,
        currentPeriodEnd: (stripeSubscription as any)?.current_period_end
          ? new Date(((stripeSubscription as any).current_period_end as number) * 1000)
          : null,
      };
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

      const invoice = await StripeService.getUpcomingInvoice(context.user.userId);
      if (!invoice) {
        return null;
      }

      return {
        amountDue: invoice.amount_due / 100, // Convert cents to dollars
        currency: invoice.currency,
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000),
      };
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

      const paymentMethods = await StripeService.getPaymentMethods(context.user.userId);

      return paymentMethods.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expiryMonth: pm.card?.exp_month,
        expiryYear: pm.card?.exp_year,
      }));
    },
  },

  Mutation: {
    /**
     * Create checkout session for subscription upgrade
     */
    async createCheckoutSession(
      _: unknown,
      args: {
        tier: 'STARTER' | 'PROFESSIONAL' | 'SCHOOL';
        isFoundingMember?: boolean;
        successUrl: string;
        cancelUrl: string;
      },
      context: any
    ) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const session = await StripeService.createCheckoutSession({
          userId: context.user.userId,
          tier: args.tier,
          isFoundingMember: args.isFoundingMember,
          successUrl: args.successUrl,
          cancelUrl: args.cancelUrl,
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new GraphQLError(
          error instanceof Error ? error.message : 'Failed to create checkout session'
        );
      }
    },

    /**
     * Create billing portal session
     */
    async createPortalSession(
      _: unknown,
      args: { returnUrl: string },
      context: any
    ) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const session = await StripeService.createPortalSession(
          context.user.userId,
          args.returnUrl
        );

        return {
          url: session.url,
        };
      } catch (error) {
        console.error('Error creating portal session:', error);
        throw new GraphQLError(
          error instanceof Error ? error.message : 'Failed to create portal session'
        );
      }
    },

    /**
     * Cancel subscription at period end
     */
    async cancelSubscription(_: unknown, __: unknown, context: any) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        await StripeService.cancelSubscription(context.user.userId);

        return {
          success: true,
          message: 'Subscription will be cancelled at the end of the billing period',
        };
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw new GraphQLError(
          error instanceof Error ? error.message : 'Failed to cancel subscription'
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
        await StripeService.reactivateSubscription(context.user.userId);

        return {
          success: true,
          message: 'Subscription reactivated successfully',
        };
      } catch (error) {
        console.error('Error reactivating subscription:', error);
        throw new GraphQLError(
          error instanceof Error ? error.message : 'Failed to reactivate subscription'
        );
      }
    },

    /**
     * Update subscription tier
     */
    async updateSubscriptionTier(
      _: unknown,
      args: { tier: 'STARTER' | 'PROFESSIONAL' | 'SCHOOL' },
      context: any
    ) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        await StripeService.updateSubscriptionTier(context.user.userId, args.tier);

        return {
          success: true,
          message: `Subscription updated to ${args.tier} tier`,
        };
      } catch (error) {
        console.error('Error updating subscription:', error);
        throw new GraphQLError(
          error instanceof Error ? error.message : 'Failed to update subscription'
        );
      }
    },
  },
};
