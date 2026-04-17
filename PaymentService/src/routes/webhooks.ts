// src/routes/webhooks.ts
import { Router, Request, Response, raw } from "express";
import Stripe from "stripe";
import { StripePaymentService } from "../services/stripe.js";
import { BackendService } from "../services/backend.js";
import { PaymentEvent, SubscriptionRecord, Invoice } from "../models/index.js";
import type { SubscriptionTier, SubscriptionStatus } from "../models/index.js";

export const webhookRouter: ReturnType<typeof Router> = Router();

/**
 * Map Stripe subscription status to our status
 */
function mapSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIAL";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
      return "CANCELED";
    case "incomplete":
    case "incomplete_expired":
      return "EXPIRED";
    default:
      return "ACTIVE";
  }
}

/**
 * Get tier from subscription metadata or price
 */
function getTierFromMetadata(metadata?: Stripe.Metadata): SubscriptionTier {
  if (metadata?.tier) {
    return metadata.tier as SubscriptionTier;
  }
  return "PROFESSIONAL"; // Default
}

/**
 * Stripe webhook endpoint
 * Uses raw body parser for signature verification
 */
webhookRouter.post(
  "/stripe",
  raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      console.error("[Webhook] Missing stripe-signature header");
      return res.status(400).send("Missing signature");
    }

    let event: Stripe.Event;

    try {
      event = StripePaymentService.constructWebhookEvent(req.body, signature);
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      return res
        .status(400)
        .send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    // Check for duplicate events
    const existingEvent = await PaymentEvent.findOne({
      stripeEventId: event.id,
    });

    if (existingEvent) {
      console.log(`[Webhook] Duplicate event ${event.id}, skipping`);
      return res.json({ received: true, duplicate: true });
    }

    // Create event record
    const paymentEvent = await PaymentEvent.create({
      stripeEventId: event.id,
      eventType: event.type,
      status: "pending",
      metadata: event.data.object,
    });

    console.log(`[Webhook] Received: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case "customer.subscription.created":
          await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case "invoice.payment_succeeded":
          await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case "invoice.payment_failed":
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case "customer.subscription.trial_will_end":
          await handleTrialWillEnd(event.data.object as Stripe.Subscription);
          break;

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      // Mark event as processed
      paymentEvent.status = "processed";
      paymentEvent.processedAt = new Date();
      await paymentEvent.save();

      res.json({ received: true });
    } catch (error) {
      console.error(`[Webhook] Error processing ${event.type}:`, error);

      paymentEvent.status = "failed";
      paymentEvent.error = error instanceof Error ? error.message : "Unknown error";
      await paymentEvent.save();

      res.status(500).json({
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Handle checkout.session.completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const tier = getTierFromMetadata(session.metadata ?? undefined);
  const isFoundingMember = session.metadata?.isFoundingMember === "true";
  const interval = (session.metadata?.interval as "monthly" | "yearly") || "monthly";

  if (!userId) {
    console.error("[Webhook] No userId in checkout session metadata");
    return;
  }

  console.log(
    `[Webhook] Checkout completed for user ${userId} - ${tier} (${isFoundingMember ? "Founding Member" : "Regular"})`
  );

  // Create or update subscription record
  await SubscriptionRecord.findOneAndUpdate(
    { userId },
    {
      userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      tier,
      status: "ACTIVE",
      billingInterval: interval,
      isFoundingMember,
      cancelAtPeriodEnd: false,
    },
    { upsert: true, new: true }
  );

  // Notify backend
  await BackendService.updateUserSubscription({
    userId,
    tier,
    status: "ACTIVE",
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: session.subscription as string,
    isFoundingMember,
  });

  // Send welcome notification
  await BackendService.sendNotification({
    userId,
    type: "SUBSCRIPTION_ACTIVATED",
    title: "Welcome to ClassEcon Pro!",
    message: `Your ${tier} subscription is now active. Enjoy all the premium features!`,
    metadata: { tier, isFoundingMember },
  });
}

/**
 * Handle customer.subscription.created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;
  const tier = getTierFromMetadata(subscription.metadata);

  if (!userId) {
    console.error("[Webhook] No userId in subscription metadata");
    return;
  }

  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
  const currentPeriodStart = new Date((subscription as any).current_period_start * 1000);

  await SubscriptionRecord.findOneAndUpdate(
    { userId },
    {
      userId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      tier,
      status: mapSubscriptionStatus(subscription.status),
      currentPeriodStart,
      currentPeriodEnd,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    { upsert: true, new: true }
  );

  console.log(`[Webhook] Subscription created for user ${userId}: ${subscription.id}`);
}

/**
 * Handle customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("[Webhook] No userId in subscription metadata");
    return;
  }

  const tier = getTierFromMetadata(subscription.metadata);
  const status = mapSubscriptionStatus(subscription.status);
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
  const currentPeriodStart = new Date((subscription as any).current_period_start * 1000);

  // Update local record
  await SubscriptionRecord.findOneAndUpdate(
    { userId },
    {
      tier,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
    },
    { new: true }
  );

  // Notify backend
  await BackendService.updateUserSubscription({
    userId,
    tier,
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  console.log(`[Webhook] Subscription updated for user ${userId}: ${status}`);
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("[Webhook] No userId in subscription metadata");
    return;
  }

  // Update local record
  await SubscriptionRecord.findOneAndUpdate(
    { userId },
    {
      tier: "FREE",
      status: "CANCELED",
      cancelAtPeriodEnd: false,
      canceledAt: new Date(),
    },
    { new: true }
  );

  // Notify backend to downgrade user
  await BackendService.updateUserSubscription({
    userId,
    tier: "FREE",
    status: "CANCELED",
  });

  // Send notification
  await BackendService.sendNotification({
    userId,
    type: "SUBSCRIPTION_CANCELLED",
    title: "Subscription Ended",
    message:
      "Your ClassEcon subscription has ended. You can continue using free features or resubscribe anytime.",
  });

  console.log(`[Webhook] Subscription deleted for user ${userId}`);
}

/**
 * Handle invoice.payment_succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  // Get subscription details from parent (new Stripe API structure)
  const subscriptionDetails = invoice.parent?.subscription_details;
  const subscriptionId = subscriptionDetails?.subscription as string | undefined;
  
  let userId: string | undefined;
  
  // Try to get userId from parent subscription metadata
  if (subscriptionDetails?.metadata?.userId) {
    userId = subscriptionDetails.metadata.userId;
  }
  
  // Fallback: try to get userId from the subscription record
  if (!userId && subscriptionId) {
    const subscriptionRecord = await SubscriptionRecord.findOne({ stripeSubscriptionId: subscriptionId });
    userId = subscriptionRecord?.userId;
  }
  
  // Fallback to invoice lines metadata
  if (!userId && invoice.lines?.data?.[0]?.metadata?.userId) {
    userId = invoice.lines.data[0].metadata.userId;
  }

  // Store invoice record
  await Invoice.findOneAndUpdate(
    { stripeInvoiceId: invoice.id },
    {
      stripeInvoiceId: invoice.id,
      userId: userId || "unknown",
      stripeCustomerId: invoice.customer as string,
      stripeSubscriptionId: subscriptionId || undefined,
      number: invoice.number,
      status: "paid",
      amount: invoice.amount_paid || 0,
      amountPaid: invoice.amount_paid || 0,
      amountDue: 0,
      currency: invoice.currency,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : new Date(),
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : new Date(),
      paidAt: new Date(),
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
    },
    { upsert: true, new: true }
  );

  console.log(`[Webhook] Invoice payment succeeded: ${invoice.id}`);
}

/**
 * Handle invoice.payment_failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // Get subscription details from parent (new Stripe API structure)
  const subscriptionDetails = invoice.parent?.subscription_details;
  const subscriptionId = subscriptionDetails?.subscription as string | undefined;
  
  let userId: string | undefined;
  
  // Try to get userId from parent subscription metadata
  if (subscriptionDetails?.metadata?.userId) {
    userId = subscriptionDetails.metadata.userId;
  }
  
  // Fallback: try to get userId from the subscription record
  if (!userId && subscriptionId) {
    const subscriptionRecord = await SubscriptionRecord.findOne({ stripeSubscriptionId: subscriptionId });
    userId = subscriptionRecord?.userId;
  }

  if (userId) {
    // Update subscription status
    await SubscriptionRecord.findOneAndUpdate(
      { userId },
      { status: "PAST_DUE" },
      { new: true }
    );

    // Notify backend
    await BackendService.updateUserSubscription({
      userId,
      tier: "PROFESSIONAL", // Keep tier but mark as past due
      status: "PAST_DUE",
    });

    // Send notification
    await BackendService.sendNotification({
      userId,
      type: "PAYMENT_FAILED",
      title: "Payment Failed",
      message:
        "We couldn't process your subscription payment. Please update your payment method to continue using premium features.",
    });
  }

  console.log(`[Webhook] Invoice payment failed: ${invoice.id}`);
}

/**
 * Handle customer.subscription.trial_will_end
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    return;
  }

  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : new Date();

  // Send notification
  await BackendService.sendNotification({
    userId,
    type: "TRIAL_ENDING",
    title: "Trial Ending Soon",
    message: `Your free trial ends on ${trialEnd.toLocaleDateString()}. Add a payment method to continue using premium features.`,
    metadata: { trialEnd },
  });

  console.log(`[Webhook] Trial will end for user ${userId}`);
}
