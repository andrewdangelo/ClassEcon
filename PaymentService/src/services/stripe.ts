// src/services/stripe.ts
import Stripe from "stripe";
import { env } from "../config.js";
import type { SubscriptionTier, BillingInterval } from "../models/index.js";

// Initialize Stripe
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover" as Stripe.LatestApiVersion,
  typescript: true,
});

// Price mapping for subscription tiers
export const TIER_PRICES: Record<
  Exclude<SubscriptionTier, "FREE" | "TRIAL">,
  { monthly: string; yearly: string }
> = {
  STARTER: {
    monthly: env.STRIPE_PRICE_STARTER_MONTHLY,
    yearly: env.STRIPE_PRICE_STARTER_YEARLY,
  },
  PROFESSIONAL: {
    monthly: env.STRIPE_PRICE_PROFESSIONAL_MONTHLY,
    yearly: env.STRIPE_PRICE_PROFESSIONAL_YEARLY,
  },
  SCHOOL: {
    monthly: env.STRIPE_PRICE_SCHOOL_MONTHLY,
    yearly: env.STRIPE_PRICE_SCHOOL_YEARLY,
  },
};

// Tier pricing (for display)
export const TIER_PRICING = {
  STARTER: { monthly: 9, yearly: 90 },
  PROFESSIONAL: { monthly: 19, yearly: 190 },
  SCHOOL: { monthly: 0, yearly: 0 }, // Custom pricing
} as const;

export class StripePaymentService {
  /**
   * Create or get Stripe customer
   */
  static async getOrCreateCustomer(params: {
    userId: string;
    email?: string;
    name?: string;
  }): Promise<Stripe.Customer> {
    const { userId, email, name } = params;

    // Search for existing customer by metadata
    const existingCustomers = await stripe.customers.list({
      limit: 1,
      email: email || undefined,
    });

    // Check if any has our userId
    const existingCustomer = existingCustomers.data.find(
      (c) => c.metadata?.userId === userId
    );

    if (existingCustomer) {
      return existingCustomer;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
        source: "classecon",
      },
    });

    console.log(`[Stripe] Created customer ${customer.id} for user ${userId}`);
    return customer;
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(params: {
    userId: string;
    email?: string;
    name?: string;
    tier: Exclude<SubscriptionTier, "FREE" | "TRIAL">;
    interval: BillingInterval;
    isFoundingMember?: boolean;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    const { userId, email, name, tier, interval, isFoundingMember, successUrl, cancelUrl } =
      params;

    // Get or create customer
    const customer = await this.getOrCreateCustomer({ userId, email, name });

    // Get price ID
    const priceId = TIER_PRICES[tier]?.[interval];
    if (!priceId) {
      throw new Error(`No price configured for ${tier} ${interval}`);
    }

    // Build session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        userId,
        tier,
        interval,
        isFoundingMember: isFoundingMember ? "true" : "false",
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
          interval,
          isFoundingMember: isFoundingMember ? "true" : "false",
        },
      },
    };

    // Apply founding member discount for Professional tier
    if (isFoundingMember && tier === "PROFESSIONAL") {
      sessionParams.discounts = [{ coupon: env.STRIPE_COUPON_FOUNDING }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(
      `[Stripe] Created checkout session ${session.id} for user ${userId} - ${tier} ${interval}`
    );
    return session;
  }

  /**
   * Create a billing portal session
   */
  static async createPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> {
    const { customerId, returnUrl } = params;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  }

  /**
   * Get subscription details
   */
  static async getSubscription(
    subscriptionId: string
  ): Promise<Stripe.Subscription | null> {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error(`[Stripe] Error retrieving subscription ${subscriptionId}:`, error);
      return null;
    }
  }

  /**
   * Cancel subscription at period end
   */
  static async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log(`[Stripe] Scheduled cancellation for subscription ${subscriptionId}`);
    return subscription;
  }

  /**
   * Reactivate a cancelled subscription
   */
  static async reactivateSubscription(
    subscriptionId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    console.log(`[Stripe] Reactivated subscription ${subscriptionId}`);
    return subscription;
  }

  /**
   * Update subscription to different tier
   */
  static async updateSubscriptionTier(params: {
    subscriptionId: string;
    newTier: Exclude<SubscriptionTier, "FREE" | "TRIAL">;
    interval: BillingInterval;
  }): Promise<Stripe.Subscription> {
    const { subscriptionId, newTier, interval } = params;

    const priceId = TIER_PRICES[newTier]?.[interval];
    if (!priceId) {
      throw new Error(`No price configured for ${newTier} ${interval}`);
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: "create_prorations",
      metadata: {
        ...subscription.metadata,
        tier: newTier,
        interval,
      },
    });

    console.log(`[Stripe] Updated subscription ${subscriptionId} to ${newTier}`);
    return updated;
  }

  /**
   * Get customer's payment methods
   */
  static async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return paymentMethods.data;
  }

  /**
   * Get upcoming invoice preview
   */
  static async getUpcomingInvoice(
    customerId: string,
    subscriptionId?: string
  ): Promise<Stripe.Invoice | null> {
    try {
      const params: Stripe.InvoiceCreatePreviewParams = { customer: customerId };
      if (subscriptionId) {
        params.subscription = subscriptionId;
      }
      return await stripe.invoices.createPreview(params);
    } catch (error) {
      console.error(`[Stripe] Error creating invoice preview:`, error);
      return null;
    }
  }

  /**
   * Get invoice history
   */
  static async getInvoices(
    customerId: string,
    limit = 10
  ): Promise<Stripe.Invoice[]> {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data;
  }

  /**
   * Issue refund
   */
  static async issueRefund(params: {
    paymentIntentId?: string;
    chargeId?: string;
    amount?: number;
    reason?: Stripe.RefundCreateParams.Reason;
  }): Promise<Stripe.Refund> {
    const refund = await stripe.refunds.create({
      payment_intent: params.paymentIntentId,
      charge: params.chargeId,
      amount: params.amount,
      reason: params.reason,
    });

    console.log(`[Stripe] Issued refund ${refund.id}`);
    return refund;
  }

  /**
   * Extend trial period
   */
  static async extendTrial(params: {
    subscriptionId: string;
    trialEndDate: Date;
  }): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.update(params.subscriptionId, {
      trial_end: Math.floor(params.trialEndDate.getTime() / 1000),
    });

    console.log(`[Stripe] Extended trial for subscription ${params.subscriptionId}`);
    return subscription;
  }

  /**
   * Apply credit/coupon to customer
   */
  static async applyCredit(params: {
    customerId: string;
    amount: number;
    description?: string;
  }): Promise<Stripe.CustomerBalanceTransaction> {
    const transaction = await stripe.customers.createBalanceTransaction(
      params.customerId,
      {
        amount: -params.amount, // Negative = credit
        currency: "usd",
        description: params.description || "Credit applied",
      }
    );

    console.log(`[Stripe] Applied ${params.amount} credit to customer ${params.customerId}`);
    return transaction;
  }

  /**
   * Construct webhook event
   */
  static constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  }
}
