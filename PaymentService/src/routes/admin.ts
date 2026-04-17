// src/routes/admin.ts
import { Router, Response } from "express";
import { requireAuth, requireAdmin, AuthenticatedRequest } from "../middleware/auth.js";
import { StripePaymentService } from "../services/stripe.js";
import { BackendService } from "../services/backend.js";
import { SubscriptionRecord, Invoice, PaymentEvent } from "../models/index.js";
import type { SubscriptionTier, SubscriptionStatus } from "../models/index.js";

export const adminRouter: ReturnType<typeof Router> = Router();

// All admin routes require authentication and admin role
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

/**
 * Get subscription for a specific user
 */
adminRouter.get("/subscriptions/:userId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const subscriptionRecord = await SubscriptionRecord.findOne({ userId });

    if (!subscriptionRecord) {
      return res.json({
        subscription: null,
        message: "No subscription found for this user",
      });
    }

    // Get fresh Stripe data
    let stripeSubscription = null;
    let paymentMethods: any[] = [];

    if (subscriptionRecord.stripeSubscriptionId) {
      stripeSubscription = await StripePaymentService.getSubscription(
        subscriptionRecord.stripeSubscriptionId
      );
    }

    if (subscriptionRecord.stripeCustomerId) {
      paymentMethods = await StripePaymentService.getPaymentMethods(
        subscriptionRecord.stripeCustomerId
      );
    }

    res.json({
      subscription: {
        ...subscriptionRecord.toObject(),
        stripeData: stripeSubscription
          ? {
              status: stripeSubscription.status,
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
              currentPeriodEnd: (stripeSubscription as any).current_period_end
                ? new Date((stripeSubscription as any).current_period_end * 1000)
                : null,
            }
          : null,
        paymentMethods: paymentMethods.map((pm) => ({
          id: pm.id,
          brand: pm.card?.brand,
          last4: pm.card?.last4,
          expiryMonth: pm.card?.exp_month,
          expiryYear: pm.card?.exp_year,
        })),
      },
    });
  } catch (error) {
    console.error("[Admin] Get subscription error:", error);
    res.status(500).json({
      error: "Failed to get subscription",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * List all subscriptions with filters
 */
adminRouter.get("/subscriptions", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      status,
      tier,
      search,
      limit = "50",
      offset = "0",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter: any = {};

    if (status) filter.status = status;
    if (tier) filter.tier = tier;
    if (search) {
      filter.userId = { $regex: search, $options: "i" };
    }

    const subscriptions = await SubscriptionRecord.find(filter)
      .sort({ [sortBy as string]: sortOrder === "asc" ? 1 : -1 })
      .skip(parseInt(offset as string))
      .limit(parseInt(limit as string))
      .lean();

    const total = await SubscriptionRecord.countDocuments(filter);

    res.json({
      subscriptions,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + subscriptions.length < total,
      },
    });
  } catch (error) {
    console.error("[Admin] List subscriptions error:", error);
    res.status(500).json({ error: "Failed to list subscriptions" });
  }
});

/**
 * Update user subscription (admin override)
 */
adminRouter.post(
  "/subscriptions/:userId/update",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { tier, status, isFoundingMember, extendTrialDays } = req.body as {
        tier?: SubscriptionTier;
        status?: SubscriptionStatus;
        isFoundingMember?: boolean;
        extendTrialDays?: number;
      };

      const subscriptionRecord = await SubscriptionRecord.findOne({ userId });

      if (!subscriptionRecord) {
        // Create new subscription record
        const newRecord = await SubscriptionRecord.create({
          userId,
          stripeCustomerId: "",
          tier: tier || "FREE",
          status: status || "ACTIVE",
          isFoundingMember: isFoundingMember || false,
          billingInterval: "monthly",
          amount: 0,
          currency: "usd",
        });

        // Update backend
        await BackendService.updateUserSubscription({
          userId,
          tier: tier || "FREE",
          status: status || "ACTIVE",
          isFoundingMember,
        });

        // Create audit log
        await BackendService.createAuditLog({
          adminUserId: req.userId!,
          action: "CREATE_SUBSCRIPTION",
          targetType: "subscription",
          targetId: userId,
          details: { tier, status, isFoundingMember },
        });

        return res.json({
          success: true,
          subscription: newRecord,
          message: "Subscription created",
        });
      }

      // Update existing record
      if (tier) subscriptionRecord.tier = tier;
      if (status) subscriptionRecord.status = status;
      if (isFoundingMember !== undefined) {
        subscriptionRecord.isFoundingMember = isFoundingMember;
      }

      // Handle trial extension
      if (extendTrialDays && subscriptionRecord.stripeSubscriptionId) {
        const newTrialEnd = new Date();
        newTrialEnd.setDate(newTrialEnd.getDate() + extendTrialDays);

        await StripePaymentService.extendTrial({
          subscriptionId: subscriptionRecord.stripeSubscriptionId,
          trialEndDate: newTrialEnd,
        });

        subscriptionRecord.trialEnd = newTrialEnd;
        subscriptionRecord.status = "TRIAL";
      }

      await subscriptionRecord.save();

      // Update backend
      await BackendService.updateUserSubscription({
        userId,
        tier: subscriptionRecord.tier,
        status: subscriptionRecord.status,
        isFoundingMember: subscriptionRecord.isFoundingMember,
        trialEnd: subscriptionRecord.trialEnd,
      });

      // Create audit log
      await BackendService.createAuditLog({
        adminUserId: req.userId!,
        action: "UPDATE_SUBSCRIPTION",
        targetType: "subscription",
        targetId: userId,
        details: { tier, status, isFoundingMember, extendTrialDays },
      });

      res.json({
        success: true,
        subscription: subscriptionRecord,
        message: "Subscription updated",
      });
    } catch (error) {
      console.error("[Admin] Update subscription error:", error);
      res.status(500).json({
        error: "Failed to update subscription",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Cancel user subscription (admin)
 */
adminRouter.post(
  "/subscriptions/:userId/cancel",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { immediately = false, reason } = req.body as {
        immediately?: boolean;
        reason?: string;
      };

      const subscriptionRecord = await SubscriptionRecord.findOne({ userId });

      if (!subscriptionRecord?.stripeSubscriptionId) {
        return res.status(400).json({ error: "No active subscription" });
      }

      if (immediately) {
        // Cancel immediately via Stripe API
        await StripePaymentService.cancelSubscription(subscriptionRecord.stripeSubscriptionId);
        subscriptionRecord.status = "CANCELED";
        subscriptionRecord.canceledAt = new Date();
      } else {
        // Cancel at period end
        await StripePaymentService.cancelSubscription(subscriptionRecord.stripeSubscriptionId);
        subscriptionRecord.cancelAtPeriodEnd = true;
      }

      await subscriptionRecord.save();

      // Update backend
      await BackendService.updateUserSubscription({
        userId,
        tier: immediately ? "FREE" : subscriptionRecord.tier,
        status: immediately ? "CANCELED" : subscriptionRecord.status,
        cancelAtPeriodEnd: !immediately,
      });

      // Create audit log
      await BackendService.createAuditLog({
        adminUserId: req.userId!,
        action: "CANCEL_SUBSCRIPTION",
        targetType: "subscription",
        targetId: userId,
        details: { immediately, reason },
      });

      res.json({
        success: true,
        message: immediately
          ? "Subscription cancelled immediately"
          : "Subscription will be cancelled at period end",
      });
    } catch (error) {
      console.error("[Admin] Cancel subscription error:", error);
      res.status(500).json({
        error: "Failed to cancel subscription",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Issue refund
 */
adminRouter.post("/refund", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, invoiceId, amount, reason } = req.body as {
      userId: string;
      invoiceId?: string;
      amount?: number;
      reason?: string;
    };

    // Find invoice if specified
    let refundTarget: { paymentIntentId?: string; chargeId?: string } = {};

    if (invoiceId) {
      const invoice = await Invoice.findOne({
        stripeInvoiceId: invoiceId,
        userId,
      });

      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Get charge from invoice
      // Note: In production, you'd get this from Stripe API
      refundTarget = { chargeId: invoiceId };
    }

    const refund = await StripePaymentService.issueRefund({
      ...refundTarget,
      amount: amount ? amount * 100 : undefined, // Convert to cents
      reason: reason as Stripe.RefundCreateParams.Reason,
    });

    // Create audit log
    await BackendService.createAuditLog({
      adminUserId: req.userId!,
      action: "ISSUE_REFUND",
      targetType: "refund",
      targetId: refund.id,
      details: { userId, invoiceId, amount, reason },
    });

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error("[Admin] Refund error:", error);
    res.status(500).json({
      error: "Failed to issue refund",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Apply credit to user account
 */
adminRouter.post("/credit", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, amount, description } = req.body as {
      userId: string;
      amount: number;
      description?: string;
    };

    const subscriptionRecord = await SubscriptionRecord.findOne({ userId });

    if (!subscriptionRecord?.stripeCustomerId) {
      return res.status(400).json({ error: "User has no billing account" });
    }

    const transaction = await StripePaymentService.applyCredit({
      customerId: subscriptionRecord.stripeCustomerId,
      amount: amount * 100, // Convert to cents
      description,
    });

    // Create audit log
    await BackendService.createAuditLog({
      adminUserId: req.userId!,
      action: "APPLY_CREDIT",
      targetType: "credit",
      targetId: transaction.id,
      details: { userId, amount, description },
    });

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount / 100,
      },
    });
  } catch (error) {
    console.error("[Admin] Apply credit error:", error);
    res.status(500).json({
      error: "Failed to apply credit",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get invoices for a user
 */
adminRouter.get("/invoices/:userId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = "20" } = req.query;

    const subscriptionRecord = await SubscriptionRecord.findOne({ userId });

    if (!subscriptionRecord?.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await StripePaymentService.getInvoices(
      subscriptionRecord.stripeCustomerId,
      parseInt(limit as string)
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
    console.error("[Admin] Get invoices error:", error);
    res.status(500).json({ error: "Failed to get invoices" });
  }
});

/**
 * Get payment events (webhook logs)
 */
adminRouter.get("/events", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      userId,
      eventType,
      status,
      limit = "50",
      offset = "0",
    } = req.query;

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;

    const events = await PaymentEvent.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset as string))
      .limit(parseInt(limit as string))
      .lean();

    const total = await PaymentEvent.countDocuments(filter);

    res.json({
      events,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + events.length < total,
      },
    });
  } catch (error) {
    console.error("[Admin] Get events error:", error);
    res.status(500).json({ error: "Failed to get events" });
  }
});

/**
 * Get subscription statistics
 */
adminRouter.get("/stats", async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      cancelledSubscriptions,
      pastDueSubscriptions,
      tierCounts,
      foundingMembers,
      recentEvents,
    ] = await Promise.all([
      SubscriptionRecord.countDocuments(),
      SubscriptionRecord.countDocuments({ status: "ACTIVE" }),
      SubscriptionRecord.countDocuments({ status: "TRIAL" }),
      SubscriptionRecord.countDocuments({ status: "CANCELED" }),
      SubscriptionRecord.countDocuments({ status: "PAST_DUE" }),
      SubscriptionRecord.aggregate([
        { $group: { _id: "$tier", count: { $sum: 1 } } },
      ]),
      SubscriptionRecord.countDocuments({ isFoundingMember: true }),
      PaymentEvent.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.json({
      stats: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        trial: trialSubscriptions,
        cancelled: cancelledSubscriptions,
        pastDue: pastDueSubscriptions,
        foundingMembers,
        tierBreakdown: Object.fromEntries(
          tierCounts.map((t) => [t._id, t.count])
        ),
        eventsLast24h: recentEvents,
      },
    });
  } catch (error) {
    console.error("[Admin] Get stats error:", error);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// Import Stripe type for refund params
import type Stripe from "stripe";
