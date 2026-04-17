// src/routes/payments.ts
import { Router, Response } from "express";
import { StripePaymentService, TIER_PRICING } from "../services/stripe.js";
import { requireServiceAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { SubscriptionRecord } from "../models/index.js";
import { env } from "../config.js";
import type { SubscriptionTier, BillingInterval } from "../models/index.js";

export const paymentRouter: ReturnType<typeof Router> = Router();
const isMockBilling = env.BILLING_MODE === "mock";

/**
 * Get available subscription plans
 */
paymentRouter.get("/plans", (_req, res) => {
  const plans = [
    {
      tier: "STARTER",
      name: "Starter",
      description: "Perfect for individual teachers just getting started",
      pricing: {
        monthly: TIER_PRICING.STARTER.monthly,
        yearly: TIER_PRICING.STARTER.yearly,
      },
      features: [
        "Up to 30 students",
        "1 classroom",
        "Basic job system",
        "Classroom store",
        "Transaction tracking",
        "Email support",
      ],
      limits: {
        maxClasses: 1,
        maxStudentsPerClass: 30,
        maxStoreItems: 20,
        maxJobs: 10,
        customCurrency: false,
        analytics: false,
        exportData: false,
        prioritySupport: false,
      },
    },
    {
      tier: "PROFESSIONAL",
      name: "Professional",
      description: "Best for teachers who want the full experience",
      pricing: {
        monthly: TIER_PRICING.PROFESSIONAL.monthly,
        yearly: TIER_PRICING.PROFESSIONAL.yearly,
      },
      features: [
        "Unlimited students",
        "Up to 5 classrooms",
        "Advanced job system",
        "Custom store items",
        "Analytics dashboard",
        "Fine management",
        "Priority support",
        "Custom currency names",
      ],
      limits: {
        maxClasses: 5,
        maxStudentsPerClass: -1, // Unlimited
        maxStoreItems: 100,
        maxJobs: 50,
        customCurrency: true,
        analytics: true,
        exportData: true,
        prioritySupport: false,
      },
      popular: true,
    },
    {
      tier: "SCHOOL",
      name: "School",
      description: "For schools and districts with multiple teachers",
      pricing: {
        monthly: 0, // Custom
        yearly: 0,
        custom: true,
      },
      features: [
        "Unlimited classrooms",
        "Unlimited students",
        "All Professional features",
        "Admin dashboard",
        "Bulk student management",
        "Training sessions",
        "Dedicated support",
        "Custom integrations",
      ],
      limits: {
        maxClasses: -1,
        maxStudentsPerClass: -1,
        maxStoreItems: -1,
        maxJobs: -1,
        customCurrency: true,
        analytics: true,
        exportData: true,
        prioritySupport: true,
      },
    },
  ];

  res.json({ plans });
});

/**
 * Create checkout session
 */
paymentRouter.post(
  "/checkout",
  requireServiceAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tier, interval = "monthly", isFoundingMember = false, email, successUrl, cancelUrl } = req.body as {
        tier: Exclude<SubscriptionTier, "FREE" | "TRIAL">;
        interval?: BillingInterval;
        isFoundingMember?: boolean;
        email?: string;
        successUrl?: string;
        cancelUrl?: string;
      };

      if (!tier || !["STARTER", "PROFESSIONAL", "SCHOOL"].includes(tier)) {
        return res.status(400).json({ error: "Invalid tier" });
      }

      if (!["monthly", "yearly"].includes(interval)) {
        return res.status(400).json({ error: "Invalid interval" });
      }

      if (isMockBilling) {
        const sessionId = `cs_mock_${req.userId}_${Date.now()}`;
        return res.json({
          sessionId,
          url: `${env.FRONTEND_URL}/subscription/success?session_id=${sessionId}&mock=true`,
        });
      }

      const session = await StripePaymentService.createCheckoutSession({
        userId: req.userId!,
        tier,
        interval,
        isFoundingMember,
        email,
        successUrl: successUrl || `${env.FRONTEND_URL}/settings/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: cancelUrl || `${env.FRONTEND_URL}/settings/subscription?canceled=true`,
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error("[Checkout] Error:", error);
      res.status(500).json({
        error: "Failed to create checkout session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Create billing portal session
 */
paymentRouter.post(
  "/portal",
  requireServiceAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (isMockBilling) {
        return res.json({
          url: `${env.FRONTEND_URL}/settings/subscription?portal=mock`,
        });
      }

      const { returnUrl } = req.body as { returnUrl?: string };

      // Get user's subscription record to find customer ID
      const subscriptionRecord = await SubscriptionRecord.findOne({
        userId: req.userId,
      });

      if (!subscriptionRecord?.stripeCustomerId) {
        return res.status(400).json({
          error: "No billing account found",
          message: "You don't have an active subscription",
        });
      }

      const session = await StripePaymentService.createPortalSession({
        customerId: subscriptionRecord.stripeCustomerId,
        returnUrl: returnUrl || `${env.FRONTEND_URL}/settings/subscription`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("[Portal] Error:", error);
      res.status(500).json({
        error: "Failed to create portal session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Get current subscription
 */
paymentRouter.get(
  "/subscription",
  requireServiceAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (isMockBilling) {
        return res.json({
          subscription: {
            id: `mock-sub-${req.userId}`,
            tier: "FREE",
            status: "ACTIVE",
            billingInterval: "monthly",
            currentPeriodStart: null,
            currentPeriodEnd: null,
            trialEnd: null,
            cancelAtPeriodEnd: false,
            isFoundingMember: false,
            amount: 0,
            currency: "usd",
            paymentMethod: null,
          },
          tier: "FREE",
          status: "ACTIVE",
        });
      }

      const subscriptionRecord = await SubscriptionRecord.findOne({
        userId: req.userId,
      });

      if (!subscriptionRecord) {
        return res.json({
          subscription: null,
          tier: "FREE",
          status: "ACTIVE",
        });
      }

      // Get fresh data from Stripe if we have a subscription
      let stripeSubscription = null;
      if (subscriptionRecord.stripeSubscriptionId) {
        stripeSubscription = await StripePaymentService.getSubscription(
          subscriptionRecord.stripeSubscriptionId
        );
      }

      res.json({
        subscription: {
          id: subscriptionRecord._id,
          tier: subscriptionRecord.tier,
          status: subscriptionRecord.status,
          billingInterval: subscriptionRecord.billingInterval,
          currentPeriodStart: subscriptionRecord.currentPeriodStart,
          currentPeriodEnd: subscriptionRecord.currentPeriodEnd,
          trialEnd: subscriptionRecord.trialEnd,
          cancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end || subscriptionRecord.cancelAtPeriodEnd,
          isFoundingMember: subscriptionRecord.isFoundingMember,
          amount: subscriptionRecord.amount,
          currency: subscriptionRecord.currency,
          paymentMethod: subscriptionRecord.paymentMethodLast4
            ? {
                brand: subscriptionRecord.paymentMethodBrand,
                last4: subscriptionRecord.paymentMethodLast4,
              }
            : null,
        },
        tier: subscriptionRecord.tier,
        status: subscriptionRecord.status,
      });
    } catch (error) {
      console.error("[Subscription] Error:", error);
      res.status(500).json({
        error: "Failed to get subscription",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Cancel subscription
 */
paymentRouter.post(
  "/cancel",
  requireServiceAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (isMockBilling) {
        return res.json({
          success: true,
          message: "Mock billing mode: cancellation simulated",
          cancelAtPeriodEnd: true,
          currentPeriodEnd: null,
        });
      }

      const subscriptionRecord = await SubscriptionRecord.findOne({
        userId: req.userId,
      });

      if (!subscriptionRecord?.stripeSubscriptionId) {
        return res.status(400).json({ error: "No active subscription" });
      }

      await StripePaymentService.cancelSubscription(
        subscriptionRecord.stripeSubscriptionId
      );

      subscriptionRecord.cancelAtPeriodEnd = true;
      await subscriptionRecord.save();

      res.json({
        success: true,
        message: "Subscription will be cancelled at the end of the billing period",
        cancelAtPeriodEnd: true,
        currentPeriodEnd: subscriptionRecord.currentPeriodEnd,
      });
    } catch (error) {
      console.error("[Cancel] Error:", error);
      res.status(500).json({
        error: "Failed to cancel subscription",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Reactivate subscription
 */
paymentRouter.post(
  "/reactivate",
  requireServiceAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (isMockBilling) {
        return res.json({
          success: true,
          message: "Mock billing mode: reactivation simulated",
          cancelAtPeriodEnd: false,
        });
      }

      const subscriptionRecord = await SubscriptionRecord.findOne({
        userId: req.userId,
      });

      if (!subscriptionRecord?.stripeSubscriptionId) {
        return res.status(400).json({ error: "No subscription to reactivate" });
      }

      await StripePaymentService.reactivateSubscription(
        subscriptionRecord.stripeSubscriptionId
      );

      subscriptionRecord.cancelAtPeriodEnd = false;
      await subscriptionRecord.save();

      res.json({
        success: true,
        message: "Subscription reactivated",
        cancelAtPeriodEnd: false,
      });
    } catch (error) {
      console.error("[Reactivate] Error:", error);
      res.status(500).json({
        error: "Failed to reactivate subscription",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Change subscription tier
 */
paymentRouter.post(
  "/change-tier",
  requireServiceAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tier, interval } = req.body as {
        tier: Exclude<SubscriptionTier, "FREE" | "TRIAL">;
        interval?: BillingInterval;
      };

      if (!tier || !["STARTER", "PROFESSIONAL", "SCHOOL"].includes(tier)) {
        return res.status(400).json({ error: "Invalid tier" });
      }

      if (isMockBilling) {
        return res.json({
          success: true,
          message: `Mock billing mode: tier changed to ${tier}`,
          tier,
        });
      }

      const subscriptionRecord = await SubscriptionRecord.findOne({
        userId: req.userId,
      });

      if (!subscriptionRecord?.stripeSubscriptionId) {
        // No active subscription - create checkout session instead
        const session = await StripePaymentService.createCheckoutSession({
          userId: req.userId!,
          tier,
          interval: interval || "monthly",
          successUrl: `${env.FRONTEND_URL}/settings/subscription?success=true`,
          cancelUrl: `${env.FRONTEND_URL}/settings/subscription?canceled=true`,
        });

        return res.json({
          requiresCheckout: true,
          sessionId: session.id,
          url: session.url,
        });
      }

      // Update existing subscription
      await StripePaymentService.updateSubscriptionTier({
        subscriptionId: subscriptionRecord.stripeSubscriptionId,
        newTier: tier,
        interval: interval || subscriptionRecord.billingInterval,
      });

      subscriptionRecord.tier = tier;
      if (interval) {
        subscriptionRecord.billingInterval = interval;
      }
      await subscriptionRecord.save();

      res.json({
        success: true,
        message: `Subscription updated to ${tier}`,
        tier,
      });
    } catch (error) {
      console.error("[ChangeTier] Error:", error);
      res.status(500).json({
        error: "Failed to change subscription tier",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Get invoices
 */
paymentRouter.get(
  "/invoices",
  requireServiceAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (isMockBilling) {
        return res.json({ invoices: [] });
      }

      const subscriptionRecord = await SubscriptionRecord.findOne({
        userId: req.userId,
      });

      if (!subscriptionRecord?.stripeCustomerId) {
        return res.json({ invoices: [] });
      }

      const invoices = await StripePaymentService.getInvoices(
        subscriptionRecord.stripeCustomerId
      );

      res.json({
        invoices: invoices.map((inv) => ({
          id: inv.id,
          number: inv.number,
          status: inv.status,
          amount: (inv.amount_paid || 0) / 100,
          currency: inv.currency,
          date: inv.created ? new Date(inv.created * 1000) : null,
          pdfUrl: inv.invoice_pdf,
          hostedUrl: inv.hosted_invoice_url,
        })),
      });
    } catch (error) {
      console.error("[Invoices] Error:", error);
      res.status(500).json({
        error: "Failed to get invoices",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Get payment methods
 */
paymentRouter.get(
  "/payment-methods",
  requireServiceAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (isMockBilling) {
        return res.json({ paymentMethods: [] });
      }

      const subscriptionRecord = await SubscriptionRecord.findOne({
        userId: req.userId,
      });

      if (!subscriptionRecord?.stripeCustomerId) {
        return res.json({ paymentMethods: [] });
      }

      const paymentMethods = await StripePaymentService.getPaymentMethods(
        subscriptionRecord.stripeCustomerId
      );

      res.json({
        paymentMethods: paymentMethods.map((pm) => ({
          id: pm.id,
          brand: pm.card?.brand,
          last4: pm.card?.last4,
          expiryMonth: pm.card?.exp_month,
          expiryYear: pm.card?.exp_year,
          isDefault: pm.id === subscriptionRecord.paymentMethodId,
        })),
      });
    } catch (error) {
      console.error("[PaymentMethods] Error:", error);
      res.status(500).json({
        error: "Failed to get payment methods",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Get upcoming invoice
 */
paymentRouter.get(
  "/upcoming-invoice",
  requireServiceAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (isMockBilling) {
        return res.json({ upcomingInvoice: null });
      }

      const subscriptionRecord = await SubscriptionRecord.findOne({
        userId: req.userId,
      });

      if (!subscriptionRecord?.stripeCustomerId) {
        return res.json({ upcomingInvoice: null });
      }

      const invoice = await StripePaymentService.getUpcomingInvoice(
        subscriptionRecord.stripeCustomerId,
        subscriptionRecord.stripeSubscriptionId
      );

      if (!invoice) {
        return res.json({ upcomingInvoice: null });
      }

      res.json({
        upcomingInvoice: {
          amount: (invoice.amount_due || 0) / 100,
          currency: invoice.currency,
          periodStart: invoice.period_start
            ? new Date(invoice.period_start * 1000)
            : null,
          periodEnd: invoice.period_end
            ? new Date(invoice.period_end * 1000)
            : null,
        },
      });
    } catch (error) {
      console.error("[UpcomingInvoice] Error:", error);
      res.status(500).json({
        error: "Failed to get upcoming invoice",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
