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
     * Get invoices for current user
     */
    async getInvoices(
      _: unknown,
      args: { limit?: number },
      context: any
    ) {
      if (!context.user?.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const user = await User.findById(context.user.userId);
        if (!user || !user.stripeCustomerId) {
          return [];
        }

        const invoices = await StripeService.getInvoices(context.user.userId, args.limit || 12);

        return invoices.map((invoice: any) => ({
          id: invoice.id,
          number: invoice.number,
          status: invoice.status,
          amountDue: invoice.amount_due,
          amountPaid: invoice.amount_paid,
          currency: invoice.currency,
          periodStart: new Date(invoice.period_start * 1000),
          periodEnd: new Date(invoice.period_end * 1000),
          invoiceUrl: invoice.hosted_invoice_url,
          invoicePdfUrl: invoice.invoice_pdf,
          createdAt: new Date(invoice.created * 1000),
        }));
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

    /**
     * Create payment checkout (for Frontend integration)
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

      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const session = await StripeService.createCheckoutSession({
          userId: context.user.userId,
          tier: args.tier as 'STARTER' | 'PROFESSIONAL' | 'SCHOOL',
          isFoundingMember: args.isFoundingMember,
          successUrl: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${frontendUrl}/subscription/settings`,
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error('Error creating payment checkout:', error);
        throw new GraphQLError(
          error instanceof Error ? error.message : 'Failed to create checkout session'
        );
      }
    },

    /**
     * Create billing portal session (for Frontend integration)
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
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const returnUrl = args.returnUrl || `${frontendUrl}/subscription/settings`;
        
        const session = await StripeService.createPortalSession(
          context.user.userId,
          returnUrl
        );

        return {
          url: session.url,
        };
      } catch (error) {
        console.error('Error creating billing portal session:', error);
        throw new GraphQLError(
          error instanceof Error ? error.message : 'Failed to create portal session'
        );
      }
    },

    /**
     * Upgrade subscription (for Frontend integration)
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

      try {
        const user = await User.findById(context.user.userId);
        if (!user) {
          throw new GraphQLError('User not found');
        }

        // If user has a subscription, update it; otherwise create checkout
        if (user.stripeSubscriptionId) {
          await StripeService.updateSubscriptionTier(context.user.userId, args.tier as 'STARTER' | 'PROFESSIONAL' | 'SCHOOL');
          return {
            success: true,
            message: `Subscription upgraded to ${args.tier}`,
            checkoutUrl: null,
          };
        } else {
          // Create checkout for new subscription
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          const session = await StripeService.createCheckoutSession({
            userId: context.user.userId,
            tier: args.tier as 'STARTER' | 'PROFESSIONAL' | 'SCHOOL',
            isFoundingMember: user.isFoundingMember,
            successUrl: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${frontendUrl}/subscription/settings`,
          });

          return {
            success: false,
            message: 'Checkout required',
            checkoutUrl: session.url,
          };
        }
      } catch (error) {
        console.error('Error upgrading subscription:', error);
        throw new GraphQLError(
          error instanceof Error ? error.message : 'Failed to upgrade subscription'
        );
      }
    },
  },
};
