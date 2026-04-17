/**
 * Stripe Service - DEPRECATED
 * 
 * @deprecated This service is deprecated. Use PaymentService microservice instead.
 * The Backend now proxies payment requests to the PaymentService which handles
 * all Stripe integration. See src/services/payment-service.ts
 * 
 * This file is kept for reference and backward compatibility during migration.
 * 
 * Test Cards (for PaymentService):
 * - Success: 4242 4242 4242 4242
 * - Declined: 4000 0000 0000 0002
 * - 3D Secure: 4000 0025 0000 3155
 */

import Stripe from 'stripe';
import { User } from '../models/User';
import { Types } from 'mongoose';

// Initialize Stripe - will be null if no key provided (expected in new architecture)
const stripeKey = process.env.STRIPE_SECRET_KEY;
let _stripeInstance: Stripe | null = null;

// Lazy initialization to avoid crash at import time
const getStripe = (): Stripe => {
  if (!_stripeInstance) {
    if (!stripeKey) {
      throw new Error(
        'DEPRECATED: StripeService is deprecated. Use PaymentService microservice instead. ' +
        'Set PAYMENT_SERVICE_URL in .env and use PaymentServiceClient.'
      );
    }
    _stripeInstance = new Stripe(stripeKey, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    });
  }
  return _stripeInstance;
};

// Alias for backward compatibility
const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get subscriptions() { return getStripe().subscriptions; },
  get paymentMethods() { return getStripe().paymentMethods; },
  get invoices() { return getStripe().invoices; },
  get webhooks() { return getStripe().webhooks; },
};

// Subscription tier to Stripe price mapping
const TIER_PRICE_MAP = {
  FREE: null, // No payment needed
  TRIAL: null, // No payment needed
  STARTER: process.env.STRIPE_PRICE_STARTER || 'price_starter_test',
  PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_pro_test',
  SCHOOL: process.env.STRIPE_PRICE_SCHOOL || 'price_school_test',
} as const;

// Founding member discount (50% off Professional)
const FOUNDING_MEMBER_COUPON = process.env.STRIPE_COUPON_FOUNDING || 'FOUNDING50';

export class StripeService {
  /**
   * Create or retrieve Stripe customer for user
   * @deprecated Use PaymentService instead
   */
  static async getOrCreateCustomer(userId: string | Types.ObjectId): Promise<string> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Return existing customer ID if available
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
        role: user.role,
      },
    });

    // Save customer ID to user
    user.stripeCustomerId = customer.id;
    await user.save();

    console.log(`Created Stripe customer ${customer.id} for user ${userId}`);
    return customer.id;
  }

  /**
   * Create checkout session for subscription
   */
  static async createCheckoutSession(params: {
    userId: string | Types.ObjectId;
    tier: keyof typeof TIER_PRICE_MAP;
    isFoundingMember?: boolean;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    const { userId, tier, isFoundingMember, successUrl, cancelUrl } = params;

    // Validate tier requires payment
    if (tier === 'FREE' || tier === 'TRIAL') {
      throw new Error(`${tier} tier does not require payment`);
    }

    const priceId = TIER_PRICE_MAP[tier];
    if (!priceId) {
      throw new Error(`No price configured for ${tier} tier`);
    }

    const customerId = await this.getOrCreateCustomer(userId);
    const user = await User.findById(userId);

    // Build checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
        tier,
        isFoundingMember: isFoundingMember ? 'true' : 'false',
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          tier,
          isFoundingMember: isFoundingMember ? 'true' : 'false',
        },
      },
    };

    // Apply founding member discount
    if (isFoundingMember && tier === 'PROFESSIONAL') {
      sessionParams.discounts = [
        {
          coupon: FOUNDING_MEMBER_COUPON,
        },
      ];
    }

    // Allow promotion codes
    sessionParams.allow_promotion_codes = true;

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`Created checkout session ${session.id} for user ${userId} - ${tier} tier`);
    return session;
  }

  /**
   * Create billing portal session for subscription management
   */
  static async createPortalSession(
    userId: string | Types.ObjectId,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    const customerId = await this.getOrCreateCustomer(userId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log(`Created portal session for user ${userId}`);
    return session;
  }

  /**
   * Cancel subscription at period end
   */
  static async cancelSubscription(userId: string | Types.ObjectId): Promise<Stripe.Subscription> {
    const user = await User.findById(userId);
    if (!user?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    console.log(`Scheduled cancellation for subscription ${subscription.id}`);
    return subscription;
  }

  /**
   * Reactivate a subscription scheduled for cancellation
   */
  static async reactivateSubscription(userId: string | Types.ObjectId): Promise<Stripe.Subscription> {
    const user = await User.findById(userId);
    if (!user?.stripeSubscriptionId) {
      throw new Error('No subscription found');
    }

    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    console.log(`Reactivated subscription ${subscription.id}`);
    return subscription;
  }

  /**
   * Update subscription tier
   */
  static async updateSubscriptionTier(
    userId: string | Types.ObjectId,
    newTier: keyof typeof TIER_PRICE_MAP
  ): Promise<Stripe.Subscription> {
    const user = await User.findById(userId);
    if (!user?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    const newPriceId = TIER_PRICE_MAP[newTier];
    if (!newPriceId) {
      throw new Error(`No price configured for ${newTier} tier`);
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    
    // Update subscription with new price
    const updated = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations', // Prorate the change
    });

    console.log(`Updated subscription ${subscription.id} to ${newTier} tier`);
    return updated;
  }

  /**
   * Get subscription details
   */
  static async getSubscription(userId: string | Types.ObjectId): Promise<Stripe.Subscription | null> {
    const user = await User.findById(userId);
    if (!user?.stripeSubscriptionId) {
      return null;
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return null;
    }
  }

  /**
   * Get customer's payment methods
   */
  static async getPaymentMethods(userId: string | Types.ObjectId): Promise<Stripe.PaymentMethod[]> {
    const customerId = await this.getOrCreateCustomer(userId);

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  }

  /**
   * Get upcoming invoice preview
   */
  static async getUpcomingInvoice(userId: string | Types.ObjectId): Promise<Stripe.Invoice | null> {
    const user = await User.findById(userId);
    if (!user?.stripeSubscriptionId) {
      return null;
    }

    try {
      const invoice = await stripe.invoices.createPreview({
        subscription: user.stripeSubscriptionId,
      });
      return invoice;
    } catch (error) {
      console.error('Error retrieving upcoming invoice:', error);
      return null;
    }
  }

  /**
   * Get invoice history for a user
   */
  static async getInvoices(
    userId: string | Types.ObjectId,
    limit: number = 12
  ): Promise<Stripe.Invoice[]> {
    const user = await User.findById(userId);
    if (!user?.stripeCustomerId) {
      return [];
    }

    try {
      const invoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: limit,
      });
      return invoices.data;
    } catch (error) {
      console.error('Error retrieving invoices:', error);
      return [];
    }
  }

  /**
   * Handle successful payment (webhook handler)
   */
  static async handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier as keyof typeof TIER_PRICE_MAP;
    const isFoundingMember = session.metadata?.isFoundingMember === 'true';

    if (!userId || !tier) {
      throw new Error('Missing metadata in checkout session');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user subscription
    user.subscriptionTier = tier;
    user.subscriptionStatus = 'ACTIVE';
    user.isFoundingMember = isFoundingMember;
    user.stripeCustomerId = session.customer as string;
    user.stripeSubscriptionId = session.subscription as string;

    // Set expiration based on billing cycle (default 1 month)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    user.subscriptionExpiresAt = expiresAt;

    await user.save();

    console.log(`Updated user ${userId} subscription to ${tier} tier`);
  }

  /**
   * Handle subscription updated (webhook handler)
   */
  static async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

    // Update subscription status
    const status = subscription.status;
    if (status === 'active') {
      user.subscriptionStatus = 'ACTIVE';
    } else if (status === 'canceled' || status === 'unpaid') {
      user.subscriptionStatus = 'CANCELED';
    } else if (status === 'past_due') {
      user.subscriptionStatus = 'PAST_DUE';
    } else if (status === 'trialing') {
      user.subscriptionStatus = 'TRIAL';
    }

    // Update expiration date
    const periodEnd = (subscription as any).current_period_end;
    if (periodEnd) {
      user.subscriptionExpiresAt = new Date(periodEnd * 1000);
    }

    // Check if scheduled for cancellation
    if (subscription.cancel_at_period_end) {
      user.subscriptionStatus = 'ACTIVE'; // Still active until period end
    }

    await user.save();
    console.log(`Updated subscription for user ${userId}: ${status}`);
  }

  /**
   * Handle subscription deleted (webhook handler)
   */
  static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

    // Downgrade to FREE tier
    user.subscriptionTier = 'FREE';
    user.subscriptionStatus = 'CANCELED';
    user.stripeSubscriptionId = null;
    user.subscriptionExpiresAt = null;

    await user.save();
    console.log(`Subscription cancelled for user ${userId}, downgraded to FREE`);
  }

  /**
   * Construct webhook event from request
   */
  static constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

export { stripe };
